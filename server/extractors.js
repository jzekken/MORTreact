const mammoth = require('mammoth');
const pptx2json = require('pptx2json');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// DOCX extraction
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// PPTX extraction (temp file workaround)
async function extractPptxText(buffer) {
  const tempFilePath = path.join(__dirname, 'temp-upload.pptx');
  fs.writeFileSync(tempFilePath, buffer);

  try {
    const slides = await pptx2json(tempFilePath); // ✅ await here
    const text = slides.map(slide => slide.text).join('\n\n');
    return text;
  } catch (err) {
    console.error('pptx2json error:', err);
    throw new Error('Failed to parse PPTX');
  } finally {
    fs.unlinkSync(tempFilePath);
  }
}


// IMAGE OCR
async function extractImageText(buffer) {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng');
  return text;
}

module.exports = { extractDocxText, extractPptxText, extractImageText };
