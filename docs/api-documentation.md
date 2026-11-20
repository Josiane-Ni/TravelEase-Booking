# Implemented API contracts

Version prefix: `/api/v1`. Standard JSON `Accept: application/json`. Resource success responses use `{ "data": ... }`; paginated Resources include `links`/`meta`, while some account endpoints nest a Laravel paginator under `data`. Validation returns 422 with `message`/`errors`; unauthenticated 401, forbidden 403, missing 404, inventory/idempotency conflict 409, CSRF/session mismatch 419 and throttling 429. Newly created Resources may return 201; callers must accept successful 2xx.

## Cookie authentication

Browser: GET `/sanctum/csrf-cookie` → POST `/api/v1/login` or `/register` with credentialed cookies and `X-XSRF-TOKEN` → GET `/me`. Origin/Referer must match configured stateful frontend. No personal access tokens are issued. Protected routes also require an active user. Guest registration/login without a stateful browser session returns 419 rather than creating an unusable stateless login.

Registration body: `name`, `phone`, normalized lowercase `email`, `password`, `password_confirmation`, `terms: true`. Password needs 8+ characters, upper/lowercase, number and symbol. `role` and `status` are prohibited. Login accepts `email`, `password`, optional boolean `remember`. Profile accepts only required `name`/`phone`; password update accepts `current_password` and confirmed new password. Forgot/reset use the real Laravel broker, `email`/`token` and confirmed password.

## Actual route inventory

This table is generated from the running Laravel route definitions, not planned routes. Middleware abbreviations: `auth:sanctum` + `active` = signed-in active account; `role:*` is a backend role gate. Bookings/PDF/documents additionally apply ownership authorization.

| Method | Path | Controller | Access middleware |
|---|---|---|---|
| POST | /api/v1/admin/airlines | AdminController@airline | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/admin/audit-logs | AdminController@audit | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/admin/dashboard | DashboardController@admin | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/admin/flights | AdminController@flights | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| POST | /api/v1/admin/flights | FlightController@store | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| PUT | /api/v1/admin/flights/{flight} | FlightController@update | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| DELETE | /api/v1/admin/flights/{flight} | FlightController@destroy | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/admin/reports/export | AdminController@export | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/admin/users | AdminController@users | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| PUT | /api/v1/admin/users/{user} | AdminController@updateUser | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:admin |
| GET|HEAD | /api/v1/agent/clients | AdminController@clients | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:agent |
| POST | /api/v1/agent/clients | AdminController@saveClient | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:agent |
| PUT | /api/v1/agent/clients/{client} | AdminController@saveClient | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:agent |
| GET|HEAD | /api/v1/agent/dashboard | DashboardController@agent | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:agent |
| GET|HEAD | /api/v1/airlines | FlightController@airlines | Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET|HEAD | /api/v1/bookings | CheckoutController@index | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/bookings/{booking} | CheckoutController@show | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| POST | /api/v1/bookings/{booking}/cancel | CheckoutController@cancel | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| POST | /api/v1/bookings/{booking}/cancellation-quote | CheckoutController@cancellationQuote | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| PATCH | /api/v1/bookings/{booking}/documents/{document} | CheckoutController@document | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| GET|HEAD | /api/v1/bookings/{booking}/itinerary | CheckoutController@show | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/bookings/{booking}/itinerary/pdf | CheckoutController@pdf | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| POST | /api/v1/checkout/confirm | CheckoutController@confirm | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer, Illuminate\Routing\Middleware\ThrottleRequests:checkout |
| POST | /api/v1/checkout/holds | CheckoutController@hold | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer, Illuminate\Routing\Middleware\ThrottleRequests:checkout |
| DELETE | /api/v1/checkout/holds/{hold} | CheckoutController@release | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| POST | /api/v1/checkout/quote | CheckoutController@quote | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| POST | /api/v1/contact | ContactController@store | Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:auth |
| GET|HEAD | /api/v1/customer/dashboard | DashboardController@customer | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, App\Http\Middleware\EnsureRole:customer |
| GET|HEAD | /api/v1/flights | FlightController@index | Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET|HEAD | /api/v1/flights/{flight} | FlightController@show | Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET|HEAD | /api/v1/flights/{flight}/availability | FlightController@availability | Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | /api/v1/forgot-password | AuthController@forgot | Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:auth |
| POST | /api/v1/login | AuthController@login | Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:auth |
| POST | /api/v1/logout | AuthController@logout | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/loyalty | AccountController@loyalty | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/me | AuthController@me | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/notifications | AccountController@notifications | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| POST | /api/v1/notifications/read-all | AccountController@readAll | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| PATCH | /api/v1/notifications/{notification}/read | AccountController@read | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| PUT | /api/v1/password | AuthController@password | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/payments | AccountController@payments | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| PUT | /api/v1/profile | AuthController@profile | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| GET|HEAD | /api/v1/refunds | AccountController@refunds | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| POST | /api/v1/register | AuthController@register | Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:auth |
| POST | /api/v1/reset-password | AuthController@reset | Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:auth |
| GET|HEAD | /api/v1/wallet | AccountController@wallet | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |
| POST | /api/v1/wallet/top-up | AccountController@topUp | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:checkout |
| GET|HEAD | /api/v1/wallet/transactions | AccountController@wallet | Illuminate\Auth\Middleware\Authenticate:sanctum, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\EnsureActiveUser |

