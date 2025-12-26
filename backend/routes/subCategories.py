from flask import Blueprint, request, jsonify
from models.db import get_db_connection
from utils.decorators import admin_required
from utils.cloudinary_utils import delete_image
sub_bp = Blueprint("subcategories", __name__)


# route to get sub-category details by id
@sub_bp.route("/sub-category-details/<int:sub_category_id>")
#@app.get("/sub-category-details/<int:sub_category_id>")
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
    

@sub_bp.route("/sub-categories/<int:main_category_id>")
# route to get sub-categories for a specific main category
#@app.get("/sub-categories/<int:main_category_id>")
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
    

# route to get all sub-categories with question counts
@sub_bp.route("/all-subcategories")
@admin_required
#@app.route("/all-subcategories")
def get_subcategories():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    #Execute
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

@sub_bp.route("/subcategories/create", methods=["POST"])
@admin_required
# route to create a new sub-category
#@app.route("/subcategories/create", methods=["POST"])
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

@sub_bp.route("/subcategories/<int:sub_id>", methods=["DELETE"])
@admin_required
# route to delete a sub-category
#@app.delete("/subcategories/<int:sub_id>")
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

    delete_image(sub["image_public_id"])

    #Delete from database
    cursor.execute(
        "DELETE FROM sub_categories WHERE id = %s",
        (sub_id,)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return {"success": True}