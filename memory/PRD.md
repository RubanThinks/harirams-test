# Hariram's Pure Cow Ghee — PRD & Build Log

## Original Problem Statement
Build a production-ready ecommerce website for Hariram's Pure Cow Ghee — following supplied PRD, Brand Guidelines, Design System, Implementation Guidelines, and Acceptance Test Plan.  Configuration-driven landing page, guest checkout with phone OTP verification, mocked payment for Phase 1 (real Razorpay + real SMS OTP to be wired at go-live).

## User Personas
- **Family Shopper (primary)** — 25–55, mother/homemaker; buys 500ml or 1L monthly.
- **Bulk Buyer** — restaurants / temples / joint families; buys 5L.
- **First-time Buyer** — health-conscious young adult; 200ml starter.
- **Admin (Hariram's owner)** — edits config JSONs; will get a lightweight admin UI in Phase 2.

## Architecture
- **Frontend**: React 19 SPA (CRA), Tailwind + Shadcn UI, react-router, sonner toasts, lucide-react icons. Playfair Display headings + Lora body + Cormorant italic accents.
- **Backend**: FastAPI + Motor (async MongoDB). Pydantic v2 models. Config-driven from `/app/backend/config/*.json`.
- **DB**: MongoDB collections — `orders`, `otp_requests`, `newsletter`, `feedback`, `product_images` (object-storage refs).
- **Object storage**: Emergent Object Storage via `storage.py` (session-scoped `storage_key`). Product images stored under `harirams-ghee/uploads/products/*` and served through DB-backed `/api/uploads/products/{filename}` route with legacy on-disk fallback.
- **Assets**: Artwork in `/app/frontend/public/assets/{hero,products,logo,ui}/`. Favicon = `logo.webp`.

## Configuration files (business-owned, admin-editable)
- `company.json` — brand, tagline, GST/FSSAI, customer care
- `theme.json` — colour palette
- `products.json` — catalog (extensible to butter/oils via `family` field)
- `hero_banners.json` — rotating banners (3 supplied, enabled flags)
- `benefits.json` — 5 benefits + icons
- `footer.json`, `navigation.json`, `social_links.json`
- `shipping_rates.json` — rule-based (CITY / STATE / PINCODE / DEFAULT + free-shipping threshold)
- `seo.json`, `site_config.json`, `faq.json`, `features.json`, `legal.json`, `testimonials.json`
- `content/*.md` (+ `content_manifest.json`) — markdown pages for Why Hariram's, Recipes, FAQ, Contact (editable in Admin Config Editor)
- `legal/*.md` (+ `legal_manifest.json`) — Terms, Privacy, Returns, Shipping, Payment

## What's implemented (2026-02, latest)
- Sticky Header, rotating Hero, Benefits Strip, dynamic Product Grid, Cart Drawer, multi-step Checkout, Order Confirmation, Footer, Newsletter
- Search page + Account (phone-OTP login) with profile + order history
- Notification stub (SMS + WhatsApp) — logs, receipts on order response
- **Content pages** (`/why-hariram`, `/recipes`, `/faq`, `/contact`) rendered from `/api/content/{id}` — markdown source in `backend/config/content/*.md`, editable via Admin Config Editor
- **Feedback page** (`/feedback`) with form → `POST /api/feedback` → Mongo `feedback` collection
- **Favicon + browser tab title** (`Hariram's Pure Cow Ghee`, logo.webp)
- **Emergent Object Storage** integration for admin product image uploads (fixes ephemeral-disk deployment blocker)
- **ScrollToTop** on route change (footer/nav links land at top of target page)
- **Footer**: split "My Account" column to a single `/account` link, added Feedback link, downsized Stay Connected input+button so nothing overflows the column
- **Cart drawer** "Continue Shopping" now scrolls to `#products` on `/` or navigates to `/#products` from other routes
- **Compacted vertical spacing** in Hero mobile CTA, Benefits strip, Product grid, Footer

### Feb 2026 — Admin console upgrades
- **Multi-image products**: each product now carries `images: [{url, isMain}]` (max 6). `products.json` keeps `image` as a mirror of the main-flagged URL so the storefront stays untouched. Admin UI has a thumbnail grid with per-image Set-as-Main and Delete controls. New endpoint `POST /admin/products/{sku}/delete-image` also soft-deletes the underlying `product_images` record.
- **Redesigned address stickers** (`POST /admin/orders/print-address`) — the old single-address-per-page template is gone. Layout: logo top-center, bold TO block (with phone), bold FROM block **hardcoded and bottom-aligned to the sticker** (Hariram Home Needs / B12, Sidharth Apartment / Balakrishnan Street / West Mambalam / Chennai - 600033 / Ph : 9500021456), thin brown outer border and a gold divider. **Always 3 columns** so every box is ~68.7 mm wide for print/cut/paste:
  - A5 **landscape** = 3 cols × 1 row (3 slots)
  - A4 portrait = 3 cols × 2 rows (6 slots)
  - Empty slots are drawn as **blank bordered boxes** (no logo, no address) to keep the sticker grid intact
  - Page selection: `<=3` → A5, 4–6 → A4, `>6` → greedy A4 pages of 6 + remainder (A5 if `<=3`, else A4)
  - Delivered as **one PDF with mixed page sizes** (reportlab canvas + `setPageSize` per page).
- **Admin 2FA** (WhatsApp OTP via MSG91, falls back to MOCK): password step returns `{ otpRequired, sessionId, otpTarget, ttlMinutes, mock, [mockOtp] }`; a second call to `POST /admin/auth/verify-otp` exchanges the OTP for the real JWT. Target phone `+91-9500049550` is hardcoded per spec. `mockOtp` is only echoed when `MSG91_ADMIN_TEMPLATE_ID` is empty.

### Feb 2026 — Storefront upgrades
- **Razorpay TEST payments** wired end-to-end. New backend routes `/api/payments/razorpay/{config,create-order,verify}` (HMAC-SHA256 signature verification). `checkout.razorpay.com/v1/checkout.js` loaded from `public/index.html`. Checkout flow: UPI/CARD/NETBANKING open the Razorpay modal and only place the local order after signature verification succeeds; COD bypasses the gateway.
- **MSG91 WhatsApp OTP** helper (`backend/msg91.py`) uses MSG91's v5/otp hosted endpoints so MSG91 handles OTP generation, storage and verification. Falls back to MOCK (fixed OTP `123456` for customers, echoed OTP for admin 2FA) when the corresponding `MSG91_TEMPLATE_ID` / `MSG91_ADMIN_TEMPLATE_ID` env var is empty.
- **Multi-image hover on product cards** (`ProductGrid.jsx`): main image shows by default; mouseover/focus reveals side images, cycling every 1.4 s while the pointer is on the card; leaving the card restores the main image. Small progress dots indicate active image.
- **GST update** in `company.json` → `33DDOPS8117L2ZV`.

## Admin Console
- **Auth**: username `admin` + bcrypt-hashed password in `.env` + JWT (8 h) + brute-force lock (5 attempts / 15 min per ip+username). `POST /api/admin/auth/login`, `GET /api/admin/auth/me`
- **Products** (`/admin/products`): full CRUD on `products.json`; image upload goes to **Emergent Object Storage** (path `harirams-ghee/uploads/products/{sku}_{uuid}.ext`), tracked in Mongo `product_images`, served via `/api/uploads/products/{filename}`
- **Shipping rates** (`/admin/shipping`): live JSON editor + Download / **validated JSON upload** (no raw file writes)
- **Pending orders** (`/admin/orders/pending`): sort, multi-select, bulk Mark Shipped, PDF addresses, single-order invoice
- **Completed orders** (`/admin/orders/completed`): summary + Excel + PDF export
- **Universal config editor** (`/admin/config`): edits every `.json` and `.md` under `backend/config/` (legal + content included)
- **Tests**: 63/63 storefront+admin + 18/18 new iteration-5 tests

## Prioritised backlog

### P0 (go-live blockers)
- Real SMS OTP gateway (MSG91 / Twilio) — swap in `/api/auth/send-otp` & `verify-otp`
- Real payment gateway (Razorpay — UPI/Cards/NetBanking)
- Real product photography (studio-shot bottles for each pack size)
- Verified FSSAI/GST numbers in `company.json` (currently placeholders)
- Verified shipping rates per zone in `shipping_rates.json`
- SEO: product detail pages (`/product/:slug`), JSON-LD, sitemap.xml, robots.txt

### P1 (Phase 2)
- **MSG91 WhatsApp OTP for admin 2FA** — currently mocked with `mockOtp` shown on screen. Swap in `admin_auth.py::login` (search for MSG91).
- Order tracking page + shipping label generator
- Additional product families (butter, oils) — schema already extensible via `family`
- **Hover-to-swap storefront images** using the new `images[]` gallery (main = default, sides on hover)
- Populate Why Hariram's / Recipes / FAQ / Contact markdown with real copy
- Wishlist, product search improvements
- Analytics: GA4 + conversion events
- Inventory / stock check at checkout
- Rate limit / CAPTCHA on `/api/feedback` and `/api/newsletter/subscribe`
- Admin Newsletter/Feedback export UI (Excel)
- Admin "Change Password" UI
- Admin Site Health Widget (missing images, placeholder configs, stuck orders, unserved pincodes)

### P2 (nice-to-have)
- Loyalty programme / referral
- Subscription (monthly ghee auto-ship)
- Coupon codes
- Product reviews + testimonial capture
- Multi-lingual (Tamil, English)

## Test credentials
See `/app/memory/test_credentials.md`. OTP: **123456** (mocked, any 10-digit phone).

### Feb 2026 — Production data cleanup
- **Root cause of dummy orders in prod**: preview and deployed production use **separate MongoDB instances**; test orders accumulated in the production DB during earlier testing of the deployed URL. Preview DB fully purged (111 orders + OTP state).
- **New admin-only purge endpoint**: `POST /api/admin/orders/purge` (admin JWT + body `{"confirm":"DELETE_ALL_ORDERS"}`) deletes all `orders`, `otp_requests`, `admin_otp_sessions`. Verified on preview (deleted counts returned, pending=0 after).
- **BLOCKER fixed**: `ADMIN_PASSWORD_HASH` in `backend/.env` switched to single quotes so `$` chars in the bcrypt hash can't be shell-expanded during K8s env injection. Deployment agent: PASS.
- **PENDING**: user must **Republish** so the purge endpoint exists on https://hariram-ghee-shop.emergent.host/, then run purge against production (90 pending + 80 completed orders confirmed live).

## Deployment notes
- Backend runs on 0.0.0.0:8001 via supervisor.
- Frontend uses `REACT_APP_BACKEND_URL` for API calls.
- `EMERGENT_LLM_KEY` in `backend/.env` powers Emergent Object Storage.
- All routes prefixed `/api` for ingress routing.
- CRA loads `public/index.html` once at boot — restart frontend after editing (title/favicon).
