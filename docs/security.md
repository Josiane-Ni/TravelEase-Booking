# Security implementation and limits

Implemented and tested for the current flight workflow:

- Sanctum first-party cookie sessions, exact-origin CORS, CSRF initialization/header, HttpOnly/SameSite session cookies, rotation on login/registration and invalidation on logout.
- Strong hashed passwords; password confirmation/current-password checks; expiring single-use broker reset tokens; generic forgot-password response; auth/write throttles.
- Customer-only registration; administrator-only role/status changes; no self-deactivation/demotion; inactive-account middleware; revoked inactive database sessions.
- Booking ownership policies and scoped wallet/loyalty/notification/client operations. Authenticated roles are determined by the backend.
- Laravel Form Request validation, bounded search inputs and Eloquent parameter binding. Client prices and elevated registration attributes are prohibited.
- Integer cents, unsigned MySQL balances, deterministic row locks, bounded deadlock retries, unique references/idempotency constraints, transactional ledger/refund/point writes and immutable price/policy snapshots.
- Protected PDFs generated on demand; no public itinerary file path. React escapes rendered strings; CSV destinations are guarded against spreadsheet formula prefixes.
- Safe audit metadata; passwords/session tokens/payment credentials are not recorded in audit events. No real card/PAN/CVV fields exist.

Secrets are stored only in ignored local `.env` / `.runtime` files. Demo passwords are randomly generated locally and demo seeding is restricted to local/testing. Original environment backup is under ignored private storage. Do not publish these runtime files or deploy demo accounts.

Production requirements still need operational verification: HTTPS/secure cookies, correctly configured exact stateful/CORS origins and session domains, mail delivery, protected log access, backups, secrets rotation and worker/process management. The current setup uses loopback HTTP and a local private mail log. Account email changes and cross-device password-session revocation beyond reset are not a finished account-management feature.

Upload validation, fraud investigation controls, hotel/package inventory security and unimplemented workflows cannot be considered verified. No automatic fraud judgment is made. Browser automation/reference comparisons were unavailable; backend tests are not a substitute for browser security/UX QA.
