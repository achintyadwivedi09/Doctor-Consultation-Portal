from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime, time
from models import UserRole, AppointmentStatus, ConsultationType
import re

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.PATIENT
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        # Indian phone format: exactly 10 digits
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Phone number must be exactly 10 digits')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Doctor Schemas
class DoctorBase(BaseModel):
    specialization: str
    experience_years: int
    qualification: str
    bio: Optional[str] = None
    consultation_fee: float
    location: str
    available_from: time
    available_to: time

class DoctorCreate(DoctorBase):
    user_id: int

class DoctorResponse(DoctorBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    is_available: bool
    created_at: datetime
    user: UserResponse

# Appointment Schemas
class AppointmentBase(BaseModel):
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    doctor_id: int

class AppointmentResponse(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    patient_id: int
    doctor_id: int
    status: AppointmentStatus
    notes: Optional[str] = None
    created_at: datetime
    patient: UserResponse
    doctor: DoctorResponse

# Consultation Schemas
class ConsultationBase(BaseModel):
    consultation_type: ConsultationType
    notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    appointment_id: int

class ConsultationResponse(ConsultationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    appointment_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str
    created_at: datetime

# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    test_results: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    patient_id: int
    doctor_id: Optional[int] = None
    appointment_id: Optional[int] = None

class MedicalRecordResponse(MedicalRecordBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    appointment_id: Optional[int] = None
    record_date: datetime
    created_at: datetime

# Search Schemas
class DoctorSearch(BaseModel):
    specialization: Optional[str] = None
    location: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None

