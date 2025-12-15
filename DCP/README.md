# Doctor Appointment Booking Portal

A full-stack web application for booking doctor appointments with role-based access for Admin, Doctor, and Patient users.

## Technology Stack

- **Frontend**: React.js v18+
- **Backend**: Python Flask
- **Database**: MySQL (dr_portal)
- **Styling**: TailwindCSS (via CDN)

## Features

- User Authentication (Login/Signup) for Admin, Doctor, and Patient
- Patient Portal: Browse doctors, book appointments, view/cancel appointments
- Doctor Portal: View appointments, approve/decline requests, mark as completed
- Admin Portal: Manage doctors and view all appointments

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v20+) installed
2. **Python** (v3.12) installed
3. **MySQL** (v8.0) installed and running
4. Database `dr_portal` created with required tables

## Setup Instructions

### 1. Database Setup

Make sure your MySQL database `dr_portal` is created with the following tables:
- `admin` (admin_id, username, password)
- `doctor` (doctor_id, name, specialization, email, password, availability, fees)
- `patient` (patient_id, name, email, password, age, gender, phone)
- `appointments` (app_id, doctor_id, patient_id, date, time, status)
- `feedback` (feedback_id, user_id, message, rating) - optional

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Update database credentials in `backend/app.py`:
   - Open `backend/app.py`
   - Find the `DB_CONFIG` dictionary
   - Update `'user'` and `'password'` with your MySQL credentials

4. Start the Flask server:
   ```bash
   python app.py
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Usage

1. **For Patients:**
   - Sign up or login as a patient
   - Browse available doctors
   - Book appointments by selecting date and time
   - View and cancel pending appointments

2. **For Doctors:**
   - Sign up or login as a doctor
   - View appointment requests
   - Approve or decline appointments
   - Mark appointments as completed

3. **For Admin:**
   - Login with admin credentials
   - View all doctors and appointments
   - Remove doctor accounts if needed

## Default Admin Credentials

Make sure you have an admin account in your database. The admin login expects:
- Username: (whatever you set in the admin table)
- Password: (stored in plain text - update backend to hash if needed)

## Project Structure

```
DCP/
├── backend/
│   ├── app.py                 # Flask API server
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Auth context
│   │   └── App.js             # Main app component
│   └── package.json
└── README.md
```

## Notes

- The backend uses Flask sessions for authentication
- Passwords are hashed using bcrypt (except admin for simplicity)
- CORS is enabled for local development
- Update the secret key in `app.py` for production use

## Troubleshooting

1. **Database Connection Error:**
   - Verify MySQL is running
   - Check database credentials in `backend/app.py`
   - Ensure database `dr_portal` exists

2. **Port Already in Use:**
   - Backend uses port 5000, frontend uses port 3000
   - Change ports if needed

3. **Module Not Found:**
   - Run `pip install -r requirements.txt` again
   - Or `npm install` in frontend directory

## Author

Created for Full Stack Web Development Course

