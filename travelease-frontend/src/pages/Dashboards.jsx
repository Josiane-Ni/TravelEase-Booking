import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  Chip,
  Divider,
  TextField,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Grid,
  Paper,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  FlightTakeoff,
  Hotel,
  Luggage,
  ReceiptLong,
  AccountBalanceWallet,
  Stars,
  ArrowForward,
  TrendingUp,
  CalendarMonth,
  Cancel,
  Pending,
  Groups,
  People,
  CheckCircle,
  Notifications,
  LocalOffer,
  VerifiedUser,
  Search,
  Refresh,
  PictureAsPdf,
  Security,
  OpenInNew,
  Close,
  Assessment,
  History,
  CloudDownload,
  CancelOutlined,
  HelpOutline,
  Info,
  Payment,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";
import {
  PageTitle,
  Panel,
  Empty,
  Loading,
  Failure,
  useApi,
  Status,
} from "../components/Common";
import { api, money, dateTime, errorMessage } from "../services/api";
const colors = [
  "#0866d8",
  "#8b3dff",
  "#16a34a",
  "#ff8a24",
  "#e83e8c",
  "#15a1bb",
];
function Metrics({ items }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2,1fr)",
          sm: "repeat(3,1fr)",
          xl: `repeat(${Math.min(items.length, 6)},1fr)`,
        },
        gap: 2,
        my: 3,
      }}
    >
      {items.map(([label, value, Icon = ReceiptLong], i) => (
        <Panel key={label}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: colors[i % 6] + "15",
                color: colors[i % 6],
                width: 38,
                height: 38,
              }}
            >
              <Icon sx={{ fontSize: 19 }} />
            </Avatar>
            <Box>
              <Typography fontWeight={800} fontSize={22}>
                {value}
              </Typography>
              <Typography color="text.secondary" fontSize={11}>
                {label}
              </Typography>
            </Box>
          </Stack>
        </Panel>
      ))}
    </Box>
  );
}
function Trip({ booking: b }) {
  return (
    <Box
      sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}
    >
      <Stack direction="row" gap={2}>
        <Avatar
          variant="rounded"
          src="/images/ocean.jpg"
          alt="Tropical destination"
          sx={{ width: 68, height: 68 }}
        />
        <Box>
          <Typography fontWeight={700}>{b.destination}</Typography>
          <Typography variant="caption" color="text.secondary">
            {b.reference}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {dateTime(b.travel_at)}
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        mt={2}
        alignItems="center"
      >
        <Status value={b.status} />
        <Button size="small" component={Link} to={"/bookings/" + b.id}>
          Manage trip →
        </Button>
      </Stack>
    </Box>
  );
}
function BookingDetailsModal({ booking, open, onClose }) {
  if (!booking) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Booking Ref: {booking.reference}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {dateTime(booking.created_at)} • Service: {booking.type ? booking.type.toUpperCase() : "FLIGHT"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Status value={booking.status} />
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Summary Box */}
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Destination</Typography>
                <Typography fontWeight={700} fontSize={14}>{booking.destination}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Travel Date</Typography>
                <Typography fontWeight={700} fontSize={14}>{dateTime(booking.travel_at)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Total Settlement</Typography>
                <Typography fontWeight={800} fontSize={14} color="primary.main">{money(booking.total_minor)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Payment Status</Typography>
                <Typography fontWeight={700} fontSize={14} sx={{ textTransform: "capitalize" }}>
                  {booking.payment?.status || "Pending"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Travelers */}
          {booking.passengers && booking.passengers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Travelers & Passengers ({booking.passengers.length})
              </Typography>
              <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Passenger Type</TableCell>
                      <TableCell>Passport / ID</TableCell>
                      <TableCell>Contact Information</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {booking.passengers.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell><strong>{p.first_name} {p.last_name}</strong></TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{p.type || "Adult"}</TableCell>
                        <TableCell>{p.passport_number || p.id_number || "—"}</TableCell>
                        <TableCell>{p.email || p.phone || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Items / Reserved details */}
          {booking.items && booking.items.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Reserved Items & Inventory
              </Typography>
              <Stack spacing={1}>
                {booking.items.map((it, idx) => (
                  <Box key={idx} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {it.description || it.item_type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quantity: {it.quantity || 1} • Unit Price: {money(it.unit_price_minor)}
                      </Typography>
                    </Box>
                    <Typography fontWeight={700}>{money(it.total_minor)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Pricing Breakdown */}
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
            <Stack spacing={0.8}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{money(booking.subtotal_minor)}</Typography>
              </Stack>
              {booking.discount_minor > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="success.main">Promotional Discount</Typography>
                  <Typography variant="body2" color="success.main">-{money(booking.discount_minor)}</Typography>
                </Stack>
              )}
              {booking.tax_minor > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Taxes & Airport Surcharges</Typography>
                  <Typography variant="body2">{money(booking.tax_minor)}</Typography>
                </Stack>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>Total Net Charged</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main">{money(booking.total_minor)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => window.open(`/api/v1/bookings/${booking.id}/itinerary/pdf`, "_blank")}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Download PDF Itinerary
        </Button>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CustomerDashboard() {
  const { user, notify } = useApp();
  const { data, loading, error, reload } = useApi("/customer/dashboard");

  // Interactive UI state
  const [lookupRef, setLookupRef] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [topUpBusy, setTopUpBusy] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [historySearch, setHistorySearch] = useState("");

  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;

  const d = data.data;
  const m = d.metrics || {};
  const upcomingList = d.upcoming || [];
  const recentList = d.recent_bookings || [];
  const primaryUpcoming = upcomingList[0];
  const docs = primaryUpcoming?.documents || [];
  const readyDocs = docs.filter((doc) => doc.available).length;

  // Handle direct reference search
  const handleReferenceLookup = (e) => {
    e.preventDefault();
    const query = lookupRef.trim().toUpperCase();
    if (!query) return;

    const match = [...upcomingList, ...recentList].find(
      (b) => b.reference && b.reference.toUpperCase().includes(query)
    );

    if (match) {
      setSelectedBooking(match);
      notify(`Found booking reference ${match.reference}`, "success");
    } else {
      notify(`Booking reference "${query}" not found in current records.`, "info");
    }
  };

  // Handle simulated wallet top-up
  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    const amountVal = Number(topUpAmount);
    if (!amountVal || amountVal < 1 || amountVal > 1000) {
      notify("Please enter an amount between $1.00 and $1,000.00", "error");
      return;
    }

    setTopUpBusy(true);
    try {
      const idempotency = `topup-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      await api.post("/wallet/top-up", {
        amount_minor: Math.round(amountVal * 100),
        idempotency_key: idempotency,
      });
      notify(`$${amountVal.toFixed(2)} successfully credited to your TravelEase wallet!`, "success");
      setTopUpOpen(false);
      await reload();
    } catch (err) {
      notify(errorMessage(err) || "Failed to process wallet top-up.", "error");
    } finally {
      setTopUpBusy(false);
    }
  };

  // Filtered booking history records
  const filteredHistory = recentList.filter((b) => {
    if (activeTab === "flight" && b.type !== "flight") return false;
    if (activeTab === "hotel" && b.type !== "hotel") return false;
    if (activeTab === "package" && b.type !== "package") return false;
    if (activeTab === "cancelled" && b.status !== "cancelled") return false;
    if (historySearch.trim()) {
      const term = historySearch.toLowerCase();
      const refMatch = b.reference && b.reference.toLowerCase().includes(term);
      const destMatch = b.destination && b.destination.toLowerCase().includes(term);
      return refMatch || destMatch;
    }
    return true;
  });

  return (
    <>
      {/* Top Welcome & Booking Reference Tracker Banner */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.8fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 3, lg: 4 },
            minHeight: 210,
            color: "white",
            background:
              "linear-gradient(135deg, rgba(6,69,143,0.95), rgba(8,102,216,0.85)), url(/images/ocean.jpg) center 53%/cover",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Chip
              label="EXECUTIVE TRAVELER PORTAL"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: 700,
                mb: 1.5,
              }}
            />
            <Typography variant="h4" fontSize={{ xs: 24, lg: 29 }} fontWeight={800}>
              Welcome Back, {user.name.split(" ")[0]}! 👋
            </Typography>
            <Typography fontSize={13.5} sx={{ mt: 0.5, color: "#e2edff", maxWidth: 520 }}>
              Plan, book, track itineraries, manage your digital wallet balance, and download verified e-tickets in one secure portal.
            </Typography>
          </Box>

          {/* Quick Booking Reference Search Input */}
          <Box
            component="form"
            onSubmit={handleReferenceLookup}
            sx={{
              display: "flex",
              gap: 1,
              mt: 2.5,
              maxWidth: 480,
              bgcolor: "rgba(255,255,255,0.15)",
              p: 0.6,
              borderRadius: 2,
              backdropFilter: "blur(6px)",
            }}
          >
            <TextField
              size="small"
              placeholder="Track booking by ref (e.g. BK-FL-...)"
              value={lookupRef}
              onChange={(e) => setLookupRef(e.target.value)}
              sx={{
                bgcolor: "white",
                borderRadius: 1.5,
                "& fieldset": { border: "none" },
                "& input": { fontSize: 13, py: 1 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#0b1627",
                color: "white",
                px: 2.5,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#1a2c47" },
              }}
            >
              Track
            </Button>
          </Box>
        </Box>

        {/* Travel Essentials Card */}
        <Panel title="Your travel essentials">
          <Stack
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            sx={{ pt: 1 }}
          >
            <Box textAlign="center">
              <AccountBalanceWallet color="primary" sx={{ fontSize: 28 }} />
              <Typography color="text.secondary" fontSize={11} mt={0.5} fontWeight={600}>
                Wallet Balance
              </Typography>
              <Typography fontSize={24} fontWeight={800} color="primary.main">
                {money(d.wallet.balance_minor)}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setTopUpOpen(true)}
                sx={{ mt: 1, textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
              >
                Top up
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box textAlign="center">
              <Stars sx={{ color: "#f59e0b", fontSize: 28 }} />
              <Typography color="text.secondary" fontSize={11} mt={0.5} fontWeight={600}>
                Loyalty Points
              </Typography>
              <Typography fontSize={24} fontWeight={800} sx={{ color: "#d97706" }}>
                {d.loyalty.points.toLocaleString()}
              </Typography>
              <Button
                component={Link}
                to="/loyalty"
                size="small"
                sx={{ mt: 1, textTransform: "none", fontWeight: 700 }}
              >
                View points
              </Button>
            </Box>
          </Stack>
        </Panel>
      </Box>

      {/* Quick Action Navigation Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          ["Book a Flight", "/flights", FlightTakeoff, "#0866d8"],
          ["Book a Hotel", "/hotels", Hotel, "#8b3dff"],
          ["Explore Packages", "/packages", Luggage, "#e83e8c"],
          ["View My Bookings", "/bookings", ReceiptLong, "#08a08c"],
          ["Refund Policies", null, HelpOutline, "#f59e0b", () => setPolicyOpen(true)],
        ].map(([label, to, Icon, color, onClick]) => (
          <Button
            key={label}
            {...(to ? { component: Link, to } : { onClick })}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              justifyContent: "flex-start",
              fontSize: 12.5,
              fontWeight: 700,
              gap: 1.5,
              transition: "transform 0.15s, box-shadow 0.15s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              },
            }}
            startIcon={<Icon sx={{ color }} />}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Key Customer Metrics */}
      <Metrics
        items={[
          ["Total Bookings", m.total_bookings ?? 0, ReceiptLong],
          ["Upcoming Trips", m.upcoming_trips ?? 0, FlightTakeoff],
          ["Completed Trips", m.completed_trips ?? 0, CheckCircle],
          ["Pending Payments", m.pending_payments ?? 0, Pending],
          ["Cancelled Bookings", m.cancelled_bookings ?? 0, Cancel],
          ["Pending Refunds", m.pending_refunds ?? 0, TrendingUp],
        ]}
      />

      {/* Upcoming Trips Spotlight & Primary Journey Panel */}
      <Box sx={{ mb: 3 }}>
        <Panel
          title="Upcoming Trips"
          action={
            <Button component={Link} to="/bookings" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
              View all trips →
            </Button>
          }
        >
          {upcomingList.length ? (
            <Stack spacing={2}>
              {/* Highlight Primary Upcoming Trip Card */}
              {primaryUpcoming && (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "primary.light",
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(8,102,216,0.08)" : "#f0f7ff",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                      <FlightTakeoff sx={{ color: "white" }} />
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={800}>
                          {primaryUpcoming.destination}
                        </Typography>
                        <Chip
                          label={primaryUpcoming.reference}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        Departure: <strong>{dateTime(primaryUpcoming.travel_at)}</strong> • Status: <Status value={primaryUpcoming.status} />
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdf />}
                      onClick={() => window.open(`/api/v1/bookings/${primaryUpcoming.id}/itinerary/pdf`, "_blank")}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      PDF Itinerary
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedBooking(primaryUpcoming)}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      View Ticket Details
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Other Upcoming Trips in Standard Format */}
              {upcomingList.slice(1).map((b) => (
                <Trip key={b.id} booking={b} />
              ))}
            </Stack>
          ) : (
            <Empty
              title="No upcoming trips"
              detail="Your next adventure is waiting."
              action={
                <Button component={Link} to="/flights" variant="contained" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
                  Explore flights
                </Button>
              }
            />
          )}
        </Panel>
      </Box>

      {/* Interactive Booking History & Service Explorer Table */}
      <Panel
        title="My Bookings & Digital Itineraries"
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Search reference or destination..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 160, sm: 260 } }}
            />
          </Stack>
        }
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`All (${recentList.length})`} value="all" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab label="Flights" value="flight" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab label="Hotels" value="hotel" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab label="Packages" value="package" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab label="Cancelled" value="cancelled" sx={{ textTransform: "none", fontWeight: 700 }} />
        </Tabs>

        {filteredHistory.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Booking Ref</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Destination</strong></TableCell>
                  <TableCell><strong>Travel Date</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontFamily: "monospace", color: "primary.main", cursor: "pointer" }}
                        onClick={() => setSelectedBooking(b)}
                      >
                        {b.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(b.type || "FLIGHT").toUpperCase()}
                        size="small"
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: b.type === "hotel" ? "rgba(139,61,255,0.12)" : b.type === "package" ? "rgba(232,62,140,0.12)" : "rgba(8,102,216,0.12)",
                          color: b.type === "hotel" ? "#8b3dff" : b.type === "package" ? "#e83e8c" : "#0866d8",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {b.destination}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dateTime(b.travel_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {money(b.total_minor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Status value={b.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedBooking(b)}
                          sx={{ textTransform: "none", fontSize: 11, py: 0.2, px: 1 }}
                        >
                          Details
                        </Button>
                        <IconButton
                          size="small"
                          color="primary"
                          title="Download PDF Itinerary"
                          onClick={() => window.open(`/api/v1/bookings/${b.id}/itinerary/pdf`, "_blank")}
                        >
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No matching bookings found for the selected filter.
            </Typography>
          </Box>
        )}
      </Panel>

      {/* Grid: Wallet Activity + Notifications + Travel Checklist */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Recent Wallet Transactions */}
        <Panel
          title="Recent Wallet Activity"
          action={
            <Button size="small" component={Link} to="/wallet" sx={{ textTransform: "none", fontWeight: 700 }}>
              Full ledger →
            </Button>
          }
        >
          {d.transactions && d.transactions.length ? (
            d.transactions.map((t) => (
              <Box key={t.id} mb={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography
                      fontSize={12.5}
                      fontWeight={700}
                      textTransform="capitalize"
                    >
                      {t.type.replaceAll("_", " ")}
                    </Typography>
                    <Typography fontSize={10.5} color="text.secondary">
                      {dateTime(t.created_at)}
                    </Typography>
                  </Box>
                  <Typography
                    fontSize={13}
                    fontWeight={800}
                    color={t.amount_minor > 0 ? "success.main" : "error.main"}
                  >
                    {t.amount_minor > 0 ? "+" : ""}
                    {money(t.amount_minor)}
                  </Typography>
                </Stack>
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))
          ) : (
            <Empty
              title="No wallet activity"
              detail="Your transactions and automated refunds will appear here."
            />
          )}
          <Button
            size="small"
            variant="contained"
            fullWidth
            onClick={() => setTopUpOpen(true)}
            sx={{ mt: 1, textTransform: "none", fontWeight: 700 }}
          >
            Add Funds to Wallet
          </Button>
        </Panel>

        {/* Travel Checklist Progress */}
        <Panel title="Travel Checklist">
          {docs.length ? (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={700}>
                  {readyDocs} of {docs.length} items ready
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round((readyDocs / docs.length) * 100)}% Complete
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(readyDocs / docs.length) * 100}
                sx={{ height: 8, borderRadius: 2, mb: 2 }}
              />
              <Stack spacing={1}>
                {docs.map((doc) => (
                  <Stack
                    key={doc.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: doc.available ? "rgba(22,163,74,0.06)" : "background.default",
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: 16,
                        color: doc.available ? "success.main" : "text.disabled",
                      }}
                    />
                    <Box flex={1}>
                      <Typography fontSize={12} fontWeight={doc.available ? 600 : 400}>
                        {doc.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={doc.available ? "Verified" : "Pending"}
                      size="small"
                      color={doc.available ? "success" : "default"}
                      sx={{ fontSize: 9.5, height: 20 }}
                    />
                  </Stack>
                ))}
              </Stack>
              {primaryUpcoming && (
                <Button
                  size="small"
                  component={Link}
                  to={"/bookings/" + primaryUpcoming.id}
                  sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Manage journey documents →
                </Button>
              )}
            </>
          ) : (
            <Empty
              title="No trip checklist yet"
              detail="Checklist items are created automatically when you book."
            />
          )}
        </Panel>

        {/* Live Notifications Feed */}
        <Panel
          title="Recent Activity"
          action={
            <Button size="small" component={Link} to="/notifications" sx={{ textTransform: "none", fontWeight: 700 }}>
              All ({d.notifications?.length || 0}) →
            </Button>
          }
        >
          {d.notifications && d.notifications.length ? (
            d.notifications.slice(0, 5).map((n) => (
              <Stack key={n.id} direction="row" spacing={1.5} mb={2} alignItems="flex-start">
                <Avatar sx={{ width: 28, height: 28, bgcolor: "rgba(8,102,216,0.1)", color: "primary.main" }}>
                  <Notifications sx={{ fontSize: 16 }} />
                </Avatar>
                <Box flex={1}>
                  <Typography fontSize={12} fontWeight={700}>
                    {n.data.title}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.2 }}>
                    {n.data.message}
                  </Typography>
                  <Typography fontSize={9.5} color="text.disabled" sx={{ mt: 0.4 }}>
                    {dateTime(n.created_at)}
                  </Typography>
                </Box>
              </Stack>
            ))
          ) : (
            <Empty
              title="All caught up"
              detail="Travel updates, booking confirmations, and gate notices appear here."
            />
          )}
        </Panel>
      </Box>

      {/* Embedded Wallet Top-Up Dialog */}
      <Dialog open={topUpOpen} onClose={() => !topUpBusy && setTopUpOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleTopUpSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Top Up TravelEase Wallet
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Add instant simulated balance to pay for flights, hotel stays, or holiday packages without card charges.
            </Typography>

            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              SELECT QUICK AMOUNT
            </Typography>
            <Grid container spacing={1} mb={2.5}>
              {[50, 100, 250, 500].map((preset) => (
                <Grid item xs={3} key={preset}>
                  <Button
                    fullWidth
                    variant={topUpAmount === preset ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setTopUpAmount(preset)}
                    sx={{ fontWeight: 700, borderRadius: 1.5 }}
                  >
                    ${preset}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <TextField
              label="Deposit Amount ($)"
              type="number"
              fullWidth
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              inputProps={{ min: 1, max: 1000, step: 1 }}
              required
              helperText="Min $1.00 — Max $1,000.00"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setTopUpOpen(false)} disabled={topUpBusy} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={topUpBusy}
              sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
            >
              Deposit Funds
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Cancellation & Refund Terms Policy Modal */}
      <Dialog open={policyOpen} onClose={() => setPolicyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Cancellation & Automated Refund Policy</span>
          <IconButton size="small" onClick={() => setPolicyOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info" sx={{ fontSize: 12.5 }}>
              All cancellations and refunds are calculated automatically and credited to your TravelEase wallet or original payment method based on provider notice rules.
            </Alert>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                1. Flight Booking Cancellations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                • <strong>More than 24 hours before departure:</strong> 100% full refund with zero cancellation fee.<br />
                • <strong>Between 12 and 24 hours:</strong> Standard 15% cancellation fee applies.<br />
                • <strong>Under 12 hours / No-show:</strong> Non-refundable per airline fare rules.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                2. Hotel Room Reservation Cancellations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                • Up to 48 hours prior to check-in: 100% refund.<br />
                • Within 48 hours: 15% property holding fee retained.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                3. Instant Automated Wallet Refund
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Approved refunds are processed immediately with a transaction log posted to your account ledger and an automated real-time notification sent to both you and TravelEase administrators.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPolicyOpen(false)} variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
            Understood
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details / Digital E-Ticket Dialog */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  );
}
const DaysFilter = ({ days, setDays }) => (
  <TextField
    select
    label="Period"
    value={days}
    onChange={(e) => setDays(e.target.value)}
    sx={{ width: 170 }}
  >
    {[30, 90, 365].map((n) => (
      <MenuItem key={n} value={n}>
        Last {n} Days
      </MenuItem>
    ))}
  </TextField>
);
function AdminKpiCard({ title, value, subtitle, icon: Icon, color = "#0866d8", alert = false }) {
  return (
    <Panel
      sx={{
        p: 2.2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderTop: alert ? "3px solid #ef4444" : `3px solid ${color}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: 10.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mt: 0.5,
              color: alert ? "error.main" : "text.primary",
              fontSize: { xs: 20, sm: 23 },
            }}
          >
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: alert ? "rgba(239, 68, 68, 0.12)" : `${color}15`,
            color: alert ? "error.main" : color,
            width: 42,
            height: 42,
            borderRadius: 2,
          }}
        >
          <Icon sx={{ fontSize: 21 }} />
        </Avatar>
      </Stack>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11, mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Panel>
  );
}

export function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [scanning, setScanning] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const { notify } = useApp();
  const { data, loading, error, reload } = useApi("/admin/dashboard?days=" + days);

  if (loading && !data) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;

  const d = data.data;
  const m = d.metrics;

  const runFraudScan = async () => {
    setScanning(true);
    try {
      const res = await api.post("/admin/fraud/scan");
      notify(res.data?.message || "Fraud anomaly scan completed successfully.");
      reload();
    } catch (e) {
      notify(errorMessage(e) || "Failed to execute fraud anomaly scan.", "error");
    } finally {
      setScanning(false);
    }
  };

  const exportPdfReport = () => {
    window.open(`/api/v1/admin/reports/pdf?days=${days}`, "_blank");
  };

  const exportCsvReport = () => {
    window.open(`/api/v1/admin/reports/export?days=${days}`, "_blank");
  };

  const filteredBookings = (d.recent_bookings || []).filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.passengers || []).some((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesService =
      serviceFilter === "all" ||
      (serviceFilter === "cancelled" ? b.status === "cancelled" : b.type === serviceFilter);
    return matchesSearch && matchesService;
  });

  return (
    <>
      <PageTitle
        title="Executive Administration & Operations Portal"
        subtitle="Real-time platform overview, financial performance, fleet & hotel utilization, and fraud oversight."
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <DaysFilter days={days} setDays={setDays} />
          </Stack>
        }
      />
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Real-time System Operational Status Bar */}
      <Box
        sx={{
          p: 1.8,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(8,120,235,0.04)",
          borderRadius: 2.5,
          border: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2.5} flexWrap="wrap" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "success.main" }} />
            <Typography variant="caption" fontWeight={600}>
              Core API & MySQL: <strong>Operational (3306)</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "success.main" }} />
            <Typography variant="caption" fontWeight={600}>
              Email Delivery: <strong>Gmail SMTP Connected</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "success.main" }} />
            <Typography variant="caption" fontWeight={600}>
              Concurrency Guard: <strong>15m Row-Level Locks</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                bgcolor: m.pending_fraud_flags > 0 ? "warning.main" : "success.main",
              }}
            />
            <Typography variant="caption" fontWeight={600}>
              Fraud Watchdog: <strong>{m.pending_fraud_flags > 0 ? `${m.pending_fraud_flags} Flags Pending` : "Protected"}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                bgcolor: (d.unread_count || 0) > 0 ? "warning.main" : "success.main",
              }}
            />
            <Typography variant="caption" fontWeight={600}>
              Admin Alerts: <strong>{(d.unread_count || 0) > 0 ? `${d.unread_count} Unread Activity Updates` : "All Caught Up"}</strong>
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="contained"
            color="warning"
            startIcon={<Security />}
            onClick={runFraudScan}
            loading={scanning}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12 }}
          >
            Run Fraud Scan
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={exportPdfReport}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12 }}
          >
            Export PDF
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={reload}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Executive KPI Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <AdminKpiCard
          title="Platform Net Revenue"
          value={money(m.net_revenue_minor)}
          subtitle={`Gross: ${money(m.successful_payments_minor)} • Refunds: ${money(m.refunds_minor)}`}
          icon={TrendingUp}
          color="#0866d8"
        />
        <AdminKpiCard
          title="Total Bookings"
          value={m.total_bookings}
          subtitle={`${m.fulfillment_rate || 100}% fulfillment • ${m.cancellations || 0} cancellations`}
          icon={ReceiptLong}
          color="#16a34a"
        />
        <AdminKpiCard
          title="Flight Seat Utilization"
          value={`${m.avg_flight_utilization || 0}%`}
          subtitle={`${m.flight_bookings} flight bookings recorded`}
          icon={FlightTakeoff}
          color="#8b3dff"
        />
        <AdminKpiCard
          title="Hotel Room Occupancy"
          value={`${m.avg_hotel_occupancy || 0}%`}
          subtitle={`${m.hotel_bookings} rooms across ${m.hotel_properties} properties`}
          icon={Hotel}
          color="#ff8a24"
        />
        <AdminKpiCard
          title="Holiday Packages Volume"
          value={m.package_bookings || 0}
          subtitle={`${m.holiday_packages || 0} curated packages active`}
          icon={Luggage}
          color="#e83e8c"
        />
        <AdminKpiCard
          title="Active Users & Roles"
          value={m.active_users}
          subtitle={`${m.total_customers || 0} customers • ${m.total_agents || 0} agents (${m.verified_users || 0} verified)`}
          icon={People}
          color="#15a1bb"
        />
        <AdminKpiCard
          title="Agent Commissions"
          value={money(m.agent_commissions_minor || 0)}
          subtitle="Corporate & group booking commissions"
          icon={Groups}
          color="#0284c7"
        />
        <AdminKpiCard
          title="Fraud Risk Alerts"
          value={m.pending_fraud_flags || 0}
          subtitle={m.pending_fraud_flags > 0 ? "Requires administrative review" : "No anomaly flags detected"}
          icon={VerifiedUser}
          color={m.pending_fraud_flags > 0 ? "#ef4444" : "#16a34a"}
          alert={m.pending_fraud_flags > 0}
        />
      </Box>

      {/* Analytics & Financial Performance Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.7fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <Panel title="Monthly Revenue Inflow vs Refunds">
          <Box sx={{ height: 290, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={d.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => "$" + v / 100}
                  tick={{ fontSize: 10 }}
                  width={65}
                />
                <RechartsTooltip formatter={(v) => money(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="gross_minor"
                  name="Gross Revenue (Settled)"
                  fill="#0866d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="refund_minor"
                  name="Completed Refunds"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Panel>

        <Panel title="Booking Status Distribution">
          {d.status_distribution && d.status_distribution.length ? (
            <Box sx={{ height: 290 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={d.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {d.status_distribution.map((s, i) => (
                      <Cell key={s.status} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Empty title="No bookings in this period" />
          )}
        </Panel>
      </Box>

      {/* Fleet & Hotel Utilization Monitors */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Flight Seat Utilization */}
        <Panel
          title="Flight Fleet Seat Utilization"
          action={
            <Button size="small" component={Link} to="/admin/flights">
              Manage fleet →
            </Button>
          }
        >
          {d.flight_occupancy && d.flight_occupancy.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Flight</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Seats</TableCell>
                    <TableCell width={130}>Utilization</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.flight_occupancy.map((f) => (
                    <TableRow key={f.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {f.flight_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {f.airline}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {f.origin} → {f.destination}
                      </TableCell>
                      <TableCell>{f.departure_at || "Scheduled"}</TableCell>
                      <TableCell>
                        {f.booked_seats} / {f.total_seats}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={f.utilization_pct}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  f.utilization_pct > 80
                                    ? "success.main"
                                    : f.utilization_pct > 40
                                      ? "primary.main"
                                      : "warning.main",
                              },
                            }}
                          />
                          <Typography variant="caption" fontWeight={700}>
                            {f.utilization_pct}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Empty title="No active flights scheduled" />
          )}
        </Panel>

        {/* Hotel Occupancy */}
        <Panel
          title="Hotel Property Room Occupancy"
          action={
            <Button size="small" component={Link} to="/admin/hotels">
              Manage hotels →
            </Button>
          }
        >
          {d.hotel_occupancy && d.hotel_occupancy.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Rooms</TableCell>
                    <TableCell width={130}>Occupancy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.hotel_occupancy.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {h.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{h.city}</TableCell>
                      <TableCell>{"⭐".repeat(h.stars || 4)}</TableCell>
                      <TableCell>
                        {h.booked_rooms} booked ({h.total_rooms} total)
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={h.occupancy_pct}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  h.occupancy_pct > 75
                                    ? "success.main"
                                    : h.occupancy_pct > 40
                                      ? "primary.main"
                                      : "warning.main",
                              },
                            }}
                          />
                          <Typography variant="caption" fontWeight={700}>
                            {h.occupancy_pct}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Empty title="No active hotel properties found" />
          )}
        </Panel>
      </Box>

      {/* Popular Routes & Service Line Breakdown */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <Panel title="Top Performing Destinations & Routes">
          {d.destinations && d.destinations.length ? (
            d.destinations.map((v, i) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                key={v.destination}
                sx={{ py: 1.4, borderBottom: 1, borderColor: "divider" }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    sx={{ color: "primary.main", width: 24 }}
                  >
                    0{i + 1}
                  </Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {v.destination}
                    </Typography>
                    {v.revenue_minor > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Revenue: {money(v.revenue_minor)}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Chip size="small" label={`${v.count} bookings`} sx={{ fontWeight: 600 }} />
              </Stack>
            ))
          ) : (
            <Empty title="No destination booking data yet" />
          )}
        </Panel>

        <Panel title="Service Breakdown (Share of Business)">
          {d.service_breakdown && d.service_breakdown.length ? (
            <Stack spacing={2} pt={1}>
              {d.service_breakdown.map((s) => {
                const totalRev = d.service_breakdown.reduce((sum, item) => sum + item.revenue_minor, 0);
                const pct = totalRev > 0 ? Math.round((s.revenue_minor / totalRev) * 100) : 33;
                return (
                  <Box key={s.name}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight={700}>
                        {s.name} ({s.count} bookings)
                      </Typography>
                      <Typography variant="body2" fontWeight={800} color="primary.main">
                        {money(s.revenue_minor)} ({pct}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 7,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            s.type === "flight"
                              ? "#8b3dff"
                              : s.type === "hotel"
                                ? "#ff8a24"
                                : "#e83e8c",
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Empty title="No service breakdown data available" />
          )}
        </Panel>
      </Box>

      {/* Real-time Platform Alerts & Activity Feed */}
      <Box mb={3}>
        <Panel
          title="Live Platform Activity & User Actions"
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                component={Link}
                to="/notifications"
                startIcon={<Notifications fontSize="small" />}
                sx={{ textTransform: "none", fontSize: 12 }}
              >
                Notification Center ({(d.unread_count || 0)} unread) →
              </Button>
            </Stack>
          }
        >
          {d.notifications && d.notifications.length > 0 ? (
            <Stack spacing={1.5}>
              {d.notifications.slice(0, 5).map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: n.read_at ? "divider" : "primary.main",
                    bgcolor: n.read_at ? "transparent" : "action.hover",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        bgcolor: n.read_at ? "action.hover" : "primary.light",
                        color: n.read_at ? "text.secondary" : "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Notifications fontSize="small" />
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={750}>
                          {n.data?.title || "Platform Event"}
                        </Typography>
                        {!n.read_at && (
                          <Chip size="small" label="NEW" color="primary" sx={{ height: 16, fontSize: 9, fontWeight: 800 }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                        {n.data?.message}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="caption" color="text.disabled">
                      {dateTime(n.created_at)}
                    </Typography>
                    {n.data?.action_url && (
                      <Button
                        size="small"
                        component={Link}
                        to={n.data.action_url}
                        sx={{ textTransform: "none", fontSize: 11, fontWeight: 700 }}
                      >
                        Open →
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Empty
              title="No platform activity recorded yet"
              detail="When customers book flights/hotels, register accounts, or request refunds, real-time alerts appear here."
            />
          )}
        </Panel>
      </Box>

      {/* Interactive Recent Bookings Management Table */}
      <Box mb={3}>
        <Panel
          title="Recent Platform Bookings & Transactions"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloudDownload />}
                onClick={exportCsvReport}
                sx={{ textTransform: "none", fontSize: 12 }}
              >
                Export CSV
              </Button>
              <Button
                size="small"
                component={Link}
                to="/admin/reports"
                sx={{ textTransform: "none", fontSize: 12 }}
              >
                All Reports →
              </Button>
            </Stack>
          }
        >
          {/* Filter Tabs & Search Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Tabs
              value={serviceFilter}
              onChange={(_, val) => setServiceFilter(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 38 }}
            >
              <Tab
                label={`All (${(d.recent_bookings || []).length})`}
                value="all"
                sx={{ minHeight: 38, py: 0.5, fontSize: 13, textTransform: "none" }}
              />
              <Tab
                label="Flights"
                value="flight"
                icon={<FlightTakeoff fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 38, py: 0.5, fontSize: 13, textTransform: "none" }}
              />
              <Tab
                label="Hotels"
                value="hotel"
                icon={<Hotel fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 38, py: 0.5, fontSize: 13, textTransform: "none" }}
              />
              <Tab
                label="Packages"
                value="package"
                icon={<Luggage fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 38, py: 0.5, fontSize: 13, textTransform: "none" }}
              />
              <Tab
                label="Cancelled"
                value="cancelled"
                icon={<Cancel fontSize="small" />}
                iconPosition="start"
                sx={{ minHeight: 38, py: 0.5, fontSize: 13, textTransform: "none" }}
              />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search reference, destination, or passenger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", sm: 300 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Stack>

          {filteredBookings.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Booking Ref</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Travel Date</TableCell>
                    <TableCell>Total Settlement</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            fontFamily: "monospace",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => setSelectedBooking(b)}
                        >
                          {b.reference}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={
                            b.type === "hotel" ? (
                              <Hotel fontSize="small" />
                            ) : b.type === "package" ? (
                              <Luggage fontSize="small" />
                            ) : (
                              <FlightTakeoff fontSize="small" />
                            )
                          }
                          label={b.type ? b.type.toUpperCase() : "FLIGHT"}
                          variant="outlined"
                          sx={{ fontSize: 11, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{b.destination}</TableCell>
                      <TableCell>{dateTime(b.travel_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {money(b.total_minor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Status value={b.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSelectedBooking(b)}
                            sx={{ textTransform: "none", fontSize: 12, minWidth: 60 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() =>
                              window.open(`/api/v1/bookings/${b.id}/itinerary/pdf`, "_blank")
                            }
                            sx={{ textTransform: "none", fontSize: 12 }}
                            title="Download PDF Itinerary"
                          >
                            PDF
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Empty
              title="No bookings matched your filter"
              detail="Try adjusting your search criteria or time period."
            />
          )}
        </Panel>
      </Box>

      {/* Operations & Governance Hub */}
      <Box mb={3}>
        <Panel title="Operations & System Governance Hub">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              pt: 1,
            }}
          >
            {[
              {
                title: "Flights Management",
                desc: "Routes, seat classes & airlines",
                icon: FlightTakeoff,
                link: "/admin/flights",
                color: "#8b3dff",
                badge: `${m.flight_bookings || 0} Bookings`,
              },
              {
                title: "Hotels & Rooms",
                desc: "Properties, room inventory & daily pricing",
                icon: Hotel,
                link: "/admin/hotels",
                color: "#ff8a24",
                badge: `${m.hotel_properties || 0} Hotels`,
              },
              {
                title: "Holiday Packages",
                desc: "Curated packages & seasonal discounts",
                icon: Luggage,
                link: "/admin/packages",
                color: "#e83e8c",
                badge: `${m.holiday_packages || 0} Packages`,
              },
              {
                title: "Promotions & Vouchers",
                desc: "Promo codes, campaigns & limits",
                icon: LocalOffer,
                link: "/admin/promotions",
                color: "#0866d8",
                badge: `${m.active_promotions || 0} Active`,
              },
              {
                title: "Fraud & Security",
                desc: "Anomaly detection & risk monitoring",
                icon: Security,
                link: "/admin/fraud",
                color: m.pending_fraud_flags > 0 ? "#ef4444" : "#16a34a",
                badge: m.pending_fraud_flags > 0 ? `${m.pending_fraud_flags} Alerts` : "Protected",
              },
              {
                title: "Users & Roles",
                desc: "Customers, Agents & access controls",
                icon: People,
                link: "/admin/users",
                color: "#15a1bb",
                badge: `${m.active_users || 0} Users`,
              },
              {
                title: "System Audit Logs",
                desc: "Security audit trail & activity history",
                icon: History,
                link: "/admin/audit",
                color: "#475569",
                badge: "Immutable",
              },
              {
                title: "Reports & Analytics",
                desc: "CSV & PDF executive exports",
                icon: Assessment,
                link: "/admin/reports",
                color: "#0284c7",
                badge: "Exportable",
              },
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <Box
                  key={card.title}
                  component={Link}
                  to={card.link}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.18s ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:hover": {
                      borderColor: card.color,
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: `${card.color}15`,
                        color: card.color,
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                      }}
                    >
                      <CardIcon fontSize="small" />
                    </Avatar>
                    <Chip
                      size="small"
                      label={card.badge}
                      sx={{ fontSize: 11, fontWeight: 700 }}
                    />
                  </Stack>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.desc}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Panel>
      </Box>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  );
}

export function AgentDashboard() {
  const [days, setDays] = useState(30),
    { data, loading, error, reload } = useApi("/agent/dashboard?days=" + days);
  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const d = data.data,
    m = d.metrics;
  const commissionsList = d.commissions?.data || [];
  return (
    <>
      <PageTitle
        title="Agent Dashboard"
        subtitle="Manage your assigned corporate clients and review recorded commissions."
        action={<DaysFilter days={days} setDays={setDays} />}
      />
      <Metrics
        items={[
          ["Corporate Clients", m.corporate_clients, Groups],
          ["Commission Earned", money(m.commission_earned_minor), TrendingUp],
          ["Commission Pending", money(m.commission_pending_minor), Pending],
          ["Bookings Handled", d.commissions?.total || commissionsList.length || 0, ReceiptLong],
        ]}
      />

      {/* Agent Quick Actions */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4,1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          ["Book Flight for Client", "/flights", FlightTakeoff, "#0866d8"],
          ["Book Hotel for Client", "/hotels", Hotel, "#8b3dff"],
          ["Custom Tour Package", "/packages", Luggage, "#e83e8c"],
          ["Corporate Client List", "/agent/clients", Groups, "#08a08c"],
        ].map(([label, to, Icon, color]) => (
          <Button
            key={label}
            component={Link}
            to={to}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              justifyContent: "flex-start",
              fontSize: 12,
              gap: 1.5,
            }}
            startIcon={<Icon sx={{ color }} />}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1.6fr" },
          gap: 3,
        }}
      >
        <Panel
          title="Assigned Corporate Clients"
          action={
            <Button component={Link} to="/agent/clients" size="small">
              Manage all
            </Button>
          }
        >
          {d.clients.data.length ? (
            d.clients.data.map((c) => (
              <Box key={c.id} py={2} borderBottom={1} borderColor="divider">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700} variant="body2">
                      {c.name}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {c.contact_email} {c.phone ? `· ${c.phone}` : ""}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to="/flights"
                  >
                    Book Trip
                  </Button>
                </Stack>
              </Box>
            ))
          ) : (
            <Empty
              title="No corporate clients assigned"
              detail="Add corporate accounts to book travel and earn commissions."
              action={
                <Button component={Link} to="/agent/clients" variant="contained">
                  Add Corporate Client
                </Button>
              }
            />
          )}
        </Panel>

        <Panel
          title="Recorded Agent Commissions"
          action={
            <Typography variant="subtitle2" color="primary" fontWeight={800}>
              Total Earned: {money(m.commission_earned_minor)}
            </Typography>
          }
        >
          {commissionsList.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Booking Ref</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Booking Total</TableCell>
                    <TableCell>Commission</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionsList.map((cm) => (
                    <TableRow key={cm.id}>
                      <TableCell>
                        {cm.booking ? (
                          <Link to={`/bookings/${cm.booking.id}`} style={{ fontWeight: 700, textDecoration: "none" }}>
                            {cm.booking.reference}
                          </Link>
                        ) : (
                          `#${cm.booking_id}`
                        )}
                      </TableCell>
                      <TableCell>{cm.booking?.destination || "Simulated Trip"}</TableCell>
                      <TableCell>{cm.booking ? money(cm.booking.total_minor) : "—"}</TableCell>
                      <TableCell>
                        <strong style={{ color: "#16a34a" }}>+{money(cm.amount_minor)}</strong>
                      </TableCell>
                      <TableCell><Status value={cm.status} /></TableCell>
                      <TableCell>{dateTime(cm.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Empty
              title="Group booking workflow is pending"
              detail="Commissions (5%) are automatically credited when you book trips for corporate clients. Automated group approval is pending."
            />
          )}
        </Panel>
      </Box>
    </>
  );
}
