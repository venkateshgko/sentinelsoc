import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Clock3,
  KeyRound,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  Timer,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useAuth, isSessionActive, type AccessRole, type UserAccount } from "../auth";

const roleLabel: Record<AccessRole, string> = {
  admin: "Administrator",
  write: "Write access",
  readonly: "Read-only",
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getTotalDuration(account: UserAccount, now: number) {
  const stored = account.activity?.totalDurationMs ?? 0;
  const activeLogin = account.activity?.activeLoginAt;

  if (!activeLogin || !isSessionActive(account.username)) return stored;

  const loginAt = new Date(activeLogin).getTime();
  if (Number.isNaN(loginAt)) return stored;

  return stored + Math.max(0, now - loginAt);
}

export default function AccessManagement() {
  const { users, addUser, updateUserRole, resetPassword, removeUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccessRole>("readonly");
  const [message, setMessage] = useState("");
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function createAccount(event: FormEvent) {
    event.preventDefault();
    const result = addUser({ username, password, role });
    setMessage(
      result.ok
        ? `Access granted to ${username} as ${roleLabel[role]}.`
        : result.error ?? "Unable to create account.",
    );
    if (result.ok) {
      setUsername("");
      setPassword("");
      setRole("readonly");
    }
  }

  function applyPassword(usernameToReset: string) {
    if (!newPassword) return;
    resetPassword(usernameToReset, newPassword);
    setResetFor(null);
    setNewPassword("");
    setMessage(`Password updated for ${usernameToReset}.`);
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((account) =>
      `${account.username} ${roleLabel[account.role]}`.toLowerCase().includes(query),
    );
  }, [search, users]);

  const activeCount = users.filter((account) => isSessionActive(account.username)).length;
  const signedOutCount = Math.max(0, users.length - activeCount);
  const totalActiveTime = users.reduce((sum, account) => sum + getTotalDuration(account, now), 0);

  return (
    <div className="access-page">
      <div className="page-heading access-page-heading">
        <div>
          <span className="eyebrow">SYSTEM ACCESS</span>
          <h2>Access Control</h2>
          <p>Manage who can view and modify SentinelSOC.</p>
        </div>
      </div>

      <div className="access-layout">
        <section className="access-card provide-access-card">
          <div className="access-card-heading">
            <div className="access-title-icon"><UserPlus size={20} /></div>
            <div>
              <h3>Provide access</h3>
              <p>Create an operator account and choose its permission level.</p>
            </div>
          </div>

          <form onSubmit={createAccount} className="access-form">
            <label>
              <span>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="off"
              />
            </label>
            <label>
              <span>Temporary password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter temporary password"
                autoComplete="new-password"
              />
            </label>
            <label>
              <span>Permission</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AccessRole)}
              >
                <option value="readonly">Read-only</option>
                <option value="write">Write access</option>
              </select>
            </label>
            <button className="primary-action access-create-button" type="submit">
              <UserPlus size={16} /> Create account
            </button>
          </form>

          {message && <div className="access-message">{message}</div>}

          <div className="access-permission-note">
            <ShieldCheck size={16} />
            <div>
              <strong>Permission levels</strong>
              <span>Read-only can monitor data. Write access can modify operational records.</span>
            </div>
          </div>
        </section>

        <section className="access-card access-accounts-card">
          <div className="access-card-heading accounts-heading">
            <div className="access-title-icon"><UsersRound size={20} /></div>
            <div>
              <h3>Active accounts</h3>
              <p>Review users, permissions, and session activity from one place.</p>
            </div>
          </div>

          <div className="access-stats">
            <div className="access-stat">
              <div className="stat-icon purple"><UsersRound size={16} /></div>
              <div><span>Total accounts</span><strong>{users.length}</strong><small>All registered users</small></div>
            </div>
            <div className="access-stat">
              <div className="stat-icon green"><UserRoundCheck size={16} /></div>
              <div><span>Currently signed in</span><strong>{activeCount}</strong><small>Active sessions</small></div>
            </div>
            <div className="access-stat">
              <div className="stat-icon slate"><UserRoundX size={16} /></div>
              <div><span>Signed out</span><strong>{signedOutCount}</strong><small>Inactive accounts</small></div>
            </div>
            <div className="access-stat">
              <div className="stat-icon purple"><Clock3 size={16} /></div>
              <div><span>Total active time</span><strong>{formatDuration(totalActiveTime)}</strong><small>Across all sessions</small></div>
            </div>
          </div>

          <div className="accounts-toolbar">
            <div className="accounts-tabs">
              <span className="active"><UsersRound size={13} /> All accounts</span>
              <span><LogIn size={13} /> Last login</span>
              <span><LogOut size={13} /> Last logout</span>
              <span><Timer size={13} /> Total duration</span>
              <span><KeyRound size={13} /> Permissions</span>
            </div>
            <div className="accounts-actions">
              <label className="accounts-search">
                <Search size={14} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." />
              </label>
              <button className="toolbar-add" type="button" onClick={() => document.querySelector<HTMLInputElement>('.provide-access-card input')?.focus()}>
                <UserPlus size={14} /> Add user
              </button>
            </div>
          </div>

          <div className="access-table-scroll">
            <div className="access-table-head" aria-hidden="true">
              <span>User</span>
              <div className="head-session"><span>Login time</span><span>Logout time</span><span>Duration</span></div>
              <span>Permissions</span>
              <span>Actions</span>
            </div>

            <div className="user-list">
            {filteredUsers.length === 0 ? (
              <div className="access-empty"><UserRound size={20} /><strong>No users found</strong><span>Try a different search.</span></div>
            ) : filteredUsers.map((account) => {
              const active = Boolean(
                account.activity?.activeSessionId &&
                account.activity?.activeLoginAt &&
                isSessionActive(account.username),
              );

              return (
                <div className={`user-row ${active ? "is-active" : ""}`} key={account.username}>
                  <div className="user-identity">
                    <div className="user-avatar"><ShieldCheck size={17} /></div>
                    <div className="user-main">
                    <div className="user-name-line">
                      <strong>{account.username}</strong>
                      {account.role === "admin" && <span className="admin-badge">ADMIN</span>}
                    </div>
                    <span>{roleLabel[account.role]}</span>
                    <span className={`session-state ${active ? "online" : "offline"}`}>
                      <i /> {active ? "Signed in now" : "Signed out"}
                    </span>
                    </div>
                  </div>

                  <div className="session-metrics">
                    <div className="session-metric">
                      <span><LogIn size={12} /> Login time</span>
                      <strong>{formatDateTime(account.activity?.lastLoginAt)}</strong>
                    </div>
                    <div className="session-metric">
                      <span><LogOut size={12} /> Logout time</span>
                      <strong>{active ? "—" : formatDateTime(account.activity?.lastLogoutAt)}</strong>
                    </div>
                    <div className="session-metric duration-metric">
                      <span><Timer size={12} /> Duration</span>
                      <strong className={active ? "active-time" : ""}>{formatDuration(getTotalDuration(account, now))}</strong>
                    </div>
                  </div>

                  <div className="permission-control">
                    <span>Permissions</span>
                    {account.role !== "admin" ? (
                      <select
                        value={account.role}
                        onChange={(event) => updateUserRole(account.username, event.target.value as AccessRole)}
                        aria-label={`Role for ${account.username}`}
                      >
                        <option value="readonly">Read-only</option>
                        <option value="write">Write access</option>
                      </select>
                    ) : (
                      <strong>Write access</strong>
                    )}
                  </div>

                  <div className="account-actions">
                    {account.role !== "admin" ? (
                      <>
                        <button className="account-control reset-control" onClick={() => { setResetFor(account.username); setNewPassword(""); }} title="Reset password">
                          <KeyRound size={14} /> <span>Reset password</span>
                        </button>
                        <button className="account-control danger-action" onClick={() => removeUser(account.username)} title="Revoke access">
                          <Trash2 size={14} /> <span>Revoke access</span>
                        </button>
                      </>
                    ) : (
                      <span className="admin-action-placeholder">Administrator</span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="accounts-footer">
            <span><UserCheck size={13} /> Signed in: account is currently active</span>
            <span><span className="footer-dot" /> Signed out</span>
            <span><ShieldCheck size={13} /> Administrator</span>
            <span><KeyRound size={13} /> Permission level</span>
            <span><Timer size={13} /> Session time</span>
            <strong>One active session per account is allowed.</strong>
          </div>
        </section>
      </div>

      {resetFor && (
        <div className="reset-inline">
          <strong>Reset password for {resetFor}</strong>
          <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" placeholder="New password" />
          <button className="primary-action" onClick={() => applyPassword(resetFor)}>Save password</button>
          <button className="small-action" onClick={() => setResetFor(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
