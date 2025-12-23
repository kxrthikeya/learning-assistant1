import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Brain, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/auth-store';
import { useAppStore } from '../store/app-store';

export function HomePage() {
  const { user } = useAuthStore();
  const { notes, quizAttempts, studySessions, fetchNotes, fetchQuizAttempts, fetchStudySessions } = useAppStore();

  useEffect(() => {
    if (user) {
      fetchNotes(user.id);
      fetchQuizAttempts(user.id);
      fetchStudySessions(user.id);
    }
  }, [user, fetchNotes, fetchQuizAttempts, fetchStudySessions]);

  const totalAttempts = quizAttempts.length;
  const avgScore = totalAttempts ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;
  const focusSessions = studySessions.filter((s) => s.session_type === 'focus');
  const totalStudyMinutes = focusSessions.reduce((sum, s) => sum + s.minutes, 0);

  const calculateStreak = () => {
    if (!user) return 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const activityDates = new Set<string>();
    quizAttempts.forEach((a) => { const date = new Date(a.created_at); date.setHours(0, 0, 0, 0); activityDates.add(date.toISOString()); });
    studySessions.forEach((s) => { const date = new Date(s.created_at); date.setHours(0, 0, 0, 0); activityDates.add(date.toISOString()); });
    let streak = 0;
    const checkDate = new Date(today);
    while (true) {
      if (activityDates.has(checkDate.toISOString())) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else if (streak === 0) { checkDate.setDate(checkDate.getDate() - 1); if (!activityDates.has(checkDate.toISOString())) break; }
      else break;
    }
    return streak;
  };

  const streak = calculateStreak();
  const latestSummary = notes[0]?.summary || 'No summary yet. Upload your notes to begin.';
  const steps = [
    { step: 1, title: 'Upload Notes', description: 'Upload up to 5 files or paste text to get started', icon: Upload, to: '/upload' },
    { step: 2, title: 'AI Summary', description: 'Get concise, structured summaries of your notes', icon: FileText, to: '/summary' },
    { step: 3, title: 'Practice Quiz', description: 'Generate MCQs by difficulty and test your knowledge', icon: Brain, to: '/quiz' },
  ];

  return (
    <div className="space-y-8">
      <GlassCard gradient="cyan" className="p-8 md:p-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 font-semibold mb-2">Revise faster. Learn smarter.</p>
              <div className="h-0.5 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Your AI-Powered <span className="text-gradient">Study Companion</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">Transform your notes into structured summaries, practice with AI-generated quizzes, track your performance, and stay focused with built-in study tools.</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to={user ? '/upload' : '/auth'}><Button variant="gradient" size="lg">Get Started<ArrowRight className="w-5 h-5" /></Button></Link>
              <Link to="/dashboard"><Button variant="secondary" size="lg">View Dashboard</Button></Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-cyan-200 font-semibold">Latest Summary Preview</p>
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-slate-100 text-sm leading-relaxed line-clamp-4 mb-6">{latestSummary.substring(0, 200)}{latestSummary.length > 200 ? '...' : ''}</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Quizzes" value={totalAttempts} gradient="from-cyan-500/20 to-blue-500/20" />
              <StatCard label="Avg Score" value={`${avgScore}%`} gradient="from-blue-500/20 to-cyan-500/20" />
              <StatCard label="Streak" value={`${streak}d`} gradient="from-emerald-500/20 to-cyan-500/20" />
            </div>
          </div>
        </div>
      </GlassCard>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.step} to={item.to}>
              <GlassCard hover gradient="blue" className="p-6 h-full group">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-full border border-cyan-500/20">Step {item.step}</span>
                  <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
      {user && totalStudyMinutes > 0 && (
        <GlassCard gradient="emerald" className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Focus Time</p>
                <p className="text-3xl font-bold text-white">{totalStudyMinutes} <span className="text-lg text-slate-400">minutes</span></p>
              </div>
            </div>
            <Link to="/pomodoro"><Button variant="gradient" size="lg">Start Pomodoro</Button></Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
}