import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AccessRole = "admin" | "write" | "readonly";

export type AccountActivity = {
  lastLoginAt?: string;
  lastLogoutAt?: string | null;
  totalDurationMs?: number;
  activeSessionId?: string;
  activeLoginAt?: string;
};

export type AdminLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
};

export type UserAccount = {
  username: string;
  password: string;
  role: AccessRole;
  activity?: AccountActivity;
};

type LoginResult = { ok: boolean; error?: string };

const USERS_KEY = "sentinelsoc_users_v3";
const SESSION_KEY = "sentinelsoc_session_v3";
const SESSION_TOKEN_KEY = "sentinelsoc_session_token_v1";
const ACTIVE_SESSIONS_KEY = "sentinelsoc_active_sessions_v1";
const ADMIN_LOGS_KEY = "sentinelsoc_admin_logs_v1";
const SESSION_TTL_MS = 20_000;
const HEARTBEAT_MS = 5_000;

function roleLabelForLog(role: AccessRole) {
  if (role === "admin") return "administrator";
  if (role === "write") return "write";
  return "read-only";
}

type ActiveSession = {
  token: string;
  startedAt: string;
  lastSeenAt: string;
};

type ActiveSessionMap = Record<string, ActiveSession>;

function readAdminLogs(): AdminLogEntry[] {
  try {
    const raw = localStorage.getItem(ADMIN_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type AuthContextValue = {
  user: UserAccount | null;
  users: UserAccount[];
  adminLogs: AdminLogEntry[];
  isConfigured: boolean;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
  setupAdmin: (username: string, password: string) => { ok: boolean; error?: string };
  canWrite: boolean;
  isAdmin: boolean;
  addUser: (account: UserAccount) => { ok: boolean; error?: string };
  updateUserRole: (username: string, role: AccessRole) => void;
  resetPassword: (username: string, password: string) => void;
  removeUser: (username: string) => void;
  recordAdminLog: (actor: string, action: string, target: string, details: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserAccount[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.username && item?.password && item?.role)
      : [];
  } catch {
    return [];
  }
}

function readActiveSessions(): ActiveSessionMap {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ActiveSessionMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeActiveSessions(sessions: ActiveSessionMap) {
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
}

function makeSessionToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanExpiredSessions(sessions: ActiveSessionMap) {
  const now = Date.now();
  let changed = false;
  const cleaned = { ...sessions };

  Object.entries(cleaned).forEach(([key, session]) => {
    if (!session?.lastSeenAt || now - new Date(session.lastSeenAt).getTime() > SESSION_TTL_MS) {
      delete cleaned[key];
      changed = true;
    }
  });

  if (changed) writeActiveSessions(cleaned);
  return cleaned;
}

function updateAccountActivity(
  username: string,
  updater: (activity: AccountActivity) => AccountActivity,
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>,
) {
  setUsers((current) =>
    current.map((account) =>
      account.username.toLowerCase() === username.toLowerCase()
        ? { ...account, activity: updater(account.activity ?? {}) }
        : account,
    ),
  );
}

export function isSessionActive(username: string) {
  const sessions = cleanExpiredSessions(readActiveSessions());
  return Boolean(sessions[username.toLowerCase()]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(() => readUsers());
  const [adminLogs, setAdminLogs] = useState<AdminLogEntry[]>(() => readAdminLogs());
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const username = sessionStorage.getItem(SESSION_KEY);
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (!username || !token) return null;

      const sessions = cleanExpiredSessions(readActiveSessions());
      const active = sessions[username.toLowerCase()];
      if (!active || active.token !== token) {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        return null;
      }

      return readUsers().find((account) => account.username === username) ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(adminLogs));
  }, [adminLogs]);

  const addAdminLog = (actor: string, action: string, target: string, details: string) => {
    const entry: AdminLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      details,
    };
    setAdminLogs((current) => [entry, ...current].slice(0, 500));
  };

  // Keep the current account alive and detect a session that was revoked/taken over.
  useEffect(() => {
    if (!user) return;

    const usernameKey = user.username.toLowerCase();
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }

    const heartbeat = () => {
      const sessions = cleanExpiredSessions(readActiveSessions());
      const active = sessions[usernameKey];

      if (!active || active.token !== token) {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setUser(null);
        return;
      }

      sessions[usernameKey] = {
        ...active,
        lastSeenAt: new Date().toISOString(),
      };
      writeActiveSessions(sessions);

      setUser((current) => {
        if (!current) return current;
        const latest = users.find((account) => account.username.toLowerCase() === usernameKey);
        return latest ?? current;
      });
    };

    heartbeat();
    const timer = window.setInterval(heartbeat, HEARTBEAT_MS);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ACTIVE_SESSIONS_KEY) heartbeat();
      if (event.key === USERS_KEY) setUsers(readUsers());
      if (event.key === ADMIN_LOGS_KEY) setAdminLogs(readAdminLogs());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, [user?.username, users]);

  const setupAdmin = (username: string, password: string) => {
    const cleanUsername = username.trim();
    if (users.length > 0) return { ok: false, error: "Administrator setup is already complete. Please sign in." };
    if (!cleanUsername || !password) return { ok: false, error: "Enter an administrator name and password." };
    if (cleanUsername.length < 3) return { ok: false, error: "Administrator name must contain at least 3 characters." };
    if (password.length < 6) return { ok: false, error: "Password must contain at least 6 characters." };

    const account: UserAccount = { username: cleanUsername, password, role: "admin", activity: { totalDurationMs: 0 } };
    setUsers([account]);
    addAdminLog(cleanUsername, "ADMIN_SETUP", cleanUsername, "Initial administrator account created");
    return { ok: true };
  };

  const login = (username: string, password: string): LoginResult => {
    const cleanUsername = username.trim();
    const account = users.find(
      (item) => item.username.toLowerCase() === cleanUsername.toLowerCase() && item.password === password,
    );

    if (!account) {
      addAdminLog(cleanUsername || "unknown", "LOGIN_FAILED", cleanUsername || "unknown", "Invalid credentials");
      return { ok: false, error: "Invalid administrator name or password." };
    }

    const sessions = cleanExpiredSessions(readActiveSessions());
    const key = account.username.toLowerCase();
    const existing = sessions[key];
    const currentToken = sessionStorage.getItem(SESSION_TOKEN_KEY);

    if (existing && existing.token !== currentToken) {
      addAdminLog(account.username, "LOGIN_BLOCKED", account.username, "Concurrent session rejected");
      return {
        ok: false,
        error: "This account is already signed in on another tab or window.",
      };
    }

    const token = currentToken || makeSessionToken();
    const now = new Date().toISOString();

    sessions[key] = { token, startedAt: now, lastSeenAt: now };
    writeActiveSessions(sessions);

    sessionStorage.setItem(SESSION_KEY, account.username);
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);

    const updatedAccount: UserAccount = {
      ...account,
      activity: {
        ...(account.activity ?? {}),
        lastLoginAt: now,
        lastLogoutAt: account.activity?.lastLogoutAt ?? null,
        activeSessionId: token,
        activeLoginAt: now,
        totalDurationMs: account.activity?.totalDurationMs ?? 0,
      },
    };

    setUsers((current) =>
      current.map((item) => item.username.toLowerCase() === key ? updatedAccount : item),
    );
    setUser(updatedAccount);
    addAdminLog(account.username, "LOGIN", account.username, `${account.role} session started`);

    return { ok: true };
  };

  const logout = () => {
    const currentUser = user;
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);

    if (currentUser && token) {
      const now = new Date();
      const key = currentUser.username.toLowerCase();
      const sessions = cleanExpiredSessions(readActiveSessions());
      const active = sessions[key];

      if (active?.token === token) {
        delete sessions[key];
        writeActiveSessions(sessions);

        const loginTime = currentUser.activity?.activeLoginAt
          ? new Date(currentUser.activity.activeLoginAt).getTime()
          : now.getTime();
        const duration = Math.max(0, now.getTime() - loginTime);

        updateAccountActivity(
          currentUser.username,
          (activity) => ({
            ...activity,
            lastLogoutAt: now.toISOString(),
            activeSessionId: undefined,
            activeLoginAt: undefined,
            totalDurationMs: (activity.totalDurationMs ?? 0) + duration,
          }),
          setUsers,
        );
        addAdminLog(currentUser.username, "LOGOUT", currentUser.username, `Session ended after ${Math.floor(duration / 1000)}s`);
      }
    }

    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  };

  const addUser = (account: UserAccount) => {
    const username = account.username.trim();
    if (!username || !account.password) return { ok: false, error: "Username and password are required." };
    if (users.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: "That username already exists." };
    }

    setUsers((current) => [
      ...current,
      {
        ...account,
        username,
        activity: { totalDurationMs: 0 },
      },
    ]);
    const actor = user?.username ?? "administrator";
    addAdminLog(actor, "CREATE_ACCOUNT", username, `Granted ${roleLabelForLog(account.role)} access`);
    return { ok: true };
  };

  const updateUserRole = (username: string, role: AccessRole) => {
    const target = users.find((item) => item.username === username);
    if (!target || target.role === "admin") return;
    setUsers((current) =>
      current.map((item) => item.username === username ? { ...item, role } : item),
    );
    setUser((current) => current?.username === username ? { ...current, role } : current);
    addAdminLog(user?.username ?? "administrator", "ROLE_CHANGED", username, `Role changed to ${roleLabelForLog(role)}`);
  };

  const resetPassword = (username: string, password: string) => {
    if (!password) return;
    setUsers((current) =>
      current.map((item) => item.username === username ? { ...item, password } : item),
    );
    setUser((current) => current?.username === username ? { ...current, password } : current);
    addAdminLog(user?.username ?? "administrator", "PASSWORD_RESET", username, "Password reset by administrator");
  };

  const removeUser = (username: string) => {
    const target = users.find((item) => item.username === username);
    if (!target || target.role === "admin") return;

    const sessions = cleanExpiredSessions(readActiveSessions());
    delete sessions[username.toLowerCase()];
    writeActiveSessions(sessions);

    setUsers((current) => current.filter((item) => item.username !== username));
    addAdminLog(user?.username ?? "administrator", "REVOKE_ACCESS", username, "Account access revoked");
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    users,
    adminLogs,
    isConfigured: users.length > 0,
    login,
    logout,
    setupAdmin,
    canWrite: user?.role === "admin" || user?.role === "write",
    isAdmin: user?.role === "admin",
    addUser,
    updateUserRole,
    resetPassword,
    removeUser,
    recordAdminLog: addAdminLog,
  }), [user, users, adminLogs]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
