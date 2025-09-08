import { format } from "date-fns";

export function log(
  label: string,
  data: unknown,
  level: "error" | "warning" | "info" = "info"
) {
  if (import.meta.env.DEV) {
    const value = JSON.stringify(data, null, 2);
    const time = format(new Date(), "HH:mm:ss:SSS");

    switch (level) {
      case "error":
        console.error(time, label, value);
        break;
      case "warning":
        console.warn(time, label, value);
        break;
      case "info":
        console.log(time, label, value);
        break;
    }
  }
}
