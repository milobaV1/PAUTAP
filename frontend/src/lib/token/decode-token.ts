import { jwtDecode } from "jwt-decode";

export function decodeToken(token: string) {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.log("Error from decoding:", error);
  }
}
