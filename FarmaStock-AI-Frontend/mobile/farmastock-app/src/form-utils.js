// Validaciones compartidas: se ejecutan antes de llamar a la API.
export const clean = value => String(value ?? '').trim();
export const isPositiveInt = value => /^\d+$/.test(clean(value)) && Number(value) > 0 && Number.isSafeInteger(Number(value));
export const isNonnegativeInt = value => /^\d+$/.test(clean(value)) && Number.isSafeInteger(Number(value));
export const isMoney = value => /^\d+(?:[.,]\d{1,2})?$/.test(clean(value)) && Number(clean(value).replace(',','.')) >= 0;
export const asMoney = value => Number(clean(value).replace(',','.'));
export const money = value => '$' + Number(value || 0).toFixed(2);
export const todayISO = () => { const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
export const futureISO = () => { const d=new Date(); d.setFullYear(d.getFullYear()+1); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
export function validISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean(value))) return false;
  const [y,m,d]=value.split('-').map(Number);
  const test=new Date(Date.UTC(y,m-1,d));
  return test.getUTCFullYear()===y && test.getUTCMonth()===m-1 && test.getUTCDate()===d;
}
export function validate(values,rules) {
  const errors={};
  for(const [key,rule] of Object.entries(rules)) {
    const msg=rule(values[key],values);
    if(msg) errors[key]=msg;
  }
  return errors;
}
export const rules = {
  required: label => v => clean(v) ? '' : `Introduce ${label}.`,
  positive: label => v => isPositiveInt(v) ? '' : `${label}: introduce un entero mayor que cero.`,
  nonnegative: label => v => isNonnegativeInt(v) ? '' : `${label}: introduce un entero igual o mayor que cero.`,
  amount: (label, allowZero=false) => v => isMoney(v) && (allowZero || asMoney(v)>0) ? '' : `${label}: introduce un importe válido${allowZero?'':' mayor que cero'} (hasta 2 decimales).`,
  date: label => v => validISODate(v) && v>=todayISO() ? '' : `${label}: selecciona una fecha de hoy o posterior.`,
};
export function cleanAssistantText(text) {
  return clean(text)
    .replace(/\*\*([^*]+)\*\*/g,'$1')
    .replace(/`([^`]+)`/g,'$1')
    .replace(/^\s*#{1,4}\s+/gm,'')
    .replace(/^\s*[-*]\s+/gm,'• ');
}
