import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import api from '../services/api'
import {
  Users,
  Stethoscope,
  Calendar,
  LogOut,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
} from 'lucide-react'
import { format } from 'date-fns'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDoctorData, setNewDoctorData] = useState({
    user_id: '',
    specialization: '',
    experience_years: '',
    qualification: '',
    bio: '',
    consultation_fee: '',
    location: '',
    available_from: '',
    available_to: '',
  })

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchDoctors()
    fetchAppointments()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      toast.error('Error fetching stats')
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      toast.error('Error fetching users')
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data)
    } catch (error) {
      toast.error('Error fetching doctors')
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments')
      setAppointments(response.data)
    } catch (error) {
      toast.error('Error fetching appointments')
    }
  }

  const handleToggleUserActive = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`)
      toast.success('User status updated')
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.error('Error updating user status')
    }
  }

  const handleCreateDoctor = async (e) => {
    e.preventDefault()
    try {
      await api.post('/doctors', {
        ...newDoctorData,
        user_id: parseInt(newDoctorData.user_id),
        experience_years: parseInt(newDoctorData.experience_years),
        consultation_fee: parseFloat(newDoctorData.consultation_fee),
      })
      toast.success('Doctor profile created successfully')
      setNewDoctorData({
        user_id: '',
        specialization: '',
        experience_years: '',
        qualification: '',
        bio: '',
        consultation_fee: '',
        location: '',
        available_from: '',
        available_to: '',
      })
      fetchDoctors()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error creating doctor profile')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const doctorUsers = users.filter((u) => u.role === 'doctor' && !u.doctor_profile)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{user?.full_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="inline-block h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="inline-block h-4 w-4 mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Stethoscope className="inline-block h-4 w-4 mr-2" />
              Doctors
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Appointments
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_users}
                  </p>
                </div>
                <Users className="h-12 w-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Doctors</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_doctors}
                  </p>
                </div>
                <Stethoscope className="h-12 w-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_appointments}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Appointments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.pending_appointments}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-yellow-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-gray-900">{u.full_name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'doctor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              u.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleUserActive(u.id)}
                            className={`px-3 py-1 rounded text-sm transition ${
                              u.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {u.is_active ? (
                              <UserX className="inline-block h-4 w-4" />
                            ) : (
                              <UserCheck className="inline-block h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Create Doctor Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Create Doctor Profile</h2>
              <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Doctor User
                  </label>
                  <select
                    required
                    value={newDoctorData.user_id}
                    onChange={(e) =>
                      setNewDoctorData({ ...newDoctorData, user_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a doctor user...</option>
                    {doctorUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorData.specialization}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDoctorData.experience_years}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        experience_years: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorData.qualification}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        qualification: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorData.location}
                    onChange={(e) =>
                      setNewDoctorData({ ...newDoctorData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={newDoctorData.consultation_fee}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        consultation_fee: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available From
                  </label>
                  <input
                    type="time"
                    required
                    value={newDoctorData.available_from}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        available_from: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available To
                  </label>
                  <input
                    type="time"
                    required
                    value={newDoctorData.available_to}
                    onChange={(e) =>
                      setNewDoctorData({
                        ...newDoctorData,
                        available_to: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={newDoctorData.bio}
                    onChange={(e) =>
                      setNewDoctorData({ ...newDoctorData, bio: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Create Doctor Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Doctors List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">All Doctors</h2>
                {doctors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No doctors found</p>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {doctor.user.full_name}
                            </h3>
                            <p className="text-primary-600">{doctor.specialization}</p>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>Qualification: {doctor.qualification}</p>
                              <p>Experience: {doctor.experience_years} years</p>
                              <p>Location: {doctor.location}</p>
                              <p>Fee: ₹{doctor.consultation_fee}</p>
                              <p>
                                Availability: {doctor.available_from} - {doctor.available_to}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              doctor.is_available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {doctor.is_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Patient
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Doctor
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-4 text-gray-900">
                            {appointment.patient.full_name}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {appointment.doctor.user.full_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {format(new Date(appointment.appointment_date), 'PPP p')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : appointment.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

