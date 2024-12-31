const Tesseract = require('tesseract.js');

exports.performOCR = async (filePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        return text;
    } catch (error) {
        console.error('Error performing OCR:', error);
        throw error;
    }
};