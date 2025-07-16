# check_db_structure.py

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def check_db_structure():
    """Check the actual database structure"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "valuefy_assignment"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DB", "wealth_db")
        )
        
        referance_var1 = connection.cursor()
        
        # Check clients table
        print("=== CLIENTS TABLE ===")
        referance_var1.execute("DESCRIBE clients")
        for row in referance_var1.fetchall():
            print(row)
        
        print("\n=== PORTFOLIOS TABLE ===")
        referance_var1.execute("DESCRIBE portfolios")
        for row in referance_var1.fetchall():
            print(row)
        
        print("\n=== INVESTMENTS TABLE ===")
        referance_var1.execute("DESCRIBE investments")
        for row in referance_var1.fetchall():
            print(row)
        
        # Check if tables have data
        print("\n=== DATA COUNT ===")
        referance_var1.execute("SELECT COUNT(*) FROM clients")
        print(f"Clients: {referance_var1.fetchone()[0]}")
        
        referance_var1.execute("SELECT COUNT(*) FROM portfolios")
        print(f"Portfolios: {referance_var1.fetchone()[0]}")
        
        referance_var1.execute("SELECT COUNT(*) FROM investments")
        print(f"Investments: {referance_var1.fetchone()[0]}")
        
    except mysql.connector.Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            referance_var1.close()
            connection.close()

if __name__ == "__main__":
    check_db_structure() 