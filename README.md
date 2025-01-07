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

## Youtube Video
[![Youtube Video](https://img.youtube.com/vi/yvZY0UUHtyw/0.jpg)](https://youtu.be/yvZY0UUHtyw)

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
