/** One shared, persistent ledger across deployments. Never initialize on request. */
export const REALTIME_BUDGET_KEY = 'kiwi:realtime:spend:v1';

// A single atomic write commits both the irreversible debit and rolling windows.
// Redis TIME avoids instance clock skew. No TTL, refunds, browser identity or IP.
export const RESERVE_REALTIME = `
local raw = redis.call('GET', KEYS[1])
if not raw then return -2 end
if redis.call('TTL', KEYS[1]) ~= -1 then return -1 end
local ok, state = pcall(cjson.decode, raw)
if not ok or type(state) ~= 'table' or state.version ~= 1 then return -1 end
local function integer(n)
  return type(n) == 'number' and n >= 0 and n <= 10000 and n == math.floor(n)
end
if not integer(state.remaining) or type(state.starts) ~= 'table' then return -1 end
local now = tonumber(redis.call('TIME')[1])
local recent = {}
local minute = 0
local active = 0
local count = 0
local previous = 0
for k, started in pairs(state.starts) do
  if type(k) ~= 'number' or k < 1 or k ~= math.floor(k) then return -1 end
  count = count + 1
end
if count ~= #state.starts or count > 10000 then return -1 end
for _, started in ipairs(state.starts) do
  if type(started) ~= 'number' or started ~= math.floor(started) or started < previous or started > now then return -1 end
  previous = started
  if started > now - 86400 then table.insert(recent, started) end
  if started > now - 3900 then active = active + 1 end
  if started > now - 60 then minute = minute + 1 end
end
if state.remaining == 0 then return 0 end
if minute >= 10 or #recent >= tonumber(ARGV[1]) or active >= tonumber(ARGV[2]) then return 0 end
if ARGV[3] == 'inspect' then return 1 end
table.insert(recent, now)
state.remaining = state.remaining - 1
state.starts = recent
redis.call('SET', KEYS[1], cjson.encode(state))
return 1
`;

function limit(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!/^[1-9][0-9]*$/.test(value)) throw new Error('invalid_limit');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > 10000) throw new Error('invalid_limit');
  return parsed;
}

type Admission = 'allowed' | 'limited' | 'unavailable' | 'unprovisioned';

// Log only fixed reason codes and HTTP status; never credentials or Redis bodies.
const diagnostic = (reason: string, status?: number) =>
  console.error('kiwi_admission', { reason, ...(status === undefined ? {} : { status }) });

async function admission(redis: string, token: string, inspect = false): Promise<Admission> {
  try {
    const daily = limit(process.env.KIWI_REALTIME_DAILY_STARTS, 10);
    const concurrent = limit(process.env.KIWI_REALTIME_CONCURRENT_STARTS, 2);
    const started = Date.now();
    const response = await fetch(redis.replace(/\/$/, ''), {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', RESERVE_REALTIME, '1', REALTIME_BUDGET_KEY, String(daily), String(concurrent), ...(inspect ? ['inspect'] : [])]),
    });
    if (!response.ok) { diagnostic('redis_http', response.status); return 'unavailable'; }
    const data = await response.json();
    // Do not use a delayed reservation to open a call after its window elapsed.
    if (Date.now() - started >= 5000) { diagnostic('redis_timeout'); return 'unavailable'; }
    if (data?.error) { diagnostic('redis_command'); return 'unavailable'; }
    if (data?.result === 1) return 'allowed';
    if (data?.result === 0) return 'limited';
    if (data?.result === -2) return 'unprovisioned';
    diagnostic(data?.result === -1 ? 'invalid_ledger' : 'invalid_response');
    return 'unavailable';
  } catch { diagnostic('configuration_or_connection'); return 'unavailable'; }
}

/** A debit is never refunded, including ambiguous upstream/network failures. */
export const reserveRealtime = (redis: string, token: string) => admission(redis, token);

/** Same validation and limits, without a debit, timestamp update or paid call. */
export const inspectRealtime = (redis: string, token: string) => admission(redis, token, true);
