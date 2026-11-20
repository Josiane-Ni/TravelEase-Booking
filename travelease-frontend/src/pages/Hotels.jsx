import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Divider,
  Alert,
  Pagination,
} from "@mui/material";
import { Hotel as HotelIcon, LocationOn, Wifi, Pool, Spa, FitnessCenter, Restaurant, ArrowForward } from "@mui/icons-material";
import { useApi, PageTitle, Loading, Failure, Empty, Panel } from "../components/Common";
import { money, dateTime } from "../services/api";

const amenityIcons = {
  WiFi: <Wifi fontSize="small" />,
  Pool: <Pool fontSize="small" />,
  Spa: <Spa fontSize="small" />,
  Gym: <FitnessCenter fontSize="small" />,
  Restaurant: <Restaurant fontSize="small" />,
};

export function HotelSearchForm({ compact = false }) {
  const [params, setParams] = useSearchParams();
  const [city, setCity] = useState(params.get("city") || "");
  const [stars, setStars] = useState(params.get("stars") || "");
  const [checkIn, setCheckIn] = useState(params.get("check_in") || new Date().toISOString().slice(0, 10));
  const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const [checkOut, setCheckOut] = useState(params.get("check_out") || nextWeek);

  const search = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (city) next.set("city", city);
    if (stars) next.set("stars", stars);
    if (checkIn) next.set("check_in", checkIn);
    if (checkOut) next.set("check_out", checkOut);
    setParams(next);
  };

  return (
    <Box component="form" onSubmit={search}>
      <Stack direction={{ xs: "column", md: compact ? "column" : "row" }} spacing={2}>
        <TextField
          label="City / Destination"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Kigali, Dubai, Paris"
          fullWidth
        />
        <TextField
          label="Check-In Date"
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Check-Out Date"
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          select
          label="Minimum Stars"
          value={stars}
          onChange={(e) => setStars(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Any Rating</MenuItem>
          <MenuItem value="5">5 Stars</MenuItem>
          <MenuItem value="4">4+ Stars</MenuItem>
          <MenuItem value="3">3+ Stars</MenuItem>
        </TextField>
        <Button variant="contained" color="secondary" type="submit" sx={{ px: 4 }}>
          Search
        </Button>
      </Stack>
    </Box>
  );
}

export function HotelsPage() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const query = params.toString() ? `${params.toString()}&page=${page}` : `page=${page}`;
  const { data, loading, error, reload } = useApi(`/hotels?${query}`);

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 4 }}>
      <PageTitle
        title="Find & Book Hotels"
        subtitle="Compare luxury properties, check daily room availability, and enjoy guaranteed best rates."
      />

      <Panel title="Refine Your Search">
        <HotelSearchForm />
      </Panel>

      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : data?.data?.length === 0 ? (
        <Empty
          title="No hotels match your criteria"
          description="Try selecting a different city or clearing star rating filters."
        />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 4 }}>
          {data.data.map((hotel) => (
            <Card key={hotel.id} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, borderRadius: 3 }}>
              <CardMedia
                component="img"
                sx={{ width: { xs: "100%", sm: 220 }, height: 200, objectFit: "cover" }}
                image={hotel.image_path || "/images/ocean.jpg"}
                alt={hotel.name}
              />
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {hotel.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary" mb={1}>
                        <LocationOn fontSize="small" />
                        <Typography variant="caption">{hotel.city}</Typography>
                      </Stack>
                    </Box>
                    <Rating value={hotel.stars} readOnly size="small" />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {hotel.description}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mt={1.5}>
                    {(hotel.amenities || []).slice(0, 4).map((amenity) => (
                      <Chip key={amenity} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">From</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary">
                      {money(hotel.min_price_per_night_minor)}
                      <Typography component="span" variant="caption" color="text.secondary"> / night</Typography>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/hotels/${hotel.id}?${params.toString()}`}
                    endIcon={<ArrowForward />}
                  >
                    View Rooms
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {data?.meta?.last_page > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Pagination
            count={data.meta.last_page}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

export function HotelDetails({ id }) {
  const [params] = useSearchParams();
  const checkIn = params.get("check_in") || new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
  const checkOut = params.get("check_out") || nextWeek;

  const { data, loading, error, reload } = useApi(`/hotels/${id}?check_in=${checkIn}&check_out=${checkOut}`);

  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const hotel = data.data;

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {hotel.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={hotel.stars} readOnly />
            <Typography variant="body2" color="text.secondary">
              · {hotel.city} · {hotel.address || "Central District"}
            </Typography>
          </Stack>
        </Box>
        <Chip label="Verified Property" color="success" variant="outlined" />
      </Stack>

      <Box
        component="img"
        src={hotel.image_path || "/images/ocean.jpg"}
        alt={hotel.name}
        sx={{ width: "100%", height: 350, objectFit: "cover", borderRadius: 3, mb: 4 }}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            About this hotel
          </Typography>
          <Typography paragraph color="text.secondary">
            {hotel.description}
          </Typography>

          <Typography variant="h6" fontWeight={700} mt={3} gutterBottom>
            Featured Amenities & Facilities
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
            {(hotel.amenities || []).map((a) => (
              <Chip key={a} label={a} icon={amenityIcons[a]} />
            ))}
          </Box>

          <Typography variant="h5" fontWeight={800} mt={4} mb={2}>
            Available Room Types ({checkIn} to {checkOut})
          </Typography>

          <Stack spacing={2.5}>
            {(hotel.room_types || []).map((room) => {
              const available = room.available_for_stay > 0;
              return (
                <Card key={room.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {room.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" my={1}>
                        {room.description}
                      </Typography>
                      <Stack direction="row" spacing={2} mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          Capacity: <strong>{room.capacity} Guests</strong>
                        </Typography>
                        <Typography variant="caption" color={available ? "success.main" : "error.main"}>
                          Available: <strong>{room.available_for_stay} room(s) for stay</strong>
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: 180 }}>
                      <Typography variant="caption" color="text.secondary">Per Night</Typography>
                      <Typography variant="h6" fontWeight={800} color="primary">
                        {money(room.price_per_night_minor)}
                      </Typography>
                      {room.total_stay_price_minor && (
                        <Typography variant="body2" color="text.secondary" mb={1.5}>
                          Total: <strong>{money(room.total_stay_price_minor)}</strong> ({room.stay_nights} nights)
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        disabled={!available}
                        component={Link}
                        to={`/checkout?type=hotel&room_type_id=${room.id}&check_in=${checkIn}&check_out=${checkOut}&quantity=1`}
                        fullWidth
                      >
                        {available ? "Book This Room" : "Sold Out"}
                      </Button>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Box>

        <Box>
          <Panel title="Cancellation & Policies">
            <Typography variant="body2" paragraph>
              <strong>Cancellation window:</strong> Up to {hotel.cancellation_hours} hours prior to scheduled check-in.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Cancellation fee:</strong> {hotel.cancellation_fee_percent}% administrative deduction.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              All payments and refunds are handled through your simulated TravelEase account.
            </Alert>
          </Panel>
        </Box>
      </Box>
    </Box>
  );
}
