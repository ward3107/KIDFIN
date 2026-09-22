# Kiwi conversational motion

The adult `/#realtime` demo loads `public/models/kiwi-expressive.glb`. Existing routes keep their current avatar. Four silent preview buttons exercise listening, explanation, question and celebration poses without starting the microphone or a paid session.

The model contains independent shoulder and head pivots, eyebrow meshes, eyelid morphs and mouth morphs. Live playback amplitude drives mouth opening and asymmetric hand beats. Conversation phases select listening, thinking and speaking poses. Moving out of `speaking` clears stale mouth energy and gestures so an interruption eases back to a listening pose.

Assistant transcript punctuation and explicit praise phrases provide basic question and celebration hints. This is a heuristic, not child-emotion inference. Phoneme-level lip sync, word-aligned semantic gestures and measured prosody remain future work.

`prefers-reduced-motion` suppresses body and gesture motion while preserving mouth movement. The export script omits studio lights and the camera and exports a neutral model with morph targets.

Validation covers interruptions, reduced motion, malformed audio energy, gesture expiry and Hebrew/Arabic text hints. The live WebRTC flow still requires the environment described in `KIWI_REALTIME.md` and a real-device session before the demo can be called validated end to end.
