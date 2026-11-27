// DealProof — the finder itself: renders the deal cards, and wires up the
// search box, the category / store / discount filters, the new-low toggle
// and the sort. All state lives in the URL hash, so a filtered view is a
// link a shopper can share.

import { deals } from './deals.js';
import { discountPct, saving, verdict } from './verdict.js';
import { money, checkedLabel } from './format.js';

const grid = document.getElementById('deals');
const empty = document.getElementById('empty');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('filter-category');
const storeSelect = document.getElementById('filter-store');
const discountSelect = document.getElementById('filter-discount');
const sortSelect = document.getElementById('sort');
const newlowButton = document.getElementById('filter-newlow');
const clearButton = document.getElementById('clear-filters');
const filterToggle = document.getElementById('filter-toggle');
const filterRow = document.getElementById('filter-row');
const resultCount = document.getElementById('result-count');
const activeFilters = document.getElementById('active-filters');

// One small inline icon per category, so similar products (three Hisense
// TVs) do not all look identical. Simple line art, drawn in code — no
// images are loaded, so the site stays fully self-contained.
const CATEGORY_ICONS = {
  'TVs': '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M9 21h6M12 17v4"/>',
  'Headphones': '<path d="M4 15a8 8 0 0 1 16 0"/><rect x="2.5" y="13" width="4.5" height="7" rx="1.5"/><rect x="17" y="13" width="4.5" height="7" rx="1.5"/>',
  'Laptops': '<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M2 18h20"/>',
  'Phones': '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10.5 18.5h3"/>',
  'Tablets': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M10.5 18.5h3"/>',
  'E-readers': '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  'Smartwatches': '<rect x="8" y="7" width="8" height="10" rx="2"/><path d="M10 7V3h4v4M10 17v4h4v-4"/>',
  'Smart Home': '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><circle cx="12" cy="14" r="2.5"/>',
  'Kitchen': '<path d="M4 9h16v3a8 8 0 0 1-16 0z"/><path d="M8 5c0-1.5 2-1.5 2-3"/>',
  'Robot Vacuums': '<circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="3"/><path d="M12 2v3"/>',
  'Vacuums': '<path d="M4 20l3-9h10l3 9"/><path d="M9 11V6h6v5"/>',
  'Consoles & Games': '<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 11v3M6.5 12.5h3M16 11.5h.01M18 13.5h.01"/>',
  'Fitness': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 12l3-3"/>',
};

