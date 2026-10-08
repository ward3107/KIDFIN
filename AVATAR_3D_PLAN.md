# Kiwi 3D robot architecture

Kiwi is now the entire application. Its existing model, voice transports and animation layers are retained; the finance app and its progression system have been removed.

## Current layers

1. **Character assets:** `public/models/kiwi-expressive.glb` for the realtime room; `public/models/robot.glb` for the older robot demos.
2. **Rendering and motion:** `RobotAvatar`, `ExpressiveRobotModel`, the arm/face rigs and `conversationMotion`.
3. **Voice:** OpenAI WebRTC for the default conversation; Gemini audio turns for `/#live`; recorded clips and Web Speech for the scripted demos.
4. **Conversation:** the realtime persona and reply-choice tool, or the bilingual scripted dialogue engine.

`AvatarHandle` connects speech and conversation phases to expressions and motion. Audio amplitude drives the mouth; phoneme-level lip sync is not implemented. See [motion notes](docs/KIWI_MOTION.md) and [realtime setup](docs/KIWI_REALTIME.md).

The default robot remains reachable at `/`, `/#robot` and `/#realtime`. `/#avatar`, `/#demo`, `/#scripted` and `/#live` retain their respective robot previews. There is no finance app or teacher-only game route.
