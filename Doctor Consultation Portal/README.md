
## Features

- **Role-Based Access Control**: Separate dashboards for Patients, Doctors, and Admins
- **Patient Features**:
  - Book appointments with doctors
  - View appointment history
  - Search and filter doctors by specialization and location
  - View medical records
  
- **Doctor Features**:
  - View and manage appointments
  - Update availability schedule
  - Confirm, complete, or cancel appointments
  
- **Admin Features**:
  - Manage all users and doctors
  - Create doctor profiles
  - View system statistics
  - Toggle user active/inactive status

- **Security**:
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based route protection

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- React Toastify
- Lucide React Icons
- Vite

### Backend
- FastAPI
- SQLAlchemy (ORM)
- PyMySQL (MySQL driver)
- Python-JOSE (JWT tokens)
- Passlib (Password hashing)
- Pydantic (Data validation)

### Database
- MySQL

## Prerequisites

- Node.js 18+ installed
- Python 3.10+ installed
- MySQL installed and running
- VS Code (recommended) or any IDE

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Doctor Consultation Portal"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (copy from .env.example)
# Update database credentials
# On Windows (PowerShell):
Copy-Item .env.example .env
# On macOS/Linux:
cp .env.example .env

# Edit .env file with your MySQL credentials:
# DB_USER=root
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=doctor_portal
# SECRET_KEY=your-secret-key-change-this-in-production

# Initialize database
python init_db.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Start the Application

#### Start Backend Server

```bash
# From backend directory
python main.py
# Or use uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

#### Start Frontend Server

```bash
# From frontend directory
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Admin Credentials

After running `init_db.py`, you can login with:
- **Email**: admin@doctorportal.com
- **Password**: admin123

⚠️ **Important**: Change the admin password in production!

## Usage Guide

### For Patients

1. Register/Login as a patient
2. Search for doctors by specialization or location
3. Select a doctor and book an appointment
4. View appointment history and medical records

### For Doctors

1. Register/Login as a doctor (must be approved by admin)
2. Admin creates doctor profile with specialization, location, etc.
3. View appointments and manage them (confirm, complete, cancel)
4. Update availability schedule

### For Admins

1. Login with admin credentials
2. View system statistics on dashboard
3. Manage users (activate/deactivate)
4. Create doctor profiles for registered doctor users
5. View all appointments

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Doctors
- `GET /api/doctors` - List all available doctors (with search filters)
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/doctors/me/profile` - Get current doctor's profile
- `PUT /api/doctors/me/availability` - Update doctor availability
- `POST /api/doctors` - Create doctor profile (Admin only)

### Appointments
- `GET /api/appointments` - List appointments (role-based)
- `GET /api/appointments/{id}` - Get appointment details
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/{id}/status` - Update appointment status
- `DELETE /api/appointments/{id}` - Cancel appointment

### Consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/{id}` - Get consultation details
- `POST /api/consultations/{id}/start` - Start consultation
- `POST /api/consultations/{id}/end` - End consultation

### Medical Records
- `GET /api/medical-records` - List medical records
- `POST /api/medical-records` - Create medical record (Doctor only)

### Admin
- `GET /api/admin/users` - List all users (Admin only)
- `PUT /api/admin/users/{id}/toggle-active` - Toggle user status
- `GET /api/admin/stats` - Get system statistics

## Project Structure

```
Doctor Consultation Portal/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── init_db.py           # Database initialization script
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## Troubleshooting

### Database Connection Issues

1. Ensure MySQL is running
2. Check database credentials in `.env` file
3. Verify database exists (run `init_db.py`)

### Port Already in Use

- Backend: Change port in `main.py` or use `uvicorn main:app --port 8001`
- Frontend: Change port in `vite.config.js`

### CORS Issues

Ensure backend CORS settings in `main.py` include your frontend URL.

### Module Not Found Errors

- Backend: Ensure virtual environment is activated and dependencies installed
- Frontend: Run `npm install` again

## Development Notes

- The application uses JWT tokens stored in localStorage
- Database tables are auto-created on first run
- Admin user is created automatically via `init_db.py`
- All passwords are hashed using bcrypt

## Production Deployment

Before deploying to production:

1. Change `SECRET_KEY` in `.env`
2. Update CORS origins in `main.py`
3. Use environment variables for all sensitive data
4. Set up proper database with strong credentials
5. Enable HTTPS
6. Configure proper error logging
7. Set up database backups

## License

This project is created for educational purposes.

## Support

For issues or questions, please create an issue in the repository.

