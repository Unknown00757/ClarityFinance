"""
Database Seed Script

Populates SQLite database with demo user credentials, default categories,
realistic multi-month transactions, and category budgets.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.utils.security import get_password_hash

def seed_database():
    print("[*] Initializing Database Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    print("[*] Creating Demo User (demo@finance.com / password123)...")
    demo_user = User(
        name="Praneesh",
        email="demo@finance.com",
        password_hash=get_password_hash("password123"),
        currency="₹",
        date_format="MMM DD, YYYY",
        theme="light"
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    print("[*] Creating Default Categories...")
    category_data = [
        {"name": "Salary", "icon": "💰", "type": "income"},
        {"name": "Freelance", "icon": "💻", "type": "income"},
        {"name": "Food", "icon": "🍔", "type": "expense"},
        {"name": "Transportation", "icon": "🚗", "type": "expense"},
        {"name": "Shopping", "icon": "🛍️", "type": "expense"},
        {"name": "Bills", "icon": "💡", "type": "expense"},
        {"name": "Entertainment", "icon": "🎮", "type": "expense"},
        {"name": "Health", "icon": "❤️", "type": "expense"},
        {"name": "Education", "icon": "📚", "type": "expense"},
        {"name": "Travel", "icon": "✈️", "type": "expense"},
        {"name": "Other", "icon": "📦", "type": "expense"},
    ]

    cat_map = {}
    for c_info in category_data:
        c = Category(
            user_id=demo_user.id,
            name=c_info["name"],
            icon=c_info["icon"],
            type=c_info["type"]
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        cat_map[c.name] = c.id

    print("[*] Creating Realistic Sample Transactions...")
    transactions_list = [
        # September 2026 Transactions (Current Month)
        (65000.0, "income", cat_map["Salary"], "Monthly Tech Salary + Bonus", "2026-09-01", "Bank Transfer", "Direct Deposit"),
        (18000.0, "income", cat_map["Freelance"], "Full-Stack Web App Development", "2026-09-08", "UPI", "Client Retainer"),
        (4800.0, "expense", cat_map["Food"], "September Supermarket Groceries", "2026-09-03", "Debit Card", "Stockup"),
        (2200.0, "expense", cat_map["Transportation"], "Fuel & Parking", "2026-09-05", "UPI", "Gas refill"),
        (3100.0, "expense", cat_map["Bills"], "September Electricity & WiFi", "2026-09-09", "UPI", "Monthly utilities"),
        (4500.0, "expense", cat_map["Shopping"], "Mechanical Keyboard & Mouse", "2026-09-12", "Credit Card", "Setup upgrade"),
        (1400.0, "expense", cat_map["Entertainment"], "Weekend Dining & Cinema", "2026-09-14", "UPI", "Outing"),
        (1800.0, "expense", cat_map["Health"], "Monthly Pharmacy & Supplements", "2026-09-15", "Debit Card", "Health care"),

        # August 2026 Transactions
        (60000.0, "income", cat_map["Salary"], "Monthly Tech Salary", "2026-08-01", "Bank Transfer", "Direct Deposit"),
        (15000.0, "income", cat_map["Freelance"], "UI UX Design Consulting", "2026-08-10", "UPI", "Client Payment"),
        (350.0, "expense", cat_map["Food"], "Lunch at Chipotle", "2026-08-02", "UPI", "Team lunch"),
        (1200.0, "expense", cat_map["Food"], "Grocery Supermarket Run", "2026-08-05", "Debit Card", "Weekly groceries"),
        (450.0, "expense", cat_map["Transportation"], "Uber Ride to Office", "2026-08-06", "UPI", "Morning commute"),
        (2500.0, "expense", cat_map["Bills"], "Electricity & Water Bill", "2026-08-08", "UPI", "Utility bill"),
        (1800.0, "expense", cat_map["Shopping"], "Nike Running Shoes", "2026-08-11", "Credit Card", "Monsoon sale discount"),
        (650.0, "expense", cat_map["Food"], "Dinner with Friends", "2026-08-12", "UPI", "Italian diner"),
        (1499.0, "expense", cat_map["Bills"], "Broadband Internet Monthly", "2026-08-14", "UPI", "Fiber net"),
        (1200.0, "expense", cat_map["Health"], "Annual Dental Checkup", "2026-08-15", "Credit Card", "Routine check"),
        (850.0, "expense", cat_map["Food"], "Weekend Groceries & Snacks", "2026-08-18", "Debit Card", "Organic veggies"),
        (3500.0, "expense", cat_map["Shopping"], "Ergonomic Office Chair", "2026-08-20", "Credit Card", "Workplace upgrade"),
        (600.0, "expense", cat_map["Entertainment"], "PVR Movie Tickets & Popcorn", "2026-08-22", "UPI", "Weekend movie"),
        (1800.0, "expense", cat_map["Transportation"], "Monthly Metro Pass", "2026-08-25", "Debit Card", "Transit pass"),
        (420.0, "expense", cat_map["Food"], "Artisanal Coffee & Pastry", "2026-08-27", "UPI", "Coffee meeting"),
        (1100.0, "expense", cat_map["Food"], "Zomato Dinner Delivery", "2026-08-30", "UPI", "Weekend feast"),

        # July 2026 Transactions
        (60000.0, "income", cat_map["Salary"], "Monthly Tech Salary", "2026-07-01", "Bank Transfer", "Direct Deposit"),
        (7200.0, "expense", cat_map["Food"], "July Total Food & Groceries", "2026-07-15", "Debit Card", "Monthly food sum"),
        (3200.0, "expense", cat_map["Transportation"], "July Metro & Fuel", "2026-07-18", "UPI", "Commute cost"),
        (5400.0, "expense", cat_map["Shopping"], "Clothing & Tech Accessories", "2026-07-22", "Credit Card", "Mid-year sale"),
        (2400.0, "expense", cat_map["Bills"], "July Utilities & Phone", "2026-07-25", "UPI", "Bills payment"),
        (1500.0, "expense", cat_map["Entertainment"], "Concert Pass & Gaming", "2026-07-28", "UPI", "Live show"),

        # June 2026 Transactions
        (58000.0, "income", cat_map["Salary"], "Monthly Tech Salary", "2026-06-01", "Bank Transfer", "Direct Deposit"),
        (6800.0, "expense", cat_map["Food"], "June Groceries & Dining", "2026-06-14", "Debit Card", "Food expenses"),
        (2800.0, "expense", cat_map["Transportation"], "Fuel & Parking", "2026-06-19", "UPI", "Transit"),
    ]

    for amt, tx_type, cat_id, desc, date_val, pay_method, notes in transactions_list:
        db.add(Transaction(
            user_id=demo_user.id,
            category_id=cat_id,
            amount=amt,
            type=tx_type,
            description=desc,
            date=date_val,
            payment_method=pay_method,
            notes=notes
        ))
    db.commit()

    print("[*] Creating Active Category Budgets...")
    budgets_list = [
        (cat_map["Food"], 10000.0, "2026-09-01", "2026-09-30"),
        (cat_map["Transportation"], 5000.0, "2026-09-01", "2026-09-30"),
        (cat_map["Shopping"], 8000.0, "2026-09-01", "2026-09-30"),
        (cat_map["Bills"], 6000.0, "2026-09-01", "2026-09-30"),
    ]

    for cat_id, b_amt, s_date, e_date in budgets_list:
        db.add(Budget(
            user_id=demo_user.id,
            category_id=cat_id,
            amount=b_amt,
            start_date=s_date,
            end_date=e_date
        ))
    db.commit()
    db.close()
    print("[+] Database Seeded Successfully! User: demo@finance.com / password123")

if __name__ == "__main__":
    seed_database()
