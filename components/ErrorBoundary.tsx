import React from 'react';
import i18n from '../i18n';

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches rendering failures and offers a reload without clearing browser data.
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Kiwi crashed:', error, info.componentStack);
  }

  handleReset = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div dir="rtl" className="w-full h-[100dvh] flex items-center justify-center bg-slate-100 p-6 font-rubik">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">{i18n.t('app.errorTitle')}</h1>
          <p className="text-slate-600 mb-6">
            {i18n.t('app.errorBody')}
          </p>
          <button
            onClick={this.handleReset}
            className="w-full bg-indigo-600 text-white font-black py-3 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            {i18n.t('app.retry')}
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
