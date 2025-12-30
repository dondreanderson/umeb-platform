import os
import sys

# Add the backend directory to sys.path so 'import app' works
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
