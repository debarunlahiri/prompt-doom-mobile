import { API_BASE_URL } from "../config";

export function imageDeepLink(imageId: number): string {
  return `promptdoom://image/${imageId}`;
}

export function imageShareUrl(imageId: number): string {
  const siteUrl = API_BASE_URL.replace(/\/api(?:\/v\d+)?\/?$/, "");
  return `${siteUrl}/share/${imageId}`;
}
