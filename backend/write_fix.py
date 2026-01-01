import bcrypt

password = b"admin123"
hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')

sql = f"""UPDATE "user" SET hashed_password = '{hashed}' WHERE email = 'admin@example.com';"""

with open("fix_password.sql", "w") as f:
    f.write(sql)

print("SQL written to fix_password.sql")
