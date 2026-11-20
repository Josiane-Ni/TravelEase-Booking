import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Protected, PublicLayout, DashboardLayout } from "./components/Layout";
import { Loading, ErrorBoundary } from "./components/Common";
const page = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));
const AuthPage = page(() => import("./pages/Auth"), "AuthPage"),
  PasswordRecovery = page(() => import("./pages/Auth"), "PasswordRecovery"),
  VerifyEmailPage = page(() => import("./pages/Auth"), "VerifyEmailPage");
const HomePage = page(() => import("./pages/Public"), "HomePage"),
  InfoPage = page(() => import("./pages/Public"), "InfoPage"),
  FAQPage = page(() => import("./pages/Public"), "FAQPage"),
  ContactPage = page(() => import("./pages/Public"), "ContactPage"),
  ErrorPage = page(() => import("./pages/Public"), "ErrorPage");
const FlightsPage = page(() => import("./pages/Flights"), "FlightsPage"),
  FlightDetails = page(() => import("./pages/Flights"), "FlightDetails");
const HotelsPage = page(() => import("./pages/Hotels"), "HotelsPage"),
  HotelDetails = page(() => import("./pages/Hotels"), "HotelDetails");
const PackagesPage = page(() => import("./pages/Packages"), "PackagesPage"),
  PackageDetails = page(() => import("./pages/Packages"), "PackageDetails");
const CheckoutPage = page(() => import("./pages/Bookings"), "CheckoutPage"),
  BookingsPage = page(() => import("./pages/Bookings"), "BookingsPage"),
  BookingDetails = page(() => import("./pages/Bookings"), "BookingDetails");
const CustomerDashboard = page(
    () => import("./pages/Dashboards"),
    "CustomerDashboard",
  ),
  AdminDashboard = page(() => import("./pages/Dashboards"), "AdminDashboard"),
  AgentDashboard = page(() => import("./pages/Dashboards"), "AgentDashboard");
const WalletPage = page(() => import("./pages/Account"), "WalletPage"),
  LoyaltyPage = page(() => import("./pages/Account"), "LoyaltyPage"),
  NotificationsPage = page(
    () => import("./pages/Account"),
    "NotificationsPage",
  ),
  ProfilePage = page(() => import("./pages/Account"), "ProfilePage");
const FlightManagement = page(
    () => import("./pages/Management"),
    "FlightManagement",
  ),
  HotelManagement = page(
    () => import("./pages/Management"),
    "HotelManagement",
  ),
  PackageManagement = page(
    () => import("./pages/Management"),
    "PackageManagement",
  ),
  PromotionManagement = page(
    () => import("./pages/Management"),
    "PromotionManagement",
  ),
  FraudManagement = page(
    () => import("./pages/Management"),
    "FraudManagement",
  ),
  UserManagement = page(() => import("./pages/Management"), "UserManagement"),
  ClientsPage = page(() => import("./pages/Management"), "ClientsPage"),
  AuditPage = page(() => import("./pages/Management"), "AuditPage"),
  ReportsPage = page(() => import("./pages/Management"), "ReportsPage");
function FlightRoute() {
  const { id } = useParams();
  return <FlightDetails id={id} />;
}
function HotelRoute() {
  const { id } = useParams();
  return <HotelDetails id={id} />;
}
function PackageRoute() {
  const { id } = useParams();
  return <PackageDetails id={id} />;
}
function BookingRoute() {
  const { id } = useParams();
  return <BookingDetails id={id} />;
}
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage registerMode />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="flights" element={<FlightsPage />} />
              <Route path="flights/:id" element={<FlightRoute />} />
              <Route path="hotels" element={<HotelsPage />} />
              <Route path="hotels/:id" element={<HotelRoute />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="packages/:id" element={<PackageRoute />} />
              {["about", "terms", "privacy", "cancellation-policy"].map(
                (type) => (
                  <Route
                    key={type}
                    path={type}
                    element={<InfoPage type={type} />}
                  />
                ),
              )}
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="forgot-password" element={<PasswordRecovery />} />
              <Route
                path="reset-password"
                element={<PasswordRecovery reset />}
              />
              <Route path="unauthorized" element={<ErrorPage unauthorized />} />
              <Route path="*" element={<ErrorPage />} />
            </Route>
            <Route
              element={
                <Protected>
                  <DashboardLayout />
                </Protected>
              }
            >
              <Route
                path="customer/dashboard"
                element={
                  <Protected role="customer">
                    <CustomerDashboard />
                  </Protected>
                }
              />
              <Route
                path="agent/dashboard"
                element={
                  <Protected role="agent">
                    <AgentDashboard />
                  </Protected>
                }
              />
              <Route
                path="admin/dashboard"
                element={
                  <Protected role="admin">
                    <AdminDashboard />
                  </Protected>
                }
              />
              <Route
                path="checkout"
                element={
                  <Protected role="customer">
                    <CheckoutPage />
                  </Protected>
                }
              />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/:id" element={<BookingRoute />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="loyalty" element={<LoyaltyPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="admin/flights"
                element={
                  <Protected role="admin">
                    <FlightManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/hotels"
                element={
                  <Protected role="admin">
                    <HotelManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/packages"
                element={
                  <Protected role="admin">
                    <PackageManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/promotions"
                element={
                  <Protected role="admin">
                    <PromotionManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/fraud"
                element={
                  <Protected role="admin">
                    <FraudManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/users"
                element={
                  <Protected role="admin">
                    <UserManagement />
                  </Protected>
                }
              />
              <Route
                path="admin/audit"
                element={
                  <Protected role="admin">
                    <AuditPage />
                  </Protected>
                }
              />
              <Route
                path="admin/reports"
                element={
                  <Protected role="admin">
                    <ReportsPage />
                  </Protected>
                }
              />
              <Route
                path="agent/clients"
                element={
                  <Protected role="agent">
                    <ClientsPage />
                  </Protected>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </AppProvider>
  );
}
