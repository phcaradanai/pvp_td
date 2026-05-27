# backend/websocket/README.md

## Purpose
Provides the transport layer for real‑time communication between client and server via WebSocket.

## What belongs here
- Connection handling, message serialization/deserialization.
- Heartbeat / ping‑pong logic.
- Routing of inbound messages to appropriate backend services.

## What must NOT be placed here
- Game‑play rules, match simulation, reward or unlock logic.
- UI presentation code.

## Future expected files
- `websocket_server.gd`
- `message_router.gd`
- `protocol_definitions.gd`
