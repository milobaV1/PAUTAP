import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosResponse,
} from "axios";

// export const axiosInstance = axios.create({
//   baseURL: process.env.VITE_API_BASE_URL,
// });

export const axiosClient = (
  token: string | null = null,
  useMultipart: boolean = false
): AxiosInstance => {
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    "Content-Type": useMultipart ? "multipart/form-data" : "application/json",
  };

  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers,
    timeout: 60000,
    withCredentials: true,
  });

  client.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    config.headers = config.headers || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;

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
          localStorage.removeItem("ACCESS_TOKEN");
        }
      } catch (e) {
        console.log(e);
      }
      throw error;
    }
  );
  return client;
};
