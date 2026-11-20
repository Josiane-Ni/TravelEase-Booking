<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>TravelEase Itinerary - {{ $booking->reference }}</title>
  <style>
    body { font: 12px 'DejaVu Sans', Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 20px; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
    .logo { font-size: 24px; font-weight: bold; color: #0369a1; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-flight { background: #e0f2fe; color: #0369a1; }
    .badge-hotel { background: #fef3c7; color: #b45309; }
    .badge-package { background: #f3e8ff; color: #6b21a8; }
    .badge-confirmed { background: #dcfce7; color: #15803d; }
    .badge-cancelled { background: #fee2e2; color: #b91c1c; }
    .notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px; margin: 12px 0; font-size: 11px; }
    .section-title { font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .total-row { font-weight: bold; background: #f1f5f9; }
    .muted { color: #64748b; font-size: 10px; }
    .grid { margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="float: right; text-align: right;">
      <span class="badge {{ $booking->status === 'confirmed' ? 'badge-confirmed' : 'badge-cancelled' }}">{{ $booking->status }}</span>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Issued: {{ now()->format('Y-m-d H:i') }} UTC</div>
    </div>
    <div class="logo">TravelEase</div>
    <div style="font-size: 11px; color: #64748b;">Integrated Travel Booking & Management System</div>
  </div>

  <div class="notice">
    <strong>SIMULATED RESERVATION</strong> — This document is a demonstration booking confirmation produced for the TravelEase simulation. It is not an actual airline ticket or third-party hotel confirmation.
  </div>

  <div class="grid">
    <strong>Booking Reference:</strong> {{ $booking->reference }} &nbsp;|&nbsp;
    <strong>Booking Type:</strong> <span class="badge badge-{{ $booking->type }}">{{ ucfirst($booking->type) }}</span> &nbsp;|&nbsp;
    <strong>Customer:</strong> {{ $booking->user->name }} ({{ $booking->user->email }})
  </div>

  {{-- Flight Items --}}
  @if($booking->items->isNotEmpty())
    <div class="section-title">Flight Details</div>
    @foreach($booking->items as $item)
      <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
        <strong>{{ $item->snapshot['origin'] ?? 'Origin' }} &rarr; {{ $item->snapshot['destination'] ?? $booking->destination }}</strong>
        <br>
        Airline: {{ $item->snapshot['airline'] ?? 'Airline' }} | Flight #: {{ $item->snapshot['flight_number'] ?? 'N/A' }} | Class: {{ $item->snapshot['class'] ?? 'Economy' }}
        <br>
        Departure: {{ $item->snapshot['departure_at'] ?? 'N/A' }} &nbsp;|&nbsp; Arrival: {{ $item->snapshot['arrival_at'] ?? 'N/A' }}
      </div>
    @endforeach
    <p>
      <strong>Passengers:</strong> {{ $booking->passengers->pluck('name')->join(', ') }}<br>
      @if($booking->seats->isNotEmpty())
        <strong>Assigned Seats:</strong> {{ $booking->seats->pluck('number')->join(', ') }}
      @endif
    </p>
  @endif

  {{-- Hotel Room Items --}}
  @if($booking->rooms->isNotEmpty())
    <div class="section-title">Hotel & Accommodation Details</div>
    @foreach($booking->rooms as $room)
      <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
        <strong>{{ $room->roomType?->hotel?->name ?? 'Hotel Stay' }}</strong> ({{ $room->roomType?->hotel?->city ?? $booking->destination }})
        <br>
        Room Type: {{ $room->roomType?->name ?? 'Standard Room' }} | Quantity: {{ $room->quantity }} room(s)
        <br>
        Check-In: {{ $room->check_in->toDateString() }} &nbsp;|&nbsp; Check-Out: {{ $room->check_out->toDateString() }}
        ({{ max(1, $room->check_in->diffInDays($room->check_out)) }} nights)
      </div>
    @endforeach
    @if($booking->items->isEmpty())
      <p><strong>Guests:</strong> {{ $booking->passengers->pluck('name')->join(', ') }}</p>
    @endif
  @endif

  {{-- Price Breakdown --}}
  <div class="section-title">Payment & Pricing Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Amount (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Subtotal Base Rate</td>
        <td style="text-align: right;">${{ number_format($booking->subtotal_minor / 100, 2) }}</td>
      </tr>
      <tr>
        <td>Taxes & Service Fees</td>
        <td style="text-align: right;">${{ number_format($booking->tax_minor / 100, 2) }}</td>
      </tr>
      @if($booking->discount_minor > 0)
        <tr style="color: #16a34a;">
          <td>Promotional Discount {{ $booking->promotion ? '(' . $booking->promotion->code . ')' : '' }}</td>
          <td style="text-align: right;">-${{ number_format($booking->discount_minor / 100, 2) }}</td>
        </tr>
      @endif
      @if($booking->loyalty_redeemed_minor > 0)
        <tr style="color: #16a34a;">
          <td>Loyalty Points Redeemed Discount</td>
          <td style="text-align: right;">-${{ number_format($booking->loyalty_redeemed_minor / 100, 2) }}</td>
        </tr>
      @endif
      <tr class="total-row">
        <td>Total Paid Amount</td>
        <td style="text-align: right;">${{ number_format($booking->total_minor / 100, 2) }}</td>
      </tr>
    </tbody>
  </table>

  <p>
    <strong>Payment Reference:</strong> {{ $booking->payment?->reference ?? 'Simulated-Pay-Ref' }}<br>
    <strong>Payment Method:</strong> {{ $booking->payment?->method === 'wallet' ? 'TravelEase Simulated Wallet' : 'Simulated Credit Card' }} ({{ $booking->payment?->status ?? 'successful' }})
  </p>

  @if($booking->refund)
    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 8px; border-radius: 4px; margin: 10px 0;">
      <strong>Simulated Refund Processed:</strong> ${{ number_format($booking->refund->amount_minor / 100, 2) }} USD
      (Ref: {{ $booking->refund->reference }}) credited to simulated wallet.
    </div>
  @endif

  {{-- Cancellation Policy --}}
  <div class="section-title">Cancellation Policy</div>
  <p style="font-size: 11px;">
    Cancellations must be requested at least {{ $booking->cancellation_policy['hours'] ?? 24 }} hours prior to scheduled departure / check-in.
    Cancellation fee: {{ $booking->cancellation_policy['fee_percent'] ?? 10 }}%.
    Eligible refunds are automatically credited back to your TravelEase simulated digital wallet.
  </p>

  {{-- Travel Document Checklist --}}
  @if($booking->documents->isNotEmpty())
    <div class="section-title">Travel Document Checklist</div>
    @foreach($booking->documents as $doc)
      <div style="font-size: 11px; margin-bottom: 3px;">
        <span style="font-weight: bold; color: {{ $doc->available ? '#16a34a' : '#ea580c' }};">
          {{ $doc->available ? '[✓ Ready]' : '[!] Pending' }}
        </span>
        {{ $doc->name }}
      </div>
    @endforeach
    <p class="muted">Checklist entries are self-reported by the customer. TravelEase does not verify international travel documents or visas.</p>
  @endif

  <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 8px; text-align: center; color: #94a3b8; font-size: 10px;">
    TravelEase · Integrated Travel Booking Simulation · Support: contact@travelease.test
  </div>
</body>
</html>
