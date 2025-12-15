import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import api from '../services/api'
import {
  Calendar,
  Clock,
  User,
  LogOut,
  Settings,
  Stethoscope,
  MapPin,
  DollarSign,
} from 'lucide-react'
import { format } from 'date-fns'

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')
  const [availability, setAvailability] = useState({
    is_available: true,
    available_from: '',
    available_to: '',
  })

  useEffect(() => {
    fetchProfile()
    fetchAppointments()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/doctors/me/profile')
      setDoctorProfile(response.data)
      setAvailability({
        is_available: response.data.is_available,
        available_from: response.data.available_from || '',
        available_to: response.data.available_to || '',
      })
      setLoading(false)
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info('Please complete your doctor profile first')
        setLoading(false)
      } else {
        toast.error('Error fetching profile')
      }
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

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, null, {
        params: { new_status: newStatus },
      })
      toast.success('Appointment status updated')
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error updating status')
    }
  }

  const handleAvailabilityUpdate = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        is_available: availability.is_available,
      }
      if (availability.available_from) {
        updateData.available_from = availability.available_from
      }
      if (availability.available_to) {
        updateData.available_to = availability.available_to
      }

      await api.put('/doctors/me/availability', null, {
        params: updateData,
      })
      toast.success('Availability updated successfully')
      fetchProfile()
    } catch (error) {
      toast.error('Error updating availability')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

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
              <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
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
        {/* Profile Card */}
        {doctorProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {doctorProfile.user.full_name}
                </h2>
                <p className="text-primary-600 text-lg mb-4">
                  {doctorProfile.specialization}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                    {doctorProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary-600" />
                    {doctorProfile.available_from} - {doctorProfile.available_to}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                    ₹{doctorProfile.consultation_fee}
                  </div>
                </div>
                {doctorProfile.bio && (
                  <p className="mt-4 text-gray-700">{doctorProfile.bio}</p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctorProfile.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doctorProfile.is_available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'appointments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'availability'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="inline-block h-4 w-4 mr-2" />
              Availability
            </button>
          </div>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patient.full_name}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(
                                new Date(appointment.appointment_date),
                                'PPP p'
                              )}
                            </div>
                            {appointment.reason && (
                              <p className="mt-2 text-gray-700">
                                <span className="font-medium">Reason:</span>{' '}
                                {appointment.reason}
                              </p>
                            )}
                            {appointment.patient.phone && (
                              <p className="text-gray-600">
                                Phone: {appointment.patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
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
                          {appointment.status === 'pending' && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(appointment.id, 'confirmed')
                                }
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(appointment.id, 'cancelled')
                                }
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(appointment.id, 'completed')
                              }
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && doctorProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Update Availability</h2>
            <form onSubmit={handleAvailabilityUpdate} className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={availability.is_available}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700 font-medium">Available for appointments</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available From
                  </label>
                  <input
                    type="time"
                    value={availability.available_from}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
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
                    value={availability.available_to}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        available_to: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Update Availability
              </button>
            </form>
          </div>
        )}

        {!doctorProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Your doctor profile is not set up yet. Please contact the administrator to
              complete your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard

