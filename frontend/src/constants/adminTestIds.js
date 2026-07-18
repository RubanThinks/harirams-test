export const ADMIN_TID = {
  // Layout
  layout: "admin-layout",
  navMenu: "admin-nav-menu",
  navItem: (key) => `admin-nav-${key}`,
  logout: "admin-logout",

  // Login
  loginPage: "admin-login-page",
  loginUsername: "admin-login-username",
  loginPassword: "admin-login-password",
  loginSubmit: "admin-login-submit",
  loginError: "admin-login-error",

  // Dashboard
  dashboardPage: "admin-dashboard-page",
  statPending: "admin-stat-pending",
  statCompleted: "admin-stat-completed",
  statProducts: "admin-stat-products",

  // Products
  productsPage: "admin-products-page",
  productsAddBtn: "admin-products-add",
  productRow: (sku) => `admin-product-row-${sku}`,
  productEdit: (sku) => `admin-product-edit-${sku}`,
  productDelete: (sku) => `admin-product-delete-${sku}`,
  productForm: "admin-product-form",
  productFormSave: "admin-product-form-save",
  productFormCancel: "admin-product-form-cancel",
  productImageUpload: "admin-product-image-upload",

  // Shipping
  shippingPage: "admin-shipping-page",
  shippingEditor: "admin-shipping-editor",
  shippingSave: "admin-shipping-save",
  shippingDownload: "admin-shipping-download",
  shippingUpload: "admin-shipping-upload",

  // Pending Orders
  pendingPage: "admin-pending-page",
  pendingSortField: "admin-pending-sort-field",
  pendingSortDirection: "admin-pending-sort-direction",
  pendingRow: (id) => `admin-pending-row-${id}`,
  pendingCheckbox: (id) => `admin-pending-check-${id}`,
  pendingSelectAll: "admin-pending-select-all",
  pendingPrintAll: "admin-pending-print-all",
  pendingPrintAddresses: "admin-pending-print-addresses",
  pendingMarkShipped: "admin-pending-mark-shipped",
  printSingleAddress: (id) => `admin-print-address-${id}`,
  sendInvoice: (id) => `admin-send-invoice-${id}`,

  // Completed Orders
  completedPage: "admin-completed-page",
  completedFrom: "admin-completed-from",
  completedTo: "admin-completed-to",
  completedApply: "admin-completed-apply",
  completedExportXlsx: "admin-completed-export-xlsx",
  completedExportPdf: "admin-completed-export-pdf",
  completedRow: (id) => `admin-completed-row-${id}`,
};
