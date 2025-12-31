import sys
from sqlalchemy import create_engine, text

password = "V1WNwKFzfjSPkIPH"
user = "postgres.egvayfmrbdtfcqepxuuf"
host = "aws-0-us-east-1.pooler.supabase.com"
ports = [5432, 6543]

log_file = open("db_test_log.txt", "w")

for port in ports:
    db_url = f"postgresql://{user}:{password}@{host}:{port}/postgres"
    print(f"Testing port {port}...", file=log_file)
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print(f"✅ SUCCESS on port {port}!", file=log_file)
            # break if successful? no, let's see both
    except Exception as e:
        print(f"❌ FAIL on port {port}: {e}", file=log_file)

log_file.close()
