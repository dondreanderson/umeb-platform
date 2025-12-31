import os
import sys

import traceback
from fastapi import FastAPI, Response

# Add the backend directory to sys.path so 'import app' works
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

try:
    from main import app
except Exception as e:
    # If the app fails to start (e.g. DB connection, missing env vars), 
    # create a fallback app that just prints the error.
    app = FastAPI()
    error_msg = f"Failed to start backend:\n{traceback.format_exc()}"
    
    @app.get("/{path:path}")
    def catch_all(path: str):
        return Response(content=error_msg, media_type="text/plain", status_code=500)
