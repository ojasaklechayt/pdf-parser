const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse')
const Tesseract = require('tesseract.js');

// Method for uploading documents
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { path, originalname } = req.file;
        const document = new Document({
            name: originalname,
            path: path,
        });

        await document.save();

        res.status(201).json({ message: 'Document uploaded and processed successfully', document });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

// Method for fetching all documents
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().select('name createdAt');
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
};

// Method for fetching a specific document
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.path)) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const pdfBuffer = fs.readFileSync(document.path);
        const pdfData = await pdfParse(pdfBuffer);
        const pageCount = pdfData.numpages;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(document.path)}"`);
        res.setHeader('X-Page-Count', pageCount);

        const pdfStream = fs.createReadStream(document.path);
        pdfStream.on('error', (error) => {
            console.error('Stream error:', error);
            res.status(500).end();
        });
        pdfStream.pipe(res);

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Error fetching document' });
    }
};

// Method for searching documents
exports.searchDocuments = async (req, res) => {
    try {
        const { query, matchType, documentId } = req.query;

        if (!query || !documentId) {
            return res.status(400).json({
                message: 'Search query and document ID are required'
            });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        const dataBuffer = fs.readFileSync(document.path);
        const pdfData = await pdfParse(dataBuffer);

        const results = [];

        // Split the content by pages and process each
        const pages = pdfData.text.split(/\f/); // Split by page separator
        pages.forEach((pageText, pageIndex) => {
            const regex = new RegExp(query, matchType === 'exact' ? 'g' : 'gi');
            let match;
            while ((match = regex.exec(pageText)) !== null) {
                const startIdx = match.index;
                const snippet = pageText.slice(Math.max(0, startIdx - 20), startIdx + 20);

                results.push({
                    id: documentId,
                    name: document.name,
                    snippet,
                    pageNumber: pageIndex + 1,
                    position: {
                        x: (startIdx % 80) * 10, // Approximate X position
                        y: Math.floor(startIdx / 80) * 15 // Approximate Y position
                    }
                });
            }
        });

        res.json(results);
    } catch (error) {
        console.error('Error searching document:', error);
        res.status(500).json({ message: 'Error searching document' });
    }
};

// Helper function for finding relevant snippet
function findSnippet(text, query) {
    const words = text.split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    let bestIndex = -1;
    let mostMatches = 0;

    words.forEach((word, index) => {
        let matches = 0;
        queryWords.forEach(queryWord => {
            if (word.toLowerCase().includes(queryWord)) {
                matches++;
            }
        });
        if (matches > mostMatches) {
            mostMatches = matches;
            bestIndex = index;
        }
    });

    if (bestIndex === -1) return '';

    const start = Math.max(0, bestIndex - 10);
    const end = Math.min(words.length, bestIndex + 11);
    return words.slice(start, end).join(' ') + (end < words.length ? '...' : '');
}


async function extractPageText(filePath, pageNum) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer, { max: pageNum });
        const pageText = data.text;

        if (!pageText.trim()) {
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
                logger: m => console.log(m),
                pageSegMode: 'single_block',
                pagesegmode: 1,
                tessedit_page_number: pageNum
            });
            return text;
        }

        return pageText;
    } catch (error) {
        console.error(`Error extracting text from page ${pageNum}: `, error);
        return '';
    }
}