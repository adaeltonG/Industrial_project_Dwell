# Cart and checkout demo

Use **Add to cart** on any product card or product page, then open **Cart** in the header. The cart supports quantities from 1 to 99, removal, and a running total. It is stored in this browser and shared between tabs; no sign-in is required. Storage-disabled browsers can shop in memory for the current page session.

**Try demo checkout** opens a sample delivery form. Use fictional details. Checkout checks each product's current API price, currency, and availability before displaying a demo reference and receipt. It makes no order or payment request and does not save or send delivery details. Successful simulation clears the cart; failed checks preserve it. If a product changed, remove it and add its updated listing before retrying. The receipt is temporary and disappears when leaving or refreshing the checkout page.

The demo supports currencies with two decimal places and one currency per cart. Out-of-stock items cannot be added; pre-orders are labelled. Totals use integer minor units.

## Product images

All seven seeded product slugs resolve bundled PNG images through `components/ProductImage.tsx`, so existing database records need no reseeding. An explicitly configured image URL takes precedence; failed images fall back to the bundled image or an accessible placeholder. The app's `/dwell` base path is included in static asset URLs.

Images and generation prompts are in `public/images/products/`. These are generated catalogue illustrations, not supplier photography.

## Verification

- `npm test`: cart validation, price arithmetic, quantity limits, persistence parsing, duplicate additions, and mixed-currency handling.
- `npm run build`: production build and TypeScript validation.
- `cd api` then `npm test`: existing API regression tests.
- With Playwright installed and `npm run dev -- --port 3100` running: `node tests/shopping.browser.mjs`. An absolute path to `playwright/index.mjs` can be passed as the first argument for an external installation. Set `TEST_BASE_URL` to override `http://localhost:3100/dwell`.

Browser tests mock catalogue API responses to exercise all seven product images, catalogue/detail add actions, refresh persistence, quantity totals, mobile layout, failed price/stock/API checks, successful checkout and removal. They do not require or mutate a live database. Screenshots are saved under ignored `tmp/shopping-qa/`.
