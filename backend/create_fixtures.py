import os

fixtures_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "test_fixtures")
os.makedirs(fixtures_dir, exist_ok=True)

# 1. Valid leaf sample (minimal valid JPEG)
valid_jpeg = (
    b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
    b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c'
    b'\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $. \",#\x1c\x1c(7),01444\x1f\'9=82<.342'
    b'\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00'
    b'\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00'
    b'\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'
)

with open(os.path.join(fixtures_dir, 'valid_leaf.jpg'), 'wb') as f:
    f.write(valid_jpeg)

# 2. Oversized file (5.5 MB)
with open(os.path.join(fixtures_dir, 'oversized_leaf.jpg'), 'wb') as f:
    f.write(valid_jpeg)
    f.write(b'\x00' * (5500000 - len(valid_jpeg)))

# 3. Invalid format (PDF)
with open(os.path.join(fixtures_dir, 'invalid_file.pdf'), 'wb') as f:
    f.write(b'%PDF-1.4\n%test invalid file\n%%EOF')

print("Fixtures created successfully in:", os.path.abspath(fixtures_dir))
