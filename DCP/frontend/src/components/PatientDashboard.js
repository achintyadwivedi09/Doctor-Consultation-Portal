import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors', { withCredentials: true });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments', { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBookAppointment = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments', {
        doctor_id: selectedDoctor.doctor_id,
        date: bookingDate,
        time: bookingTime
      }, { withCredentials: true });
      
      alert('Appointment booked successfully!');
      setShowBooking(false);
      setBookingDate('');
      setBookingTime('');
      fetchAppointments();
    } catch (error) {
      alert('Error booking appointment: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleCancelAppointment = async (appId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${appId}`, { withCredentials: true });
        fetchAppointments();
        alert('Appointment cancelled successfully!');
      } catch (error) {
        alert('Error cancelling appointment');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">Doctor Portal - Patient</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name || 'Patient'}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.doctor_id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-blue-600 mt-1">{doctor.specialization}</p>
                      <p className="text-gray-600 mt-2">₹{doctor.fees} consultation fee</p>
                      <p className="text-gray-500 text-sm mt-1">Available: {doctor.availability}</p>
                    </div>
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500">No appointments yet</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.app_id} className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="font-semibold">{appointment.doctor_name}</h4>
                    <p className="text-sm text-gray-600">{appointment.specialization}</p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Date:</span> {appointment.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {appointment.time}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.app_id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <p className="mb-4">
              <strong>Doctor:</strong> {selectedDoctor?.name} - {selectedDoctor?.specialization}
            </p>
            <form onSubmit={handleConfirmBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;

