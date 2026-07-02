const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function apiPath(path: string): string {
  return `${configuredBaseUrl}${path}`;
}
