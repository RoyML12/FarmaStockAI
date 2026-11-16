#!/usr/bin/env python3
"""Integra los recursos de marca en un proyecto Expo SDK 55 sin borrar su configuración.
Ejecutar desde la carpeta raiz mobile/farmastock-app.
"""
from pathlib import Path
import json
p=Path.cwd()
app_path=p/'app.json'
package_path=p/'package.json'
for file in (app_path, package_path):
    if not file.exists(): raise SystemExit(f'Falta {file}. Ejecuta desde farmastock-app')
for image in ('icon.png','adaptive-icon.png','monochrome-icon.png','splash-icon.png'):
    if not (p/'assets'/image).is_file():
        raise SystemExit(f'Falta assets/{image}; extrae el ZIP antes de ejecutar')
app=json.loads(app_path.read_text(encoding='utf-8'))
expo=app.setdefault('expo',{})
previously_configured=expo.get('icon')=='./assets/icon.png'
expo['icon']='./assets/icon.png'
android=expo.setdefault('android',{})
android['adaptiveIcon']={
    'foregroundImage':'./assets/adaptive-icon.png',
    'monochromeImage':'./assets/monochrome-icon.png',
    'backgroundColor':'#F7FAF9'
}
plugins=expo.setdefault('plugins',[])
plugins=[entry for entry in plugins if not (entry=='expo-splash-screen' or (isinstance(entry,list) and entry and entry[0]=='expo-splash-screen'))]
plugins.append(['expo-splash-screen',{
    'image':'./assets/splash-icon.png',
    'imageWidth':210,
    'resizeMode':'contain',
    'backgroundColor':'#FFFFFF'
}])
expo['plugins']=plugins
if not previously_configured:
    android['versionCode']=max(int(android.get('versionCode',0))+1,5)
    if expo.get('version')=='1.2.0':expo['version']='1.2.1'
app_path.write_text(json.dumps(app,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
package=json.loads(package_path.read_text(encoding='utf-8'))
package.setdefault('dependencies',{})['expo-splash-screen']='~55.0.25'
if package.get('version')=='1.2.0':package['version']='1.2.1'
package_path.write_text(json.dumps(package,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('Icono, icono adaptativo y splash de FarmaStock AI configurados.')
print('Identificador Android conservado:',android.get('package'))
print('Version:',expo.get('version'),'| versionCode:',android.get('versionCode'))
print('Siguiente: npm install && npx expo config --type public')
