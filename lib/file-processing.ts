import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(
  base64Content: string,
  mimeType: string
): Promise<string> {
  // Remove data URL prefix if present using substring to avoid regex stack overflow
  const commaIndex = base64Content.indexOf(',');
  const base64Data = commaIndex !== -1 ? base64Content.substring(commaIndex + 1) : base64Content;
  const buffer = Buffer.from(base64Data, 'base64');
  const uint8Array = new Uint8Array(buffer);

  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = new PDFParse(uint8Array);
      const data = await pdfParse.getText();
      return data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/csv' ||
      mimeType === 'application/csv'
    ) {
      return buffer.toString('utf-8');
    } else {
      console.warn(`Unsupported file type for text extraction: ${mimeType}`);
      return '';
    }
  } catch (error) {
    console.error(`Error extracting text from file (${mimeType}):`, error);
    return '';
  }
}
