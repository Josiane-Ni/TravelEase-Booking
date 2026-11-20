import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Pagination,
} from "@mui/material";
import {
  Download,
  CheckCircle,
  FlightTakeoff,
  ArrowForward,
  Print,
  Hotel as HotelIcon,
  Luggage as LuggageIcon,
  LocalOffer,
} from "@mui/icons-material";
import { api, errorMessage, money, dateTime, download } from "../services/api";
import { useApp } from "../context/AppContext";
import {
  useApi,
  Loading,
  Failure,
  Empty,
  Panel,
  PageTitle,
  Status,
} from "../components/Common";
export function CheckoutPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    { notify, user } = useApp();

  const flightId = params.get("flight"),
    classId = params.get("class") ? Number(params.get("class")) : null,
    roomTypeId = params.get("room_type_id") ? Number(params.get("room_type_id")) : null,
    checkIn = params.get("check_in"),
    checkOut = params.get("check_out"),
    packageId = params.get("package_id") ? Number(params.get("package_id")) : null;

  const isHotel = Boolean(roomTypeId);
  const isPackage = Boolean(packageId);
  const isFlight = !isHotel && !isPackage;

  const { data: flightData, loading: flightLoading, error: flightError, reload: flightReload } = useApi(flightId ? "/flights/" + flightId : null);
  const availability = useApi(flightId && classId ? "/flights/" + flightId + "/availability" : null);
  const loyalty = useApi("/loyalty");

  const [step, setStep] = useState(0),
    [quantity, setQuantity] = useState(Number(params.get("quantity")) || 1),
    [passengers, setPassengers] = useState([{ name: "", type: "adult" }]),
    [seats, setSeats] = useState([]),
    [hold, setHold] = useState(null),
    [quote, setQuote] = useState(null),
    [method, setMethod] = useState("mock_card"),
    [result, setResult] = useState("success"),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [booking, setBooking] = useState(null),
    [clock, setClock] = useState(Date.now()),
    [promoInput, setPromoInput] = useState(""),
    [promo, setPromo] = useState(null),
    [validatingPromo, setValidatingPromo] = useState(false),
    [redeemPoints, setRedeemPoints] = useState(false),
    [pointsToUse, setPointsToUse] = useState(0);

  const key = useRef(crypto.randomUUID());

  useEffect(() => {
    let active = true;
    setQuote(null);
    let promise;
    if (isHotel && roomTypeId && checkIn && checkOut) {
      promise = api.post("/checkout/quote", { room_type_id: roomTypeId, check_in: checkIn, check_out: checkOut, quantity });
    } else if (isPackage && packageId) {
      promise = api.post("/checkout/quote", { package_id: packageId, quantity });
    } else if (classId) {
      promise = api.post("/checkout/quote", { flight_class_id: classId, quantity });
    }
    if (promise) {
      promise
        .then((r) => {
          if (active) setQuote(r.data.data);
        })
        .catch((e) => {
          if (active) setFailure(errorMessage(e));
        });
    }
    return () => {
      active = false;
    };
  }, [classId, roomTypeId, checkIn, checkOut, packageId, quantity, isHotel, isPackage]);

  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (isFlight && flightLoading) return <Loading />;
  if (isFlight && flightError) return <Failure error={flightError} retry={flightReload} />;

  const f = flightData?.data,
    c = f?.classes?.find((cls) => cls.id === classId);

  if (isFlight && (!f || !c)) {
    return (
      <Failure error="Select an available flight class before checkout." />
    );
  }

  const availableSeats =
    availability.data?.data?.find((cls) => cls.id === classId)?.seats || [];

  const remaining = hold
    ? Math.max(
        0,
        Math.ceil((new Date(hold.expires_at).getTime() - clock) / 1000),
      )
    : null;

  const restart = async () => {
    setBusy(true);
    try {
      if (hold && hold.id) await api.delete("/checkout/holds/" + hold.id);
      setHold(null);
      setSeats([]);
      setStep(isFlight ? 2 : 1);
      setFailure("");
      if (isFlight) await availability.reload();
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const applyPromo = async () => {
    if (!promoInput.trim() || !quote) return;
    setValidatingPromo(true);
    setFailure("");
    try {
      const res = await api.post("/promotions/validate", {
        code: promoInput.trim().toUpperCase(),
        amount_minor: quote.total_minor,
      });
      setPromo(res.data.data);
      notify(`Promotion code ${res.data.data.code} applied!`);
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      setValidatingPromo(false);
    }
  };

  const availableLoyalty = loyalty.data?.data?.points ?? user?.loyalty_points ?? 0;
  const promoDiscount = promo ? promo.discount_minor : 0;
  const maxAllowedPointsDiscount = quote
    ? Math.min(pointsToUse * 10, Math.floor(((quote.total_minor || 0) - promoDiscount) / 2))
    : 0;
  const pointsDiscount = redeemPoints ? maxAllowedPointsDiscount : 0;
  const totalDiscount = promoDiscount + pointsDiscount;
  const finalPayable = quote ? Math.max(0, quote.total_minor - totalDiscount) : 0;

  const next = async () => {
    setFailure("");
    if (step === 1 && passengers.some((p) => p.name.trim().length < 2)) {
      setFailure("Enter a full name for every passenger / guest.");
      return;
    }
    if (step === 2) {
      setBusy(true);
      try {
        if (isFlight) {
          if (seats.length !== quantity) {
            setFailure(`Select exactly ${quantity} seat(s).`);
            setBusy(false);
            return;
          }
          const r = await api.post("/checkout/holds", {
            flight_class_id: classId,
            seat_ids: seats,
          });
          setHold(r.data.data);
        } else if (isHotel) {
          const r = await api.post("/checkout/holds", {
            room_type_id: roomTypeId,
            check_in: checkIn,
            check_out: checkOut,
            rooms_quantity: quantity,
          });
          setHold(r.data.data);
        } else if (isPackage) {
          setHold({ id: 0, expires_at: new Date(Date.now() + 15 * 60000).toISOString() });
        }
        key.current = crypto.randomUUID();
      } catch (e) {
        setFailure(errorMessage(e));
        if (isFlight) await availability.reload();
        return;
      } finally {
        setBusy(false);
      }
    }
    setStep((s) => s + 1);
  };

  const pay = async () => {
    setBusy(true);
    setFailure("");
    try {
      const { data } = await api.post("/checkout/confirm", {
        hold_id: hold?.id || 0,
        passengers,
        payment_method: method,
        ...(method === "mock_card" ? { mock_result: result } : {}),
        idempotency_key: key.current,
        ...(promo ? { promotion_id: promo.promotion_id } : {}),
        ...(redeemPoints && pointsToUse > 0 ? { redeem_points: pointsToUse } : {}),
      });
      setBooking(data.data);
      setStep(6);
      notify("Simulated reservation confirmed.");
    } catch (e) {
      setFailure(errorMessage(e));
      if (e.response?.status === 422) key.current = crypto.randomUUID();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box sx={{ maxWidth: 1120, mx: "auto" }}>
      <PageTitle
        title="Complete your journey"
        subtitle="A secure, simulated booking. No real card details are collected."
      />
      <Stepper
        activeStep={step}
        alternativeLabel
        sx={{
          mb: 4,
          overflowX: "auto",
          "& .MuiStepLabel-label": { fontSize: 11 },
        }}
      >
        {[
          "Services",
          "Passengers",
          "Seats",
          "Review",
          "Discounts",
          "Payment",
          "Confirmed",
        ].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {failure && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            hold && (
              <Button onClick={restart} disabled={busy}>
                Select seats again
              </Button>
            )
          }
        >
          {failure}
        </Alert>
      )}
      {hold && step < 6 && (
        <Alert severity={remaining ? "info" : "error"} sx={{ mb: 2 }}>
          Seat hold{" "}
          {remaining
            ? `expires in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
            : "has expired. Select your seats again."}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 3,
        }}
      >
        <Panel
          title={
            [
              "Selected service",
              "Passenger details",
              "Choose your seats",
              "Review your reservation",
              "Promotions & loyalty",
              "Simulated payment",
              "Booking confirmation",
            ][step]
          }
        >
          {step === 0 && (
            <Stack spacing={3}>
              {isHotel ? (
                <>
                  <Typography variant="h5">
                    {quote?.hotel_name || "Hotel Reservation"}
                  </Typography>
                  <Typography fontWeight={600}>
                    {quote?.room_name} · {quote?.nights || 1} Night(s)
                  </Typography>
                  <Typography color="text.secondary">
                    Stay: {checkIn} &rarr; {checkOut}
                  </Typography>
                  <TextField
                    select
                    label="Number of rooms"
                    value={quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setQuantity(n);
                      setPassengers(
                        Array.from(
                          { length: n },
                          (_, i) => passengers[i] || { name: "", type: "adult" },
                        ),
                      );
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MenuItem key={i} value={i}>
                        {i} {i === 1 ? "Room" : "Rooms"}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              ) : isPackage ? (
                <>
                  <Typography variant="h5">
                    {quote?.package_title || "Holiday Package"}
                  </Typography>
                  <Typography color="text.secondary">
                    Bundled curated package with flights & luxury accommodations.
                  </Typography>
                  <TextField
                    select
                    label="Number of travelers"
                    value={quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setQuantity(n);
                      setPassengers(
                        Array.from(
                          { length: n },
                          (_, i) => passengers[i] || { name: "", type: "adult" },
                        ),
                      );
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <MenuItem key={i} value={i}>
                        {i} {i === 1 ? "Traveler" : "Travelers"}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              ) : (
                <>
                  <Typography variant="h5">
                    {f?.origin} → {f?.destination}
                  </Typography>
                  <Typography>
                    {f?.airline?.name} · {f?.flight_number} · {c?.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {dateTime(f?.departure_at)}
                  </Typography>
                  <TextField
                    select
                    label="Number of passengers"
                    value={quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setQuantity(n);
                      setPassengers(
                        Array.from(
                          { length: n },
                          (_, i) => passengers[i] || { name: "", type: "adult" },
                        ),
                      );
                      setSeats([]);
                    }}
                  >
                    {Array.from({ length: 9 }, (_, i) => (
                      <MenuItem key={i} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            </Stack>
          )}
          {step === 1 && (
            <Stack spacing={3}>
              {passengers.map((p, i) => (
                <Stack
                  key={i}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <TextField
                    label={`${isHotel ? "Guest" : "Passenger"} ${i + 1} full name`}
                    value={p.name}
                    inputProps={{ maxLength: 100 }}
                    onChange={(e) =>
                      setPassengers(
                        passengers.map((pass, j) =>
                          j === i ? { ...pass, name: e.target.value } : pass,
                        ),
                      )
                    }
                    required
                    fullWidth
                  />
                  <TextField
                    label="Type"
                    select
                    value={p.type}
                    onChange={(e) =>
                      setPassengers(
                        passengers.map((pass, j) =>
                          j === i ? { ...pass, type: e.target.value } : pass,
                        ),
                      )
                    }
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="adult">Adult</MenuItem>
                    <MenuItem value="child">Child</MenuItem>
                  </TextField>
                </Stack>
              ))}
            </Stack>
          )}
          {step === 2 && (
            <>
              {isHotel ? (
                <Stack spacing={2} py={2}>
                  <Alert severity="success">
                    Selected: {quantity} &times; <strong>{quote?.room_name}</strong> at <strong>{quote?.hotel_name}</strong>
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Stay period: <strong>{checkIn}</strong> to <strong>{checkOut}</strong> ({quote?.nights} nights).
                    Proceeding will temporarily hold this room inventory for 15 minutes.
                  </Typography>
                </Stack>
              ) : isPackage ? (
                <Stack spacing={2} py={2}>
                  <Alert severity="success">
                    Package Deal: <strong>{quote?.package_title}</strong> for {quantity} traveler(s).
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    All components of this package are verified and held under our bundled rate.
                  </Typography>
                </Stack>
              ) : availability.loading ? (
                <Loading />
              ) : availability.error ? (
                <Failure
                  error={availability.error}
                  retry={availability.reload}
                />
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Select {quantity} seat(s). Gray seats are already held or
                    booked.
                  </Typography>
                  <Box
                    sx={{
                      maxWidth: 350,
                      mx: "auto",
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: "55px 55px 12px 12px",
                    }}
                  >
                    <Typography
                      textAlign="center"
                      color="text.secondary"
                      variant="caption"
                      component="div"
                      mb={3}
                    >
                      FRONT OF AIRCRAFT
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6,1fr)",
                        gap: 1,
                      }}
                    >
                      {availableSeats.map((s, i) => (
                        <Button
                          key={s.id}
                          aria-label={`Seat ${s.number}`}
                          aria-pressed={seats.includes(s.id)}
                          disabled={
                            !s.available ||
                            (seats.length >= quantity && !seats.includes(s.id))
                          }
                          variant={
                            seats.includes(s.id) ? "contained" : "outlined"
                          }
                          sx={{
                            minWidth: 0,
                            fontSize: 11,
                            px: 0,
                            ml: i % 6 === 3 ? 1 : 0,
                          }}
                          onClick={() =>
                            setSeats((old) =>
                              old.includes(s.id)
                                ? old.filter((id) => id !== s.id)
                                : [...old, s.id],
                            )
                          }
                        >
                          {s.number}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Typography textAlign="center" variant="body2" mt={2}>
                    {seats.length} / {quantity} selected
                  </Typography>
                </>
              )}
            </>
          )}
          {step === 3 && (
            <Stack spacing={2}>
              {isHotel ? (
                <>
                  <Typography fontWeight={700}>
                    {quote?.hotel_name} — {quote?.room_name}
                  </Typography>
                  <Typography color="text.secondary">
                    Stay: {checkIn} &rarr; {checkOut} ({quote?.nights} nights)
                  </Typography>
                  <Typography>
                    Guests: {passengers.map((p) => p.name).join(", ")}
                  </Typography>
                  <Alert severity="info">
                    Standard hotel cancellation policy applies. Eligible refunds are credited to your simulated wallet.
                  </Alert>
                </>
              ) : isPackage ? (
                <>
                  <Typography fontWeight={700}>
                    {quote?.package_title}
                  </Typography>
                  <Typography>
                    Travelers: {passengers.map((p) => p.name).join(", ")}
                  </Typography>
                  <Alert severity="info">
                    Bundled package cancellation policy applies.
                  </Alert>
                </>
              ) : (
                <>
                  <Typography fontWeight={700}>
                    {f?.origin} → {f?.destination}
                  </Typography>
                  <Typography>{dateTime(f?.departure_at)}</Typography>
                  <Typography>
                    {passengers.map((p) => p.name).join(", ")}
                  </Typography>
                  <Typography>
                    Seats:{" "}
                    {availableSeats
                      .filter((s) => seats.includes(s.id))
                      .map((s) => s.number)
                      .join(", ")}
                  </Typography>
                  <Alert severity="info">
                    Cancel at least {f?.cancellation_hours} hours before departure.
                    Fee: {f?.cancellation_fee_percent}%. Refunds go to your simulated
                    wallet.
                  </Alert>
                </>
              )}
              <Typography variant="body2">
                Availability and inventory holds are strictly validated before your reservation is confirmed.
              </Typography>
            </Stack>
          )}
          {step === 4 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Promotional Voucher
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="e.g. WELCOME10, TRAVEL50, SUMMER20"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    disabled={Boolean(promo)}
                    fullWidth
                  />
                  {promo ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setPromo(null);
                        setPromoInput("");
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      loading={validatingPromo}
                      onClick={applyPromo}
                      disabled={!promoInput.trim()}
                    >
                      Apply
                    </Button>
                  )}
                </Stack>
                {promo && (
                  <Alert severity="success" sx={{ mt: 1.5 }}>
                    Code <strong>{promo.code}</strong> applied! You saved {money(promo.discount_minor)}.
                  </Alert>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Loyalty Points Redemption
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Earn 1 loyalty point for every $10 of confirmed travel. Points can be redeemed at $0.10 each (up to 50% discount).
                </Typography>
                {availableLoyalty > 0 ? (
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={redeemPoints}
                          onChange={(e) => {
                            setRedeemPoints(e.target.checked);
                            if (e.target.checked) {
                              const maxPts = Math.min(availableLoyalty, Math.floor(((quote?.total_minor || 0) / 2) / 10));
                              setPointsToUse(maxPts);
                            }
                          }}
                        />
                      }
                      label={`Redeem loyalty points (Balance: ${availableLoyalty} points)`}
                    />
                    {redeemPoints && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          label="Points to redeem"
                          value={pointsToUse}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(Number(e.target.value), availableLoyalty));
                            setPointsToUse(val);
                          }}
                          inputProps={{ min: 0, max: availableLoyalty }}
                        />
                        <Typography fontWeight={700} color="success.main">
                          Discount: {money(pointsDiscount)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    You currently have 0 loyalty points. Complete trips to earn points for future bookings!
                  </Alert>
                )}
              </Box>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>Total Discounts Applied:</Typography>
                <Typography fontWeight={700} color="success.main">
                  -{money(totalDiscount)}
                </Typography>
              </Stack>
            </Stack>
          )}
          {step === 5 && (
            <Stack spacing={3}>
              <TextField
                select
                label="Payment method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <MenuItem value="mock_card">Simulated credit card</MenuItem>
                <MenuItem value="wallet">Simulated TravelEase wallet</MenuItem>
              </TextField>
              {method === "mock_card" && (
                <TextField
                  select
                  label="Test payment outcome"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  <MenuItem value="success">Successful mock payment</MenuItem>
                  <MenuItem value="failure">Declined mock payment</MenuItem>
                </TextField>
              )}
              <Alert severity="warning">
                No real money moves. Never enter a card number or CVV. All
                payments here are simulated.
              </Alert>
              <Typography variant="body2">
                By confirming, you accept the displayed cancellation policy and
                simulation terms.
              </Typography>
              <Button
                variant="contained"
                size="large"
                loading={busy}
                onClick={pay}
              >
                Confirm & pay {money(finalPayable)} (simulated)
              </Button>
            </Stack>
          )}
          {step === 6 && booking && (
            <Stack spacing={2} alignItems="center" py={3}>
              <CheckCircle sx={{ fontSize: 60, color: "success.main" }} />
              <Typography variant="h5">
                Your simulated reservation is confirmed!
              </Typography>
              <Typography fontWeight={700}>{booking.reference}</Typography>
              <Typography color="text.secondary" textAlign="center">
                This is a demonstration reservation, not an actual airline or hotel ticket.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/bookings/" + booking.id)}
              >
                View booking & itinerary
              </Button>
            </Stack>
          )}
          {step < 5 && (
            <Stack direction="row" justifyContent="space-between" mt={4}>
              <Button
                disabled={step === 0 || busy}
                onClick={async () => {
                  if (step === 3) {
                    await restart();
                    return;
                  }
                  setStep((s) => s - 1);
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                loading={busy}
                disabled={!quote}
                onClick={next}
              >
                Continue
              </Button>
            </Stack>
          )}
          {step === 5 && (
            <Button sx={{ mt: 2 }} onClick={() => setStep(4)} disabled={busy}>
              Back
            </Button>
          )}
        </Panel>
        <Panel title="Booking summary" sx={{ alignSelf: "start" }}>
          {isHotel ? (
            <>
              <HotelIcon color="primary" />
              <Typography fontWeight={700} my={1}>
                {quote?.hotel_name || "Hotel Reservation"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quote?.room_name} · {quote?.nights || 1} night(s) · {quantity} room(s)
              </Typography>
            </>
          ) : isPackage ? (
            <>
              <LuggageIcon color="primary" />
              <Typography fontWeight={700} my={1}>
                {quote?.package_title || "Holiday Package"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quantity} traveler(s) · Bundled Package Deal
              </Typography>
            </>
          ) : (
            <>
              <FlightTakeoff color="primary" />
              <Typography fontWeight={700} my={1}>
                {f ? `${f.origin} → ${f.destination}` : "Flight"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c?.name} · {quantity} passenger(s)
              </Typography>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {quote ? (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{isHotel ? "Room charges" : isPackage ? "Package price" : "Base fare"}</Typography>
                <Typography fontWeight={700} variant="body2">{money(quote.subtotal_minor)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Taxes & fees</Typography>
                <Typography fontWeight={700} variant="body2">{money(quote.tax_minor)}</Typography>
              </Stack>
              {totalDiscount > 0 && (
                <Stack direction="row" justifyContent="space-between" color="success.main">
                  <Typography variant="body2">Discounts Applied</Typography>
                  <Typography fontWeight={700} variant="body2">-{money(totalDiscount)}</Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={700} variant="body1">Total Payable</Typography>
                <Typography fontWeight={800} variant="h6" color="primary">{money(finalPayable)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <LinearProgress />
          )}
          <Chip label="SIMULATED · USD" size="small" sx={{ mt: 3 }} />
        </Panel>
      </Box>
    </Box>
  );
}
export function BookingsPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi("/bookings?page=" + page);
  return (
    <>
      <PageTitle
        title="My bookings"
        subtitle="Your trips, receipts, itineraries, and travel documents."
        action={
          <Button variant="contained" component={Link} to="/flights">
            Find a flight
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : !data.data.length ? (
        <Empty
          title="Your next chapter starts here"
          detail="Book your first simulated flight and manage it here."
        />
      ) : (
        <Stack spacing={2}>
          {data.data.map((b) => (
            <Panel key={b.id}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={2}
              >
                <Box>
                  <Typography variant="h6">{b.destination}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.reference} · {dateTime(b.travel_at)}
                  </Typography>
                  <Box mt={1}>
                    <Status value={b.status} />
                  </Box>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight={700}>
                    {money(b.total_minor)}
                  </Typography>
                  <Button
                    component={Link}
                    to={"/bookings/" + b.id}
                    variant="outlined"
                  >
                    View booking
                  </Button>
                </Stack>
              </Stack>
            </Panel>
          ))}
          {data.meta.last_page > 1 && (
            <Pagination
              count={data.meta.last_page}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          )}
        </Stack>
      )}
    </>
  );
}
export function BookingDetails({ id }) {
  const { data, loading, error, reload } = useApi("/bookings/" + id),
    { notify, user } = useApp();
  const [cancelOpen, setCancelOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  if (loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  const b = data.data;
  const act = async (fn) => {
    setBusy(true);
    setFailure("");
    try {
      await fn();
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title={b.reference}
        subtitle="Simulated reservation · No actual ticket is issued"
        action={<Status value={b.status} />}
      />
      {failure && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {failure}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <Panel title="Travel itinerary">
            {b.rooms && b.rooms.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Hotel Accommodations
                </Typography>
                {b.rooms.map((rm) => (
                  <Box key={rm.id} sx={{ mt: 1, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                    <Typography fontWeight={700}>{rm.hotel_name} — {rm.room_type_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stay: {rm.check_in} to {rm.check_out} ({rm.nights} night{rm.nights > 1 ? "s" : ""}) · {rm.quantity} Room(s)
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
              </Box>
            )}
            {b.items.map((item) => (
              <Box key={item.id}>
                <Typography variant="h5">
                  {item.snapshot.origin} → {item.snapshot.destination}
                </Typography>
                <Typography mt={2}>
                  {item.snapshot.airline} · {item.snapshot.flight_number} ·{" "}
                  {item.snapshot.class}
                </Typography>
                <Typography color="text.secondary" my={1}>
                  {dateTime(item.snapshot.departure_at)} —{" "}
                  {dateTime(item.snapshot.arrival_at)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography>
              Passengers: {b.passengers.map((p) => p.name).join(", ")}
            </Typography>
            <Typography>Seats: {b.seats.join(", ")}</Typography>
            <Stack direction="row" spacing={2} mt={3} className="no-print">
              <Button
                startIcon={<Download />}
                variant="contained"
                disabled={busy}
                onClick={() =>
                  act(() =>
                    download(
                      "/bookings/" + id + "/itinerary/pdf",
                      b.reference + ".pdf",
                    ),
                  )
                }
              >
                Download PDF
              </Button>
              <Button startIcon={<Print />} onClick={() => window.print()}>
                Print
              </Button>
            </Stack>
          </Panel>
          <Panel title="Travel document checklist">
            <Typography color="text.secondary" variant="body2" mb={2}>
              Self-reported only. Review the actual destination’s requirements
              independently.
            </Typography>
            <Stack>
              {b.documents.map((doc) => (
                <FormControlLabel
                  key={doc.id}
                  control={
                    <Checkbox
                      checked={doc.available}
                      disabled={busy || user.role !== "customer"}
                      onChange={(_, available) =>
                        act(async () => {
                          await api.patch(
                            `/bookings/${id}/documents/${doc.id}`,
                            { available },
                          );
                          await reload();
                        })
                      }
                    />
                  }
                  label={doc.name}
                />
              ))}
            </Stack>
          </Panel>
        </Stack>
        <Stack spacing={3}>
          <Panel title="Payment receipt">
            <Stack spacing={2}>
              {[
                ["Base fare", b.subtotal_minor],
                ["Taxes", b.tax_minor],
              ].map(([label, amount]) => (
                <Stack
                  key={label}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">{label}</Typography>
                  <Typography fontWeight={700}>{money(amount)}</Typography>
                </Stack>
              ))}
              {b.discount_minor > 0 && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  color="success.main"
                >
                  <Typography variant="body2">Discounts & Loyalty</Typography>
                  <Typography fontWeight={700}>-{money(b.discount_minor)}</Typography>
                </Stack>
              )}
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Typography variant="body2" fontWeight={700}>Total paid</Typography>
                <Typography fontWeight={700}>{money(b.total_minor)}</Typography>
              </Stack>
              <Divider />
              <Typography fontSize={12} sx={{ overflowWrap: "anywhere" }}>
                Payment: {b.payment.reference}
              </Typography>
              <Typography variant="body2">
                {b.payment.method} · Simulated · {b.payment.status}
              </Typography>
              {b.refund && (
                <Alert severity="success">
                  Refunded {money(b.refund.amount_minor)} to your simulated
                  wallet.
                </Alert>
              )}
            </Stack>
          </Panel>
          <Panel title="Cancellation policy">
            <Typography variant="body2" color="text.secondary">
              Cancel by {dateTime(b.cancellation_quote.deadline)}. Fee:{" "}
              {b.cancellation_policy.fee_percent}%. Eligible refunds are sent to
              your simulated wallet.
            </Typography>
            <Button
              color="error"
              variant="outlined"
              sx={{ mt: 2 }}
              disabled={
                !b.cancellation_quote.eligible ||
                busy ||
                user.role !== "customer"
              }
              onClick={() => setCancelOpen(true)}
            >
              Cancel reservation
            </Button>
          </Panel>
        </Stack>
      </Box>
      <Dialog open={cancelOpen} onClose={() => !busy && setCancelOpen(false)}>
        <DialogTitle>Cancel this simulated reservation?</DialogTitle>
        <DialogContent>
          <Typography>
            Fee: {money(b.cancellation_quote.fee_minor)}. Refund:{" "}
            {money(b.cancellation_quote.refund_minor)} to your simulated wallet.
            Your seats will be released.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={busy}>
            Keep booking
          </Button>
          <Button
            color="error"
            variant="contained"
            loading={busy}
            onClick={() =>
              act(async () => {
                await api.post("/bookings/" + id + "/cancel");
                setCancelOpen(false);
                notify("Booking cancelled and simulated refund credited.");
                await reload();
              })
            }
          >
            Confirm cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
