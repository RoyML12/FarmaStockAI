const {subscribe}=require('@farmastock/shared');
const repository=require('../output/MySQLNotificationRepository');
const recordNotification=require('../../application/use-cases/RecordNotification')(repository);
module.exports=async()=>subscribe('notifications.alerts',['inventory.stock.low','inventory.expiry.risk','purchase.received','sale.completed'],recordNotification);
