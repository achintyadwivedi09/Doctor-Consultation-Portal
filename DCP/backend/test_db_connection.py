"""
Database Connection Test Script
Run this to verify your MySQL database connection before starting the Flask server
"""
import mysql.connector
from mysql.connector import Error

# Database configuration - Update these values
DB_CONFIG = {
    'host': 'localhost',
    'database': 'dr_portal',
    'user': 'root',
    'password': 'databaseAPY102611*'  # Update with your MySQL password
}

def test_connection():
    """Test database connection and show tables"""
    try:
        print("Attempting to connect to MySQL database...")
        print(f"Host: {DB_CONFIG['host']}")
        print(f"Database: {DB_CONFIG['database']}")
        print(f"User: {DB_CONFIG['user']}")
        print("-" * 50)
        
        conn = mysql.connector.connect(**DB_CONFIG)
        
        if conn.is_connected():
            print("✅ Successfully connected to MySQL database!\n")
            
            cursor = conn.cursor()
            
            # Check if database exists and show tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            if tables:
                print(f"📊 Found {len(tables)} table(s) in database:")
                for table in tables:
                    print(f"   - {table[0]}")
                
                # Check required tables
                required_tables = ['admin', 'doctor', 'patient', 'appointments']
                table_names = [table[0] for table in tables]
                print("\n📋 Checking required tables:")
                for req_table in required_tables:
                    if req_table in table_names:
                        print(f"   ✅ {req_table} - EXISTS")
                    else:
                        print(f"   ❌ {req_table} - MISSING")
                
                # Show sample data counts
                print("\n📈 Data Overview:")
                try:
                    cursor.execute("SELECT COUNT(*) FROM doctor")
                    doctor_count = cursor.fetchone()[0]
                    print(f"   Doctors: {doctor_count}")
                    
                    cursor.execute("SELECT COUNT(*) FROM patient")
                    patient_count = cursor.fetchone()[0]
                    print(f"   Patients: {patient_count}")
                    
                    cursor.execute("SELECT COUNT(*) FROM admin")
                    admin_count = cursor.fetchone()[0]
                    print(f"   Admins: {admin_count}")
                    
                    cursor.execute("SELECT COUNT(*) FROM appointments")
                    app_count = cursor.fetchone()[0]
                    print(f"   Appointments: {app_count}")
                except Error as e:
                    print(f"   ⚠️  Could not read data: {e}")
                    
            else:
                print("⚠️  Database is empty - no tables found!")
                print("   Please run the database_schema.sql file to create tables.")
            
            cursor.close()
            conn.close()
            print("\n✅ Connection test completed successfully!")
            return True
            
    except Error as e:
        print(f"\n❌ Error connecting to MySQL database:")
        print(f"   Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure MySQL server is running")
        print("   2. Check if database 'dr_portal' exists")
        print("   3. Verify username and password in this file")
        print("   4. Check if MySQL is listening on localhost:3306")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("MySQL Database Connection Test")
    print("=" * 50)
    print()
    
    success = test_connection()
    
    if not success:
        print("\n❌ Please fix the connection issues before running the Flask app.")
        exit(1)
    else:
        print("\n✅ You're ready to start the Flask backend!")
        print("   Run: python app.py")

