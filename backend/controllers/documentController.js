const Document = require('../models/Document');
const pdfService = require('../services/pdfService');
const ocrService = require('../services/ocrService');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse')

// Method for uploading documents
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { path, originalname } = req.file;
        let content = await pdfService.extractTextFromPDF(path);

        if (!content.trim()) {
            content = await ocrService.performOCR(path);
            console.log('Teserract Parser: ', content.trim(0, 100));
        }

        const document = new Document({
            name: originalname,
            path: path,
            content: content
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
        const { query, matchType } = req.query;

        if (!query) {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        let searchCriteria = {};
        let searchOptions = {};

        if (matchType === 'exact') {
            // For exact match, wrap the query in quotes
            searchCriteria = {
                $text: {
                    $search: `"${query}"`,
                    $caseSensitive: false
                }
            };
            searchOptions.score = { $meta: 'textScore' };
        } else {
            // For fuzzy match, use regex
            const searchRegex = new RegExp(query, 'i');
            searchCriteria = { content: searchRegex };
        }

        const documents = await Document.find(
            searchCriteria,
            searchOptions
        ).limit(20);

        const results = documents.map(doc => {
            const snippet = findSnippet(doc.content, query);

            return {
                id: doc._id,
                name: doc.name,
                snippet: snippet || doc.content.substring(0, 200) + '...',
                relevance: doc._score ? doc._score : 1
            };
        });

        results.sort((a, b) => b.relevance - a.relevance);

        res.json(results);
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).json({
            message: 'Error searching documents',
            error: error.message
        });
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