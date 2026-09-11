# Dwell API

Express and Prisma REST API for the Dwell marketplace. It runs independently from the Next.js frontend and uses PostgreSQL.

## Local setup

Requirements: Node.js 22+, npm, Docker (or an existing PostgreSQL instance).

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

The API listens on `http://localhost:4000`; `GET /health` confirms it is running. The frontend origin defaults to `http://localhost:3000`. Set a strong `JWT_SECRET` and change `ADMIN_PASSWORD` before seeding any shared environment.

## Response format

Successful responses contain `data` and list endpoints may also contain pagination `meta`. Errors use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "The request contains invalid data", "details": [] } }
```

Prices are decimal strings such as `"38.00"`; dates are ISO 8601 strings. Protected endpoints expect `Authorization: Bearer <token>`.

## Endpoints

Both `/api` (the assignment contract) and `/api/v1` (existing client compatibility) are supported. Through the deployed website, prefix these with `/dwell`, for example `/dwell/api/products`. Product and vendor detail endpoints accept either a UUID or a slug. Existing slug URLs continue to work.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Register and receive a JWT |
| POST | `/api/v1/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/v1/auth/me` | User | Current profile |
| GET | `/api/v1/products` | Public | Search, filter, sort, and paginate products |
| GET | `/api/v1/products/:idOrSlug` | Public | Product detail by UUID or slug |
| POST | `/api/v1/products` | Admin | Create a product |
| PUT | `/api/v1/products/:id` | Admin | Replace editable product fields (complete product input) |
| PATCH/DELETE | `/api/v1/products/:id` | Admin | Partially update or delete a product |
| GET | `/api/v1/vendors` | Public | Vendors with product counts |
| GET | `/api/v1/vendors/:idOrSlug` | Public | Vendor and its products, by UUID or slug |
| POST | `/api/v1/vendors` | Admin | Create a vendor |
| PATCH/DELETE | `/api/v1/vendors/:id` | Admin | Update or delete a vendor |
| GET | `/api/v1/categories` | Public | Categories with product counts |
| GET | `/api/v1/categories/:slug` | Public | Category detail |
| POST | `/api/v1/categories` | Admin | Create a category |
| PATCH/DELETE | `/api/v1/categories/:id` | Admin | Update or delete a category |
| GET | `/api/v1/users/me/saved-products` | User | List saved products |
| PUT/DELETE | `/api/v1/users/me/saved-products/:productId` | User | Save or remove a product |

`GET /api/v1/products` accepts `page`, `limit`, `search`, `category`, `vendor`, `minPrice`, `maxPrice`, `availability`, and `sort`. Sort values are `newest`, `price_asc`, `price_desc`, and `title_asc`; availability values are `IN_STOCK`, `OUT_OF_STOCK`, and `PREORDER`.

## Schema design

See [database schema, ER diagram and naming decisions](../docs/database-design.md). Table names and columns are unchanged; no rename migration is needed. The additive seed contains 30 products and five vendors and preserves existing data. Provide `ADMIN_PASSWORD` with at least 12 characters to create a missing administrator; seeding never resets existing passwords. Seed vendors/products are fictional and use example.com links and demonstration images.

The schema is in third normal form: category and vendor attributes exist once and products reference them by foreign key; saved products are represented by a composite-key join table; product counts and vendor display metadata are computed from relational data instead of stored redundantly. Money uses PostgreSQL `decimal(10,2)`.

## Checks

```powershell
npm test
npm run typecheck
npm run build
npm run prisma:validate
```

Tests in `src/endpoints.test.ts` exercise real Express middleware and HTTP responses with an isolated mocked Prisma boundary. They cover both API prefixes, UUID/slug lookup, successful registration/login, password hashing, role escalation rejection, admin CRUD, expired/tampered tokens, filtering and validation. They do not claim to test PostgreSQL persistence; the separate integration script does that against a disposable database.

See [verification results and reproduction instructions](../docs/verification.md) for PostgreSQL and browser checks. Five-person usability testing remains a separate manual deliverable.

## Request examples

Registration: `POST /api/auth/register` with `{ "name": "Alex Green", "email": "alex@example.com", "password": "a-long-unique-password" }` returns HTTP 201 and `{ "data": { "user": { ... }, "token": "..." } }`. Login accepts email and password and returns the same shape with HTTP 200. User responses never include password hashes. Registration cannot assign ADMIN.

`GET /api/products?category=home-garden&minPrice=10&maxPrice=50&sort=price_asc&page=1&limit=20` returns products and `{ "page": 1, "limit": 20, "total": ..., "totalPages": ... }` in `meta`.

Create with `POST /api/products`, or replace with `PUT /api/products/<uuid>`, supplying an administrator bearer token and a JSON body:

```json
{
  "slug": "example-product",
  "title": "Example Product",
  "shortTitle": "Example Product",
  "description": "A useful description of the example product.",
  "shortDescription": "A useful example product.",
  "price": 25.5,
  "currency": "GBP",
  "availability": "IN_STOCK",
  "imageUrl": "https://example.com/image.png",
  "externalUrl": "https://example.com/product",
  "vendorId": "<existing vendor UUID>",
  "categoryId": "<existing category UUID>"
}
```

POST returns 201; PUT/PATCH return 200; DELETE returns 204 with no body. Validation errors return 400, missing/invalid authentication 401, insufficient role 403, missing records 404, and duplicate email/slug conflicts 409. PUT requires the complete editable input; PATCH accepts a non-empty subset.

For local frontend development, run the API on port 4000 and the frontend with `npm run dev` from the repository root, then visit `http://localhost:3000/dwell`. Next proxies `/dwell/api/*` to the API. Set `API_ORIGIN` if the API runs elsewhere. Production nginx can continue proxying the API directly.
