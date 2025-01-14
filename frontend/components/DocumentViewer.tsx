/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Worker, Viewer, RenderError } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getDocument } from '@/lib/api';

interface DocumentViewerProps {
  documentId: string | null;
  searchTerm?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, searchTerm = '' }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // Initialize plugins with their options
  const pageNavigationPluginInstance = pageNavigationPlugin();

  // Get the plugin components and functions
  const {
    CurrentPageInput,
    NumberOfPages,
  } = pageNavigationPluginInstance;

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      if (!documentId) {
        setPdfUrl(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const blob = await getDocument(documentId, true);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load document content.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, toast]);

  const handleDocumentLoad = ({ doc }: { doc: any }) => {
    if (doc) {
      setPageCount(doc.numPages);
    }
  };

  // Corrected the page change handler to capture the current page correctly
  const handlePageChange = (e: { currentPage: number }) => {
    setCurrentPage(e.currentPage);
  };

  const renderError: RenderError = (error) => (
    <div className="text-red-500 p-4 space-y-2">
      <p className="font-semibold">Failed to load PDF</p>
      <p className="text-sm">Error: {error.message}</p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Content</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : pdfUrl ? (
          <div>
            <div className="flex items-center justify-between mb-4 p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span>Page</span>
                  <CurrentPageInput />
                  <span>of</span>
                  <span className="ml-2"><NumberOfPages /></span>
                </div>
              </div>
            </div>

            <div className="pdf-viewer h-[800px] w-full border rounded-lg overflow-hidden">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfUrl}
                  onDocumentLoad={handleDocumentLoad}
                  onPageChange={handlePageChange}
                  renderError={renderError}
                  plugins={[pageNavigationPluginInstance]}
                />
              </Worker>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No Document Selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
