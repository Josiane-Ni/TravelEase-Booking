import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FlightTakeoff,
  PersonAdd,
  CancelOutlined,
  Shield,
  SupportAgent,
  Payment,
  NotificationsActive,
} from "@mui/icons-material";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Pagination,
  Chip,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useApp } from "../context/AppContext";
import { api, errorMessage, money, dateTime } from "../services/api";
import {
  PageTitle,
  Panel,
  Loading,
  Failure,
  Empty,
  useApi,
} from "../components/Common";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordField, strongPassword } from "./Auth";
export function WalletPage() {
  const topUpKey = useRef(crypto.randomUUID());
  const { data, loading, error, reload } = useApi("/wallet"),
    [open, setOpen] = useState(false),
    [amount, setAmount] = useState("100"),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const { notify } = useApp();
  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const d = data.data;
  return (
    <>
      <PageTitle
        title="Your TravelEase wallet"
        subtitle="Simulated balance and immutable transaction history."
        action={
          <Button
            variant="contained"
            onClick={() => {
              setFailure("");
              topUpKey.current = crypto.randomUUID();
              setOpen(true);
            }}
          >
            Simulated top up
          </Button>
        }
      />
      <Panel title="Available simulated balance">
        <Typography variant="h3" color="primary">
          {money(d.balance_minor)}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          USD · No real monetary value
        </Typography>
      </Panel>
      <Box mt={3}>
        <Panel title="Recent transactions">
          {d.transactions.data.length ? (
            d.transactions.data.map((t) => (
              <Stack
                key={t.id}
                direction="row"
                justifyContent="space-between"
                gap={2}
                sx={{ py: 2, borderBottom: 1, borderColor: "divider" }}
              >
                <Box>
                  <Typography textTransform="capitalize" fontWeight={650}>
                    {t.type.replaceAll("_", " ")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dateTime(t.created_at)}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {t.reference}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    color={t.amount_minor > 0 ? "success.main" : "error.main"}
                    fontWeight={700}
                  >
                    {t.amount_minor > 0 ? "+" : ""}
                    {money(t.amount_minor)}
                  </Typography>
                  <Typography variant="caption">
                    Balance: {money(t.balance_after_minor)}
                  </Typography>
                </Box>
              </Stack>
            ))
          ) : (
            <Empty title="No transactions yet" />
          )}
        </Panel>
      </Box>
      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add simulated wallet funds</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Demo funds only. No real payment is collected.
          </Alert>
          {failure && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {failure}
            </Alert>
          )}
          <TextField
            type="number"
            label="Amount (USD)"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              topUpKey.current = crypto.randomUUID();
            }}
            inputProps={{ min: 1, max: 1000, step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            loading={busy}
            onClick={async () => {
              const n = Number(amount);
              if (!Number.isInteger(n) || n < 1 || n > 1000) {
                setFailure("Enter a whole dollar amount from $1 to $1,000.");
                return;
              }
              setBusy(true);
              try {
                await api.post("/wallet/top-up", {
                  amount_minor: n * 100,
                  idempotency_key: topUpKey.current,
                });
                setOpen(false);
                notify("Simulated funds added.");
                await reload();
              } catch (e) {
                setFailure(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Add demo funds
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export function LoyaltyPage() {
  const { data, loading, error, reload } = useApi("/loyalty");
  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const d = data.data;
  return (
    <>
      <PageTitle
        title="Loyalty Points"
        subtitle="Earn points with your simulated journeys."
      />
      <Panel title="Your point balance">
        <Typography variant="h3" color="primary">
          {d.points.toLocaleString()}
        </Typography>
        <Typography variant="body2" mt={2}>
          Earn 1 point per $10 of confirmed bookings. Points are reversed when a
          booking is cancelled.
        </Typography>
        <Alert severity="success" sx={{ mt: 3 }}>
          <strong>Points Redemption Active:</strong> You can redeem your loyalty points during checkout for an instant discount of $0.10 per point (up to 50% of your booking total).
        </Alert>
      </Panel>
      <Box mt={3}>
        <Panel title="Point history">
          {d.transactions.data.length ? (
            d.transactions.data.map((t) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                key={t.id}
                py={2}
              >
                <Typography textTransform="capitalize">{t.type}</Typography>
                <Typography
                  fontWeight={700}
                  color={t.points > 0 ? "success.main" : "error.main"}
                >
                  {t.points > 0 ? "+" : ""}
                  {t.points} points
                </Typography>
              </Stack>
            ))
          ) : (
            <Empty title="No loyalty activity yet" />
          )}
        </Panel>
      </Box>
    </>
  );
}
export function NotificationsPage() {
  const { data, loading, error, reload } = useApi("/notifications"),
    { user, notify } = useApp(),
    [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;

  const getCategoryChip = (category) => {
    switch (category) {
      case "booking":
        return (
          <Chip
            size="small"
            color="success"
            icon={<FlightTakeoff fontSize="small" />}
            label="Booking"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      case "cancellation":
        return (
          <Chip
            size="small"
            color="warning"
            icon={<CancelOutlined fontSize="small" />}
            label="Cancellation"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      case "user_registered":
        return (
          <Chip
            size="small"
            color="info"
            icon={<PersonAdd fontSize="small" />}
            label="New User"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      case "fraud":
        return (
          <Chip
            size="small"
            color="error"
            icon={<Shield fontSize="small" />}
            label="Fraud Alert"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      case "support":
        return (
          <Chip
            size="small"
            color="secondary"
            icon={<SupportAgent fontSize="small" />}
            label="Inquiry"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      case "payment_failed":
        return (
          <Chip
            size="small"
            color="error"
            icon={<Payment fontSize="small" />}
            label="Payment Failed"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            variant="outlined"
            label="System Alert"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        );
    }
  };

  return (
    <>
      <PageTitle
        title="Notifications & Activity Feed"
        subtitle={`${data.unread_count} unread updates · Real-time event notifications`}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            {user?.role === "admin" && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<NotificationsActive />}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api.post("/admin/test-notification");
                    notify("Simulated customer action notification dispatched!");
                    await reload();
                  } catch (e) {
                    notify(errorMessage(e), "error");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Send Test Alert
              </Button>
            )}
            <Button
              variant="outlined"
              disabled={busy || !data.unread_count}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post("/notifications/read-all");
                  await reload();
                  notify("All notifications marked as read.");
                } catch (e) {
                  notify(errorMessage(e), "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Mark all as read
            </Button>
          </Stack>
        }
      />
      <Panel>
        {data.data.data.length ? (
          data.data.data.map((n) => (
            <Box
              key={n.id}
              sx={{
                p: 2.2,
                mb: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: n.read_at ? "divider" : "primary.main",
                bgcolor: n.read_at ? "transparent" : "action.hover",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1.5}
              >
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                    <Typography fontWeight={750} fontSize={15}>
                      {n.data.title}
                    </Typography>
                    {n.data.category && getCategoryChip(n.data.category)}
                    {!n.read_at && (
                      <Chip
                        size="small"
                        label="NEW"
                        color="primary"
                        sx={{ height: 18, fontSize: 10, fontWeight: 800 }}
                      />
                    )}
                  </Stack>
                  <Typography color="text.secondary" variant="body2" my={0.8} sx={{ lineHeight: 1.6 }}>
                    {n.data.message}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {dateTime(n.created_at)}
                    </Typography>
                    {n.data.action_url && (
                      <Button
                        size="small"
                        component={Link}
                        to={n.data.action_url}
                        sx={{ textTransform: "none", p: 0, fontSize: 12, fontWeight: 700 }}
                      >
                        Open Workspace →
                      </Button>
                    )}
                  </Stack>
                </Box>
                {!n.read_at && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await api.patch("/notifications/" + n.id + "/read");
                        await reload();
                      } catch (e) {
                        notify(errorMessage(e), "error");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    sx={{ textTransform: "none", fontSize: 12, minWidth: 90 }}
                  >
                    Mark read
                  </Button>
                )}
              </Stack>
            </Box>
          ))
        ) : (
          <Empty
            title="You’re all caught up"
            detail="Platform events, customer bookings, and administrative alerts will appear here in real time."
          />
        )}
      </Panel>
    </>
  );
}
export function ProfilePage() {
  const { user, setUser, notify } = useApp(),
    [failure, setFailure] = useState("");
  const profile = useForm({
      defaultValues: { name: user.name, phone: user.phone || "" },
    }),
    password = useForm({
      resolver: zodResolver(
        z
          .object({
            current_password: z.string().min(1, "Enter your current password."),
            password: strongPassword,
            password_confirmation: z.string(),
          })
          .refine((v) => v.password === v.password_confirmation, {
            message: "Passwords do not match.",
            path: ["password_confirmation"],
          }),
      ),
    });
  const submit = async (fn) => {
    setFailure("");
    try {
      await fn();
    } catch (e) {
      setFailure(errorMessage(e));
    }
  };
  return (
    <>
      <PageTitle
        title="Profile & Settings"
        subtitle="Keep your details and password up to date."
      />
      {failure && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {failure}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Panel title="Personal information">
          <Stack
            component="form"
            spacing={3}
            onSubmit={profile.handleSubmit((values) =>
              submit(async () => {
                const { data } = await api.put("/profile", values);
                setUser(data.data);
                notify("Profile updated.");
              }),
            )}
          >
            <TextField
              label="Full name"
              required
              {...profile.register("name")}
            />
            <TextField
              label="Phone number"
              required
              {...profile.register("phone")}
            />
            <TextField label="Email address" value={user.email} disabled />
            <Button
              type="submit"
              variant="contained"
              loading={profile.formState.isSubmitting}
            >
              Save profile
            </Button>
          </Stack>
        </Panel>
        <Panel title="Change password">
          <Stack
            component="form"
            spacing={3}
            onSubmit={password.handleSubmit((values) =>
              submit(async () => {
                await api.put("/password", values);
                password.reset();
                notify("Password updated.");
              }),
            )}
          >
            <PasswordField
              label="Current Password"
              registration={password.register("current_password")}
              error={password.formState.errors.current_password?.message}
            />
            <PasswordField
              label="New Password"
              registration={password.register("password")}
              error={password.formState.errors.password?.message}
            />
            <PasswordField
              label="Confirm Password"
              registration={password.register("password_confirmation")}
              error={password.formState.errors.password_confirmation?.message}
            />
            <Typography variant="caption" color="text.secondary">
              At least 8 characters, uppercase and lowercase letters, a number
              and special character.
            </Typography>
            <Button
              type="submit"
              variant="contained"
              loading={password.formState.isSubmitting}
            >
              Update password
            </Button>
          </Stack>
        </Panel>
      </Box>
    </>
  );
}
