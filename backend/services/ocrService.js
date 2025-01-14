const Tesseract = require('tesseract.js');

exports.performOCR = async (filePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        console.log(text.trim(100));
        return text;
    } catch (error) {
        console.error('Error performing OCR:', error);
        throw error;
    }
};