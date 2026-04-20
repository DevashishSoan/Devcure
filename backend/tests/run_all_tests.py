import pytest
import sys
import os

if __name__ == "__main__":
    # Add backend to path
    sys.path.append(os.path.abspath("."))
    
    # Run all tests in the tests directory
    retcode = pytest.main(["-v", "tests"])
    sys.exit(retcode)
