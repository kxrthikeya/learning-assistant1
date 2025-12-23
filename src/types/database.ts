export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          raw_text: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          raw_text?: string;
          summary?: string | null;
          updated_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          note_id: string | null;
          difficulty: 'easy' | 'medium' | 'hard';
          score: number;
          total_questions: number;
          correct_answers: number;
          details: QuizDetail[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_id?: string | null;
          difficulty: 'easy' | 'medium' | 'hard';
          score: number;
          total_questions: number;
          correct_answers: number;
          details?: QuizDetail[];
          created_at?: string;
        };
        Update: {
          note_id?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard';
          score?: number;
          total_questions?: number;
          correct_answers?: number;
          details?: QuizDetail[];
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          minutes: number;
          session_type: 'focus' | 'break';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          minutes: number;
          session_type: 'focus' | 'break';
          created_at?: string;
        };
        Update: {
          minutes?: number;
          session_type?: 'focus' | 'break';
        };
      };
      prediction_runs: {
        Row: {
          id: string;
          user_id: string;
          exam_name: string;
          syllabus_summary: string | null;
          patterns: PredictionPatterns;
          generated_paper: GeneratedPaper;
          config: PredictionConfig;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_name?: string;
          syllabus_summary?: string | null;
          patterns?: PredictionPatterns;
          generated_paper?: GeneratedPaper;
          config?: PredictionConfig;
          created_at?: string;
        };
        Update: {
          exam_name?: string;
          syllabus_summary?: string | null;
          patterns?: PredictionPatterns;
          generated_paper?: GeneratedPaper;
          config?: PredictionConfig;
        };
      };
    };
  };
}

export interface QuizDetail {
  questionId: string;
  question: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicFrequency {
  name: string;
  frequency: number;
  totalMarks: number;
  yearsAppeared: number[];
}

export interface RepeatedQuestion {
  questionText: string;
  variants: string[];
  topic: string;
  timesRepeated: number;
}

export interface PredictionPatterns {
  topics: TopicFrequency[];
  repeatedQuestions: RepeatedQuestion[];
}

export interface PredictedQuestion {
  id: string;
  text: string;
  topic: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  probabilityScore: number;
  sourceType: 'new' | 'inspired' | 'similar-to-past';
}

export interface PaperSection {
  name: string;
  totalMarks: number;
  questions: PredictedQuestion[];
}

export interface GeneratedPaper {
  sections: PaperSection[];
}

export interface PredictionConfig {
  totalQuestions?: number;
  sections?: { name: string; marks: number }[];
  marksDistribution?: Record<string, number>;
}

export type Note = Database['public']['Tables']['notes']['Row'];
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];
export type PredictionRun = Database['public']['Tables']['prediction_runs']['Row'];