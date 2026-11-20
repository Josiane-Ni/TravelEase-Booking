# Local user guide

All activity is simulated. Do not enter actual card details, passport numbers or personal travel documents.

## Customer

Open http://127.0.0.1:5175 and register or sign in with a local demo account. Search a destination/date, open a flight, select Economy or Business, enter passenger names and choose available seats. Continue to acquire the temporary hold, review the fare/policy, then choose mock-card success/failure or the simulated wallet. The discount step accurately indicates that promotions/redemption are unavailable.

Successful confirmation opens a real persisted booking. My Bookings provides itinerary PDFs, print, document self-checks and cancellation. Review the backend-calculated deadline/fee/refund in the confirmation dialog. Eligible cancellation releases the seats and adds one simulated-wallet refund. Repeated cancellation does not refund twice. Wallet supports demonstration funding (no real money). Loyalty shows earned/reversed points; rewards cannot yet be redeemed.

Profile & Settings updates your name/phone/password. Forgot-password links are written to the private Laravel mail log in this local setup. The theme icon changes light/dark preference in the current browser. Notifications can be marked read individually or together.

## Agent

Use the agent demo account or a role assigned by an administrator. Corporate Clients lists only your records and provides validated create/edit forms. Dashboard summaries reflect actual stored client and commission data. Group booking, automatic commissions and approval workflows remain unavailable.

## Administrator

Use the local administrator account. Users & Roles can assign customer/agent/admin access and deactivate other accounts. Your own access cannot be changed through this screen. Flight Management creates Economy schedules/seats, edits fares/schedules only when no class has holds/bookings, and deactivates unused flights. Inventory resizing and advanced class/airline UI are pending. Audit Logs are read-only. Reports exports filtered booking/payment/refund/net CSV data.

Hotels, holiday packages, promotions, advanced analytics and fraud investigation are not finished. A disabled action is not a successful booking workflow. See the [checklist](requirements-checklist.md) for the full remaining scope.
