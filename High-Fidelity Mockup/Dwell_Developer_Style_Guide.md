# Dwell — Front-End Style Guide

Design tokens for the mint / forest-green palette used across the high-fidelity mockups. Copy the values below directly into the React/Tailwind/CSS build — no need to re-derive anything from the mockup images.

## Colour tokens

| Token | Hex | Use |
|---|---|---|
| `primary` | `#1B4332` | Nav bar, primary buttons, headings, footer bg |
| `primary-dark` | `#12281C` | Hover/active state on primary elements |
| `secondary` | `#2D6A4F` | Secondary buttons, links, active nav state |
| `leaf` | `#40916C` | Icons, price text, decorative accents |
| `mint` | `#95D5B2` | Badges, stock tags, highlight chips |
| `pale-mint` | `#EAF6EF` | Hero background, alternating section bg |
| `bg` | `#FAFBF9` | Page background |
| `white` | `#FFFFFF` | Cards, inputs, header bar |
| `text` | `#1B2B22` | Headings and body copy |
| `text-muted` | `#5B6B63` | Secondary/meta text, placeholders |
| `border` | `#D7E6DD` | Dividers, input outlines, card borders |
| `error` | `#BA1A1A` | Form validation errors only |
| `img-placeholder` | `#DCEDE3` | Placeholder image fill (dev use only, remove once real images are wired up) |
| `img-placeholder-icon` | `#9FB8AC` | Placeholder icon/label colour |

**Contrast notes:** white text is only AA-safe on `primary` (11.08:1) and `secondary` (6.39:1) — do **not** put white text on `leaf` or `mint`, both are accent/background tones and fail AA for normal-size text. `text-muted` is AA-safe on `white`, `bg` and `pale-mint`, but not on `mint`.

## CSS custom properties

Drop this into your global stylesheet (e.g. `index.css`):

```css
:root {
  --color-primary: #1B4332;
  --color-primary-dark: #12281C;
  --color-secondary: #2D6A4F;
  --color-leaf: #40916C;
  --color-mint: #95D5B2;
  --color-pale-mint: #EAF6EF;
  --color-bg: #FAFBF9;
  --color-white: #FFFFFF;
  --color-text: #1B2B22;
  --color-text-muted: #5B6B63;
  --color-border: #D7E6DD;
  --color-error: #BA1A1A;

  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Lato', sans-serif;

  --radius-sm: 8px;   /* buttons, inputs */
  --radius-md: 14px;  /* cards */
  --radius-pill: 999px; /* badges */
}
```

## Tailwind config

If the team uses Tailwind (per the brief's suggested stack), extend the theme instead of using arbitrary hex values inline:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1B4332", dark: "#12281C" },
        secondary: "#2D6A4F",
        leaf: "#40916C",
        mint: "#95D5B2",
        "pale-mint": "#EAF6EF",
        bg: "#FAFBF9",
        text: { DEFAULT: "#1B2B22", muted: "#5B6B63" },
        border: "#D7E6DD",
        error: "#BA1A1A",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Lato", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
      },
    },
  },
};
```

Usage example: `<button className="bg-primary text-white rounded-sm px-4 py-3 font-body font-bold">Log in</button>`

## Typography

Fonts: [Poppins](https://fonts.google.com/specimen/Poppins) (headings) + [Lato](https://fonts.google.com/specimen/Lato) (body). Google Fonts import:

```html
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Size |
|---|---|---|---|
| Page/section heading (H1) | Poppins | 700 | 30–36px |
| Sub-heading (H2) | Poppins | 600–700 | 20–24px |
| Product/card title | Poppins | 600–700 | 15–18px |
| Body copy | Lato | 400 | 13–16px |
| Buttons / labels | Lato | 700 | 12–16px |
| Meta / helper text | Lato | 400 | 11–13px |

Minimum body text size is 13px sitewide — don't go smaller, it was set to satisfy the brief's readable-font-size accessibility check.

## Components

**Buttons** — 8px radius, bold Lato label, ~48–56px height for primary actions:
- Primary: `bg-primary` fill, white text — main CTA per screen (Browse products, Log in, Save product)
- Secondary: `bg-secondary` fill, white text — constructive secondary actions (Create account, Add product)
- Outline: white fill, 1.5px `primary` border, `primary` text — lower-emphasis actions (View, Vendors)
- Ghost: white fill, 1.5px `border` outline, `text` colour — toggle-style controls (Filters/Sort pills on mobile)

**Cards** — white fill, 1px `border`, 14px radius. One component reused for product cards, category tiles, sidebar, vendor panel, and admin forms.

**Badges** — fully rounded (pill), `mint` bg + `primary` text for stock/status tags; `pale-mint` bg + `secondary` text for category tags. Bold label, ~12px.

**Inputs** — white fill, 1px `border`, 8px radius, 44–48px height, `text-muted` placeholder colour, label in bold `text` 13px above the field.

**Image placeholders** — `img-placeholder` fill with a simple picture icon; swap for real `<img>` tags on build, same border-radius as the parent card.

## Reference

Full rationale (why this palette, contrast testing methodology, and page-by-page mockup breakdown) is in `Dwell_HighFidelity_Mockup_Spec.docx` in the same folder. This file is the quick-reference version for implementation — that one is the design write-up for the assessment submission.
