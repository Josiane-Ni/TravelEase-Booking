#!/usr/bin/env bash
set -euo pipefail
TRAVELEASE_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TRAVELEASE_PHP="${TRAVELEASE_PHP:-/usr/bin/php}"
if [[ ! -x "$TRAVELEASE_PHP" ]]; then TRAVELEASE_PHP="$(command -v php)"; fi
cd "$TRAVELEASE_ROOT/laravel source"
"$TRAVELEASE_PHP" artisan test
DB_CONNECTION=mysql DB_DATABASE=travelease_test "$TRAVELEASE_PHP" artisan test
cd "$TRAVELEASE_ROOT/travelease-frontend"
npm test
npm run build
