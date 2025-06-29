const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
    {
        // الحقول داخل المخطط
    name:{
        // نوع البيانات يجب أن يكون نص (String).
        type:String ,
        //لا يمكن ترك الاسم فارغًا، وإذا تُرك، تُعرض رسالة الخطأ
        required :[true,'Brand required'],
        //يجب ألا يتكرر الاسم، وإذا تكرر، تُعرض رسالة
        unique :[true , 'Brand must be unque'],
       // الاسم لازم يكون 3 أحرف على الأقل.
        minlength :[3,'Too short Brand name'],
       // الاسم لا يزيد عن 32 حرف
        maxlength :[32,'Too long Brand name']

    },
    //slug غالبًا يُستخدم لإنشاء عنوان URL-friendly مثل: إذا name = "Electronics" يصبح slug = "electronics"
    slug:{
        type : String,

        lowercase : true,
    },
    image : String,
}, 
    { timestamps : true}
);

//2- Create Model
module.exports  = mongoose.model('Brand', brandSchema);