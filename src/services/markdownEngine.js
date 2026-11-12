// markdownEngine.js
// Peachtree Corners Loan & Pawn — Inventory Aging & Automatic Markdown System
// All calculations are deterministic and purely functional (no side effects).
// The AppContext calls these functions and persists results via dbService.

export const DEFAULT_MARKDOWN_TIERS = [
  { id: 'tier-0', daysFrom: 0,  daysTo: 14,  discountPercent: 0,  label: '0–14 days' },
  { id: 'tier-1', daysFrom: 15, daysTo: 30,  discountPercent: 5,  label: '15–30 days' },
  { id: 'tier-2', daysFrom: 31, daysTo: 45,  discountPercent: 10, label: '31–45 days' },
  { id: 'tier-3', daysFrom: 46, daysTo: 60,  discountPercent: 15, label: '46–60 days' },
  { id: 'tier-4', daysFrom: 61, daysTo: 90,  discountPercent: 20, label: '61–90 days' },
  { id: 'tier-5', daysFrom: 91, daysTo: 9999, discountPercent: 25, label: '91+ days' },
];

/**
 * Returns the number of whole days since the item arrived in inventory.
 * Always >= 0.
 * @param {string} inventoryArrivalDate — ISO date/datetime string
 * @returns {number}
 */
export function getDaysInInventory(inventoryArrivalDate) {
  if (!inventoryArrivalDate) return 0;
  const arrival = new Date(inventoryArrivalDate);
  if (isNaN(arrival.getTime())) return 0;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((now - arrival) / msPerDay);
  return Math.max(0, days);
}

/**
 * Returns the matching tier object for the given age in days.
 * Falls back to the last tier if none matches (shouldn't happen with well-formed tiers).
 * @param {number} daysInInventory
 * @param {Array} tiers — array of tier objects
 * @returns {Object} tier
 */
export function getCurrentTier(daysInInventory, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return DEFAULT_MARKDOWN_TIERS[0];
  }
  for (const tier of tiers) {
    if (daysInInventory >= tier.daysFrom && daysInInventory <= tier.daysTo) {
      return tier;
    }
  }
  // If beyond all defined tiers, return the last one
  return tiers[tiers.length - 1];
}

/**
 * Calculates the markdown price for a product.
 * Always uses the original price (non-compounding).
 * Never goes below minimumPrice (if set).
 * @param {number} originalApprovedPrice
 * @param {number} discountPercent — 0–100
 * @param {number|null} minimumPrice — floor, or null for no floor
 * @returns {number} price rounded to 2 decimal places
 */
export function calculateMarkdownPrice(originalApprovedPrice, discountPercent, minimumPrice) {
  if (!originalApprovedPrice || originalApprovedPrice <= 0) return 0;
  const discount = Math.max(0, Math.min(100, discountPercent || 0));
  const rawPrice = originalApprovedPrice * (1 - discount / 100);
  const floored = minimumPrice != null ? Math.max(rawPrice, minimumPrice) : rawPrice;
  return Math.round(floored * 100) / 100;
}

/**
 * Returns the ISO date string when the item will hit the next markdown tier,
 * or null if already at the maximum tier.
 * @param {string} inventoryArrivalDate
 * @param {number} currentTierIndex — index of the current tier in the tiers array
 * @param {Array} tiers
 * @returns {string|null} ISO date string or null
 */
export function getNextMarkdownDate(inventoryArrivalDate, currentTierIndex, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const nextTierIndex = currentTierIndex + 1;
  if (nextTierIndex >= tiers.length) return null;

  const nextTier = tiers[nextTierIndex];
  if (!nextTier) return null;

  const arrival = new Date(inventoryArrivalDate);
  if (isNaN(arrival.getTime())) return null;

  const nextTierDate = new Date(arrival.getTime() + nextTier.daysFrom * 24 * 60 * 60 * 1000);
  return nextTierDate.toISOString();
}

/**
 * Returns a full aging/markdown report for a single product.
 * @param {Object} product
 * @param {Object} markdownSettings
 * @returns {Object}
 */
