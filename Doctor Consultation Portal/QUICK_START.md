# Quick Start Guide

## Prerequisites Checklist

- [ ] MySQL installed and running
- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed

## Step-by-Step Setup

### 1. Database Setup

Make sure MySQL is running and you know your:
- MySQL username (usually `root`)
- MySQL password
- MySQL port (usually `3306`)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy .env.example to .env and update credentials
# Windows (PowerShell):
Copy-Item .env.example .env
# macOS/Linux:
cp .env.example .env

# Edit .env file with your MySQL credentials
# DB_USER=root
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=doctor_portal
# SECRET_KEY=your-secret-key

# Initialize database (creates tables and admin user)
python init_db.py
```

### 3. Start Backend Server

```bash
# Make sure you're in backend directory with venv activated
python main.py
```

Backend should be running on `http://localhost:8000`

### 4. Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should be running on `http://localhost:3000`

### 5. Access the Application

1. Open browser: `http://localhost:3000`
2. Login with admin credentials:
   - Email: `admin@doctorportal.com`
   - Password: `admin123`

## Creating Test Users

### Option 1: Via Frontend
1. Click "Sign Up" on the home page
2. Register as Patient or Doctor
3. Login with new credentials

### Option 2: Via Admin Dashboard
1. Login as admin
2. Users can register themselves
3. Admin creates doctor profiles for doctor users

## Creating a Doctor Profile

1. Register a user with role "doctor"
2. Login as admin
3. Go to "Doctors" tab in admin dashboard
4. Fill in doctor profile form:
   - Select the doctor user
   - Enter specialization, experience, qualification
   - Set location, consultation fee, availability
5. Click "Create Doctor Profile"

## Testing the Application

### Patient Flow
1. Register/Login as patient
2. Search for doctors
3. Book an appointment
4. View appointment history
5. View medical records

### Doctor Flow
1. Register/Login as doctor
2. Admin creates your doctor profile
3. View appointments
4. Confirm/Complete/Cancel appointments
5. Update availability

### Admin Flow
1. Login as admin
2. View dashboard statistics
3. Manage users (activate/deactivate)
4. Create doctor profiles
5. View all appointments

## Common Issues

### "Module not found" errors
- Backend: Ensure venv is activated and dependencies installed
- Frontend: Run `npm install` again

### Database connection errors
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database exists (run `init_db.py`)

### CORS errors
- Ensure backend is running on port 8000
- Check frontend proxy settings in `vite.config.js`

### Port already in use
- Backend: Change port in `main.py` or use `uvicorn main:app --port 8001`
- Frontend: Change port in `vite.config.js`

## Next Steps

- Customize the UI styling
- Add more features as needed
- Set up production deployment
- Configure email notifications
- Add payment integration (if needed)

## Support

Refer to the main `README.md` for detailed documentation.

