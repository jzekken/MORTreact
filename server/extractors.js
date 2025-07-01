const mammoth = require('mammoth');
const pptxParser = require('pptx-parser');
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
    const result = await pptxParser.parsePptx(tempFilePath);
    const text = result
      .map(slide => slide.texts.map(t => t.text).join(' '))
      .join('\n\n');
    return text;
  } catch (err) {
    console.error('pptx-parser error:', err);
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
