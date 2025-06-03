const ApiError = require("../utils/apiError");


//ارسال الخطاء للمطور
const sendErrorForDev=(err,res)=>
  // طريقة انحنا رجعنا الخطاء بشكل تفصيلي 
   res.status(err.statusCode).json({
  // ايه هو الحالة
  status :err.status,
  //ايه هو الخطاء بالضبط
  error:err,
  // الرسالة التابعة للخطاء
  message : err.message,
  //اين حصل الخطاء
   stack :err.stack
})
    
;

//ارسال الخطاء للمستخدم
const sendErrorForProd=(err,res)=>
    res.status(err.statusCode).json({ 
    status :err.status,
    message : err.message,

  });

  /**
   * massage Error to unvalid token 
   * @returns 
   */
  const handleJwtInvalidSignature= () =>
    new ApiError('Invalid token, please login again..',401);
  /**
   * massege Error to Expired Key token name Error TokenExpiredError
   * @returns 
   */
  const handleJwtExpired = () => new ApiError('Expired token, please login again..', 401);
const globalError = (err,req,res,next)=>{

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
 
    
   if(process.env.NODE_ENV ==='development')
   {
    sendErrorForDev(err , res);

   }
   else
   {
    if(err.name==='JsonWebTokenError') err =handleJwtInvalidSignature();
    if (err.name === 'TokenExpiredError') err = handleJwtExpired();
    sendErrorForProd(err, res);
   }


};
module.exports = globalError;