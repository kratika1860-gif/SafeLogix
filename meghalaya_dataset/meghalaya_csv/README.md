# Meghalaya CSV package (built 2026-11-19)
| File | Rows | Grain | Source |
|---|---|---|---|
| districts.csv | 12 | district | LGD xlsx you uploaded |
| villages.csv | 6,897 | village polygon (centroid, bbox, area computed) | SOI vb_soi_ml.kmz (census/water-source attributes where present) |
| rainfall_stations.csv | 32 | station x source type | manual + telemetry CSVs |
| rainfall_gauge_hourly.csv | 22,080 | station x timestamp | manual 2021 (38 rows) + telemetry 2026 (to 2026-11-17); 2,024 exact duplicates removed |
| rainfall_grid_daily_imd.csv | 91,356 | grid cell x day (46 cells x 1,986 days, 2020-06-11..2025-11-17) | IMD 0.25 deg NetCDF (verified: complete, no NaN) |
| station_village_nearest.csv | 32 | station | computed, haversine to village centroid |
| landslide_events_candidates.csv | 88 | point | third-party GitHub inventory (UGLC), UNVERIFIED, no dates |
| roads / health_facilities / terrain_samples *_TEMPLATE_empty.csv | 0 | - | not fetchable here; see scripts/ |

## Caveats
- Telemetry: 4,349 hourly values > 300 mm (flag `extreme_gt_300mm_per_hr_check`) and 3 negatives. Likely sensor/cumulative-count errors; not deleted, filter before modelling.
- Village polygons named "Data Partially Available" (code 999999) are large placeholder areas, not real villages; 39 LGD codes are shared, so village_id has numeric suffixes for those.
- Manual gauge data covers only Jan-Jun 2021 (38 rows); gauge and IMD grid periods barely overlap (grid ends 2025-11, telemetry starts 2026-01).
- File names say 2026_2030 / 2021_2025 but those are query ranges; data actually stops 2026-11-17.
- Landslide candidates: points near Assam border may lie outside Meghalaya; they have no date, so cannot serve as training labels yet.
- Village polygons in villages.csv are summarised only; the full outer-ring geometry is not included (can export GeoJSON on request).
