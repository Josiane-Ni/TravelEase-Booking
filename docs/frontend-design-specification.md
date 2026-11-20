# Frontend design specification

The five specified files under `design-references/` were absent. This implementation follows the written visual direction; it does **not** claim screenshot reproduction.

- Central light/dark MUI theme: primary blue #0866D8, navy sidebar gradient #102B4C → #09182F, orange #FF8A24, light page #F3F7FD; readable alternate dark surfaces.
- Arial/system fallback compatible with Inter; no runtime font-network dependency.
- Auth desktop: 44% image / 56% form; local ocean or mountain photograph; blue overlay; orange accent; blue/indigo submit button; compact form, password visibility and terms links. Image panel hidden on small screens.
- Dashboards: 246px permanent desktop sidebar, 72px header, 16–24px main padding, 12px cards, thin borders, compact KPIs, actual Recharts datasets. Mobile sidebar uses a drawer and forms/cards stack at MUI breakpoints.
- Customer hierarchy: image welcome banner/essentials, four quick actions, six KPIs, upcoming trips/transactions/notifications/checklist.
- Agent: assigned-client and recorded-commission summary; missing group/chart workflows are labeled.
- Admin: actual aggregate metrics, monthly payment/refund bars, status donut, destinations and working quick actions.
- Flight/checkout: live inventory, visible simulation notices, server prices, selected/disabled seats, countdown, seven-step progress, recoverable errors and only server-confirmed success.

Photographs are stored locally in `travelease-frontend/public/images/`: ocean (Unsplash image ID photo-1514282401047-d79a71a590e8) and mountains (photo-1464822759023-fed622ff2c3b), downloaded from images.unsplash.com. They are decorative travel images, not evidence of inventory/hotels. Reconfirm asset licensing/attribution for any external production publication.

Browser/reference screenshots, exact dimensions and accessibility audit results are pending. Responsive styling and dark-mode code exist, but no visual inspection is claimed.
