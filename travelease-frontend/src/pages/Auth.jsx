import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  FlightTakeoff,
  Hotel,
  Luggage,
  Shield,
  PersonAdd,
  Login as LoginIcon,
  Person,
  BusinessCenter,
  MarkEmailRead,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApp } from "../context/AppContext";
import { Logo, ThemeToggle } from "../components/Common";
import { api, csrf, errorMessage } from "../services/api";
export const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128)
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a special character.");
export const registrationSchema = z
  .object({
    role: z.enum(["customer", "agent"]).default("customer"),
    name: z.string().min(2, "Enter your full name.").max(100),
    phone: z
      .string()
      .regex(/^[+0-9 ()-]{7,30}$/, "Enter a valid phone number."),
    email: z
      .email("Enter a valid email address.")
      .transform((v) => v.toLowerCase()),
    password: strongPassword,
    password_confirmation: z.string(),
    terms: z.boolean().refine((v) => v, "Accept the terms to continue."),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });
const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().optional(),
});
export function PasswordField({ label, registration, error }) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      {...registration}
      label={label}
      type={show ? "text" : "password"}
      error={!!error}
      helperText={error}
      autoComplete={label === "Password" ? "current-password" : "new-password"}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Lock fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
                onClick={() => setShow(!show)}
                edge="end"
              >
                <VisibilityIcon show={show} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
