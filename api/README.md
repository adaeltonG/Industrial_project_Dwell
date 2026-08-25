# Dwell API

Express and Prisma REST API for the Dwell marketplace. It runs independently from the Next.js frontend and uses PostgreSQL.

## Local setup

Requirements: Node.js 20+, npm, Docker (or an existing PostgreSQL instance).

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

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Register and receive a JWT |
| POST | `/api/v1/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/v1/auth/me` | User | Current profile |
| GET | `/api/v1/products` | Public | Search, filter, sort, and paginate products |
| GET | `/api/v1/products/:slug` | Public | Product detail |
| POST | `/api/v1/products` | Admin | Create a product |
| PATCH/DELETE | `/api/v1/products/:id` | Admin | Update or delete a product |
| GET | `/api/v1/vendors` | Public | Vendors with product counts |
| GET | `/api/v1/vendors/:slug` | Public | Vendor and its products |
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

The schema is in third normal form: category and vendor attributes exist once and products reference them by foreign key; saved products are represented by a composite-key join table; product counts and vendor display metadata are computed from relational data instead of stored redundantly. Money uses PostgreSQL `decimal(10,2)`.

## Checks

```powershell
npm test
npm run typecheck
npm run build
npm run prisma:validate
```
