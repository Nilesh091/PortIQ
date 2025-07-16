from db.mysql_connector import get_mysql_connection
from auth.auth_handler import hash_password
from datetime import datetime


def create_user(username: str, password: str) -> bool:
    conn = get_mysql_connection()
    referance_var1 = conn.cursor()
    try:
        password_hash = hash_password(password)
        created_at = datetime.now()
        
        # Try to insert with created_at field first
        try:
            referance_var1.execute(
                "INSERT INTO users (username, password_hash, created_at) VALUES (%s, %s, %s)",
                (username, password_hash, created_at)
            )
        except Exception:
            # If created_at column doesn't exist, insert without it
            referance_var1.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                (username, password_hash)
            )
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error creating user: {e}")
        return False
    finally:
        referance_var1.close()
        conn.close()


def get_user_by_username(username: str):
    """Get user by username"""
    conn = get_mysql_connection()
    referance_var1 = conn.cursor(dictionary=True)
    try:
        referance_var1.execute("SELECT * FROM users WHERE username = %s", (username,))
        return referance_var1.fetchone()
    except Exception as e:
        print(f"Error getting user: {e}")
        return None
    finally:
        referance_var1.close()
        conn.close()


def get_all_users():
    """Get all users (admin only)"""
    conn = get_mysql_connection()
    referance_var1 = conn.cursor(dictionary=True)
    try:
        referance_var1.execute("SELECT id, username, created_at FROM users")
        return referance_var1.fetchall()
    except Exception as e:
        print(f"Error getting users: {e}")
        return []
    finally:
        referance_var1.close()
        conn.close()
