import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
} from "@mui/material";
import { api, csrf } from "../services/api";
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export function AppProvider({ children }) {
  const [mode, setMode] = useState(() =>
    localStorage.getItem("travelease-theme") === "dark" ? "dark" : "light",
  );
  const [user, setUser] = useState(null),
    [booting, setBooting] = useState(true),
    [toast, setToast] = useState(null);
  useEffect(() => {
    api
      .get("/me")
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setBooting(false));
    const expire = () => setUser(null);
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0866d8" },
          secondary: { main: "#ff8a24" },
          background: {
            default: mode === "light" ? "#f3f7fd" : "#0b1627",
            paper: mode === "light" ? "#fff" : "#14243b",
          },
          text: {
            primary: mode === "light" ? "#14213d" : "#edf3ff",
            secondary: mode === "light" ? "#64748b" : "#b2c1d8",
          },
        },
        typography: {
          fontFamily: "Inter, Arial, sans-serif",
          h3: { fontWeight: 750 },
          h4: { fontWeight: 750 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { textTransform: "none", fontWeight: 650 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 7, minHeight: 40 } },
          },
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
          MuiCard: {
            styleOverrides: {
              root: {
                border: "1px solid",
                borderColor: mode === "light" ? "#e1e8f2" : "#293b56",
                boxShadow: "0 3px 18px #09203e05",
              },
            },
          },
        },
      }),
    [mode],
  );
  const toggleTheme = () =>
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      localStorage.setItem("travelease-theme", next);
      return next;
    });
  const login = async (payload) => {
    await csrf();
    const { data } = await api.post("/login", payload);
    setUser(data.data);
    return data.data;
  };
  const register = async (payload) => {
    await csrf();
    const { data } = await api.post("/register", payload);
    return data;
  };
  const verifyEmailOtp = async ({ email, code }) => {
    await csrf();
    const { data } = await api.post("/verify-email-otp", { email, code });
    if (data.data) {
      setUser(data.data);
    }
    return data.data;
  };
  const resendOtp = async (email) => {
    await csrf();
    const { data } = await api.post("/resend-verification-otp", { email });
    return data;
  };
  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };
  return (
    <AppContext.Provider
      value={{
        mode,
        toggleTheme,
        user,
        setUser,
        booting,
        login,
        register,
        verifyEmailOtp,
        resendOtp,
        logout,
        notify: (message, severity = "success") =>
          setToast({ message, severity }),
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <Snackbar
          open={!!toast}
          autoHideDuration={5000}
          onClose={() => setToast(null)}
        >
          <Alert
            severity={toast?.severity || "success"}
            onClose={() => setToast(null)}
          >
            {toast?.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
