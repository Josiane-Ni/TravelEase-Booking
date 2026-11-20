# TRAVELEASE — PIXEL-ACCURATE FRONTEND DEVELOPMENT PROMPT FOR CODEX

## ROLE AND OBJECTIVE

You are an expert React.js frontend engineer, Material UI specialist, professional UI/UX designer, and full-stack integration engineer.

Your task is to implement the TravelEase frontend to match the five provided reference screenshots as closely as technically possible.

This is a **visual reproduction and functional implementation task**, not an opportunity to redesign the interface.

The screenshots represent the approved visual design.

Your job is to transform them into real, responsive, accessible, reusable, production-quality React components.

## 1. READ THE DESIGN REFERENCES FIRST

Locate these screenshots in the project:

```text
design-references/
├── customer-dashboard.png
├── agent-dashboard.png
├── admin-dashboard.png
├── login-page.png
└── register-page.png
```

Inspect all five images carefully before writing code.

Create a detailed visual specification documenting:

- Overall layout dimensions and proportions
- Sidebar width and alignment
- Header height
- Card arrangement
- Typography and font weights
- Background colors
- Gradients
- Border radius
- Shadows
- Icon sizes and colors
- Button dimensions
- Form field spacing
- Chart arrangement
- Table structure
- Image positioning
- Section spacing
- Responsive behavior

Use the screenshots as the source of truth for the visual appearance.

Do not substitute a generic Material UI dashboard template.

Do not change the approved visual identity.

Preserve the existing Laravel backend and functional React code wherever possible.

---

# 2. REQUIRED TECHNOLOGY STACK

Use:

- React.js with Vite
- Material UI
- React Router
- Axios
- Recharts
- Material UI Icons or Lucide React
- React Hook Form
- Yup or Zod
- MUI Data Grid
- CSS Modules or MUI styled components
- Context API for authentication and theme state

Use the existing project dependencies where compatible.

Do not introduce Tailwind, Bootstrap, or a different UI framework.

---

# 3. GLOBAL DESIGN SYSTEM

Create a centralized TravelEase design system.

### Colors

```css
:root {
  --primary-navy: #0B1F3A;
  --sidebar-dark: #10233F;
  --sidebar-deep: #09182F;
  --primary-blue: #0866D8;
  --active-blue: #287DF0;
  --bright-blue: #1479F5;
  --accent-orange: #FF8A24;

  --background-light: #F3F7FD;
  --surface-white: #FFFFFF;
  --border-light: #E1E8F2;

  --text-primary: #14213D;
  --text-secondary: #64748B;

  --success: #16A34A;
  --warning: #F59E0B;
  --danger: #EF4444;
  --purple: #8B3DFF;
  --pink: #E83E8C;

  --card-radius: 12px;
  --button-radius: 7px;
}
```

These are starting approximations. Refine the exact values against the screenshots.

### Typography

Use Inter or a visually equivalent sans-serif font.

Maintain:

- Bold dashboard headings
- Compact sidebar labels
- Clear KPI values
- Smaller descriptive text
- Consistent button labels
- Readable form labels

### Visual principles

- White cards over pale blue-gray backgrounds
- Dark navy sidebars
- Bright blue active navigation
- Compact, professional dashboards
- Rounded rectangular cards
- Subtle shadows
- Thin borders
- Consistent iconography
- Clear visual hierarchy
- Clean spacing
- Attractive travel photography

Avoid excessive animations, oversized cards, unrelated decorative elements, and unnecessary whitespace.

---

# 4. LOGIN PAGE — EXACT VISUAL REPRODUCTION

Reference: `design-references/login-page.png`

Route: `/login`

Create the login page with the same two-column split layout as the screenshot.

## Left section — Travel image panel

The left panel occupies approximately 44% of the desktop layout.

Use a high-quality photograph of tropical overwater villas, turquoise ocean, and a sunset sky, visually matching the reference.

Apply a subtle dark-blue gradient overlay for text readability.

Place the following heading near the upper-left:

**Explore  
The World  
with TravelEase**

Below the heading, add a short orange underline.

Display the subtitle:

"Book flights, hotels, and holiday packages all in one place."

At the lower-left, display four features with white icons:

- Flight Bookings
- Hotel Reservations
- Holiday Packages
- Safe & Secure Booking

Use airplane, bed, suitcase, and shield-check icons.

Preserve the screenshot's positioning, vertical spacing, and typography.

## Right section — Login form

Use a white background.

Center the login form vertically and horizontally within the right section.

At the top, display the TravelEase logo:

- Stylized blue airplane symbol
- Blue "Travel"
- Orange "Ease"

