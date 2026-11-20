/* Optional card meta & badge renderer for Pi Society menu items.
 * Add <div class="menu-item-meta">...</div> above .item-heading inside each .menu-item
 * to show item numbering (#01) and auto-detected dietary/house tags.
 */
function renderMenuItemMeta(item, index) {
  const numText = item.number || String(index + 1).padStart(2, '0');
  const rawBlob = `${item.name || ''} ${item.desc || ''} ${(item.tags || []).join(' ')}`.toLowerCase();

  let badgeHtml = '';
  if (/house favorite|signature|classic|pi society/.test(rawBlob)) {
    badgeHtml = '<span class="menu-badge menu-badge--house">House Favorite</span>';
  } else if (/spicy|hot honey|chili|arrabbiata|jalapeno|pepperoncini/.test(rawBlob)) {
    badgeHtml = '<span class="menu-badge menu-badge--spicy">Kick of Heat</span>';
  } else if (/veggie|vegetarian|margherita|caprese|four-cheese|cheese/.test(rawBlob) && !/pepperoni|sausage|bacon|chicken|meatball|ham|prosciutto|anchovy/.test(rawBlob)) {
    badgeHtml = '<span class="menu-badge menu-badge--veg">Vegetarian</span>';
  }

  return `
    <div class="menu-item-meta">
      <span class="menu-number">#${numText}</span>
      ${badgeHtml}
    </div>
  `;
}
