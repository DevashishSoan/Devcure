import re
output = "FAILED tests/test_app.py::test_a\n1 failed, 1 passed in 0.1s"
failed_tests = re.findall(r'FAILED\s+([\w\.\/:]+)', output)
print(f"Failed tests: {failed_tests}")
failed = len(failed_tests) or len(re.findall(r'FAIL|ERROR', output, re.I))
print(f"Failed count: {failed}")
