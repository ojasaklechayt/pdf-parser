/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { Worker, Viewer, RenderError } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { highlightPlugin, HighlightArea, RenderHighlightsProps } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getDocument } from '@/lib/api';

interface SearchResult {
  id: string;
  name: string;
  pageNumber: number;
  snippet: string;
  position?: {
    x: number;
    y: number;
  };
}

interface DocumentViewerProps {
  documentId: string | null;
  displayContent: SearchResult[] | null;
  searchTerm?: string;
}

interface DocumentLoadEvent {
  doc: {
    numPages: number;
  };
}

interface PageChangeEvent {
  currentPage: number;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, displayContent, searchTerm }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const highlights: HighlightArea[] = useMemo(() => {
    if (!displayContent || !Array.isArray(displayContent)) return [];

    return displayContent.map((result) => ({
      pageIndex: result.pageNumber - 1, // Convert to zero-based index
      height: 20, // Approximate height
      width: result.content?.length * 6 || 60, // Approximate width
      left: result.position?.x || 0,
      top: result.position?.y || 0,
      content: result.snippet, // Displayed on hover
    }));
  }, [displayContent]);

  const highlightPluginInstance = highlightPlugin({
    renderHighlights: (props) => (
      <div>
        {highlights
          .filter(area => area.pageIndex === props.pageIndex)
          .map((area, idx) => (
            <div
              key={idx}
              style={{
                ...props.getCssProperties(area, props.rotation),
                background: 'rgba(255, 255, 0, 0.5)',
                position: 'absolute',
                pointerEvents: 'none'
              }}
            />
          ))}
      </div>
    )
  });

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) {
        setPdfUrl(null);
        return;
      }

      try {
        setLoading(true);
        const blob = await getDocument(documentId, true);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error fetching document:', error);
        toast({
          title: "Error",
          description: "Failed to load document content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, toast]);

  if (loading) {
    return <Skeleton className="h-[800px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Content</CardTitle>
      </CardHeader>
      <CardContent>
        {pdfUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[highlightPluginInstance]}
            />
          </Worker>
        ) : (
          <p>No document selected</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;