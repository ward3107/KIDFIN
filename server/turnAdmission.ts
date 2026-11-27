/** A separate, operator-funded allowance for Gemini turns. Never seed on request. */
export const TURN_BUDGET_KEY = 'kiwi:gemini:spend:v1';

// One Redis operation checks the rolling limits and permanently debits one turn.
// Redis TIME keeps all deployments on the same clock. No IP or transcript is stored.
export const RESERVE_TURN = `
local raw = redis.call('GET', KEYS[1])
if not raw then return -2 end
if redis.call('TTL', KEYS[1]) ~= -1 then return -1 end
local ok, state = pcall(cjson.decode, raw)
if not ok or type(state) ~= 'table' or state.version ~= 1 then return -1 end
local function integer(n)
  return type(n) == 'number' and n >= 0 and n <= 10000 and n == math.floor(n)
end
if not integer(state.remaining) or type(state.turns) ~= 'table' then return -1 end
local now = tonumber(redis.call('TIME')[1])
local recent = {}
local minute = 0
local count = 0
local previous = 0
for k, _ in pairs(state.turns) do
  if type(k) ~= 'number' or k < 1 or k ~= math.floor(k) then return -1 end
  count = count + 1
end
if count ~= #state.turns or count > 10000 then return -1 end
for _, started in ipairs(state.turns) do
  if type(started) ~= 'number' or started ~= math.floor(started) or started < previous or started > now then return -1 end
  previous = started
  if started > now - 86400 then table.insert(recent, started) end
  if started > now - 60 then minute = minute + 1 end
end
if state.remaining == 0 then return -3 end
if minute >= tonumber(ARGV[1]) or #recent >= tonumber(ARGV[2]) then return 0 end
if ARGV[3] == 'inspect' then return 1 end
table.insert(recent, now)
state.remaining = state.remaining - 1
state.turns = recent
redis.call('SET', KEYS[1], cjson.encode(state))
return 1
`;

type Admission = 'allowed' | 'limited' | 'exhausted' | 'unavailable' | 'unprovisioned';

function limit(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!/^[1-9][0-9]*$/.test(value)) throw new Error('invalid_limit');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > 10000) throw new Error('invalid_limit');
  return parsed;
}

async function admission(redis: string, token: string, inspect = false): Promise<Admission> {
  try {
    const minute = limit(process.env.KIWI_GEMINI_MINUTE_TURNS, 30);
    const daily = limit(process.env.KIWI_GEMINI_DAILY_TURNS, 100);
    const started = Date.now();
    const response = await fetch(redis.replace(/\/$/, ''), {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', RESERVE_TURN, '1', TURN_BUDGET_KEY, String(minute), String(daily), ...(inspect ? ['inspect'] : [])]),
    });
    if (!response.ok) return 'unavailable';
    const data = await response.json();
    if (Date.now() - started >= 5000 || data?.error) return 'unavailable';
    if (data?.result === 1) return 'allowed';
    if (data?.result === 0) return 'limited';
    if (data?.result === -3) return 'exhausted';
    if (data?.result === -2) return 'unprovisioned';
    return 'unavailable';
  } catch { return 'unavailable'; }
}

/** Failed or ambiguous provider calls still consume the reserved attempt. */
export const reserveTurn = (redis: string, token: string) => admission(redis, token);
export const inspectTurn = (redis: string, token: string) => admission(redis, token, true);
