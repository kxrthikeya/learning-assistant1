import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Upload, LayoutDashboard, Sparkles, Brain, ChevronDown, FileText, Zap, Award, AlertCircle, MapPin, Network, Users, Timer, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';
import { useThemeStore } from '../store/theme-store';
import { AIAssistant } from './AIAssistant';

const primaryNavItems = [
  { to: '/upload', label: 'Upload' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/predictor', label: 'Predictor' },
  { to: '/quiz', label: 'Quiz' },
];

const moreNavItems = [
  { to: '/summary', label: 'Summary', icon: FileText },
  { to: '/flashcards', label: 'Flashcards', icon: Zap },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/weakness', label: 'Weakness', icon: AlertCircle },
  { to: '/study-path', label: 'Study Path', icon: MapPin },
  { to: '/concepts', label: 'Concepts', icon: Network },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-dark' : 'bg-gradient-light'}`}>
      {/* Floating Command Island Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-soft-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className={`text-xs font-semibold ${isDark ? 'text-primary-400' : 'text-primary-600'} tracking-wider`}>AI-POWERED</span>
                <span className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>EasyStudy</span>
              </div>
            </div>
          </Link>

          {/* Primary Navigation - Floating Command Island */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
            <div className={`flex items-center gap-1 px-4 py-2.5 rounded-full ${isDark ? 'bg-slate-800/60 backdrop-blur-md border border-slate-700/40' : 'glass-card'}`}>
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? isDark ? 'bg-primary-500/20 text-primary-300 shadow-soft' : 'bg-primary-100 text-primary-700 shadow-soft'
                        : isDark ? 'text-slate-400 hover:text-primary-400 hover:bg-slate-700/40' : 'text-slate-800 hover:text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    moreDropdownOpen
                      ? isDark ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-100 text-primary-700'
                      : isDark ? 'text-slate-400 hover:text-primary-400 hover:bg-slate-700/40' : 'text-slate-800 hover:text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  More
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className={`absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-slate-800/80 backdrop-blur-md border border-slate-700/40' : 'glass-card'}`}>
                    <div className="py-2">
                      {moreNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
                              isActive
                                ? isDark ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-100 text-primary-700'
                                : isDark ? 'text-slate-400 hover:text-primary-400 hover:bg-slate-700/40' : 'text-slate-800 hover:text-primary-700 hover:bg-primary-100'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* User Section & Mobile Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all ${isDark ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-700' : 'glass-card text-slate-800 hover:bg-primary-100'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-full ${isDark ? 'bg-slate-800/60 border border-slate-700/40' : 'glass-card'}`}>
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm max-w-[120px] truncate ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ${isDark ? 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'glass-card text-slate-800 hover:bg-red-100 hover:text-red-700'}`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-full gradient-primary text-white font-semibold text-sm hover:shadow-soft-lg transition-all duration-200 active:scale-95"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2.5 rounded-full transition-all ${isDark ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-700' : 'glass-card hover:bg-primary-50 text-slate-900'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className={`relative h-full flex flex-col pt-20 pb-6 px-4 overflow-y-auto ${isDark ? 'bg-gradient-dark' : 'bg-gradient-light'}`}>
            {/* Primary Mobile Menu Items */}
            <div className="flex flex-col gap-2 mb-6">
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-6 py-4 rounded-2xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? isDark ? 'bg-primary-500/20 text-primary-300 shadow-soft' : 'bg-primary-100 text-primary-700 shadow-soft'
                        : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-primary-400 hover:bg-slate-700/60' : 'bg-white text-slate-800 hover:text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Secondary Menu Items */}
            <div className={`border-t pt-4 mb-6 ${isDark ? 'border-slate-700' : 'border-primary-200'}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider px-2 mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>More</div>
              <div className="flex flex-col gap-2">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-base font-medium transition-all duration-200 ${
                        isActive
                          ? isDark ? 'bg-primary-500/20 text-primary-300 shadow-soft' : 'bg-primary-100 text-primary-700 shadow-soft'
                          : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-primary-400 hover:bg-slate-700/60' : 'bg-white text-slate-800 hover:text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Section or Sign In */}
            {user ? (
              <div className="mt-auto space-y-3">
                <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${isDark ? 'bg-slate-800/60 border border-slate-700/40' : 'glass-card'}`}>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{user.email}</span>
                </div>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl gradient-primary text-white font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}