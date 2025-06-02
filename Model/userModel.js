 
const mongoes = require("mongoose");
 const bcrypt = require('bcrypt');
const userSchema = new mongoes.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    // لدعم المستخدم التسجيل من جيميل
    googleId: {
    type: String,
    unique: true,
    sparse: true, // لأن بعض المستخدمين قد لا يملكون googleId
  },

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoes.Schema.ObjectId,
        ref: "Product",
      },
    ],
    address: [
      {
        id: { type: mongoes.Schema.Types.ObjectId },
        // اسم مختصر للعنوان مثل "المنزل" أو "العمل"
        alias: String,
        // تفاصيل العنوان مثل "الطابق الثاني، خلف محطة الوقود..."
        details: String,
        // رقم هاتف مرتبط بهذا العنوان (مفيد للشحن).
        phone: String,
        // اسم المدينة.
        city: String,
        // الرمز البريدي للعنوان.
        postalCode: String,
      },
    ],
    // زمن تغير كلمة المرو 
    passwordChangedAt: Date,
    //رمز تاكيد لتغير كلمة المرور
    passwordResetCode: String,
    //زمن انتهاء رمز التأكيد
    passwordResetExpires: Date,
    //حالة استخدام رمز التأكيد
    passwordResetVerified: Boolean,
  },
  { timestamps: true }
);

//ننشاء دالة تعمل عند حدث معين مثل الحفظ او البحث او التعديل او الاحذف 
userSchema.pre('save' ,async function (next){

   if(!this.isModified('password')) {return next();}

    this.password = await bcrypt.hash(this.password,12);
    
    next();

    
})

const User = mongoes.model('User',userSchema);

module.exports= User;