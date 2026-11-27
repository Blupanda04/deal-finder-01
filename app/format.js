// DealProof — small formatting helpers, one job each.

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function checkedLabel(iso) {
  // The stores and shoppers are in the US, so the check time is shown in
  // Eastern Time (EST, UTC-5 in November) rather than the builder's local
  // timezone. The stored timestamp is still the same instant in UTC.
  const d = new Date(iso);
  const et = new Date(d.getTime() - 5 * 3600 * 1000);
  const day = et.getUTCDate();
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][et.getUTCMonth()];
  let h = et.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(et.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${et.getUTCFullYear()}, ${h}:${mm} ${ampm} ET`;
}

export function storeInitials(store) {
  return store.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
