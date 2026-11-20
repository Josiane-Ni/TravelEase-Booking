import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Alert,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  ArrowForward,
  Shield,
  SupportAgent,
  FlightTakeoff,
  ExpandMore,
  TravelExplore,
  Hotel as HotelIcon,
  Luggage as LuggageIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import {
  Logo,
  Panel,
  PageTitle,
  useApi,
  Loading,
  Failure,
} from "../components/Common";
import { FlightSearchForm } from "./Flights";
import { HotelSearchForm } from "./Hotels";
import { api, csrf, errorMessage, money } from "../services/api";
import { useApp } from "../context/AppContext";
export function HomePage() {
  const { data } = useApi("/flights");
  const [searchTab, setSearchTab] = useState(0);
  const destinations = [
    ...new Set((data?.data || []).map((f) => f.destination)),
  ].slice(0, 4);
  return (
    <>
      <Box
        sx={{
          background:
            "linear-gradient(90deg,#052f63ed,#003b7140),url(/images/ocean.jpg) center 55%/cover",
          color: "white",
          px: { xs: 3, md: 8 },
          pt: { xs: 7, md: 10 },
          pb: { xs: 13, md: 15 },
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <Chip
            label="MAKE ROOM FOR YOUR NEXT ADVENTURE"
            size="small"
            sx={{
              bgcolor: "#ffffff24",
              color: "white",
              letterSpacing: 1,
              fontSize: 10,
              mb: 3,
            }}
          />
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 38, md: 62 },
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 650,
              letterSpacing: -1.5,
            }}
          >
            A world to discover.
            <br />
            <Box component="span" sx={{ color: "#ffb967" }}>
              A journey to remember.
            </Box>
          </Typography>
          <Typography
            sx={{ my: 3, maxWidth: 460, lineHeight: 1.8, color: "#e6f4ff" }}
          >
            Discover your next destination with TravelEase. Search flights,
            choose your seat, and keep every detail of your journey in one
            place.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/flights"
              endIcon={<ArrowForward />}
            >
              Explore flights
            </Button>
            <Button
              component={Link}
              to="/register"
              sx={{ color: "white", border: "1px solid #ffffff60" }}
            >
              Create an account
            </Button>
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 0 },
          mt: -6,
          position: "relative",
        }}
      >
        <Panel title="Where will you go next?">
          <Tabs
            value={searchTab}
            onChange={(_, val) => setSearchTab(val)}
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<FlightTakeoff />} iconPosition="start" label="Flights" />
            <Tab icon={<HotelIcon />} iconPosition="start" label="Hotels" />
            <Tab icon={<LuggageIcon />} iconPosition="start" label="Holiday Packages" />
          </Tabs>

          {searchTab === 0 && <FlightSearchForm compact />}
          {searchTab === 1 && <HotelSearchForm compact />}
          {searchTab === 2 && (
            <Stack spacing={2} alignItems="flex-start" py={1}>
              <Typography variant="body1">
                Discover bundled flight and accommodation deals customized for your trip. Save up to 25% with all-inclusive package pricing.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/packages"
                endIcon={<ArrowForward />}
              >
                Explore Holiday Packages
              </Button>
            </Stack>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2}
          >
            Integrated TravelEase booking platform · Flights, Luxury Hotels & Holiday Packages · Real-time inventory locks.
          </Typography>
        </Panel>
      </Box>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 0 }, py: 7 }}>
        <PageTitle
          title="Find your kind of escape"
          subtitle="Explore destinations in our demonstration flight inventory."
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
            gap: 3,
          }}
        >
          {destinations.map((d, i) => (
            <Box
              key={d}
              component={Link}
              to={"/flights?destination=" + encodeURIComponent(d)}
              sx={{
                p: 3,
                pt: 12,
                borderRadius: 3,
                textDecoration: "none",
                color: "white",
                background: `linear-gradient(0deg,#09203fe8,#09203f05),url(/images/${i % 2 ? "mountains" : "ocean"}.jpg) center/cover`,
              }}
            >
              <Typography variant="h5">{d}</Typography>
              <Typography variant="caption">
                Explore available flights →
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 3,
            mt: 6,
          }}
        >
          {[
            [
              TravelExplore,
              "Plan with confidence",
              "Live seat availability and server-calculated fares for every simulated flight.",
            ],
            [
              Shield,
              "Keep control of your trip",
              "Manage cancellations, documents, and itinerary downloads in one secure account.",
            ],
            [
              SupportAgent,
              "Everything in one place",
              "A clear overview of your trips, wallet activity, and loyalty points.",
            ],
          ].map(([Icon, title, text]) => (
            <Panel key={title}>
              <Icon color="primary" sx={{ fontSize: 30 }} />
              <Typography variant="h6" fontSize={17} my={2}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {text}
              </Typography>
            </Panel>
          ))}
        </Box>
        <Box textAlign="center" py={6}>
          <Typography variant="h4">
            Your journey, in three simple steps
          </Typography>
          <Typography color="text.secondary" mt={2}>
            1. Find a flight. &nbsp; 2. Select passengers and seats. &nbsp; 3.
            Confirm your simulated booking.
          </Typography>
        </Box>
        <Alert severity="info">
          TravelEase is an academic travel simulation. No real airline ticket,
          hotel reservation, or payment is produced.
        </Alert>
      </Box>
    </>
  );
}
const content = {
  about: [
    "About TravelEase",
    "TravelEase brings trip planning and booking management into a single demonstration platform. Customers can search sample flight schedules, select seats, and manage simulated reservations.",
    "This academic system uses React, Material UI, Laravel, and MySQL. All inventory and payment outcomes are simulated. Hotels, packages, and advanced agent operations are being developed.",
  ],
  terms: [
    "Terms & Conditions",
    "TravelEase is provided for learning and demonstration. Using this application does not purchase travel, create a contract with an airline, or move real money. Use fictional passenger and payment data.",
    "You are responsible for securing your account. Cancellations follow the policy displayed on your booking. Demo wallet credits have no monetary value. Do not rely on this application for actual travel arrangements.",
  ],
  privacy: [
    "Privacy Policy",
    "The local application stores account details, simulated passenger names, booking history, and support messages in its MySQL database. Authentication uses session cookies; passwords are hashed. Theme preferences are stored in your browser.",
    "Do not submit real passport numbers, card information, or other sensitive travel documents. This demonstration does not verify government documents. An administrator with workspace access manages the local data.",
  ],
  "cancellation-policy": [
    "Cancellation Policy",
    "For flight simulations, eligibility and fees are calculated from the policy saved when the booking is confirmed. Open your booking to see the exact deadline and estimated refund before confirming cancellation.",
    "Eligible cancellations release the seats, reverse earned loyalty points, and credit the refund to your simulated TravelEase wallet. Repeated cancellation requests do not create additional refunds.",
  ],
};
export function InfoPage({ type }) {
  const c = content[type];
  return (
    <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 3, md: 7 } }}>
      <PageTitle title={c[0]} />
      <Panel>
        <Typography lineHeight={1.9} mb={3}>
          {c[1]}
        </Typography>
        <Typography lineHeight={1.9} color="text.secondary">
          {c[2]}
        </Typography>
      </Panel>
    </Box>
  );
}
export function FAQPage() {
  return (
    <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 3, md: 7 } }}>
      <PageTitle title="Frequently asked questions" />
      {[
        [
          "Is this a real booking service?",
          "No. Every reservation and payment is a simulation. No airline ticket or actual hotel reservation is issued.",
        ],
        [
          "How can I pay?",
          "Use a mock card outcome or add demonstration funds to your simulated TravelEase wallet. Never enter real payment credentials.",
        ],
        [
          "Can I cancel a reservation?",
          "Open My Bookings, view your booking, and review the cancellation deadline, fee, and refund quote. Eligible refunds go to the simulated wallet.",
        ],
        [
          "Can I book a hotel or package?",
          "Hotel and package workflows have not been implemented yet. Those navigation items are disabled.",
        ],
        [
          "Where is my password reset email?",
          "Local development uses the Laravel log mail driver. Reset links are written to the private backend log; production requires a configured mail provider.",
        ],
      ].map(([q, a]) => (
        <Accordion key={q} disableGutters sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight={650}>{q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
export function ContactPage() {
  const {
      register,
      handleSubmit,
      reset,
      formState: { isSubmitting },
    } = useForm(),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: { xs: 3, md: 7 } }}>
      <PageTitle
        title="Get in touch"
        subtitle="Messages are saved locally for this demonstration."
      />
      <Panel>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Stack
          component="form"
          spacing={3}
          onSubmit={handleSubmit(async (values) => {
            setError("");
            try {
              await csrf();
              const { data } = await api.post("/contact", values);
              setSuccess(data.message);
              reset();
            } catch (e) {
              setError(errorMessage(e));
            }
          })}
        >
          {[
            ["name", "Your name"],
            ["email", "Email address"],
            ["subject", "Subject"],
          ].map(([key, label]) => (
            <TextField
              key={key}
              type={key === "email" ? "email" : "text"}
              label={label}
              required
              {...register(key)}
            />
          ))}
          <TextField
            label="Message"
            multiline
            rows={5}
            required
            {...register("message")}
          />
          <Button variant="contained" type="submit" loading={isSubmitting}>
            Send message
          </Button>
        </Stack>
      </Panel>
    </Box>
  );
}
export function ErrorPage({ unauthorized = false }) {
  const { user, logout, login, notify } = useApp();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleAdminSwitch = async () => {
    setSwitching(true);
    try {
      await logout();
      await login({ email: "admin@travelease.com", password: "Password123!" });
      notify("Authenticated as Administrator. Welcome to the Admin Console.", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      notify("Failed to switch: " + errorMessage(err), "error");
    } finally {
      setSwitching(false);
    }
  };

  if (unauthorized) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", py: { xs: 5, md: 8 }, px: 3, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "error.light",
              color: "error.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <Shield sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="error.main" gutterBottom>
            403 · Access Restricted
          </Typography>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Administrator Privileges Required
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
            The requested workspace (e.g. Hotel Inventory, Flight Management, or Platform Administration) is strictly protected and requires elevated platform administrator credentials.
          </Typography>

          {user && (
            <Alert severity="warning" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2">
                Currently signed in as: <strong>{user.name || user.email}</strong>
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Role:
                </Typography>
                <Chip
                  size="small"
                  label={user.role?.toUpperCase()}
                  color={user.role === "admin" ? "success" : "warning"}
                  sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary">
                  · Email: {user.email}
                </Typography>
              </Stack>
            </Alert>
          )}

          <Stack spacing={1.5} sx={{ maxWidth: 380, mx: "auto" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              loading={switching}
              onClick={handleAdminSwitch}
              startIcon={<Shield />}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              Sign In as Administrator
            </Button>

            {user && (
              <Button
                variant="outlined"
                component={Link}
                to={`/${user.role}/dashboard`}
              >
                Go to My {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Dashboard
              </Button>
            )}

            <Button
              variant="text"
              color="inherit"
              component={Link}
              to="/"
            >
              Back to Homepage
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box textAlign="center" p={8}>
      <Typography variant="h2" color="primary">
        404
      </Typography>
      <Typography variant="h5" my={2}>
        Page not found
      </Typography>
      <Typography color="text.secondary">
        This page does not exist.
      </Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>
        Go home
      </Button>
    </Box>
  );
}
