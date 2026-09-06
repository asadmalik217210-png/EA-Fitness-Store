function createOrderNumber() {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EA-${now}-${rand}`;
}

module.exports = { createOrderNumber };
