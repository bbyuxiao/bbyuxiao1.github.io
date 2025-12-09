import React, { ReactNode, useRef } from 'react';
import { AppSection } from './types';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Talent } from './components/Talent';
import { AISection } from './components/AISection';
import { Future } from './components/Future';
import { DataManager } from './components/DataManager';
import { Gamepad2, Download, AlertTriangle } from 'lucide-react';
import { exportToPPT } from './services/pptService';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fixed: Inherit from Component and declare state properly
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center font-sans">
            <div className="bg-brand-orange/10 p-6 rounded-full mb-6 border border-brand-orange">
                <AlertTriangle size={64} className="text-brand-orange" />
            </div>
            <h1 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">System Error</h1>
            <p className="mb-8 text-slate-400 max-w-md font-mono">Local data corruption detected. Please reset the application storage to continue.</p>
            <button 
                onClick={this.handleReset}
                className="bg-brand-orange text-white px-8 py-3 font-bold uppercase tracking-wider rounded hover:bg-white hover:text-brand-orange transition-colors clip-tech"
            >
                Reset Data & Reload
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const talentRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const futureRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: AppSection) => {
    const refs: Record<AppSection, React.RefObject<HTMLDivElement> | null> = {
      [AppSection.HERO]: null,
      [AppSection.PORTFOLIO]: portfolioRef,
      [AppSection.TALENT]: talentRef,
      [AppSection.AI_ERA]: aiRef,
      [AppSection.FUTURE]: futureRef,
    };

    refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-orange selection:text-white">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10 text-white py-3 px-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2 font-black italic text-xl tracking-tighter">
            <Gamepad2 className="text-brand-orange" />
            <span>摩西科技<span className="text-brand-orange">美术</span>中心</span>
        </div>
        <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-mono uppercase tracking-wider">
                <button onClick={() => scrollToSection(AppSection.PORTFOLIO)} className="hover:text-brand-orange transition-colors">作品展示</button>
                <button onClick={() => scrollToSection(AppSection.TALENT)} className="hover:text-brand-orange transition-colors">人才培养</button>
                <button onClick={() => scrollToSection(AppSection.AI_ERA)} className="hover:text-brand-orange transition-colors">AI 时代</button>
                <button onClick={() => scrollToSection(AppSection.FUTURE)} className="hover:text-brand-orange transition-colors">未来展望</button>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
            
            <div className="flex items-center">
                <DataManager />
                <button 
                    onClick={exportToPPT}
                    className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold uppercase px-4 py-2 rounded flex items-center gap-2 transition-colors ml-2"
                    title="导出为可编辑的PPT文件"
                >
                    <Download size={16} /> 导出 PPT
                </button>
            </div>
        </div>
      </nav>

      <main>
        <Hero onNavigate={scrollToSection} />

        <div className="space-y-24 pb-24 pt-24 bg-[linear-gradient(to_bottom,#f8fafc,#fff)]">
            <section ref={portfolioRef} id="portfolio">
                <Portfolio />
            </section>
            
            <section ref={talentRef} id="talent" className="relative">
                <div className="absolute inset-0 bg-slate-100 -skew-y-2 transform origin-top-left -z-10 scale-110"></div>
                <Talent />
            </section>

            <section ref={aiRef} id="ai">
                <AISection />
            </section>

            <section ref={futureRef} id="future" className="bg-slate-50">
                <Future />
            </section>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-500 py-12 text-center font-mono text-sm border-t-4 border-brand-orange">
        <p>© 2025 摩西科技美术中心. 版权所有.</p>
        <p className="mt-2 text-xs">内部绝密文档 // CONFIDENTIAL INTERNAL DOCUMENT</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    )
}

export default App;