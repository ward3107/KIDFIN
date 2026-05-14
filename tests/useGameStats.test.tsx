import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStats } from '../hooks/useGameStats';

describe('useGameStats', () => {
  it('starts at zero for new users', () => {
    const { result } = renderHook(() => useGameStats({ storageKey: 'test_stats' }));
    const [stats] = result.current;
    expect(stats.coins).toBe(0);
    expect(stats.savings).toBe(0);
    expect(stats.xp).toBe(0);
    expect(stats.level).toBe(1);
    expect(stats.knowledgePoints).toBe(0);
    expect(stats.name).toBe('');
  });

  it('addCoins increments and removeCoins clamps at zero', () => {
    const { result } = renderHook(() => useGameStats({ storageKey: 'test_coins' }));
    act(() => result.current[1].addCoins(50));
    expect(result.current[0].coins).toBe(50);
    act(() => result.current[1].removeCoins(80));
    expect(result.current[0].coins).toBe(0);
  });

  it('addXP levels up at xpPerLevel and rolls over remainder', () => {
    const { result } = renderHook(() =>
      useGameStats({ storageKey: 'test_xp', xpPerLevel: 100 })
    );
    act(() => result.current[1].addXP(60));
    expect(result.current[0].level).toBe(1);
    expect(result.current[0].xp).toBe(60);
    act(() => result.current[1].addXP(50));
    expect(result.current[0].level).toBe(2);
    expect(result.current[0].xp).toBe(10);
  });

  it('addSavings/removeSavings are clamped at zero', () => {
    const { result } = renderHook(() => useGameStats({ storageKey: 'test_save' }));
    act(() => result.current[1].addSavings(100));
    expect(result.current[0].savings).toBe(100);
    act(() => result.current[1].removeSavings(150));
    expect(result.current[0].savings).toBe(0);
  });

  it('persists across remounts via localStorage', () => {
    const { result, unmount } = renderHook(() =>
      useGameStats({ storageKey: 'test_persist' })
    );
    act(() => result.current[1].addCoins(123));
    unmount();
    const { result: r2 } = renderHook(() =>
      useGameStats({ storageKey: 'test_persist' })
    );
    expect(r2.current[0].coins).toBe(123);
  });
});
