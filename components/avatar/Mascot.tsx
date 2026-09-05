import React from 'react';
import { MascotConversation } from './MascotConversation';

/**
 * The Home-screen mascot: the scripted, natural-voice social-skills
 * conversation. (The child's real two-way AI voice chat lives on the app's
 * front page — see RobotRoom / TalkConversation, powered by Gemini.)
 */
export const Mascot: React.FC<{ childName?: string; height?: number }> = ({ height }) => (
  <MascotConversation height={height} />
);

export default Mascot;
