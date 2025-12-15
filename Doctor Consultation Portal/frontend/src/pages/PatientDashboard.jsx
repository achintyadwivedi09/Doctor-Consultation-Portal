import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import api from '../services/api'
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  Stethoscope,
  User,
  LogOut,
  History,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'

const PatientDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('book')
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    location: '',
  })
  const [bookingData, setBookingData] = useState({
    doctor_id: '',
    appointment_date: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDoctors()
    fetchAppointments()
    fetchMedicalRecords()
  }, [])

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams()
      if (searchFilters.specialization)
        params.append('specialization', searchFilters.specialization)
      if (searchFilters.location) params.append('location', searchFilters.location)

      const response = await api.get(`/doctors?${params.toString()}`)
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

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get('/medical-records')
      setMedicalRecords(response.data)
    } catch (error) {
// Silently fail - records might not exist
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    if (!bookingData.doctor_id || !bookingData.appointment_date) {
      toast.error('Please select doctor and date')
      return
    }

    setLoading(true)
    try {
      await api.post('/appointments', {
        doctor_id: parseInt(bookingData.doctor_id),
        appointment_date: bookingData.appointment_date,
        reason: bookingData.reason,
      })
      toast.success('Appointment booked successfully!')
      setBookingData({ doctor_id: '', appointment_date: '', reason: '' })
      fetchAppointments()
      setActiveTab('history')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error booking appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?'))
      return

    try {
      await api.delete(`/appointments/${appointmentId}`)
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (error) {
      toast.error('Error cancelling appointment')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Patient Dashboard</h1>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'book'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'history'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="inline-block h-4 w-4 mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'records'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="inline-block h-4 w-4 mr-2" />
              Medical Records
            </button>
          </div>
        </div>

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            {/* Search Doctors */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary-600" />
                Find a Doctor
              </h2>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Specialization"
                  value={searchFilters.specialization}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      specialization: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={searchFilters.location}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, location: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Doctors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() =>
                    setBookingData({ ...bookingData, doctor_id: doctor.id.toString() })
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {doctor.user.full_name}
                  </h3>
                  <p className="text-primary-600 mb-2">{doctor.specialization}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {doctor.available_from} - {doctor.available_to}
                    </div>
                    <div className="text-primary-600 font-semibold">
                      ₹{doctor.consultation_fee}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Form */}
            {bookingData.doctor_id && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Book Appointment</h3>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingData.appointment_date}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          appointment_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={bookingData.reason}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, reason: e.target.value })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Appointments History Tab */}
        {activeTab === 'history' && (
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
                            Dr. {appointment.doctor.user.full_name}
                          </h3>
                          <p className="text-primary-600">
                            {appointment.doctor.specialization}
                          </p>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(
                                new Date(appointment.appointment_date),
                                'PPP p'
                              )}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {appointment.doctor.location}
                            </div>
                            {appointment.reason && (
                              <p className="mt-2 text-gray-700">{appointment.reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
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
                          {['pending', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="mt-2 block w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                            >
                              Cancel
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

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
              {medicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medical records found</p>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {format(new Date(record.record_date), 'PPP')}
                        </h3>
                      </div>
                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Diagnosis:
                          </span>
                          <p className="text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.prescription && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Prescription:
                          </span>
                          <p className="text-gray-600">{record.prescription}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard

