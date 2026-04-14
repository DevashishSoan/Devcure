from calculator import add, multiply

def test_add():
    assert add(2, 3) == 5     # will FAIL

def test_multiply():
    assert multiply(3, 4) == 12  # will PASS — regression canary
