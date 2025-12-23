import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, TrendingUp, Target, Award, Clock, Flame } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/auth-store';
import { useAppStore } from '../store/app-store';
import { format, subDays, isSameDay } from 'date-fns';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { quizAttempts, studySessions, fetchQuizAttempts, fetchStudySessions, resetAllData } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => { if (user) { fetchQuizAttempts(user.id); fetchStudySessions(user.id); } }, [user, fetchQuizAttempts, fetchStudySessions]);

  const stats = useMemo(() => {
    const totalAttempts = quizAttempts.length;
    const avgScore = totalAttempts ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;
    const bestScore = totalAttempts ? Math.max(...quizAttempts.map((a) => a.score)) : 0;
    const byDifficulty = { easy: quizAttempts.filter((a) => a.difficulty === 'easy').length, medium: quizAttempts.filter((a) => a.difficulty === 'medium').length, hard: quizAttempts.filter((a) => a.difficulty === 'hard').length };
    const focusSessions = studySessions.filter((s) => s.session_type === 'focus');
    const totalStudyMinutes = focusSessions.reduce((sum, s) => sum + s.minutes, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const activityDates = new Set<string>();
    quizAttempts.forEach((a) => { const date = new Date(a.created_at); date.setHours(0, 0, 0, 0); activityDates.add(date.toISOString()); });
    studySessions.forEach((s) => { const date = new Date(s.created_at); date.setHours(0, 0, 0, 0); activityDates.add(date.toISOString()); });
    let streak = 0; const checkDate = new Date(today);
    for (let i = 0; i < 365; i++) { if (activityDates.has(checkDate.toISOString())) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else if (i === 0) { checkDate.setDate(checkDate.getDate() - 1); } else break; }
    return { totalAttempts, avgScore, bestScore, byDifficulty, totalStudyMinutes, streak };
  }, [quizAttempts, studySessions]);

  const activityData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const quizCount = quizAttempts.filter((a) => isSameDay(new Date(a.created_at), date)).length;
      const studyMins = studySessions.filter((s) => s.session_type === 'focus' && isSameDay(new Date(s.created_at), date)).reduce((sum, s) => sum + s.minutes, 0);
      return { date: format(date, 'EEE'), quizzes: quizCount, studyMinutes: studyMins };
    });
  }, [quizAttempts, studySessions]);

  const handleReset = async () => { if (!user) return; if (confirm('Reset all progress?')) await resetAllData(user.id); };

  if (!user) return <GlassCard className="p-8 text-center"><h2 className="text-xl font-bold text-white mb-4">Sign in to view dashboard</h2><Button onClick={() => navigate('/auth')}>Sign In</Button></GlassCard>;

  return (
    <div className="space-y-6">
      <GlassCard className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-xs text-cyan-300 uppercase tracking-[0.3em]">Analytics</p><h3 className="text-2xl font-bold text-white">Progress Dashboard</h3><p className="text-slate-300 text-sm">Accuracy, attempts, streaks, study time.</p></div>
          <Button variant="danger" onClick={handleReset}><Trash2 className="w-4 h-4" />Reset</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Target className="w-4 h-4" />Attempts</div><p className="text-2xl font-bold text-white">{stats.totalAttempts}</p></div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><TrendingUp className="w-4 h-4" />Avg Score</div><p className="text-2xl font-bold text-white">{stats.avgScore}%</p></div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Award className="w-4 h-4" />Best Score</div><p className="text-2xl font-bold text-white">{stats.bestScore}%</p></div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Flame className="w-4 h-4" />Streak</div><p className="text-2xl font-bold text-white">{stats.streak} days</p></div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Clock className="w-4 h-4" />Study Time</div><p className="text-2xl font-bold text-white">{stats.totalStudyMinutes} min</p></div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10"><div className="text-slate-400 text-sm mb-1">By Difficulty</div><div className="flex gap-2 text-xs"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">E: {stats.byDifficulty.easy}</span><span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">M: {stats.byDifficulty.medium}</span><span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">H: {stats.byDifficulty.hard}</span></div></div>
        </div>
      </GlassCard>
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Last 7 Days Activity</h4>
          <div className="space-y-3">
            {activityData.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-12 text-sm text-slate-400">{day.date}</span>
                <div className="flex-1 flex gap-2"><div className="h-6 bg-cyan-500/30 rounded" style={{ width: `${Math.min(100, day.quizzes * 20)}%` }} title={`${day.quizzes} quizzes`} /></div>
                <span className="text-xs text-slate-400 w-20 text-right">{day.quizzes}Q / {day.studyMinutes}m</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Quiz Attempts</h4>
          {quizAttempts.length === 0 ? <p className="text-slate-400 text-sm">No quiz attempts yet.</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {quizAttempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div><span className={`text-sm font-medium ${attempt.score >= 70 ? 'text-emerald-300' : attempt.score >= 50 ? 'text-yellow-300' : 'text-red-300'}`}>{attempt.score}%</span><span className="text-xs text-slate-400 ml-2">({attempt.correct_answers}/{attempt.total_questions})</span></div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${attempt.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : attempt.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{attempt.difficulty}</span>
                    <span className="text-xs text-slate-500">{format(new Date(attempt.created_at), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}