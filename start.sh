#!/bin/bash
# CodeAtlas Local MVP Runner

echo "Starting CodeAtlas Engine..."
cd engine
pip install -r requirements.txt
python3 main.py &
ENGINE_PID=$!

echo "Building CodeAtlas UI..."
cd ../ui
npm install

# Build the static files (removes need for localhost:5173)
npm run build

echo "Launching Standalone Application..."
# Run Electron in production mode so it loads the compiled files directly from disk
export NODE_ENV=production
npx electron electron/main.cjs &
UI_PID=$!

function cleanup() {
    echo "Shutting down CodeAtlas..."
    kill $ENGINE_PID
    kill $UI_PID
    exit
}

trap cleanup SIGINT SIGTERM

echo "CodeAtlas is running. Press Ctrl+C to stop."
wait $ENGINE_PID $UI_PID
