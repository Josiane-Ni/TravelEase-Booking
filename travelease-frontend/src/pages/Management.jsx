import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add,
  Download,
  Hotel as HotelIcon,
  Luggage as LuggageIcon,
  LocalOffer,
  VerifiedUser,
  Shield,
  PictureAsPdf,
  Refresh,
  UploadFile,
  MeetingRoom,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useForm } from "react-hook-form";
import { api, errorMessage, money, dateTime, download } from "../services/api";
import { useApp } from "../context/AppContext";
import {
  useApi,
  PageTitle,
  Panel,
  Loading,
  Failure,
  Empty,
  Status,
} from "../components/Common";
export function FlightManagement() {
  const [page, setPage] = useState(1),
    { data, loading, error, reload } = useApi("/admin/flights?page=" + page),
    airlines = useApi("/airlines"),
    [editing, setEditing] = useState(null),
    [open, setOpen] = useState(false),
    [failure, setFailure] = useState(""),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false),
    [airlineOpen, setAirlineOpen] = useState(false),
    [airlineLogo, setAirlineLogo] = useState(""),
    [airlineUploading, setAirlineUploading] = useState(false);
  const { notify } = useApp(),
    {
      register,
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = useForm(),
    {
      register: regAirline,
      reset: resetAirline,
      handleSubmit: handleAirlineSubmit,
      setValue: setAirlineVal,
      formState: { isSubmitting: isAirlineSubmitting },
    } = useForm();
  const edit = (f) => {
    setEditing(f);
    setFailure("");
    reset(
      f
        ? {
            airline_id: f.airline.id,
            flight_number: f.flight_number,
            origin: f.origin,
            destination: f.destination,
            departure_at: f.departure_at.slice(0, 16),
            arrival_at: f.arrival_at.slice(0, 16),
            fare_minor: f.classes.find((c) => c.name === "Economy").fare_minor,
            tax_minor: f.classes.find((c) => c.name === "Economy").tax_minor,
            capacity: f.classes.find((c) => c.name === "Economy").capacity,
            cancellation_hours: f.cancellation_hours,
            cancellation_fee_percent: f.cancellation_fee_percent,
          }
        : {
            airline_id: airlines.data?.data?.[0]?.id || "",
            flight_number: "",
            origin: "Kigali",
            destination: "",
            departure_at: "",
            arrival_at: "",
            fare_minor: 24000,
            tax_minor: 2500,
            capacity: 30,
            cancellation_hours: 24,
            cancellation_fee_percent: 10,
          },
    );
    setOpen(true);
  };
  const columns = [
    { field: "flight_number", headerName: "Flight", width: 100 },
    {
      field: "airline",
      headerName: "Airline",
      width: 150,
      valueGetter: (_, row) => row.airline.name,
    },
    { field: "origin", headerName: "From", width: 110 },
    { field: "destination", headerName: "To", width: 130 },
    {
      field: "departure_at",
      headerName: "Departure (UTC)",
      width: 180,
      valueFormatter: (v) => dateTime(v),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (p) => <Status value={p.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 190,
      sortable: false,
      renderCell: (p) => (
        <>
          <Button
            size="small"
            onClick={() => edit(p.row)}
            disabled={p.row.status !== "scheduled"}
          >
            Edit
          </Button>
          <Button
            color="error"
            size="small"
            disabled={p.row.status !== "scheduled"}
            onClick={() => {
              setFailure("");
              setDeleting(p.row);
            }}
          >
            Deactivate
          </Button>
        </>
      ),
    },
  ];
  return (
    <>
      <PageTitle
        title="Flight management"
        subtitle="Manage demonstration schedules, fares, and seat inventory."
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => {
                resetAirline({ name: "", code: "", logo_path: "" });
                setAirlineLogo("");
                setFailure("");
                setAirlineOpen(true);
              }}
            >
              Add Airline
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => edit(null)}
            >
              Add New Flight
            </Button>
          </Stack>
        }
      />
      {error && <Failure error={error} retry={reload} />}
      <Panel>
        <Box sx={{ height: 560, width: "100%" }}>
          <DataGrid
            rows={data?.data || []}
            columns={columns}
            loading={loading}
            rowCount={data?.meta?.total || 0}
            paginationMode="server"
            paginationModel={{ page: page - 1, pageSize: 20 }}
            onPaginationModelChange={(m) => setPage(m.page + 1)}
            pageSizeOptions={[20]}
            disableRowSelectionOnClick
            sx={{ border: 0 }}
          />
        </Box>
      </Panel>
      <Dialog
        open={open}
        onClose={() => !isSubmitting && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setFailure("");
            try {
              const payload = {
                ...values,
                departure_at: values.departure_at + ":00Z",
                arrival_at: values.arrival_at + ":00Z",
              };
              if (editing)
                await api.put("/admin/flights/" + editing.id, payload);
              else await api.post("/admin/flights", payload);
              setOpen(false);
              notify(editing ? "Flight updated." : "Flight and seats created.");
              await reload();
            } catch (e) {
              setFailure(errorMessage(e));
            }
          })}
        >
          <DialogTitle>
            {editing ? "Edit Flight" : "Add New Flight"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField
                select
                label="Airline"
                required
                defaultValue={
                  editing?.airline.id || airlines.data?.data?.[0]?.id || ""
                }
                {...register("airline_id")}
              >
                {airlines.data?.data?.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
              {[
                ["flight_number", "Flight number"],
                ["origin", "Origin"],
                ["destination", "Destination"],
              ].map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  required
                  {...register(key)}
                />
              ))}
              {[
                ["departure_at", "Departure (UTC)"],
                ["arrival_at", "Arrival (UTC)"],
              ].map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  type="datetime-local"
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register(key)}
                />
              ))}
              {[
                ["fare_minor", "Economy base fare (USD cents)"],
                ["tax_minor", "Taxes (USD cents)"],
                [
                  "capacity",
                  editing
                    ? "Current economy seat capacity (unchanged)"
                    : "Economy seat capacity",
                ],
                ["cancellation_hours", "Cancellation deadline (hours)"],
                ["cancellation_fee_percent", "Cancellation fee (%)"],
              ].map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  type="number"
                  required
                  inputProps={{ min: 0 }}
                  {...register(key)}
                />
              ))}
              {editing && (
                <Alert severity="info">
                  Editing a flight with held or booked seats is blocked. Keep
                  the existing seat capacity.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Save flight
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={!!deleting} onClose={() => !busy && setDeleting(null)}>
        <DialogTitle>Deactivate {deleting?.flight_number}?</DialogTitle>
        <DialogContent>
          {failure && <Alert severity="error">{failure}</Alert>}
          <Typography>
            This hides the flight from search. Flights with active holds or
            bookings cannot be deactivated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setDeleting(null)}>
            Keep flight
          </Button>
          <Button
            color="error"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.delete("/admin/flights/" + deleting.id);
                setDeleting(null);
                notify("Flight deactivated.");
                await reload();
              } catch (e) {
                setFailure(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={airlineOpen}
        onClose={() => !isAirlineSubmitting && setAirlineOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box
          component="form"
          onSubmit={handleAirlineSubmit(async (values) => {
            setFailure("");
            try {
              await api.post("/admin/airlines", values);
              setAirlineOpen(false);
              notify("New airline registered successfully.");
              await airlines.reload();
            } catch (e) {
              setFailure(errorMessage(e));
            }
          })}
        >
          <DialogTitle>Register New Airline</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField label="Airline Name (e.g. RwandAir)" required {...regAirline("name", { required: true })} />
              <TextField
                label="Airline Code (2-3 chars, e.g. WB)"
                required
                inputProps={{ maxLength: 3, style: { textTransform: "uppercase" } }}
                {...regAirline("code", { required: true })}
              />
              <Box>
                <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                  Airline Logo (PNG/JPEG &le; 2MB)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFile />}
                    disabled={airlineUploading}
                  >
                    {airlineUploading ? "Uploading..." : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setAirlineUploading(true);
                        setFailure("");
                        try {
                          const fd = new FormData();
                          fd.append("image", file);
                          fd.append("folder", "airlines");
                          const res = await api.post("/upload", fd, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          setAirlineLogo(res.data.data.path);
                          setAirlineVal("logo_path", res.data.data.path);
                          notify("Airline logo uploaded.");
                        } catch (err) {
                          setFailure(errorMessage(err));
                        } finally {
                          setAirlineUploading(false);
                        }
                      }}
                    />
                  </Button>
                  {airlineLogo && (
                    <Box
                      component="img"
                      src={airlineLogo}
                      alt="Logo preview"
                      sx={{ height: 36, maxWidth: 100, objectFit: "contain", border: 1, borderColor: "divider", p: 0.5, borderRadius: 1 }}
                    />
                  )}
                </Stack>
                <TextField
                  size="small"
                  label="Logo Path"
                  fullWidth
                  sx={{ mt: 1.5 }}
                  {...regAirline("logo_path")}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={isAirlineSubmitting} onClick={() => setAirlineOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={isAirlineSubmitting}>
              Create Airline
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
export function UserManagement() {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    { data, loading, error, reload } = useApi(
      "/admin/users?search=" + encodeURIComponent(search) + "&page=" + page,
    ),
    [editing, setEditing] = useState(null),
    [role, setRole] = useState("customer"),
    [status, setStatus] = useState("active"),
    [failure, setFailure] = useState(""),
    [busy, setBusy] = useState(false);
  const { user, notify } = useApp();
  return (
    <>
      <PageTitle
        title="Users & roles"
        subtitle="Only administrators can assign elevated roles or deactivate accounts."
      />
      <TextField
        label="Search users"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 3, maxWidth: 400 }}
      />
      {error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={data?.data || []}
              loading={loading}
              columns={[
                { field: "name", headerName: "Name", width: 200 },
                { field: "email", headerName: "Email", width: 260 },
                { field: "role", headerName: "Role", width: 120 },
                {
                  field: "status",
                  headerName: "Status",
                  width: 120,
                  renderCell: (p) => <Status value={p.value} />,
                },
                {
                  field: "action",
                  headerName: "Access",
                  width: 150,
                  sortable: false,
                  renderCell: (p) => (
                    <Button
                      size="small"
                      disabled={p.row.id === user.id}
                      onClick={() => {
                        setEditing(p.row);
                        setRole(p.row.role);
                        setStatus(p.row.status);
                        setFailure("");
                      }}
                    >
                      Manage access
                    </Button>
                  ),
                },
              ]}
              rowCount={data?.meta?.total || 0}
              paginationMode="server"
              paginationModel={{ page: page - 1, pageSize: 20 }}
              onPaginationModelChange={(m) => setPage(m.page + 1)}
              pageSizeOptions={[20]}
              disableRowSelectionOnClick
              sx={{ border: 0 }}
            />
          </Box>
        </Panel>
      )}
      <Dialog
        open={!!editing}
        onClose={() => !busy && setEditing(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Manage {editing?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} pt={2}>
            {failure && <Alert severity="error">{failure}</Alert>}
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {["customer", "agent", "admin"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Account status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.put("/admin/users/" + editing.id, { role, status });
                setEditing(null);
                notify("Account access updated.");
                await reload();
              } catch (e) {
                setFailure(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export function ClientsPage() {
  const { data, loading, error, reload } = useApi("/agent/clients"),
    [editing, setEditing] = useState(null),
    [open, setOpen] = useState(false),
    [failure, setFailure] = useState("");
  const {
      register,
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = useForm(),
    { notify } = useApp();
  return (
    <>
      <PageTitle
        title="Corporate clients"
        subtitle="Only clients assigned to your agent account are shown."
        action={
          <Button
            variant="contained"
            onClick={() => {
              setEditing(null);
              reset({ name: "", contact_email: "", phone: "" });
              setFailure("");
              setOpen(true);
            }}
          >
            Add New Client
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const clientList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            return clientList.length ? (
              clientList.map((c) => (
                <Stack
                  key={c.id}
                  direction="row"
                  justifyContent="space-between"
                  gap={2}
                  py={2}
                >
                  <Box>
                    <Typography fontWeight={700}>{c.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {c.contact_email} · {c.phone}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => {
                      setEditing(c);
                      reset(c);
                      setFailure("");
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              ))
            ) : (
              <Empty title="No clients yet" />
            );
          })()}
        </Panel>
      )}
      <Dialog
        open={open}
        onClose={() => !isSubmitting && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setFailure("");
            try {
              if (editing)
                await api.put("/agent/clients/" + editing.id, values);
              else await api.post("/agent/clients", values);
              setOpen(false);
              notify("Client saved.");
              await reload();
            } catch (e) {
              setFailure(errorMessage(e));
            }
          })}
        >
          <DialogTitle>
            {editing ? "Edit corporate client" : "Add corporate client"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField label="Company name" required {...register("name")} />
              <TextField
                label="Contact email"
                type="email"
                required
                {...register("contact_email")}
              />
              <TextField label="Phone" {...register("phone")} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={isSubmitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={isSubmitting}>
              Save client
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
export function AuditPage() {
  const [page, setPage] = useState(1),
    { data, loading, error, reload } = useApi("/admin/audit-logs?page=" + page);
  return (
    <>
      <PageTitle
        title="Audit log"
        subtitle="Read-only history of important platform actions."
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const auditList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            const totalPages = data?.data?.last_page || data?.last_page || 1;
            return (
              <>
                {auditList.map((a) => (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    gap={2}
                    justifyContent="space-between"
                    key={a.id}
                    py={2}
                    borderBottom={1}
                    borderColor="divider"
                  >
                    <Box>
                      <Typography fontWeight={650}>{a.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actor #{a.actor_id || "system"} · {a.resource}{" "}
                        {a.resource_id && "#" + a.resource_id}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {dateTime(a.created_at)}
                    </Typography>
                  </Stack>
                ))}
                {totalPages > 1 && (
                  <Pagination
                    sx={{ mt: 3 }}
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                  />
                )}
              </>
            );
          })()}
        </Panel>
      )}
    </>
  );
}
export function HotelManagement() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/hotels?page=${page}`);
  const [editing, setEditing] = useState(null);
  const [hotelOpen, setHotelOpen] = useState(false);
  const [roomHotel, setRoomHotel] = useState(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [failure, setFailure] = useState("");
  const [uploading, setUploading] = useState(false);
  const { notify } = useApp();
  const { register, reset, handleSubmit, setValue, formState: { isSubmitting } } = useForm();
  const { register: regRoom, reset: resetRoom, handleSubmit: handleRoomSubmit, formState: { isSubmitting: isRoomSubmitting } } = useForm();

  const openHotelModal = (h = null) => {
    setEditing(h);
    setFailure("");
    reset(
      h
        ? {
            name: h.name,
            city: h.city,
            address: h.address,
            star_rating: h.stars || h.star_rating || 5,
            description: h.description,
            cancellation_hours: h.cancellation_hours,
            cancellation_fee_percent: h.cancellation_fee_percent,
            status: h.status,
            image_path: h.image_path || "",
          }
        : {
            name: "",
            city: "Kigali",
            address: "",
            star_rating: 5,
            description: "",
            cancellation_hours: 48,
            cancellation_fee_percent: 15,
            status: "active",
            image_path: "",
          }
    );
    setHotelOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFailure("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("folder", "hotels");
      const res = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setValue("image_path", res.data.data.path);
      notify("Hotel photograph uploaded successfully.");
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const manageRooms = (h) => {
    setRoomHotel(h);
    resetRoom({
      name: "Deluxe Suite",
      description: "Spacious suite with city views and premium amenities.",
      price_per_night_minor: 25000,
      capacity: 2,
      total_rooms: 10,
    });
    setFailure("");
    setRoomOpen(true);
  };

  return (
    <>
      <PageTitle
        title="Hotel Management"
        subtitle="Manage luxury hotel inventory, pricing, cancellation policies, and room capacities."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openHotelModal()}
          >
            Add Hotel
          </Button>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const hotelList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            const totalPages = data?.data?.last_page || data?.last_page || 1;
            return (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Hotel Name</TableCell>
                        <TableCell>City & Address</TableCell>
                        <TableCell>Stars</TableCell>
                        <TableCell>Cancellation Terms</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hotelList.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>
                            <Typography fontWeight={700}>{h.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{h.city}</Typography>
                            <Typography variant="caption" color="text.secondary">{h.address}</Typography>
                          </TableCell>
                          <TableCell>
                            <Rating value={h.stars || h.star_rating || 0} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {h.cancellation_hours}h notice · {h.cancellation_fee_percent}% fee
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Status value={h.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                startIcon={<MeetingRoom />}
                                onClick={() => manageRooms(h)}
                              >
                                Rooms ({h.room_types?.length || 0})
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openHotelModal(h)}
                              >
                                Edit
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {hotelList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No hotels found. Click "Add Hotel" to register a property.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Pagination
                    sx={{ mt: 3 }}
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                  />
                )}
              </>
            );
          })()}
        </Panel>
      )}

      {/* Add / Edit Hotel Dialog */}
      <Dialog
        open={hotelOpen}
        onClose={() => !isSubmitting && setHotelOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setFailure("");
            try {
              const payload = {
                ...values,
                stars: values.star_rating || values.stars || 5,
              };
              if (editing) {
                await api.put(`/admin/hotels/${editing.id}`, payload);
              } else {
                await api.post("/admin/hotels", payload);
              }
              setHotelOpen(false);
              notify(`Hotel ${editing ? "updated" : "created"} successfully.`);
              await reload();
            } catch (err) {
              setFailure(errorMessage(err));
            }
          })}
        >
          <DialogTitle>{editing ? "Edit Hotel Property" : "Add Hotel Property"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField label="Hotel Name" required {...register("name", { required: true })} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="City" fullWidth required {...register("city", { required: true })} />
                <TextField
                  label="Star Rating"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1, max: 5 }}
                  {...register("star_rating", { required: true, valueAsNumber: true })}
                />
              </Stack>
              <TextField label="Street Address" required {...register("address", { required: true })} />
              <TextField label="Description" multiline rows={3} {...register("description")} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Cancellation Notice (Hours)"
                  type="number"
                  fullWidth
                  required
                  {...register("cancellation_hours", { required: true, valueAsNumber: true })}
                />
                <TextField
                  label="Cancellation Fee (%)"
                  type="number"
                  fullWidth
                  required
                  {...register("cancellation_fee_percent", { required: true, valueAsNumber: true })}
                />
                <TextField select label="Status" fullWidth {...register("status")}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Stack>

              <Box>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Hotel Photograph (JPEG/PNG &le; 2MB)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFile />}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/jpeg,image/png" hidden onChange={handleImageUpload} />
                  </Button>
                  <TextField
                    label="Image URL or Stored Path"
                    fullWidth
                    size="small"
                    {...register("image_path")}
                  />
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={isSubmitting} onClick={() => setHotelOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={isSubmitting}>
              Save Hotel
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Room Management Dialog */}
      <Dialog
        open={roomOpen}
        onClose={() => !isRoomSubmitting && setRoomOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Room Types — {roomHotel?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} pt={1}>
            {failure && <Alert severity="error">{failure}</Alert>}

            <Typography variant="subtitle2" color="text.secondary">
              Current Available Room Inventory
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Nightly Rate</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Total Rooms</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roomHotel?.room_types?.map((rm) => (
                    <TableRow key={rm.id}>
                      <TableCell><strong>{rm.name}</strong></TableCell>
                      <TableCell>{money(rm.price_per_night_minor)}</TableCell>
                      <TableCell>{rm.capacity} Guests</TableCell>
                      <TableCell>{rm.total_rooms} Units</TableCell>
                    </TableRow>
                  ))}
                  {(!roomHotel?.room_types || roomHotel.room_types.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No room types configured for this hotel yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>
              Add New Room Type & Inventory
            </Typography>

            <Box
              component="form"
              onSubmit={handleRoomSubmit(async (values) => {
                setFailure("");
                try {
                  await api.post(`/admin/hotels/${roomHotel.id}/rooms`, values);
                  notify("Room type and inventory created.");
                  setRoomOpen(false);
                  await reload();
                } catch (err) {
                  setFailure(errorMessage(err));
                }
              })}
            >
              <Stack spacing={2}>
                <TextField label="Room Type Name" required {...regRoom("name", { required: true })} />
                <TextField label="Description" {...regRoom("description")} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Price per Night (Cents USD)"
                    type="number"
                    fullWidth
                    required
                    helperText="e.g. 25000 = $250.00"
                    {...regRoom("price_per_night_minor", { required: true, valueAsNumber: true })}
                  />
                  <TextField
                    label="Guest Capacity"
                    type="number"
                    fullWidth
                    required
                    {...regRoom("capacity", { required: true, valueAsNumber: true })}
                  />
                  <TextField
                    label="Total Room Inventory"
                    type="number"
                    fullWidth
                    required
                    {...regRoom("total_rooms", { required: true, valueAsNumber: true })}
                  />
                </Stack>
                <Button
                  variant="contained"
                  type="submit"
                  loading={isRoomSubmitting}
                  startIcon={<Add />}
                  sx={{ alignSelf: "flex-start", mt: 1 }}
                >
                  Create Room Type
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomOpen(false)} disabled={isRoomSubmitting}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function PackageManagement() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/packages?page=${page}`);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState("");
  const { notify } = useApp();
  const { register, reset, handleSubmit, formState: { isSubmitting } } = useForm();

  const openModal = (pkg = null) => {
    setEditing(pkg);
    setFailure("");
    reset(
      pkg
        ? {
            title: pkg.title,
            destination: pkg.destination || "Kigali",
            description: pkg.description,
            duration_days: pkg.duration_days,
            base_price_minor: pkg.base_price_minor,
            discount_percent: pkg.discount_percent,
            status: pkg.status,
            image_path: pkg.image_path || "",
          }
        : {
            title: "",
            destination: "Kigali",
            description: "",
            duration_days: 7,
            base_price_minor: 120000,
            discount_percent: 15,
            status: "active",
            image_path: "/images/ocean.jpg",
          }
    );
    setOpen(true);
  };

  return (
    <>
      <PageTitle
        title="Holiday Packages"
        subtitle="Manage predefined flight and accommodation bundles, promotional savings, and inclusions."
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
            Add Package
          </Button>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const packageList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            const totalPages = data?.data?.last_page || data?.last_page || 1;
            return (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Package Title</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Base Price</TableCell>
                        <TableCell>Package Savings</TableCell>
                        <TableCell>Components</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {packageList.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Typography fontWeight={700}>{p.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{p.destination || "Custom Destination"}</Typography>
                          </TableCell>
                          <TableCell>{p.duration_days} Days</TableCell>
                          <TableCell>{money(p.base_price_minor)}</TableCell>
                          <TableCell>
                            <Chip label={`${p.discount_percent}% OFF`} size="small" color="secondary" />
                          </TableCell>
                          <TableCell>{p.components?.length || 0} Travel Services</TableCell>
                          <TableCell><Status value={p.status} /></TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => openModal(p)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {packageList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No packages found. Click "Add Package" to create a holiday bundle.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Pagination
                    sx={{ mt: 3 }}
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                  />
                )}
              </>
            );
          })()}
        </Panel>
      )}

      <Dialog open={open} onClose={() => !isSubmitting && setOpen(false)} maxWidth="sm" fullWidth>
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setFailure("");
            try {
              if (editing) {
                await api.put(`/admin/packages/${editing.id}`, values);
              } else {
                await api.post("/admin/packages", values);
              }
              setOpen(false);
              notify(`Package ${editing ? "updated" : "created"} successfully.`);
              await reload();
            } catch (err) {
              setFailure(errorMessage(err));
            }
          })}
        >
          <DialogTitle>{editing ? "Edit Holiday Package" : "Create Holiday Package"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField label="Package Title" required {...register("title", { required: true })} />
              <TextField label="Destination City" required {...register("destination", { required: true })} />
              <TextField label="Description" multiline rows={3} {...register("description")} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Duration (Days)"
                  type="number"
                  fullWidth
                  required
                  {...register("duration_days", { required: true, valueAsNumber: true })}
                />
                <TextField
                  label="Base Price (Cents USD)"
                  type="number"
                  fullWidth
                  required
                  helperText="e.g. 120000 = $1,200.00"
                  {...register("base_price_minor", { required: true, valueAsNumber: true })}
                />
                <TextField
                  label="Discount (%)"
                  type="number"
                  fullWidth
                  required
                  {...register("discount_percent", { required: true, valueAsNumber: true })}
                />
              </Stack>
              <TextField select label="Status" fullWidth {...register("status")}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={isSubmitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={isSubmitting}>
              Save Package
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export function PromotionManagement() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/promotions?page=${page}`);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState("");
  const { notify } = useApp();
  const { register, reset, handleSubmit, formState: { isSubmitting } } = useForm();

  const openModal = (promo = null) => {
    setEditing(promo);
    setFailure("");
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    reset(
      promo
        ? {
            code: promo.code,
            title: promo.title,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            min_spend_minor: promo.min_spend_minor,
            usage_limit: promo.usage_limit,
            start_date: promo.start_date?.slice(0, 10) || today,
            expiry_date: promo.expiry_date?.slice(0, 10),
            status: promo.status,
          }
        : {
            code: "PROMO" + Math.floor(100 + Math.random() * 900),
            title: "Seasonal Promo Special",
            discount_type: "percentage",
            discount_value: 15,
            min_spend_minor: 10000,
            usage_limit: 100,
            start_date: today,
            expiry_date: nextMonth,
            status: "active",
          }
    );
    setOpen(true);
  };

  return (
    <>
      <PageTitle
        title="Promotions & Discount Codes"
        subtitle="Manage promotional discount codes, validity windows, and minimum spend rules."
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
            Add Promotion
          </Button>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const promoList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            const totalPages = data?.data?.last_page || data?.last_page || 1;
            return (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Promo Code</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Min Spend</TableCell>
                        <TableCell>Redemptions</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {promoList.map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell>
                            <Chip label={pr.code} color="primary" sx={{ fontWeight: 700 }} />
                          </TableCell>
                          <TableCell>{pr.title}</TableCell>
                          <TableCell>
                            <strong>
                              {pr.discount_type === "percentage" ? `${pr.discount_value}%` : money(pr.discount_value)}
                            </strong>
                          </TableCell>
                          <TableCell>{money(pr.min_spend_minor)}</TableCell>
                          <TableCell>{pr.times_used} / {pr.usage_limit}</TableCell>
                          <TableCell>{pr.expiry_date?.slice(0, 10)}</TableCell>
                          <TableCell><Status value={pr.status} /></TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => openModal(pr)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {promoList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No promotion codes found. Click "Add Promotion" to issue a voucher.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Pagination
                    sx={{ mt: 3 }}
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                  />
                )}
              </>
            );
          })()}
        </Panel>
      )}

      <Dialog open={open} onClose={() => !isSubmitting && setOpen(false)} maxWidth="sm" fullWidth>
        <Box
          component="form"
          onSubmit={handleSubmit(async (values) => {
            setFailure("");
            try {
              if (editing) {
                await api.put(`/admin/promotions/${editing.id}`, values);
              } else {
                await api.post("/admin/promotions", values);
              }
              setOpen(false);
              notify(`Promotion ${editing ? "updated" : "created"} successfully.`);
              await reload();
            } catch (err) {
              setFailure(errorMessage(err));
            }
          })}
        >
          <DialogTitle>{editing ? "Edit Promotion" : "Add Promotion Code"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} pt={1}>
              {failure && <Alert severity="error">{failure}</Alert>}
              <TextField label="Code (e.g. WELCOME10)" required {...register("code", { required: true })} />
              <TextField label="Campaign Title" required {...register("title", { required: true })} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="Discount Type" fullWidth {...register("discount_type")}>
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (Cents USD)</MenuItem>
                </TextField>
                <TextField
                  label="Discount Value"
                  type="number"
                  fullWidth
                  required
                  {...register("discount_value", { required: true, valueAsNumber: true })}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Min Spend (Cents USD)"
                  type="number"
                  fullWidth
                  required
                  helperText="e.g. 10000 = $100.00"
                  {...register("min_spend_minor", { required: true, valueAsNumber: true })}
                />
                <TextField
                  label="Usage Limit"
                  type="number"
                  fullWidth
                  required
                  {...register("usage_limit", { required: true, valueAsNumber: true })}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  {...register("start_date", { required: true })}
                />
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  {...register("expiry_date", { required: true })}
                />
              </Stack>
              <TextField select label="Status" fullWidth {...register("status")}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={isSubmitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" loading={isSubmitting}>
              Save Promotion
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export function FraudManagement() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/fraud?page=${page}`);
  const [scanning, setScanning] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [statusVal, setStatusVal] = useState("reviewed");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const { notify } = useApp();

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await api.post("/admin/fraud/scan");
      notify(`Automated fraud scanner completed. ${res.data.detected_count || 0} suspicious patterns evaluated.`);
      await reload();
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async () => {
    setBusy(true);
    try {
      await api.put(`/admin/fraud/${selectedFlag.id}`, {
        status: statusVal,
        resolution_notes: notes,
      });
      notify("Fraud flag resolved.");
      setResolveOpen(false);
      await reload();
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Fraud Detection & Investigation"
        subtitle="Automated anomaly detection identifies suspicious booking frequency, rapid cancellations, and duplicate accounts."
        action={
          <Button
            variant="contained"
            color="warning"
            startIcon={<Refresh />}
            loading={scanning}
            onClick={runScan}
          >
            Scan Suspicious Activity
          </Button>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : (
        <Panel>
          {(() => {
            const flagsList = Array.isArray(data?.data?.data)
              ? data.data.data
              : Array.isArray(data?.data)
              ? data.data
              : [];
            const totalPages = data?.data?.last_page || data?.last_page || 1;
            return (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User / Account</TableCell>
                        <TableCell>Booking Reference</TableCell>
                        <TableCell>Risk Reason</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Detected At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flagsList.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <Typography fontWeight={700}>{f.user?.name || "System"}</Typography>
                            <Typography variant="caption" color="text.secondary">{f.user?.email}</Typography>
                          </TableCell>
                          <TableCell>
                            {f.booking ? (
                              <Link to={`/bookings/${f.booking.id}`} style={{ textDecoration: "none", fontWeight: 700 }}>
                                {f.booking.reference}
                              </Link>
                            ) : (
                              <Typography variant="caption" color="text.secondary">N/A (Account-level)</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{f.reason}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${f.risk_score} / 100`}
                              color={f.risk_score >= 80 ? "error" : "warning"}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell><Status value={f.status} /></TableCell>
                          <TableCell>
                            <Typography variant="caption">{dateTime(f.created_at)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedFlag(f);
                                statusVal && setStatusVal(f.status);
                                notes && setNotes(f.resolution_notes || "");
                                setResolveOpen(true);
                              }}
                            >
                              Investigate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {flagsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No suspicious activities detected. All accounts and bookings are in good standing.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Pagination
                    sx={{ mt: 3 }}
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                  />
                )}
              </>
            );
          })()}
        </Panel>
      )}

      {/* Investigation Dialog */}
      <Dialog open={resolveOpen} onClose={() => !busy && setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Investigate Security Alert</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <Alert severity={selectedFlag?.risk_score >= 80 ? "error" : "warning"}>
              Risk Score: <strong>{selectedFlag?.risk_score} / 100</strong> &bull; Reason: {selectedFlag?.reason}
            </Alert>
            <Typography variant="body2">
              User: <strong>{selectedFlag?.user?.name}</strong> ({selectedFlag?.user?.email})
            </Typography>
            <TextField
              select
              label="Investigation Resolution"
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              fullWidth
            >
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="reviewed">Reviewed & Verified Safe</MenuItem>
              <MenuItem value="dismissed">Dismissed (False Positive)</MenuItem>
              <MenuItem value="blocked">Flag As Fraud & Block User</MenuItem>
            </TextField>
            <TextField
              label="Auditor Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record findings from investigating this alert..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="contained" loading={busy} onClick={handleResolve}>
            Save Resolution
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function ReportsPage() {
  const [days, setDays] = useState(30);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const { notify } = useApp();
  const { data: overview, loading, reload } = useApi(`/admin/reports/overview?days=${days}`);

  const metrics = overview?.data?.metrics;
  const flightOccupancy = overview?.data?.flight_occupancy || [];
  const hotelOccupancy = overview?.data?.hotel_occupancy || [];
  const destinations = overview?.data?.destinations || [];

  return (
    <>
      <PageTitle
        title="Analytics & Executive Reports"
        subtitle="Sales revenue, booking trends, hotel occupancy, flight seat utilization, cancellation rates, and agent commissions."
      />

      {loading ? (
        <Loading />
      ) : (
        <Stack spacing={4}>
          {/* KPI Summary Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2.5,
            }}
          >
            <Panel>
              <Typography variant="caption" color="text.secondary">Gross Sales</Typography>
              <Typography variant="h5" fontWeight={800} color="primary" mt={0.5}>
                {money(metrics?.gross_revenue_minor || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Net Revenue: <strong>{money(metrics?.net_revenue_minor || 0)}</strong>
              </Typography>
            </Panel>

            <Panel>
              <Typography variant="caption" color="text.secondary">Total Bookings</Typography>
              <Typography variant="h5" fontWeight={800} mt={0.5}>
                {metrics?.total_bookings || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Flights: {metrics?.flight_bookings || 0} · Hotels: {metrics?.hotel_bookings || 0} · Packages: {metrics?.package_bookings || 0}
              </Typography>
            </Panel>

            <Panel>
              <Typography variant="caption" color="text.secondary">Cancellations & Refunds</Typography>
              <Typography variant="h5" fontWeight={800} color="error.main" mt={0.5}>
                {money(metrics?.refunds_minor || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {metrics?.cancellations || 0} cancelled · Fees: {money(metrics?.cancellation_fees_minor || 0)}
              </Typography>
            </Panel>

            <Panel>
              <Typography variant="caption" color="text.secondary">Agent Commissions</Typography>
              <Typography variant="h5" fontWeight={800} color="success.main" mt={0.5}>
                {money(metrics?.agent_commissions_minor || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Pending Fraud Flags: <strong>{metrics?.fraud_flags_pending || 0}</strong>
              </Typography>
            </Panel>
          </Box>

          {/* Visual Analytics Charts */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            <Panel title="Flight Seat Utilization (%)">
              <Box sx={{ width: "100%", height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flightOccupancy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="flight_number" fontSize={11} />
                    <YAxis domain={[0, 100]} unit="%" fontSize={11} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="utilization_pct" name="Seat Utilization" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>

            <Panel title="Hotel Room Occupancy (%)">
              <Box sx={{ width: "100%", height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotelOccupancy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" fontSize={11} />
                    <YAxis domain={[0, 100]} unit="%" fontSize={11} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="occupancy_pct" name="Room Occupancy" fill="#ff9800" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Box>

          {/* Top Destinations */}
          {destinations.length > 0 && (
            <Panel title="Top Travel Destinations">
              <Box sx={{ width: "100%", height: 250, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={destinations} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="destination" type="category" fontSize={11} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" name="Bookings Count" fill="#4caf50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          )}

          {/* Export Center */}
          <Panel title="Export Official Reports">
            <Stack spacing={3} maxWidth={600}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Date Range"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  fullWidth
                >
                  {[7, 30, 90, 365].map((n) => (
                    <MenuItem key={n} value={n}>
                      Last {n} days
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Booking Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All statuses</MenuItem>
                  {["confirmed", "cancelled", "pending"].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await download(
                        `/admin/reports/export?days=${days}&status=${status}`,
                        `travelease-report-${days}days.csv`
                      );
                      notify("CSV booking report downloaded.");
                    } catch (e) {
                      notify(errorMessage(e), "error");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Download CSV
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PictureAsPdf />}
                  loading={pdfBusy}
                  onClick={async () => {
                    setPdfBusy(true);
                    try {
                      await download(
                        `/admin/reports/pdf?days=${days}`,
                        `travelease-executive-report-${days}days.pdf`
                      );
                      notify("Analytical PDF report generated and downloaded.");
                    } catch (e) {
                      notify(errorMessage(e), "error");
                    } finally {
                      setPdfBusy(false);
                    }
                  }}
                >
                  Download PDF Report
                </Button>
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      )}
    </>
  );
}
