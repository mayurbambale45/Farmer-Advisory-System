from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import random
import os

app = Flask(__name__)
CORS(app)

from dotenv import load_dotenv
# Load environment variables from the .env file
# Provide the explicit path to .env assuming it's in the root folder one level up.
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# =============================================
# ⚙️  CONFIGURATION — LOADED FROM .ENV
# =============================================

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "agriassist"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "")
}

# --- TWILIO ---
TWILIO_ACCOUNT_SID  = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")
TWILIO_ENABLED      = os.getenv("TWILIO_ENABLED", "False").lower() in ("true", "1", "yes")

# =============================================

# --- CORS ---
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# --- AUTO-CREATE DATABASE IF NOT EXISTS ---
def ensure_database_exists():
    """Connect to default 'postgres' DB and create 'agriassist' if needed."""
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            database="postgres",          # connect to default db to run CREATE DATABASE
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"]
        )
        conn.autocommit = True           # CREATE DATABASE must run outside a transaction
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'agriassist'")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE agriassist")
            print("✅ Database 'agriassist' created automatically!")
        else:
            print("✅ Database 'agriassist' is ready.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"⚠️  Could not auto-create database: {e}")
        print("   → Open pgAdmin and run: CREATE DATABASE agriassist;")

ensure_database_exists()  # Run on every startup

# --- DB CONNECTION ---
def get_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ DB Error: {e}")
        return None

# --- SEND SMS VIA TWILIO ---
def send_sms(phone, otp):
    """
    Sends real SMS via Twilio if enabled, else prints to terminal.
    Phone must be in E.164 format e.g. +919876543210
    """
    if TWILIO_ENABLED:
        try:
            from twilio.rest import Client
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            message = twilio_client.messages.create(
                body=f"AgriAssist OTP: {otp}\nValid for 5 minutes. Do not share.\n- AgriAssist Team",
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            print(f"✅ SMS sent to {phone} | SID: {message.sid}")
            return True, None
        except Exception as e:
            print(f"❌ Twilio Error: {e}")
            return False, str(e)
    else:
        # Demo mode — print to terminal
        print(f"\n📲 [DEMO] OTP for {phone}: {otp}\n")
        return True, None

# --- DB INIT ---
def init_db():
    conn = get_db()
    if not conn:
        print("⚠️  Database not connected. Please create 'agriassist' database in PostgreSQL first.")
        return
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS farmers (
            id           SERIAL PRIMARY KEY,
            phone_number VARCHAR(20) UNIQUE NOT NULL,
            full_name    VARCHAR(100),
            state        VARCHAR(100),
            district     VARCHAR(100),
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS farm_profile (
            id                SERIAL PRIMARY KEY,
            farmer_id         INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
            crop_type         VARCHAR(100),
            soil_type         VARCHAR(100),
            field_size        FLOAT,
            irrigation_method VARCHAR(100),
            updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS otp_log (
            id         SERIAL PRIMARY KEY,
            phone      VARCHAR(20) NOT NULL,
            otp        VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            used       BOOLEAN DEFAULT FALSE
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ agriassist Database Initialized — tables: farmers, farm_profile, otp_log")

init_db()

# In-memory OTP store (phone → otp)
otp_storage = {}

# =============================================
# AUTH ROUTES
# =============================================

@app.route('/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    try:
        data  = request.get_json()
        phone = data.get('phone', '').strip()
        name  = data.get('name', '').strip()
        state = data.get('state', '').strip()

        if not phone or not name:
            return jsonify({"error": "Phone number and Name are required."}), 400
        if len(phone) < 10:
            return jsonify({"error": "Enter a valid phone number."}), 400

        # Normalize: ensure +91 prefix for Indian numbers
        if not phone.startswith("+"):
            phone = "+91" + phone.lstrip("0")

        conn = get_db()
        if not conn:
            return jsonify({"error": "Database not reachable."}), 500
        cur = conn.cursor()

        cur.execute("SELECT id FROM farmers WHERE phone_number = %s", (phone,))
        if cur.fetchone():
            cur.close(); conn.close()
            return jsonify({"error": "Account already exists. Please login."}), 400

        cur.execute(
            "INSERT INTO farmers (phone_number, full_name, state) VALUES (%s, %s, %s) RETURNING id",
            (phone, name, state)
        )
        conn.commit(); cur.close(); conn.close()
        return jsonify({"status": "success", "message": "Account created! You can now login."})

    except Exception as e:
        print(f"❌ Signup Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/auth/send-otp', methods=['POST', 'OPTIONS'])
def send_otp():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    try:
        data  = request.get_json()
        phone = data.get('phone', '').strip()

        if not phone:
            return jsonify({"error": "Phone number is required."}), 400

        # Normalize phone
        if not phone.startswith("+"):
            phone = "+91" + phone.lstrip("0")

        conn = get_db()
        if not conn:
            return jsonify({"error": "Database not reachable."}), 500
        cur = conn.cursor()
        cur.execute("SELECT id FROM farmers WHERE phone_number = %s", (phone,))
        user = cur.fetchone()
        cur.close(); conn.close()

        if not user:
            return jsonify({"error": "Account not found. Please register first."}), 404

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        otp_storage[phone] = otp

        # Send SMS
        success, err = send_sms(phone, otp)
        if not success:
            return jsonify({"error": f"SMS failed: {err}"}), 500

        response_data = {"message": "OTP sent successfully."}
        if not TWILIO_ENABLED:
            # In demo mode — show OTP in response so developer can test
            response_data["demo_otp"] = otp
            response_data["note"] = "DEMO MODE: Twilio not enabled. OTP shown here for testing."

        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Send OTP Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/auth/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    try:
        data     = request.get_json()
        phone    = data.get('phone', '').strip()
        user_otp = data.get('otp', '').strip()

        if not phone.startswith("+"):
            phone = "+91" + phone.lstrip("0")

        stored = otp_storage.get(phone)
        if not stored or stored != user_otp:
            return jsonify({"error": "Invalid or expired OTP. Please try again."}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, full_name, phone_number, state FROM farmers WHERE phone_number = %s", (phone,))
        farmer = cur.fetchone()
        cur.close(); conn.close()

        if not farmer:
            return jsonify({"error": "Farmer record not found."}), 404

        del otp_storage[phone]  # OTP used — remove it

        user_data = {
            "id":    farmer[0],
            "name":  farmer[1],
            "phone": farmer[2],
            "state": farmer[3]
        }
        return jsonify({"status": "success", "message": "Login successful!", "user": user_data})

    except Exception as e:
        print(f"❌ Verify OTP Error: {e}")
        return jsonify({"error": str(e)}), 500


# =============================================
# PROFILE ROUTES
# =============================================

@app.route('/profile/save', methods=['POST', 'OPTIONS'])
def save_profile():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    try:
        data      = request.get_json()
        farmer_id = data.get('farmer_id')
        crop      = data.get('crop', '')
        soil      = data.get('soil', '')
        size      = data.get('size', 0)
        method    = data.get('method', '')

        conn = get_db()
        cur  = conn.cursor()

        cur.execute("SELECT id FROM farm_profile WHERE farmer_id = %s", (farmer_id,))
        if cur.fetchone():
            cur.execute("""
                UPDATE farm_profile
                SET crop_type=%s, soil_type=%s, field_size=%s, irrigation_method=%s, updated_at=NOW()
                WHERE farmer_id=%s
            """, (crop, soil, size, method, farmer_id))
        else:
            cur.execute("""
                INSERT INTO farm_profile (farmer_id, crop_type, soil_type, field_size, irrigation_method)
                VALUES (%s, %s, %s, %s, %s)
            """, (farmer_id, crop, soil, size, method))

        conn.commit(); cur.close(); conn.close()
        return jsonify({"status": "success", "message": "Profile saved!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/profile/<int:farmer_id>', methods=['GET', 'OPTIONS'])
def get_profile(farmer_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "SELECT crop_type, soil_type, field_size, irrigation_method FROM farm_profile WHERE farmer_id=%s",
            (farmer_id,)
        )
        row = cur.fetchone()
        cur.close(); conn.close()

        if row:
            return jsonify({"crop": row[0], "soil": row[1], "size": row[2], "method": row[3]})
        return jsonify({})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "AgriAssist Auth API", "port": 5009})


# =============================================
if __name__ == '__main__':
    mode = "Twilio SMS" if TWILIO_ENABLED else "Demo (terminal OTP)"
    print(f"🚀 AgriAssist Auth API running on Port 5009 | OTP Mode: {mode}")
    app.run(host='0.0.0.0', port=5009, debug=True)