import sys
import os
# Add backend to path
sys.path.append(os.getcwd())

from app.core.security import get_password_hash

email = "admin@example.com"
password = "admin123"
hashed = get_password_hash(password)

sql = f"""
-- Create Admin User
INSERT INTO "user" (email, hashed_password, full_name, is_superuser, role, is_active)
VALUES ('{email}', '{hashed}', 'Admin User', true, 'admin', true)
ON CONFLICT (email) DO NOTHING;
"""
print(sql)
