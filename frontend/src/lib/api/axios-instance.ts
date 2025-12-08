import { useAuthState } from "@/store/auth.store";
import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosResponse,
} from "axios";

export const axiosClient = (
  token: string | null = null,
  useMultipart: boolean = false
): AxiosInstance => {
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    "Content-Type": useMultipart ? "multipart/form-data" : "application/json",
    Accept: "application/json", // ADD THIS
  };

  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers,
    timeout: 60000,
    //withCredentials: true,
  });

  client.interceptors.request.use((config: any) => {
    // Pull latest token from zustand store instead of localStorage
    console.log("Request payload:", config.data); // ADD THIS
    console.log("Request headers:", config.headers);
    const authToken = useAuthState.getState().authToken;
    config.headers = config.headers || {};
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      try {
        const { response } = error;
        if (response?.status === 401) {
          // Clear store on 401
          useAuthState.getState().logOut();
        }
      } catch (e) {
        console.log(e);
      }
      throw error;
    }
  );

  return client;
};
