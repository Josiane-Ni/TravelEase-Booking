# TRAVELEASE — COMPLETE FULL-STACK DEVELOPMENT MASTER PROMPT FOR CODEX

## YOUR ROLE

You are a senior full-stack software engineer, Laravel architect, React.js developer, MySQL database engineer, UI/UX designer, application security specialist, and software testing engineer.

Your assignment is to **design, implement, integrate, test, document, and deliver a fully functional Integrated Travel Booking and Management System called TravelEase**.

This is a real implementation assignment, not a UI mockup or prototype.

Implement every requirement in this prompt using actual working code, database tables, API endpoints, business logic, and responsive user interfaces.

**Do not stop after creating the frontend or generating the project structure. Continue through all development phases until the system is implemented and verified, subject to the available environment and execution limits.**

Do not claim that a feature works unless its functionality has been implemented and tested.

---

# 1. PROJECT OVERVIEW

**Project Name:** TravelEase

**Project Type:** Integrated Travel Booking and Management System

**Architecture:** React SPA + Laravel RESTful API + MySQL Database

**Primary User Roles:**
1. Customer
2. Travel Agent
3. Administrator

### Business Objective

Develop a centralized travel management platform that enables customers to search, compare, customize, reserve, and manage flights, hotels, and holiday packages.

Travel agents must be able to manage corporate clients, group reservations, and commissions.

Administrators must manage the entire platform, including inventory, users, bookings, promotions, refunds, fraud alerts, and analytical reports.

### Important Simulation Requirement

TravelEase is a booking and payment simulation unless real airline, hotel, or payment-provider integrations are separately implemented.

Clearly label simulated transactions and reservations throughout the system.

Never claim that a simulated booking is an actual airline ticket or confirmed third-party hotel reservation.

---

# 2. REQUIRED TECHNOLOGY STACK

## Frontend

- React.js using Vite
- JavaScript with JSX
- Material UI (MUI)
- React Router
- Axios
- Recharts
- React Hook Form
- Yup or Zod
- MUI Data Grid where appropriate
- Context API or another suitable state-management solution
- Responsive CSS using MUI's styling system
- Lucide or Material UI icons

## Backend

- PHP
- Laravel
- Laravel Sanctum
- Laravel Eloquent ORM
- Laravel Form Requests
- Laravel Policies and Middleware
- Laravel Notifications
- Laravel Queues and Jobs
- Laravel Scheduler
- Laravel API Resources
- Composer
- A compatible PHP PDF-generation library, such as Dompdf

## Database

- MySQL
- InnoDB storage engine
- Foreign keys and indexes
- Database transactions
- Row-level locking
- Laravel migrations, factories, and seeders

## Development Tools

- VS Code or Cursor
- Git
- Node.js and npm
- PHP and Composer
- MySQL
- Postman or equivalent API testing tools

Use stable compatible package versions available in the development environment.

Do not unnecessarily introduce additional frameworks or replace the required technologies.

---

# 3. DEVELOPMENT OPERATING RULES

Before implementing anything:

1. Inspect the current workspace.
2. Identify existing files, dependencies, and project structure.
3. Read existing README files and implementation documentation.
4. Determine what is already implemented.
5. Preserve working code and existing data.
6. Identify missing requirements and dependencies.
7. Create a development plan.
8. Begin implementing the next incomplete feature.

If the project does not exist, initialize it.

If the project already exists, continue from its current state without recreating completed modules.

### Mandatory rules

- Write real, executable code.
- Do not leave placeholder functions.
- Do not use fake frontend-only CRUD operations.
- Do not hardcode dashboard statistics.
- Do not substitute static JSON files for required database operations.
- Do not use simulated API responses when a real Laravel endpoint is required.
- Do not bypass authentication or authorization.
- Do not expose credentials.
- Do not silently ignore errors.
- Do not mark incomplete modules as completed.
- Do not overwrite existing work without justification.
- Do not use unsafe shortcuts for payments, bookings, or inventory.
- Do not commit `.env` files or secrets.

Every required module must have working frontend pages, backend APIs, database persistence, authorization, validation, and appropriate tests.

If a feature depends on another unfinished module, implement the dependency first.

---

# 4. PROJECT DIRECTORY STRUCTURE

Create the following structure:

```text
TravelEase/
│
├── travelease/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Services/
│   │   ├── Notifications/
│   │   ├── Jobs/
│   │   ├── Events/
│   │   └── Listeners/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   └── README.md
│
├── travelease-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── flights/
│   │   │   ├── hotels/
│   │   │   ├── packages/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── dashboards/
│   │   │   ├── tables/
│   │   │   └── charts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── customer/
│   │   │   ├── agent/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── context/
│   │   ├── theme/
│   │   └── utils/
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── requirements-checklist.md
│   ├── implementation-progress.md
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-documentation.md
│   ├── security.md
│   ├── testing.md
│   ├── setup-guide.md
│   └── user-guide.md
│
├── deliverables/
│   ├── database/
│   ├── screenshots/
│   └── documentation/
│
└── README.md
```

Keep frontend and backend responsibilities clearly separated.

---

# 5. UI/UX DESIGN REQUIREMENTS

Develop a professional, modern, attractive travel-booking interface.

The design should resemble a polished commercial travel platform rather than a basic student CRUD application.

## Design system

Use this suggested visual identity:

- Primary navy: `#102A43`
- Travel blue: `#1976D2`
- Ocean teal: `#008C95`
- Accent orange: `#FF9F43`
- Light background: `#F5F8FC`
- White surfaces: `#FFFFFF`
- Dark background: `#101820`
- Success green: `#16A34A`
- Error red: `#DC2626`

