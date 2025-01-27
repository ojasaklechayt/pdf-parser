/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function uploadDocument(file: File): Promise<{ success: boolean; message: string; document?: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload document');
    }

    return response.json();
}

export async function getAllDocuments(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
}

export async function getDocument(id: string, asBlob = false): Promise<Blob | any> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch document');
    return asBlob ? await response.blob() : response.json();
}

export async function searchDocuments(query: string, matchType: 'exact' | 'fuzzy', documentId: string | null): Promise<any[]> {
    const params = new URLSearchParams({
        query,
        matchType,
        ...(documentId ? { documentId } : {})
    });

    const response = await fetch(`${API_BASE_URL}/documents/search?${params}`);
    if (!response.ok) throw new Error('Failed to search documents');
    return response.json();
}