const test=require('node:test');const assert=require('node:assert/strict');const {calculateRisk}=require('../src/domain/services/riskCalculator');
test('riesgo alto cuando vence en 7 días y sobran unidades',()=>assert.deepEqual(calculateRisk({quantity:100,days_remaining:7,avg_daily_demand:3}),{estimated_leftover:79,risk_level:'high'}));
test('riesgo bajo cuando la demanda cubre todo el lote',()=>assert.deepEqual(calculateRisk({quantity:10,days_remaining:60,avg_daily_demand:2}),{estimated_leftover:0,risk_level:'low'}));
test('riesgo medio a 30 días',()=>assert.deepEqual(calculateRisk({quantity:100,days_remaining:30,avg_daily_demand:2}),{estimated_leftover:40,risk_level:'medium'}));
test('rechaza demandas negativas',()=>assert.throws(()=>calculateRisk({quantity:5,days_remaining:4,avg_daily_demand:-1})));
