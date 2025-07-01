const mammoth = require('mammoth');
const pptxParser = require('pptx-parser');
const Tesseract = require('tesseract.js');

// DOCX extraction
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// PPTX extraction
function extractPptxText(buffer) {
  return new Promise((resolve, reject) => {
    pptxParser(buffer, (err, data) => {
      if (err) return reject(err);
      const text = data.map(slide => slide.text).join('\n\n');
      resolve(text);
    });
  });
}

// IMAGE OCR extraction
async function extractImageText(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  return text;
}

module.exports = { extractDocxText, extractPptxText, extractImageText };
