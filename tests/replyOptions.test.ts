import { describe, expect, it, vi } from 'vitest';
import { parseReplyOptions, wereChoicesSpoken } from '../services/live/replyOptions';
import { KiwiRealtime } from '../services/live/realtimeClient';

describe('illustrated voice choices', () => {
  it('chooses pictures from visible words, ignoring a conflicting model picture', () => {
    expect(parseReplyOptions([
      {label:' نحكي قصة قصيرة ', picture:'story'},
      {label:'חתול', picture:'https://untrusted.example/image.svg'},
      {label:'חתול', picture:'dog'}, null, {label:42},
    ])).toEqual([{label:'نحكي قصة قصيرة',picture:'story'},{label:'חתול',picture:'cat'}]);
  });
  it.each([
    ['אדום', 'כחול', 'red', 'blue'],
    ['أحمر', 'أزرق', 'red', 'blue'],
    ['Red', 'Blue', 'red', 'blue'],
    ['красный', 'синий', 'red', 'blue'],
  ])('shows exact color swatches for %s and %s', (first, second, firstPicture, secondPicture) => {
    expect(parseReplyOptions([{label:first,picture:'art'},{label:second,picture:'food'}])).toEqual([
      {label:first,picture:firstPicture},{label:second,picture:secondPicture},
    ]);
  });
  it('uses a palette for mixed colors and a neutral icon for unknown concepts', () => {
    expect(parseReplyOptions([{label:'אדום או כחול',picture:'cat'},{label:'רוצה לנסות?',picture:'dog'}])).toEqual([
      {label:'אדום או כחול',picture:'art'},{label:'רוצה לנסות?',picture:'chat'},
    ]);
  });
  it('recognizes exact spoken labels as whole words', () => {
    const options = parseReplyOptions(['אדום', 'כחול']);
    expect(wereChoicesSpoken('אפשר לבחור: אדום, או כחול!', options)).toBe(true);
    expect(wereChoicesSpoken('בחר אדמדם או כחול', options)).toBe(false);
    expect(wereChoicesSpoken('אפשר לבחור אדום', options)).toBe(false);
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
    call.receive({type:'response.output_audio_transcript.done',transcript:'Would you like A story or Music?'});
    call.receive(event);
    call.receive(event);
    expect(choices).toEqual([{label:'A story',picture:'story'},{label:'Music',picture:'music'}]);
    expect(sent).toHaveLength(1);
    expect(call.sendText('A story')).toBe(true);
    expect(JSON.stringify(sent)).toContain('A story');
    expect(JSON.stringify(sent)).not.toContain('picture');
  });
  it('reads missing visual choices in the robot voice after the first reply', () => {
    const sent: unknown[] = [];
    const phases: string[] = [];
    const call = new KiwiRealtime({phase:value=>phases.push(value),caption:()=>{},options:()=>{},error:()=>{}});
    Object.assign(call, {channel:{readyState:'open',send:(value:string)=>sent.push(JSON.parse(value))}});
    call.receive({type:'response.output_audio_transcript.done',transcript:'Which color do you like?'});
    call.receive({type:'response.done',response:{output:[{
      type:'function_call',name:'show_reply_options',call_id:'colors-1',
      arguments:JSON.stringify({options:[{label:'אדום',picture:'art'},{label:'כחול',picture:'art'}]}),
    }]}});
    expect(sent).toHaveLength(2);
    expect(sent[1]).toMatchObject({type:'response.create',response:{tool_choice:'none',output_modalities:['audio']}});
    expect(JSON.stringify(sent[1])).toContain('אדום');
    expect(JSON.stringify(sent[1])).toContain('כחול');
    expect(phases.at(-1)).toBe('thinking');
  });
  it('waits for original audio to finish before reading options and cancels queued speech on Stop', () => {
    const sent: unknown[] = [];
    const call = new KiwiRealtime({phase:()=>{},caption:()=>{},options:()=>{},error:()=>{}});
    Object.assign(call, {channel:{readyState:'open',send:(value:string)=>sent.push(JSON.parse(value)),close:()=>{}}});
    call.receive({type:'output_audio_buffer.started'});
    call.receive({type:'response.done',response:{output:[{
      type:'function_call',name:'show_reply_options',call_id:'colors-2',
      arguments:JSON.stringify({options:[{label:'Red'},{label:'Blue'}]}),
    }]}});
    expect(sent).toHaveLength(1);
    call.stop();
    expect(sent).toHaveLength(1);
  });
  it('starts the missing readout only after playback settles', () => {
    vi.useFakeTimers();
    try {
      const sent: unknown[] = [];
      const call = new KiwiRealtime({phase:()=>{},caption:()=>{},options:()=>{},error:()=>{}});
      Object.assign(call, {channel:{readyState:'open',send:(value:string)=>sent.push(JSON.parse(value)),close:()=>{}}});
      call.receive({type:'output_audio_buffer.started'});
      call.receive({type:'response.done',response:{output:[{
        type:'function_call',name:'show_reply_options',call_id:'colors-3',
        arguments:JSON.stringify({options:[{label:'Red'},{label:'Blue'}]}),
      }]}});
      call.receive({type:'output_audio_buffer.stopped'});
      vi.advanceTimersByTime(219);
      expect(sent).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(sent).toHaveLength(2);
      expect(sent[1]).toMatchObject({type:'response.create',response:{tool_choice:'none'}});
      call.stop();
    } finally { vi.useRealTimers(); }
  });
});
