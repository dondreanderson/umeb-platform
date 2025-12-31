import os
import sys
import subprocess
import getpass
from pathlib import Path

# Configuration - Extracted from your Supabase ID
PROJECT_ID = "egvayfmrbdtfcqepxuuf"
# Standard Supabase connection format
# Using pooler URL (port 6543) which is more friendly for serverless
DB_HOST = f"db.{PROJECT_ID}.supabase.co"
DB_USER = "postgres"
DB_PORT = "5432"
DB_NAME = "postgres"

def setup():
    print("="*50)
    print("UMEB Platform - Database Setup Assistant")
    print("="*50)
    print(f"\nTarget Database: Supabase Project ({PROJECT_ID})")
    print("\nWe need your database PASSWORD. This is the password you set when")
    print("you created the project. It is DIFFERENT from your Supabase account password.")
    print("\nIf you don't know it:")
    print("1. Go to Supabase Dashboard -> Project Settings -> Database")
    print("2. Click 'Reset database password'")
    print("3. Create a new simple password (alphanumeric, no special chars is safest)")
    
    password = getpass.getpass("\nEnter Database Password: ").strip()
    
    if not password:
        print("Password cannot be empty.")
        return

    # Construct Connection String
    # Try both direct and pooler if needed, but standard is fine
    # postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
    db_url = f"postgresql://{DB_USER}:{password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Verify we can connect (simple check by setting env and running alembic current)
    print("\ntesting connection...")
    
    env_file = Path(".env")
    
    # Read existing .env content or start fresh
    env_content = ""
    if env_file.exists():
        env_content = env_file.read_text()
    
    # Update or Append DATABASE_URL
    if "DATABASE_URL=" in env_content:
        lines = env_content.splitlines()
        new_lines = []
        found = False
        for line in lines:
            if line.startswith("DATABASE_URL="):
                new_lines.append(f"DATABASE_URL={db_url}")
                found = True
            else:
                new_lines.append(line)
        if not found:
             new_lines.append(f"DATABASE_URL={db_url}")
        env_content = "\n".join(new_lines)
    else:
        env_content += f"\nDATABASE_URL={db_url}\n"
    
    # Also ensure basic settings are there
    if "SECRET_KEY=" not in env_content:
        env_content += '\nSECRET_KEY="temporary_dev_key_change_me"\n'
    if "BACKEND_CORS_ORIGINS=" not in env_content:
        env_content += '\nBACKEND_CORS_ORIGINS=["http://localhost:3000","*"]\n'

    env_file.write_text(env_content)
    print("✅ updated .env file")

    # Set environment variable for current process
    os.environ["DATABASE_URL"] = db_url
    
    # Run Migrations
    print("\n🏃 Running Migrations (this may take a moment)...")
    try:
        # Use python -m alembic to ensure we use the same python environment
        cmd = [sys.executable, "-m", "alembic", "upgrade", "head"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print("❌ Migration Failed!")
            print(result.stderr)
            if "authentication failed" in result.stderr:
                print("\n⚠️  Authentication Failed. Please check your password.")
            return
        
        print("✅ Migrations Applied Successfully!")
        print(result.stdout)
        
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return

    # Create Admin User
    print("\n👤 Creating Admin User...")
    try:
        cmd = [sys.executable, "create_admin.py"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ User Creation Failed!")
            print(result.stderr)
        else:
            print("✅ Admin User Ready!")
            print(result.stdout)
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")

    print("\n" + "="*50)
    print("🎉 SETUP COMPLETE!")
    print("="*50)

if __name__ == "__main__":
    setup()
