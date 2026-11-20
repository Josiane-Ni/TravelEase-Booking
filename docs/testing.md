# Testing report — 2026-11-13

## Audited baseline

Before development, `php artisan test` ran two framework examples: one passed and the feature test failed (expected `/` 200, actual 404). There were no TravelEase business tests, no React app, no API routes, no MySQL connection and no supplied design screenshots. The root route now redirects to the actual React app and its regression test asserts that behavior; `/hello` is preserved.

## Executed checks

| Command / verification | Actual result |
|---|---|
| `/usr/bin/php artisan migrate --no-interaction` (local MySQL) | PASS — all six migrations applied, including legacy/framework/core/contact migrations |
| `/usr/bin/php artisan db:seed --no-interaction` | PASS — local generated-password demo users, airlines/flights/classes/seats/clients and real service-created sample booking/payment/ledger data |
| `/usr/bin/php artisan test` | PASS — 35 total, 32 passed, 3 MySQL-only concurrency tests skipped; 165 assertions |
| `DB_CONNECTION=mysql DB_DATABASE=travelease_test /usr/bin/php artisan test` | PASS — 35/35, 189 assertions, including all three actual forked-process concurrency tests |
| `cd travelease-frontend && npm test` | PASS — 13 tests across auth/route/dashboard component suites (latest frontend-only rerun after adding reset-password validation) |
| `cd travelease-frontend && npm run build` | PASS — production assets generated with lazy-loaded page modules; no oversized-chunk warning after splitting |
| `python3 tests/http/live_workflow.py` with both servers running | PASS — real session cookies/CSRF, protected-role denial, wallet checkout, idempotent confirmation retry, checklist update, actual `%PDF-` response, cancellation, duplicate refund prevention and logout |
| MySQL information_schema check | PASS — 35 InnoDB tables and 34 foreign keys; this count includes framework/legacy tables |
| Composer audit after compatible Symfony update | PASS — no known advisories (initial installation reported seven advisories across four packages; resolved) |
| `npm audit --omit=dev --json` | PASS — 0 production dependency advisories |
| PHP Pint | PASS — formatted current PHP source. `--dirty` is unavailable because this workspace has no usable Git repository; explicit app/bootstrap/config/database/routes/tests paths were formatted instead. |
| Prettier | PASS — new frontend source formatted |
| Live React and proxied public API HTTP | PASS — React 5175 HTTP 200; `/api/v1/flights` HTTP 200 with 20 seeded database flights |
| Browser / screenshot / reference comparison | NOT RUN — in-app browser unavailable; browser inventory empty; five design references absent |

`./scripts/verify.sh` reproduces the default backend run, complete MySQL run, frontend tests and production build. The last full run is followed only by a frontend-only validation change/rerun and restoration of the original harmless `inspire` command; backend business logic is unchanged.

## Backend coverage

- Registration initializes wallet/loyalty, hashes passwords and accepts only customer access; duplicate email/confirmation/terms/password/role rejection.
- Login/logout/remember, invalid credentials, inactive accounts, unauthenticated/wrong-role denial, profile/password updates, real password-broker token reset and login throttling.
- Flight destination/date/price/passenger filters, current available-seat counts, unique holds, release/expiry, mixed-class seat rejection and exact passenger counts.
- Successful confirmation persists booking/passenger/seat/payment/document/notification records and server prices. Tampered totals are rejected. Replays are idempotent; changed reuse conflicts.
- Mock declines/insufficient wallet do not create confirmed bookings or deductions. Repeat declines do not duplicate attempts. New valid attempts can retry.
- Wallet debit/refund, cancellation deadline/fee, one refund on repeated cancellation, inventory restoration and loyalty reversal.
- Private booking/PDF/cancellation/document ownership, notification ownership, agent client isolation, admin access changes/audit, flight create/update/deactivate and Business-class hold protection.
- Public contact validation/persistence and actual empty dashboard aggregates.

## Real MySQL concurrency tests

`MySqlConcurrencyTest` uses `DatabaseMigrations`, committed fixtures, `pcntl_fork`, synchronized start signals, separate reconnected PDO connections and the **travelease_test** database. It is not a SQLite approximation.

1. Two users simultaneously holding one seat → exactly one hold succeeds, the other conflicts.
2. Two simultaneous identical confirmations → same booking result, exactly one payment and wallet deduction.
3. Two simultaneous bookings competing for a wallet that can afford one → one confirmation, one insufficient-funds result, nonnegative balance and one consumed seat.

The test application refuses a MySQL database whose name does not end in `_test` before test migration setup. Do not override this guard or run migrate:fresh against the application database.

## Frontend coverage and limits

Component tests use JSDOM, Testing Library and isolated API/auth fixtures. They verify strong password/confirmation/terms/email rules, invalid-submit prevention, server validation feedback, password visibility, protected role content, loading/error/retry states, real empty-data rendering, disabled missing features and assigned-client display. The latest added test checks weak reset-password rejection before submission. They are **not** browser layout/screenshot tests.

The separate live HTTP test goes through Vite's actual proxy and tests real MySQL-backed cookies and state. It intentionally creates/cancels one fictional local reservation. An initial live test selected Business class (more expensive than the seeded wallet), correctly received insufficient funds, and was corrected to select Economy. The successful run is recorded above; temporary holds from failed attempts expire normally.

No pixel accuracy, responsive browser rendering, keyboard/screen-reader audit, five-page screenshots or browser JavaScript-console pass is claimed. A real connected browser and the reference images are required to complete those checks.

## Not covered because not implemented

Hotel full-stay inventory/guest capacity/concurrency, atomic package confirmation, promotion/redemption limits/stacking, agent group approvals/commissions, fraud investigations, upload validation, scheduled travel reminders, all report types and production infrastructure. These remain required; current test counts do not imply assignment coverage.

## Continue verification

1. Connect a browser and provide `design-references/{login-page,register-page,customer-dashboard,agent-dashboard,admin-dashboard}.png`.
2. Open the live URL, test customer/agent/admin workflows at desktop/tablet/mobile sizes and in dark mode, and capture genuine screenshots.
3. Add tests with each next hotel/package/group feature before marking its checklist item implemented. Keep the current flight/auth/concurrency regressions passing.
