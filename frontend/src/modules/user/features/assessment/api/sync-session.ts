// import { client } from "@/lib/api/client";
// import { getAxiosError } from "@/lib/api/error";
// import type { addQuestionDto } from "@/service/interfaces/question.interface";
// import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/api/client";
import { useSessionStore } from "@/store/session.store";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// export async function StartSession(data: addQuestionDto) {
//   try {
//     const response = await client.post("/question-bank", data);
//     return response.data;
//   } catch (error) {
//     const msg = getAxiosError(error);
//     throw Error(msg);
//   }
// }

// export function useAddQuestion() {
//   return useMutation({
//     mutationFn: AddQuestion,
//   });
// }

export const sessionApi = {
  syncProgress: async (sessionId: string, syncData: any) => {
    //  console.log("SyncData: ", syncData);
    const { data } = await client.post(`/session/${sessionId}/sync`, syncData);
    return data;
  },
  updateOnlyStatus: async (
    userId: string,
    sessionId: string,
    status: string,
  ) => {
    const payload = {
      userId,
      status,
    };
    const { data } = await client.post(`/session/${sessionId}/status`, payload);
    return data;
  },
};

export const useProgressSync = () => {
  const {
    updateProgressFromSync,
    markAnswersSynced,
    updateSessionStatus,
    unsyncedAnswers,
    currentCategory,
    currentQuestionIndex,
  } = useSessionStore();

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
      status = "in_progress",
    }: {
      userId: string;
      sessionId: string;
      status?: string;
    }) => {
      if (unsyncedAnswers.length === 0) {
        // If no unsynced answers but status update needed
        if (status !== "in_progress") {
          const response = await sessionApi.updateOnlyStatus(
            userId,
            sessionId,
            status,
          );

          // if (!response.ok) {
          //   throw new Error("Failed to update session status");
          // }

          return response.data;
        }
        return null;
      }
      const syncData = {
        userId,
        answerBatch: unsyncedAnswers.map((answer) => ({
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          answeredAt: answer.answeredAt,
          category: answer.category,
        })),
        currentState: {
          currentCategory,
          currentQuestionIndex,
          status,
        },
      };
      //  console.log("Sending syncData:", JSON.stringify(syncData, null, 2)); // ADD THIS

      return sessionApi.syncProgress(sessionId, syncData);
    },
    // onSuccess: (data, variables) => {
    //   const syncedQuestionIds = unsyncedAnswers.map((a) => a.questionId);
    //   markAnswersSynced(syncedQuestionIds);
    //   updateProgressFromSync(variables.sessionId, data.currentProgress);
    // },
    onSuccess: (data, variables) => {
      if (unsyncedAnswers.length > 0) {
        // Mark answers as synced
        const syncedQuestionIds = unsyncedAnswers.map((a) => a.questionId);
        markAnswersSynced(syncedQuestionIds);
      }

      // Update session status in store
      if (variables.status) {
        updateSessionStatus(variables.sessionId, variables.status);
      }

      // Update progress data if returned
      if (data?.progressSummary) {
        updateProgressFromSync(variables.sessionId, data.progressSummary);
      }

      //  console.log("✅ Progress synced successfully");
    },
    onError: () => {
      toast.error("Failed to sync progress");
      // console.error("❌ Failed to sync progress:", error);
      // console.log("Response data:", error.response?.data); // ADD THIS
      // console.log("Status:", error.response?.status);
    },
  });
};
