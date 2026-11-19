import argparse, json, sqlite3, time
import requests

# Approximate bounding box around Meghalaya: south, west, north, east.
# Bounding box includes a small fringe; clip to the official state polygon for final use.
BBOX = (25.0, 89.5, 26.2, 92.8)
OVERPASS = "https://overpass-api.de/api/interpreter"

QUERY = f"""
[out:json][timeout:180];
(
  way["highway"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  way["bridge"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  node["amenity"~"hospital|clinic|doctors|pharmacy"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  way["amenity"~"hospital|clinic|doctors|pharmacy"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
);
out center geom;
"""

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--db", default="meghalaya_logistics.db")
    args = p.parse_args()
    headers = {"User-Agent": "MeghalayaLogisticsAcademicProject/1.0 (data collection; OSM attribution)"}
    response = requests.post(OVERPASS, data={"data": QUERY}, headers=headers, timeout=240)
    response.raise_for_status()
    payload = response.json()

    con = sqlite3.connect(args.db)
    cur = con.cursor()
    source_id = cur.execute(
        "SELECT source_id FROM source_catalog WHERE source_name='OpenStreetMap' ORDER BY source_id LIMIT 1"
    ).fetchone()[0]

    road_count = facility_count = 0
    for el in payload.get("elements", []):
        tags = el.get("tags", {})
        if el["type"] == "way" and "highway" in tags:
            geom = el.get("geometry", [])
            if len(geom) < 2:
                continue
            geojson = {"type": "LineString", "coordinates": [[pt["lon"], pt["lat"]] for pt in geom]}
            # Approximate length from coordinates using haversine.
            import math
            length = 0.0
            for a, b in zip(geojson["coordinates"], geojson["coordinates"][1:]):
                lon1, lat1 = map(math.radians, a)
                lon2, lat2 = map(math.radians, b)
                dlat, dlon = lat2-lat1, lon2-lon1
                h = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
                length += 6371.0088 * 2 * math.asin(math.sqrt(h))
            cur.execute("""
                INSERT OR REPLACE INTO road_segments
                (road_id, osm_id, name, highway_type, surface, smoothness, bridge, tunnel,
                 access, maxspeed, length_km, geometry_geojson, source_id)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                f"osm-way-{el['id']}", str(el["id"]), tags.get("name"), tags.get("highway"),
                tags.get("surface"), tags.get("smoothness"), tags.get("bridge"), tags.get("tunnel"),
                tags.get("access"), tags.get("maxspeed"), round(length, 4),
                json.dumps(geojson), source_id
            ))
            road_count += 1
        elif tags.get("amenity") in {"hospital", "clinic", "doctors", "pharmacy"}:
            if "lat" in el and "lon" in el:
                lat, lon = el["lat"], el["lon"]
            elif "center" in el:
                lat, lon = el["center"]["lat"], el["center"]["lon"]
            else:
                continue
            point = {"type": "Point", "coordinates": [lon, lat]}
            cur.execute("""
                INSERT OR REPLACE INTO facilities
                (facility_id, name, facility_type, operator, latitude, longitude, geometry_geojson, source_id)
                VALUES (?,?,?,?,?,?,?,?)
            """, (f"osm-{el['type']}-{el['id']}", tags.get("name"), tags["amenity"],
                  tags.get("operator"), lat, lon, json.dumps(point), source_id))
            facility_count += 1

    con.commit()
    con.close()
    print(f"Imported {road_count} OSM road ways and {facility_count} health facilities.")
    print("Note: bbox data must be clipped to the official Meghalaya boundary before final analysis.")
    print("Credit: © OpenStreetMap contributors, ODbL.")

if __name__ == "__main__":
    main()
