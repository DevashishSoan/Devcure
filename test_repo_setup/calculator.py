# calculator.py — intentional bug: wrong operator
def add(a, b):
    return a - b          # bug: should be a + b

def multiply(a, b):
    return a * b          # correct, should stay passing
