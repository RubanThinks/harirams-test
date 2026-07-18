/** Central test-id constants for E2E accessibility */
export const TESTIDS = {
  // Header
  header: "site-header",
  headerLogo: "header-logo",
  headerNav: "header-nav",
  headerNavItem: (key) => `header-nav-${key}`,
  headerSearch: "header-search",
  headerAccount: "header-account",
  headerCart: "header-cart",
  headerCartCount: "header-cart-count",
  mobileMenuBtn: "mobile-menu-btn",
  mobileMenu: "mobile-menu",

  // Hero
  hero: "hero",
  heroSlide: (id) => `hero-slide-${id}`,
  heroCta: "hero-cta",
  heroPrev: "hero-prev",
  heroNext: "hero-next",
  heroDot: (i) => `hero-dot-${i}`,

  // Benefits
  benefits: "benefits-strip",
  benefit: (id) => `benefit-${id}`,

  // Products
  productsSection: "products-section",
  productCard: (sku) => `product-card-${sku}`,
  productAdd: (sku) => `product-add-${sku}`,
  productBestSeller: (sku) => `product-bestseller-${sku}`,

  // Cart Drawer
  cartDrawer: "cart-drawer",
  cartItem: (sku) => `cart-item-${sku}`,
  cartQtyPlus: (sku) => `cart-qty-plus-${sku}`,
  cartQtyMinus: (sku) => `cart-qty-minus-${sku}`,
  cartRemove: (sku) => `cart-remove-${sku}`,
  cartSubtotal: "cart-subtotal",
  cartCheckoutBtn: "cart-checkout-btn",
  cartEmpty: "cart-empty",

  // Checkout
  checkoutStepAddress: "checkout-step-address",
  checkoutStepOtp: "checkout-step-otp",
  checkoutStepPayment: "checkout-step-payment",
  addrName: "addr-name",
  addrPhone: "addr-phone",
  addrLine1: "addr-line1",
  addrLine2: "addr-line2",
  addrLandmark: "addr-landmark",
  addrCity: "addr-city",
  addrState: "addr-state",
  addrPincode: "addr-pincode",
  addrContinue: "addr-continue",
  otpInput: "otp-input",
  otpSend: "otp-send",
  otpVerify: "otp-verify",
  otpResend: "otp-resend",
  payMethod: (m) => `pay-method-${m}`,
  payNow: "pay-now",
  orderSummary: "order-summary",
  orderShipping: "order-shipping",
  orderTotal: "order-total",

  // Confirmation
  confirmation: "confirmation-page",
  confirmationOrder: "confirmation-order-number",
  confirmationContinue: "confirmation-continue",

  // Footer
  footer: "site-footer",
  newsletterEmail: "newsletter-email",
  newsletterSubmit: "newsletter-submit",

  // Search page
  searchPage: "search-page",
  searchInput: "search-input",
  searchResult: (sku) => `search-result-${sku}`,
  searchEmpty: "search-empty",

  // Account
  accountLoginPage: "account-login-page",
  accountLoginPhone: "account-login-phone",
  accountLoginSendOtp: "account-login-send-otp",
  accountLoginOtp: "account-login-otp",
  accountLoginVerify: "account-login-verify",
  accountPage: "account-page",
  accountLogout: "account-logout",
  accountProfile: "account-profile",
  accountOrders: "account-orders",
  accountOrder: (n) => `account-order-${n}`,
  accountOrderView: (n) => `account-order-view-${n}`,
};
