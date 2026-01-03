import json
import sys
import os

try:
    with open('prod_test_retry.json', 'r', encoding='utf-16-le') as f:
        data = json.load(f)
    
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
