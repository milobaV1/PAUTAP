import {
  createJSONStorage,
  type StateStorage,
  persist,
} from "zustand/middleware";
import { create, type StateCreator } from "zustand";
import type {
  //UsersessionData,
  Answer,
  ProgressSummary,
  FullSessionData,
  SessionSummary,
} from "@/service/interfaces/session.interface";
import type { CRISP } from "@/service/enums/crisp.enum";
export type SessionState = {
  // Lightweight sessions for listing page
  sessions: SessionSummary[];

  // Full session data for active session (from startOrResumeSession)
  currentSessionData: FullSessionData | null;

  // Current navigation state
  currentSessionId: string | null;
  currentCategory: CRISP | null;
  currentQuestionIndex: number;

  // Answer management
  localAnswers: Record<string, Answer>;
  unsyncedAnswers: Answer[];
  sessionTimeLeft: number; // in seconds
  sessionStartTime: Date | null;
  sessionDuration: number;
};

export type SessionActions = {
  // Session list management
  setSessions: (sessions: SessionSummary[]) => void;

  // Full session initialization
  initializeSessionData: (sessionData: FullSessionData) => void;
  clearSessionData: () => void;

  // Navigation state
  setCurrentSession: (sessionId: string) => void;
  setCurrentCategory: (category: CRISP) => void;
  setCurrentQuestion: (index: number) => void;
  resetCurrentQuestionIndex: () => void;

  // Answer management
  addAnswer: (answer: Answer) => void;
  markAnswersSynced: (questionIds: string[]) => void;

  // Progress updates
  updateProgressFromSync: (
    sessionId: string,
    progress: Partial<ProgressSummary>
  ) => void;
  updateSessionStatus: (sessionId: string, status: string) => void;
  setSessionTimeLeft: (timeLeft: number) => void;
  initializeSessionTimer: (duration: number) => void;
  resetSessionTimer: () => void;

  // Session cleanup
  clearSession: () => void;
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

// ---------- Store Implementation ----------
const initializer: StateCreator<SessionState & SessionActions> = (set) => ({
  // State
  sessions: [],
  currentSessionData: null,
  currentSessionId: null,
  currentCategory: null,
  currentQuestionIndex: 0,
  localAnswers: {},
  unsyncedAnswers: [],
  sessionTimeLeft: 0,
  sessionStartTime: null,
  sessionDuration: 0,

  // Session list actions
  setSessions: (sessions) => set({ sessions }),
  setSessionTimeLeft: (timeLeft) => set({ sessionTimeLeft: timeLeft }),

  initializeSessionTimer: (duration) =>
    set({
      sessionDuration: duration,
      sessionTimeLeft: duration,
      sessionStartTime: new Date(),
    }),

  resetSessionTimer: () =>
    set({
      sessionTimeLeft: 0,
      sessionStartTime: null,
      sessionDuration: 0,
    }),

  // Full session data actions
  initializeSessionData: (sessionData) => {
    //  console.log("🔵 Initializing session data:", sessionData);
    const now = new Date();
    const sessionStart = sessionData.progress.startedAt
      ? new Date(sessionData.progress.startedAt)
      : now;
    const sessionDuration = sessionData.session.timeLimit * 60; // convert minutes to seconds
    const elapsedTime = Math.floor(
      (now.getTime() - sessionStart.getTime()) / 1000
    );
    const timeLeft = Math.max(0, sessionDuration - elapsedTime);

    set({
      currentSessionData: sessionData,
      currentSessionId: sessionData.session.id,
      currentCategory: sessionData.progress.currentCategory,
      currentQuestionIndex: sessionData.progress.currentQuestionIndex,
      sessionTimeLeft: timeLeft,
      sessionDuration: sessionDuration,
      sessionStartTime: sessionStart,
    });
  },

  clearSessionData: () => set({ currentSessionData: null }),

  // Navigation actions
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  setCurrentCategory: (category) =>
    set({
      currentCategory: category,
      currentQuestionIndex: 0,
    }),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  resetCurrentQuestionIndex: () => set({ currentQuestionIndex: 0 }),

  // Answer management
  addAnswer: (answer) =>
    set((state) => {
      // console.log("🔵 addAnswer called with:", answer);
      // console.log("🔍 Current state before update:", {
      //   localAnswersCount: Object.keys(state.localAnswers).length,
      //   unsyncedAnswersCount: state.unsyncedAnswers.length,
      //   existingLocalAnswer: state.localAnswers[answer.questionId],
      //   existingUnsyncedAnswer: state.unsyncedAnswers.find(
      //     (a) => a.questionId === answer.questionId
      //   ),
      // });

      // Filter out existing unsynced answer for this question
      const filteredUnsynced = state.unsyncedAnswers.filter(
        (a) => a.questionId !== answer.questionId
      );

      const newState = {
        localAnswers: { ...state.localAnswers, [answer.questionId]: answer },
        unsyncedAnswers: [...filteredUnsynced, answer],
      };

      // console.log("✅ New state after update:", {
      //   localAnswersCount: Object.keys(newState.localAnswers).length,
      //   unsyncedAnswersCount: newState.unsyncedAnswers.length,
      //   addedToLocal: !!newState.localAnswers[answer.questionId],
      //   addedToUnsynced: newState.unsyncedAnswers.some(
      //     (a) => a.questionId === answer.questionId
      //   ),
      //   wasReplaced: !!state.localAnswers[answer.questionId],
      //   removedDuplicates:
      //     state.unsyncedAnswers.length - filteredUnsynced.length,
      // });

      return newState;
    }),

  markAnswersSynced: (questionIds) =>
    set((state) => ({
      unsyncedAnswers: state.unsyncedAnswers.filter(
        (a) => !questionIds.includes(a.questionId)
      ),
    })),

  // Progress updates
  updateProgressFromSync: (sessionId, progress) =>
    set((state) => {
      // Update the summary sessions
      const updatedSessions = state.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, ...progress } : s
      );

      // Also update current session data if it matches
      let updatedCurrentSessionData = state.currentSessionData;
      if (
        state.currentSessionData &&
        state.currentSessionData.session.id === sessionId
      ) {
        updatedCurrentSessionData = {
          ...state.currentSessionData,
          progress: {
            ...state.currentSessionData.progress,
            ...progress,
          },
        };
      }

      return {
        sessions: updatedSessions,
        currentSessionData: updatedCurrentSessionData,
      };
    }),

  updateSessionStatus: (sessionId, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        String(s.sessionId) === String(sessionId) ? { ...s, status } : s
      ),
    })),

  // Cleanup
  clearSession: () =>
    set({
      currentSessionId: null,
      currentCategory: null,
      currentQuestionIndex: 0,
      currentSessionData: null,
      localAnswers: {},
      unsyncedAnswers: [],
      sessionTimeLeft: 0,
      sessionStartTime: null,
      sessionDuration: 0,
    }),
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
