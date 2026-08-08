#!/usr/bin/env bash
# ==============================================================================
# DV FINANCIALS - Unified Start Script
# ==============================================================================

set -e

echo "=========================================================="
echo "      🚀 STARTING DV FINANCIALS WEALTH HUB (FULL-STACK)   "
echo "=========================================================="

# Start Backend in background
echo "[+] Starting Node.js / Express backend on port 5001..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Start Frontend Vite server
echo "[+] Starting React / Vite frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "[✓] DV Financials running!"
echo "    🔗 Frontend: http://localhost:5173"
echo "    🔗 Backend:  http://localhost:5001/api/health"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