Use the colors consistently through a centralized MUI theme.

### Typography

Use Inter, Roboto, or a comparable modern font.

Maintain clear heading hierarchy, readable body text, consistent spacing, and appropriate contrast.

### General design requirements

- Professional responsive header
- Navigation sidebar for dashboards
- Collapsible mobile navigation
- Breadcrumb navigation
- Searchable data tables
- Attractive summary cards
- Appropriate travel images
- Flight and hotel listing cards
- Status badges
- Loading skeletons
- Toast notifications
- Confirmation dialogs
- Empty-state illustrations or messages
- Error-state components
- Pagination
- Filter panels
- Dark/light mode
- Accessible form labels
- Keyboard navigation
- Responsive layout for desktop, tablet, and mobile

Use actual uploaded or legally usable images. Do not depend on unreliable external image links.

### Dark/light mode

Implement a working toggle using a moon or half-moon icon.

Persist the selected theme in local storage.

All pages and reusable components must respect the selected theme.

---

# 6. PUBLIC WEBSITE

Develop the following public pages:

## 6.1 Homepage

The homepage must include:

- TravelEase logo and navigation
- Hero section with attractive travel imagery
- Flight search widget
- Hotel search widget
- Holiday package search widget
- Popular destinations
- Featured hotels
- Featured flights
- Seasonal promotions
- Featured holiday packages
- Platform benefits
- How booking works
- Customer reviews where available
- Frequently asked questions
- Contact information
- Footer

Create functional navigation to all available sections.

Search forms must navigate to results with the selected filters preserved.

## 6.2 Flight search page

Provide a professional search interface supporting:

- One-way or round-trip selection
- Origin
- Destination
- Departure date
- Return date
- Number of passengers
- Travel class
- Price range
- Airline
- Departure time

Display flight results with prices, available seats, duration, and airline information.

## 6.3 Hotel search page

Include:

- Destination
- Check-in date
- Check-out date
- Guests
- Number of rooms
- Star rating
- Amenities
- Room type
- Price range

Display hotel cards with photographs, amenities, ratings, room availability, and total stay cost.

## 6.4 Holiday packages page

Display:

- Package photographs
- Destination
- Duration
- Included services
- Excluded services
- Original price
- Discount
- Final price
- Availability
- Customization options

## 6.5 Additional public pages

Implement:

- About Us
- Contact Us
- Frequently Asked Questions
- Terms and Conditions
- Privacy Policy
- Cancellation Policy
- Login
- Registration
- Forgot Password
- Reset Password
- Unauthorized Access
- Not Found

Contact form submissions must be validated and stored or delivered through a configured mechanism.

---

# 7. AUTHENTICATION AND USER MANAGEMENT

Implement:

- Customer registration
- Login
- Logout
- Forgot password
- Password reset
- Password update
- Profile management
- Account status management
- Authenticated session handling
- Role-based redirects
- Protected frontend routes
- Backend authorization

### Password rules

Passwords must contain:

- At least 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

Validate on both frontend and backend.

Use Laravel's password hashing facilities.

### Roles

**Customer:** Can manage only their own account, bookings, wallet, notifications, and loyalty information.

**Agent:** Can manage their own authorized corporate clients, group bookings, and commissions.

**Admin:** Can manage authorized system resources, users, settings, reports, and investigations.

Public registration must create customer accounts only.

Agent and admin accounts must be created or assigned through authorized administrative workflows.

### Authentication architecture

Prefer Laravel Sanctum's cookie-based SPA authentication when the frontend and API deployment arrangement supports it.

Configure:

- Stateful domains
- CORS
- CSRF protection
- Secure cookies
- SameSite configuration
- Session expiry
- Login throttling
- Logout invalidation
- Authenticated user endpoint

Use Axios with credentials and CSRF initialization where appropriate.

Do not store session credentials in local storage.

Use server-side policies for all sensitive actions.

---

# 8. CUSTOMER DASHBOARD

Create a complete customer dashboard.

### Dashboard cards

- Total bookings
- Upcoming trips
- Completed trips
- Pending payments
- Cancelled bookings
- Pending refunds
- Wallet balance
- Loyalty points

### Dashboard sections

**Upcoming Trips**

Display destination, departure date, hotel, booking reference, booking status, and quick actions.

**Recent Bookings**

Show recent flight, hotel, and package reservations.

**Wallet**

Show available balance and recent transactions.

**Loyalty**

Show current points, earned points, redeemed points, and available rewards.

**Notifications**

Display booking alerts, travel reminders, and other relevant messages.

**Quick Actions**

- Search flights
- Search hotels
- Explore packages
- Create booking
- View itinerary
- Download PDF
- Manage wallet
- View booking history

All dashboard data must come from authenticated Laravel API endpoints.

---

# 9. FLIGHT MANAGEMENT MODULE

Implement full flight search, inventory management, and booking functionality.

## Customer functionality

- Search flights
- Filter flights
- Sort results
- View flight details
- Compare fares
- Select travel class
- Select available seats
- Select passenger count
- Choose one-way or round-trip travel
- Review prices
- Continue to checkout

### Flight details

Display:

- Airline name
- Airline logo
- Flight number
- Origin
- Destination
- Departure time
- Arrival time
- Duration
- Travel class
- Seat availability
- Base fare
- Taxes and fees
- Final price
- Cancellation conditions

## Administrator functionality

Implement full management for:

- Airlines
- Airline logos
- Flights
- Flight schedules
- Flight classes
- Seat inventory
- Seat maps
- Fare configuration
- Flight status
- Flight deactivation

