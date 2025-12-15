import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Stethoscope, Users, Shield } from 'lucide-react'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard'
      case 'doctor':
        return '/doctor/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login?register=true"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Health, Our Priority
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book appointments with experienced doctors, consult online, and manage your health records all in one place.
          </p>
          {!isAuthenticated && (
            <Link
              to="/login?register=true"
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Platform?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <Calendar className="h-12 w-12 text-primary-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
            <p className="text-gray-600">
              Book appointments with your preferred doctor in just a few clicks.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <Stethoscope className="h-12 w-12 text-primary-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Expert Doctors</h4>
            <p className="text-gray-600">
              Consult with certified and experienced healthcare professionals.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <Users className="h-12 w-12 text-primary-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Online Consultation</h4>
            <p className="text-gray-600">
              Get medical advice from the comfort of your home.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <Shield className="h-12 w-12 text-primary-600 mb-4" />
            <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
            <p className="text-gray-600">
              Your medical records are encrypted and kept confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2024 Doctor Appointment Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home

