export interface CompanyEvaluation {
  id: number;
  internshipId: number;
  companyId: number;
  score: number;
  comment: string | null;
  evaluatedAt: string;
}

export interface CompanyEvaluationRequest {
  score: number;
  comment: string | null;
}

export interface LecturerEvaluation {
  id: number;
  internshipId: number;
  lecturerId: number;
  score: number;
  comment: string | null;
  evaluatedAt: string;
}

export interface LecturerEvaluationRequest {
  score: number;
  comment: string | null;
}

export interface EvaluationSummary {
  internshipId: number;
  companyScore: number | null;
  lecturerScore: number | null;
  finalScore: number | null;
  companyComment: string | null;
  lecturerComment: string | null;
}
