// components/SearchInterface.tsx
'use client'

import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { searchDocuments } from '../lib/api'
import debounce from 'lodash/debounce'

interface SearchResult {
  id: string
  name: string
  snippet: string
  relevance: number
}

interface SearchInterfaceProps {
  documentId: string | null,
  onDocumentSelect?: (id: string) => void,
  setDisplayContent: React.Dispatch<React.SetStateAction<object | null>>;
}

export default function SearchInterface({ documentId, onDocumentSelect, setDisplayContent }: SearchInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [matchType, setMatchType] = useState<'exact' | 'fuzzy'>('fuzzy')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const debouncedSearch = useCallback(
    debounce(async (term: string, type: 'exact' | 'fuzzy', docId: string | null) => {
      if (!term.trim()) {
        setResults([]);
        setDisplayContent(null);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchDocuments(term, type, docId);
        setResults(searchResults);
        setDisplayContent(searchResults); // Pass results for highlighting
      } catch (error) {
        console.error(error);
        toast({
          title: 'Search Failed',
          description: 'There was an error performing the search.',
          variant: 'destructive',
        });
        setResults([]);
        setDisplayContent(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [toast, setDisplayContent]
  );

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value, matchType, documentId)
  }

  const handleResultClick = (resultId: string) => {
    if (onDocumentSelect) {
      console.log(resultId + "clicked")
      setDisplayContent(results);
      onDocumentSelect(resultId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder="Enter search term"
                className="pr-8"
              />
              {isLoading && (
                <Loader2 className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 animate-spin" />
              )}
            </div>
          </div>
          <Select value={matchType} onValueChange={(value: 'exact' | 'fuzzy') => setMatchType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">Exact Match</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 border rounded-lg ${onDocumentSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                  onClick={() => handleResultClick(result.id)}
                >
                  <h4 className={`font-medium ${onDocumentSelect ? 'text-blue-600 hover:underline' : 'text-gray-900'} mb-2`}>
                    {result.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {result.snippet}
                  </p>
                  {result.relevance && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        Relevance: {(result.relevance * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            <p className="text-center text-gray-500 py-4">No results found</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}