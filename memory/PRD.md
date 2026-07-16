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
- **DB**: MongoDB collections — `orders`, `otp_requests`, `newsletter`.
- **Assets**: All artwork in `/app/frontend/public/assets/{hero,products,logo,ui}/`.

## Configuration files (business-owned, admin-editable)
- `company.json` — brand, tagline, GST/FSSAI, customer care
- `theme.json` — colour palette
- `products.json` — catalog (extensible to butter/oils via `family` field)
- `hero_banners.json` — rotating banners (3 supplied, enabled flags)
- `benefits.json` — 5 benefits + icons
- `footer.json`, `navigation.json`, `social_links.json`
- `shipping_rates.json` — rule-based (CITY / STATE / PINCODE / DEFAULT + free-shipping threshold)
- `seo.json`, `site_config.json`, `faq.json`, `features.json`, `legal.json`, `testimonials.json`

## What's implemented (2026-02)
- Sticky Header (logo, brand, italic tagline, kolam gold divider, nav, cart badge, mobile hamburger)
- Rotating Hero carousel — uses supplied artwork verbatim, accessible transparent CTA hotspot + mobile-visible CTA button below image, dots + prev/next
- Benefits Strip — 5 lucide icons + config-driven titles
- Product Grid — dynamic from `/api/products`, BESTSELLER ribbon (500ml), pack-size badges (5L blue), Perfect-for line, MRP strikethrough, Add-to-Cart
- Cart Drawer (Sheet) — qty +/-, remove, subtotal, Proceed to Checkout
- Multi-step Checkout — Address (auto-shipping on pincode blur, repeat-customer last-address auto-fill on phone blur) → OTP (mocked 123456) → Payment (UPI/CARD/NETBANKING/COD, all mocked)
- Order Confirmation — HR-prefixed order number, itemised summary, ETA (+4 days), delivery address
- Footer — 4 columns + newsletter + FSSAI/GST compliance + red kolam copyright bar
- Newsletter subscribe endpoint
- Backend suite: `/api/config/{name}`, `/api/products`, `/api/products/{sku}`, `/api/shipping/calculate`, `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/customers/last-address`, `/api/orders`, `/api/orders/{id}`, `/api/newsletter/subscribe`
- Test suite: 31/31 pytest passing at `/app/backend/tests/test_hariram_api.py`
- Full E2E flow verified by testing agent (100% pass)

## Prioritised backlog

### P0 (go-live blockers)
- Real SMS OTP gateway (MSG91 / Twilio) — swap in `/api/auth/send-otp` & `verify-otp`
- Real payment gateway (Razorpay recommended for India — UPI/Cards/NetBanking)
- Real product photography (studio-shot bottles for each pack size)
- Verified FSSAI/GST numbers in `company.json` (currently placeholders)
- Verified shipping rates per zone in `shipping_rates.json`
- Order-status webhook / email / SMS notifications

### P1 (Phase 2)
- Admin panel to edit config JSONs (or move configs to DB) — CRUD for products, banners, rates, FAQs
- Order tracking page + shipping label generator
- Login (repeat customers see their orders + addresses)
- Additional product families (butter, oils) — schema already extensible via `family`
- Recipe / Our Story / FAQ / Contact static pages populated
- Wishlist, product search
- Analytics: GA4 + conversion events
- Inventory / stock check at checkout
- Multi-lingual (Tamil, English)

### P2 (nice-to-have)
- Loyalty programme / referral
- Subscription (monthly ghee auto-ship)
- Coupon codes
- Product reviews + testimonial capture
- Dark mode (evaluate — brand is warm/cream)

## Test credentials
See `/app/memory/test_credentials.md`. OTP: **123456** (mocked, any 10-digit phone).

## Deployment notes
- Backend runs on 0.0.0.0:8001 via supervisor.
- Frontend uses `REACT_APP_BACKEND_URL` for API calls.
- All routes prefixed `/api` for ingress routing.
