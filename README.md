# Multiplayer Cursors

A real-time multiplayer cursor tracking application built with React and Socket.IO. Users can join rooms, share their cursor positions in real-time, and see other participants' cursors on a shared canvas.

## Features

- **Real-time cursor tracking** - See other users' cursor movements in real-time
- **Room-based sessions** - Create or join rooms to collaborate with specific users
- **Smooth cursor interpolation** - Cursors are smoothly animated using exponential interpolation for a seamless experience
- **User identification** - Set your username and see who's in your room
- **WebSocket communication** - Powered by Socket.IO for reliable real-time updates

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v10.15.1 or higher)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nguyinh/multiplayer-cursors.git
cd multiplayer-cursors
```

### 2. Install dependencies

```bash
pnpm install
```

This will install dependencies for both the client and server workspaces.

### 3. Start the server

In one terminal, start the backend server:

```bash
cd server
pnpm dev
```

The server will start on `http://localhost:4000`.

### 4. Start the client

In another terminal, start the frontend development server:

```bash
cd client
pnpm dev
```

The client will start on `http://localhost:5173` (default Vite port).

### 5. Open the application

1. Open your browser and navigate to `http://localhost:5173`
2. Enter your username on the identification page
3. Create a new game room or join an existing one with a room ID
4. Share the room ID with others to collaborate in real-time
5. Move your cursor on the canvas and see other participants' cursors!

## Project Structure

```
multiplayer-cursors/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React context providers (Auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components (Home, GameLobby, etc.)
│   │   ├── services/       # Service layer (Socket.IO client)
│   │   ├── App.tsx         # Root application component
│   │   └── main.tsx        # Application entry point
│   └── package.json
├── server/                 # Express + Socket.IO backend
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   └── socket.ts       # Socket.IO event handlers
│   └── package.json
├── package.json            # Root package.json (workspace config)
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── biome.json              # Biome linter/formatter configuration
```

## Tech Stack

### Client
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **nuqs** - URL query state management

### Server
- **Express 5** - HTTP server framework
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type safety
- **tsx** - TypeScript execution for development

### Development Tools
- **pnpm** - Package manager with workspace support
- **Biome** - Linting and formatting
- **ESLint** - Additional linting for the client

## Available Scripts

### Root

```bash
pnpm lint        # Run Biome linter/formatter
```

### Client

```bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm preview     # Preview production build
pnpm lint        # Run ESLint
```

### Server

```bash
pnpm dev         # Start development server with hot reload
```

## License

ISC