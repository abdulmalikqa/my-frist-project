const {validationResult }= require('express-validator');

const validetorMiddleware=(req,res,next)=>{
    const error_req= validationResult(req);
    if(!error_req.isEmpty())
        {
            return res.status(400).json({error : error_req.array()});

        }
        next();
}
module.exports =validetorMiddleware;