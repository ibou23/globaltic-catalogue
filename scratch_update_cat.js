const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'categories.ts');
let content = fs.readFileSync(filePath, 'utf8');

const imageMap = {
  "cat-papeterie": "/images/products/Depliant-3-volets.jpg",
  "cat-num": "/images/products/CARTES-DE-VISITE_APESS.jpg",
  "cat-grand-format": "/images/products/1772099014278-Branding-vehicule.webp",
  "cat-signaletique": "/images/products/KAKEMONO-ou-DEROULEUR_APESS.jpg",
  "cat-packaging": "/images/products/chemises à rabat.jpg",
  "cat-textile": "/images/products/Polo.webp"
};

for (const [id, imageUrl] of Object.entries(imageMap)) {
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?imageUrl:\\s*").*?(")`, 'm');
  content = content.replace(regex, `$1${imageUrl}$2`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated categories.ts");
