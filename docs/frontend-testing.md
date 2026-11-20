# Frontend testing

See [the consolidated testing report](testing.md) for authoritative current commands/results.

Component tests cover password/terms/confirmation validation and email normalization, invalid-submit blocking, API validation feedback, password visibility, role protection, customer loading/error/empty data, disabled missing-domain actions and assigned agent-client display. Tests use isolated mocked API fixtures; production components use real APIs.

The production Vite build passes with lazy-loaded modules. Live HTTP verification covers the actual React proxy → Laravel → MySQL cookie/CSRF and booking lifecycle; it does not execute browser rendering.

Browser automation was attempted with the available computer-use tool. It returned `Browser is not available: iab` and then an empty browser/app inventory. No screenshots were captured. No responsive, pixel-accurate, keyboard/screen-reader or browser end-to-end pass is claimed. Resume these checks when a browser is connected and the five reference images are supplied.
