# PDF Parser

## Overview
PDF Parser is a Next.js-based application designed to upload, parse, and search PDF documents using OCR (Optical Character Recognition) technology. The application allows users to upload PDF files, extract text content, and perform both exact and fuzzy searches across the uploaded documents.

## Features
- **Document Upload**: Upload PDF files for processing.
- **Text Extraction**: Extract text from PDFs using OCR.
- **Document Search**: Search through uploaded documents with exact or fuzzy matching.
- **Document Viewer**: View the content of uploaded documents with highlighted search terms.
- **Document List**: View a list of all uploaded documents with options to download or select for viewing.

## Technologies Used
- **Frontend**: Next.js, TailwindCSS, React
- **Backend**: Express.js, MongoDB
- **OCR**: Tesseract.js
- **PDF Parsing**: pdf-parse

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/pdf-parser.git
    cd pdf-parser
    ```

2. Install dependencies:

    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install
    ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory:

     ```env
     MONGODB_URI=mongodb://localhost:27017/pdf-parser
     PORT=5000
     ```

   - Create a `.env.local` file in the frontend directory:

     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     ```

4. Start the development server:

    - In the backend directory:

      ```bash
      npm start
      ```

    - In the frontend directory:

      ```bash
      npm run dev
      ```

5. Open the application:
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Uploading a Document
1. Click on the "Upload PDF" section.
2. Drag and drop a PDF file or click to select one.
3. The document will be processed, and the text will be extracted.

### Searching Documents
1. Enter a search term in the search bar.
2. Select the match type (Exact or Fuzzy).
3. The results will be displayed below the search bar.

### Viewing a Document
1. Click on a document from the "Uploaded Documents" list.
2. The document content will be displayed in the viewer section.

### Downloading a Document
1. Click the "Download" button next to the document in the "Uploaded Documents" list.
2. The document will be downloaded to your device.

## Project Structure

### Frontend
- `app/`: Next.js pages and layout.
- `components/`: Reusable React components.
- `lib/`: API and utility functions.
- `styles/`: Global styles and Tailwind configuration.

### Backend
- `controllers/`: Handles API logic.
- `models/`: MongoDB schema definitions.
- `routes/`: API route definitions.
- `services/`: Business logic for PDF and OCR processing.
- `middleware/`: Middleware for file uploads and other tasks.

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Next.js for the frontend framework.
- Tesseract.js for OCR capabilities.
- pdf-parse for PDF text extraction.

## Contact
For any questions or feedback, please reach out to ojasaklechayt@example.com.
