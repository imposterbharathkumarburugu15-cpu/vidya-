import sys
sys.path.insert(0, 'backend')

with open('backend/app/mock_db.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Check what needs to be added
print("Length of mock_db.py:", len(content))

