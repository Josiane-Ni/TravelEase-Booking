# Frontend components

- `context/AppContext.jsx`: MUI ThemeProvider/CssBaseline, persisted theme preference, authentication bootstrap/session state and success/error snackbars.
- `services/api.js`: credentialed Axios, CSRF bootstrap, session-expiry and notification-change events, error normalization, currency/UTC formatting and authenticated file downloads.
- `components/Common.jsx`: Logo, ThemeToggle, Panel, Loading, Failure/retry, Empty, Status, PageTitle and stale-response-safe `useApi`.
- `components/Layout.jsx`: public footer/header, protected role routes, role sidebar/drawer, global destination search, unread bell, profile menu and logout.
- `pages/Auth.jsx`: Login/Registration with RHF/Zod, reusable password visibility fields, real forgot/reset screens.
- `pages/Dashboards.jsx`: customer, agent and admin pages sharing cards/layout, real aggregates and Recharts.
- `pages/Flights.jsx`: URL-preserving search/filter form, result cards/pagination and class/detail selection.
- `pages/Bookings.jsx`: seven-step single-flight checkout, quote/hold/confirmation APIs, safe retry key/countdown, booking history/detail, cancellation dialog, PDF/print and owned document checkboxes.
- `pages/Account.jsx`: wallet/top-up, loyalty history, notification reads and profile/password management.
- `pages/Management.jsx`: Data Grid flight/user management, agent client forms, read-only audit history and filtered CSV export.
- `pages/Public.jsx`: database-backed destination landing page, working contact form, FAQ/info/403/404 pages.

Unavailable domain actions have accurate labels or disabled controls. They are not fake CRUD operations. The CSS print rules remove navigation/actions from the itinerary view. Future work should split growing page files into domain components and add more interaction tests as workflows expand.
