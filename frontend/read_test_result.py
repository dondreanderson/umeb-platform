import json
import sys
import os

try:
    content = None
    for enc in ['utf-16', 'utf-16-le', 'utf-8']:
        try:
            with open('prod_test_success.json', 'r', encoding=enc) as f:
                content = f.read()
                data = json.loads(content)
                break
        except Exception:
            continue
            
    if data is None:
        print("Failed to read file with any encoding")
        sys.exit(1)
    
    for suite in data.get('suites', []):
        for subsuite in suite.get('suites', []):
            for spec in subsuite.get('specs', []):
                for test in spec.get('tests', []):
                    for result in test.get('results', []):
                        if result.get('status') == 'failed':
                            print(f"FAILED TEST: {spec.get('title')}")
                            errors = result.get('errors', [])
                            for error in errors:
                                print(f"ERROR: {error.get('message')}")
                            sys.exit(1)
    
    print("ALL TESTS PASSED")
except Exception as e:
    print(f"Failed to read result: {e}")
