export interface ReportPeriod {
  from: string; // YYYY-MM-DD
  to: string;
}

export interface TopClient {
  customerId: string;
  name: string;
  company: string | null;
  ordersCount: number;
  totalCA: number;
  totalPaid: number;
}

export interface ReportOrderRow {
  id: string;
  reference: string;
  customer: string | null;
  total: number;
  paidAmount: number;
  status: string;
  createdAt: string;
  closureStatus: string;
  satisfaction: string | null;
  complaint: string | null;
}

export interface ReportData {
  period: ReportPeriod;
  generatedAt: string;

  // Devis
  quotesCreated: number;
  quotesAccepted: number;
  quotesRefused: number;
  quotesCA: number;
  tauxAcceptation: number; // %

  // Commandes
  ordersCreated: number;
  ordersCA: number;
  ordersEncaisse: number;
  ordersSolde: number;
  ordersLivrees: number;
  ordersEnCours: number;
  ordersAnnulees: number;
  ordersReclamations: number;

  // Satisfaction
  satisfaitCount: number;
  neutreCount: number;
  insatisfaitCount: number;

  // Factures
  facturesEmises: number;
  facturesPayees: number;

  // Détails
  topClients: TopClient[];
  topOrders: ReportOrderRow[];
  impayesOrders: ReportOrderRow[];
  reclamations: ReportOrderRow[];
}
