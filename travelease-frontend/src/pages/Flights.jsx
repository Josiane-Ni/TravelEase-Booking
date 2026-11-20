import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Divider,
  Pagination,
  Alert,
} from "@mui/material";
import {
  FlightTakeoff,
  ArrowForward,
  Search,
  Schedule,
  AirlineSeatReclineNormal,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import {
  PageTitle,
  useApi,
  Loading,
  Failure,
  Empty,
  Panel,
} from "../components/Common";
import { money, dateTime } from "../services/api";
export function FlightSearchForm({ compact = false }) {
  const [params, setParams] = useSearchParams(),
    navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: Object.fromEntries(params),
  });
  return (
    <Box
      component="form"
      onSubmit={handleSubmit((v) =>
        navigate(
          "/flights?" +
            new URLSearchParams(
              Object.fromEntries(
                Object.entries(v).filter(([, val]) => val !== ""),
              ),
            ),
        ),
      )}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          lg: compact ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr 1fr",
        },
        gap: 2,
      }}
    >
      <TextField label="From" placeholder="Kigali" {...register("origin")} />
      <TextField
        label="To"
        placeholder="Where would you like to go?"
        {...register("destination")}
      />
      <TextField
        label="Departure date"
        type="date"
        slotProps={{ inputLabel: { shrink: true } }}
        {...register("departure_date")}
      />
      {!compact && (
        <>
          <TextField
            label="Passengers"
            type="number"
            inputProps={{ min: 1, max: 9 }}
            {...register("passengers")}
          />
          <TextField
            label="Travel class"
            select
            defaultValue={params.get("class") || ""}
            {...register("class")}
          >
            <MenuItem value="">All classes</MenuItem>
            <MenuItem value="Economy">Economy</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
          </TextField>
          <TextField
            label="Maximum price (USD cents)"
            type="number"
            inputProps={{ min: 0 }}
            {...register("max_price")}
          />
          <TextField
            label="Sort by"
            select
            defaultValue={params.get("sort") || "departure"}
            {...register("sort")}
          >
            <MenuItem value="departure">Departure time</MenuItem>
            <MenuItem value="price">Lowest price</MenuItem>
          </TextField>
        </>
      )}
      <Button type="submit" variant="contained" startIcon={<Search />}>
        Search flights
      </Button>
    </Box>
  );
}
export function FlightsPage() {
  const [params, setParams] = useSearchParams(),
    { data, loading, error, reload } = useApi("/flights?" + params);
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <PageTitle
        title="Find your next flight"
        subtitle="Compare live demonstration inventory. All times are shown in UTC."
      />
      <Panel>
        <FlightSearchForm />
      </Panel>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={3}
      >
        <Typography fontWeight={700}>
          {data?.meta?.total ?? 0} flights found
        </Typography>
        <Chip label="One-way · Simulated inventory" size="small" />
      </Stack>
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : !data?.data?.length ? (
        <Empty
          title="No flights match your search"
          detail="Try another destination, date, or price range."
          action={<Button onClick={() => setParams({})}>Clear filters</Button>}
        />
      ) : (
        <Stack spacing={2}>
          {data.data.map((f) => (
            <Card key={f.id}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "stretch", md: "center" }}
                  justifyContent="space-between"
                  gap={3}
                >
                  <Box sx={{ minWidth: 160 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FlightTakeoff color="primary" />
                      <Typography fontWeight={700}>{f.airline.name}</Typography>
                    </Stack>
                    <Typography color="text.secondary" fontSize={12} mt={1}>
                      {f.flight_number} · {Math.floor(f.duration_minutes / 60)}h{" "}
                      {f.duration_minutes % 60}m
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {f.origin}{" "}
                      <ArrowForward
                        fontSize="small"
                        sx={{
                          mx: 2,
                          verticalAlign: "middle",
                          color: "primary.main",
                        }}
                      />{" "}
                      {f.destination}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {dateTime(f.departure_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { md: "right" } }}>
                    <Typography variant="caption" color="text.secondary">
                      From, per passenger
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {money(Math.min(...f.classes.map((c) => c.total_minor)))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Taxes included
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    component={Link}
                    to={"/flights/" + f.id}
                  >
                    View flight
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {data?.meta?.last_page > 1 && (
        <Pagination
          sx={{ mt: 3 }}
          count={data.meta.last_page}
          page={Number(params.get("page") || 1)}
          onChange={(_, p) =>
            setParams({ ...Object.fromEntries(params), page: p })
          }
        />
      )}
    </Box>
  );
}
export function FlightDetails({ id }) {
  const { data, loading, error, reload } = useApi("/flights/" + id);
  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const f = data.data;
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 4 } }}>
      <PageTitle
        title={`${f.origin} to ${f.destination}`}
        subtitle={`${f.airline.name} · ${f.flight_number}`}
      />
      <Panel title="Your journey">
        <Stack direction={{ xs: "column", sm: "row" }} gap={5}>
          <Box>
            <Typography variant="overline">Departure</Typography>
            <Typography variant="h6">{dateTime(f.departure_at)}</Typography>
            <Typography color="text.secondary">{f.origin}</Typography>
          </Box>
          <FlightTakeoff color="primary" sx={{ alignSelf: "center" }} />
          <Box>
            <Typography variant="overline">Arrival</Typography>
            <Typography variant="h6">{dateTime(f.arrival_at)}</Typography>
            <Typography color="text.secondary">{f.destination}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2">
          Cancellation is available until {f.cancellation_hours} hours before
          departure. The fee is {f.cancellation_fee_percent}% of the total.
          Eligible refunds go to your simulated wallet.
        </Typography>
      </Panel>
      <Stack direction={{ xs: "column", sm: "row" }} gap={3} mt={3}>
        {f.classes.map((c) => (
          <Panel key={c.id} title={c.name} sx={{ flex: 1 }}>
            <Typography variant="h4" color="primary">
              {money(c.total_minor)}
            </Typography>
            <Typography variant="body2" color="text.secondary" my={1}>
              Base fare {money(c.fare_minor)} + taxes {money(c.tax_minor)}
            </Typography>
            <Typography variant="body2" mb={3}>
              {c.available_seats} seats available
            </Typography>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to={`/checkout?flight=${f.id}&class=${c.id}`}
              disabled={!c.available_seats || f.status !== "scheduled"}
            >
              Select {c.name}
            </Button>
          </Panel>
        ))}
      </Stack>
      <Alert severity="info" sx={{ mt: 3 }}>
        This is a simulated reservation. No actual airline ticket will be
        issued.
      </Alert>
    </Box>
  );
}
