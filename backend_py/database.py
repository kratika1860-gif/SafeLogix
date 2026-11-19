import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

DB_PATH = os.path.join(os.path.dirname(__file__), "safelogix_corridor.db")
POSTGRES_URL = os.getenv("DATABASE_URL", "postgres://kratikagupta@127.0.0.1:5432/safelogix")

def get_postgres_connection():
    if not HAS_PSYCOPG2:
        return None
    try:
        conn = psycopg2.connect(POSTGRES_URL, connect_timeout=3)
        return conn
    except Exception:
        return None

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # 1. Initialize SQLite Database
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_name TEXT NOT NULL,
        contact_number TEXT,
        hazard_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL UNIQUE,
        precision_score REAL NOT NULL,
        recall_score REAL NOT NULL,
        f1_score REAL NOT NULL,
        accuracy_score REAL NOT NULL,
        confusion_matrix TEXT NOT NULL,
        feature_importance TEXT,
        split_details TEXT NOT NULL,
        trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weather_cache (
        location_key TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rain_1h_mm REAL NOT NULL,
        rain_24h_mm REAL NOT NULL,
        rain_3day_mm REAL NOT NULL,
        temperature_c REAL NOT NULL,
        wind_speed_kmh REAL NOT NULL,
        weather_description TEXT NOT NULL,
        forecast_hourly_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

    # 2. Sync / check PostgreSQL tables
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("""
                CREATE TABLE IF NOT EXISTS landslide_predictions (
                    id SERIAL PRIMARY KEY,
                    corridor_name VARCHAR(100) NOT NULL,
                    avg_risk_score REAL NOT NULL,
                    critical_segments_count INT NOT NULL,
                    recommended_route VARCHAR(255) NOT NULL,
                    weather_scenario JSONB NOT NULL,
                    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)
                cur.execute("""
                CREATE TABLE IF NOT EXISTS villages_relief_queue (
                    id SERIAL PRIMARY KEY,
                    village_name VARCHAR(120) NOT NULL,
                    population INT NOT NULL,
                    priority_supply_index REAL NOT NULL,
                    disconnection_risk_pct REAL NOT NULL,
                    remaining_stock_days REAL NOT NULL,
                    delivery_mode VARCHAR(100) NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)
            pg_conn.commit()
            pg_conn.close()
        except Exception as e:
            print("[Database] PostgreSQL init notice:", e)

def seed_25_field_reports():
    """Seeds 28 realistic field reports spanning NH-10 and key access roads with dates, locations and categories."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM field_reports;")
    count = cursor.fetchone()[0]

    if count < 20:
        cursor.execute("DELETE FROM field_reports;")
        base_time = datetime.now()

        seed_data = [
            ("BRO Patrol Officer Subba", "+91 98320 44102", "Landslide", "CRITICAL", "Mile 27 near Rambi (NH-10)", 27.1761, 88.5287, "Massive mud and boulder slip from cliff face. Highway completely blocked both ways. BRO JCB dozers on site.", "ACTIVE", (base_time - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Driver Tashi Lepcha", "+91 94340 18290", "Waterlogging", "WARNING", "Singtam Teesta Basin Approach (NH-10)", 27.2344, 88.4988, "Teesta river overflow pooling 1.5 ft water across NH-10 riverbank bend. Light vehicles losing traction.", "ACTIVE", (base_time - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Gangtok Commuter Anita Rai", "+91 89721 55034", "Damaged Road", "MODERATE", "Pani House / Deorali Curve (Gangtok)", 27.3341, 88.6083, "Heavy subsidence and potholes created after torrential downpour. Right lane restricted.", "ACTIVE", (base_time - timedelta(hours=11)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Sikkim Police Highway Patrol", "+91 98001 92831", "Road Blocked", "HIGH", "4th Mile Rongli Cutoff", 27.1954, 88.6115, "Tarmac collapse and rock scree blocking single lane. Diversion signboards installed.", "ACTIVE", (base_time - timedelta(hours=18)).strftime("%Y-%m-%d %H:%M:%S")),
            ("BRO Commander R. Sharma", "+91 94341 00234", "Landslide", "CRITICAL", "Pangthang North Corridor", 27.3383, 88.6069, "Substantial hill slip blocking North Sikkim Highway access towards Mangan. 400m stretch covered in debris.", "ACTIVE", (base_time - timedelta(days=1, hours=2)).strftime("%Y-%m-%d %H:%M:%S")),
            ("SNT Truck Driver P. Pradhan", "+91 97330 88219", "Damaged Road", "MODERATE", "Ranipool Bridge East", 27.2912, 88.5942, "Deep asphalt cracks on bridge approach ramp. Heavy multi-axle trucks restricted to 10 km/h.", "ACTIVE", (base_time - timedelta(days=1, hours=8)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Local Resident Karma Bhutia", "+91 98000 12390", "Waterlogging", "WARNING", "Berdang Riverside NH-10", 27.2010, 88.5140, "Drainage culvert choked with tree logs. Mountain creek water flooding road shoulder.", "ACTIVE", (base_time - timedelta(days=1, hours=15)).strftime("%Y-%m-%d %H:%M:%S")),
            ("GREF Engineer V. Nair", "+91 94342 99182", "Rockfall", "HIGH", "Setipool Canyon Cut", 27.2750, 88.5720, "Intermittent stone fall from 50m overhang. Safety netting deployed by PWD.", "ACTIVE", (base_time - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Ambulance Driver Sonam", "+91 97331 44520", "Road Blocked", "CRITICAL", "Dikchu River Bridge Jct", 27.3710, 88.5420, "Flash slurry slide closed road connection between Singtam and Dikchu power plant.", "ACTIVE", (base_time - timedelta(days=2, hours=6)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Rangpo Checkpost Officer", "+91 98322 11099", "Waterlogging", "MODERATE", "Rangpo Teesta Confluence", 27.1725, 88.5295, "Riverbank backflow inundating lower parking depot. Commercial trucks redirected to higher terrace.", "RESOLVED", (base_time - timedelta(days=2, hours=14)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Taxi Driver Lhakpa", "+91 94343 55210", "Landslide", "HIGH", "Tathangchen Ward Gangtok", 27.3390, 88.6065, "Retaining wall failed behind Kamala Gas agency. Debris pushed onto vehicular passage.", "ACTIVE", (base_time - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")),
            ("PWD Road Inspector Chettri", "+91 98002 77123", "Damaged Road", "WARNING", "Martam Bypass Ridge", 27.2550, 88.5380, "Shoulder erosion caused by prolonged rainfall seepage. Road narrowed to 3.5m.", "ACTIVE", (base_time - timedelta(days=3, hours=10)).strftime("%Y-%m-%d %H:%M:%S")),
            ("BRO 758 BRTF Patrol", "+91 94344 66100", "Landslide", "CRITICAL", "Rolep Hill Approach", 27.1748, 88.6458, "Multiple debris chutes activated during pre-dawn storm. 7 houses damaged nearby.", "RESOLVED", (base_time - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Supply Convoy Leader M. Gurung", "+91 97332 88411", "Road Blocked", "HIGH", "Singtam-Mangan Link Rd", 27.3773, 88.5590, "Mudslide blocking heavy vehicle movement towards North district headquarters.", "ACTIVE", (base_time - timedelta(days=4, hours=12)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Villager Dawa Tshering", "+91 98323 44001", "Rockfall", "MODERATE", "Baluakhani Cliff (Gangtok)", 27.3410, 88.6180, "Small boulder shower cracked passenger taxi windshield. Commuters advised to wear helmets.", "RESOLVED", (base_time - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Indian Army Logistics Corps", "+91 94345 11980", "Damaged Road", "HIGH", "Pakyong Airport Link Road", 27.2380, 88.5850, "Culvert displacement due to groundwater pressure. 15-ton load restriction enforced.", "ACTIVE", (base_time - timedelta(days=5, hours=16)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Sikkim Milk Union Driver", "+91 98003 55120", "Waterlogging", "WARNING", "Majhitar Industrial Zone", 27.1890, 88.5080, "Industrial storm drain backup flooding highway carriageway with 8 inches of silt.", "ACTIVE", (base_time - timedelta(days=6)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Civil Defence Volunteer Rai", "+91 97333 77210", "Landslide", "CRITICAL", "Nam Nang Precipice (Gangtok)", 27.3220, 88.6087, "Rock scree and tree fall directly above capital access road. Traffic stopped at Deorali.", "ACTIVE", (base_time - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Forest Guard K. Tamang", "+91 98324 88190", "Damaged Road", "MODERATE", "Samdur Forest Belt NH-10", 27.2810, 88.5830, "Tree roots dislodged upper road edge. Guard rails suspended in midair.", "ACTIVE", (base_time - timedelta(days=8)).strftime("%Y-%m-%d %H:%M:%S")),
            ("BRO Heavy Equipment Operator", "+91 94346 33201", "Road Blocked", "HIGH", "Rangpo North River Wall", 27.1850, 88.5350, "Silt deposits from hill stream accumulating faster than earthmover clearing rate.", "ACTIVE", (base_time - timedelta(days=9)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Driver Norden", "+91 98004 99120", "Rockfall", "WARNING", "5th Mile Rongli Highway", 27.2010, 88.6200, "Sharp shale stones littering curves. Two flat tires reported.", "RESOLVED", (base_time - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S")),
            ("SDRF Search Unit Team 2", "+91 97334 22100", "Landslide", "CRITICAL", "Rhodong Village Sector", 27.3425, 88.6236, "Slope slip affecting 30m road base and 2 rural households. Evacuation corridor secured.", "ACTIVE", (base_time - timedelta(days=12)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Local Trader B. K. Agarwal", "+91 98325 66099", "Waterlogging", "WARNING", "Singtam Main Bazaar Turn", 27.2360, 88.4970, "Slurry accumulation 10 inches deep. Passenger traffic diverted through upper link.", "RESOLVED", (base_time - timedelta(days=14)).strftime("%Y-%m-%d %H:%M:%S")),
            ("National Highway Authority Eng", "+91 94347 88200", "Damaged Road", "MODERATE", "Tadong College Gate NH-10", 27.3150, 88.6010, "Continuous water seepage resulting in asphalt rutting and washboarding.", "RESOLVED", (base_time - timedelta(days=16)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Gangtok Municipal Patrol", "+91 98005 11234", "Landslide", "HIGH", "Daragaon Residential Descent", 27.3392, 88.6188, "Hill cutting failure above connecting street. Residential traffic barred.", "ACTIVE", (base_time - timedelta(days=18)).strftime("%Y-%m-%d %H:%M:%S")),
            ("BRO Swastik QRT", "+91 97335 44090", "Road Blocked", "CRITICAL", "Mile 27 Rambi (Repeat Event)", 27.1765, 88.5285, "Secondary breach after continuous 48-hr precipitation. Rock breaker deployed.", "ACTIVE", (base_time - timedelta(days=21)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Medical Courier D. Sharma", "+91 98326 77123", "Waterlogging", "LOW", "Ranipool Riverfront", 27.2880, 88.5920, "Surface ponding during downpour. Cleared within 2 hours by natural discharge.", "RESOLVED", (base_time - timedelta(days=24)).strftime("%Y-%m-%d %H:%M:%S")),
            ("Sikkim Police Post Singtam", "+91 94348 22190", "Landslide", "CRITICAL", "Ranka Road Cut", 27.3370, 88.6090, "Mudflow inundated roadway. Passenger bus stranded for 4 hours before BRO rescue.", "RESOLVED", (base_time - timedelta(days=28)).strftime("%Y-%m-%d %H:%M:%S"))
        ]

        cursor.executemany("""
        INSERT INTO field_reports (reporter_name, contact_number, hazard_type, severity, location_name, latitude, longitude, description, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_data)

        conn.commit()
    conn.close()

def save_field_report(name: str, contact: str, hazard_type: str, severity: str, location_name: str, lat: float, lon: float, desc: str) -> Dict[str, Any]:
    # 1. Save to SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO field_reports (reporter_name, contact_number, hazard_type, severity, location_name, latitude, longitude, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    """, (name, contact, hazard_type, severity, location_name, lat, lon, desc))
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # 2. Sync to PostgreSQL if connected
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("""
                INSERT INTO field_reports (reporter_name, contact_number, hazard_type, severity, location_name, latitude, longitude, description, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
                """, (name, contact, hazard_type, severity, location_name, lat, lon, desc))
            pg_conn.commit()
            pg_conn.close()
        except Exception:
            pass

    return {
        "id": report_id,
        "reporter_name": name,
        "hazard_type": hazard_type,
        "severity": severity,
        "location_name": location_name,
        "latitude": lat,
        "longitude": lon,
        "description": desc,
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat()
    }

def get_field_reports(limit: int = 50) -> List[Dict[str, Any]]:
    # Try PostgreSQL first
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                SELECT id, reporter_name, contact_number, hazard_type, severity, location_name, latitude, longitude, description, status, created_at
                FROM field_reports
                ORDER BY id DESC LIMIT %s
                """, (limit,))
                rows = cur.fetchall()
            pg_conn.close()
            if rows:
                return [dict(r) for r in rows]
        except Exception:
            pass

    # Fallback to SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, reporter_name, contact_number, hazard_type, severity, location_name, latitude, longitude, description, status, created_at
    FROM field_reports
    ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_model_metrics(model_name: str, precision: float, recall: float, f1: float, accuracy: float, confusion_mat: List[List[int]], feature_imp: Optional[Dict[str, float]], split_details: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO model_metrics (model_name, precision_score, recall_score, f1_score, accuracy_score, confusion_matrix, feature_importance, split_details, trained_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        model_name,
        precision,
        recall,
        f1,
        accuracy,
        json.dumps(confusion_mat),
        json.dumps(feature_imp) if feature_imp else None,
        json.dumps(split_details)
    ))
    conn.commit()
    conn.close()

def get_model_metrics() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM model_metrics ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for row in rows:
        r = dict(row)
        r['confusion_matrix'] = json.loads(r['confusion_matrix'])
        r['feature_importance'] = json.loads(r['feature_importance']) if r['feature_importance'] else None
        r['split_details'] = json.loads(r['split_details'])
        results.append(r)
    return results

if __name__ == "__main__":
    init_db()
    seed_25_field_reports()
    print("Dual-Engine Database (PostgreSQL + SQLite) initialized successfully.")
