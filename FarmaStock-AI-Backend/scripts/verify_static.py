#!/usr/bin/env python3
from pathlib import Path
import json,subprocess,sys
root=Path(__file__).resolve().parents[1];files=list(root.rglob('*'))
for p in files:
 if p.is_file() and p.suffix=='.json':json.loads(p.read_text())
for p in files:
 if p.is_file() and p.suffix=='.js' and 'mobile' not in p.parts:
  subprocess.run(['node','--check',str(p)],check=True)
for name in ['auth','catalog','inventory','purchase','sales','notification','ai']:
 assert (root/f'services/{name}-service/src/server.js').is_file()
assert (root/'gateway/src/server.js').is_file()
assert not (root/'mobile').exists(), 'El frontend debe residir en FarmaStock-AI-Frontend.zip'
assert len(list((root/'infrastructure/mysql/init').glob('*.sql')))==7
try:
 import yaml
 with (root/'compose.yaml').open() as f:config=yaml.safe_load(f)
 assert len([k for k in config['services'] if k.endswith('-service')])==7
 defined_services = set(config['services'])
 for service_name, service_config in config['services'].items():
  dependencies = service_config.get('depends_on', {})
  assert set(dependencies) <= defined_services, f'{service_name} depende de servicios inexistentes: {set(dependencies)-defined_services}'
 print('compose.yaml y referencias entre servicios validados con PyYAML')
except ImportError:
 print('PyYAML no instalado: se omitió comprobación YAML (pip install pyyaml)')
print('Validación estática OK:',sum(p.is_file() for p in files),'archivos')
