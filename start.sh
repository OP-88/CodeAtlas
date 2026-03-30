#!/bin/bash
# CodeAtlas Local MVP Runner

echo "Starting CodeAtlas Engine..."
cd engine
pip install -r requirements.txt
python3 main.py &
ENGINE_PID=$!

echo "Starting CodeAtlas UI..."
cd ../ui
npm install
npm install @xyflow/react lucide-react electron electron-builder concurrently --save-dev

# Start vite server in background, and Electron in foreground
npx concurrently -k "npm run dev" "sleep 3 && npx electron electron/main.js" &
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
