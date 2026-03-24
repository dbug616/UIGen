# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup
npm run setup          # install + prisma generate + prisma migrate dev

# Development
npm run dev            # Next.js with Turbopack (port 3000)
npm run dev:daemon     # Run in background, logs to logs.txt

# Build & production
npm run build
npm run start

# Testing
npm run test           # Vitest (run all tests)
npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts  # Run single test file

# Linting
npm run lint

# Database
npm run db:reset       # Reset SQLite DB (destructive)
```

Environment variables: `ANTHROPIC_API_KEY` (optional — falls back to MockLanguageModel) and `JWT_SECRET` (defaults to dev key if unset).

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates JSX files into an in-memory virtual file system, which is rendered in a sandboxed iframe.

### Request flow

```
User chat message
  → /api/chat/route.ts (POST, server)
  → provider.ts: real Claude (claude-haiku-4-5) or MockLanguageModel
  → AI uses two tools: str_replace_editor, file_manager
  → VirtualFileSystem (in-memory, no disk writes)
  → FileSystemContext broadcasts state changes
  → CodeEditor + PreviewFrame re-render
```

### Key subsystems

**Virtual File System (`src/lib/file-system.ts`)** — All "files" live in RAM. The AI tools call methods on this class. State is serialized as a JSON string to the `data` column in SQLite when saving a project.

**AI chat endpoint (`src/app/api/chat/route.ts`)** — Receives messages + current file system state, calls Claude with the generation system prompt, runs with `maxSteps=40`. Saves project state to DB after each response if the user is authenticated.

**Provider (`src/lib/provider.ts`)** — Switches between `anthropic("claude-haiku-4-5")` and `MockLanguageModel` based on whether `ANTHROPIC_API_KEY` is set. The mock generates a static component without hitting the API, useful for development.

**JSX transformer (`src/lib/transform/jsx-transformer.ts`)** — Uses Babel Standalone to transpile JSX in-browser. Builds a dynamic ES module import map from the virtual file system so the preview iframe can resolve relative imports between virtual files.

**Preview (`src/components/preview/PreviewFrame.tsx`)** — Sandboxed iframe. Auto-detects entry point (looks for `App.jsx`, `index.jsx`, etc.). Receives the transformed HTML via `srcdoc`.

**Contexts** — Two React contexts manage global state:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): wraps VirtualFileSystem, exposes file CRUD and handles tool call execution from AI
- `ChatContext` (`src/lib/contexts/chat-context.tsx`): manages messages and AI streaming via Vercel AI SDK's `useChat`

**Auth** — JWT sessions stored in HttpOnly cookies (7-day expiry), bcrypt password hashing, managed in `src/lib/auth.ts` and server actions in `src/actions/`.

### Layout

Three-panel resizable layout (`src/app/main-content.tsx`):
- Left (35%): Chat interface
- Right (65%): Tabs — Preview (iframe) | Code (FileTree + Monaco Editor)

### Database

SQLite via Prisma. Two models: `User` and `Project`. Both `messages` (chat history) and `data` (file system) are stored as serialized JSON strings. Schema at `prisma/schema.prisma`.

### Testing

Tests live in `__tests__/` directories alongside source files. Key test areas: `jsx-transformer`, `file-system`, `chat-context`, `file-system-context`, and chat/editor components. Vitest with jsdom and React Testing Library.
