import React from 'react'
import ThesisFacultyViewer from '../../../components/ThesisFacultyViewer'

export const metadata = {
  title: 'Thesis Faculty'
}

export default function Page(){
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Thesis Faculty Preview</h1>
      <p className="text-sm text-gray-600 mb-4">Preview professors and whether they accept thesis supervision. Data is read from the provided CSV.</p>
      <ThesisFacultyViewer />
    </div>
  )
}
