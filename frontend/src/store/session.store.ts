import {
  createJSONStorage,
  type StateStorage,
  persist,
} from "zustand/middleware";
import { create, type StateCreator } from "zustand";
import type {
  UsersessionData,
  Answer,
  ProgressSummary,
} from "@/service/interfaces/session.interface";
import type { CRISP } from "@/service/enums/crisp.enum";

// ---------- Types ----------
export type SessionState = {
  sessions: UsersessionData[];
  currentSessionId: string | null;
  currentCategory: CRISP | null;
  currentQuestionIndex: number;

  localAnswers: Record<string, Answer>;
  unsyncedAnswers: Answer[];
};

export type SessionActions = {
  setSessions: (sessions: UsersessionData[]) => void;
  setCurrentSession: (sessionId: string) => void;
  setCurrentCategory: (category: CRISP) => void;
  setCurrentQuestion: (index: number) => void;
  addAnswer: (answer: Answer) => void;
  markAnswersSynced: (questionIds: string[]) => void;
  updateProgressFromSync: (
    sessionId: string,
    progress: Partial<ProgressSummary>
  ) => void;
  clearSession: () => void;

  updateSessionStatus: (sessionId: string, status: string) => void;
  markCategoryComplete: (sessionId: string, categoryId: string) => void;
  resetCurrentQuestionIndex: () => void;
};

// ---------- Storage ----------
const sessionStorage: StateStorage = {
  getItem: (name) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : "false";
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

// ---------- Initializer ----------
const initializer: StateCreator<SessionState & SessionActions> = (set) => ({
  sessions: [],
  currentSessionId: null,
  currentCategory: null,
  currentQuestionIndex: 0,
  localAnswers: {},
  unsyncedAnswers: [],

  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  setCurrentCategory: (category) =>
    set({ currentCategory: category, currentQuestionIndex: 0 }),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  addAnswer: (answer) =>
    set((state) => {
      console.log("🔵 addAnswer called with:", answer);
      console.log("🔍 Current state before update:", {
        localAnswersCount: Object.keys(state.localAnswers).length,
        unsyncedAnswersCount: state.unsyncedAnswers.length,
        existingLocalAnswer: state.localAnswers[answer.questionId],
        existingUnsyncedAnswer: state.unsyncedAnswers.find(
          (a) => a.questionId === answer.questionId
        ),
      });

      // Filter out existing unsynced answer for this question
      const filteredUnsynced = state.unsyncedAnswers.filter(
        (a) => a.questionId !== answer.questionId
      );

      const newState = {
        localAnswers: { ...state.localAnswers, [answer.questionId]: answer },
        unsyncedAnswers: [...filteredUnsynced, answer],
      };

      console.log("✅ New state after update:", {
        localAnswersCount: Object.keys(newState.localAnswers).length,
        unsyncedAnswersCount: newState.unsyncedAnswers.length,
        addedToLocal: !!newState.localAnswers[answer.questionId],
        addedToUnsynced: newState.unsyncedAnswers.some(
          (a) => a.questionId === answer.questionId
        ),
        wasReplaced: !!state.localAnswers[answer.questionId],
        removedDuplicates:
          state.unsyncedAnswers.length - filteredUnsynced.length,
      });

      return newState;
    }),

  markAnswersSynced: (questionIds) =>
    set((state) => ({
      unsyncedAnswers: state.unsyncedAnswers.filter(
        (a) => !questionIds.includes(a.questionId)
      ),
    })),

  updateProgressFromSync: (sessionId, progress) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, ...progress } : s
      ),
    })),

  clearSession: () =>
    set({
      currentSessionId: null,
      currentCategory: null,
      currentQuestionIndex: 0,
      localAnswers: {},
      unsyncedAnswers: [],
    }),
  updateSessionStatus: (sessionId, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        String(s.sessionId) === String(sessionId) ? { ...s, status } : s
      ),
    })),

  markCategoryComplete: (sessionId, categoryId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        String(s.sessionId) === String(sessionId)
          ? {
              ...s,
              categories: s.categories.map((cat) =>
                String(cat.categoryId) === String(categoryId)
                  ? { ...cat, isCompleted: true }
                  : cat
              ),
            }
          : s
      ),
    })),

  resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),

  // Update the existing setCurrentCategory to also reset question index
});

// ---------- Persisted Store ----------
const persistedSessionState = persist<SessionState & SessionActions>(
  initializer,
  {
    name: "session-store",
    storage: createJSONStorage(() => sessionStorage),
  }
);

export const useSessionStore = create<
  SessionState & SessionActions,
  [["zustand/persist", SessionState & SessionActions]]
>(persistedSessionState);