Under the logo:

"Book Flights • Hotels • Packages"

Then display:

**Welcome Back**

"Login to your TravelEase account"

### Form fields

1. Email address
2. Password

Email field:

- Leading mail icon
- Rounded outlined input
- Placeholder: "Enter your email"

Password field:

- Leading lock icon
- Trailing eye icon
- Show/hide password functionality
- Placeholder: "Enter your password"

Below the inputs:

- Remember me checkbox
- Forgot Password? link

### Login button

Create a full-width blue-to-indigo gradient button.

Label:

"Login"

Include a login icon.

Use the same height, border radius, gradient, and typography as the reference.

### Social authentication section

Display a horizontal divider with:

"or login with"

Below it, place two equal-width buttons:

- Google
- Apple

Use recognizable icons.

Only activate these login methods if their secure backend authentication flows are implemented. Otherwise, hide or clearly disable them; do not simulate successful authentication.

### Bottom navigation

Display:

"Don't have an account? Register Now"

The Register Now link navigates to `/register`.

### Additional functionality

- Required-field validation
- Email-format validation
- Password visibility
- Loading state
- API error messages
- Invalid credentials feedback
- Successful role-based redirects
- Keyboard accessibility
- Dark/light mode toggle in the top-right

### Role-based redirects

Customer → `/customer/dashboard`

Agent → `/agent/dashboard`

Admin → `/admin/dashboard`

The backend must determine the authenticated role.

Never trust a role selected or modified on the frontend.

---

# 5. REGISTRATION PAGE — EXACT VISUAL REPRODUCTION

Reference: `design-references/register-page.png`

Route: `/register`

Use the same overall visual structure as the login page.

## Left section

Display a mountain landscape at sunrise with a traveler standing on a rocky viewpoint.

Use a subtle blue gradient overlay.

Display:

**Start Your  
Travel Journey  
with TravelEase**

Add the short orange underline.

Near the bottom, display:

- Exclusive Deals & Promotions
- Earn Loyalty Points
- Quick & Easy Booking

Use gift, star, and lightning icons.

Match the screenshot's icon circles, spacing, and alignment.

## Right section

Display the TravelEase logo and subtitle at the top.

Heading:

**Create an Account**

Subtitle:

"Join TravelEase and start your next journey"

### Registration fields

First row:

- Full Name
- Phone Number

Use two equal-width inputs on desktop.

Second row:

- Email Address

Third row:

- Password

Fourth row:

- Confirm Password

All fields must have appropriate icons.

Both password fields must support show/hide controls.

### Password requirements

Display a light-blue information box containing:

"Password must contain at least 8 characters, one uppercase letter, one number, and one special character."

Validate the password on both frontend and backend.

Display useful field-level errors.

### Terms agreement

Add a checkbox:

"I agree to the Terms & Conditions and Privacy Policy"

Both links must navigate to their corresponding pages.

Require agreement before registration.

### Registration button

Create a full-width blue-to-indigo gradient button.

Label:

"Register"

Include a user-add icon.

### Bottom navigation

Display:

"Already have an account? Login Here"

Link to `/login`.

### Registration rules

- Public registration creates Customer accounts only.
- Validate unique email addresses.
- Validate password confirmation.
- Show Laravel validation errors.
- Show a loading indicator while submitting.
- Display success feedback.
- Redirect according to the configured registration/authentication flow.
- Never create an admin or agent account through public registration.

### Responsive design

On mobile:

- Hide or compact the image panel.
- Keep the logo visible.
- Stack Full Name and Phone Number vertically.
- Make inputs and buttons full width.
- Keep the form scrollable.
- Preserve the original color identity.

---

# 6. SHARED DASHBOARD LAYOUT

Create a reusable dashboard layout for all three roles.

Reference screenshots:

- `customer-dashboard.png`
- `agent-dashboard.png`
- `admin-dashboard.png`

## Desktop structure

Use a fixed or sticky left sidebar and a flexible main content area.

### Sidebar

- Dark navy gradient background
- TravelEase logo at the top
- White navigation icons
- White or muted navigation text
- Blue highlighted active menu
- Rounded active-menu background
- Consistent item spacing
- Notification count badges
- Dark/light mode toggle at the bottom

Suggested desktop sidebar width: approximately 240–260px, refined to match the reference proportions.

### Header

Use a slim white header.

Include:

- Global search input
- Search icon
- Notification bell
- Unread notification badge
- User avatar
- User name
- User role
- Profile dropdown

Header actions must work.

### Main content

Use:

- Pale blue-gray background
- Compact content padding
- Responsive CSS Grid
- Rounded white cards
- Consistent spacing
- Appropriate shadows
- Data-driven content

Do not create three completely unrelated dashboard designs.

Use shared layout and card components while preserving the different information arrangements in each screenshot.

---

# 7. CUSTOMER DASHBOARD

Reference: `design-references/customer-dashboard.png`

Route: `/customer/dashboard`

Recreate the dashboard's exact section hierarchy.

## Sidebar navigation

Display:

1. Dashboard
2. Book Flights
3. Book Hotels
4. Holiday Packages
5. My Bookings
6. Wallet
7. Loyalty Points
8. Notifications
9. Travel Documents
10. Profile
11. Settings

Use icons matching the screenshot.

## Top section

### Welcome banner

Create a wide tropical travel banner.

Use a beautiful beach/ocean image with a blue overlay.

Display:

"Welcome Back, [Customer Name]! 👋"

"Plan, book, and manage your trips all in one place."

Use the authenticated customer's actual name.

### Wallet and Loyalty card

Place it to the right of the welcome banner.

Display:

- Wallet Balance
- Loyalty Points
- Top Up button
- Redeem button

Separate wallet and loyalty information with a vertical divider.

Use blue wallet and gold star icons.

The buttons must open the appropriate real workflows.

## Quick action buttons

Create four horizontally arranged cards:

- Book a Flight
- Book a Hotel
- Explore Packages
- View My Bookings

Use blue, purple, pink, and corresponding colored icons.

Each card must navigate to the appropriate page.

## KPI summary cards

Display six compact cards:

1. Total Bookings
2. Upcoming Trips
3. Completed Trips
4. Pending Payments
5. Cancelled Bookings
6. Pending Refunds

Use colored circular icon backgrounds.

Display real values from the Laravel API.

## Main content area

Create three major sections matching the screenshot.

### Upcoming Trips

Display travel cards containing:

- Destination image
- Trip name
- Booking reference
- Travel dates
- Booking status
- View button
- Itinerary button
- Cancel button when eligible

Actions must work.

### Recent Wallet Transactions

Display:

- Transaction icon
- Transaction type
- Reference
- Date and time
- Amount
- Positive or negative color

Use green for credits and red for debits.

### Notifications

Display:

- Notification icon
- Notification title
- Short message
- Relative time
- View All link

### Travel Checklist

Display:

- Trip name
- Completion percentage
- Progress bar
- Required documents
- Checkboxes
- Missing document indicators

Checklist changes must persist through the backend.

## Layout

On desktop:

- Welcome banner occupies the larger left portion.
- Wallet and loyalty card occupies the right portion.
- Quick actions span the main content width.
- KPI cards form a compact row.
- Upcoming trips occupy the larger lower-left area.
- Wallet transactions occupy the center.
- Notifications and checklist stack on the right.

Match the screenshot's visual density and card alignment.

---

# 8. TRAVEL AGENT DASHBOARD

Reference: `design-references/agent-dashboard.png`

Route: `/agent/dashboard`

## Sidebar navigation

Display:

- Dashboard
- Corporate Clients
- Group Bookings
- Bookings
- Commissions
- Payments
- Reports
- Notifications
- Profile
- Settings

## Header content

Heading:

**Agent Dashboard**

Subtitle:

"Manage corporate clients, group bookings, and your commissions."

Place a date-range selector on the right.

Default selection:

"Last 30 Days"

## KPI cards

Create six compact cards:

1. Group Bookings
2. Corporate Clients
3. Pending Approvals
4. Confirmed Bookings
5. Eligible Sales
6. Commission Earned

Use matching blue, red, green, and orange icons.

Use real API values.

## Charts

### Booking Trend

Create a Recharts line chart.

- Months on horizontal axis
- Booking counts on vertical axis
- Blue line
- Subtle blue area fill
- Responsive tooltip

### Bookings by Type

Create a donut chart.

Display:

- Flights
- Hotels
- Packages

Show total bookings in the center.

Use blue, green, and orange chart colors.

## Bottom section

### Recent Group Bookings

Create a compact table with:

- Reference
- Corporate Client
- Travel Date
- Amount
- Status

Use colored status indicators.

Add a View All link.

### Commission Summary

Display:

- Commission earned
- Reporting period
- Change from previous period
- Commission icon
- Small date-range selector

## Functional requirements

- Date filter updates dashboard metrics.
- Charts load from Laravel.
- Corporate client navigation works.
- Group booking links work.
- Commission reports work.
- Unauthorized records remain inaccessible.

---

# 9. ADMINISTRATOR DASHBOARD

Reference: `design-references/admin-dashboard.png`

