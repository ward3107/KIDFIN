import React from 'react';
import { STORAGE_PREFIX } from '../utils/storage';

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the tree, shows a friendly Hebrew
 * message, and offers a "reset" that wipes save4dream_* localStorage and
 * reloads. Mostly there to rescue users whose persisted state has drifted
 * past what a code change expects.
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Save4Dream crashed:', error, info.componentStack);
  }

  handleReset = (): void => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
      }
      keys.forEach(k => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div dir="rtl" className="w-full h-[100dvh] flex items-center justify-center bg-slate-100 p-6 font-rubik">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">משהו השתבש</h1>
          <p className="text-slate-600 mb-6">
            אל דאגה — נתחיל מחדש ונשמור את הציון שלך לפעם הבאה.
          </p>
          <button
            onClick={this.handleReset}
            className="w-full bg-indigo-600 text-white font-black py-3 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            התחל מחדש
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
