const mongoose = require('mongoose')

const subCategorySchema = new mongoose.Schema({

     name:{
            type:String,
            trim:true,
            unique :[true,'SubCategory must be unique'],
            minlength :[3,'Too short category name'],
             maxlength :[32,'Too long category name']
        },
        slug:{
            type : String, 
            lowercase : true,
        },
        image : String ,

        Category:{
            type:mongoose.Schema.ObjectId,
            ref : 'Category',
            required :[true,'SubCategory must be belong to parent category'],

        },

}
,{timestamps : true}
) ;

module.exports = mongoose.model('subCategory', subCategorySchema)