# Setup guide

## Verified environment

PHP 8.4.27 with pdo_mysql/pdo_sqlite/mbstring/xml/gd/zip, Composer 2.10.3, Node 22.23.5, npm (initial install used npm 11 after npm 10 peer-resolution crashed), and MySQL 8.4 in Podman. Use the committed Composer/npm lock files. `/usr/bin/php` avoids this machine's Lerd-wrapper service side effects.

## Existing configured workspace

The MySQL container is named `travelease-db`, port `127.0.0.1:33307`, named data volume `travelease-mysql-data`. It is independent of the pre-existing MySQL service on 33306. The application database is `travelease`; tests must use `travelease_test`.

From the workspace root:

```bash
podman start travelease-db
./scripts/dev.sh
```

Open http://127.0.0.1:5175. Laravel API is on 8002. The dev script also runs the scheduler for hold expiration. This session has already started these processes; avoid duplicate servers. Existing unrelated services on 8000, 8001 and 5173 should remain untouched.

Local generated credentials: `.runtime/mysql.env` contains the container's database secrets; `laravel source/.env` contains the matching application configuration; `.runtime/demo-access.md` contains local demo logins. All are ignored by source control. The original environment backup is `laravel source/storage/app/private/environment-before-travelease.env`, also private/ignored. No original SQLite data was migrated or deleted.

## Fresh installation on another workstation

1. Install compatible PHP 8.4+, Composer, Node 22.12+ and MySQL 8.4 (or Podman with the MySQL image). Install required PHP extensions.
2. In `laravel source/`, run `composer install`. Copy `.env.example` to `.env` **only if it does not already exist**. Set a strong DB password and database host/port/user matching a dedicated MySQL database. Generate an application key only for a newly created environment: `php artisan key:generate`.
3. Provision MySQL `travelease` and a separate `travelease_test` database using utf8mb4/InnoDB. Grant the application user access only to these local databases. Never use a production database for tests. Example container command after placing MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER and MYSQL_PASSWORD in an ignored private `.runtime/mysql.env`:

```bash
podman run -d --name travelease-db \
  --env-file "$(pwd)/.runtime/mysql.env" \
  -p 127.0.0.1:33307:3306 \
  -v travelease-mysql-data:/var/lib/mysql docker.io/library/mysql:8.4
```

Wait for readiness, then create the test schema with an administrative MySQL session. The current workspace has already done this.

4. In `laravel source/`, run `php artisan migrate`. These migrations are additive. Do **not** use `migrate:fresh` on an existing application database.
5. Optional local demo data: set a generated strong `TRAVELEASE_DEMO_PASSWORD` in `.env`, keep `APP_ENV=local`, then `php artisan db:seed`. Seeding creates missing demo accounts and inventory; it does not reset existing account roles/passwords or duplicate its funding/booking records. It requires an explicit demo password and refuses non-local/non-testing environments. Rotate/recreate demo accounts appropriately if you need new credentials.
6. In `travelease-frontend/`, run `npm ci --ignore-scripts`. If an initial unlocked npm 10 install crashes in peer resolution, use npm 11; the supplied lock file should be retained. Do not delete the lock file to fix native packages.
7. Start `./scripts/dev.sh` from the root. Set `TRAVELEASE_PHP` to the correct PHP executable on systems without `/usr/bin/php`. Configure ports in the dev script and frontend Vite proxy together if occupied.

## Authentication and mail

Local `.env` uses `APP_URL=http://127.0.0.1:8002`, `FRONTEND_URL=http://127.0.0.1:5175`, matching `SANCTUM_STATEFUL_DOMAINS`, and a distinct `SESSION_COOKIE=travelease_session`. Use 127.0.0.1 consistently; mixing localhost/127.0.0.1 can break cookies/origin checks. Session driver is database; SameSite=Lax and HttpOnly are set by Sanctum. Keep the frontend and API same-site.

`MAIL_MAILER=log` writes password-reset messages to private Laravel logs. No email is sent externally in this setup. A production SMTP/provider configuration and delivery test remain required.

## Verification

```bash
./scripts/verify.sh
python3 tests/http/live_workflow.py
```

The live test requires both servers and the configured seeded demo account. It performs a fictional booking and cancellation; it is explicitly restricted to loopback HTTP. Backend tests use SQLite by default, then the verification script runs all tests on **travelease_test** MySQL, including forked-process races. TestCase refuses MySQL database names without the `_test` suffix before migration setup.

## Production is a separate unfinished task

Build React with `npm run build`, configure SPA fallback, a same-site API/reverse proxy (the development Vite proxy does not ship), secure HTTPS cookies, exact CORS/stateful origins, protected logs/secrets, mail, scheduler/worker process management, backups and deployment tests. Disable/remove demo seeding/accounts. Do not represent the current local simulation as a production travel provider.
