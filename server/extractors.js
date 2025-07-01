const mammoth = require('mammoth');
const unzipper = require('unzipper');
const xml2js = require('xml2js');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// DOCX extraction
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// PPTX extraction (unzipper + xml2js method)
async function extractPptxText(buffer) {
  const slidesText = [];

  const directory = await unzipper.Open.buffer(buffer);
  const slideFiles = directory.files.filter(file =>
    file.path.startsWith('ppt/slides/slide') && file.path.endsWith('.xml')
  );

  for (const file of slideFiles) {
    const content = await file.buffer();
    const result = await xml2js.parseStringPromise(content);
    const texts = [];

    const shapes = result['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'] || [];
    for (const shape of shapes) {
      const paragraphs = shape['p:txBody']?.[0]['a:p'] || [];
      for (const p of paragraphs) {
        const runs = p['a:r'] || [];
        for (const r of runs) {
          const text = r['a:t']?.[0];
          if (text) texts.push(text);
        }
      }
    }

    slidesText.push(texts.join(' '));
  }

  return slidesText.join('\n\n');
}

// IMAGE OCR extraction
async function extractImageText(buffer) {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng');
  return text;
}

module.exports = {
  extractDocxText,
  extractPptxText,
  extractImageText,
};
