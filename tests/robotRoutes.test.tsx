import React, { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import '../i18n';

const { endSession } = vi.hoisted(() => ({ endSession: vi.fn() }));

vi.mock('../components/avatar/RealtimeConversation', () => ({
  default: function RealtimeRobot() {
    useEffect(() => endSession, []);
    return <div>Realtime robot</div>;
  },
}));
vi.mock('../components/avatar/MascotConversation', () => ({
  MascotConversation: ({ demo }: { demo?: boolean }) => <div>{demo ? 'Robot showcase' : 'Scripted robot'}</div>,
}));
vi.mock('../components/avatar/TalkConversation', () => ({
  TalkConversation: () => <div>Gemini robot</div>,
}));
vi.mock('../components/avatar/AvatarDemo', () => ({ default: () => <div>Avatar preview</div> }));

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.clearAllMocks();
});

describe('robot-only app', () => {
  it.each([
    ['', 'Realtime robot'], ['#robot', 'Realtime robot'], ['#realtime', 'Realtime robot'],
    ['#app', 'Realtime robot'], ['#/app', 'Realtime robot'], ['#unknown', 'Realtime robot'],
    ['#avatar', 'Avatar preview'], ['#scripted', 'Scripted robot'],
    ['#demo', 'Robot showcase'], ['#live', 'Gemini robot'],
  ])('opens %s as %s without the retired app shortcut', async (hash, experience) => {
    window.history.replaceState(null, '', `/${hash}`);
    render(<App />);
    expect(await screen.findByText(experience)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /למורה|للمعلّم/ })).not.toBeInTheDocument();
  });

  it('unmounts the active conversation when changing robot routes', async () => {
    render(<App />);
    await screen.findByText('Realtime robot');
    act(() => {
      window.history.replaceState(null, '', '/#avatar');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await screen.findByText('Avatar preview');
    expect(endSession).toHaveBeenCalledOnce();
    expect(screen.queryByText('Realtime robot')).not.toBeInTheDocument();
  });
});
