import { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles
import { FaCalendarAlt } from "react-icons/fa"; // Import Font Awesome Calendar icon

export default function Profiles() {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [currentProfileId, setCurrentProfileId] = useState(null);
    const [formData, setFormData] = useState({
        id: "", 
        startupName: "",
        industry: "",
        members: "",
        leader: "",
        dtiDate: null,
        birDate: null,
    });
    
    
    const handleDateChange = (name, date) => {
        setFormData((prevState) => ({ ...prevState, [name]: date }));
    };

      // Create refs for each date picker
      const dtiDatePickerRef = useRef(null);
      const birDatePickerRef = useRef(null);
    

    // Fetch profiles from backend
    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/startup-profiles");
    
            if (!response.ok) {
                const errorMessage = `Failed to fetch profiles: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
            setProfiles(data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };
    
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Add & Edit Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const payload = {
            startup_name: formData.startupName,
            industry: formData.industry,
            number_of_members: parseInt(formData.members, 10),
            leader: formData.leader,
            date_registered_dti: formData.dtiDate || null,
            date_registered_bir: formData.birDate || null,
        };
    
        try {
            const url = editMode
                ? `http://127.0.0.1:8000/startup-profiles/${currentProfileId}`
                : "http://127.0.0.1:8000/startup-profiles";
            const method = editMode ? "PUT" : "POST";
    
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                body: JSON.stringify(payload),
            });
    
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server Error Response:", errorData);
                alert("Failed to save profile: " + JSON.stringify(errorData)); // Show exact error
                return;
            }
            
    
            alert("Profile saved successfully!");
            fetchProfiles();
            resetForm();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Check the console for details.");
        }
    };
    
    const handleEdit = (profile) => {
        setFormData({
            id: profile.id,  // Set the ID to the current profile's ID
            startupName: profile.startup_name,
            industry: profile.industry,
            members: profile.number_of_members,
            leader: profile.leader,
            dtiDate: profile.date_registered_dti,
            birDate: profile.date_registered_bir,
        });
        setCurrentProfileId(profile.id); // Set the current profile ID for reference
        setEditMode(true); // Enable edit mode
        setShowModal(true); // Show the modal
    };
    
    const handleDelete = async (profileId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
        
        if (confirmDelete) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                const response = await fetch(`http://127.0.0.1:8000/startup-profiles/${profileId}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                    },
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error deleting profile:", errorData);
                    alert("Failed to delete profile: " + JSON.stringify(errorData));
                    return;
                }
        
                alert("Profile deleted successfully!");
                fetchProfiles(); // Reload profiles after deletion
            } catch (error) {
                console.error("Error deleting profile:", error);
                alert("Failed to delete profile. Check the console for details.");
            }
        }
    };

    // Reset form & close modal
    const resetForm = () => {
        setFormData({
            id: "",  // Reset ID
            startupName: "",
            industry: "",
            members: "",
            leader: "",  // Reset Leader
            dtiDate: "",
            birDate: "",
        });
        setShowModal(false);
        setEditMode(false);
        setCurrentProfileId(null);
    };
    

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Startup Profiles</h2>}>
            <Head title="Startup Profiles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">ID</th>
                                    <th className="border px-4 py-2">Startup Name</th>
                                    <th className="border px-4 py-2">Leader</th>
                                    <th className="border px-4 py-2">Industry</th>
                                    <th className="border px-4 py-2">Members</th>
                                    <th className="border px-4 py-2">DTI Date</th>
                                    <th className="border px-4 py-2">BIR Date</th>
                                    <th className="border px-4 py-2">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {profiles.length > 0 ? (
                                    profiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td className="border px-4 py-2">
                                        {profile.id}
                                        </td>
                                        <td className="border px-4 py-2">{profile.startup_name}</td>
                                        <td className="border px-4 py-2">{profile.leader}</td>
                                        <td className="border px-4 py-2">{profile.industry}</td>
                                        <td className="border px-4 py-2">{profile.number_of_members}</td>
                                        <td className="border px-4 py-2">{profile.date_registered_dti || "-"}</td>
                                        <td className="border px-4 py-2">{profile.date_registered_bir || "-"}</td>
                                        <td className="border px-4 py-2 space-x-2">
                                        <button onClick={() => handleEdit(profile)} className="bg-yellow-500 px-2 py-1 text-white rounded">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(profile.id)} className="bg-red-500 px-2 py-1 text-white rounded">
                                            Delete
                                        </button>
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan="8" className="border px-4 py-2 text-center">No profiles found.</td>
                                    </tr>
                                )}
                            </tbody>


                        </table>

                        <div className="mt-4 flex justify-center">
                            <button onClick={() => setShowModal(true)} className="bg-blue-500 px-4 py-2 text-white rounded">+ Add Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold">
                            {editMode ? "Edit Profile" : "Add New Profile"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            readOnly
                            className="w-full border px-3 py-2 mb-3 bg-gray-100 cursor-not-allowed"
                            placeholder="ID (Auto-generated)"
                        />
                        <input
                            type="text"
                            name="startupName"
                            value={formData.startupName}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 mb-3"
                            placeholder="Startup Name"
                            required
                        />
                        <input
                            type="text"
                            name="leader"
                            value={formData.leader}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 mb-3"
                            placeholder="Leader Name"
                            required
                        />
                        <input
                            type="text"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 mb-3"
                            placeholder="Industry"
                            required
                        />
                        <input
                            type="number"
                            name="members"
                            value={formData.members}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 mb-3"
                            placeholder="Number of Members"
                            required
                        />

                        {/* DTI Date with Calendar Icon Inside Input */}
                        <div className="mb-4">
                            <label htmlFor="date" className="block text-gray-700">
                                Date
                            </label>
                            <input
                            type="date"
                            id="dtiDate"
                            name="dtiDate"
                            value={formData.dtiDate || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>

                        {/* BIR Date with Calendar Icon Inside Input */}
                        <div className="mb-4">
                            <label htmlFor="date" className="block text-gray-700">
                            Date
                            </label>
                            <input
                            type="date"
                            id="birDate"
                            name="birDate"
                            value={formData.birDate || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-400 px-4 py-2 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 px-4 py-2 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}


        </AuthenticatedLayout>
    );
}
