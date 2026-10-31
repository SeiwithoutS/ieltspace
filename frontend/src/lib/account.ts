import { useSyncExternalStore } from "react";
export type Role = "learner" | "teacher" | "admin";
export type Account = {
  id: string;
  role: Role;
  name: string;
  email: string;
  initials: string;
};
const defaults: Record<Role, Account> = {
  learner: {
    id: "learner:minhanh@email.com",
    role: "learner",
    name: "Minh Anh",
    email: "minhanh@email.com",
    initials: "MA",
  },
  teacher: {
    id: "teacher:lanhuong@ieltspace.vn",
    role: "teacher",
    name: "Lan Hương",
    email: "lanhuong@ieltspace.vn",
    initials: "LH",
  },
  admin: {
    id: "admin:admin@ieltspace.vn",
    role: "admin",
    name: "Trần Quản Lý",
    email: "admin@ieltspace.vn",
    initials: "QL",
  },
};
export function currentRole(): Role {
  const context = sessionStorage.getItem("ieltspace-context") || "";
  return context === "AdminHome"
    ? "admin"
    : context === "TeacherHome"
      ? "teacher"
      : "learner";
}
export function getAccount(role: Role = currentRole()): Account {
  try {
    const value = JSON.parse(
      sessionStorage.getItem("ieltspace-account:" + role) || "null",
    );
    if (value?.id && value.role === role && typeof value.email === "string")
      return value;
  } catch {}
  return defaults[role];
}
export function selectDemoAccount(email: string, role: Role) {
  const normalized = email.trim().toLowerCase();
  const account = {
    ...defaults[role],
    id: role + ":" + normalized,
    email: normalized,
  };
  sessionStorage.setItem("ieltspace-account:" + role, JSON.stringify(account));
  sessionStorage.setItem(
    "ieltspace-context",
    role === "admin"
      ? "AdminHome"
      : role === "teacher"
        ? "TeacherHome"
        : "StudentHome",
  );
  window.dispatchEvent(new Event("ieltspace-account-change"));
}
function subscribe(callback: () => void) {
  window.addEventListener("ieltspace-account-change", callback);
  return () => window.removeEventListener("ieltspace-account-change", callback);
}
export function useAccount(role?: Role) {
  const snapshot = useSyncExternalStore(subscribe, () =>
    JSON.stringify(getAccount(role)),
  );
  return JSON.parse(snapshot) as Account;
}
