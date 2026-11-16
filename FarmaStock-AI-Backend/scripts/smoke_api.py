#!/usr/bin/env python3
"""Smoke test requiere backend activo y datos seed_demo."""
from seed_demo import request,ENV
from uuid import uuid4

def main():
 assert request('GET','/health')['status']=='ok'
 s=request('POST','/api/auth/login',{'email':ENV['SEED_ADMIN_EMAIL'],'password':ENV['SEED_ADMIN_PASSWORD']})
 token=s['token'];products=request('GET','/api/catalog/products',token=token);assert isinstance(products,list)
 if not products:raise RuntimeError('Primero ejecuta scripts/seed_demo.py')
 stock=request('GET','/api/inventory/stock',token=token);assert isinstance(stock,list)
 available=next((s for s in stock if int(s['available'])>=1),None)
 if available:
  receipt=request('POST','/api/sales',{'client_request_id':'test-'+str(uuid4()),'items':[{'product_id':available['product_id'],'quantity':1}]},token)
  assert receipt['status']=='completed',receipt
 else:print('AVISO: sin inventario disponible para probar ventas')
 notifications=request('GET','/api/notifications',token=token);assert isinstance(notifications,list)
 risks=request('POST','/api/ai/scan',{},token);assert 'run_id' in risks
 res=request('GET','/api/ai/risks',token=token);assert isinstance(res,list)
 print('Smoke test OK: Gateway, login, catálogo, inventario, notificaciones, IA.')
if __name__=='__main__':main()
