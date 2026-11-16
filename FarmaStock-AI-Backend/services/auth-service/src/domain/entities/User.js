const ALLOWED_ROLES=Object.freeze(['admin','pharmacist','staff']);
function isAllowedRole(role){return ALLOWED_ROLES.includes(role)}
module.exports={ALLOWED_ROLES,isAllowedRole};
