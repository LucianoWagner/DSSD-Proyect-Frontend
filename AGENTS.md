# CLAUDE.md — Frontend Guidelines

## Purpose

This document sets the rules, architecture expectations, and conventions that AI assistants and developers must follow when contributing to the **ProjectPlanning Frontend**.
The frontend is built with **Next.js (App Router)** and serves as the user interface for NGOs, administrators, and reviewers.

**Tech stack highlights:**

-   Next.js (TypeScript, Server Components by default)
-   Tailwind CSS
-   shadcn/ui + lucide-react
-   pnpm as package manager

---

## 🔑 Core Principles

### 1. Server-First Architecture

-   Prefer **Server Components**.
-   Use `"use client"` only when needed (event handlers, browser APIs, React hooks).
-   Default to server-side data fetching.

### 2. Consistent File Structure

-   `src/app/` → pages, layouts, route groups
-   `src/components/` → reusable UI components
-   `src/lib/` → utilities, API fetcher, env validation, schemas
-   `src/hooks/` → custom hooks (client only)
-   `src/types/` → TypeScript domain types

No components should be created outside of these folders.

### 3. Accessibility

-   Semantic HTML elements
-   Proper ARIA attributes
-   Keyboard-accessible components
-   Respect color contrast guidelines

### 4. Styling

-   Use Tailwind exclusively
-   Follow shadcn/ui patterns and structure
-   Avoid custom CSS unless strictly necessary

### 5. Security

-   Never hardcode secrets or URLs
-   Client-exposed values must use: `NEXT_PUBLIC_*`
-   Validate all environment variables in `lib/env.ts`

---

## 📁 Project Structure (Summary)

```
src/
  app/              # Routes + layouts
  components/       # Shared UI
  lib/              # Utilities, API client, env, schemas
  hooks/            # Custom client hooks
  styles/           # Globals
  types/            # API + domain types
```

**Naming conventions:**

-   Components → `PascalCase`
-   Routes → `kebab-case`
-   Utilities → `camelCase`
-   Files (non-components) → `kebab-case`

---

## 🧪 Local Development

**Key commands:**

-   `pnpm install`
-   `pnpm dev`
-   `pnpm build`
-   `pnpm lint`
-   `pnpm typecheck`

---

## 🌐 Environment Variables

Use `.env.local` based on `.env.example`.

Rules:

-   `NEXT_PUBLIC_*` → safe for browser
-   No prefix → server-only
-   All variables must be validated via `lib/env.ts`

---

## 🧭 Routing & Layouts

-   `page.tsx` → route entry
-   `layout.tsx` → shared layout
-   `loading.tsx` → loading state
-   `error.tsx` → route-level error boundaries
-   Route groups:

    -   `(dashboard)` for authenticated areas
    -   `(auth)` for login flows
    -   `(public)` for general/public pages

---

## 🔌 API Integration Model

The frontend communicates **only with the Proxy API**, which:

-   Talks to Bonita BPM
-   Talks to the Cloud API (PostgreSQL)
-   Handles authentication (JWT)
-   Applies business rules

**All requests must go through a centralized fetcher in `src/lib/`.**
Frontend should never contain direct fetch logic in components.

---

## 🔐 Authentication

-   JWT-based authentication
-   Tokens stored securely (memory or httpOnly cookie)
-   Protected routes must redirect on 401/403
-   Follow role-based permissions defined by backend

---

## 📊 Data Flow (High-level)

1. User interacts with UI
2. Frontend validates data (Zod)
3. Frontend calls Proxy API through fetcher
4. Proxy API calls Bonita and Cloud API
5. Frontend updates UI based on API responses

---

## 🎛 Forms & Validation

-   Use **react-hook-form**
-   Schema validation with **Zod**
-   Use shadcn/ui form primitives for consistency

---

## ✔ Code Quality & Standards

-   Strict TypeScript mode
-   No `any` unless explicitly justified
-   Keep PRs small and focused
-   Document non-trivial logic
-   Maintain component reusability

---

## 🧭 Quick Reference

**Common workflow:**

-   Add shadcn components → `npx shadcn add <name>`
-   Create a new page → create folder under `src/app/.../page.tsx`
-   API requests → always use the shared fetcher
-   Forms → react-hook-form + Zod + shadcn
-   In case you need any documentation of the API -> Read API_DOCUMENTATION.md, which has all endpoints of proxy API!

**Remember:**

> **Server-first. Accessible. Type-safe. Maintainable.**