Use MUI Data Grid with searching, filtering, pagination, and CRUD actions.

Include an **Add New Flight** button.

### Seat management

Implement seat-level selection where enabled.

Prevent two customers from confirming the same seat.

Seat identifiers must be unique within the appropriate flight/class inventory.

Use backend transactional checks to enforce seat availability.

---

# 10. HOTEL MANAGEMENT MODULE

## Customer functionality

- Search hotels
- Filter by destination
- Filter by star rating
- Filter by amenities
- Filter by price
- Filter by room type
- View hotel details
- Browse photographs
- Select room type
- Select room quantity
- Enter guests
- Select check-in/check-out dates
- View total price
- Continue to checkout

### Hotel detail page

Display:

- Hotel name
- City and location
- Star rating
- Description
- Photo gallery
- Amenities
- Available room types
- Room capacity
- Price per night
- Taxes and fees
- Total stay price
- Booking conditions

## Administrator functionality

Manage:

- Hotels
- Hotel descriptions
- Hotel photographs
- Hotel amenities
- Star ratings
- Room types
- Room prices
- Room capacity
- Daily room inventory
- Hotel activation status

### Availability rules

Validate availability for every night between check-in and check-out.

Check-out must occur after check-in.

Ensure guest capacity is sufficient.

Prevent booking quantities from exceeding inventory.

Do not calculate availability using only the check-in date.

---

# 11. HOLIDAY PACKAGE MANAGEMENT

Implement predefined and customizable holiday packages.

## Customer functionality

- Browse packages
- View package details
- Select package
- Customize flights
- Customize hotels
- Choose room types
- Select travel dates
- Add passengers
- Review included services
- Review excluded services
- View discounts
- Continue to checkout

### Package pricing

Calculate:

- Flight cost
- Hotel cost
- Other configured service costs
- Taxes and fees
- Package discount
- Promotion discount
- Loyalty discount
- Final payable amount

All final pricing must be calculated on the Laravel backend.

## Administrator functionality

- Create packages
- Update packages
- Configure components
- Configure eligibility
- Configure discounts
- Configure duration
- Manage inclusions/exclusions
- Activate/deactivate packages

Prevent invalid combinations and unauthorized discount stacking.

---

# 12. MULTI-STEP BOOKING CHECKOUT

Implement a fully functional seven-step checkout.

### Step 1: Select Travel Services

Show selected flights, hotels, and packages.

Allow valid modifications.

### Step 2: Passenger and Guest Details

Collect:

- Full name
- Email where applicable
- Phone where applicable
- Passenger type
- Required travel document reference where applicable
- Guest details

Validate required fields.

### Step 3: Seat and Room Selection

Allow users to select available seats and room quantities.

Recheck availability through the backend.

### Step 4: Review Booking

Display:

- Travel services
- Passenger details
- Flight schedule
- Hotel stay
- Itemized prices
- Applicable taxes
- Booking conditions
- Cancellation policy

### Step 5: Promotions and Loyalty

Allow promotion-code validation and eligible point redemption.

Display original price, package discount, promotional discount, loyalty discount, and final amount.

### Step 6: Simulated Payment

Provide:

- Wallet payment
- Mock credit card payment

Clearly label both as simulated methods.

Do not collect or store actual card numbers or CVVs.

For mock card payments, use test payment choices or non-sensitive mock payment tokens.

Support simulated success and failure scenarios.

### Step 7: Booking Confirmation

Only after successful transactional confirmation:

- Generate booking reference
- Show confirmed booking
- Show payment receipt
- Generate itinerary
- Create notification
- Provide PDF download
- Display booking management actions

### Checkout UX requirements

- Progress indicator
- Back/Next navigation
- Validation messages
- Persistent checkout draft where appropriate
- Itemized booking summary
- Loading indicators
- Duplicate submission prevention
- Clear failure messages
- Safe retry behavior

Never display a confirmed booking until the backend has successfully completed the required booking and payment operations.

---

# 13. INVENTORY HOLDS AND CONCURRENCY

This is a critical module.

Implement a reliable inventory reservation mechanism.

### Inventory holds

Create temporary inventory holds with:

- Hold reference
- User
- Inventory type
- Inventory record
- Quantity
- Expiry time
- Status

Use a configurable hold duration, for example 10 minutes.

Implement:

- Hold creation
- Hold validation
- Hold expiration
- Hold release
- Hold consumption during confirmation
- Scheduled cleanup of expired holds

### Concurrency rules

Use MySQL InnoDB transactions and row-level locks.

Use `lockForUpdate()` where appropriate.

Lock inventory rows in a deterministic order.

For hotel reservations, lock all relevant daily inventory rows.

For seat selection, enforce uniqueness and valid seat status transitions.

For wallets and loyalty accounts, lock account balances before modification.

### Atomic booking confirmation

Within a consistent transactional workflow:

1. Validate the authenticated user.
2. Validate booking selections.
3. Validate or acquire inventory holds.
4. Lock required inventory records.
5. Recalculate prices.
6. Validate promotions and loyalty.
7. Validate payment eligibility.
8. Process simulated payment.
9. Confirm all booking components.
10. Update inventory.
11. Update wallet and loyalty records.
12. Create payment and booking records.
13. Record audit events.
14. Commit the transaction.

If any required step fails, roll back the database changes.

Use an outbox or after-commit mechanism for notifications and PDF generation so external or asynchronous side effects do not occur before a successful commit.

Use bounded retries for deadlocks where appropriate.

### Idempotency

