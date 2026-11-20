import { useState, useEffect, useCallback, useRef, Component } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Skeleton,
  Chip,
  Stack,
} from "@mui/material";
import {
  FlightTakeoff,
  DarkMode,
  LightMode,
  SearchOff,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../services/api";
import { useApp } from "../context/AppContext";
export function Logo({ light = false }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.8}
      component={Link}
      to="/"
      sx={{
        textDecoration: "none",
        color: light ? "white" : "primary.main",
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: -1,
      }}
    >
      <FlightTakeoff sx={{ fontSize: 31 }} />
      <span>
        Travel<span style={{ color: "#ff8a24" }}>Ease</span>
      </span>
    </Stack>
  );
}
export function ThemeToggle() {
  const { mode, toggleTheme } = useApp();
  return (
    <Button
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
      onClick={toggleTheme}
      sx={{ minWidth: 40 }}
    >
      {mode === "light" ? <DarkMode /> : <LightMode />}
    </Button>
  );
}
export function Panel({ title, action, children, sx = {} }) {
  return (
    <Card sx={{ height: "100%", ...sx }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {title && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontSize={16}>
              {title}
            </Typography>
            {action}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
export function Empty({
  title = "Nothing here yet",
  detail = "Your activity will appear here.",
  action,
}) {
  return (
    <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
      <SearchOff sx={{ fontSize: 35, opacity: 0.6 }} />
      <Typography fontWeight={650} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" my={1}>
        {detail}
      </Typography>
      {action}
    </Box>
  );
}
export function Loading() {
  return (
    <Stack spacing={2} aria-label="Loading">
      <Skeleton variant="rounded" height={90} />
      <Skeleton variant="rounded" height={180} />
    </Stack>
  );
}
export function Failure({ error, retry }) {
  return (
    <Alert
      severity="error"
      action={
        retry && (
          <Button color="inherit" onClick={retry}>
            Retry
          </Button>
        )
      }
    >
      {error}
    </Alert>
  );
}
export function Status({ value }) {
  return (
    <Chip
      size="small"
      label={value}
      color={
        ["confirmed", "successful", "completed", "active"].includes(value)
          ? "success"
          : ["cancelled", "inactive", "failed"].includes(value)
            ? "error"
            : "warning"
      }
      variant="outlined"
    />
  );
}
export function useApi(path) {
  const sequence = useRef(0);
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    const current = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const r = await api.get(path);
      if (current === sequence.current) setData(r.data);
    } catch (e) {
      if (current === sequence.current) setError(errorMessage(e));
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    reload();
    return () => {
      sequence.current++;
    };
  }, [reload]);
  return { data, loading, error, reload, setData };
}
export function PageTitle({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={2}
      mb={3}
    >
      <Box>
        <Typography variant="h4" fontSize={{ xs: 25, md: 29 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" variant="body2" mt={0.7}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} textAlign="center" sx={{ maxWidth: 640, mx: "auto", my: 4 }}>
          <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
            <Typography fontWeight={700}>Unable to render this view</Typography>
            <Typography variant="body2">{this.state.error?.message || "An unexpected error occurred."}</Typography>
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
