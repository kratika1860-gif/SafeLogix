import json, math, re, h5py, numpy as np, pandas as pd
OUT='/mnt/user-data/outputs/meghalaya_csv/'
U='/mnt/user-data/uploads/'
# ---- districts
d=pd.read_excel(U+'Districtof_Specific_State_2026-11-18_21-38-55.xlsx',header=1)
d=d.rename(columns={'District Code':'district_lgd_code','District Version':'lgd_version','District Name(In English)':'district_name','District Name(In Local)':'district_name_local','Census 2001 Code':'census2001_code','Census 2011 Code':'census2011_code'}).drop(columns=['S.No.'])
d.insert(0,'state_lgd_code',17); d['state']='Meghalaya'
d.to_csv(OUT+'districts.csv',index=False); print('districts',len(d))
# ---- villages
rows=json.load(open('villages_rows.json'))
v=pd.DataFrame(rows)
def num(s): return pd.to_numeric(s,errors='coerce')
yn=lambda c: v[c].str.strip().str.lower().map({'1':1,'yes':1,'available':1,'y':1,'0':0,'no':0,'not available':0,'n':0}) 
vv=pd.DataFrame({
 'village_id':'ML_V_'+v['vlcode'].astype(str),'village_name':v['village'],'village_lgd_code':v['vlcode'],
 'block':v['block'],'block_code':v['bkcode'],'subdistrict':v['subdistric'],'subdistrict_code':v['sdcode'],
 'district':v['district'],'district_lgd_code':v['dtcode'],'district_hq':v['district_head_quarter'],
 'urban_rural':v['total_urban_rural'],'households':num(v['total_households']),'population':num(v['total_population_village']),
 'male_population':num(v['total_male_population_village']),'female_population':num(v['total_female_population_village']),
 'centroid_latitude':v['centroid_lat'],'centroid_longitude':v['centroid_lon'],
 'bbox_min_lon':v['bbox_minlon'],'bbox_min_lat':v['bbox_minlat'],'bbox_max_lon':v['bbox_maxlon'],'bbox_max_lat':v['bbox_maxlat'],
 'polygon_area_km2':v['area_km2_calc'],'n_polygon_rings':v['n_rings'],
 'tapwater_treated':v['tapwater_treated_status'],'spring':v['spring_status'],'river_canal':v['river_canal_status'],
 'closed_drainage':v['closed_drainage_status'],'open_drainage':v['open_drainage_status'],
 'geometry_source':'SOI_vb_soi_ml.kmz'})
vv.to_csv(OUT+'villages.csv',index=False); print('villages',len(vv),'dup vlcode',vv.village_lgd_code.duplicated().sum())
print(vv.centroid_latitude.describe()[['min','max']].tolist(), vv.centroid_longitude.describe()[['min','max']].tolist())
# ---- rainfall gauges
m=pd.read_csv(U+'rainfall_manual_hr_meghalaya_ml_2021_2025.csv'); t=pd.read_csv(U+'rainfall_tel_hr_meghalaya_ml_2026_2030.csv')
m['source_type']='manual'; t['source_type']='telemetry'
m=m.rename(columns={'Manual Hourly Rainfall (mm)':'rainfall_mm'}); t=t.rename(columns={'Telemetry Hourly Rainfall (mm)':'rainfall_mm'})
g=pd.concat([m,t],ignore_index=True)
g['observed_at']=pd.to_datetime(g['Data Acquisition Time'],format='%d-%m-%Y %H:%M',errors='coerce')
print('bad ts',g.observed_at.isna().sum(),'rain NaN',g.rainfall_mm.isna().sum(),'neg',(g.rainfall_mm<0).sum(),'max',g.rainfall_mm.max())
print(g.groupby('source_type').observed_at.agg(['min','max','count']))
g['district']=g['District'].str.title().str.replace('Ri Bhoi','Ri Bhoi')
g['station_id']='ML_R_'+g['Station'].str.upper().str.replace(r'[^A-Z0-9]+','_',regex=True).str.strip('_')
st=g.groupby(['station_id','Station','source_type']).agg(district=('district','first'),district_lgd_code=('District LGD Code','first'),tehsil=('Tehsil','first'),
  river=('River','first'),basin=('Basin','first'),latitude=('Latitude','first'),longitude=('Longitude','first'),
  n_obs=('rainfall_mm','size'),first_obs=('observed_at','min'),last_obs=('observed_at','max')).reset_index().rename(columns={'Station':'station_name'})
