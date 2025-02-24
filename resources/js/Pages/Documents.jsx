"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"
import { FileUp, Eye, Download, X } from 'lucide-react'

export default function Documents() {
  const [documents, setDocuments] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [startups, setStartups] = useState([])
  const [selectedStartupId, setSelectedStartupId] = useState(null)
  const [selectedStartupName, setSelectedStartupName] = useState("")
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState("")
  const [viewerType, setViewerType] = useState("")

  // Fetch all startups
  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/startup-profiles")
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setStartups(data)
    } catch (error) {
      console.error("Error fetching startups:", error)
    }
  }

  // Fetch documents when startup is selected
  useEffect(() => {
    if (selectedStartupId) {
      fetchDocuments()
    }
  }, [selectedStartupId])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data || {})
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (documentType, file) => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("document_type", documentType)

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    try {
      setUploading(true)
      const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/documents/upload`, {
        method: "POST",
        headers: {
            "X-CSRF-TOKEN": csrfToken,  // ✅ Include CSRF token
        },
        body: formData,
      })

      if (response.ok) {
        await fetchDocuments()
        alert("Document uploaded successfully!")
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.message}`)
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Error uploading document")
    } finally {
      setUploading(false)
    }
  }

  const handleView = async (documentType) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/documents/download/${documentType}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        setViewerUrl(url)
        setViewerType(blob.type)
        setViewerOpen(true)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Error viewing document')
      }
    } catch (error) {
      console.error("Error viewing document:", error)
      alert("Error viewing document")
    }
  }

  const handleDownload = async (documentType) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/documents/download/${documentType}`)
      
      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `${documentType}-document`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Error downloading document')
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Error downloading document")
    }
  }

  const handleStartupClick = (id, name) => {
    setSelectedStartupId(id)
    setSelectedStartupName(name)
  }

  const handleBackClick = () => {
    setSelectedStartupId(null)
    setSelectedStartupName("")
    setDocuments(null)
    setLoading(true)
  }

  const closeViewer = () => {
    setViewerOpen(false)
    setViewerUrl("")
    setViewerType("")
  }

  const documentTypes = [
    { key: 'dti_registration', label: 'DTI Registration' },
    { key: 'bir_registration', label: 'BIR Registration' },
    { key: 'sec_registration', label: 'SEC Registration' }
  ]

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Business Documents for {selectedStartupName || 'All Startups'}</h2>}
    >
      <Head title={`Business Documents - ${selectedStartupName || 'All Startups'}`} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Table for Startups */}
          {!selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 mb-8">
              <h3 className="mb-4 text-lg font-semibold">Select a Startup</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Startup ID</th>
                    <th className="border px-4 py-2">Startup Name</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.length > 0 ? (
                    startups.map((startup) => (
                      <tr
                        key={startup.id}
                        onClick={() => handleStartupClick(startup.id, startup.startup_name)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="border px-4 py-2">{startup.id}</td>
                        <td className="border px-4 py-2">{startup.startup_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="border px-4 py-2 text-center">
                        No startups available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Back Button */}
          {selectedStartupId && (
            <div className="mb-4">
              <button
                onClick={handleBackClick}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Back to Startups
              </button>
            </div>
          )}

          {/* Documents Table */}
          {selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
              <h3 className="mb-4 text-lg font-semibold">Documents</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documentTypes.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documents && documents[key] ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(key)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(key)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </button>
                            <button
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                                input.onchange = (e) => handleFileUpload(key, e.target.files[0])
                                input.click()
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              disabled={uploading}
                            >
                              <FileUp className="w-4 h-4 mr-2" />
                              Replace
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                              input.onchange = (e) => handleFileUpload(key, e.target.files[0])
                              input.click()
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={uploading}
                          >
                            <FileUp className="w-4 h-4 mr-2" />
                            Upload
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Document Viewer Modal */}
          {viewerOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold">Document Viewer</h3>
                  <button
                    onClick={closeViewer}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {viewerType.startsWith('image/') ? (
                    <img
                      src={viewerUrl || "/placeholder.svg"}
                      alt="Document Preview"
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : viewerType === 'application/pdf' ? (
                    <iframe
                      src={viewerUrl}
                      className="w-full h-full"
                      title="PDF Viewer"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        This file type cannot be previewed. Please download the file to view it.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
