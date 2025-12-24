import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Zap, TrendingUp, Network, RotateCw, AlertCircle, Route, Users, ArrowRight, Brain, Clock, Target, Award, BookOpen } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
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
  const latestSummary = notes[0]?.summary || 'No summary yet. Upload your notes to begin your learning journey with EasyStudy.';
  const advancedFeatures = [
    { title: 'Exam Prediction', description: 'AI analyzes patterns to predict likely exam questions and topics', icon: TrendingUp, to: '/predictor', gradient: 'from-primary-500/20 to-accent-500/20' },
    { title: 'Concept Mapping', description: 'Visualize relationships between topics with interactive concept maps', icon: Network, to: '/concepts', gradient: 'from-accent-500/20 to-primary-500/20' },
    { title: 'SRS Flashcards', description: 'Spaced repetition system optimizes review timing for long-term retention', icon: RotateCw, to: '/flashcards', gradient: 'from-primary-400/20 to-accent-400/20' },
    { title: 'Weakness Detection', description: 'Identify knowledge gaps and get targeted practice recommendations', icon: AlertCircle, to: '/weakness', gradient: 'from-accent-400/20 to-primary-400/20' },
    { title: 'Study Path', description: 'Personalized learning roadmap based on your performance and goals', icon: Route, to: '/study-path', gradient: 'from-primary-500/20 to-accent-500/20' },
    { title: 'Community Tips', description: 'Proven study strategies and insights from top-performing students', icon: Users, to: '/tips', gradient: 'from-accent-500/20 to-primary-500/20' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">AI-Powered Learning</span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Learn smarter, not harder.
              </h1>
              <p className="text-xl text-slate-700 dark:text-slate-400 leading-relaxed max-w-xl">
                Master complex concepts, predict exam patterns, and optimize your study strategy with AI-powered insights designed for engineering students.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={user ? '/upload' : '/auth'}>
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  <Upload className="w-5 h-5" />
                  Upload Notes
                </Button>
              </Link>
              <Link to={user ? '/quiz' : '/auth'}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Zap className="w-5 h-5" />
                  Start Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: AI Overview Card */}
          <GlassCard className="p-6 md:p-8 h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your AI Study Overview</h3>
                <Brain className="w-6 h-6 text-primary-600" />
              </div>

              <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 bg-primary-50 dark:bg-primary-500/10 p-4 rounded-lg">
                {latestSummary.substring(0, 150)}{latestSummary.length > 150 ? '...' : ''}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{totalAttempts}</div>
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1">Quizzes</div>
                </div>
                <div className="text-center p-3 bg-accent-50 dark:bg-accent-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent-600">{avgScore}%</div>
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1">Avg Score</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{streak}d</div>
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1">Streak</div>
                </div>
              </div>

              <Link to="/dashboard" className="block">
                <Button variant="secondary" size="md" className="w-full">
                  View Full Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Focus Card */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Today's Focus</h3>
              <Target className="w-5 h-5 text-primary-600" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-700 dark:text-slate-400">Current Topic</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {notes.length > 0 ? notes[0].title.substring(0, 20) : 'Pick a topic'}
              </p>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-400">Est. 45 min</div>
          </div>
        </GlassCard>

        {/* Progress Card */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Progress</h3>
              <Clock className="w-5 h-5 text-accent-600" />
            </div>
            <div className="space-y-3">
              <div className="text-sm text-slate-700 dark:text-slate-400">Weekly Goal</div>
              <div className="w-full bg-primary-100 dark:bg-primary-500/20 rounded-full h-2 overflow-hidden">
                <div
                  className="gradient-primary h-full transition-all"
                  style={{ width: `${Math.min((totalStudyMinutes / 300) * 100, 100)}%` }}
                />
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {totalStudyMinutes} / 300 min
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Exam Predictor Card */}
        <GlassCard className="p-6 border-l-4 border-accent-600">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Exam Predictor</h3>
              <TrendingUp className="w-5 h-5 text-accent-600" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-400">Flagship Feature</p>
            <Link to="/predictor">
              <Button variant="secondary" size="sm" className="w-full">
                Predict Exam
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* Recent Activity Card */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-700 dark:text-slate-400">
                {totalAttempts > 0
                  ? `${totalAttempts} quiz${totalAttempts !== 1 ? 'zes' : ''} taken`
                  : 'No quizzes yet'}
              </p>
              <p className="text-slate-700 dark:text-slate-400">
                {focusSessions.length > 0
                  ? `${focusSessions.length} focus session${focusSessions.length !== 1 ? 's' : ''}`
                  : 'Start a session'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Study Streak Heatmap */}
      {user && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Study Activity</h2>
          <GlassCard className="p-6">
            <ContributionHeatmap quizAttempts={quizAttempts} uploads={notes} currentStreak={streak} />
          </GlassCard>
        </div>
      )}

      {/* Advanced Features Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Advanced Features</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-primary-500 to-transparent rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.to}>
                <GlassCard className="p-6 h-full group hover:shadow-soft-lg transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Focus Time Section */}
      {user && totalStudyMinutes > 0 && (
        <GlassCard className="p-8 gradient-success text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Total Focus Time</p>
                <p className="text-4xl font-bold">{totalStudyMinutes} <span className="text-lg">minutes</span></p>
              </div>
            </div>
            <Link to="/pomodoro">
              <Button variant="secondary" size="lg" className="text-slate-900 font-semibold">
                <Clock className="w-5 h-5" />
                Start Pomodoro
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Tech Stack Section */}
      <GlassCard className="p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">Built for Performance</h3>
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <span className="text-3xl">⚛️</span>
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">React</p>
            <p className="text-slate-700 dark:text-slate-400 text-xs">UI Framework</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">Gemini AI</p>
            <p className="text-slate-700 dark:text-slate-400 text-xs">AI Engine</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold">Supabase</p>
            <p className="text-slate-700 dark:text-slate-400 text-xs">Database & Auth</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