function VisibilityIcon({ show }) {
  return show ? (
    <VisibilityOff fontSize="small" />
  ) : (
    <Visibility fontSize="small" />
  );
}
export function AuthPage({ registerMode = false }) {
  const { login, register: registerUser, user, notify } = useApp(),
    navigate = useNavigate(),
    location = useLocation();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError: fieldError,
  } = useForm({
    resolver: zodResolver(registerMode ? registrationSchema : loginSchema),
    defaultValues: {
      role: "customer",
      name: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms: false,
      remember: false,
    },
  });
  const selectedRole = watch("role") || "customer";

  const submit = async (values) => {
    setError("");
    try {
      if (registerMode) {
        const res = await registerUser(values);
        notify(
          res.message || "Account created! Please check your email for the verification code.",
          "success",
        );
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, {
          replace: true,
          state: { email: values.email },
        });
      } else {
        const u = await login(values);
        notify("Welcome back.");
        const from = location.state?.from;
        const safeFrom =
          typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//") &&
          !["/login", "/register", "/verify-email"].includes(from)
            ? from
            : null;
        navigate(safeFrom || `/${u.role}/dashboard`, { replace: true });
      }
    } catch (e) {
      if (
        !registerMode &&
        e.response?.status === 403 &&
        e.response?.data?.requires_verification
      ) {
        notify(
          e.response.data.message ||
            "Please verify your email address to continue.",
          "warning",
        );
        navigate(
          `/verify-email?email=${encodeURIComponent(e.response.data.email || values.email)}`,
          {
            state: {
              email: e.response.data.email || values.email,
            },
          },
        );
        return;
      }
      setError(errorMessage(e));
      Object.entries(e.response?.data?.errors || {}).forEach(
        ([name, messages]) => fieldError(name, { message: messages[0] }),
      );
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "44% 56%" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          backgroundImage: `linear-gradient(180deg,#09203f55,#09203fe8),url(/images/${registerMode ? "mountains" : "ocean"}.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          p: { md: 5, lg: 7 },
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Logo light />
          <Typography
            variant="h3"
            sx={{
              mt: 10,
              fontSize: { md: 42, lg: 53 },
              lineHeight: 1.16,
              maxWidth: 440,
            }}
          >
            {registerMode ? (
              <>
                Start Your
                <br />
                Travel Journey
              </>
            ) : (
              <>
                Explore
                <br />
                The World
              </>
            )}
            <br />
            <Box component="span" sx={{ fontSize: 30, fontWeight: 400 }}>
              with TravelEase
            </Box>
          </Typography>
          <Box
            sx={{ width: 66, height: 4, bgcolor: "secondary.main", my: 3 }}
          />
          <Typography sx={{ maxWidth: 300, color: "#e5f1ff", lineHeight: 1.8 }}>
            Book flights, hotels, and holiday packages all in one place.
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ mt: 8 }}>
          {[
            [FlightTakeoff, "Flight Bookings"],
            [Hotel, "Hotel Reservations"],
            [Luggage, "Holiday Packages"],
            [Shield, "Safe & Secure Booking"],
          ].map(([Icon, label]) => (
            <Stack key={label} direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  border: "1px solid #ffffff40",
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Typography fontSize={14}>{label}</Typography>
            </Stack>
          ))}
          <Typography variant="caption" sx={{ pt: 3, opacity: 0.7 }}>
            A travel booking simulation. Your imagination, your destination.
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          position: "relative",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          minHeight: "100vh",
        }}
      >
        <Box sx={{ position: "absolute", right: 20, top: 18 }}>
          <ThemeToggle />
        </Box>
        <Box sx={{ maxWidth: 440, width: "100%", py: 3 }}>
          <Stack alignItems="center" spacing={1} mb={4}>
            <Logo />
            <Typography variant="caption" color="text.secondary">
              Book Flights • Hotels • Packages
            </Typography>
          </Stack>
          <Typography variant="h4" fontSize={29}>
            {registerMode ? "Create an Account" : "Welcome Back"}
          </Typography>
          <Typography color="text.secondary" variant="body2" mt={1} mb={3}>
            {registerMode
              ? "Join TravelEase and start your next journey"
              : "Login to your TravelEase account"}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack
            component="form"
            onSubmit={handleSubmit(submit)}
            spacing={2.3}
            noValidate
          >
            {registerMode && (
              <>
                <Box sx={{ mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
                  >
                    Select Your Role:
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Box
                      onClick={() =>
                        setValue("role", "customer", { shouldValidate: true })
                      }
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor:
                          selectedRole === "customer"
                            ? "primary.main"
                            : "divider",
                        bgcolor:
                          selectedRole === "customer"
                            ? "primary.main"
                            : "background.paper",
                        color:
                          selectedRole === "customer"
                            ? "white"
                            : "text.primary",
                        transition: "all 0.2s ease-in-out",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 0.5,
                        boxShadow:
                          selectedRole === "customer"
                            ? "0 4px 12px rgba(8, 120, 235, 0.25)"
                            : "none",
                      }}
                    >
                      <Person
                        fontSize="medium"
                        sx={{
                          color:
                            selectedRole === "customer"
                              ? "white"
                              : "primary.main",
                        }}
                      />
                      <Typography
                        fontWeight={700}
                        fontSize={14}
                        sx={{
                          color:
                            selectedRole === "customer" ? "white" : "inherit",
                        }}
                      >
                        Customer
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color:
                            selectedRole === "customer"
                              ? "rgba(255,255,255,0.85)"
                              : "text.secondary",
                        }}
                      >
                        Book flights, hotels & packages
                      </Typography>
                    </Box>

                    <Box
                      onClick={() =>
                        setValue("role", "agent", { shouldValidate: true })
                      }
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor:
                          selectedRole === "agent" ? "primary.main" : "divider",
                        bgcolor:
                          selectedRole === "agent"
                            ? "primary.main"
                            : "background.paper",
                        color:
                          selectedRole === "agent" ? "white" : "text.primary",
                        transition: "all 0.2s ease-in-out",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 0.5,
                        boxShadow:
                          selectedRole === "agent"
                            ? "0 4px 12px rgba(8, 120, 235, 0.25)"
                            : "none",
                      }}
                    >
                      <BusinessCenter
                        fontSize="medium"
                        sx={{
                          color:
                            selectedRole === "agent" ? "white" : "primary.main",
                        }}
                      />
                      <Typography
                        fontWeight={700}
                        fontSize={14}
                        sx={{
                          color: selectedRole === "agent" ? "white" : "inherit",
                        }}
                      >
                        Travel Agent
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color:
                            selectedRole === "agent"
                              ? "rgba(255,255,255,0.85)"
                              : "text.secondary",
                        }}
                      >
                        Corporate bookings & commissions
                      </Typography>
                    </Box>
                  </Stack>
                  <input type="hidden" {...register("role")} />
                  {errors.role && (
                    <Typography color="error" fontSize={12} sx={{ mt: 0.5 }}>
                      {errors.role.message}
                    </Typography>
                  )}
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Full Name"
                    autoComplete="name"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  <TextField
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Stack>
              </>
            )}
            <TextField
              label="Email Address"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <PasswordField
              label="Password"
              registration={register("password")}
              error={errors.password?.message}
            />
            {registerMode ? (
              <>
                <PasswordField
                  label="Confirm Password"
                  registration={register("password_confirmation")}
                  error={errors.password_confirmation?.message}
                />
                <Alert severity="info" sx={{ fontSize: 12 }}>
                  Use at least 8 characters, uppercase and lowercase letters, a
                  number, and a special character.
                </Alert>
                <Box>
                  <FormControlLabel
                    control={<Checkbox {...register("terms")} />}
                    label={
                      <Typography fontSize={12}>
                        I agree to the{" "}
                        <Link to="/terms">Terms & Conditions</Link> and{" "}
                        <Link to="/privacy">Privacy Policy</Link>.
                      </Typography>
                    }
                  />
                  {errors.terms && (
                    <Typography color="error" fontSize={12}>
                      {errors.terms.message}
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormControlLabel
                  control={<Checkbox size="small" {...register("remember")} />}
                  label={<Typography fontSize={13}>Remember me</Typography>}
                />
                <Typography
                  component={Link}
                  to="/forgot-password"
                  fontSize={13}
                >
                  Forgot Password?
                </Typography>
              </Stack>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              startIcon={registerMode ? <PersonAdd /> : <LoginIcon />}
              sx={{
                background: "linear-gradient(100deg,#0878eb,#4840ce)",
                height: 47,
              }}
            >
              {registerMode ? "Register" : "Login"}
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Secure session authentication · Simulation environment
            </Typography>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Typography textAlign="center" variant="body2">
            {registerMode
              ? "Already have an account?"
              : "Don’t have an account?"}{" "}
            <Link to={registerMode ? "/login" : "/register"}>
              {registerMode ? "Login Here" : "Register Now"}
            </Link>
          </Typography>
          <Button component={Link} to="/" fullWidth sx={{ mt: 2 }}>
            Back to TravelEase
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
export function PasswordRecovery({ reset = false }) {
  const [params] = useSearchParams(),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(
      reset
        ? z
            .object({
              email: z.email(),
              token: z
                .string()
                .min(1, "Use the reset link sent to your email."),
              password: strongPassword,
              password_confirmation: z.string(),
            })
            .refine((v) => v.password === v.password_confirmation, {
              message: "Passwords do not match.",
              path: ["password_confirmation"],
            })
        : z.object({ email: z.email("Enter a valid email address.") }),
    ),
    defaultValues: {
      email: params.get("email") || "",
      token: params.get("token") || "",
    },
  });
  return (
    <Box sx={{ maxWidth: 450, mx: "auto", py: 8, px: 2 }}>
      <Logo />
      <Typography variant="h5" my={3}>
        {reset ? "Reset your password" : "Forgot your password?"}
      </Typography>
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
        spacing={2}
        onSubmit={handleSubmit(async (values) => {
          setError("");
          try {
            await csrf();
            const { data } = await api.post(
              reset ? "/reset-password" : "/forgot-password",
              values,
            );
            setSuccess(data.message);
          } catch (e) {
            setError(errorMessage(e));
          }
        })}
      >
        <TextField
          label="Email Address"
          type="email"
          required
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        {reset && (
          <>
            <PasswordField
              label="New Password"
              registration={register("password")}
              error={errors.password?.message}
            />
            <PasswordField
              label="Confirm Password"
              registration={register("password_confirmation")}
              error={errors.password_confirmation?.message}
            />
          </>
        )}
        {errors.token && <Alert severity="error">{errors.token.message}</Alert>}
        <Button type="submit" variant="contained" loading={isSubmitting}>
          {reset ? "Reset password" : "Send reset link"}
        </Button>
        <Button component={Link} to="/login">
          Return to login
        </Button>
      </Stack>
    </Box>
  );
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailOtp, resendOtp, notify } = useApp();

  const initialEmail = params.get("email") || location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please provide your email address.");
      return;
    }
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const user = await verifyEmailOtp({ email, code: cleanCode });
      notify("Email verified successfully! Welcome to TravelEase.");
      const targetDashboard = user?.role
        ? `/${user.role}/dashboard`
        : "/customer/dashboard";
      navigate(targetDashboard, { replace: true });
    } catch (err) {
      setError(errorMessage(err) || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please provide your email address.");
      return;
    }
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const res = await resendOtp(email);
      setSuccess(
        res.message || "A new verification code has been sent to your email.",
      );
      setCountdown(60);
    } catch (err) {
      setError(errorMessage(err) || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: { xs: 2, sm: 4 },
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", right: 24, top: 20 }}>
        <ThemeToggle />
      </Box>

      <Box
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Stack alignItems="center" spacing={1} mb={3}>
          <Logo />
        </Stack>

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <MarkEmailRead sx={{ fontSize: 36, color: "primary.main" }} />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Verify Your Email
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We have sent a 6-digit One-Time Password (OTP) verification code to{" "}
          <Typography
            component="span"
            fontWeight={600}
            color="text.primary"
            sx={{ wordBreak: "break-all" }}
          >
            {email || "your registered email"}
          </Typography>
          . Please check your inbox and enter the code below to complete registration and access your dashboard.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, textAlign: "left" }}>
            {success}
          </Alert>
        )}

        <Stack component="form" onSubmit={handleVerify} spacing={2.5}>
          {!initialEmail && (
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              required
            />
          )}

          <Box>
            <TextField
              label="Enter 6-Digit OTP Code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              fullWidth
              placeholder="123456"
              autoFocus
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: 28,
                    letterSpacing: 10,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  },
                },
              }}
              helperText="Codes expire after 10 minutes"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            startIcon={<CheckCircle />}
            disabled={code.trim().length !== 6}
            sx={{
              background: "linear-gradient(100deg,#0878eb,#4840ce)",
              height: 48,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Verify & Activate Account
          </Button>

          <Divider sx={{ my: 1 }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              Didn't receive the code?
            </Typography>
            <Button
              size="small"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              startIcon={<Refresh />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? "Sending..."
                  : "Resend Code"}
            </Button>
          </Stack>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Typography
              component={Link}
              to="/register"
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none" }}
            >
              Register with different email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none" }}
            >
              Sign In
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
