#!/usr/bin/env bash
set -euo pipefail
TRAVELEASE_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TRAVELEASE_PHP="${TRAVELEASE_PHP:-/usr/bin/php}"
if [[ ! -x "$TRAVELEASE_PHP" ]]; then TRAVELEASE_PHP="$(command -v php)"; fi
pids=()
cleanup() { for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM
(cd "$TRAVELEASE_ROOT/laravel source" && exec "$TRAVELEASE_PHP" artisan serve --host=127.0.0.1 --port=8002) &
pids+=("$!")
(cd "$TRAVELEASE_ROOT/laravel source" && exec "$TRAVELEASE_PHP" artisan schedule:work) &
pids+=("$!")
(cd "$TRAVELEASE_ROOT/travelease-frontend" && exec npm run dev) &
pids+=("$!")
wait -n "${pids[@]}"