function categoryIcon(category) {
  const body = CATEGORY_ICONS[category] || '<circle cx="12" cy="12" r="8"/>';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#1e4d2b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

function unique(values) {
  return [...new Set(values)].sort();
}

function fillSelect(select, values) {
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

fillSelect(categorySelect, unique(deals.map((d) => d.category)));
fillSelect(storeSelect, unique(deals.map((d) => d.store)));

// Same product at more than one store: the cheapest listing gets a
// "best price" note, and the others point at it.
const byProduct = new Map();
for (const deal of deals) {
  const key = deal.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!byProduct.has(key)) byProduct.set(key, []);
  byProduct.get(key).push(deal);
}
for (const group of byProduct.values()) {
  if (group.length > 1) {
    const cheapest = group.reduce((a, b) => (a.price <= b.price ? a : b));
    for (const deal of group) {
      deal.bestPrice = deal === cheapest;
      deal.alsoAt = group.filter((g) => g !== deal).map((g) => `${g.store} ${money(g.price)}`);
    }
  }
}

function dealCard(deal) {
  const pct = discountPct(deal);
  const v = verdict(deal);
  const card = document.createElement('article');
  card.className = 'deal';
  // The verdict explanation lives on the badge as a tooltip, not as a
  // repeated paragraph: every card of one tier said the same sentence.
  // The note, when a deal has one, is unique to that deal and stays.
  card.innerHTML = `
    <div class="deal-top">
      <div class="deal-top-left">
        <span class="deal-icon">${categoryIcon(deal.category)}</span>
        <span class="store-chip">${deal.store}</span>
      </div>
      <span class="badge badge-${v.key}" title="${v.text}">${v.label}</span>
    </div>
    <h3 class="deal-title">${deal.title}</h3>
    <p class="deal-category">${deal.category}</p>
    <div class="deal-prices">
      <span class="sale">${money(deal.price)}</span>
      <span class="was">${money(deal.was)}</span>
      <span class="pct">−${pct}%</span>
    </div>
    <p class="deal-saving">You save ${money(saving(deal))}</p>
    ${deal.note ? `<p class="deal-verdict">${deal.note}</p>` : ''}
    ${deal.alsoAt ? `<p class="deal-also">Also at ${deal.alsoAt.join(', ')}${deal.bestPrice ? ' — this is the cheapest' : ''}.</p>` : ''}
    <p class="deal-checked">Checked ${checkedLabel(deal.checked)} · Source: <a href="${deal.source}" target="_blank" rel="noopener">${deal.source_name}</a></p>
    <div class="deal-actions">
      <a class="deal-link" href="${deal.url}" target="_blank" rel="noopener">View at ${deal.store} →</a>
    </div>
  `;
  return card;
}

function readState() {
  const hash = new URLSearchParams(location.hash.slice(1));
  return {
    q: hash.get('q') || '',
    category: hash.get('cat') || '',
    store: hash.get('store') || '',
    discount: Number(hash.get('off') || 0),
    sort: hash.get('sort') || 'discount',
    newlow: hash.get('newlow') === '1',
  };
}

function writeState(state) {
  const hash = new URLSearchParams();
  if (state.q) hash.set('q', state.q);
  if (state.category) hash.set('cat', state.category);
  if (state.store) hash.set('store', state.store);
  if (state.discount) hash.set('off', String(state.discount));
  if (state.sort !== 'discount') hash.set('sort', state.sort);
  if (state.newlow) hash.set('newlow', '1');
  history.replaceState(null, '', '#' + hash.toString());
}

function applyFilters() {
  const state = {
    q: searchInput.value.trim().toLowerCase(),
    category: categorySelect.value,
    store: storeSelect.value,
    discount: Number(discountSelect.value),
    sort: sortSelect.value,
    newlow: newlowButton.getAttribute('aria-pressed') === 'true',
  };
  writeState(state);

  let list = deals.filter((deal) => {
    if (state.q && !(deal.title + ' ' + deal.store + ' ' + deal.category).toLowerCase().includes(state.q)) return false;
    if (state.category && deal.category !== state.category) return false;
    if (state.store && deal.store !== state.store) return false;
    if (discountPct(deal) < state.discount) return false;
    if (state.newlow && verdict(deal).key !== 'newlow') return false;
    return true;
  });

  const sorts = {
    discount: (a, b) => discountPct(b) - discountPct(a),
    saving: (a, b) => saving(b) - saving(a),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  };
  list = [...list].sort(sorts[state.sort] || sorts.discount);

  grid.replaceChildren(...list.map(dealCard));
  empty.hidden = list.length > 0;
  resultCount.textContent = `${list.length} of ${deals.length} deals`;
  const bits = [];
  if (state.q) bits.push(`matching “${state.q}”`);
  if (state.category) bits.push(state.category);
  if (state.store) bits.push(state.store);
  if (state.discount) bits.push(`${state.discount}% off or more`);
  if (state.newlow) bits.push('new lows');
  activeFilters.textContent = bits.length ? '— ' + bits.join(' · ') : '';
  clearButton.hidden = bits.length === 0;
  filterToggle.textContent = bits.length ? `Filters (${bits.length})` : 'Filters';

  document.getElementById('stat-count').textContent = deals.length;
  document.getElementById('stat-newlow').textContent = deals.filter((d) => verdict(d).key === 'newlow').length;
  document.getElementById('stat-maxsave').textContent = money(Math.max(...deals.map(saving)));
}

function restoreFromHash() {
  const state = readState();
  searchInput.value = state.q;
  categorySelect.value = state.category;
  storeSelect.value = state.store;
  discountSelect.value = String(state.discount);
  sortSelect.value = state.sort;
  newlowButton.setAttribute('aria-pressed', String(state.newlow));
}

for (const el of [searchInput, categorySelect, storeSelect, discountSelect, sortSelect]) {
  el.addEventListener('input', applyFilters);
  el.addEventListener('change', applyFilters);
}

newlowButton.addEventListener('click', () => {
  newlowButton.setAttribute('aria-pressed', String(newlowButton.getAttribute('aria-pressed') !== 'true'));
  applyFilters();
});

clearButton.addEventListener('click', () => {
  searchInput.value = '';
  categorySelect.value = '';
  storeSelect.value = '';
  discountSelect.value = '0';
  sortSelect.value = 'discount';
  newlowButton.setAttribute('aria-pressed', 'false');
  applyFilters();
});

// The "new lows" header stat is a shortcut for the same filter.
const statNewlowWrap = document.getElementById('stat-newlow-wrap');
function toggleNewlowFromStat() {
  newlowButton.setAttribute('aria-pressed', String(newlowButton.getAttribute('aria-pressed') !== 'true'));
  applyFilters();
  document.querySelector('.controls').scrollIntoView({ behavior: 'smooth' });
}
statNewlowWrap.addEventListener('click', toggleNewlowFromStat);
statNewlowWrap.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleNewlowFromStat();
  }
});

// On phones the filter row starts collapsed so a deal card shows above
// the fold; on desktop it is always open.
function syncFilterCollapse() {
  const mobile = window.matchMedia('(max-width: 620px)').matches;
  if (mobile && !filterRow.dataset.touched) {
    filterRow.classList.add('collapsed');
    filterToggle.setAttribute('aria-expanded', 'false');
  } else if (!mobile) {
    filterRow.classList.remove('collapsed');
    filterToggle.setAttribute('aria-expanded', 'true');
  }
}
filterToggle.addEventListener('click', () => {
  filterRow.dataset.touched = '1';
  const collapsed = filterRow.classList.toggle('collapsed');
  filterToggle.setAttribute('aria-expanded', String(!collapsed));
});
window.addEventListener('resize', syncFilterCollapse);
syncFilterCollapse();
window.addEventListener('hashchange', () => {
  restoreFromHash();
  applyFilters();
});

restoreFromHash();
applyFilters();
