# SentinelSOC Login & Access Control

Default administrator: `admin` / `admin@123`.

After a successful sign-in the app redirects to `/` (Dashboard). Unauthenticated routes redirect to `/login` and an authenticated user visiting `/login` is redirected back to the Dashboard.

## Permissions
- **Administrator:** full access, incident status changes, settings, and Access Control.
- **Write access:** dashboard/monitoring access plus incident status and settings changes; cannot manage users.
- **Read-only:** dashboard/monitoring access only; incident status and settings changes are disabled; cannot manage users.

Administrators can open **Access Control** from the sidebar to create operator accounts, choose Read-only or Write access, reset passwords, change roles, and revoke accounts.

This is a local college/demo implementation. User accounts are stored in browser localStorage; production authentication should use backend password hashing and server-side sessions/JWT.
