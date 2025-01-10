'use client';

import { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentViewer from '../components/DocumentViewer';
import SearchInterface from '../components/SearchInterface';
import DocumentList from '../components/DocumentList';

export default function Home() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <DocumentUpload />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DocumentViewer documentId={selectedDocumentId} searchTerm="" />
        </div>
        <div className="space-y-8">
          <SearchInterface />
          <DocumentList onSelectDocument={setSelectedDocumentId} />
        </div>
      </div>
    </div>
  );
}
