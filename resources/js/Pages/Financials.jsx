"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"
import { PlusCircle, Edit, Trash, DollarSign, CreditCard } from "lucide-react"

export default function Financials() {
  const [startups, setStartups] = useState([])
  const [selectedStartupId, setSelectedStartupId] = useState(null)
  const [selectedStartupName, setSelectedStartupName] = useState("")
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  })
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentRecordId, setCurrentRecordId] = useState(null)
  const [formData, setFormData] = useState({
    record_type: "income",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

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

 // Fetch financial for the selected startup
 useEffect(() => {
  if (selectedStartupId) {
    fetchFinancials()
  }
}, [selectedStartupId]) // Re-run fetch when selectedStartupId changes

const fetchFinancials = async () => {
  try {
    let url = `http://127.0.0.1:8000/startup-profiles`

    // If selectedStartupId is provided, fetch financials for that specific startup
    if (selectedStartupId) {
      url += `/${selectedStartupId}/financials`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    setFinancialData(data)
  } catch (error) {
    console.error("Error fetching financials:", error)
  }
}

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      record_type: formData.record_type,
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
    }

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

      const url = editMode
        ? `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/financials/${currentRecordId}`
        : `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/financials`

      const method = editMode ? "PUT" : "POST"

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
        alert("Failed to save financial record: " + JSON.stringify(errorData))
        return
      }

      alert("Financial record saved successfully!")
      fetchFinancials()
      resetForm()
    } catch (error) {
      console.error("Error saving financial record:", error)
      alert("Failed to save financial record. Check the console for details.")
    }
  }

  const handleEdit = (record) => {
    setFormData({
      record_type: record.record_type,
      description: record.description,
      amount: record.amount,
      date: record.date,
    })
    setCurrentRecordId(record.id)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDelete = async (recordId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this financial record?")

    if (confirmDelete) {
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

        const response = await fetch(
          `http://127.0.0.1:8000/startup-profiles/${selectedStartupId}/financials/${recordId}`,
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
          console.error("Error deleting financial record:", errorData)
          alert("Failed to delete financial record: " + JSON.stringify(errorData))
          return
        }

        alert("Financial record deleted successfully!")
        fetchFinancials()
      } catch (error) {
        console.error("Error deleting financial record:", error)
        alert("Failed to delete financial record. Check the console for details.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      record_type: "income",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    })
    setShowModal(false)
    setEditMode(false)
    setCurrentRecordId(null)
  }

  const handleStartupClick = (id, name) => {
    setSelectedStartupId(id)
    setSelectedStartupName(name)
  }

  const handleBackClick = () => {
    setSelectedStartupId(null)
    setSelectedStartupName("")
    setFinancialData({
      income: [],
      expenses: [],
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
    })
  }

  const handleAddNewRecord = (type) => {
    setFormData({
      record_type: type,
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    })
    setEditMode(false)
    setShowModal(true)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Financial Records for {selectedStartupName || "All Startups"}
        </h2>
      }
    >
      <Head title={`Financial Records - ${selectedStartupName || "All Startups"}`} />

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
                            className="bg-blue-500 text-white px-3 py-1 rounded-md"
                          >
                            View Financials
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
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Back to Startups
              </button>
            </div>
          )}

          {/* Financial Summary */}
          {selectedStartupId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Total Income</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.totalIncome)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-red-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(financialData.totalExpenses)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
                    <p
                      className={`text-2xl font-bold ${financialData.balance >= 0 ? "text-blue-600" : "text-red-600"}`}
                    >
                      {formatCurrency(financialData.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Income Table */}
          {selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Income</h3>
                <button
                  onClick={() => handleAddNewRecord("income")}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Income
                </button>
              </div>

              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Amount</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.income && financialData.income.length > 0 ? (
                    financialData.income.map((record) => (
                      <tr key={record.id}>
                        <td className="border px-4 py-2">{record.date}</td>
                        <td className="border px-4 py-2">{record.description}</td>
                        <td className="border px-4 py-2 text-right">{formatCurrency(record.amount)}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 inline-flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md inline-flex items-center"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border px-4 py-2 text-center">
                        No income records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Expenses Table */}
          {selectedStartupId && (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Expenses</h3>
                <button
                  onClick={() => handleAddNewRecord("expense")}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Expense
                </button>
              </div>

              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Amount</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.expenses && financialData.expenses.length > 0 ? (
                    financialData.expenses.map((record) => (
                      <tr key={record.id}>
                        <td className="border px-4 py-2">{record.date}</td>
                        <td className="border px-4 py-2">{record.description}</td>
                        <td className="border px-4 py-2 text-right">{formatCurrency(record.amount)}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 inline-flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md inline-flex items-center"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border px-4 py-2 text-center">
                        No expense records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal for Add/Edit Financial Record */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editMode
                    ? "Edit Financial Record"
                    : `Add New ${formData.record_type === "income" ? "Income" : "Expense"}`}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="record_type" className="block text-gray-700 mb-2">
                      Record Type
                    </label>
                    <select
                      id="record_type"
                      name="record_type"
                      value={formData.record_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                      placeholder="e.g., Sales, Investment, Rent, Utilities"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="date" className="block text-gray-700 mb-2">
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

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`text-white px-4 py-2 rounded-md ${
                        formData.record_type === "income"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
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

