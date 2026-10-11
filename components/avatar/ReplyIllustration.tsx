import React from 'react';
import type { ReplyPicture } from '../../services/live/replyOptions';

/** Friendly object drawings shared by all languages; the label remains the accessible name. */
export function ReplyIllustration({ picture }: { picture: ReplyPicture }) {
  const drawings: Record<ReplyPicture, React.ReactNode> = {
    story: <><path fill="#fff7d7" d="M48 25Q28 13 12 25v49q20-8 36 2 16-10 36-2V25Q67 13 48 25Z"/><path d="M48 26v49M23 35l14 1m-14 11 14 1m22-12 14-1m-14 13 14-1"/><path fill="#efab6e" stroke="none" d="m61 18 10-2v23l-5-4-5 5Z"/></>,
    words: <><rect x="10" y="18" width="48" height="55" rx="10" fill="#b3dfd4" transform="rotate(-9 34 45)"/><rect x="41" y="29" width="44" height="52" rx="10" fill="#ffe199" transform="rotate(10 63 55)"/><path d="m24 55 9-23 9 23m-15-7h12M54 47h15l-15 20h15"/></>,
    friends: <><path fill="#b9ded5" d="M7 77V65a19 19 0 0 1 38 0v12Z"/><path fill="#c7bbed" d="M51 77V65a19 19 0 0 1 38 0v12Z"/><circle cx="27" cy="33" r="16" fill="#efb486"/><circle cx="69" cy="33" r="16" fill="#a96f50"/><path d="M21 37q6 5 12 0m30 0q6 5 12 0"/></>,
    play: <><circle cx="48" cy="49" r="34" fill="#ffda83"/><path fill="#b4dacf" d="m48 33 16 12-6 18H38l-6-18Z"/><path d="m48 33 1-18m15 30 17-5M58 63l9 15M38 63l-9 15m3-33-17-5"/></>,
    art: <><path fill="#ffdfaa" d="M81 43C77 10 24 12 14 38 0 73 42 91 55 76c8-10-8-12-1-19 8-8 31 7 27-14Z"/><circle cx="29" cy="36" r="7" fill="#e48f9b" stroke="none"/><circle cx="48" cy="28" r="7" fill="#90c9b8" stroke="none"/><circle cx="66" cy="36" r="7" fill="#9e9cdb" stroke="none"/><path d="m67 68 17-32" stroke="#67609b" strokeWidth="7"/><path fill="#ad7053" d="M61 67q15 1 5 15H55Z"/></>,
    music: <><path fill="#b9cbe9" d="M39 22 77 14v16l-38 8Z"/><path d="M39 29v39m38-45v35"/><ellipse cx="28" cy="70" rx="12" ry="9" fill="#b8ddd0" transform="rotate(-20 28 70)"/><ellipse cx="66" cy="60" rx="12" ry="9" fill="#edabb6" transform="rotate(-20 66 60)"/></>,
    numbers: <><rect x="12" y="48" width="34" height="34" rx="7" fill="#b7dccd"/><rect x="50" y="48" width="34" height="34" rx="7" fill="#f5b9ba"/><rect x="31" y="10" width="34" height="34" rx="7" fill="#ffe2a1"/><path d="m43 23 5-4v15m-27 29q8-12 14-2 2 4-14 11h15m24-15h10l-7 7q13 1 4 10h-7"/></>,
    cat: <><path fill="#f4c49b" d="m18 45-2-29 23 15q9-4 18 0l23-15-2 29c17 48-77 48-60 0Z"/><path d="m28 51 6-1m28 0 6 1M39 64q9 10 18 0m-9-4v7m-28-6-12-2m14 11-12 2m64-11 12-2m-14 11 12 2"/><path fill="#e3a0a2" d="m42 56 6 6 6-6Z"/></>,
    dog: <><path fill="#ac7859" d="M29 26C7 8 3 77 23 67m44-41C89 8 93 77 73 67"/><rect x="24" y="22" width="49" height="59" rx="24" fill="#f4cda1"/><path d="M36 47v3m25-3v3m-22 17q9 8 18 0"/><path fill="#605750" d="m41 57 7 7 7-7Z"/></>,
    nature: <><path fill="#ce9e74" d="M42 52h12v32H42Z"/><path fill="#a4d5bd" d="M23 57C2 42 17 22 32 24 37 4 67 9 68 28c26 4 20 34 3 34H31Z"/><path d="m48 63-12-14m12 7 12-15"/></>,
    food: <><path fill="#f19e99" d="M48 30C6 6 6 82 32 82c8 0 8-5 16-5s8 5 16 5c26 0 26-76-16-52Z"/><path d="M48 31q-3-15 3-21"/><path fill="#a8d4a8" d="M52 25q0-21 23-14-2 18-23 14Z"/><path d="M28 41q-7 9-3 19" stroke="#fff1dc"/></>,
    sun: <><circle cx="48" cy="48" r="23" fill="#ffda7e"/><path d="M48 8v8m0 64v8M8 48h8m64 0h8M20 20l6 6m44 44 6 6m0-56-6 6M26 70l-6 6M38 52q10 10 20 0"/><path d="M39 42v1m18-1v1"/></>,
    moon: <><path fill="#ffe2a4" d="M68 17C14 0 9 87 61 81q24-5 24-25c-38 17-52-21-17-39Z"/><path d="m73 19 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#c7b8e8"/></>,
    happy: <><circle cx="48" cy="48" r="33" fill="#ffe2a1"/><path d="m31 40 2-1m30 1 2-1M31 56q17 20 34 0"/><circle cx="24" cy="51" r="6" fill="#f2b3a1" stroke="none"/><circle cx="72" cy="51" r="6" fill="#f2b3a1" stroke="none"/></>,
    sad: <><circle cx="48" cy="48" r="33" fill="#c9dff2"/><path d="m30 38 7 3m22 0 7-3m-29 23q11-9 22 0"/><path fill="#78b9da" d="M28 51q-11 14 0 14t0-14Z"/></>,
    yes: <><circle cx="48" cy="48" r="33" fill="#b8dec7"/><path d="m28 49 13 13 27-28" strokeWidth="8"/></>,
    no: <><circle cx="48" cy="48" r="33" fill="#f2b6b4"/><path d="m35 35 26 26m0-26L35 61" strokeWidth="8"/></>,
    idea: <><path fill="#ffe09a" d="M34 66c0-13-13-16-13-33 0-30 54-30 54 0 0 17-13 20-13 33Z"/><path d="M36 74h24m-19 8h14M48 64V43l-10-8m10 8 10-8"/><path d="M6 32h6m72 0h6M15 9l5 6m56 0 5-6"/></>,
    chat: <><path fill="#c8dfd9" d="M12 18h72v50H46L27 82V68H12Z" strokeLinejoin="round"/><circle cx="30" cy="43" r="4" fill="#5a5677" stroke="none"/><circle cx="48" cy="43" r="4" fill="#5a5677" stroke="none"/><circle cx="66" cy="43" r="4" fill="#5a5677" stroke="none"/></>,
  };
  return <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false" className="kiwi-choice-picture" stroke="#625b65" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{drawings[picture]}</svg>;
}
