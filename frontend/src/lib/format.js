/** Format Indian currency without external deps. */
export function formatINR(n) {
  const v = Number(n) || 0;
  return "₹" + v.toLocaleString("en-IN");
}
