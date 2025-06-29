const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");   
const ApiFeatures = require('../utils/apiFeatures');
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
    res.status(200).json({'Status':'The deletion process was completed successfully.'});
});

exports.getDataById = (modelName , nameMass) => asyncHandler(async(req,res,next)=>{

   const { id }= req.params ;
   
     const doucm = await modelName.findById(id);
  
     if (!doucm)
     {
      // res.status(404).json({msg :`No find brand for this Id ${id}`});
      return next(new ApiError(`No find ${nameMass} for this Id ${id}` , 404));
     }
     res.status(200).json({Data : doucm})
})

exports.getAll=(modelName , nameModels)=>asyncHandler ( async(req ,res)=>{

     let filter={};
     
  if(req.filterObj){filter= req.filterObj;}
//Build query
const doucmentCounts = await modelName.countDocuments();
const apiFeatures= new ApiFeatures(modelName.find(filter) , req.query)
.paginate(doucmentCounts)
.filter()
.search(nameModels)
.limitedFields()
.sorting();

//Execute Query
const { mongooseQuery , paginateResult} = apiFeatures;
const doucm = await  mongooseQuery;

res.status(200).json(
  {  results: doucm.length, paginateResult,
  data: doucm,
});
 
});   
 