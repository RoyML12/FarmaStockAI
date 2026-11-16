// El nombre real se conserva en la sesión; solo se normaliza su presentación.
export function displayAccountName(user){
  const name=String(user?.full_name||'').trim();
  if(!name)return 'Usuario';
  // Cuenta inicial de pruebas: no exponer su etiqueta técnica en la interfaz.
  if(/^administrador\s+demo$/i.test(name))return 'Administrador';
  return name;
}
