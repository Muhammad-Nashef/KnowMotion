from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from flask_bcrypt import Bcrypt
#from flask_jwt_extended import create_access_token
from config import Config
from datetime import datetime, timedelta
import jwt

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()


""""
@auth_bp.route("/login", methods=["POST"])
# route for user login
#@app.route("/api/login", methods=["POST"])
def login():

    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(
        identity={"id": user['id'],"username": username ,"role": user['role']},
        expires_delta=timedelta(hours=2)
    )
    print( "Generated Token:", token )
    print( "User Role:", user['role'] )
    return jsonify({"token": token, "role": user['role']})"""

@auth_bp.route("/login", methods=["POST"])
# route for user login
#@app.route("/api/login", methods=["POST"])
def login():

    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
    "id": user['id'],
    "username": user['username'],
    "role": user['role'],
    "exp": datetime.utcnow() + timedelta(hours=2)
}, Config.SECRET_KEY, algorithm="HS256")
    print( "Generated Token:", token )
    print( "User Role:", user['role'] )
    return jsonify({"token": token, "role": user['role']})