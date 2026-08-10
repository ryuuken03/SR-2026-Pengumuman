import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;

const pdfPath = './src/assets/selkom/pengumuman_selkom.pdf';
const buffer = fs.readFileSync(pdfPath);

let pageTexts = [];

const options = {
  pagerender: function(pageData) {
    return pageData.getTextContent().then(function(textContent) {
      let text = '';
      let lastY = null;
      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
          text += '\n';
        }
        text += item.str;
        lastY = item.transform[5];
      }
      pageTexts.push(text);
      return text;
    });
  }
};

const data = await pdfParse(buffer, options);

console.log('Total pages:', data.numpages);
console.log('Captured pages:', pageTexts.length);
console.log('\n=== PAGE 5 ===\n');
if (pageTexts[4]) {
  console.log(pageTexts[4]);
} else {
  console.log('Page 5 not captured. Showing all raw text:');
  console.log(data.text);
}
