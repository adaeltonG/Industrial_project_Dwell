# Live Functional Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Dwell prototype's inert controls and hard-coded data with working authentication, catalogue, saved-product, vendor, and administrator flows backed by the existing API, then deploy and verify them at `https://zetahub.co.uk/dwell`.

**Architecture:** Browser-facing React client components call the same-origin Nginx API path `/dwell/api/v1`, keeping production routing independent of the server hostname. A small typed API client and an authentication provider own request/error/token behavior; page components own only view state and user actions. The Express/Prisma API remains the system of record, with its seed command idempotently creating catalogue data and the requested administrator.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Express 5, Prisma 6, PostgreSQL 16, Vitest, PM2, Nginx, agent-browser.

## Global Constraints

- Preserve the current visual design and the deployed `/dwell` base path.
- Expose the API only through the same-origin `/dwell/api/v1` route.
- Never embed the administrator password in browser bundles or committed source.
- Use `admin@dwell.com` as the production administrator email.
- Use the user-supplied administrator password only during the one-time server seed operation.
- Every visible form and catalogue/admin action must show loading, success, empty, and failure feedback where applicable.

---

### Task 1: Shared API and authenticated session

**Files:**
- Create: `lib/api.ts`
- Create: `components/AuthProvider.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/SearchBar.tsx`

**Interfaces:**
- Produces: `apiRequest<T>(path, options)`, `ApiError`, API entity types, and `useAuth()` with `{ user, token, loading, login, register, logout }`.
- Produces: search forms that navigate to `/products?search=...` and a responsive header with authenticated user/admin/logout controls.

- [ ] **Step 1: Define typed API behavior and failure cases**

Create an API wrapper that prefixes `/dwell/api/v1`, parses `{ data }`, converts `{ error: { message } }` into `ApiError`, accepts a bearer token, and handles `204 No Content`.

- [ ] **Step 2: Implement persistent session state**

Store the returned JWT under `dwell_token`, validate it through `GET /auth/me` on startup, clear rejected tokens, and redirect role `ADMIN` users to `/admin` after login.

- [ ] **Step 3: Wire global navigation**

Wrap the app in `AuthProvider`; make desktop/mobile navigation show login when anonymous and the user's name, Admin link, and Logout when authenticated. Submit header searches with `router.push('/products?search=' + encodeURIComponent(query))`.

- [ ] **Step 4: Verify the production build**

Run: `npm.cmd run build`
Expected: Next.js completes type checking and emits all routes without errors.

### Task 2: Registration and login

