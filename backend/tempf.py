from flask import Flask
from flask_bcrypt import Bcrypt

app = Flask(__name__)
bcrypt = Bcrypt(app)

# The password you want to set for your single user
password = "Admin@$123"

# Generate the hash
#password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

#print("Password hash:", password_hash)

print(bcrypt.check_password_hash('$2b$12$WiDqWTTKCc1e1JFegnWHxuFXVltJRHSWec/ez8VgEj8sjlicE.7Y.', password))
 