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

        if (!query) {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        if(!documentId){
            return res.status(400).json({
                message: 'Document Id not found'
            });
        }

        const docu = await Document.findById(documentId);
        console.log(docu);
        
        const filepath = docu.path;

        let pageTexts = []

        const dataBuffer = fs.readFileSync(filepath)
        const pdfData = await pdfParse(dataBuffer)

        for(let i = 1; i <= pdfData.numpages; i++){
            const pageText = await extractPageText(filepath, i);
            pageTexts.push({ page: i, text: pageText });
        }

        const results = pageTexts.filter(page => {
            if(matchType === 'exact'){
                return page.text.toLowerCase().includes(query.toLowerCase());
            } else {
                const regex = new RegExp(query, 'i');
                return regex.test(page.text);
            }
        }).map(page => {
            const snippet = findSnippet(page.text, query);
            return {
                id: docu._id,
                name: docu.name,
                pageNumber: page.page,
                snippet: snippet || page.text.substring(0, 200) + '...',
                relevance: 1
            };
        })

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


async function extractPageText(filePath, pageNum) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer, {max: pageNum});
        const pageText = data.text;

        if(!pageText.trim()){
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