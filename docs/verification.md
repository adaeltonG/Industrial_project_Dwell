# Automated verification — 11 September 2026

This document records automated developer checks. It is **not** evidence of usability testing with five people. That user-study deliverable remains for the project team to complete.

| Check | Result | Scope |
| --- | --- | --- |
| Frontend unit tests | 8 passed | Cart persistence, quantities, currency, totals, all 30 local PNGs, stock provenance and PNG ERD |
| API HTTP tests | 39 passed | Both API prefixes, UUID/slug lookup, password hashing, registration/login, role protection, CRUD, filters and validation |
| PostgreSQL integration | 51 checks passed | Real migrations, 30 products / 5 vendors / 4 categories, local image URLs, placeholder/null image backfill, repeatable seed preserving custom images/edits/passwords, persisted CRUD, auth, favourites, filtering, sorting and pagination |
| Marketplace browser flow | Passed | Homepage, search, filters, sorting, card fields, detail/vendor links, mobile pages, registration, protected admin access, create/edit/delete forms |
| Shopping browser regression | Passed | Existing product images, cart, checkout simulation, price/stock/API failures, mobile layout and browser errors |
| Frontend production build | Passed on Windows and Linux | Next.js compilation, types and page generation |
| API build and typecheck | Passed on Windows and Linux | TypeScript server compilation |
| Prisma schema validation | Passed | Existing schema requires no rename or additional migration |

## Reproduction

Install dependencies with `npm ci` in both the repository root and `api`, then run `npm run prisma:generate` in `api`.

Frontend: `npm test` and `npm run build`. API: `npm test`, `npm run typecheck`, `npm run build`, and `npm run prisma:validate` (requires `DATABASE_URL`).

For browser checks, run `npx playwright install chromium`, start the frontend on port 3100 (`npm run dev -- -p 3100`), then run `npm run test:browser`. Override `TEST_BASE_URL` if using another port or deployment. Browser tests intercept the API with deterministic fixtures, including test-only account roles. The independent PostgreSQL integration checks verify actual server/database behaviour. Screenshots are generated under `tmp/marketplace-qa` and `tmp/shopping-qa`; these are automated fixtures, not usability participants.

On a Linux staging copy, after building the API, run from its `api` directory:

```sh
node tests/verify-linux.mjs /absolute/path/to/live/api/.env
```

The helper requires local PostgreSQL and permission to create a database via the postgres OS user. It derives connection settings without printing credentials, creates a uniquely named `dwell_verify_*` database, applies the checked-in migration, runs the integration script, and removes that exact temporary database in a finally block. It never migrates or tests the configured live database. The integration script also independently rejects database names outside `dwell_verify_*` and requires `NODE_ENV=test`.

## Security and limitations

Compatible dependency fixes update the frontend lockfile to Next.js 16.3.4; its npm audit reported zero vulnerabilities. Backend compatible updates were also applied. Two moderate audit entries remain in the development-only Vitest/mocker dependency chain; npm's proposed remedy is a major Vitest upgrade. The deployed application does not expose the Vitest development server. Production dependency audits should be rerun during later maintenance.

JWTs are stored in localStorage by the existing frontend. The API verifies bearer tokens and roles, hashes passwords with bcrypt, and does not return password hashes. These checks verify the assignment requirements; they are not a penetration test.

Seed records are fictional demonstration inventory with example.com external links. All 30 products have local PNG assets: the original seven, 12 additional generated images and 11 downloaded stock photographs. Image provenance is recorded in `public/images/products/README.md` and `stock-sources.json`. These are illustrative assets, not verified vendor inventory photographs. The seed repairs known placeholders and missing image URLs while preserving custom images, other product edits and admin credentials. Five-person usability testing has deliberately not been claimed or fabricated.
