import { describe, expect, it } from 'vitest';
import { parseReplyOptions } from '../services/live/replyOptions';
import { KiwiRealtime } from '../services/live/realtimeClient';

describe('illustrated voice choices', () => {
  it('keeps semantic pictures across spoken languages and rejects remote image input', () => {
    expect(parseReplyOptions([
      {label:' نحكي قصة قصيرة ', picture:'story'},
      {label:'חתול', picture:'https://untrusted.example/image.svg'},
      {label:'חתול', picture:'dog'}, null, {label:42},
    ])).toEqual([{label:'نحكي قصة قصيرة',picture:'story'},{label:'חתול',picture:'cat'}]);
  });
  it('understands older text-only options and bounds malformed model output', () => {
    expect(parseReplyOptions(['סיפור', 'נلعب لعبة', 'סיפור', '', false])).toEqual([
      {label:'סיפור',picture:'story'},{label:'נلعب لعبة',picture:'play'},
    ]);
    expect(parseReplyOptions(['alone'])).toEqual([]);
    expect(parseReplyOptions({options:[]})).toEqual([]);
    expect(parseReplyOptions(['a'.repeat(100),'b','c','d','e'])).toHaveLength(4);
    expect(parseReplyOptions(['a'.repeat(100),'b'])[0].label).toHaveLength(80);
  });
  it('delivers visual choices once and sends only the selected label as speech text', () => {
    let choices: unknown;
    const sent: unknown[] = [];
    const call = new KiwiRealtime({ phase:()=>{}, caption:()=>{}, options:value=>{choices=value;}, error:()=>{} });
    Object.assign(call, { channel:{readyState:'open', send:(s:string)=>sent.push(JSON.parse(s))} });
    const event = {type:'response.done',response:{output:[{type:'function_call',name:'show_reply_options',call_id:'choice-1',arguments:JSON.stringify({options:[{label:'A story',picture:'story'},{label:'Music',picture:'music'}]})}]}};
    call.receive(event);
    call.receive(event);
    expect(choices).toEqual([{label:'A story',picture:'story'},{label:'Music',picture:'music'}]);
    expect(sent).toHaveLength(1);
    expect(call.sendText('A story')).toBe(true);
    expect(JSON.stringify(sent)).toContain('A story');
    expect(JSON.stringify(sent)).not.toContain('picture');
  });
});
