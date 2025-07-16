# db/schema_setup.py

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def setup_wealth_db_schema():
    """Setup the wealth management database schema"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "valuefy_assignment"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DB", "wealth_db")
        )
        
        referance_var1 = connection.cursor()
        
        # Create clients table
        referance_var1.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                address TEXT,
                risk_appetite VARCHAR(50),
                relationship_manager VARCHAR(100)
            )
        """)
        
        # Create portfolios table
        referance_var1.execute("""
            CREATE TABLE IF NOT EXISTS portfolios (
                id INT PRIMARY KEY AUTO_INCREMENT,
                client_id INT,
                total_value DECIMAL(15, 2) DEFAULT 0.00,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
            )
        """)
        
        # Create investments table
        referance_var1.execute("""
            CREATE TABLE IF NOT EXISTS investments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                portfolio_id INT,
                asset_name VARCHAR(100) NOT NULL,
                quantity DECIMAL(10, 2) DEFAULT 0.00,
                market_value DECIMAL(15, 2) DEFAULT 0.00,
                FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
            )
        """)
        
        # Insert sample data
        insert_sample_data(referance_var1)
        
        connection.commit()
        print("Database schema created successfully!")
        
    except mysql.connector.Error as e:
        print(f"Error creating schema: {e}")
    finally:
        if connection.is_connected():
            referance_var1.close()
            connection.close()

def insert_sample_data(referance_var1):
    """Insert sample data for testing"""
    try:
        # Insert sample clients
        clients_data = [
            ("John Smith", "123 Main St, New York, NY", "Moderate", "Sarah Johnson"),
            ("Emma Wilson", "456 Oak Ave, Los Angeles, CA", "Conservative", "Mike Davis"),
            ("Nikesh Sahoo", "789 Pine Rd, San Francisco, CA", "Aggressive", "Lisa Chen"),
            ("Maria Garcia", "321 Elm St, Chicago, IL", "Moderate", "David Brown"),
            ("Robert Johnson", "654 Maple Dr, Boston, MA", "Conservative", "Amy Wilson")
        ]
        
        referance_var1.executemany("""
            INSERT IGNORE INTO clients (name, address, risk_appetite, relationship_manager)
            VALUES (%s, %s, %s, %s)
        """, clients_data)
        
        # Insert sample portfolios
        portfolios_data = [
            (1, 1250000.00),
            (2, 850000.00),
            (3, 2100000.00),
            (4, 675000.00),
            (5, 950000.00)
        ]
        
        referance_var1.executemany("""
            INSERT IGNORE INTO portfolios (client_id, total_value)
            VALUES (%s, %s)
        """, portfolios_data)
        
        # Insert sample investments (matching actual schema)
        investments_data = [
            (1, "Apple Inc.", 100, 17500.00),
            (1, "Microsoft Corp.", 50, 18750.00),
            (1, "Vanguard S&P 500 ETF", 200, 95000.00),
            (1, "Gold ETF", 500, 25000.00),
            (2, "Tesla Inc.", 25, 6250.00),
            (2, "Amazon.com Inc.", 30, 4500.00),
            (2, "Bond Fund", 1000, 80000.00),
            (3, "Tesla Inc.", 500, 125000.00),
            (3, "Apple Inc.", 300, 52500.00),
            (3, "Google LLC", 100, 15000.00),
            (3, "Real Estate ETF", 1000, 150000.00),
            (4, "Johnson & Johnson", 75, 11250.00),
            (4, "Procter & Gamble", 100, 15000.00),
            (5, "Berkshire Hathaway", 10, 350000.00),
            (5, "Coca-Cola Co.", 200, 10000.00)
        ]
        
        referance_var1.executemany("""
            INSERT IGNORE INTO investments (portfolio_id, asset_name, quantity, market_value)
            VALUES (%s, %s, %s, %s)
        """, investments_data)
        
        print("Sample data inserted successfully!")
        
    except mysql.connector.Error as e:
        print(f"Error inserting sample data: {e}")

if __name__ == "__main__":
    setup_wealth_db_schema() 