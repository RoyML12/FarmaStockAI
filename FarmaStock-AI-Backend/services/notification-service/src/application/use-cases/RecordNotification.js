const {fromEvent}=require('../../domain/services/BuildNotification');
module.exports=(repo)=>async(event)=>{const n=fromEvent(event);return n?repo.persist(n):false};
