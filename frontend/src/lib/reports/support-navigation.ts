import type { AuthUser } from "../auth/auth";

export function supportDestination(role?: AuthUser["role"]) {
  switch (role) {
    case "ADMIN": return "AdminReports";
    case "TEACHER": return "StaffProfile?support=1";
    case "LEARNER": return "Profile?support=1";
    default: return "Login?next=support";
  }
}

export function isSupportLogin() {
  return location.hash.startsWith("#Login?") && new URLSearchParams(location.hash.split("?")[1]).get("next") === "support";
}

const supportIntentKey = "ieltspace-oauth-support";

export function rememberGoogleSupport() {
  try {
    if (isSupportLogin()) sessionStorage.setItem(supportIntentKey, "1");
    else sessionStorage.removeItem(supportIntentKey);
  } catch {}
}

export function takeGoogleSupport() {
  try {
    const requested = sessionStorage.getItem(supportIntentKey) === "1";
    sessionStorage.removeItem(supportIntentKey);
    return requested;
  } catch {
    return false;
  }
}
