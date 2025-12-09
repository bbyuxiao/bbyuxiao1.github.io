
export interface Project {
  id: string;
  name: string;
  description: string;
  descriptionSize?: string; // 'text-sm', 'text-base', 'text-lg', 'text-xl'
  imageUrl: string;
  gallery?: string[];
}

export interface TalentMetric {
  subject: string;
  A: number; // Current Level
  B: number; // Target Level
  fullMark: number;
}

export interface RecruitmentStage {
  stage: string;
  count: number;
  description: string;
}

export interface AIUsageStat {
  name: string;
  traditional: number;
  aiAssisted: number;
}

export enum AppSection {
  HERO = 'HERO',
  PORTFOLIO = 'PORTFOLIO',
  TALENT = 'TALENT',
  AI_ERA = 'AI_ERA',
  FUTURE = 'FUTURE'
}
