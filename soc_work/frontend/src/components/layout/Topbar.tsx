import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, ChevronDown, Clock3, LogOut, Search, ShieldCheck, UserCog, X } from "lucide-react";
import { useAuth } from "../../auth";

export default function Topbar() {
  const { user, logout, isAdmin } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const searchRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const today = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(now);
  const currentTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(now);

  useEffect(() => {
    let timer: number | undefined;
    const tick = () => setNow(new Date());
    tick();
    timer = window.setInterval(tick, 1000);
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <header className="topbar">
      <div className={`search-box ${searchOpen ? "is-focused" : ""}`} role="search" onClick={() => { setSearchOpen(true); window.setTimeout(() => searchRef.current?.focus(), 0); }}>
        <Search size={16} />
        <input ref={searchRef} type="text" placeholder="Search incidents, IPs, threats..." onClick={(event) => event.stopPropagation()} />
        {searchOpen ? <X size={14} onClick={(event) => { event.stopPropagation(); setSearchOpen(false); }} /> : <span className="search-shortcut">Ctrl K</span>}
      </div>

      <div className="topbar-clock" aria-label={`Current time ${currentTime}, ${today}`}>
        <Clock3 size={16} />
        <div className="topbar-clock-content">
          <time dateTime={now.toISOString()}>{currentTime}</time>
          <span>{today}</span>
        </div>
      </div>

      <div className="topbar-date" aria-label={`Today, ${today}`}>
        <CalendarDays size={15} />
        <div className="topbar-date-content">
          <span>Today</span>
          <strong>{today}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="live-status"><span />LIVE</div>
        <div className="notification-wrap" ref={notificationRef}>
          <button className={`icon-button ${notificationsOpen ? "is-active" : ""}`} aria-label="Notifications" aria-expanded={notificationsOpen} onClick={(event) => { event.stopPropagation(); setNotificationsOpen((value) => !value); }}>
            <Bell size={18} />
            <span className="notification-count">2</span>
          </button>
          {notificationsOpen && (
            <div className="notification-panel" role="dialog" aria-label="Notifications">
              <div className="notification-panel-header">
                <div><strong>Notifications</strong><span>2 new</span></div>
                <button type="button" className="notification-mark-read" onClick={() => setNotificationsOpen(false)}>Mark all as read</button>
              </div>
              <div className="notification-tabs"><button className="active" type="button">All (2)</button><button type="button">Alerts (2)</button><button type="button">System (0)</button></div>
              <div className="notification-list">
                <button className="notification-card critical" type="button">
                  <span className="notification-card-icon"><ShieldCheck size={17} /></span>
                  <span className="notification-card-body"><strong>Critical threat detected</strong><small>SQL Injection · 2 min ago</small><em>Critical</em></span>
                  <span className="notification-card-dot" />
                </button>
                <button className="notification-card high" type="button">
                  <span className="notification-card-icon"><ShieldCheck size={17} /></span>
                  <span className="notification-card-body"><strong>Brute force activity</strong><small>auth-service · 8 min ago</small><em>High</em></span>
                  <span className="notification-card-dot" />
                </button>
              </div>
              <button className="notification-view-all" type="button">View all notifications <span>→</span></button>
            </div>
          )}
        </div>
        <div className="profile-wrap">
          <button className={`profile ${profileOpen ? "is-active" : ""}`} aria-label="Open account menu" onClick={() => setProfileOpen((value) => !value)}>
            <div className="profile-avatar"><ShieldCheck size={17} /></div>
            <div className="profile-info"><strong>{user?.username ?? "Security Admin"}</strong><span>{user?.role === "admin" ? "Administrator" : user?.role === "write" ? "Write access" : "Read-only"}</span></div>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-heading"><UserCog size={14} /><span>{user?.role === "admin" ? "Full administrator access" : user?.role === "write" ? "Can modify incidents" : "View-only access"}</span></div>
              {isAdmin && <a href="/access-control" onClick={() => setProfileOpen(false)}>Manage access</a>}
              <button onClick={() => { setProfileOpen(false); logout(); }}><LogOut size={14} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
