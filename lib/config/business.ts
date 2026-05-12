export const businessConfig = {
  urgentSurchargePercent: 30,
  quoteValidityDays: 15,
  defaultTurnaroundDays: 3,
  minOrderAmount: 5000,
  deliveryZones: {
    retrait: { label: "Retrait en boutique", fee: 0 },
    livraison_dakar: { label: "Livraison Dakar", fee: 2000 },
    livraison_region: { label: "Livraison Région", fee: 5000 },
  },
  loyaltyThresholds: {
    regulier: { minOrders: 3, minSpent: 50000 },
    vip: { minOrders: 10, minSpent: 200000 },
    premium: { minOrders: 25, minSpent: 500000 },
  },
  paymentMethods: [
    { id: "wave", label: "Wave", isActive: true },
    { id: "orange_money", label: "Orange Money", isActive: true },
    { id: "especes", label: "Espèces", isActive: true },
    { id: "virement", label: "Virement bancaire", isActive: true },
    { id: "cheque", label: "Chèque", isActive: false },
  ],
} as const;
