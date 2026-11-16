import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {C} from './theme';

// Iconografía coherente en todas las secciones (Ionicons).
export const ICONS = {
  Inicio:'home-outline', Catálogo:'medkit-outline', Inventario:'cube-outline',
  Ventas:'cart-outline', Más:'grid-outline', Compras:'bag-handle-outline',
  Alertas:'notifications-outline', IA:'sparkles-outline', Ajustes:'settings-outline',
};
export default function AppIcon({name='ellipse-outline',size=22,color=C.greenDeep,...props}){
  return <Ionicons name={ICONS[name]||name} size={size} color={color} {...props}/>;
}
