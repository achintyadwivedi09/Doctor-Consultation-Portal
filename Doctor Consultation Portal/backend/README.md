# Backend API - Doctor Appointment Portal

FastAPI-based backend for the Doctor Appointment Portal.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doctor_portal
SECRET_KEY=your-secret-key
```

3. Initialize database:
```bash
python init_db.py
```

4. Run the server:
```bash
python main.py
# Or
uvicorn main:app --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Models

- **User**: Users (patients, doctors, admins)
- **Doctor**: Doctor profiles with specialization, location, availability
- **Appointment**: Patient appointments with doctors
- **Consultation**: Online consultation sessions
- **MedicalRecord**: Patient medical records

## Authentication

The API uses JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

