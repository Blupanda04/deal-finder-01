// DealProof — the deal verdict. A deal is only as good as its evidence:
// how far the sale price sits below the usual price, and whether the
// product has sold this low before. The signal is computed from the two
// prices the agent actually saw, plus the note the research attached.

export function discountPct(deal) {
  if (!deal.was || deal.was <= 0) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function saving(deal) {
  return Math.max(0, (deal.was || 0) - deal.price);
}

export function verdict(deal) {
  const pct = discountPct(deal);
  if (deal.signal === 'new-low' || pct >= 55) {
    return { key: 'newlow', label: 'NEW LOW', text: 'Lowest price we have seen for this product.' };
  }
  if (pct >= 40) {
    return { key: 'strong', label: 'STRONG DEAL', text: 'A large cut on a product that rarely goes this low.' };
  }
  if (pct >= 25) {
    return { key: 'fair', label: 'FAIR DEAL', text: 'A real saving, but it has sold near this price before.' };
  }
  return { key: 'routine', label: 'ROUTINE SALE', text: 'A small cut on a product that is often discounted.' };
}
