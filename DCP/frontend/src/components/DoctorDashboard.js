import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments', { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await axios.put(`/api/appointments/${appId}/status`, { status }, { withCredentials: true });
      fetchAppointments();
      alert(`Appointment ${status} successfully!`);
    } catch (error) {
      alert('Error updating appointment status');
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
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">Doctor Portal - Doctor</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Dr. {user?.name || 'Doctor'}</span>
              <span className="text-gray-500">{user?.specialization}</span>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">My Profile</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Consultation Fee:</p>
              <p className="font-medium">₹{user?.fees}</p>
            </div>
            <div>
              <p className="text-gray-600">Availability:</p>
              <p className="font-medium">{user?.availability}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.length === 0 ? (
            <p className="text-gray-500 col-span-full">No appointments yet</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.app_id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">{appointment.patient_name}</h3>
                <p className="text-sm text-gray-600 mb-1">{appointment.email}</p>
                <p className="text-sm text-gray-600 mb-1">{appointment.phone}</p>
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {appointment.date}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Time:</span> {appointment.time}
                  </p>
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleUpdateStatus(appointment.app_id, 'approved')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment.app_id, 'declined')}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {appointment.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(appointment.app_id, 'completed')}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

