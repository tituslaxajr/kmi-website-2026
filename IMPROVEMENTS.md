# KMI Website 2026 — Improvements & Known Issues

> Scanned: 2026-03-19 | Covers public pages, admin panel, components, and SEO

---

## Priority Legend
- 🔴 **High** — Bugs or significant UX/accessibility failures
- 🟡 **Medium** — Noticeable inconsistencies or missing features
- 🟢 **Low** — Polish, maintenance, and nice-to-haves

---

## 1. Accessibility (WCAG)

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 1.1 | 🔴 | Empty `alt=""` on partner, ministry, media, story, and team images — screen readers skip them | `AdminMedia.tsx`, `AdminMinistries.tsx`, `AdminPartners.tsx`, `AdminStories.tsx`, `AdminTeam.tsx` |
| 1.2 | 🔴 | Form inputs in Contact and Give pages have no `<label>` elements — placeholders disappear on focus | `ContactPage.tsx`, `GivePage.tsx`, `NewsletterSubscribe.tsx` |
| 1.3 | 🟡 | Focus ring colors are inconsistent — some inputs use `focus:ring-harvest-gold`, others use different colors | Multiple form components |
| 1.4 | 🟡 | Keyboard navigation on mobile nav is not fully accessible (no focus trap, no ARIA roles) | `Navbar.tsx` |
| 1.5 | 🟢 | Some heading levels are skipped on a few pages (e.g., jumping h2 → h4) | Various pages |

---

## 2. SEO & Metadata

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 2.1 | 🔴 | Root layout has only a title — no description, Open Graph, or Twitter card metadata | `app/layout.tsx` |
| 2.2 | 🔴 | No page-specific `generateMetadata()` on any public page — all pages share the same generic title | `app/(public)/*/page.tsx` |
| 2.3 | 🔴 | Story and partner detail pages have no OG image, making social sharing previews blank | `app/(public)/stories/[slug]/page.tsx`, `app/(public)/partners/[id]/page.tsx` |
| 2.4 | 🟡 | No JSON-LD structured data for Organization, BreadcrumbList, or Article types | All pages |
| 2.5 | 🟢 | Hero image alt text is generic ("Philippine countryside") — could be more descriptive for SEO | `HomePage.tsx` |

---

## 3. Critical UX Bugs

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 3.1 | 🔴 | Contact form shows "Message Sent!" even when the API call fails — user thinks it worked | `ContactPage.tsx` (~line 24) |
| 3.2 | 🔴 | Footer social media links all point to `#` — clicking does nothing | `Footer.tsx` |
| 3.3 | 🟡 | Give page donation amount input has no validation feedback — user gets no message on invalid input | `GivePage.tsx` |
| 3.4 | 🟡 | API failures fall back silently to mock data with no user notification (e.g., impact stats show 0) | `HomePage.tsx`, multiple pages |

---

## 4. UI & Design Consistency

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 4.1 | 🟡 | Payment method colors (GCash blue, Maya green, bank color) are hardcoded hex values, not design tokens | `GivePage.tsx` |
| 4.2 | 🟡 | Secondary button uses `border-harvest-gold/50` while outline variant uses `border-covenant-navy/15` — inconsistent opacity | `Button.tsx` |
| 4.3 | 🟡 | Primary button hover color hardcoded as `#c88e30` instead of a CSS variable | `Button.tsx` |
| 4.4 | 🟡 | Hover states differ across cards — StoryCard uses `group-hover:text-harvest-gold`, PartnerCard uses a gradient overlay | `StoryCard.tsx`, `PartnerCard.tsx` |
| 4.5 | 🟡 | Admin pages use inconsistent padding — some use `p-4 sm:p-6 lg:p-8`, others differ | Admin page components |
| 4.6 | 🟢 | Font weight `650` is used in Navbar dropdown but Inter only loads 300–800 (no 650) — browser falls back | `Navbar.tsx` |
| 4.7 | 🟢 | `h4` heading does not use `clamp()` for responsive scaling like `h1`–`h3` do | `src/styles/theme.css` |
| 4.8 | 🟢 | Legacy color aliases coexist with the new Kapatid Design System tokens — creates dual naming conventions | `theme.css` |

