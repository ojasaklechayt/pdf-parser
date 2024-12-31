const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const documentRoutes = require('./routes/documentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/documents', documentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});