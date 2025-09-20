import { log } from "@/utils/logger";
import axios, { AxiosError } from "axios";

export const getAxiosError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    log("From Error Mapping: ", axiosError.response);

    if (axiosError.response) {
      const { status, data: info } = axiosError.response;

      const data = info as any;

      switch (status) {
        case 400:
          return data?.message || "Bad request. Please check your input.";
        case 401:
          return data?.message || "Authentication failed. Please log in again.";
        case 403:
          return (
            data?.message ||
            "Access denied. You don't have permission to perform this action."
          );
        case 404:
          return (
            data?.message ||
            "Oops! The resource you're looking for was not found."
          );
        case 422:
          if (data && data.errors) {
            const fieldErrors = data.errors;
            const firstField = Object.keys(fieldErrors)[0];
            if (firstField) {
              const errorMessage = fieldErrors[firstField][0];
              return `Validation failed: ${errorMessage}`;
            }
          }
          return "Validation failed. Please check your input.";
        default:
          return "Oops! Something went wrong.";
      }
    } else if (axiosError.request) {
      return "It seems we can't connect to the server right now. Please check your internet connection.";
    } else {
      return "Oops! Something went wrong.";
    }
  } else {
    return error.message ?? "Oops! Something went wrong.";
  }
};
