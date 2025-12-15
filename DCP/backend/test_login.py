"""
Test Login Script
Test if password hashing and verification works correctly
"""
import mysql.connector
from mysql.connector import Error
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Database configuration - Update these values
DB_CONFIG = {
    'host': 'localhost',
    'database': 'dr_portal',
    'user': 'root',
    'password': 'databaseAPY102611*'
}

def test_login(email, password, user_type='patient'):
    """Test login with given credentials"""
    try:
        print("=" * 50)
        print(f"Testing Login for {user_type}")
        print("=" * 50)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("-" * 50)
        
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        if user_type == 'patient':
            cursor.execute("SELECT patient_id, name, email, password, age, gender, phone FROM patient WHERE email = %s", (email,))
        elif user_type == 'doctor':
            cursor.execute("SELECT doctor_id, name, email, password, specialization, fees, availability FROM doctor WHERE email = %s", (email,))
        else:
            print("Invalid user type")
            return
        
        user = cursor.fetchone()
        
        if not user:
            print("❌ User not found in database!")
            print(f"   Check if email '{email}' exists")
            return
        
        print(f"✅ User found: {user[1]} (ID: {user[0]})")
        stored_password = user[3]  # password is at index 3
        print(f"   Stored hash: {stored_password[:30]}...")
        
        # Test password verification
        print("\nTesting password verification...")
        try:
            is_valid = bcrypt.check_password_hash(stored_password, password)
            if is_valid:
                print("✅ Password verification: SUCCESS")
                print("   Login should work!")
                print("\n📋 User Details:")
                print(f"   ID: {user[0]}")
                print(f"   Name: {user[1]}")
                print(f"   Email: {user[2]}")
                if user_type == 'patient':
                    print(f"   Age: {user[4]}")
                    print(f"   Gender: {user[5]}")
                    print(f"   Phone: {user[6]}")
            else:
                print("❌ Password verification: FAILED")
                print("   The password you entered doesn't match the stored hash")
                print("\n💡 Possible issues:")
                print("   1. Wrong password entered")
                print("   2. Password was hashed incorrectly during registration")
                
                # Try to re-hash to see if it matches
                print("\n🔄 Testing re-hash...")
                new_hash = bcrypt.generate_password_hash(password).decode('utf-8')
                print(f"   New hash: {new_hash[:30]}...")
                if bcrypt.check_password_hash(new_hash, password):
                    print("   ✅ New hash works with current password")
                    print("   💡 The original hash might be corrupted or from different password")
        except Exception as e:
            print(f"❌ Error during password verification: {e}")
        
        cursor.close()
        conn.close()
        
    except Error as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    print("\n🔍 Login Test Script\n")
    
    # Test with your credentials
    email = input("Enter email: ").strip()
    password = input("Enter password: ").strip()
    user_type = input("Enter user type (patient/doctor) [default: patient]: ").strip() or 'patient'
    
    test_login(email, password, user_type)

