import sys
import os
from sqlalchemy import create_engine, text

# Try to connect and print specific error
# current URL from .env (reconstructed)
db_url = "postgresql://postgres.egvayfmrbdtfcqepxuuf:V1WNwKFzfjSPkIPH@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

print(f"Testing connection to: {db_url.split('@')[1]}") # hide password

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Connection Successful!")
except Exception as e:
    print(f"❌ Connection Failed:\n{e}")
