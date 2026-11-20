<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>TravelEase Executive Analytics Report</title>
  <style>
    body { font: 11px 'DejaVu Sans', Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 15px; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
    .logo { font-size: 22px; font-weight: bold; color: #0369a1; }
    .title { font-size: 16px; font-weight: bold; margin-top: 4px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
    th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .section-title { font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 6px; }
    .kpi-box { display: inline-block; width: 22%; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; margin-right: 2%; margin-bottom: 8px; vertical-align: top; }
    .kpi-title { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; }
    .kpi-value { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="float: right; text-align: right; font-size: 10px; color: #64748b;">
      Generated: {{ now()->format('Y-m-d H:i') }} UTC<br>
      Scope: Last {{ $days }} Days
    </div>
    <div class="logo">TravelEase</div>
    <div class="title">Executive Management & Analytics Report</div>
  </div>

  <div style="margin-bottom: 15px;">
    <div class="kpi-box">
      <div class="kpi-title">Total Bookings</div>
      <div class="kpi-value">{{ $metrics['total_bookings'] }}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">Gross Revenue</div>
      <div class="kpi-value">${{ number_format($metrics['gross_revenue_minor'] / 100, 2) }}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-title">Refunds Processed</div>
      <div class="kpi-value">${{ number_format($metrics['refunds_minor'] / 100, 2) }}</div>
    </div>
    <div class="kpi-box" style="margin-right: 0;">
      <div class="kpi-title">Net Revenue</div>
      <div class="kpi-value">${{ number_format($metrics['net_revenue_minor'] / 100, 2) }}</div>
    </div>
  </div>

  {{-- Booking Distribution --}}
  <div class="section-title">1. Booking Performance by Service Type</div>
  <table>
    <thead>
      <tr>
        <th>Service Type</th>
        <th>Confirmed Count</th>
        <th>Share of Volume</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Flight Reservations</td><td>{{ $metrics['flight_bookings'] }}</td><td>{{ $metrics['total_bookings'] > 0 ? round(($metrics['flight_bookings'] / $metrics['total_bookings']) * 100, 1) : 0 }}%</td></tr>
      <tr><td>Hotel Bookings</td><td>{{ $metrics['hotel_bookings'] }}</td><td>{{ $metrics['total_bookings'] > 0 ? round(($metrics['hotel_bookings'] / $metrics['total_bookings']) * 100, 1) : 0 }}%</td></tr>
      <tr><td>Holiday Packages</td><td>{{ $metrics['package_bookings'] }}</td><td>{{ $metrics['total_bookings'] > 0 ? round(($metrics['package_bookings'] / $metrics['total_bookings']) * 100, 1) : 0 }}%</td></tr>
    </tbody>
  </table>

  {{-- Top Destinations --}}
  <div class="section-title">2. Popular Travel Destinations</div>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Destination City</th>
        <th>Total Bookings</th>
        <th>Revenue (USD)</th>
      </tr>
    </thead>
    <tbody>
      @forelse($destinations as $i => $dest)
        <tr>
          <td>#{{ $i + 1 }}</td>
          <td>{{ $dest->destination }}</td>
          <td>{{ $dest->count }}</td>
          <td>${{ number_format(($dest->revenue_minor ?? 0) / 100, 2) }}</td>
        </tr>
      @empty
        <tr><td colspan="4">No booking records found for period.</td></tr>
      @endforelse
    </tbody>
  </table>

  {{-- Flight Seat Utilization --}}
  <div class="section-title">3. Flight Seat Occupancy & Utilization</div>
  <table>
    <thead>
      <tr>
        <th>Flight</th>
        <th>Route</th>
        <th>Departure</th>
        <th>Total Seats</th>
        <th>Booked Seats</th>
        <th>Utilization</th>
      </tr>
    </thead>
    <tbody>
      @forelse($flightOccupancy as $flight)
        <tr>
          <td>{{ $flight['flight_number'] }} ({{ $flight['airline'] }})</td>
          <td>{{ $flight['origin'] }} &rarr; {{ $flight['destination'] }}</td>
          <td>{{ $flight['departure_at'] }}</td>
          <td>{{ $flight['total_seats'] }}</td>
          <td>{{ $flight['booked_seats'] }}</td>
          <td style="font-weight: bold; color: {{ $flight['utilization_pct'] > 50 ? '#16a34a' : '#ea580c' }};">
            {{ $flight['utilization_pct'] }}%
          </td>
        </tr>
      @empty
        <tr><td colspan="6">No scheduled flight data.</td></tr>
      @endforelse
    </tbody>
  </table>

  {{-- Hotel Occupancy --}}
  <div class="section-title">4. Hotel Property Occupancy</div>
  <table>
    <thead>
      <tr>
        <th>Hotel Name</th>
        <th>City</th>
        <th>Star Rating</th>
        <th>Total Room Capacity</th>
        <th>Booked Rooms</th>
        <th>Occupancy Rate</th>
      </tr>
    </thead>
    <tbody>
      @forelse($hotelOccupancy as $hotel)
        <tr>
          <td>{{ $hotel['name'] }}</td>
          <td>{{ $hotel['city'] }}</td>
          <td>{{ str_repeat('★', $hotel['stars']) }}</td>
          <td>{{ $hotel['total_rooms'] }}</td>
          <td>{{ $hotel['booked_rooms'] }}</td>
          <td style="font-weight: bold; color: {{ $hotel['occupancy_pct'] > 50 ? '#16a34a' : '#0284c7' }};">
            {{ $hotel['occupancy_pct'] }}%
          </td>
        </tr>
      @empty
        <tr><td colspan="6">No hotel data.</td></tr>
      @endforelse
    </tbody>
  </table>

  {{-- Cancellations & Refunds --}}
  <div class="section-title">5. Cancellations & Fraud Monitoring Summary</div>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Cancellations Volume</td><td>{{ $metrics['cancellations'] }}</td><td>Cancellations processed under standard policy</td></tr>
      <tr><td>Cancellation Fees Retained</td><td>${{ number_format($metrics['cancellation_fees_minor'] / 100, 2) }}</td><td>Administrative fee retention</td></tr>
      <tr><td>Pending Fraud Flags</td><td>{{ $metrics['fraud_flags_pending'] }}</td><td>Cases flagged by automated monitoring</td></tr>
      <tr><td>Agent Commissions Accrued</td><td>${{ number_format($metrics['agent_commissions_minor'] / 100, 2) }}</td><td>Commissions on corporate and group bookings</td></tr>
    </tbody>
  </table>

  <div style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 8px; text-align: center; font-size: 9px; color: #94a3b8;">
    TravelEase Analytics System · Generated for internal administrator review only.
  </div>
</body>
</html>
