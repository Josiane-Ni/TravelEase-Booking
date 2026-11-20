import axios from "axios";
const origin = import.meta.env.VITE_API_URL || "";
export const api = axios.create({
  baseURL: `${origin}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});
export const csrf = () =>
  axios.get(`${origin}/sanctum/csrf-cookie`, { withCredentials: true });
api.interceptors.response.use(
  (r) => {
    if (
      r.config.method !== "get" &&
      /notifications|checkout\/confirm|bookings\/.*\/cancel/.test(r.config.url)
    ) {
      window.dispatchEvent(new Event("notifications-changed"));
    }
    return r;
  },
  (error) => {
    if (error.response?.status === 401)
      window.dispatchEvent(new Event("session-expired"));
    return Promise.reject(error);
  },
);
export const errorMessage = (e) =>
  e.response?.data?.message ||
  "Unable to connect. Check your connection and try again.";
export const money = (minor = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(minor) / 100,
  );
export const dateTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
export const download = async (url, name) => {
  const { data } = await api.get(url, { responseType: "blob" });
  const href = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
};
