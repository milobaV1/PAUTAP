export function uuidToBase64(uuid: string): string {
  const hex = uuid.replace(/-/g, "");

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeBase64ToUuid(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  const padding = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(padding);

  const binaryString = atob(base64);

  const hex = Array.from(binaryString)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join("-");
}
