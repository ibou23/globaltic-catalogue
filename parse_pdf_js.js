const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const pdfPath = 'C:\\Users\\azer\\Desktop\\GTG\\CATALOGUE Global TIC\\CATALOGUE Global TIC 2026.pdf';

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdf = await pdfjsLib.getDocument(dataBuffer).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `--- PAGE ${i} ---\n${pageText}\n\n`;
    }
    
    fs.writeFileSync('pdf_output.txt', fullText);
    console.log("Extraction complete!");
  } catch (e) {
    console.error("Error reading PDF:", e);
  }
}

extractText();