export function getItemAgingReport(product, markdownSettings) {
  const tiers = markdownSettings?.tiers ?? DEFAULT_MARKDOWN_TIERS;
  const excludedProductIds = markdownSettings?.excludedProductIds ?? [];
  const excludedCategories = markdownSettings?.excludedCategories ?? [];

  // Determine effective tiers (category overrides)
  const categoryOverrides = markdownSettings?.categoryOverrides ?? {};
  const effectiveTiers = (product.category && categoryOverrides[product.category]?.tiers)
    ? categoryOverrides[product.category].tiers
    : tiers;

  const isExcluded =
    excludedProductIds.includes(product.id) ||
    excludedCategories.includes(product.category) ||
    product.markdownPaused === true;

  const daysInInventory = getDaysInInventory(product.inventoryArrivalDate || product.dateAdded);
  const currentTier = getCurrentTier(daysInInventory, effectiveTiers);
  const currentTierIndex = effectiveTiers.findIndex(t => t.id === currentTier.id);

  const originalPrice = product.originalApprovedPrice ?? product.price ?? 0;
  const minimumPrice = product.minimumPrice ?? null;
  const discountPercent = isExcluded ? 0 : currentTier.discountPercent;
  const currentPrice = calculateMarkdownPrice(originalPrice, discountPercent, minimumPrice);

  const nextTierDate = getNextMarkdownDate(
    product.inventoryArrivalDate || product.dateAdded,
    currentTierIndex,
    effectiveTiers
  );

  const isAtMaxTier = currentTierIndex >= effectiveTiers.length - 1;
  const nextTier = !isAtMaxTier ? effectiveTiers[currentTierIndex + 1] : null;
  const nextDiscountPercent = nextTier ? nextTier.discountPercent : currentTier.discountPercent;

  // Item is at minimum if minimumPrice is set and currentPrice would be at/below floor
  const wouldGoBelow = minimumPrice != null &&
    (originalPrice * (1 - currentTier.discountPercent / 100)) <= minimumPrice;

  return {
    daysInInventory,
    currentTier,
    discountPercent,
    currentPrice,
    originalPrice,
    nextTierDate,
    nextDiscountPercent,
    isAtMaxDiscount: isAtMaxTier || wouldGoBelow,
    isExcluded,
    minimumPrice,
  };
}

/**
 * Runs the full markdown engine over all products.
 * Returns change descriptors for products that need a price update.
 * Only processes available/reserved, non-excluded, non-paused products.
 * @param {Array} products
 * @param {Object} markdownSettings
 * @returns {Array<{productId, previousPrice, newPrice, discountPercent, tier, reason, changed}>}
 */
export function runMarkdownEngine(products, markdownSettings) {
  if (!markdownSettings?.enabled) return [];
  if (!Array.isArray(products)) return [];

  const tiers = markdownSettings?.tiers ?? DEFAULT_MARKDOWN_TIERS;
  const excludedProductIds = markdownSettings?.excludedProductIds ?? [];
  const excludedCategories = markdownSettings?.excludedCategories ?? [];
  const categoryOverrides = markdownSettings?.categoryOverrides ?? {};

  const results = [];

  for (const product of products) {
    // Skip non-active statuses
    if (!['available', 'reserved'].includes(product.status)) continue;

    // Skip excluded
    if (excludedProductIds.includes(product.id)) continue;
    if (excludedCategories.includes(product.category)) continue;
    if (product.markdownPaused === true) continue;

    // Determine effective tiers
    const effectiveTiers = (product.category && categoryOverrides[product.category]?.tiers)
      ? categoryOverrides[product.category].tiers
      : tiers;

    const daysInInventory = getDaysInInventory(product.inventoryArrivalDate || product.dateAdded);
    const currentTier = getCurrentTier(daysInInventory, effectiveTiers);
    const originalPrice = product.originalApprovedPrice ?? product.price ?? 0;
    const minimumPrice = product.minimumPrice ?? null;
    const newPrice = calculateMarkdownPrice(originalPrice, currentTier.discountPercent, minimumPrice);
    const previousPrice = product.price ?? originalPrice;

    // Skip if already at minimum price
    if (minimumPrice != null && previousPrice <= minimumPrice) continue;

    const changed = Math.abs(newPrice - previousPrice) >= 0.01;

    results.push({
      productId: product.id,
      previousPrice,
      newPrice,
      discountPercent: currentTier.discountPercent,
      tier: currentTier.id,
      reason: `Aging markdown — ${currentTier.label} (${daysInInventory} days in inventory)`,
      changed,
    });
  }

  return results;
}