st.to_csv(OUT+'rainfall_stations.csv',index=False); print('stations',len(st))
before=len(g); g=g.drop_duplicates(['station_id','observed_at','source_type']); print('dups removed',before-len(g))
g[['station_id','observed_at','rainfall_mm','source_type']].sort_values(['station_id','observed_at']).to_csv(OUT+'rainfall_gauge_hourly.csv',index=False,date_format='%Y-%m-%d %H:%M')
# ---- grid
f=h5py.File(U+'imdweb_k_c87ZQd.nc'); r=f['rain']
print({k:v for k,v in r['time'].attrs.items()}, r['time'][:3], r['time'][-3:], r['lat'][:], r['lon'][:])
grid=pd.read_csv(U+'meghalaya_rainfall_from_netcdf.csv'); print(grid.date.min(),grid.date.max(),len(grid),grid.rainfall_mm.isna().sum(),grid.groupby(['latitude','longitude']).ngroups)
grid['rainfall_mm']=grid.rainfall_mm.round(3); grid.to_csv(OUT+'rainfall_grid_daily_imd.csv',index=False)
# ---- station -> nearest village
def hav(la1,lo1,la2,lo2):
    R=6371.0; p=np.pi/180; a=np.sin((la2-la1)*p/2)**2+np.cos(la1*p)*np.cos(la2*p)*np.sin((lo2-lo1)*p/2)**2; return 2*R*np.arcsin(np.sqrt(a))
vl=vv[['village_id','village_name','district','centroid_latitude','centroid_longitude']].values
out=[]
for _,s in st.iterrows():
    dist=hav(s.latitude,s.longitude,vv.centroid_latitude.values,vv.centroid_longitude.values); i=int(dist.argmin())
    out.append((s.station_id,vv.village_id[i],vv.village_name[i],vv.district[i],round(dist[i],3)))
pd.DataFrame(out,columns=['station_id','nearest_village_id','nearest_village_name','village_district','distance_km']).to_csv(OUT+'station_village_nearest.csv',index=False)
# ---- landslide candidates
inv=pd.read_csv('ext/inv.csv')
b=(vv.bbox_min_lon.min(),vv.bbox_max_lon.max(),vv.bbox_min_lat.min(),vv.bbox_max_lat.max()); print('bbox',b)
inv=inv[inv.lon.between(b[0],b[1])&inv.lat.between(b[2],b[3])].copy()
res=[]
for _,x in inv.iterrows():
    dist=hav(x.lat,x.lon,vv.centroid_latitude.values,vv.centroid_longitude.values); i=int(dist.argmin())
    inside=(vv.bbox_min_lon[i]<=x.lon<=vv.bbox_max_lon[i]) and (vv.bbox_min_lat[i]<=x.lat<=vv.bbox_max_lat[i])
    res.append((vv.village_id[i],vv.district[i],round(dist[i],2),dist[i]<15))
inv['nearest_village_id'],inv['district_nearest'],inv['dist_to_village_km'],inv['within_15km_of_village']=zip(*res)
inv=inv[inv.within_15km_of_village].drop(columns='within_15km_of_village')
inv.insert(0,'event_id',['LS_C_%03d'%i for i in range(1,len(inv)+1)])
inv=inv.rename(columns={'lat':'latitude','lon':'longitude','source':'source_catalog'})
inv['event_date']='';inv['hazard_type']='landslide';inv['verification_status']='UNVERIFIED_third_party_point_no_date'
inv['source_url']='https://github.com/saketkumar-18/landslide-susceptibility-ne (data/derived/inventory.csv)'
inv.to_csv(OUT+'landslide_events_candidates.csv',index=False); print('landslide cand',len(inv), inv.district_nearest.value_counts().to_dict())
# empty templates
pd.DataFrame(columns=['road_id','osm_way_id','road_name','road_class','surface','start_latitude','start_longitude','end_latitude','end_longitude','length_km','source']).to_csv(OUT+'roads_TEMPLATE_empty.csv',index=False)
pd.DataFrame(columns=['facility_id','facility_name','facility_type','district','block','village','latitude','longitude','source','source_date','verification_status']).to_csv(OUT+'health_facilities_TEMPLATE_empty.csv',index=False)
pd.DataFrame(columns=['sample_id','sample_type','ref_id','latitude','longitude','elevation_m','slope_degrees','dem_source']).to_csv(OUT+'terrain_samples_TEMPLATE_empty.csv',index=False)
