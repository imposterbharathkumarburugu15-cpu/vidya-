import sys
sys.path.insert(0, 'backend')

with open('backend/app/mock_db.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see what mock_db.py has in detail
print("Loaded mock_db.py successfully, length:", len(text))

