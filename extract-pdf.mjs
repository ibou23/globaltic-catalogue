import fs from 'fs';
import path from 'path';

const pdfPath = 'C:\\Users\\azer\\Desktop\\GTG\\CATALOGUE Global TIC\\CATALOGUE Global TIC 2026.pdf';

async function extractPDF() {
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
  const buf = fs.readFileSync(pdfPath);
  const data = await pdfParse(buf);
  console.log('Pages:', data.numpages);
  console.log('---TEXT START---');
  console.log(data.text);
  console.log('---TEXT END---');
}

extractPDF().catch(console.error);
