"use client";

import { useEffect, useRef } from "react";
import { getProductsPricingAction } from "@/lib/actions/products";
import { setProductsCache, type CatalogProduct } from "@/lib/utils/product-price-resolver";

export function useProductPricing() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    getProductsPricingAction().then((result) => {
      if (result.data) {
        const mapped: CatalogProduct[] = result.data.map((p) => ({
          slug: p.slug,
          name: p.name,
          quantityTiers: p.quantityTiers,
        }));
        setProductsCache(mapped);
      }
    });
  }, []);
}
