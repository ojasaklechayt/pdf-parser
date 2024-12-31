// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create text index on content
DocumentSchema.index({
    content: 'text'
}, {
    weights: {
        content: 1
    },
    name: "ContentTextIndex"
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;