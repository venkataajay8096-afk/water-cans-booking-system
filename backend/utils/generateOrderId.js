/**
 * Generate a unique order ID in format ORD-YYYYMMDD-XXXX
 */
function generateOrderId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${rand}`;
}

module.exports = { generateOrderId };
