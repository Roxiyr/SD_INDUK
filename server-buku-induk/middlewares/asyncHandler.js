/** Meneruskan rejection controller async ke error handler Express. @param {Function} handler Controller Express. @returns {Function} Middleware dengan rejection handling. */
module.exports=function asyncHandler(handler){return function wrapped(req,res,next){Promise.resolve(handler(req,res,next)).catch(next);};};
