import type {
  CompanyEvaluation,
  CompanyEvaluationRequest,
  EvaluationSummary,
  LecturerEvaluation,
  LecturerEvaluationRequest,
} from "../types";
import {
  apiFetch,
  EVALUATION_SERVICE_URL,
} from "./api-client";

export interface EvaluationExistence {
  internshipId: number;
  companyEvaluationExists: boolean;
  lecturerEvaluationExists: boolean;
}

export function getEvaluationSummary(internshipId: number) {
  return apiFetch<EvaluationSummary>(
    EVALUATION_SERVICE_URL,
    `/api/evaluation-summaries/${internshipId}`,
  );
}

export function getEvaluationExistence(
  internshipId: number,
) {
  return apiFetch<EvaluationExistence>(
    EVALUATION_SERVICE_URL,
    `/api/evaluation-summaries/${internshipId}/exists`,
  );
}

export function getCompanyEvaluation(internshipId: number) {
  return apiFetch<CompanyEvaluation>(
    EVALUATION_SERVICE_URL,
    `/api/company-evaluations/${internshipId}`,
  );
}

export function createCompanyEvaluation(
  internshipId: number,
  data: CompanyEvaluationRequest,
) {
  return apiFetch<CompanyEvaluation>(
    EVALUATION_SERVICE_URL,
    `/api/company-evaluations/${internshipId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getLecturerEvaluation(internshipId: number) {
  return apiFetch<LecturerEvaluation>(
    EVALUATION_SERVICE_URL,
    `/api/lecturer-evaluations/${internshipId}`,
  );
}

export function createLecturerEvaluation(
  internshipId: number,
  data: LecturerEvaluationRequest,
) {
  return apiFetch<LecturerEvaluation>(
    EVALUATION_SERVICE_URL,
    `/api/lecturer-evaluations/${internshipId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}