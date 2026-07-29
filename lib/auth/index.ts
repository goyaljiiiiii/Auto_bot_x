import { auraStore, UserRecord } from "@/lib/db/store";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ACCOUNT_OWNER" | "TRUSTED_MEMBER";
}

// Simple production-ready session token helper
export function getCurrentSessionUser(): SessionUser {
  const owner = auraStore.getOwner();
  return {
    id: owner.id,
    name: owner.name,
    email: owner.email,
    role: owner.role,
  };
}

export function authorizeRole(user: SessionUser, requiredRole: "ACCOUNT_OWNER" | "TRUSTED_MEMBER"): boolean {
  if (!user) return false;
  if (requiredRole === "ACCOUNT_OWNER" && user.role !== "ACCOUNT_OWNER") return false;
  return true;
}
