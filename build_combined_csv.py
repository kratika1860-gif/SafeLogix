import os
import csv
import json
import zipfile

csv_dir = "/Users/kratikagupta/.gemini/antigravity/scratch/SIH-LOGISTICS-/datasets_csv"
master_csv_path = os.path.join(csv_dir, "safelogix_combined_master_dataset.csv")
zip_path = os.path.join(csv_dir, "safelogix_all_datasets.zip")

headers = [
    "dataset_category",
    "record_id",
    "name_or_title",
    "category_or_type",
    "severity_or_status",
    "latitude",
    "longitude",
    "region_or_corridor",
    "description_or_details",
    "extra_attributes_json"
]

rows = []

# 1. Landslides (30 zones)
p = os.path.join(csv_dir, "landslide_prone_areas.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            extra = {
                "slope_angle": r.get("slope_angle"),
                "state": r.get("state"),
                "highway_corridor": r.get("highway_corridor")
            }
            rows.append([
                "Landslide Hazard Zone",
                r["id"],
                r["name"],
                "Slope Instability / Geological Hazard",
                r["hazard_level"],
                r["latitude"],
                r["longitude"],
                f"{r.get('highway_corridor')} ({r.get('state')})",
                f"{r.get('vulnerability_note')} | Safe detour: {r.get('safe_alternate_route')}",
                json.dumps(extra)
            ])

# 2. Trips (850 trips)
p = os.path.join(csv_dir, "trips_and_dispatches.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            extra = {
                "driver_id": r.get("driver_id"),
                "vehicle_id": r.get("vehicle_id"),
                "expected_base_hours": r.get("expected_base_hours"),
                "actual_delay_hours": r.get("actual_delay_hours"),
                "delay_cause": r.get("delay_cause"),
                "destination_lat": r.get("end_lat"),
                "destination_lng": r.get("end_lng")
            }
            rows.append([
                "Trip & Relief Dispatch",
                f"TRIP-{r['id']}",
                f"{r['cargo_category']} ({r['start_location']} -> {r['end_location']})",
                "Relief Cargo Transport",
                f"{r['priority']} ({r['status']})",
                r["start_lat"],
                r["start_lng"],
                f"{r['start_location']} to {r['end_location']}",
                f"Delay: {r.get('actual_delay_hours', '0')}h. Cause: {r.get('delay_cause', 'None')}. Action: {r.get('recommended_action', 'Standard speed')}",
                json.dumps(extra)
            ])

# 3. Field Hazard Reports (450 reports)
p = os.path.join(csv_dir, "field_hazard_reports.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            extra = {
                "reporter_id": r.get("reporter_id"),
                "assigned_responder_id": r.get("assigned_responder_id"),
                "resolution_notes": r.get("resolution_notes")
            }
            rows.append([
                "Field Hazard Report",
                f"FIELD-REP-{r['id']}",
                f"{r['category']} Incident",
                r["category"],
                f"{r['severity']} ({r['status']})",
                r["latitude"],
                r["longitude"],
                "Highway Transit Section",
                r["description"],
                json.dumps(extra)
            ])

# 4. Emergency SOS Reports (160 reports)
p = os.path.join(csv_dir, "emergency_sos_reports.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            extra = {
                "sla_breached": r.get("sla_breached"),
                "escalated": r.get("escalated"),
                "responder_id": r.get("assigned_responder_id")
            }
            rows.append([
                "Emergency SOS Alert",
                f"SOS-{r['id']}",
                r["type"],
                "180s SLA Emergency",
                r["status"],
                r["latitude"],
                r["longitude"],
                "Convoy Emergency Point",
                r["description"],
                json.dumps(extra)
            ])

# 5. Vehicles Fleet Registry (150 vehicles)
p = os.path.join(csv_dir, "vehicles_fleet_registry.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append([
                "Vehicle Fleet Asset",
                f"VEH-{r['id']}",
                f"{r['make']} {r['model']} ({r['license_plate']})",
                "Disaster Logistics Vehicle",
                r["status"],
                "",
                "",
                "Regional Staging Depot",
                f"Model Year: {r['year']}, License Registration: {r['license_plate']}",
                "{}"
            ])

# 6. Regional Alerts (120 alerts)
p = os.path.join(csv_dir, "regional_disaster_alerts.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append([
                "Regional Disaster Alert",
                f"ALERT-{r['id']}",
                r["title"],
                r["type"],
                r["severity"],
                "",
                "",
                "NER Disaster Management Command",
                r["message"],
                json.dumps({"expires_at": r.get("expires_at")})
            ])

# 7. System Users & Drivers (120 users)
p = os.path.join(csv_dir, "system_users_and_drivers.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            extra = {
                "license_number": r.get("license_number"),
                "duty_status": r.get("duty_status"),
                "phone": r.get("phone")
            }
            rows.append([
                "System User / Driver",
                f"USER-{r['id']}",
                r["full_name"] or r["email"],
                "Personnel Record",
                r["role"],
                r["latitude"],
                r["longitude"],
                "District Operational Center",
                f"Email: {r['email']}, Role: {r['role']}, Status: {r.get('duty_status', 'N/A')}",
                json.dumps(extra)
            ])

# 8. Petrol & EV Stations
p = os.path.join(csv_dir, "petrol_and_ev_stations.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append([
                "Fuel & EV Station",
                r["id"],
                r["name"],
                "Refueling Infrastructure",
                r["status"],
                r["latitude"],
                r["longitude"],
                "Highway Corridor Link",
                f"Brand: {r.get('brand')}, Fuels: {r.get('fuel_types')}, EV: {r.get('ev_charging')}",
                json.dumps({"operating_hours": r.get("operating_hours"), "phone": r.get("phone")})
            ])

# 9. Transit Lodging & Rest Amenities
p = os.path.join(csv_dir, "transit_lodging_and_amenities.csv")
if os.path.exists(p):
    with open(p, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append([
                "Transit Lodging & Rest Amenities",
                r["id"],
                r["name"],
                "Driver Layover Amenity",
                r["status"],
                r["latitude"],
                r["longitude"],
                "Highway Corridor Link",
                f"{r.get('title')} | Rating: {r.get('rating')} | Amenities: {r.get('amenities')}",
                json.dumps({"rooms_available": r.get("rooms_available"), "phone": r.get("contact_phone")})
            ])

# Write Unified Master CSV
with open(master_csv_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print(f"Master CSV written: {master_csv_path} with {len(rows)} comprehensive records.")

# Create ZIP archive of all CSV files
csv_files = [f for f in os.listdir(csv_dir) if f.endswith(".csv")]
with zipfile.ZipFile(zip_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
    for filename in sorted(csv_files):
        filepath = os.path.join(csv_dir, filename)
        zf.write(filepath, arcname=filename)

print(f"ZIP archive written: {zip_path} containing {len(csv_files)} files.")
