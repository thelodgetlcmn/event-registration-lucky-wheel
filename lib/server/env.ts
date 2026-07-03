import { ApiHttpError } from "@/lib/server/api-error";

export interface ServerEnv {
  googleAppsScriptUrl: string;
  appsScriptSharedSecret: string;
}

export function requireServerEnv(): ServerEnv {
  const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const appsScriptSharedSecret = process.env.APPS_SCRIPT_SHARED_SECRET;

  if (!googleAppsScriptUrl) {
    throw new ApiHttpError("ยังไม่ได้ตั้งค่า GOOGLE_APPS_SCRIPT_URL", 500);
  }

  if (!appsScriptSharedSecret || appsScriptSharedSecret.length < 16) {
    throw new ApiHttpError("ยังไม่ได้ตั้งค่า APPS_SCRIPT_SHARED_SECRET ให้ปลอดภัย", 500);
  }


  return {
    googleAppsScriptUrl,
    appsScriptSharedSecret,
  };
}
