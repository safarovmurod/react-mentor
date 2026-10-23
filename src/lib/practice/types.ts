export const VERIFIED_HTML_LESSON = 'html-day-01';
export const VERIFIED_HTML_XP = 50;
export interface PracticeCheck { id: string; passed: boolean }
export interface VerifiedPracticeProgress {
  verified: true;
  completedLessons: string[];
  confirmedDays: string[];
  xp: number;
}
export interface PracticeSubmissionResult {
  verified: true;
  passed: boolean;
  checks: PracticeCheck[];
  awardedXp: number;
  totalXp: number;
  completedLessons: string[];
  confirmedDays: string[];
}
