# Cart and checkout simulation implementation plan

> **For agentic workers:** Implement task-by-task with delegated frontend implementation and inline cart logic.

**Goal:** Add a persistent shopping cart, a demo checkout, and local images for the seven registered products.

**Architecture:** A client CartProvider owns browser-local cart state. Cart and checkout pages use the existing API to refresh products before confirming a simulated order. A shared ProductImage component resolves existing product URLs or bundled images by slug.

**Tech Stack:** Next.js App Router, React, TypeScript, existing CSS, Node test runner.

## Global constraints

- Preserve existing uncommitted work and the /dwell base path.
- No real payments or orders; clearly label simulation and collect no payment credentials.
- Keep existing vendor and saved-product functionality.

### Task 1: Cart state
- [x] Create `lib/cart.ts` with validated persistence, quantity limits, integer minor-unit totals, and same-currency enforcement.
- [x] Create `components/CartProvider.tsx` exposing items, ready, count, addItem, setQuantity, removeItem, clearCart.
- [x] Wrap `app/layout.tsx` in CartProvider.
- [x] Test duplicate additions, removal, invalid storage, limits, currency checks, and totals with Node tests.

### Task 2: Shopping UI
- [x] Extend header, product cards, and product details with cart entry points.
- [x] Create cart and checkout pages with quantity controls, empty states, order summary, validation, and demo confirmation.
- [x] Refresh product availability and prices from API before completing; preserve cart on failed validation.
- [x] Use responsive existing styling and accessible labels/status feedback.

### Task 3: Product imagery
- [x] Generate seven neutral studio product images into `public/images/products/`.
- [x] Create `components/ProductImage.tsx` for explicit URLs, slug fallbacks, and image errors.
- [x] Use shared images across catalogue, detail, and cart views; existing database rows resolve images without reseeding.

### Task 4: Verification
- [x] Run cart tests, frontend typecheck/build, and API tests.
- [x] Inspect shopping UI and verify cart persistence, checkout success, failure, and mobile layout where browser tooling is available.