/**
 * Returns aggregate aging statistics across all inventory.
 * @param {Array} products
 * @param {Object} markdownSettings
 * @returns {Object}
 */
export function getInventoryAgingStats(products, markdownSettings) {
  const tiers = markdownSettings?.tiers ?? DEFAULT_MARKDOWN_TIERS;
  const categoryOverrides = markdownSettings?.categoryOverrides ?? {};

  // Build byTier map
  const byTierMap = {};
  for (const tier of tiers) {
    byTierMap[tier.id] = { ...tier, count: 0 };
  }

  let totalOriginalValue = 0;
  let totalCurrentValue = 0;
  let totalMarkdownAmount = 0;
  let itemsAtMaxDiscount = 0;
  let itemsDiscounted = 0;
  let totalItems = 0;

  // approachingMarkdown: items within 7 days of the next tier boundary
  // We'll collect per-next-tier data
  const approachingMap = {};

  for (const product of products) {
    if (!['available', 'reserved'].includes(product.status)) continue;
    totalItems++;

    const effectiveTiers = (product.category && categoryOverrides[product.category]?.tiers)
      ? categoryOverrides[product.category].tiers
      : tiers;

    const daysInInventory = getDaysInInventory(product.inventoryArrivalDate || product.dateAdded);
    const currentTier = getCurrentTier(daysInInventory, effectiveTiers);
    const currentTierIndex = effectiveTiers.findIndex(t => t.id === currentTier.id);

    const originalPrice = product.originalApprovedPrice ?? product.price ?? 0;
    const minimumPrice = product.minimumPrice ?? null;
    const currentPrice = calculateMarkdownPrice(originalPrice, currentTier.discountPercent, minimumPrice);

    totalOriginalValue += originalPrice;
    totalCurrentValue += currentPrice;
    totalMarkdownAmount += (originalPrice - currentPrice);

    if (currentTier.discountPercent > 0) itemsDiscounted++;

    const isAtMaxTier = currentTierIndex >= effectiveTiers.length - 1;
    if (isAtMaxTier) itemsAtMaxDiscount++;

    // Count by tier — use current tier's id, mapping to base tiers for display
    if (byTierMap[currentTier.id]) {
      byTierMap[currentTier.id].count++;
    } else {
      // If tier id doesn't match (e.g. category override), try to find best base tier
      const baseTier = tiers.find(t => t.id === currentTier.id);
      if (baseTier && byTierMap[baseTier.id]) {
        byTierMap[baseTier.id].count++;
      }
    }

    // Approaching next tier — items within 7 days of crossing into a new tier
    if (!isAtMaxTier) {
      const nextTier = effectiveTiers[currentTierIndex + 1];
      const daysUntilNext = nextTier.daysFrom - daysInInventory;
      if (daysUntilNext > 0 && daysUntilNext <= 7) {
        const key = nextTier.id;
        if (!approachingMap[key]) {
          approachingMap[key] = { tier: nextTier, daysUntil: daysUntilNext, count: 0, productIds: [] };
        }
        // Track the minimum daysUntil for this tier bucket
        if (daysUntilNext < approachingMap[key].daysUntil) {
          approachingMap[key].daysUntil = daysUntilNext;
        }
        approachingMap[key].count++;
        approachingMap[key].productIds.push(product.id);
      }
    }
  }

  const byTier = Object.values(byTierMap);
  const approachingMarkdown = Object.values(approachingMap).sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    totalItems,
    byTier,
    approachingMarkdown,
    totalOriginalValue: Math.round(totalOriginalValue * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalMarkdownAmount: Math.round(totalMarkdownAmount * 100) / 100,
    itemsAtMaxDiscount,
    itemsDiscounted,
  };
}
