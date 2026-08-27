import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Sparkles } from 'lucide-react';
import { MascotConversation } from './MascotConversation';
import { MascotFreeChat } from './MascotFreeChat';

type Mode = 'lesson' | 'chat';

/**
 * The Home-screen mascot with two modes:
 *  - "lesson": the scripted, natural-voice social-skills conversation.
 *  - "chat":   free AI conversation (Gemini) where the child can ask anything.
 * A small segmented toggle switches between them.
 */
export const Mascot: React.FC<{ childName?: string; height?: number }> = ({
  childName,
  height,
}) => {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'he').startsWith('ar');
  const [mode, setMode] = useState<Mode>('lesson');

  const Tab: React.FC<{ id: Mode; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
    <button
      onClick={() => setMode(id)}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs md:text-sm font-semibold transition ${
        mode === id ? 'bg-indigo-600 text-white shadow' : 'bg-white text-indigo-700 ring-1 ring-indigo-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-2 flex justify-center gap-2">
        <Tab id="lesson" icon={<GraduationCap size={14} />} label={ar ? 'درس' : 'שיעור'} />
        <Tab id="chat" icon={<Sparkles size={14} />} label={ar ? 'محادثة حرة' : 'שיחה חופשית'} />
      </div>
      {mode === 'lesson' ? (
        <MascotConversation height={height} />
      ) : (
        <MascotFreeChat childName={childName} height={height} />
      )}
    </div>
  );
};

export default Mascot;
