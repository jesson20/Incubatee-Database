"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"

export default function MembersForStartup({ startupId, startupName }) {
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [members, setMembers] = useState([])
  const [currentMemberId, setCurrentMemberId] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    course: "",
    role: "",
  })
  const [startups, setStartups] = useState([]) // To store all startup profiles
  const [selectedStartupId, setSelectedStartupId] = useState(null) // Define startupId state here
  const [selectedStartupName, setSelectedStartupName] = useState("") // Define startup name state here

  // Fetch all startups to display startup names and IDs
  useEffect(() => {
    fetchStartups()
  }, []) // Run once on component mount

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

  // Fetch members for the selected startup
  useEffect(() => {
    if (selectedStartupId) {
      fetchMembers()
    }
  }, [selectedStartupId]) // Re-run fetch when selectedStartupId changes

  const fetchMembers = async () => {
    try {
      let url = `http://127.0.0.1:8000/startup-profiles`

      // If selectedStartupId is provided, fetch members for that specific startup
      if (selectedStartupId) {
        url += `/${selectedStartupId}/members`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle Add & Edit Submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      course: formData.course,
      role: formData.role,
    }

    try {
      const url = editMode
        ? `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/members/${currentMemberId}`
        : `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/members`
      const method = editMode ? "PUT" : "POST"

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server Error Response:", errorData)
        alert("Failed to save member: " + JSON.stringify(errorData))
        return
      }

      alert("Member saved successfully!")
      fetchMembers()
      resetForm()
    } catch (error) {
      console.error("Error saving member:", error)
      alert("Failed to save member. Check the console for details.")
    }
  }

  const handleEdit = (member) => {
    setFormData({
      id: member.id,
      name: member.name,
      course: member.course,
      role: member.role,
    })
    setCurrentMemberId(member.id)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDelete = async (memberId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this member?")

    if (confirmDelete) {
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

        const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/members/${memberId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting member:", errorData)
          alert("Failed to delete member: " + JSON.stringify(errorData))
          return
        }

        alert("Member deleted successfully!")
        fetchMembers()
      } catch (error) {
        console.error("Error deleting member:", error)
        alert("Failed to delete member. Check the console for details.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      course: "",
      role: "",
    })
    setShowModal(false)
    setEditMode(false)
    setCurrentMemberId(null)
  }

  const handleStartupClick = (id, name) => {
    setSelectedStartupId(id)
    setSelectedStartupName(name)
    fetchMembers()
  }

  const handleBackClick = () => {
    setSelectedStartupId(null)
    setSelectedStartupName("")
    setMembers([]) // Clear members when going back
  }

  // Show Add New Member Form
  const handleAddNewMemberClick = () => {
    setFormData({
      id: "",
      name: "",
      course: "",
      role: "",
    })
    setEditMode(false)
    setShowModal(true)
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Members for {selectedStartupName || 'All Startups'}</h2>}
    >
      <Head title={`Members - ${selectedStartupName || 'All Startups'}`} />

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
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.length > 0 ? (
                    startups.map((startup) => (
                      <tr key={startup.id}>
                        <td className="border px-4 py-2">{startup.id}</td>
                        <td className="border px-4 py-2">{startup.startup_name}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleStartupClick(startup.id, startup.startup_name)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
                          >
                            View Members
                          </button>
                          
                        </td>
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
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Back to Startups
              </button>
            </div>
          )}

          {/* Member Table */}
          {selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
              <h3 className="mb-4 text-lg font-semibold">Members</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Course</th>
                    <th className="border px-4 py-2">Role</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td className="border px-4 py-2">{member.name}</td>
                        <td className="border px-4 py-2">{member.course}</td>
                        <td className="border px-4 py-2">{member.role}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border px-4 py-2 text-center">
                        No members available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                onClick={handleAddNewMemberClick}
                disabled={members.length >= 5} 
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
              >
                Add New Member
              </button>
            </div>
          )}

          {/* Modal for Add/Edit Member */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                <h3 className="text-lg font-semibold mb-4">{editMode ? "Edit Member" : "Add New Member"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="course" className="block text-gray-700">Course</label>
                    <input
                      type="text"
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="role" className="block text-gray-700">Role</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      {editMode ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
