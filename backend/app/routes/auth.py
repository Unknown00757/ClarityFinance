from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut, UserUpdate
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Default system categories to seed for every new registered user
DEFAULT_CATEGORIES = [
    {"name": "Food", "icon": "🍔", "type": "expense"},
    {"name": "Transportation", "icon": "🚗", "type": "expense"},
    {"name": "Shopping", "icon": "🛍️", "type": "expense"},
    {"name": "Bills & Utilities", "icon": "💡", "type": "expense"},
    {"name": "Entertainment", "icon": "🎮", "type": "expense"},
    {"name": "Health", "icon": "❤️", "type": "expense"},
    {"name": "Education", "icon": "📚", "type": "expense"},
    {"name": "Travel", "icon": "✈️", "type": "expense"},
    {"name": "Salary", "icon": "💰", "type": "income"},
    {"name": "Freelance", "icon": "💻", "type": "income"},
    {"name": "Investments", "icon": "📈", "type": "income"},
    {"name": "Other", "icon": "📦", "type": "expense"},
]

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hashed_pwd
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed default categories for user
    for cat in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user.id, name=cat["name"], icon=cat["icon"], type=cat["type"]))
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
def login_json(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.currency is not None:
        current_user.currency = user_update.currency
    if user_update.date_format is not None:
        current_user.date_format = user_update.date_format
    if user_update.theme is not None:
        current_user.theme = user_update.theme
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out."}