Implement idempotency keys for booking confirmation and payment operations.

Store the key, authenticated actor, request identity, operation status, and result.

Reject conflicting reuse of an idempotency key.

Repeated identical requests must not create duplicate bookings or charges.

Write concurrency tests demonstrating that simultaneous reservations cannot exceed available inventory.

---

# 14. PAYMENT AND WALLET MANAGEMENT

Implement a simulated financial transaction system.

### Customer wallet

- View balance
- View transaction history
- View debits
- View credits
- View refunds
- View payment receipts

### Payment functionality

- Wallet payment
- Mock credit card payment
- Successful payment
- Failed payment
- Pending payment where appropriate
- Unique payment references
- Transaction history
- Payment status tracking

### Wallet rules

- Prevent negative balances
- Lock wallet records transactionally
- Prevent duplicate deductions
- Record every adjustment
- Enforce authorization
- Maintain immutable financial history

For demonstration, implement an explicitly labeled simulated wallet funding mechanism controlled by appropriate permissions and audit logging.

Do not integrate real financial services unless separately required.

---

# 15. CANCELLATION AND REFUND MANAGEMENT

Implement configurable cancellation policies.

### Customer functionality

- View cancellation eligibility
- View cancellation deadline
- View estimated cancellation fee
- View estimated refund
- Submit cancellation request
- Confirm cancellation
- Track cancellation status
- Track refund status
- View refund history

### Administrator functionality

- Manage cancellation policies
- Review cancellation exceptions
- Review refund requests
- Approve authorized exceptions
- Reject invalid requests
- Process simulated refunds
- View refund history

### Backend requirements

Implement a cancellation service that:

1. Validates booking ownership.
2. Checks booking status.
3. Loads the stored applicable policy.
4. Calculates fees.
5. Calculates refund amount.
6. Records the cancellation.
7. Updates booking and component statuses.
8. Updates inventory where applicable.
9. Adjusts loyalty points.
10. Adjusts commissions.
11. Processes eligible simulated refunds.
12. Records audit logs.
13. Creates notifications.

Support different policies for flights, hotels, and package components.

Store the cancellation and refund history.

Prevent duplicate cancellations and duplicate refunds.

Refund amounts must be calculated by the backend.

---

# 16. LOYALTY POINTS AND PROMOTIONS

Implement a complete loyalty system.

### Customer functionality

- View point balance
- View earning history
- View redemption history
- View active promotions
- Apply promotion codes
- Redeem eligible points
- View discount breakdown

### Administrator functionality

- Create promotions
- Configure seasonal offers
- Set validity periods
- Configure usage limits
- Configure discount types
- Configure eligible services
- Configure stacking rules
- Configure loyalty earning rules
- Configure redemption conversion rules

### Backend requirements

- Prevent negative point balances
- Prevent duplicate awards
- Prevent duplicate redemptions
- Enforce promotion usage limits
- Enforce expiry dates
- Enforce eligibility rules
- Adjust points after cancellation/refund
- Record loyalty transaction history

Use database transactions and locking for concurrent point redemptions.

---

# 17. TRAVEL AGENT DASHBOARD

Develop a dedicated agent portal.

### Dashboard summary cards

- Total group bookings
- Active corporate clients
- Pending approvals
- Confirmed bookings
- Cancelled bookings
- Total eligible sales
- Commission earned
- Commission pending

### Agent navigation

- Dashboard
- Corporate Clients
- Group Bookings
- Create Booking
- Booking History
- Payments
- Cancellations
- Commissions
- Reports
- Notifications
- Profile

### Corporate client management

Allow authorized agents to:

- Create corporate client records
- View assigned clients
- Update permitted client details
- View client booking history
- Manage client contacts

### Group booking management

Support:

- Multiple passengers
- Multiple guests
- Flight selections
- Hotel selections
- Group pricing
- Approval workflow
- Payment workflow
- Booking confirmation
- Group itinerary generation

### Commission management

Calculate commission using configured rates and eligible booking amounts.

Maintain:

- Commission earned
- Commission pending
- Commission adjusted
- Commission paid
- Commission history

Reverse or adjust commissions after eligible cancellations and refunds.

Agents must not access other agents' unauthorized clients or bookings.

---

# 18. ADMINISTRATOR DASHBOARD

Create a complete administrative control center.

### Dashboard KPI cards

- Total bookings
- Total revenue
- Active users
- Flight bookings
- Hotel bookings
- Package bookings
- Total refunds
- Total cancellations
- Pending approvals
- Fraud alerts
- Agent commissions
- Booking conversion indicators where measurable

### Charts using Recharts

Implement:

1. Monthly revenue comparison
2. Booking trends
3. Flight seat utilization
4. Hotel occupancy trends
5. Popular destinations
6. Booking status distribution
7. Cancellation ratios
8. Refund totals
9. Agent commission trends

Use real aggregated backend data.

### Admin navigation

- Dashboard
- Users
- Agents
- Corporate Clients
- Airlines
- Flights
- Flight Classes
- Seat Inventory
- Hotels
- Room Types
- Room Inventory
- Holiday Packages
- Bookings
- Payments
- Wallet Transactions
- Cancellations
- Refunds
- Promotions
- Loyalty Rules
- Agent Commissions
- Fraud Monitoring
- Notifications
- Reports
- Audit Logs
- System Settings
- Profile

Every relevant management page must have an Add New button and appropriate authorized CRUD operations.

Use reusable MUI tables, forms, and confirmation dialogs.

---

# 19. FRAUD DETECTION

Implement rule-based suspicious-activity monitoring.

