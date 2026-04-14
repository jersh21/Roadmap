import time
import random

def generate_random_wisdom():
    quotes = [
        "To debug is human, to forgive is divine.",
        "Code never lies, comments sometimes do.",
        "A program is like a poem: it's never finished, only abandoned.",
        "When in doubt, print('Here')."
    ]
    print(f"Loading wisdom... [{(random.random() * 100):.1f}%]")
    time.sleep(1)
    print("--- WISDOM OF THE DAY ---")
    print(random.choice(quotes))

if __name__ == "__main__":
    generate_random_wisdom()
