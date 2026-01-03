import sys

def analyze():
    print("Analyzing logs...")
    try:
        # Try different encodings
        content = ""
        for enc in ['utf-16', 'utf-16-le', 'utf-8', 'cp1252']:
            try:
                with open('debug_full.txt', 'r', encoding=enc) as f:
                    content = f.read()
            break
        except Exception:
            continue
    
    if not content:
        print("Could not read file.")
        return

    lines = content.splitlines()
    found = False
    for line in lines:
        if "API Response:" in line or "Error Body:" in line or "LocalStorage Token:" in line or "API URL:" in line or "API Status:" in line:
            print(line.strip())
            found = True
        
        if not found:
            print("No API logs found in output.")
            # Print last 20 lines for context
            print("\n--- Last 20 lines ---")
            for line in lines[-20:]:
                print(line.strip())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze()
