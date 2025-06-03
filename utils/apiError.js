
//@desc this class is responsible about operation errors (errors that i can predict)
class ApiError extends Error{
/** 
 * هذا هو الكونستركتور (constructor) أو الدالة التي تُنفذ تلقائيًا عند إنشاء كائن جديد من هذا الكلاس.
يستقبل رسالة الخطأ message، و كود الحالة statusCode (مثل 404 أو 500...).
 * @param {*} message {رسالة الخطاء
 * @param {*} statusCode 
 */
    constructor(message , statusCode){

        super(message);
        //يُخزّن كود الحالة في خاصية جديدة داخل الكائن
        this.statusCode = statusCode;
        /**
         * يحوّل statusCode إلى سلسلة نصية باستخدام ${statusCode}.

ثم يتحقق مما إذا كانت تبدأ بالرقم 4 (أي من نوع 400 إلى 499، وهي أخطاء في الطلب – client errors).

إذا نعم، فإن الحالة هي 'fail' (فشل من العميل).

إذا لا، فإنها 'error' (أي خطأ داخلي – غالباً من الخادم).


         */
        this.status=`${statusCode}`.startsWith(4)?'fail' :'error';
        /**
         * هذا يعني أن الخطأ تشغيلي (operational)، أي يمكن التنبؤ به (مثل: مستخدم أدخل بيانات خاطئة، أو حاول الوصول لمورد غير موجود).

يُستخدم هذا لاحقًا في التعامل مع الأخطاء للتمييز بين الأخطاء التشغيلية والأخطاء البرمجية الحقيقية
         */
        this.isOperational = true;
 
    }


}
//يتم تصدير الكلاس حتى يمكن استيراده واستخدامه في ملفات أخرى داخل مشروع Node.js.
module.exports = ApiError;