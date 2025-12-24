from flask import Flask, jsonify, request
import mysql.connector
import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
import cloudinary_config
import cloudinary

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
bcrypt = Bcrypt(app)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
def get_db_connection():
    # Placeholder for database connection logic
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
@app.get("/main-categories")
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
    
@app.get("/sub-category-details/<int:sub_category_id>")
def get_sub_category_details(sub_category_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT sc.*, mc.name AS main_category_name
            FROM sub_categories sc
            JOIN main_categories mc ON sc.main_category_id = mc.id
            WHERE sc.id = %s;
        """, (sub_category_id,))
        sub_category = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify(sub_category)
    except Exception as e:
        return jsonify({"error": str(e)})
    
"""@app.get("/sub_categories")
def get_sub_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM sub_categories;")
        sub_categories = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(sub_categories)
    except Exception as e:
        return jsonify({"error": str(e)})"""

@app.get("/sub-categories/<int:main_category_id>")
def get_sub_categories(main_category_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # get main category details
        cursor.execute("""
                       SELECT name
                       FROM main_categories
                       WHERE id = %s
                       """, (main_category_id,))
        main_category = cursor.fetchone()
        
        # get sub categories for a specific main category
        cursor.execute("""
            SELECT *
            FROM sub_categories
            WHERE main_category_id = %s
        """, (main_category_id,))

        sub_categories = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "main_category": main_category,
            "sub_categories": sub_categories
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
""""
@app.get("/subjects")
def get_subjects():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM subjects;")
        subjects = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(subjects)
    except Exception as e:
        return jsonify({"error": str(e)})
"""
@app.get("/questions/by-sub-category/<int:sub_category_id>")
def get_questions_by_sub_category(sub_category_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, question_text, img_url
        FROM questions
        WHERE sub_category_id = %s
    """, (sub_category_id,))
    questions = cursor.fetchall()

    for question in questions:
        cursor.execute("""
            SELECT id, answer_text
            FROM answers
            WHERE question_id = %s
        """, (question["id"],))
        question["answers"] = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(questions)

    
