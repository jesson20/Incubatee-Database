"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"

export default function AchievementsForStartup({ startupId, startupName }) {
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [achievements, setAchievements] = useState([])
  const [currentAchievementId, setCurrentAchievementId] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    date: "",
    competitionName: "",
    organizedBy: "",
    prizeAmount: "",
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

  // Fetch achievements for the selected startup
  useEffect(() => {
    if (selectedStartupId) {
      fetchAchievements()
    }
  }, [selectedStartupId]) // Re-run fetch when selectedStartupId changes

  const fetchAchievements = async () => {
    try {
      let url = `http://127.0.0.1:8000/startup-profiles`

      // If selectedStartupId is provided, fetch achievements for that specific startup
      if (selectedStartupId) {
        url += `/${selectedStartupId}/achievements`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle Add & Edit Submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      date: formData.date,
      competition_name: formData.competitionName,
      organized_by: formData.organizedBy,
      prize_amount: formData.prizeAmount,
    }

    try {
      const url = editMode
        ? `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/achievements/${currentAchievementId}`
        : `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/achievements`
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
        alert("Failed to save achievement: " + JSON.stringify(errorData))
        return
      }

      alert("Achievement saved successfully!")
      fetchAchievements()
      resetForm()
    } catch (error) {
      console.error("Error saving achievement:", error)
      alert("Failed to save achievement. Check the console for details.")
    }
  }

  const handleEdit = (achievement) => {
    setFormData({
      id: achievement.id,
      date: achievement.date,
      competitionName: achievement.competition_name,
      organizedBy: achievement.organized_by,
      prizeAmount: achievement.prize_amount,
    })
    setCurrentAchievementId(achievement.id)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDelete = async (achievementId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this achievement?")

    if (confirmDelete) {
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

        const response = await fetch(
          `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/achievements/${achievementId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
            },
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting achievement:", errorData)
          alert("Failed to delete achievement: " + JSON.stringify(errorData))
          return
        }

        alert("Achievement deleted successfully!")
        fetchAchievements()
      } catch (error) {
        console.error("Error deleting achievement:", error)
        alert("Failed to delete achievement. Check the console for details.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      date: "",
      competitionName: "",
      organizedBy: "",
      prizeAmount: "",
    })
    setShowModal(false)
    setEditMode(false)
    setCurrentAchievementId(null)
  }

  const handleStartupClick = (id, name) => {
    setSelectedStartupId(id)
    setSelectedStartupName(name)
    fetchAchievements()
  }

  const handleBackClick = () => {
    setSelectedStartupId(null)
    setSelectedStartupName("")
    setAchievements([]) // Clear achievements when going back
  }

  // Show Add New Achievement Form
  const handleAddNewAchievementClick = () => {
    setFormData({
      id: "",
      date: "",
      competitionName: "",
      organizedBy: "",
      prizeAmount: "",
    })
    setEditMode(false)
    setShowModal(true)
  }

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Achievements for {selectedStartupName || "All Startups"}
        </h2>
      }
    >
      <Head title={`Achievements - ${selectedStartupName || "All Startups"}`} />

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
                      <tr key={startup.id} >
                        <td className="border px-4 py-2">{startup.id}</td>
                        <td className="border px-4 py-2">{startup.startup_name}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleStartupClick(startup.id, startup.startup_name)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
                          >
                            View Achievements
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
              <button onClick={handleBackClick} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Back to Startups
              </button>
            </div>
          )}

          {/* Achievement Table */}
          {selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
              <h3 className="mb-4 text-lg font-semibold">Achievements</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Competition Name</th>
                    <th className="border px-4 py-2">Organized By</th>
                    <th className="border px-4 py-2">Prize Amount</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <tr key={achievement.id}>
                        <td className="border px-4 py-2">{achievement.date}</td>
                        <td className="border px-4 py-2">{achievement.competition_name}</td>
                        <td className="border px-4 py-2">{achievement.organized_by}</td>
                        <td className="border px-4 py-2">{achievement.prize_amount}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleEdit(achievement)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
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
                        No achievements available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                onClick={handleAddNewAchievementClick}
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
              >
                Add New Achievement
              </button>
            </div>
          )}

          {/* Modal for Add/Edit Achievement */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                <h3 className="text-lg font-semibold mb-4">{editMode ? "Edit Achievement" : "Add New Achievement"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="competitionName" className="block text-gray-700">
                      Competition Name
                    </label>
                    <input
                      type="text"
                      id="competitionName"
                      name="competitionName"
                      value={formData.competitionName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="organizedBy" className="block text-gray-700">
                      Organized By
                    </label>
                    <input
                      type="text"
                      id="organizedBy"
                      name="organizedBy"
                      value={formData.organizedBy}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="prizeAmount" className="block text-gray-700">
                      Prize Amount
                    </label>
                    <input
                      type="numeric"
                      id="prizeAmount"
                      name="prizeAmount"
                      value={formData.prizeAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                      Cancel
                    </button>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
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