### Detection indicators

- Repeated last-minute cancellations
- Excessive refund requests
- Duplicate account details
- Unusual booking frequency
- Repeated failed payment attempts
- Suspicious repeated booking attempts

Use configurable thresholds rather than arbitrary permanent judgments.

### Fraud flag records

Store:

- Flag type
- Reason
- User
- Booking
- Detection timestamp
- Severity or priority
- Review status
- Reviewer
- Review notes
- Review outcome

### Admin investigation interface

Allow authorized administrators to:

- View alerts
- Filter alerts
- Inspect relevant activity
- Mark under review
- Record findings
- Resolve alerts
- Mark false positives

A fraud flag must trigger investigation, not automatic proof of fraud.

Protect sensitive investigation data.

---

# 20. AUDIT LOGGING

Create a centralized audit logging service.

Record important operations including:

- Login and relevant authentication events
- User status changes
- Flight modifications
- Hotel modifications
- Package modifications
- Booking confirmation
- Payment processing
- Refund decisions
- Wallet adjustments
- Loyalty adjustments
- Commission changes
- Fraud investigations
- Report exports
- System setting changes

Each audit record should contain:

- Actor
- Action
- Target resource
- Target identifier
- Timestamp
- Relevant safe metadata
- Request context where appropriate

Never log passwords, authentication tokens, real payment credentials, or unnecessary personal data.

Restrict audit log access to authorized administrators.

Do not expose unrestricted audit-log editing or deletion endpoints.

---

# 21. DIGITAL ITINERARIES

Generate downloadable PDF itineraries.

### Required PDF information

- TravelEase branding
- Simulation notice
- Booking reference
- Booking status
- Customer details
- Passenger names
- Flight information
- Hotel information
- Travel dates
- Package details
- Itemized charges
- Payment summary
- Cancellation conditions
- Travel document checklist
- Date of issue

Use a compatible Laravel PDF-generation package.

Store private itineraries in protected storage.

Provide authorized download endpoints.

Create a print-friendly frontend itinerary page.

If PDF generation fails after booking confirmation, keep the confirmed booking intact and allow safe regeneration.

---

# 22. TRAVEL DOCUMENT CHECKLIST

Implement configurable travel document requirements.

Allow customers to view relevant checklist items, including:

- Passport
- Visa
- Identification
- Travel insurance where applicable
- Other configured documents

Allow users to mark checklist items as available or pending.

Do not claim to verify government-issued documents without an actual verification integration.

Create reminders for missing documentation.

Restrict checklist access by ownership.

---

# 23. NOTIFICATION SYSTEM

Implement in-app notifications for:

- Booking confirmation
- Payment success
- Payment failure
- Cancellation requests
- Refund completion
- Loyalty point changes
- Upcoming trips
- Check-in reminders
- Missing documents
- Simulated flight delays
- Simulated schedule changes

### Notification functionality

- Notification bell
- Unread count
- Notification dropdown
- Notification history
- Mark as read
- Mark all as read
- Scheduled reminders

Use Laravel Notifications, queues, and scheduled jobs where appropriate.

Prevent duplicate reminders using event identifiers or unique constraints.

Make simulation status visible for simulated airline-related events.

---

# 24. DATABASE DESIGN

Create normalized MySQL tables with appropriate keys, relationships, constraints, and indexes.

Implement at least the following tables:

### Identity and agents

1. users
2. agent_profiles
3. corporate_clients
4. agent_client_assignments where needed

### Flights

5. airlines
6. flights
7. flight_classes
8. flight_seats

### Hotels

9. hotels
10. hotel_images
11. amenities or equivalent normalized amenity relations
12. room_types
13. room_inventory

### Packages

14. packages
15. package_components
16. package_rules where needed

### Bookings

17. bookings
18. booking_items
19. booking_passengers
20. booking_seats
21. booking_rooms
22. booking_status_history
23. inventory_holds
24. booking_hold_items where needed

### Payments

25. payments
26. payment_attempts
27. wallets
28. wallet_transactions
29. idempotency_keys

### Promotions and loyalty

30. promotions
31. promotion_usage
32. promotion_rules
33. loyalty_accounts
34. loyalty_transactions

### Cancellation and refunds

35. cancellation_policies
36. cancellation_requests
37. refunds
38. refund_status_history

### Other services

39. reviews
40. notifications
41. notification_events
42. fraud_flags
43. agent_commissions
44. audit_logs
45. travel_documents
46. settings

Additional supporting tables may be created where necessary.

### Database design rules

- Unique user emails
- Unique booking references
- Unique payment references
- Unique transaction references
- Foreign keys
- Appropriate cascade/restrict behavior
- Indexed search fields
- Indexed dates
- Indexed statuses
- Nonnegative balance constraints
- Nonnegative inventory constraints
- Referential integrity for package components
- Immutable financial history where appropriate
- Soft deletion or deactivation for historical resources

Use separate validated foreign keys or a robust normalized association design for package components rather than relying on unchecked IDs.

Use integer minor currency units or another safe decimal-money strategy consistently.

Avoid floating-point arithmetic for financial calculations.

Use explicit timezone handling and consistent currency configuration.

---

# 25. RESTFUL API IMPLEMENTATION

Create versioned API endpoints under:

`/api/v1/`

Use Laravel controllers, Form Requests, API Resources, middleware, policies, and services.

### Authentication

```text
POST   /api/v1/register
POST   /api/v1/login
POST   /api/v1/logout
GET    /api/v1/me
PUT    /api/v1/profile
PUT    /api/v1/password
POST   /api/v1/forgot-password
POST   /api/v1/reset-password
```