---

## 5. Loading & Empty States

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 5.1 | 🟡 | PartnersPage has no loading indicator — blank content while data fetches | `PartnersPage.tsx` |
| 5.2 | 🟡 | MinistriesPage has a loading flag but no skeleton UI — content appears abruptly | `MinistriesPage.tsx` |
| 5.3 | 🟡 | Admin pages have inconsistent loading states — some show spinners, others show blank | Admin pages |
| 5.4 | 🟢 | No empty state illustrations when lists have no items (e.g., no stories, no partners yet) | Admin list pages |

---

## 6. Admin Panel

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 6.1 | 🟡 | Delete confirmations use native `confirm()` and `alert()` dialogs — not branded, jarring UX | `AdminStories.tsx`, `AdminPartners.tsx`, others |
| 6.2 | 🟡 | AdminDashboard has hardcoded mock donation data rendered in production | `AdminDashboard.tsx` (~lines 30–36) |
| 6.3 | 🟡 | Seeding function result is logged with `console.log` and failure shown with `alert()` | `AdminDashboard.tsx` |
| 6.4 | 🟢 | Mobile sidebar may cause a brief layout shift when toggled | `app/admin/layout.tsx` |

---

## 7. Image & Performance

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 7.1 | 🔴 | Hero and story card `<img>` tags have no `width`/`height` attributes — causes Cumulative Layout Shift (CLS) | `HomePage.tsx`, `StoryCard.tsx` |
| 7.2 | 🟡 | Images not lazy-loaded with `loading="lazy"` — all images download on initial page load | Multiple pages |
| 7.3 | 🟡 | No `<Image>` component from Next.js used — missing automatic WebP conversion and responsive `srcSet` | All `<img>` tags |
| 7.4 | 🟡 | Heavy admin components (image picker, block editor) not dynamically imported — increase bundle size for public users | Admin components |
| 7.5 | 🟢 | Framer Motion animations run on every page — consider `prefers-reduced-motion` support | All animated pages |

---

## 8. Mobile Responsiveness

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 8.1 | 🟡 | Give page payment methods and account copy UI may overflow on small phones (<375px) | `GivePage.tsx` |
| 8.2 | 🟢 | Footer grid jumps from 1 column to 2 (`md:`) with no `sm:` breakpoint — wastes space on tablets | `Footer.tsx` |
| 8.3 | 🟢 | Some content sections lack `max-w-*` on ultra-wide screens (>1600px) — text lines become too long | Various sections |

---

## 9. Code Quality & Maintenance

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 9.1 | 🟡 | 68+ `console.log/error/warn` statements left in production code | Multiple files |
| 9.2 | 🟡 | No toast notification system — errors and successes either use `alert()` or are silent | Global |
| 9.3 | 🟢 | API fallback to mock data is silent — a logging/monitoring service (e.g., Sentry) would help catch issues | `api.ts`, page components |

---

## Recommended Fix Order

1. 🔴 Fix `ContactPage.tsx` — show error message when form submission fails
2. 🔴 Add `alt` text to all images in admin components
3. 🔴 Add `<label>` elements to all form inputs (Contact, Give, Newsletter)
4. 🔴 Add page metadata + Open Graph tags to all public pages
5. 🔴 Fix footer social links (replace `#` with real URLs or remove icons)
6. 🟡 Replace native `confirm()`/`alert()` in admin with a modal component
7. 🟡 Add `width`/`height` to all `<img>` tags (or migrate to Next.js `<Image>`)
8. 🟡 Standardize admin page padding and loading states
9. 🟡 Standardize button hover/border styles using design tokens only
10. 🟢 Add `generateMetadata()` to story and partner detail pages
11. 🟢 Remove `console.log` statements and integrate a proper error logger
12. 🟢 Add `prefers-reduced-motion` support to Framer Motion animations
