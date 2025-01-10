'use server'

import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file uploaded')
  }

  // Here you would typically:
  // 1. Save the file to a storage service
  // 2. Send the file for OCR processing
  // 3. Save the extracted text to your database

  // Simulating a delay for processing
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Revalidate the home page to show the new document
  revalidatePath('/')

  return { success: true, message: 'File uploaded and processed successfully' }
}

