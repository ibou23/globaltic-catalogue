const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'products.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The mapping of product ID to new image URL
const imageMap = {
  "prod-cv-recto": "/images/products/CARTES-DE-VISITE_APESS.jpg",
  "prod-cv-recto-verso": "/images/products/Carte-de-visite-avec-du-vernis-sélectif-UV.webp",
  "prod-flyer-a5-recto": "/images/products/pRODUITS INFOGRAPHIE.jpg",
  "prod-flyer-a5-rv": "/images/products/pRODUITS INFOGRAPHIE.jpg",
  "prod-depliant-a4": "/images/products/Depliant-3-volets.jpg",
  "prod-depliant-a3": "/images/products/Dépliant-Format-3-volets-roulés.webp",
  "prod-en-tete": "/images/products/Enveloppe-A5-14,85-x-21cm.webp",
  "prod-bloc-notes": "/images/products/Note-Bloc-S01-scaled.jpg",
  "prod-calendrier-simple": "/images/products/calendrier chevalet.jpg",
  "prod-calendrier-spirale": "/images/products/Agenda003-scaled.jpg",
  "prod-vinyle": "/images/products/1772099014278-Branding-vehicule.webp",
  "prod-bache": "/images/products/1772099158416-Branding-vehicule1.webp",
  "prod-one-way": "/images/products/1772099014278-Branding-vehicule.webp",
  "prod-etiquettes": "/images/products/pRODUITS INFOGRAPHIE.jpg",
  "prod-kakemono": "/images/products/KAKEMONO-ou-DEROULEUR_APESS.jpg",
  "prod-tshirt": "/images/products/Textiles.webp",
  "prod-polo": "/images/products/Polo.webp",
  "prod-gilet-simple": "/images/products/gilet.webp",
  "prod-gilet-vip": "/images/products/Gilet VIP.jpg",
  "prod-casquette-dtf": "/images/products/Casquette.webp",
  "prod-casquette-broderie": "/images/products/Casquette.webp",
  "prod-tote-bag": "/images/products/Tote BAG.png"
};

// Simple regex replace for each object based on id
for (const [id, imageUrl] of Object.entries(imageMap)) {
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?imageUrls:\\s*\\[).*?(\\])`, 'm');
  content = content.replace(regex, `$1"${imageUrl}"$2`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated products.ts");