Route: `/admin/dashboard`

## Sidebar navigation

Display:

- Dashboard
- Users
- Agents
- Corporate Clients
- Flights
- Hotels
- Packages
- Bookings
- Payments
- Cancellations & Refunds
- Promotions
- Loyalty Program
- Fraud Monitoring
- Reports
- Audit Logs
- System Settings

## Dashboard heading

**Administrator Dashboard**

Subtitle:

"System overview, bookings, revenue, and operational insights."

Place a date-range selector at the top-right.

## KPI summary

Create eight compact KPI cards:

1. Total Bookings
2. Total Revenue
3. Active Users
4. Flight Bookings
5. Hotel Bookings
6. Package Bookings
7. Total Refunds
8. Cancellations

Use small colored icons matching the reference.

Display values retrieved from Laravel.

## Analytics charts

### Monthly Revenue Comparison

Create a grouped bar chart.

Compare:

- This Year
- Last Year

Use two shades of blue.

Display month labels and formatted currency values.

### Hotel Occupancy Trend

Create a purple line chart.

Display occupancy percentages over time.

Use a light-purple filled area and grid lines.

## Bottom analytics section

### Popular Destinations

Create a compact table:

- Rank
- Destination
- Bookings

Use real aggregated booking data.

### Booking Status Distribution

Create a donut chart showing:

- Confirmed
- Pending
- Cancelled
- Refunded

Display total bookings in the center.

Use green, orange, red, and blue colors.

### Quick Actions

Create four buttons:

- Add New Flight
- Add New Hotel
- Create Package
- Generate Report

Use matching icons.

Each button must navigate to the correct form or workflow.

## Additional requirements

- Date filters update all relevant metrics.
- Chart tooltips work.
- Empty datasets are handled.
- Report values are calculated on the backend.
- Financial values distinguish successful payments from refunds.
- All administrative actions require backend authorization.

---

# 10. REUSABLE COMPONENTS

Build reusable components such as:

```text
components/
├── common/
│   ├── AppLogo.jsx
│   ├── LoadingSpinner.jsx
│   ├── EmptyState.jsx
│   ├── ErrorState.jsx
│   ├── StatusBadge.jsx
│   ├── ConfirmDialog.jsx
│   └── PageHeader.jsx
│
├── auth/
│   ├── AuthLayout.jsx
│   ├── AuthImagePanel.jsx
│   ├── PasswordField.jsx
│   └── AuthFormHeader.jsx
│
├── dashboard/
│   ├── DashboardSidebar.jsx
│   ├── DashboardHeader.jsx
│   ├── MetricCard.jsx
│   ├── QuickActionCard.jsx
│   ├── WelcomeBanner.jsx
│   ├── WalletLoyaltyCard.jsx
│   ├── TripCard.jsx
│   ├── NotificationCard.jsx
│   ├── TravelChecklist.jsx
│   └── DateRangeFilter.jsx
│
├── charts/
│   ├── RevenueChart.jsx
│   ├── BookingTrendChart.jsx
│   ├── OccupancyChart.jsx
│   └── BookingDistributionChart.jsx
│
└── tables/
    ├── RecentBookingsTable.jsx
    └── PopularDestinationsTable.jsx
```

Do not duplicate large blocks of code across dashboards.

Use shared components configured through props.

---

# 11. RESPONSIVE DESIGN

Implement responsive behavior at common viewport widths.

### Desktop

- Full sidebar
- Full dashboard grid
- Multiple KPI cards per row
- Side-by-side charts
- Split authentication pages

### Tablet

- Collapsible sidebar
- Reduced grid columns
- Resized charts
- Responsive tables
- Adjusted card spacing

### Mobile

- Drawer navigation
- Full-width content
- Stacked cards
- Responsive charts
- Scrollable tables where necessary
- Compact header
- Single-column forms
- Touch-friendly controls

Prevent horizontal page overflow.

Use MUI breakpoints and responsive CSS Grid.

Preserve the visual identity across all screen sizes.

---

# 12. DARK MODE

Implement a functional dark/light toggle on all five pages.

### Light mode

Match the supplied screenshots.

### Dark mode

Use:

- Dark navy backgrounds
- Dark card surfaces
- Light text
- Blue accents
- Accessible borders
- Readable charts

Persist the selected theme in local storage.

Use MUI ThemeProvider and CssBaseline.

Do not implement dark mode by simply inverting colors.

---

# 13. BACKEND INTEGRATION

Inspect the existing Laravel API before integrating the frontend.

Use real endpoints for:

