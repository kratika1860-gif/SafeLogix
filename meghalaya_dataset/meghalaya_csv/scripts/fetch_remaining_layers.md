# Layers that could NOT be fetched in the sandbox (outbound network blocked)
Run these on a machine with internet, then drop the CSVs into the templates.

1. Roads + hospitals (OSM): `python collect_osm_meghalaya.py --db meghalaya_logistics.db`
   or Overpass Turbo -> export GeoJSON (query in your notes). Geofabrik: https://download.geofabrik.de/asia/india.html
2. Terrain: Copernicus DEM GLO-30 (open S3: copernicus-dem-30m.s3.amazonaws.com, tiles N25-N26 x E089-E092) or SRTM via EarthExplorer.
   Sample elevation/slope at villages.csv centroids and rainfall_stations.csv points (rasterio + gdaldem slope).
3. Health facilities: meghealth.gov.in CHC/PHC lists + OSM amenity=hospital/clinic; geocode; mark OSM-only as unverified.
4. Verified landslides: NRSC Bhukosh / Landslide Atlas, GSI, SDMA Meghalaya notices, news. Need dated, located incidents.
