const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\azer\\Desktop\\GTG\\CATALOGUE Global TIC\\CATALOGUE Global TIC 2026.pdf';
const buf = fs.readFileSync(pdfPath);

pdf(buf).then(function(data) {
  console.log('Pages:', data.numpages);
  console.log('---TEXT START---');
  console.log(data.text);
  console.log('---TEXT END---');
}).catch(function(err) {
  console.error(err);
});