### Flights

```text
GET    /api/v1/flights
GET    /api/v1/flights/{id}
GET    /api/v1/flights/{id}/availability
POST   /api/v1/admin/flights
PUT    /api/v1/admin/flights/{id}
DELETE /api/v1/admin/flights/{id}
```

### Hotels

```text
GET    /api/v1/hotels
GET    /api/v1/hotels/{id}
GET    /api/v1/hotels/{id}/availability
POST   /api/v1/admin/hotels
PUT    /api/v1/admin/hotels/{id}
DELETE /api/v1/admin/hotels/{id}
```

### Packages

```text
GET    /api/v1/packages
GET    /api/v1/packages/{id}
POST   /api/v1/packages/quote
POST   /api/v1/admin/packages
PUT    /api/v1/admin/packages/{id}
DELETE /api/v1/admin/packages/{id}
```

### Booking and checkout

```text
POST   /api/v1/checkout/quote
POST   /api/v1/checkout/holds
DELETE /api/v1/checkout/holds/{id}
POST   /api/v1/checkout/confirm

GET    /api/v1/bookings
GET    /api/v1/bookings/{id}
GET    /api/v1/bookings/{id}/itinerary
GET    /api/v1/bookings/{id}/itinerary/pdf
```

### Payments and wallets

```text
GET    /api/v1/wallet
GET    /api/v1/wallet/transactions
GET    /api/v1/payments
GET    /api/v1/payments/{id}
GET    /api/v1/payments/{id}/receipt
```

### Cancellations and refunds

```text
POST   /api/v1/bookings/{id}/cancellation-quote
POST   /api/v1/bookings/{id}/cancel
GET    /api/v1/refunds
GET    /api/v1/refunds/{id}
```

### Loyalty and promotions

```text
GET    /api/v1/loyalty
GET    /api/v1/loyalty/transactions
GET    /api/v1/promotions
POST   /api/v1/promotions/validate
```

### Agent endpoints

```text
GET    /api/v1/agent/dashboard
GET    /api/v1/agent/clients
POST   /api/v1/agent/clients
GET    /api/v1/agent/bookings
POST   /api/v1/agent/group-bookings
GET    /api/v1/agent/commissions
GET    /api/v1/agent/reports
```

### Admin endpoints

```text
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/bookings
GET    /api/v1/admin/payments
GET    /api/v1/admin/refunds
GET    /api/v1/admin/fraud-flags
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/settings
GET    /api/v1/admin/reports
```

### Reporting

```text
GET /api/v1/admin/reports/revenue
GET /api/v1/admin/reports/bookings
GET /api/v1/admin/reports/flights
GET /api/v1/admin/reports/hotels
GET /api/v1/admin/reports/destinations
GET /api/v1/admin/reports/cancellations
GET /api/v1/admin/reports/refunds
GET /api/v1/admin/reports/commissions
GET /api/v1/admin/reports/export
```

Add all other endpoints required to complete the functionality.

Follow consistent naming conventions and REST principles.

### API responses

Use consistent JSON structures for:

- Success responses
- Validation errors
- Authentication errors
- Authorization errors
- Missing resources
- Inventory conflicts
- Payment failures
- Idempotency conflicts
- Server errors

Use appropriate HTTP status codes.

Implement server-side pagination for large datasets.

Document endpoints, request bodies, response examples, authentication requirements, and error codes.

---

# 26. FRONTEND API INTEGRATION

Create a centralized Axios client.

Implement service modules such as:

```text
authService.js
flightService.js
hotelService.js
packageService.js
bookingService.js
checkoutService.js
paymentService.js
walletService.js
refundService.js
loyaltyService.js
promotionService.js
agentService.js
adminService.js
reportService.js
notificationService.js
```

### Integration rules

Every frontend action must connect to the appropriate Laravel API.

Implement:

- Request loading states
- Validation feedback
- Authentication expiry handling
- Authorization error handling
- Network error handling
- Success notifications
- Query parameter handling
- Pagination integration
- File upload support
- Secure PDF downloads

Avoid duplicate API calls where possible.

Use reusable hooks for shared logic.

Do not use hardcoded statistics or static frontend booking records as substitutes for backend data.

---

# 27. REPORTS AND ANALYTICS

Implement the following reports:

1. Booking Performance
2. Revenue Analysis
3. Flight Occupancy
4. Hotel Occupancy
5. Popular Destinations
6. Cancellation Analysis
7. Refund Summary
8. Loyalty Program
9. Agent Commission
10. Fraud Monitoring

### Filtering

Support applicable filters for:

- Start date
- End date
- Destination
- Booking type
- Booking status
- Agent
- Hotel
- Airline
- Payment status

### Export functionality

Support:

- CSV export
- PDF export

Exported data must reflect the selected filters.

Revenue reports must distinguish:

- Successful payments
- Pending payments
- Failed payments
- Cancelled transactions
- Refunded amounts
- Net revenue

Avoid double-counting payments, refunds, or combined package components.

Use backend aggregation queries and Recharts visualizations.

---

# 28. IMAGE UPLOAD REQUIREMENTS

Support image upload for:

- Airline logos
- Hotel photographs
- Package photographs
- Other appropriate travel content

### Validation

- JPEG only
- PNG only
- Maximum 2 MB
- Validate actual file content
- Generate safe filenames
- Prevent executable uploads
- Display upload preview
- Display validation errors
- Handle replacement and removal safely

Public marketing images may use controlled public storage.

Private documents must remain in protected storage.

---

# 29. SECURITY REQUIREMENTS

