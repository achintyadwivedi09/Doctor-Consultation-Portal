from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time
from typing import List, Optional
from database import get_db, engine, Base
from models import User, Doctor, Appointment, Consultation, MedicalRecord, UserRole, AppointmentStatus, ConsultationType
from schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    DoctorCreate, DoctorResponse,
    AppointmentCreate, AppointmentResponse,
    ConsultationCreate, ConsultationResponse,
    MedicalRecordCreate, MedicalRecordResponse,
    DoctorSearch
)
from auth import (
    get_current_user, get_current_patient, get_current_doctor, get_current_admin,
    create_access_token, verify_password, get_password_hash
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Doctor Appointment Portal API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {
        "message": "Doctor Appointment Portal API",
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api"
    }

# ==================== AUTHENTICATION ====================

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if username exists
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Check if email exists
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate password
        if not user_data.password or len(user_data.password.strip()) == 0:
            raise HTTPException(status_code=400, detail="Password cannot be empty")
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username,
            password_hash=hashed_password,
            email=user_data.email,
            phone=user_data.phone,
            role=user_data.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except HTTPException:
        db.rollback()
        raise
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== DOCTOR ENDPOINTS ====================

@app.post("/api/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor_data: DoctorCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Verify user exists and is a doctor
    user = db.query(User).filter(User.id == doctor_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="User must be a doctor")
    
    # Check if doctor profile already exists
    existing_doctor = db.query(Doctor).filter(Doctor.user_id == doctor_data.user_id).first()
    if existing_doctor:
        raise HTTPException(status_code=400, detail="Doctor profile already exists")
    
    new_doctor = Doctor(**doctor_data.dict())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

@app.get("/api/doctors", response_model=List[DoctorResponse])
def get_doctors(
    specialization: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Doctor).join(User).filter(User.is_active == True, Doctor.is_available == True)
    
    if specialization:
        query = query.filter(Doctor.specialization.like(f"%{specialization}%"))
    if location:
        query = query.filter(Doctor.location.like(f"%{location}%"))
    
    doctors = query.all()
    return doctors

@app.get("/api/doctors/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@app.get("/api/doctors/me/profile", response_model=DoctorResponse)
def get_my_doctor_profile(current_user: User = Depends(get_current_doctor), db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor

@app.put("/api/doctors/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    doctor_data: DoctorCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    for key, value in doctor_data.dict(exclude={'user_id'}).items():
        setattr(doctor, key, value)
    
    db.commit()
    db.refresh(doctor)
    return doctor

@app.put("/api/doctors/me/availability")
def update_availability(
    is_available: bool,
    available_from: Optional[time] = None,
    available_to: Optional[time] = None,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    try:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        doctor.is_available = is_available
        if available_from:
            doctor.available_from = available_from
        if available_to:
            doctor.available_to = available_to
        
        db.commit()
        return {"message": "Availability updated successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.delete("/api/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        db.delete(doctor)
        db.commit()
        return {"message": "Doctor deleted successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# ==================== APPOINTMENT ENDPOINTS ====================

@app.post("/api/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    try:
        # Verify doctor exists
        doctor = db.query(Doctor).filter(Doctor.id == appointment_data.doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        if not doctor.is_available:
            raise HTTPException(status_code=400, detail="Doctor is not available")
        
        # Check if doctor is available at requested time
        appointment_time = appointment_data.appointment_date.time()
        if appointment_time < doctor.available_from or appointment_time > doctor.available_to:
            raise HTTPException(status_code=400, detail="Doctor is not available at this time")
        
        # Check for conflicting appointments
        conflicting = db.query(Appointment).filter(
            Appointment.doctor_id == appointment_data.doctor_id,
            Appointment.appointment_date == appointment_data.appointment_date,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
        ).first()
        if conflicting:
            raise HTTPException(status_code=400, detail="Time slot already booked")
        
        new_appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=appointment_data.doctor_id,
            appointment_date=appointment_data.appointment_date,
            reason=appointment_data.reason,
            status=AppointmentStatus.PENDING
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        return new_appointment
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Appointment creation failed: {str(e)}")

@app.get("/api/appointments", response_model=List[AppointmentResponse])
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        appointments = db.query(Appointment).filter(Appointment.patient_id == current_user.id).all()
    elif current_user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            appointments = db.query(Appointment).filter(Appointment.doctor_id == doctor.id).all()
        else:
            appointments = []
    else:  # ADMIN
        appointments = db.query(Appointment).all()
    
    return appointments

@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check permissions
    if current_user.role == UserRole.PATIENT and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    return appointment

@app.put("/api/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    new_status: AppointmentStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Check permissions
        if current_user.role == UserRole.PATIENT:
            if appointment.patient_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
            if new_status not in [AppointmentStatus.CANCELLED]:
                raise HTTPException(status_code=403, detail="Patients can only cancel appointments")
        elif current_user.role == UserRole.DOCTOR:
            doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor or appointment.doctor_id != doctor.id:
                raise HTTPException(status_code=403, detail="Not authorized")
            if new_status not in [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
                raise HTTPException(status_code=400, detail="Invalid status for doctor")
        
        appointment.status = new_status
        db.commit()
        return {"message": "Appointment status updated successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.delete("/api/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Check permissions
        if current_user.role == UserRole.PATIENT and appointment.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if current_user.role == UserRole.DOCTOR:
            doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
            if not doctor or appointment.doctor_id != doctor.id:
                raise HTTPException(status_code=403, detail="Not authorized")
        
        appointment.status = AppointmentStatus.CANCELLED
        db.commit()
        return {"message": "Appointment cancelled successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cancel failed: {str(e)}")

# ==================== CONSULTATION ENDPOINTS ====================

@app.post("/api/consultations", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == consultation_data.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check permissions
    if current_user.role == UserRole.PATIENT and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if consultation already exists
    existing = db.query(Consultation).filter(Consultation.appointment_id == consultation_data.appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Consultation already exists")
    
    new_consultation = Consultation(
        appointment_id=consultation_data.appointment_id,
        consultation_type=consultation_data.consultation_type,
        notes=consultation_data.notes,
        status="scheduled"
    )
    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)
    return new_consultation

@app.get("/api/consultations/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(consultation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    # Check permissions via appointment
    appointment = consultation.appointment
    if current_user.role == UserRole.PATIENT and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    return consultation

@app.post("/api/consultations/{consultation_id}/start")
def start_consultation(consultation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    consultation.start_time = datetime.utcnow()
    consultation.status = "in_progress"
    db.commit()
    return {"message": "Consultation started", "start_time": consultation.start_time}

@app.post("/api/consultations/{consultation_id}/end")
def end_consultation(consultation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    consultation.end_time = datetime.utcnow()
    consultation.status = "completed"
    db.commit()
    return {"message": "Consultation ended", "end_time": consultation.end_time}

# ==================== MEDICAL RECORDS ====================

@app.post("/api/medical-records", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_medical_record(
    record_data: MedicalRecordCreate,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    try:
        new_record = MedicalRecord(**record_data.dict())
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Medical record creation failed: {str(e)}")

@app.put("/api/medical-records/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    record_id: int,
    record_data: MedicalRecordCreate,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        
        for key, value in record_data.dict().items():
            setattr(record, key, value)
        
        db.commit()
        db.refresh(record)
        return record
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.delete("/api/medical-records/{record_id}")
def delete_medical_record(
    record_id: int,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    try:
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        
        db.delete(record)
        db.commit()
        return {"message": "Medical record deleted successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@app.get("/api/medical-records", response_model=List[MedicalRecordResponse])
def get_medical_records(
    patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT:
        records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == current_user.id).all()
    elif current_user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor and patient_id:
            records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).all()
        else:
            records = []
    else:  # ADMIN
        if patient_id:
            records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).all()
        else:
            records = db.query(MedicalRecord).all()
    
    return records

# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_all_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.put("/api/admin/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}

@app.get("/api/admin/stats")
def get_admin_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.PENDING).count()
    completed_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.COMPLETED).count()
    
    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "completed_appointments": completed_appointments
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

