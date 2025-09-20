import type { TriviaParticipation } from "@/service/interfaces/trivia.interface";

export const getParticipationStatusMessage = (
  participation: TriviaParticipation | undefined
): string => {
  if (!participation) {
    return "This trivia is not currently active.";
  }

  switch (participation.status) {
    case "expired":
      return "You ran out of time for this trivia challenge.";
    case "completed":
    case "submitted":
      return "You have already completed this month's trivia.";
    default:
      return "This trivia is not currently active.";
  }
};