@app.get("/questions/by-main-category/<int:main_category_id>")
def get_questions_by_main_category(main_category_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT q.id, q.question_text, img_url
            FROM questions q
            JOIN sub_categories sc ON q.sub_category_id = sc.id
            WHERE sc.main_category_id = %s;
        """
        cursor.execute(query, (main_category_id,))
        questions = cursor.fetchall()

        for question in questions:
            cursor.execute("""
                SELECT id, answer_text, is_correct
                FROM answers
                WHERE question_id = %s
            """, (question["id"],))
            question["answers"] = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(questions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500   

@app.post("/answers/check")
def check_answer():
    data = request.json
    question_id = data["question_id"]
    answer_id = data["answer_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1️⃣ Check if selected answer is correct
    cursor.execute("""
        SELECT is_correct
        FROM answers
        WHERE id = %s AND question_id = %s
    """, (answer_id, question_id))

    selected = cursor.fetchone()

    if not selected:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid answer"}), 400

    # 2️⃣ Always fetch the correct answer id
    cursor.execute("""
        SELECT id
        FROM answers
        WHERE question_id = %s AND is_correct = 1
        LIMIT 1
    """, (question_id,))

    correct_answer = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "correct": bool(selected["is_correct"]),
        "correct_answer_id": correct_answer["id"]
    })

@app.route("/all-subcategories")
def get_subcategories():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1️⃣ Execute
    cursor.execute("SELECT id, name, main_category_id FROM sub_categories")
    subs = cursor.fetchall()

    data = []
    for sub in subs:
        cursor.execute(
            "SELECT COUNT(*) AS total FROM questions WHERE sub_category_id = %s",
            (sub["id"],)
        )
        total = cursor.fetchone()["total"]

        data.append({
            "id": sub["id"],
            "name": sub["name"],
            "main_category_id": sub["main_category_id"],
            "total": total
        })

    cursor.close()
    conn.close()

    return jsonify(data)

@app.route("/subcategories/<int:sub_id>/questions")
def get_questions(sub_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get questions
    cursor.execute("""
        SELECT id, question_text, img_url
        FROM questions
        WHERE sub_category_id = %s
    """, (sub_id,))
    questions = cursor.fetchall()

    # Attach answers to each question
    for q in questions:
        cursor.execute("""
            SELECT id, answer_text, is_correct
            FROM answers
            WHERE question_id = %s
        """, (q["id"],))
        q["answers"] = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(questions)

@app.route("/questions/update", methods=["POST"])
def update_questions():
    data = request.json
    questions = data["questions"]
    deleted_ids = data["deletedQuestionIds"]

    conn = get_db_connection()
    cursor = conn.cursor()

    # 🗑 DELETE QUESTIONS
    if deleted_ids:
        cursor.execute(
            f"DELETE FROM answers WHERE question_id IN ({','.join(['%s'] * len(deleted_ids))})",
            deleted_ids
        )
        cursor.execute(
            f"DELETE FROM questions WHERE id IN ({','.join(['%s'] * len(deleted_ids))})",
            deleted_ids
        )

    # 🔄 INSERT / UPDATE QUESTIONS
    for q in questions:
        if q.get("id") is None:
            cursor.execute("""
                INSERT INTO questions (sub_category_id, question_text, img_url)
                VALUES (%s, %s, %s)
            """, (
                q["sub_category_id"],
                q["question_text"],
                q.get("img_url")
            ))
            question_id = cursor.lastrowid
        else:
            question_id = q["id"]
            cursor.execute("""
                UPDATE questions
                SET question_text = %s, img_url = %s
                WHERE id = %s
            """, (
                q["question_text"],
                q.get("img_url"),
                question_id
            ))

        for a in q["answers"]:
            if a.get("id") is None:
                cursor.execute("""
                    INSERT INTO answers (question_id, answer_text, is_correct)
                    VALUES (%s, %s, %s)
                """, (
                    question_id,
                    a["answer_text"],
                    a["is_correct"]
                ))
            else:
                cursor.execute("""
                    UPDATE answers
                    SET answer_text = %s, is_correct = %s
                    WHERE id = %s
                """, (
                    a["answer_text"],
                    a["is_correct"],
                    a["id"]
                ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True})

@app.route("/subcategories/create", methods=["POST"])
def create_subcategory():
    data = request.json

    name = data["name"]
    image_url = data.get("image_url", "")
    image_public_id = data.get("image_public_id", None)
    main_category_id = data["main_category_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sub_categories (main_category_id, name, image_url, image_public_id)
        VALUES (%s, %s, %s, %s)
    """, (main_category_id, name, image_url, image_public_id))

    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "name": name, "image_url": image_url,"image_public_id": image_public_id,  "total": 0})


"""
@app.route("/delete-image", methods=["POST"])
def delete_image():
    data = request.get_json()
    public_id = data.get("public_id")

    if not public_id:
        return jsonify({"error": "public_id is required"}), 400

    try:
        result = cloudinary.uploader.destroy(public_id)

        if result.get("result") != "ok":
            return jsonify({
                "error": "Delete failed",
                "details": result
            }), 400

        return jsonify({
            "message": "Image deleted successfully",
            "result": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500"""
    

@app.delete("/subcategories/<int:sub_id>")
def delete_subcategory(sub_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1️⃣ Get image public_id first
    cursor.execute(
        "SELECT image_public_id FROM sub_categories WHERE id = %s",
        (sub_id,)
    )
    sub = cursor.fetchone()

    if not sub:
        return {"error": "Sub-category not found"}, 404

    image_public_id = sub["image_public_id"]

    # 2️⃣ Delete image from Cloudinary
    if image_public_id:
        try:
            cloudinary.uploader.destroy(image_public_id)
        except Exception as e:
            print("Cloudinary delete failed:", e)

    # 3️⃣ Delete from database
    cursor.execute(
        "DELETE FROM sub_categories WHERE id = %s",
        (sub_id,)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return {"success": True}

"""
@app.delete("/subcategories/<int:sub_id>")
def delete_subcategory(sub_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM sub_categories WHERE id = %s", (sub_id,))
    conn.commit()

    return {"success": True}"""


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    print("dataLogin:")
    print(data)
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
        "role": user['role'],
        "exp": datetime.utcnow() + timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"token": token, "role": user['role']})


"""
@app.get("/test")
def test():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()[0]
        return {"message": "Connected successfully!", "database": db_name}
    except Exception as e:
        return {"error": str(e)}"""





if __name__ == "__main__":
    app.run(debug=True)
