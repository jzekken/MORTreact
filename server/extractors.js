const mammoth = require('mammoth');
const pptx2json = require('pptx2json');
const Tesseract = require('tesseract.js');

// DOCX extraction
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// PPTX extraction using pptx2json
function extractPptxText(buffer) {
  const result = pptx2json(buffer);
  const text = result.map(slide => slide.text).join('\n\n');
  return text;
}

// IMAGE OCR extraction
async function extractImageText(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  return text;
}

module.exports = { extractDocxText, extractPptxText, extractImageText };
