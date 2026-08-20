# SentinelSOC - Single Account Session Protection

The frontend now enforces one active browser session per account.

## Behavior

- The same username/password cannot be actively signed in from two tabs/windows at the same time.
- If the account is already active elsewhere, the second sign-in is rejected with:
  `This account is already signed in on another tab or window.`
- If a second tab takes over the account (for example after an expired session), the previous tab is automatically signed out.
- Active sessions send a heartbeat every 5 seconds.
- A session is considered stale after 20 seconds without a heartbeat, allowing recovery after a crashed/closed browser.
- Logging out releases the account lock immediately.
- Different accounts may be signed in at the same time.

This is implemented in the frontend using `localStorage` for the cross-tab active-session lock and `sessionStorage` for the individual tab session ID.

For production security, move authentication and session locking to the backend/database. Browser storage alone cannot provide server-grade authentication guarantees across different browsers/devices.
