import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, traceId: null };
  }

  static getDerivedStateFromError(error) {
    const traceId = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { error, traceId };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white rounded-3xl border border-red-100 shadow-xl p-7 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-black text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <div className="bg-slate-50 rounded-xl px-4 py-2.5 mb-5">
              <p className="text-[10px] text-slate-400 font-mono">Trace ID: {this.state.traceId}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
            >
              Reload App
            </button>
            {import.meta.env.DEV && (
              <details className="mt-4 text-left">
                <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600">Dev details</summary>
                <pre className="text-[9px] text-red-500 mt-2 overflow-auto max-h-32 bg-red-50 p-2 rounded-xl whitespace-pre-wrap">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}