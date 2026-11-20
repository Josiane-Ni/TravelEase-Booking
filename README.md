# TravelEase

Integrated travel booking and management **simulation**. This is a working incremental implementation, **not 100% of the assignment**.

- React application: <http://127.0.0.1:5175>
- Laravel API / health: <http://127.0.0.1:8002/up>
- MySQL 8.4: `127.0.0.1:33307` (isolated `travelease-db` Podman container)
- Backend source: `laravel source/` (the existing application was preserved)
- Frontend source: `travelease-frontend/`

## Implemented workflow

Register or sign in → search a one-way flight → choose class/passengers/seats → acquire a 10-minute hold → review server prices → make a simulated wallet/mock-card payment → receive confirmation → manage checklist/download PDF → cancel within policy → receive one simulated-wallet refund and release seats.

Other working areas include password recovery/update, profile management, role-protected dashboards, agent-owned corporate clients, administrator flight/user management, in-app notifications, read-only audit logs, and filtered booking CSV export.

Hotel/package reservations, round trips, promotions/redemption, group approvals/commissions, fraud investigations, and comprehensive reports are **not implemented**. Their unavailable UI actions are disabled or explicitly identified. See [the audited checklist](docs/requirements-checklist.md) and [next steps](docs/implementation-progress.md).

## Start and verify

See [setup](docs/setup-guide.md) for first-time installation and database configuration. On this already configured workspace:

```bash
podman start travelease-db
./scripts/dev.sh
```

The development script starts Laravel, the hold-expiry scheduler, and React. Do not start a second copy while the existing servers occupy ports 8002 and 5175. Keep the command running; Ctrl+C stops its child processes. The Laravel runtime in this environment is `/usr/bin/php` because the default `php` is a Lerd wrapper.

```bash
./scripts/verify.sh
python3 tests/http/live_workflow.py
```

The verification script uses an isolated `travelease_test` MySQL database. The live HTTP test needs the running local servers and generated demo accounts and creates/cancels one fictional reservation.

## Demo access

Local-only demo emails are `customer@travelease.test`, `agent@travelease.test`, and `admin@travelease.test`. The randomly generated local password is in `.runtime/demo-access.md`; it is excluded from source control. You can also register your own customer account. Elevated roles can only be assigned by an authenticated administrator. Do not deploy demo accounts.

## Evidence and limitations

Read [testing](docs/testing.md), [architecture](docs/architecture.md), and [API contracts](docs/api-documentation.md). Source prompts are preserved in `docs/original-requirements.md` and `docs/original-frontend-requirements.md`.

The five specified reference screenshots were not supplied. Browser automation reported no available browser. Build, component, API, MySQL-locking, and live cookie/CSRF checks are recorded separately; **visual/pixel accuracy and responsive browser QA are unverified**.
