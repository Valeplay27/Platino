let lastViewedProductId = null;

export function setLastViewedProduct(productId) {
  lastViewedProductId = productId;
}

export function getLastViewedProduct() {
  return lastViewedProductId;
}
