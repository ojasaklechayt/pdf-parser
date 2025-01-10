'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocument } from '../lib/api';
import { useToast } from "@/hooks/use-toast";
import { marked } from 'marked';

interface DocumentViewerProps {
  documentId: string | null;
  searchTerm: string;
}

export default function DocumentViewer({ documentId, searchTerm }: DocumentViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true; // Prevent updates if component unmounts

    async function fetchDocument() {
      if (!documentId) {
        setContent(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const document = await getDocument(documentId);
        if (isMounted) setContent(document.content);
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
        if (isMounted) setLoading(false);
      }
    }

    fetchDocument();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [documentId, toast]);

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <Card>
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
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: marked(highlightText(content || '', searchTerm)),
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
