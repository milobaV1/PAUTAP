// import { client } from "@/lib/api/client";
// import { getAxiosError } from "@/lib/api/error";
// import type { addQuestionDto } from "@/service/interfaces/question.interface";
// import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/api/client";
import { useSessionStore } from "@/store/session.store";
import { useMutation } from "@tanstack/react-query";

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
  syncProgress: async (userId: string, sessionId: string, syncData: any) => {
    const { data } = await client.post(`/session/${sessionId}/sync`, syncData);
    return data;
  },
};

export const useProgressSync = () => {
  const {
    updateProgressFromSync,
    markAnswersSynced,
    unsyncedAnswers,
    currentCategory,
    currentQuestionIndex,
  } = useSessionStore();

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
      status = "IN_PROGRESS",
    }: {
      userId: string;
      sessionId: string;
      status?: string;
    }) => {
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
      console.log("sync Data: ", syncData);
      return sessionApi.syncProgress(userId, sessionId, syncData);
    },
    onSuccess: (data, variables) => {
      const syncedQuestionIds = unsyncedAnswers.map((a) => a.questionId);
      markAnswersSynced(syncedQuestionIds);
      updateProgressFromSync(variables.sessionId, data.currentProgress);
    },
  });
};
