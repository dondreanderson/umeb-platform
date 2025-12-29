import sys
import os
sys.path.append(os.getcwd())
try:
    from main import app
    print('Backend import successful')
except Exception as e:
    print(f'Backend import failed: {e}')
    import traceback
    import traceback
    with open("verification_log.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Error written to verification_log.txt")
