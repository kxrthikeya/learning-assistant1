import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Upload, FileText, Brain, LayoutDashboard, Timer, Sparkles, LogOut, User, Zap, Award, AlertCircle, MapPin, Network, Users, Lightbulb } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

const navLinks = [
  { to: '/', label: 'Home', icon: BookOpen },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/summary', label: 'Summary', icon: FileText },
  { to: '/quiz', label: 'Quiz', icon: Brain },
  { to: '/flashcards', label: 'Flashcards', icon: Zap },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/weakness', label: 'Weakness', icon: AlertCircle },
  { to: '/study-path', label: 'Study Path', icon: MapPin },
  { to: '/concepts', label: 'Concepts', icon: Network },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/tips', label: 'Tips', icon: Lightbulb },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/predictor', label: 'Predictor', icon: Sparkles, highlight: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div
        className="fixed left-0 top-0 z-50 flex"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <button className="w-14 h-14 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl border-r border-b border-white/5 hover:bg-slate-800/80 transition-all duration-300">
          <div className="flex flex-col gap-1.5">
            <div className="w-5 h-0.5 bg-cyan-400 rounded-full transition-all duration-300" />
            <div className="w-5 h-0.5 bg-cyan-400 rounded-full transition-all duration-300" />
            <div className="w-5 h-0.5 bg-cyan-400 rounded-full transition-all duration-300" />
          </div>
        </button>

        <div
          className={`fixed left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ paddingLeft: '56px' }}
        >
          <div className="h-full overflow-y-auto py-6 px-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg'
                      : link.highlight
                      ? 'text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
            {user && (
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/10 transition-all duration-200 mt-4"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <header className="border-b border-white/5 sticky top-0 z-30 backdrop-blur-xl bg-slate-950/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group ml-14">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-cyan-300 uppercase tracking-wider font-medium">AI-Powered</p>
              <h1 className="text-xl font-bold text-white">EaseStudy</h1>
            </div>
          </Link>
          <nav className="hidden lg:flex gap-1.5 text-sm">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-white/10 text-white shadow-lg' : link.highlight ? 'text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-slate-200 max-w-[140px] truncate">{user.email}</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all duration-200">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 active:scale-95">
                Sign In
              </Link>
            )}
            <button className="lg:hidden p-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white' : link.highlight ? 'text-emerald-300 hover:bg-emerald-500/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 mt-2">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300 truncate">{user.email}</span>
                  </div>
                  <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold mt-2">
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">{children}</main>
    </div>
  );
}