Implement:

- Secure password hashing
- Laravel Sanctum authentication
- Role-based authorization
- Record ownership policies
- CSRF protection where applicable
- Secure CORS configuration
- Login throttling
- Server-side validation
- Safe file uploads
- SQL injection protection
- XSS protection
- Secure error handling
- HTTPS-ready deployment
- Secure cookies
- Audit logging
- Database transactions
- Idempotency
- Safe status transitions
- Protected private files

Never trust frontend-provided prices, inventory quantities, wallet balances, loyalty balances, or refund amounts.

Never expose raw SQL errors or sensitive exception details to customers.

---

# 30. DATABASE SEEDERS AND DEMO DATA

Create realistic demonstration data.

Include:

- 1 administrator
- 3 travel agents
- 10 customers
- 5 airlines
- 20 flights
- Multiple flight classes
- Seat inventory
- 10 hotels
- Multiple room types per hotel
- Daily room inventory
- 8 holiday packages
- 5 promotions
- Sample corporate clients
- Sample bookings
- Sample payments
- Sample refunds
- Sample loyalty transactions
- Sample notifications
- Sample commission records
- Sample fraud flags
- Sample audit records

Include realistic destinations such as Kigali, Nairobi, Entebbe, Dar es Salaam, Dubai, Paris, and London where appropriate.

Seed coherent schedules, currencies, availability, and prices.

Create sample data that supports meaningful charts and reports.

Provide demo account creation instructions without committing real passwords or credentials.

Use local-only demo credentials documented separately and require secure configuration for deployment.

---

# 31. TESTING REQUIREMENTS

Write automated tests for critical functionality.

### Authentication tests

- Successful registration
- Invalid registration
- Successful login
- Invalid login
- Password validation
- Unauthorized API access
- Role-based access denial
- Deactivated account restrictions

### Flight tests

- Flight search
- Flight filtering
- Seat availability
- Successful reservation
- Insufficient inventory
- Concurrent seat booking

### Hotel tests

- Hotel search
- Date validation
- Room capacity validation
- Full-stay availability
- Concurrent room booking
- Inventory restoration

### Package tests

- Package customization
- Eligibility validation
- Correct pricing
- Atomic multi-component confirmation
- Rollback on unavailable components

### Payment tests

- Successful mock payment
- Failed mock payment
- Insufficient wallet balance
- Duplicate payment prevention
- Concurrent wallet deductions

### Cancellation and refund tests

- Eligible cancellation
- Ineligible cancellation
- Correct cancellation fee
- Correct refund
- Duplicate refund prevention
- Wallet refund adjustment
- Inventory restoration
- Loyalty reversal

### Agent tests

- Authorized group booking
- Unauthorized client access
- Commission calculation
- Commission adjustment

### Security tests

- Customer accessing another customer's booking
- Agent accessing another agent's clients
- Unauthorized admin endpoint access
- Invalid status transitions
- Invalid file uploads
- Tampered frontend prices
- Expired inventory holds
- Repeated idempotent requests

Use the actual MySQL database engine for concurrency and locking integration tests.

Do not rely exclusively on SQLite for tests that verify MySQL row-locking behavior.

Run available tests and fix failures.

Record commands and results in the testing documentation.

---

# 32. DEVELOPMENT PHASES

Develop the system in the following order.

## PHASE 1 — PROJECT INITIALIZATION

- Inspect workspace
- Initialize Laravel
- Initialize React with Vite
- Install dependencies
- Configure MySQL
- Configure CORS and Sanctum
- Configure MUI
- Create directory structure
- Configure environment examples
- Initialize documentation
- Verify frontend and backend startup

## PHASE 2 — DATABASE DESIGN

- Create migrations
- Create relationships
- Create indexes and constraints
- Create Eloquent models
- Create factories
- Create seeders
- Run migrations
- Verify database relationships

## PHASE 3 — AUTHENTICATION

- Registration
- Login
- Logout
- Password management
- Profile management
- Roles
- Policies
- Protected routes
- Session handling
- Authentication tests

## PHASE 4 — PUBLIC WEBSITE AND DASHBOARDS

- Homepage
- Public navigation
- Flight search UI
- Hotel search UI
- Package browsing UI
- Customer dashboard
- Agent dashboard
- Admin dashboard
- Responsive layouts
- Dark/light mode

## PHASE 5 — FLIGHTS

- Airline CRUD
- Flight CRUD
- Flight classes
- Seat inventory
- Flight search
- Seat selection
- Availability APIs
- Flight tests

## PHASE 6 — HOTELS

- Hotel CRUD
- Hotel images
- Amenities
- Room types
- Daily inventory
- Hotel search
- Availability checks
- Hotel tests

## PHASE 7 — HOLIDAY PACKAGES

- Package CRUD
- Package components
- Package customization
- Eligibility validation
- Discount rules
- Package pricing
- Package tests

## PHASE 8 — BOOKING AND CHECKOUT

- Seven-step checkout
- Passenger details
- Seat and room selection
- Inventory holds
- Server-side pricing
- Booking confirmation
- Unique booking references
- Concurrency protection
- Booking tests

## PHASE 9 — PAYMENTS AND WALLETS

- Wallet accounts
- Wallet transactions
- Mock card payments
- Payment receipts
- Idempotency
- Payment status tracking
- Payment tests

## PHASE 10 — CANCELLATIONS AND REFUNDS

- Cancellation policies
- Cancellation requests
- Refund calculations
- Refund processing
- Wallet adjustments
- Inventory restoration
- Loyalty corrections
- Refund tests

