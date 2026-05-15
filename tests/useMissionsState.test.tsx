import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMissionsState } from '../hooks/useMissionsState';

const makeOptions = () => ({
  missionsKey: 'test_missions_' + Math.random(),
  dailyTasksKey: 'test_daily_' + Math.random(),
  maxDailyTasks: 3,
  gameActions: {
    addCoins: vi.fn(),
    removeCoins: vi.fn(),
    addXP: vi.fn(),
    addKnowledgePoints: vi.fn(),
    setSavings: vi.fn(),
    addSavings: vi.fn(),
    removeSavings: vi.fn(),
    setName: vi.fn(),
    resetStats: vi.fn(),
  },
  triggerConfetti: vi.fn(),
});

describe('useMissionsState daily reset', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts at 0 on first launch', () => {
    const { result } = renderHook(() => useMissionsState(makeOptions()));
    expect(result.current.dailyTasksGenerated).toBe(0);
  });

  it('increments via setDailyTasksGenerated', () => {
    const { result } = renderHook(() => useMissionsState(makeOptions()));
    act(() => result.current.setDailyTasksGenerated(prev => prev + 1));
    expect(result.current.dailyTasksGenerated).toBe(1);
    act(() => result.current.setDailyTasksGenerated(prev => prev + 1));
    expect(result.current.dailyTasksGenerated).toBe(2);
  });

  it('reads 0 when stored counter is from a previous day', () => {
    const dailyTasksKey = 'test_daily_yesterday';
    // Plant a stored counter from "yesterday"
    window.localStorage.setItem(
      dailyTasksKey,
      JSON.stringify({ count: 3, date: '2000-01-01' })
    );

    const { result } = renderHook(() =>
      useMissionsState({
        ...makeOptions(),
        dailyTasksKey,
      })
    );

    expect(result.current.dailyTasksGenerated).toBe(0);
  });

  it('next increment after a day boundary writes today + count=1', () => {
    const dailyTasksKey = 'test_daily_yesterday_inc';
    window.localStorage.setItem(
      dailyTasksKey,
      JSON.stringify({ count: 3, date: '2000-01-01' })
    );

    const { result } = renderHook(() =>
      useMissionsState({
        ...makeOptions(),
        dailyTasksKey,
      })
    );

    act(() => result.current.setDailyTasksGenerated(prev => prev + 1));
    expect(result.current.dailyTasksGenerated).toBe(1);

    const stored = JSON.parse(window.localStorage.getItem(dailyTasksKey)!);
    expect(stored.count).toBe(1);
    // date should be today (YYYY-MM-DD), not the old 2000-01-01
    expect(stored.date).not.toBe('2000-01-01');
    expect(stored.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
