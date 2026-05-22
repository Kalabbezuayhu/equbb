import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../utils/api";

const API_BASE_URL = '/api';

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  user: { id: number; name: string; email: string; role: 'admin' | 'user' } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  nextDraw: any;
  drawStatus: any;
  members: any[];
  contributions: any[];
  winners: any[];
  chartData: any[];
  notifications: any[];
  stats: any;
  loading: boolean;
  equbAmount: number;
  fetchAllData: () => Promise<void>;
  fetchDrawStatus: () => Promise<void>;
  addMember: (member: any) => Promise<void>;
  markContributionPaid: (id: number) => Promise<void>;
  requestContributionPayment: (id: number) => Promise<void>;
  addWinner: (winner: any) => Promise<void>;
  setWinnerAndAdvance: () => Promise<void>;
  fetchNextDraw: () => Promise<void>;
  startDraw: () => Promise<void>;
  getNextWinner: () => Promise<any>;
  startPolling: () => void;
  stopPolling: () => void;
  setEqubAmount: (amount: number) => Promise<void>;
  fetchEqubAmount: () => Promise<void>;
  startWheel: () => Promise<void>;
  stopWheel: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      let pollingInterval: any = null;
      
      return {
        darkMode: false,
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        isAuthenticated: false,
        user: null,
        drawStatus: { round: 1, contributionsPaid: false, drawStarted: false, nextWinner: null },
        login: async (email: string, password: string) => {
          const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Login failed" }));
            throw new Error(errorData.message || "Login failed");
          }
          const data = await response.json();
          set({ isAuthenticated: true, user: data.user });
        },
        signup: async (name: string, email: string, password: string) => {
          const response = await fetch(`${API_BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Signup failed" }));
            throw new Error(errorData.message || "Signup failed");
          }
          const data = await response.json();
          set({ isAuthenticated: true, user: data.user });
        },
        fetchDrawStatus: async () => {
          const response = await fetch(`${API_BASE_URL}/draw-status`);
          const data = await response.json();
          set({ drawStatus: data });
        },
        startPolling: () => {
          if (pollingInterval) return;
          pollingInterval = setInterval(async () => {
            try {
              await get().fetchDrawStatus();
              const [members, contributions, winners] = await Promise.all([
                api.getMembers(),
                api.getContributions(),
                api.getWinners(),
              ]);
              set({ members, contributions, winners });
            } catch (error) {
              console.error("Polling error:", error);
            }
          }, 2000);
        },
        stopPolling: () => {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
          }
        },
        startDraw: async () => {
          const response = await fetch(`${API_BASE_URL}/start-draw`, {
            method: "POST",
          });
          if (!response.ok) throw new Error("Failed to start draw");
          const data = await response.json();
          set({ drawStatus: data });
        },
        setWinnerAndAdvance: async () => {
          const response = await fetch(`${API_BASE_URL}/set-winner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to set winner");
          const data = await response.json();
          set((state) => ({ 
            winners: [data.winner, ...state.winners],
            drawStatus: data 
          }));
          return data.winner;
        },
        getNextWinner: async () => {
          const response = await fetch(`${API_BASE_URL}/next-winner`);
          return await response.json();
        },
        logout: () => {
          get().stopPolling();
          set({ isAuthenticated: false, user: null });
        },
        members: [],
        contributions: [],
        winners: [],
        chartData: [],
        notifications: [],
        stats: null,
        nextDraw: null,
        loading: false,
        equbAmount: 1000,

        fetchEqubAmount: async () => {
          const response = await fetch(`${API_BASE_URL}/equb-amount`);
          const data = await response.json();
          set({ equbAmount: data.equbAmount });
        },

        setEqubAmount: async (amount: number) => {
          const response = await fetch(`${API_BASE_URL}/equb-amount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equbAmount: amount }),
          });
          if (!response.ok) throw new Error("Failed to set equb amount");
          const data = await response.json();
          set({ equbAmount: data.equbAmount });
        },

        startWheel: async () => {
          const response = await fetch(`${API_BASE_URL}/start-wheel`, {
            method: "POST",
          });
          if (!response.ok) throw new Error("Failed to start wheel");
          const data = await response.json();
          set({ drawStatus: data });
        },

        stopWheel: async () => {
          const response = await fetch(`${API_BASE_URL}/stop-wheel`, {
            method: "POST",
          });
          if (!response.ok) throw new Error("Failed to stop wheel");
          const data = await response.json();
          set({ drawStatus: data });
        },

        fetchAllData: async () => {
          set({ loading: true });
          try {
            const [members, contributions, winners, chartData, notifications, stats] = await Promise.all([
              api.getMembers(),
              api.getContributions(),
              api.getWinners(),
              api.getChartData(),
              api.getNotifications(),
              api.getStats(),
            ]);
            await get().fetchDrawStatus();
            await get().fetchEqubAmount();
            set({ members, contributions, winners, chartData, notifications, stats, loading: false });
          } catch (error) {
            console.error("Error fetching data:", error);
            set({ loading: false });
          }
        },

        addMember: async (member: any) => {
          const response = await fetch(`${API_BASE_URL}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(member),
          });
          const newMember = await response.json();
          set((state) => ({ members: [...state.members, newMember] }));
        },

        markContributionPaid: async (id: number) => {
          const response = await fetch(`${API_BASE_URL}/contributions/${id}/paid`, {
            method: "PUT",
          });
          const updatedContribution = await response.json();
          set((state) => ({
            contributions: state.contributions.map((c) =>
            c.id === id ? updatedContribution : c
          ),
          }));
          const stats = await api.getStats();
          set({ stats });
          await get().fetchDrawStatus();
        },
        requestContributionPayment: async (id: number) => {
          const response = await fetch(`${API_BASE_URL}/contributions/${id}/request-payment`, {
            method: "PUT",
          });
          const updatedContribution = await response.json();
          set((state) => ({
            contributions: state.contributions.map((c) =>
            c.id === id ? updatedContribution : c
          ),
          }));
        },

        addWinner: async (winner: any) => {
          const response = await fetch(`${API_BASE_URL}/winners`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(winner),
          });
          const newWinner = await response.json();
          set((state) => ({ winners: [newWinner, ...state.winners] }));
        },

        fetchNextDraw: async () => {
          const response = await fetch(`${API_BASE_URL}/next-draw`);
          const data = await response.json();
          set({ nextDraw: data });
        },
      };
    },
    {
      name: "equb-storage",
      partialize: (state) => ({
        darkMode: state.darkMode,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export { useToast, ToastProvider } from "../components/ui/Toast";
