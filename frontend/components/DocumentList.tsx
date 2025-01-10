'use client'

import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllDocuments } from '../lib/api'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Document {
  id: string
  name: string
  date: string
}

export default function DocumentList({ onSelectDocument }: { onSelectDocument: (id: string) => void }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    async function fetchDocuments() {
      try {
        const docs = await getAllDocuments()
        if (mounted) {
          setDocuments(docs.map(doc => ({
            id: doc._id,
            name: doc.name,
            date: new Date(doc.createdAt).toLocaleDateString()
          })))
        }
      } catch (error) {
        console.log(error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to load document list.",
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDocuments()
    return () => { mounted = false }
  }, [toast])

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Complete",
        description: `${name} has been downloaded successfully.`,
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No documents found</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <button
                    className="text-sm text-gray-700 hover:underline"
                    onClick={() => onSelectDocument(doc.id)}
                  >
                    {doc.name}
                  </button>
                  <span className="text-xs text-gray-500">{doc.date}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc.id, doc.name)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}