## PHASE 11 — LOYALTY AND PROMOTIONS

- Loyalty accounts
- Point earning
- Point redemption
- Promotion management
- Seasonal offers
- Usage limits
- Stacking rules
- Loyalty tests

## PHASE 12 — AGENT FUNCTIONALITY

- Corporate clients
- Group bookings
- Approval workflows
- Agent permissions
- Commission calculations
- Commission reports
- Agent tests

## PHASE 13 — ITINERARIES AND NOTIFICATIONS

- PDF generation
- Protected downloads
- Travel document checklists
- In-app notifications
- Scheduled reminders
- Simulated flight alerts
- Notification tests

## PHASE 14 — FRAUD AND AUDITING

- Fraud detection rules
- Fraud flags
- Investigation workflow
- Audit logging
- Admin monitoring interface
- Security tests

## PHASE 15 — REPORTING

- Dashboard aggregation APIs
- Recharts charts
- Booking reports
- Revenue reports
- Occupancy reports
- Cancellation reports
- Refund reports
- Agent commission reports
- CSV export
- PDF export

## PHASE 16 — INTEGRATION AND UI POLISH

- Connect all frontend actions
- Verify complete workflows
- Improve responsiveness
- Improve accessibility
- Improve loading states
- Improve empty states
- Improve error handling
- Remove unused code
- Resolve integration defects

## PHASE 17 — FINAL TESTING

- Run migrations
- Run seeders
- Run backend tests
- Run frontend tests
- Run production build
- Run concurrency tests
- Verify authorization
- Verify downloads
- Verify exports
- Test customer workflows
- Test agent workflows
- Test administrator workflows

## PHASE 18 — FINAL DELIVERABLES

Prepare:

1. Complete React frontend source code
2. Complete Laravel backend source code
3. MySQL migrations and seeders
4. MySQL database export with sample data
5. API documentation
6. Database ERD
7. System architecture documentation
8. Setup and installation guide
9. User guide
10. Testing report
11. At least five genuine application screenshots
12. Final implementation status report

Generate the setup and user guide in PDF or DOCX format using available document-generation tools.

Do not fabricate screenshots or test results.

---

# 33. DOCUMENTATION REQUIREMENTS

Create and maintain:

`docs/requirements-checklist.md`

Map every requirement to its implementation status.

`docs/implementation-progress.md`

Track completed, partially completed, blocked, and pending modules.

`docs/architecture.md`

Explain frontend, backend, API, database, and background processing architecture.

`docs/database-design.md`

Explain tables, keys, relationships, constraints, and inventory management.

`docs/api-documentation.md`

Document every implemented endpoint.

`docs/security.md`

Explain authentication, authorization, transaction security, and privacy controls.

`docs/testing.md`

Record test coverage, executed commands, results, and known failures.

`docs/setup-guide.md`

Provide exact installation and configuration instructions.

`docs/user-guide.md`

Explain how customers, agents, and administrators use the system.

---

# 34. COMPLETION CRITERIA

The project is complete only when:

- React frontend starts successfully.
- Laravel backend starts successfully.
- MySQL connection works.
- Migrations execute successfully.
- Seeders populate the database.
- Authentication works.
- Customer dashboard works.
- Agent dashboard works.
- Admin dashboard works.
- Flight management works.
- Hotel management works.
- Package management works.
- Booking checkout works.
- Inventory protection works.
- Mock payment processing works.
- Wallet transactions work.
- Cancellation and refund processing works.
- Loyalty and promotions work.
- Group booking works.
- Agent commission tracking works.
- PDF itineraries work.
- Notifications work.
- Fraud monitoring works.
- Audit logging works.
- Reports and exports work.
- Role-based permissions work.
- Responsive layouts work.
- Dark/light mode works.
- Critical automated tests pass.
- Documentation is complete.
- Final deliverables are generated.

A visually complete interface without functioning APIs and database operations does not satisfy completion.

A functioning API without a usable integrated frontend also does not satisfy completion.

---

# 35. CONTINUATION AND PROGRESS MANAGEMENT

Because this project is large, implement it incrementally.

At the end of each development phase:

1. Summarize actual files created or modified.
2. State which requirements are implemented.
3. Run relevant verification commands.
4. Record passed and failed tests.
5. Identify unresolved errors.
6. Fix blocking errors before dependent work.
7. Update `docs/implementation-progress.md`.
8. Identify the next incomplete phase.
9. Continue implementation while execution time and context permit.

If execution must stop because of tool limits, environment restrictions, or required user input, document the exact stopping point and the commands needed to resume.

Do not report unfinished work as completed.

Do not delete or recreate working modules merely to continue development.

---

# 36. FINAL INSTRUCTION — START DEVELOPMENT NOW

Begin by inspecting the current workspace.

If no TravelEase project exists:

1. Create the TravelEase root directory.
2. Initialize Laravel in `travelease/`.
3. Initialize React with Vite in `travelease-frontend/`.
4. Install and configure required dependencies.
5. Create the initial database architecture.
6. Configure secure React–Laravel API communication.
7. Implement authentication and role management.
8. Build the first working dashboard interfaces.
9. Continue through the remaining phases.

If TravelEase already exists:

1. Read the source code.
2. Read existing documentation.
3. Identify completed and missing requirements.
4. Repair blocking defects.
5. Continue from the next incomplete phase.

**Your ultimate objective is to deliver TravelEase as a fully integrated, functional, secure, responsive, database-driven travel booking and management system that satisfies the complete assignment requirements.**

Start implementation immediately. Do not stop after writing a plan or generating UI mockups.