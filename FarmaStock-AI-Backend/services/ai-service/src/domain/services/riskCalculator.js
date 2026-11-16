function calculateRisk({quantity,days_remaining,avg_daily_demand}){
 if(!Number.isFinite(quantity)||quantity<0||!Number.isFinite(days_remaining)||!Number.isFinite(avg_daily_demand)||avg_daily_demand<0)throw Error('Parámetros de riesgo inválidos');
 const estimated_leftover=Math.max(0,Math.ceil(quantity-avg_daily_demand*Math.max(0,days_remaining)));
 const risk_level=days_remaining<=0||(estimated_leftover>0&&days_remaining<=15)?'high':(estimated_leftover>0&&days_remaining<=45?'medium':'low');
 return {estimated_leftover,risk_level};
}
module.exports={calculateRisk};
