import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Stethoscope } from 'lucide-react'

const Login = () => {
  const [searchParams] = useSearchParams()
  const isRegister = searchParams.get('register') === 'true'
  const navigate = useNavigate()
  const { login, register, isAuthenticated, user } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPaths = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard',
      }
      navigate(dashboardPaths[user.role] || '/')
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    let value = e.target.value
    // Only allow digits for phone number
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10)
    }
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isRegister) {
        await register(formData)
        toast.success('Registration successful! Please login.')
        navigate('/login')
      } else {
        const userData = await login(formData.username, formData.password)
        const dashboardPaths = {
          patient: '/patient/dashboard',
          doctor: '/doctor/dashboard',
          admin: '/admin/dashboard',
        }
        toast.success('Login successful!')
        navigate(dashboardPaths[userData.role] || '/')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister
              ? 'Sign up to get started'
              : 'Sign in to your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username / ID
            </label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required={isRegister}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (10 digits)
                </label>
                <input
                  name="phone"
                  type="tel"
                  required={isRegister}
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 10 digit Indian phone number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
          >
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="text-center">
            <Link
              to={isRegister ? '/login' : '/login?register=true'}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

