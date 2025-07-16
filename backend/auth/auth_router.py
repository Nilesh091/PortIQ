# auth/auth_router.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth.auth_handler import verify_password, create_access_token
from auth.auth_dependency import get_current_user
from db.mysql_connector import get_mysql_connection
from db.user_repo import create_user, get_user_by_username, get_all_users

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str
    password: str


@router.get("/users")
def get_all_users_endpoint(current_user: str = Depends(get_current_user)):
    """
    Get all users - Admin only endpoint
    """
    # Check if current user is admin
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        users = get_all_users()
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/login")
def login_user(credentials: LoginRequest):
    """
    User login endpoint
    """
    try:
        user = get_user_by_username(credentials.username)
        
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Create access token
        access_token = create_access_token(data={"sub": user["username"]})
        
        # Determine if user is admin
        is_admin = user["username"] == "admin"
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "username": user["username"],
            "is_admin": is_admin,
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/signup")
def signup_user(request: SignupRequest):
    """
    User registration endpoint
    """
    try:
        # Validate input
        if len(request.username) < 3:
            raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
        
        if len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # Check if user already exists
        existing_user = get_user_by_username(request.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        if create_user(request.username, request.password):
            return {"message": "User created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")


@router.get("/profile")
def get_user_profile(current_user: str = Depends(get_current_user)):
    """
    Get current user profile
    """
    try:
        user = get_user_by_username(current_user)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "username": user["username"],
            "is_admin": user["username"] == "admin",
            "created_at": user.get("created_at")  # Handle case where created_at might not exist
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile error: {str(e)}")


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: str = Depends(get_current_user)):
    """
    Delete user - Admin only endpoint
    """
    # Check if current user is admin
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        conn = get_mysql_connection()
        referance_var1 = conn.cursor(dictionary=True)
        
        # Check if user exists
        referance_var1.execute("SELECT username FROM users WHERE id = %s", (user_id,))
        user = referance_var1.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent admin from deleting themselves
        if user["username"] == "admin":
            raise HTTPException(status_code=400, detail="Cannot delete admin user")
        
        # Delete the user
        referance_var1.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        
        referance_var1.close()
        conn.close()
        
        return {"message": f"User {user['username']} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete user error: {str(e)}")
