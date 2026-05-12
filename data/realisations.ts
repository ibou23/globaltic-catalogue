export interface Realisation {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  client?: string;
}

export const realisations: Realisation[] = [
  {
    id: "1",
    title: "Branding Véhicule - Flotte Entreprise",
    category: "Signalétique",
    imageUrl: "/images/products/1772099158416-Branding-vehicule1.webp",
    client: "Logistique Express"
  },
  {
    id: "2",
    title: "Packaging Cosmétique Luxe",
    category: "Packaging",
    imageUrl: "/images/products/75cef07fffe16039fb462f9f837b07f6.jpg",
    client: "Awa Beauty"
  },
  {
    id: "3",
    title: "Flyers Événementiels - Vernissage",
    category: "Edition",
    imageUrl: "/images/products/Screenshot_20260417_230627_WhatsAppBusiness.jpg",
    client: "Galerie Dakar"
  },
  {
    id: "4",
    title: "Polos Brodés - Uniformes Staff",
    category: "Textile",
    imageUrl: "/images/products/Polo DTF.webp",
    client: "Hôtel Terrou-Bi"
  },
  {
    id: "5",
    title: "Dépliants Publicitaires 3 Volets",
    category: "Edition",
    imageUrl: "/images/products/Depliants.webp",
    client: "Banque de l'Habitat"
  },
  {
    id: "6",
    title: "Kakemono Salon Professionnel",
    category: "Signalétique",
    imageUrl: "/images/products/Screenshot_20260417_230325_WhatsAppBusiness.jpg",
    client: "Global Tech Expo"
  },
  {
    id: "7",
    title: "Packaging Food - Box Burger",
    category: "Packaging",
    imageUrl: "/images/products/7a799d4e77e11ab862e343e9cfb8b874.jpg",
    client: "Dakar Burger"
  },
  {
    id: "8",
    title: "Badges & Cordons Personnalisés",
    category: "Textile",
    imageUrl: "/images/products/Cordon-badge2.webp",
    client: "Sommet Afrique"
  },
  {
    id: "9",
    title: "Etiquettes Vinyle Découpées",
    category: "Numérique",
    imageUrl: "/images/products/490022937_1220771286719108_4240592187363009521_n.jpg",
    client: "Artisan Savonnier"
  },
  {
    id: "10",
    title: "Bâche Grand Format - Façade",
    category: "Signalétique",
    imageUrl: "/images/products/Screenshot_20260415_145219_WhatsAppBusiness.jpg",
    client: "Immobilier Plus"
  },
  {
    id: "11",
    title: "Sacs Kraft Personnalisés",
    category: "Packaging",
    imageUrl: "/images/products/dfdb8e6777b3a2468a415e84508d1470.jpg",
    client: "Boutique Chic"
  },
  {
    id: "12",
    title: "T-shirts Impression DTF",
    category: "Textile",
    imageUrl: "/images/products/Screenshot_20260415_145335_WhatsAppBusiness.jpg",
    client: "Club de Sport"
  }
];

export const realisationCategories = [
  "Tous",
  "Textile",
  "Signalétique",
  "Packaging",
  "Edition",
  "Numérique"
];
