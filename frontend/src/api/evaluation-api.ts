import {
  apiFetch,
  EVALUATION_SERVICE_URL,
} from "./api-client";

export function getEvaluationSummary(internshipId: number) {
  return apiFetch(
    EVALUATION_SERVICE_URL,
    `/api/evaluation-summaries/${internshipId}`
  );
}