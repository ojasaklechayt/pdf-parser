const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');

const {
    uploadDocument,
    getAllDocuments,
    getDocument,
    searchDocuments
} = documentController;

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getAllDocuments);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);

module.exports = router;