## Flight search and administration

`GET /flights`: optional `origin`, `destination`, `departure_date` (YYYY-MM-DD), `airline_id`, `class` (Economy/Business), `min_price`/`max_price` (integer USD cents per passenger), `passengers` (1–9), `sort` (price/departure), `page`. Search excludes inactive/past flights and checks current seat availability. Resource includes airline, UTC schedule, duration, policy, classes/fare/tax/capacity/available-seat counts. `GET /flights/{id}/availability` returns each class's seat IDs/labels and current availability.

Admin flight create/update body: `airline_id`, unique `flight_number`, different `origin`/`destination`, future `departure_at`, later `arrival_at`, `fare_minor`, `tax_minor`, `capacity` (1–200), `cancellation_hours`, `cancellation_fee_percent` (0–100). Creation builds Economy seats. Update keeps the current Economy capacity; **any class** with active holds/bookings blocks changes. DELETE deactivates an unused flight rather than deleting history. `POST /admin/airlines` accepts `name` and unique uppercase `code`; comprehensive airline/class editing remains pending.

## Single-flight checkout

1. `POST /checkout/quote`: `{ "flight_class_id": 1, "quantity": 1 }` → server subtotal/tax/total/currency.
2. `POST /checkout/holds`: `{ "flight_class_id": 1, "seat_ids": [1] }` → owned hold ID/reference/status/expiry and held seats. `DELETE /checkout/holds/{id}` releases only your active hold.
3. `POST /checkout/confirm`:

```json
{
  "hold_id": 1,
  "passengers": [{"name": "Example Traveler", "type": "adult"}],
  "payment_method": "mock_card",
  "mock_result": "success",
  "idempotency_key": "unique-request-key-at-least-16-chars"
}
```

For wallet payments use `payment_method: wallet` and omit `mock_result`. A mock decline is `mock_result: failure`: no booking/payment debit is created; the failed attempt/result is persisted idempotently. A deliberate new attempt uses a new key. **Network retries must retain the same payload/key.** Changed reuse returns 409. Client `price`/`total_minor` are prohibited. Confirmation rechecks ownership, expiry, selected seats, passenger count, flight status and current server prices. A booking is confirmed only after the transaction commits.

## Booking management

`GET /bookings` returns only owned bookings; `GET /bookings/{id}` and `/itinerary` return price snapshot, passengers/seats/payment/refund/documents and current cancellation quote. Owners and admins can view; only owners can cancel/update checklists. `/itinerary/pdf` is an authenticated binary `application/pdf` download generated on demand.

`POST /bookings/{id}/cancellation-quote` returns eligibility/deadline/fee/refund. `POST /bookings/{id}/cancel` takes no client amount: eligible cancellation is atomic, restoration/refund/reversal/audit are server-managed and repeated cancellation returns the existing result. Refund method is **simulated wallet** for both mock-card and wallet purchases. `PATCH /bookings/{id}/documents/{document}` takes `{ "available": true }`; IDs must belong to that booking and owner.

## Accounts / dashboards / operations

- `GET /wallet` and `/wallet/transactions`: owned wallet and paginated transactions. POST `/wallet/top-up`: `amount_minor` 100–100000 and `idempotency_key` >=16 chars. Funding is simulated, owner-scoped, rate limited and audited.
- `GET /loyalty`: balance and ledger; currently earning/reversal only. `GET /payments`, `/refunds`: owned records (no separate show/receipt endpoints yet).
- `GET /notifications`: paginator and unread_count. PATCH `/{id}/read` and POST `/read-all`: owned notifications only.
- Customer dashboard: current user's metrics/holdings/trips. Admin/agent dashboards take optional `days: 30|90|365`; no example statistics are returned.
- Admin users: `search`/`page`; update accepts `role: customer|agent|admin` and `status: active|inactive`; self-modification blocked. Admin flight listing and audit logs paginate.
- Agent clients: owner-scoped list/create/update; body `name`, `contact_email`, optional `phone`. Another agent's record is forbidden.
- Admin CSV report: `days: 30|90|365`, optional `status: confirmed|cancelled|pending`; export reflects filters and separates successful payments/refunds/net.
- Public POST `/contact`: validated `name`, `email`, `subject`, `message` (10–5000 chars), stored locally; no external mail delivery claimed.

Hotel, package, promotion, group booking, commission operations, fraud, settings, specialized reports and standalone payment/receipt routes described in the assignment **are not present**. Do not assume a planned route exists merely because the master prompt lists it.
