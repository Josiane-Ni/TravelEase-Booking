import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import { Luggage, CheckCircle, ArrowForward, FlightTakeoff, Hotel as HotelIcon, LocalOffer } from "@mui/icons-material";
import { useApi, PageTitle, Loading, Failure, Empty, Panel } from "../components/Common";
import { money, api, errorMessage } from "../services/api";

export function PackagesPage() {
  const { data, loading, error, reload } = useApi("/packages");

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 4 }}>
      <PageTitle
        title="Custom Holiday Packages"
        subtitle="Combine curated flights and premier accommodations into customized packages with exclusive discounts."
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : data?.data?.length === 0 ? (
        <Empty title="No packages available" description="Please check back soon for seasonal holiday specials." />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mt: 3 }}>
          {data.data.map((pkg) => (
            <Card key={pkg.id} sx={{ display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden" }}>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={pkg.image_path || "/images/ocean.jpg"}
                  alt={pkg.title}
                />
                <Chip
                  label={`${pkg.discount_percent}% PACKAGE SAVINGS`}
                  color="secondary"
                  size="small"
                  sx={{ position: "absolute", top: 12, right: 12, fontWeight: 700 }}
                />
              </Box>

              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    {pkg.destination} · {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                  </Typography>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    {pkg.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {pkg.description}
                  </Typography>

                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
                    INCLUDED IN THIS BUNDLE:
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={2}>
                    {(pkg.inclusions || []).slice(0, 3).map((inc) => (
                      <Chip key={inc} label={inc} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Starting From</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary">
                      {money(pkg.base_price_minor)}
                      <Typography component="span" variant="caption" color="text.secondary"> / person</Typography>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/packages/${pkg.id}`}
                    endIcon={<ArrowForward />}
                  >
                    Customize
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function PackageDetails({ id }) {
  const { data, loading, error, reload } = useApi(`/packages/${id}`);
  const [passengers, setPassengers] = useState(1);
  const [customQuote, setCustomQuote] = useState(null);
  const [calcBusy, setCalcBusy] = useState(false);

  const calculateCustom = async (qty) => {
    setPassengers(qty);
    setCalcBusy(true);
    try {
      const res = await api.post(`/packages/${id}/customize`, { passengers: qty });
      setCustomQuote(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalcBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const pkg = data.data;

  const basePrice = pkg.base_price_minor * passengers;
  const discountAmount = intdiv(basePrice * pkg.discount_percent, 100);
  const finalPrice = basePrice - discountAmount;

  function intdiv(a, b) {
    return Math.floor(a / b);
  }

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {pkg.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pkg.destination} · {pkg.duration_days} Days Vacation Experience
          </Typography>
        </Box>
        <Chip
          label={`${pkg.discount_percent}% Package Discount Applied`}
          color="secondary"
          sx={{ fontWeight: 700, px: 1, py: 2 }}
        />
      </Stack>

      <Box
        component="img"
        src={pkg.image_path || "/images/ocean.jpg"}
        alt={pkg.title}
        sx={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 3, mb: 4 }}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Package Overview
          </Typography>
          <Typography paragraph color="text.secondary">
            {pkg.description}
          </Typography>

          <Typography variant="h6" fontWeight={700} mt={3} gutterBottom>
            What is Included
          </Typography>
          <Stack spacing={1} mb={3}>
            {(pkg.inclusions || []).map((inc) => (
              <Stack key={inc} direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">{inc}</Typography>
              </Stack>
            ))}
          </Stack>

          <Typography variant="h6" fontWeight={700} mt={3} gutterBottom>
            Exclusions
          </Typography>
          <Stack spacing={1} mb={4}>
            {(pkg.exclusions || []).map((exc) => (
              <Typography key={exc} variant="body2" color="text.secondary">
                • {exc}
              </Typography>
            ))}
          </Stack>

          {/* Bundled Components */}
          <Typography variant="h6" fontWeight={700} mt={3} gutterBottom>
            Bundled Travel Services
          </Typography>
          <Stack spacing={2}>
            {(pkg.components || []).map((c, i) => (
              <Card key={i} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {c.component_type === "flight" && c.flight && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FlightTakeoff color="primary" fontSize="large" />
                    <Box>
                      <Typography fontWeight={700}>
                        Flight: {c.flight.airline?.name} ({c.flight.flight_number})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Route: {c.flight.origin} &rarr; {c.flight.destination}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {c.component_type === "hotel" && c.hotel && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <HotelIcon color="secondary" fontSize="large" />
                    <Box>
                      <Typography fontWeight={700}>
                        Hotel Stay: {c.hotel.name} ({c.hotel.city})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room: {c.room_type?.name || "Deluxe Room"} · 5-Star Accommodations
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Customizer Sidebar */}
        <Box>
          <Panel title="Customize & Book Package">
            <Typography variant="body2" color="text.secondary" mb={2}>
              Select passenger count to automatically calculate bundled package pricing and applicable discounts.
            </Typography>

            <TextField
              select
              label="Travelers / Guests"
              value={passengers}
              onChange={(e) => calculateCustom(Number(e.target.value))}
              fullWidth
              sx={{ mb: 3 }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <MenuItem key={n} value={n}>
                  {n} {n === 1 ? "Passenger" : "Passengers"}
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Original Total:</Typography>
                <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
                  {money(customQuote?.original_total_minor || basePrice)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" color="success.main">
                <Typography variant="body2">Package Savings ({pkg.discount_percent}%):</Typography>
                <Typography variant="body2" fontWeight={700}>
                  -{money(customQuote?.discount_minor || discountAmount)}
                </Typography>
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={800}>Final Price:</Typography>
                <Typography variant="h5" fontWeight={800} color="primary">
                  {money(customQuote?.final_total_minor || finalPrice)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to={`/checkout?type=package&package_id=${pkg.id}&quantity=${passengers}`}
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              Book Custom Package
            </Button>
          </Panel>
        </Box>
      </Box>
    </Box>
  );
}
