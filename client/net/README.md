# client/net/README.md

## Purpose
Networking layer for the client. Handles WebSocket connections, message serialization/deserialization, and dispatching actions to other client modules.

## What belongs here
- WebSocket client wrapper.
- Protocol definitions (message types, schemas).
- Reconnection logic and heartbeat handling.

## What must NOT be placed here
- Server‑side authority logic (match resolution, reward calculation).
- Direct UI manipulation; networking should only emit events.

## Future expected files
- `websocket_client.gd`
- `message_router.gd`
- `protocol.gd`
