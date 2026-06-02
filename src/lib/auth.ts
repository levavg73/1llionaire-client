import { authApi } from "@/lib/api";
import { User } from "@/types";

export function getAuthUser(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const data = root.data as Record<string, unknown> | undefined;

  if (data && typeof data === "object") {
    if (data.user && typeof data.user === "object") return data.user as unknown as User;
    if (typeof data.id === "string" && typeof data.email === "string") return data as unknown as User;
  }

  if (root.user && typeof root.user === "object") return root.user as unknown as User;
  if (typeof root.id === "string" && typeof root.email === "string") return root as unknown as User;

  return null;
}

export async function loadCurrentUser(): Promise<User | null> {
  try {
    const res = await authApi.me();
    return getAuthUser(res.data);
  } catch {
    try {
      await authApi.refresh();
      const retry = await authApi.me();
      return getAuthUser(retry.data);
    } catch {
      return null;
    }
  }
}
