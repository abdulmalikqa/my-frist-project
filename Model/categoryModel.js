
const mongoose = require('mongoose');

//1-Create Schema

/**
 * const categorySchema = new mongoose.Schema(...)
هذا ينشئ "مخطط" (Schema) لكيفية تخزين بيانات التصنيفات (Categories) في قاعدة البيانات.
 */
const categorySchema = new mongoose.Schema(
    {
        // الحقول داخل المخطط
    name:{
        // نوع البيانات يجب أن يكون نص (String).
        type:String ,
        //لا يمكن ترك الاسم فارغًا، وإذا تُرك، تُعرض رسالة الخطأ
        required :[true,'Category required'],
        //يجب ألا يتكرر الاسم، وإذا تكرر، تُعرض رسالة
        unique :[true , 'Category must be unque'],
       // الاسم لازم يكون 3 أحرف على الأقل.
        minlength :[3,'Too short category name'],
       // الاسم لا يزيد عن 32 حرف
        maxlength :[32,'Too long category name']

    },
    //slug غالبًا يُستخدم لإنشاء عنوان URL-friendly مثل: إذا name = "Electronics" يصبح slug = "electronics"
    slug:{
        type : String,

        lowercase : true,
    },
    image : String,
},
        /**
         * هذا خيار يُضيف حقلين تلقائيًا في كل سجل:

createdAt: وقت إنشاء السجل

updatedAt: وقت آخر تعديل
         */
    { timestamps : true}
);

//2- Create Model
const categoryModel = mongoose.model('Category', categorySchema);

module.exports= categoryModel;