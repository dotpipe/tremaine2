export function buildRaidCounts(totalDepths = 666, totalRaids = 3000) {
  const counts = Array.from({ length: totalDepths }, (_, i) => {
    const depth = i + 1;
    if (depth <= 100) return 3;
    if (depth <= 300) return 6;
    if (depth <= 500) return 4;
    return 3;
  });

  let currentTotal = counts.reduce((a, b) => a + b, 0);
  let extra = totalRaids - currentTotal;

  if (extra > 0) {
    // Prefer deeper/more complex depths for extra raids, but keep deterministic.
    const order = counts
      .map((count, idx) => ({
        idx,
        base: count,
        score: (idx + 1) <= 300 ? 2 : (idx + 1) <= 500 ? 1 : 0
      }))
      .sort((a, b) => {
        if (b.base !== a.base) return b.base - a.base;
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
      });

    let cursor = 0;
    while (extra > 0) {
      const target = order[cursor % order.length];
      counts[target.idx] += 1;
      extra -= 1;
      cursor += 1;
    }
  } else if (extra < 0) {
    // Remove from the least dense depths first.
    const order = counts
      .map((count, idx) => ({ idx, count }))
      .sort((a, b) => a.count - b.count || b.idx - a.idx);

    let cursor = 0;
    while (extra < 0) {
      const target = order[cursor % order.length];
      if (counts[target.idx] > 1) {
        counts[target.idx] -= 1;
        extra += 1;
      }
      cursor += 1;
    }
  }

  return counts;
}

export function buildRaidLedger(depth, count) {
  const objectives = ["Clear", "Recover", "Escort", "Survey", "Destroy", "Survive"];
  const entries = [];
  for (let i = 0; i < count; i++) {
    const roomBudget = Math.min(100, 20 + Math.floor(depth / 10) + ((i * 7) % 8) * 5);
    entries.push({
      id: `D${depth}-R${i + 1}`,
      depth,
      index: i + 1,
      objective: objectives[(depth + i) % objectives.length],
      roomBudget,
      completed: false,
      rewardGold: Math.min(1000, 100 + Math.floor(depth / 3) + (i % 5) * 35)
    });
  }
  return entries;
}
