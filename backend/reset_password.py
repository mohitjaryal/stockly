from getpass import getpass
from app.db.session import SessionLocal
from app.models import User
from app.core.security import hash_password

email = input("Enter registered email: ").strip().lower()
new_password = getpass("Enter new password: ")
confirm_password = getpass("Confirm new password: ")

if new_password != confirm_password:
    print("Passwords do not match!")
    raise SystemExit(1)

if len(new_password) < 8:
    print("Password must be at least 8 characters.")
    raise SystemExit(1)

db = SessionLocal()

try:
    user = db.query(User).filter(User.email == email).first()

    if not user:
        print("Account not found in this database.")
    else:
        user.password_hash = hash_password(new_password)
        db.commit()
        print("Password reset successful!")
finally:
    db.close()
