# multiplayer-cursors

A real-time multiplayer cursors application built as a monorepo.

## Project Structure

This project is organized as a monorepo with the following structure:

```
multiplayer-cursors/
├── packages/
│   ├── client/          # Frontend application
│   └── server/          # Backend server
├── package.json         # Root package.json with workspaces
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v7 or higher) or yarn or pnpm

## Getting Started

### 1. Initialize the Monorepo

Create a root `package.json` with workspaces configuration:

```bash
npm init -y
```

Then update the `package.json` to include workspaces:

```json
{
  "name": "multiplayer-cursors",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "start": "npm run start --workspaces --if-present"
  }
}
```

### 2. Create Package Directories

```bash
mkdir -p packages/client packages/server
```

### 3. Initialize Individual Packages

From the root directory, initialize the client package:

```bash
cd packages/client
npm init -y
cd ../..
```

Initialize the server package:

```bash
cd packages/server
npm init -y
cd ../..
```

### 4. Install Dependencies

From the root directory, install all dependencies:

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### 5. Running the Project

To run all packages in development mode:

```bash
npm run dev
```

To run a specific package:

```bash
npm run dev --workspace=packages/client
npm run dev --workspace=packages/server
```

## Alternative: Using pnpm (Recommended for Monorepos)

pnpm is often preferred for monorepos due to better disk efficiency and stricter dependency management.

### Setup with pnpm

1. Create a `pnpm-workspace.yaml` file in the root:

```yaml
packages:
  - 'packages/*'
```

2. Install dependencies:

```bash
pnpm install
```

3. Run commands:

```bash
pnpm dev          # Run all packages
pnpm --filter client dev   # Run only client
pnpm --filter server dev   # Run only server
```

## Alternative: Using Yarn Workspaces

1. Update root `package.json`:

```json
{
  "name": "multiplayer-cursors",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

2. Install dependencies:

```bash
yarn install
```

3. Run commands:

```bash
yarn workspaces run dev
yarn workspace client dev
yarn workspace server dev
```

## Adding Shared Dependencies

To add a dependency to a specific package:

```bash
# npm
npm install <package> --workspace=packages/client

# pnpm
pnpm add <package> --filter client

# yarn
yarn workspace client add <package>
```

To add a dev dependency to the root (for tooling like ESLint, Prettier):

```bash
# npm
npm install -D <package>

# pnpm
pnpm add -D <package> -w

# yarn
yarn add -D <package> -W
```

## License

MIT