- Login
- Registration
- Current user
- Logout
- Customer dashboard
- Agent dashboard
- Admin dashboard
- Wallet balance
- Loyalty points
- Booking summaries
- Upcoming trips
- Notifications
- Travel checklist
- Agent commissions
- Revenue charts
- Booking trends
- Occupancy charts
- Popular destinations

If a required endpoint does not exist, implement it in the Laravel backend using the established architecture.

Do not modify the backend unnecessarily.

### Important

Do not hardcode the example numbers shown in the screenshots.

Those values are illustrative visual content.

Use actual database data.

When the database is empty, show a professional empty state rather than invented statistics.

---

# 14. INTERACTION REQUIREMENTS

Every visible interactive element must have real behavior.

This includes:

- Login button
- Register button
- Password visibility
- Remember me
- Forgot password
- Theme toggle
- Sidebar links
- Header search
- Notification bell
- Profile menu
- Logout
- Quick action cards
- Date filters
- Booking details
- Itinerary downloads
- Cancellation actions
- Wallet actions
- Loyalty redemption
- Agent report links
- Admin quick actions

Do not create decorative buttons that do nothing.

If a feature is not yet supported, implement its necessary workflow or display an accurate disabled state with a meaningful explanation.

---

# 15. VISUAL ACCURACY AND QUALITY ASSURANCE

After implementing each page:

1. Run the React application.
2. Capture a screenshot at the same viewport dimensions as its reference image.
3. Compare the screenshot against the reference.
4. Check overall layout and proportions.
5. Check sidebar width.
6. Check header height.
7. Check card sizes.
8. Check colors and gradients.
9. Check font sizes and weights.
10. Check icon alignment.
11. Check spacing.
12. Check image crops.
13. Check chart positions.
14. Check button dimensions.
15. Correct visible differences.

Use screenshot comparison or browser automation tools if available.

Aim for the closest possible reproduction without sacrificing accessibility, responsiveness, or functionality.

Do not claim 100% pixel accuracy without an actual visual comparison.

---

# 16. IMPLEMENTATION ORDER

Follow this order:

### Phase 1: Design foundation

- Inspect screenshots
- Inspect existing code
- Create MUI theme
- Create shared components
- Create responsive layout foundation

### Phase 2: Authentication pages

- Implement Login
- Implement Registration
- Implement validation
- Integrate Laravel authentication
- Verify responsive layout

### Phase 3: Customer Dashboard

- Implement sidebar and header
- Implement welcome banner
- Implement wallet/loyalty card
- Implement quick actions
- Implement KPI cards
- Implement trips, transactions, notifications, and checklist
- Integrate APIs

### Phase 4: Agent Dashboard

- Implement agent navigation
- Implement KPI cards
- Implement charts
- Implement group bookings table
- Implement commission summary
- Integrate APIs

### Phase 5: Admin Dashboard

- Implement admin navigation
- Implement KPI cards
- Implement revenue chart
- Implement occupancy chart
- Implement destination table
- Implement booking status chart
- Implement quick actions
- Integrate APIs

### Phase 6: Responsive and dark mode

- Desktop verification
- Tablet verification
- Mobile verification
- Dark mode verification

### Phase 7: Final testing

- Verify navigation
- Verify authentication
- Verify role redirects
- Verify API integration
- Verify all interactive elements
- Run frontend build
- Run relevant backend tests
- Fix errors
- Compare screenshots

---

# 17. DOCUMENTATION

Create or update:

- `docs/frontend-design-specification.md`
- `docs/frontend-implementation-progress.md`
- `docs/frontend-components.md`
- `docs/frontend-testing.md`

Document:

- Completed pages
- Implemented components
- API integrations
- Responsive behavior
- Visual comparison results
- Remaining issues
- Testing outcomes

---

# 18. FINAL INSTRUCTIONS

Start by inspecting the five reference images and the existing TravelEase project.

Recreate the Login, Registration, Customer Dashboard, Agent Dashboard, and Administrator Dashboard with the closest possible visual match to the screenshots.

Maintain the exact visual direction:

- Dark navy sidebar
- Bright blue active navigation
- White dashboard cards
- Pale blue-gray backgrounds
- Colorful icons
- Compact analytics
- Professional travel imagery
- Blue/indigo authentication buttons
- Consistent TravelEase branding

Do not redesign these pages.

Do not replace them with generic templates.

Do not hardcode dashboard data.

Do not break existing backend functionality.

Implement working React components and connect them to Laravel REST APIs.

Test the pages and compare their appearance with the provided screenshots.

Continue implementation until all five pages are functional, responsive, visually consistent, and verified.

**BEGIN IMPLEMENTATION NOW.**