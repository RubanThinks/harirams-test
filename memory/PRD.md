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
- Order tracking page + shipping label generator
- Additional product families (butter, oils) — schema already extensible via `family`
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

## Deployment notes
- Backend runs on 0.0.0.0:8001 via supervisor.
- Frontend uses `REACT_APP_BACKEND_URL` for API calls.
- `EMERGENT_LLM_KEY` in `backend/.env` powers Emergent Object Storage.
- All routes prefixed `/api` for ingress routing.
- CRA loads `public/index.html` once at boot — restart frontend after editing (title/favicon).
