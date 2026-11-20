import { useEffect, useState, useRef } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  InputBase,
  Alert,
  Divider,
  Badge,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  FlightTakeoff,
  Hotel,
  Luggage,
  ReceiptLong,
  AccountBalanceWallet,
  Stars,
  Notifications,
  Person,
  Groups,
  People,
  BarChart,
  History,
  Logout,
  Menu as MenuIcon,
  Search,
  VerifiedUser,
  Description,
  LocalOffer,
  SwapHoriz,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useApp } from "../context/AppContext";
import { api, dateTime } from "../services/api";
import { Logo, ThemeToggle, useApi } from "./Common";
export function Protected({ children, role }) {
  const { user, booting } = useApp();
  const location = useLocation();
  if (booting)
    return (
      <Box p={8} textAlign="center">
        <CircularProgress />
      </Box>
    );
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (role && user.role !== role && user.role !== "admin")
    return <Navigate to="/unauthorized" replace />;
  return children;
}
const customer = [
  ["Dashboard", "/customer/dashboard", Dashboard],
  ["Book Flights", "/flights", FlightTakeoff],
  ["Book Hotels", "/hotels", Hotel],
  ["Holiday Packages", "/packages", Luggage],
  ["My Bookings", "/bookings", ReceiptLong],
  ["Wallet", "/wallet", AccountBalanceWallet],
  ["Loyalty Points", "/loyalty", Stars],
  ["Notifications", "/notifications", Notifications],
  ["Travel Documents", "/bookings?documents=1", Description],
  ["Profile & Settings", "/profile", Person],
];
const admin = [
  ["Dashboard", "/admin/dashboard", Dashboard],
  ["Flights", "/admin/flights", FlightTakeoff],
  ["Hotels", "/admin/hotels", Hotel],
  ["Holiday Packages", "/admin/packages", Luggage],
  ["Promotions", "/admin/promotions", LocalOffer],
  ["Users & Roles", "/admin/users", People],
  ["Fraud Detection", "/admin/fraud", VerifiedUser],
  ["Reports & Analytics", "/admin/reports", BarChart],
  ["Audit Logs", "/admin/audit", History],
  ["Notifications", "/notifications", Notifications],
  ["Profile", "/profile", Person],
];
const agent = [
  ["Dashboard", "/agent/dashboard", Dashboard],
  ["Corporate Clients", "/agent/clients", Groups],
  ["Group Bookings", "/bookings", ReceiptLong],
  ["Commissions", "/admin/reports", BarChart],
  ["Notifications", "/notifications", Notifications],
  ["Profile", "/profile", Person],
];
export function PublicLayout() {
  const { user } = useApp();
  return (
    <>
      <Box
        component="header"
        sx={{
          px: { xs: 2, md: 7 },
          py: 2,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Logo />
          <Stack direction="row" spacing={{ xs: 0, sm: 2 }} alignItems="center">
            <Button component={Link} to="/flights">
              Flights
            </Button>
            <Button component={Link} to="/hotels">
              Hotels
            </Button>
            <Button component={Link} to="/packages">
              Packages
            </Button>
            <Button
              component={Link}
              to="/about"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              About
            </Button>
            <ThemeToggle />
            {user ? (
              <Button
                variant="contained"
                component={Link}
                to={`/${user.role}/dashboard`}
              >
                Dashboard
              </Button>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button component={Link} to="/login">
                  Sign in
                </Button>
                <Button variant="contained" component={Link} to="/register">
                  Register
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>
      <Outlet />
      <Box
        component="footer"
        sx={{ p: 4, borderTop: 1, borderColor: "divider", mt: 5 }}
      >
        <Stack direction="row" flexWrap="wrap" gap={3} justifyContent="center">
          {[
            ["About", "about"],
            ["Contact", "contact"],
            ["FAQ", "faq"],
            ["Terms", "terms"],
            ["Privacy", "privacy"],
            ["Cancellation policy", "cancellation-policy"],
          ].map(([label, to]) => (
            <Button key={to} component={Link} to={"/" + to}>
              {label}
            </Button>
          ))}
        </Stack>
        <Typography
          textAlign="center"
          color="text.secondary"
          variant="body2"
          mt={2}
        >
          TravelEase · Academic booking simulation · No real tickets or payments
        </Typography>
      </Box>
    </>
  );
}
export function DashboardLayout() {
  const { user, logout, login, notify } = useApp(),
    [mobile, setMobile] = useState(false),
    [anchor, setAnchor] = useState(null),
    [notifAnchor, setNotifAnchor] = useState(null),
    [search, setSearch] = useState("");
  const location = useLocation(),
    navigate = useNavigate();
  const { data: notifications, reload: reloadNotifications } =
    useApi("/notifications");

  // Real-time notification polling every 12 seconds
  const previousUnread = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      reloadNotifications();
    }, 12000);
    return () => clearInterval(timer);
  }, [reloadNotifications]);

  useEffect(() => {
    const currentUnread = notifications?.unread_count || 0;
    if (currentUnread > previousUnread.current && previousUnread.current > 0) {
      notify(`🔔 You have ${currentUnread} unread notification(s).`);
    }
    previousUnread.current = currentUnread;
  }, [notifications?.unread_count, notify]);

  useEffect(() => {
    window.addEventListener("notifications-changed", reloadNotifications);
    return () =>
      window.removeEventListener("notifications-changed", reloadNotifications);
  }, [reloadNotifications]);
  const links =
    user.role === "admin" ? admin : user.role === "agent" ? agent : customer;
  const sidebar = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg,#102b4c,#09182f)",
        color: "white",
        p: 2,
      }}
    >
      <Box px={1} pt={2} pb={4}>
        <Logo light />
        <Typography
          fontSize={10}
          sx={{ letterSpacing: 2, color: "#91a9c6", mt: 1 }}
        >
          YOUR JOURNEY, SIMPLIFIED
        </Typography>
      </Box>
      <Typography
        sx={{
          px: 2,
          color: "#8098b9",
          fontSize: 10,
          letterSpacing: 1.5,
          mb: 1,
        }}
      >
        {user.role.toUpperCase()} WORKSPACE
      </Typography>
      <List sx={{ flex: 1 }}>
        {links.map(([label, to, Icon]) => (
          <Tooltip
            key={label}
            title={to ? "" : "This module has not been implemented yet."}
          >
            <span>
              <ListItemButton
                disabled={!to}
                component={to ? Link : "div"}
                to={to || undefined}
                selected={!!to && location.pathname === to.split("?")[0]}
                onClick={() => setMobile(false)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  py: 0.9,
                  "&.Mui-selected": {
                    bgcolor: "#287df0",
                    "&:hover": { bgcolor: "#287df0" },
                  },
                  "&.Mui-disabled": { opacity: 0.4 },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                />
              </ListItemButton>
            </span>
          </Tooltip>
        ))}
      </List>
      <Divider sx={{ borderColor: "#ffffff20" }} />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        py={2}
      >
        <Typography variant="caption">Appearance</Typography>
        <ThemeToggle />
      </Stack>
      <Typography variant="caption" sx={{ color: "#91a9c6", px: 1 }}>
        Demonstration environment
      </Typography>
    </Box>
  );
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box component="nav" sx={{ width: { md: 246 }, flexShrink: 0 }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: 246, border: 0 },
          }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          open={mobile}
          onClose={() => setMobile(false)}
          sx={{ "& .MuiDrawer-paper": { width: 246 } }}
        >
          {sidebar}
        </Drawer>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 2, minHeight: "72px!important" }}>
            <IconButton
              sx={{ display: { md: "none" } }}
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/flights?destination=" + encodeURIComponent(search));
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                gap: 1,
                color: "text.secondary",
              }}
            >
              <Search fontSize="small" />
              <InputBase
                placeholder="Search a destination…"
                inputProps={{ "aria-label": "Search a destination" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ fontSize: 13, width: "100%", maxWidth: 330 }}
              />
            </Box>
            <IconButton
              aria-label="Notifications"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge
                badgeContent={notifications?.unread_count || 0}
                color="error"
              >
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              slotProps={{
                paper: {
                  sx: { width: { xs: 300, sm: 380 }, maxHeight: 480, p: 0.5 },
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Notifications ({notifications?.unread_count || 0} unread)
                </Typography>
                {(notifications?.unread_count || 0) > 0 && (
                  <Button
                    size="small"
                    sx={{ fontSize: 11 }}
                    onClick={async () => {
                      try {
                        await api.post("/notifications/read-all");
                        await reloadNotifications();
                      } catch (e) {}
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>
              <Divider />
              {notifications?.data?.data?.length > 0 ? (
                notifications.data.data.slice(0, 5).map((n) => (
                  <MenuItem
                    key={n.id}
                    sx={{
                      py: 1.2,
                      px: 2,
                      bgcolor: n.read_at ? "transparent" : "action.hover",
                      display: "block",
                      whiteSpace: "normal",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                    onClick={async () => {
                      if (!n.read_at) {
                        try {
                          await api.patch(`/notifications/${n.id}/read`);
                          await reloadNotifications();
                        } catch (e) {}
                      }
                      if (n.data?.action_url) {
                        navigate(n.data.action_url);
                      }
                      setNotifAnchor(null);
                    }}
                  >
                    <Typography fontSize={13} fontWeight={n.read_at ? 600 : 750}>
                      {n.data?.title || "Platform Notice"}
                    </Typography>
                    <Typography
                      fontSize={11.5}
                      color="text.secondary"
                      sx={{ mt: 0.3, lineHeight: 1.4 }}
                    >
                      {n.data?.message}
                    </Typography>
                    <Typography fontSize={10} color="text.disabled" sx={{ mt: 0.5 }}>
                      {dateTime(n.created_at)}
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    No notifications yet. Activity updates will appear here.
                  </Typography>
                </Box>
              )}
              <Divider />
              <Box p={1} textAlign="center">
                <Button
                  fullWidth
                  size="small"
                  component={Link}
                  to="/notifications"
                  onClick={() => setNotifAnchor(null)}
                >
                  View All Notifications
                </Button>
              </Box>
            </Menu>
            <ThemeToggle />
            <Button
              onClick={(e) => setAnchor(e.currentTarget)}
              color="inherit"
              sx={{ gap: 1, textAlign: "left", minWidth: 0 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#e5eeff",
                  color: "#0866d8",
                  fontSize: 14,
                }}
              >
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography fontSize={12} fontWeight={700}>
                  {user.name}
                </Typography>
                <Typography
                  fontSize={10}
                  color="text.secondary"
                  textTransform="capitalize"
                >
                  {user.role}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={anchor}
              open={!!anchor}
              onClose={() => setAnchor(null)}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={() => setAnchor(null)}
              >
                Profile & settings
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={async () => {
                  try {
                    await logout();
                    navigate("/login");
                  } catch {
                    notify("Sign out failed. Please retry.", "error");
                  }
                  setAnchor(null);
                }}
              >
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{ p: { xs: 2, lg: 3 }, maxWidth: 1720, mx: "auto" }}
        >
          <Alert
            icon={<VerifiedUser fontSize="small" />}
            severity="info"
            sx={{ mb: 3, py: 0, fontSize: 12 }}
          >
            Simulation only. Reservations are demonstrations; no real airline
            tickets, hotel reservations, or financial transactions are issued.
          </Alert>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
