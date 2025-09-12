export interface QuizResult {
  id: number;
  nickname: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  quizType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizLeaderboardStats {
  nickname: string;
  bestScore: number;
  averageScore: string; // Stored as decimal in DB
  totalAttempts: number;
  quizType: string;
  lastPlayedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  nickname: string;
  bestScore: number;
  averageScore: number;
  totalAttempts: number;
  lastPlayedAt: Date;
  rank: number;
}

export interface SubmitScoreRequest {
  nickname: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  quizType?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalEntries: number;
  userRank?: number;
  userStats?: QuizLeaderboardStats;
}

export type SortBy = 'bestScore' | 'averageScore' | 'totalAttempts' | 'lastPlayedAt';
export type SortOrder = 'asc' | 'desc';

export interface LeaderboardFilters {
  quizType?: string;
  limit?: number;
  offset?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}
