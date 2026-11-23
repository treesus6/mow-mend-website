import React from 'react';
import { BUSINESS_INFO } from '../config/business.ts';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  override componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7F3] text-[#161917] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E2E0D8] rounded-xl p-8">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B45309] mb-2">
              System Notice
            </p>
            <h1 className="text-2xl font-display font-bold mb-3">
              Something went wrong on this screen
            </h1>
            <p className="text-sm text-[#535B55] leading-relaxed mb-6">
              Please reload the page to try again. If you need an estimate right away, call or text{' '}
              <a
                href={BUSINESS_INFO.phoneHref}
                className="font-semibold text-[#143326] underline underline-offset-2"
              >
                {BUSINESS_INFO.phoneDisplay}
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#143326] text-[#F8F7F3] text-sm font-semibold rounded-lg hover:bg-[#1B4332] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-5 py-2.5 border border-[#D4D0C5] text-[#161917] text-sm font-semibold rounded-lg hover:bg-[#EFECE3] transition-colors"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
