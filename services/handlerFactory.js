const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");  
/**
 * 
 */
exports.CreateOne=(modelName)=>asyncHandler (async(req,res)=>{

     
  const doucm= await  modelName.create(req.body);

    res.status(201).json({data : doucm});
      
});

exports.UpdateData=(modelName , nameMass)=>asyncHandler(async(req,res,next)=>{
    
    const doucm= await modelName.findByIdAndUpdate( req.params.id,req.body, {new:true})
    if(!doucm)
    {
        return next(new ApiError(`No ${nameMass} found id : ${req.params.id}` ,404))
    }
    res.status(200).json({Data:doucm});
});

exports.DeletedOn=(modelName , nameMass)=>asyncHandler(async(req,res,next)=>{
    
    const {id} = req.params;
    const doucm= await modelName.findByIdAndDelete( id)
    if(!doucm)
    {
        return next(new ApiError(`No ${nameMass} found id : ${id}` ,404))
    }
    res.status(200).json({Data:doucm});
});
