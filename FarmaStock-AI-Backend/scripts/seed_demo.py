#!/usr/bin/env python3
"""Datos de demostración, sin bibliotecas externas. Arranca Docker primero."""
import json,os,urllib.request,urllib.error
from datetime import date,timedelta
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ENV={}
for line in (ROOT/'.env').read_text(encoding='utf8').splitlines():
 if '=' in line and not line.strip().startswith('#'):
  k,v=line.split('=',1);ENV[k]=v
BASE=os.environ.get('FARMA_API','http://localhost:3000')
def request(method,path,body=None,token=None):
 data=None if body is None else json.dumps(body).encode('utf8')
 req=urllib.request.Request(BASE+path,data=data,method=method,headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+token} if token else {})})
 try:
  with urllib.request.urlopen(req,timeout=15) as r:return json.loads(r.read().decode())
 except urllib.error.HTTPError as e:raise RuntimeError(f'{path}: {e.code} {e.read().decode()}')
 if False:return None

def main():
 auth=request('POST','/api/auth/login',{'email':ENV.get('SEED_ADMIN_EMAIL','admin@farmastock.local'),'password':ENV['SEED_ADMIN_PASSWORD']});token=auth['token']
 products=request('GET','/api/catalog/products',token=token);by_sku={p['sku']:p for p in products}
 demo=[('PARA-500','Paracetamol 500mg','Paracetamol',1,45.00,12,'Caja 20 tabletas'),('IBU-400','Ibuprofeno 400mg','Ibuprofeno',1,62.00,10,'Caja 10 tabletas'),('VITA-C','Vitamina C 1g','Ácido ascórbico',3,95.00,7,'Tabletas efervescentes'),('AMOX-500','Amoxicilina 500mg','Amoxicilina',2,110.00,8,'Caja 12 cápsulas')]
 for sku,name,generic,cat,price,level,presentation in demo:
  if sku not in by_sku:
   p=request('POST','/api/catalog/products',{'sku':sku,'name':name,'generic_name':generic,'category_id':cat,'presentation':presentation,'price':price,'reorder_level':level},token);by_sku[sku]=p
 batches=request('GET','/api/inventory/batches',token=token);lots={(b['product_id'],b['lot_number']) for b in batches}
 for i,(sku,*_) in enumerate(demo):
  p=by_sku[sku];lot=f'DEMO-{sku}-01';key=(p['id'],lot)
  if key not in lots:
   request('POST','/api/inventory/batches',{'product_id':p['id'],'lot_number':lot,'quantity':[40,25,90,14][i],'unit_cost':[18,27,40,59][i],'expiry_date':(date.today()+timedelta(days=[7,32,240,135][i])).isoformat()},token)
 suppliers=request('GET','/api/purchases/suppliers',token=token)
 if not any(s['name']=='Distribuidora Demo Farma' for s in suppliers):request('POST','/api/purchases/suppliers',{'name':'Distribuidora Demo Farma','phone':'9610000000'},token)
 print('Datos listos. Productos:')
 for sku,*_ in demo:print(' ',by_sku[sku]['id'],sku)
 print('Prueba en la APK: login, inventario, venta, alertas y IA.')
if __name__=='__main__':main()