**Files:**
- Modify: `app/register/page.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `useAuth().register(name, email, password)` and `useAuth().login(email, password)`.
- Produces: accessible submit forms with browser validation, disabled pending states, API error messages, and successful redirects.

- [ ] **Step 1: Make registration submit to the API**

Use controlled name/email/password inputs, `type="submit"`, `required`, `minLength={8}` for passwords, and show duplicate-email or validation errors returned by the API.

- [ ] **Step 2: Make login submit to the API**

Authenticate through `/auth/login`, persist the returned session through the provider, then route administrators to `/admin` and users to `/products`.

- [ ] **Step 3: Add visible form states**

Add reusable `.form-status`, `.form-error`, and disabled-button styles and focus the error status using `role="alert"`.

- [ ] **Step 4: Exercise auth validation**

Run API tests and build; verify a new user can register, remains logged in after refresh, logs out, and can log back in.

### Task 3: API-backed catalogue, filters, details, and saved products

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/products/page.tsx`
- Modify: `app/products/[slug]/page.tsx`
- Modify: `components/ProductCard.tsx`
- Modify: `components/CategoryCard.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `GET /products`, `GET /products/:slug`, `GET /categories`, `GET/PUT/DELETE /users/me/saved-products/:productId`.
- Produces: live catalogue/search/filter/sort/detail views and a working Save/Unsave action.

- [ ] **Step 1: Map API products to presentational cards**

Render API identifiers, related vendor/category names, GBP prices via `Intl.NumberFormat`, real image URLs when present, and fall back to the current placeholder.

- [ ] **Step 2: Wire search, category, vendor, price, and sort controls**

Keep filters in URL search parameters and request `/products?search=&category=&vendor=&minPrice=&maxPrice=&sort=`; update results when controls submit or change and display result counts and empty/error states.

- [ ] **Step 3: Load product details dynamically**

Remove static mock lookup/static params, fetch by route slug, render the product's real external URL, and show a not-found state for API 404 responses.

- [ ] **Step 4: Implement Save for later**

Require login, load saved IDs for authenticated users, and call PUT or DELETE for the current product while updating the button label and status.

- [ ] **Step 5: Verify catalogue paths**

Build and check search, each sort, combined filters, product navigation, external vendor links, save, unsave, anonymous save redirect, and empty results.

### Task 4: API-backed vendors

**Files:**
- Modify: `app/vendors/page.tsx`
- Modify: `app/vendors/[slug]/page.tsx`
- Modify: `components/Header.tsx`

**Interfaces:**
- Consumes: `GET /vendors` and `GET /vendors/:slug`.
- Produces: live vendor list/detail pages and a header Vendors link targeting `/vendors`.

- [ ] **Step 1: Replace mock vendor lists**

Fetch vendors from the API and show verified dates, product counts, descriptions, logos, and loading/empty/error states.

- [ ] **Step 2: Replace static vendor details**

Fetch the route slug, render returned products through `ProductCard`, use `websiteUrl` for the external link, and show a not-found state for missing vendors.

- [ ] **Step 3: Verify vendor navigation**

Build and exercise vendor list, each vendor detail link, product link, external URL, and missing-slug response.

### Task 5: Protected administrator product management

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: authenticated session plus `GET/POST/PATCH/DELETE /products`, `GET /vendors`, and `GET /categories`.
- Produces: role-protected list/create/edit/delete operations using API UUIDs.

- [ ] **Step 1: Protect the administrator page**

Wait for session initialization; redirect anonymous users to `/login` and non-admin users to `/products` before requesting management data.

- [ ] **Step 2: Populate administrator data and selects**

Load products, vendors, and categories; replace free-text relationship fields with UUID-backed selects and availability with `IN_STOCK`, `OUT_OF_STOCK`, and `PREORDER` options.

- [ ] **Step 3: Implement create and edit**

Generate a normalized slug from the title for new records; submit every required API field, populate the form from Edit, PATCH by product ID, and refresh the table after success.

- [ ] **Step 4: Implement deletion and logout**

Confirm destructive deletion, call DELETE by product ID, remove the row on success, and connect the header logout action.

- [ ] **Step 5: Verify authorization and CRUD**

Log in as admin, create a uniquely named product, view it publicly, edit it, delete it, and confirm a normal user cannot access `/admin`.

### Task 6: Seed production, deploy, and browser-test the live site

**Files:**
- Modify: `api/prisma/seed.ts`
- Modify: `api/src/app.test.ts`
- Modify: `api/src/middleware/validate.ts`
- Modify: `next.config.ts`
- Deploy: `/var/www/dwell`

**Interfaces:**
- Consumes: `ADMIN_EMAIL` and `ADMIN_PASSWORD` only in the server-side seed process.
- Produces: an idempotent administrator account and populated production catalogue.

- [ ] **Step 1: Make administrator seeding idempotent**

Hash the supplied password before the upsert and set `passwordHash` and `role: ADMIN` in both create and update branches so reruns deliberately synchronize the requested credential.

- [ ] **Step 2: Cover the Express 5 query fix**

Add a regression assertion that `GET /api/v1/products?limit=1` no longer throws when validated query values are installed on the Express 5 request.

- [ ] **Step 3: Run complete checks**

Run: `npm.cmd run build`, then in `api`: `npm test`, `npm run typecheck`, `npm run build`, and `npm run prisma:validate`.
Expected: all commands exit zero.

- [ ] **Step 4: Deploy and seed**

Upload the changed tracked files, run `npm ci` in both packages, apply `prisma migrate deploy`, execute the seed once with the supplied administrator environment values, build both packages, restart `dwell-web` and `dwell-api`, and save PM2 state.

- [ ] **Step 5: Run live browser acceptance tests**

With agent-browser at `https://zetahub.co.uk/dwell`, verify registration, refresh persistence, logout/login, search/filter/sort, vendor/product navigation, save/unsave, admin login, create/edit/delete, access control, console errors, and failed network responses. Remove any temporary browser-test user/product through supported API or admin actions.

- [ ] **Step 6: Confirm service health**

Verify the public page and one Next.js asset return `200`, `/dwell/api/v1/products?limit=1` returns populated data, both PM2 processes remain online, and the existing Zetahub homepage still returns `200`.
