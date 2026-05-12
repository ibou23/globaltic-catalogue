const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\azer\\Desktop\\GTG\\CATALOGUE Global TIC\\CATALOGUE Global TIC 2026.pdf';

if (fs.existsSync(pdfPath)) {
  let dataBuffer = fs.readFileSync(pdfPath);
  pdf(dataBuffer).then(function(data) {
      fs.writeFileSync('pdf_output_utf8.txt', data.text, 'utf8');
      console.log("Extracted to pdf_output_utf8.txt");
  }).catch(function(err) {
      console.error("Error parsing PDF:", err);
  });
} else {
  console.log("File not found:", pdfPath);
}
