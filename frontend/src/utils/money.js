export function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

export function displayPrice(product) {
  const sale = product.salePrice && product.salePrice < product.price;
  return { current: sale ? product.salePrice : product.price, original: sale ? product.price : null };
}
