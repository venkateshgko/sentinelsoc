# SentinelSOC Theme Behavior

- The application starts in **Dark Mode**.
- The login page is always Dark Mode.
- Every new admin/user login starts in **Dark Mode**.
- After login, the admin can open **Settings** and switch to **Light**.
- Once changed, the selected theme is applied consistently across all protected pages for the current authenticated session.
- The theme choice is stored in `sessionStorage`, not `localStorage`.
- On logout, the session theme is cleared and the next login starts in Dark Mode again.
- Dark mode remains unchanged.
