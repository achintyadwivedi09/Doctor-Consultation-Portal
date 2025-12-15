"""
Database initialization script
Creates database if it doesn't exist and creates admin user
"""
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from database import Base, engine, SessionLocal
from models import User, UserRole
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Simple password hashing using bcrypt directly (no passlib needed)
def get_password_hash(password: str) -> str:
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "databaseAPY102611*")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "doctor_portal")

# Create database if it doesn't exist
try:
    connection_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/"
    temp_engine = create_engine(connection_url)
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
        conn.commit()
    print(f"Database '{DB_NAME}' created or already exists")
except Exception as e:
    print(f"Error creating database: {e}")

# Create tables
Base.metadata.create_all(bind=engine)
print("Tables created successfully")

# Create default admin user
db = SessionLocal()
try:
    admin_username = "admin"
    existing_admin = db.query(User).filter(User.username == admin_username).first()
    
    if not existing_admin:
        admin_user = User(
            username=admin_username,
            password_hash=get_password_hash("admin123"),
            email="admin@doctorportal.com",
            phone="9876543210",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created: username={admin_username}, password=admin123")
    else:
        print("Admin user already exists")
except Exception as e:
    db.rollback()
    print(f"Error creating admin user: {e}")
finally:
    db.close()

print("Database initialization completed!")

