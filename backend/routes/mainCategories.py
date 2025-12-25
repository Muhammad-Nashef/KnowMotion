from flask import Blueprint, request, jsonify
from models.db import get_db_connection
main_bp = Blueprint("main", __name__)

# route to get all main categories
@main_bp.route("/main-categories", methods=["GET"])
#@app.get("/main-categories")
def get_main_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM main_categories;")
        main_categories = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(main_categories)
    except Exception as e:
        return jsonify({"error": str(e)})