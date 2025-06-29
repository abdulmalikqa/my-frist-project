class ApiFeatures{
    // تهيئة الكائن ApiFeatures بتمرير استعلام Mongoose (مثل Product.find()) واستعلام المستخدم (req.query).
    constructor(mongooseQuery , queryString)
    {
      
        this.mongooseQuery= mongooseQuery;
          //queryString like req.query
        this.queryString = queryString;

    }

    // تطبيق فلترة متقدمة بناءً على المعايير التي يرسلها المستخدم (مثل السعر، التصنيف، إلخ).
    filter()
    {
          // أخذ نسخة من الاستعلام لتعديلها بدون التأثير على req.query الأصلي
          //filter
          const queryStringObj = { ...this.queryString };
          // حذف المتغيرات الغير متعلقة بالفلترة
          //const excludesFields = ['page', 'sort', 'limit', 'fields'];
          const excludesFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
          excludesFields.forEach((field) => delete queryStringObj[field]);
            // استبدال عوامل المقارنة لتصبح بصيغة MongoDB
            //   //Apply filtration using [get,gt,lte,lt]
//   let queryStr = JSON.stringify(queryStringObj);
//   queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g ,(match)=>`$${match}`);
            const parsedQuery = {};
            Object.keys(queryStringObj).forEach((key) => {
              if (key.includes('[')) {
                // مثال: price[gte] → field = price, operator = gte
                const [field, op] = key.split(/\[|\]/).filter(Boolean);
                if (!parsedQuery[field]) parsedQuery[field] = {};
                parsedQuery[field][`$${op}`] = Number(queryStringObj[key]);
              } else {
                // eslint-disable-next-line no-restricted-globals
                parsedQuery[key] = isNaN(queryStringObj[key])
                  ? queryStringObj[key]
                  : Number(queryStringObj[key]);
              }
            });

            this.mongooseQuery =this.mongooseQuery.find(parsedQuery);
            return this;
    }

    /**
     * دالة تقوم بعملية ترتيب الحقل المعين حسب طلب المبرمج
     * ترتيب النتائج حسب معايير المستخدم، أو ترتيبها افتراضيًا بالأحدث (-createdAt) إذا لم يُحدد المستخدم شيئًا.
     * @returns 
     */
    sorting()
    {
        // 3) sorting
        //let sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';
        //Or

 if(this.queryString.sort){ 
    const mysort = this.queryString.sort.split(',').join(' ');
    console.log(this.queryString.sort);
    this.mongooseQuery =this.mongooseQuery.sort(mysort);
     
    }
    else{
      //بيكون الترتبيب بحسب الوثيقة المضافة حديثا
      this.mongooseQuery =this.mongooseQuery.sort("-createdAt")
    }
    return this;
    }

    // تحديد الحقول التي يُسمح بإرجاعها في النتيجة.
    limitedFields()
    {
          // 4) fields limiting
  const fields =this.queryString.fields ? this.queryString.fields.split(',').join(' ') :'-__v';
  this.mongooseQuery = this.mongooseQuery.select(fields);
  return this;
 
    }

    // البحث بالكلمات المفتاحية باستخدام keyword.
    search(modelName)
    {
        
    let keywordFilter = {};
    if (this.queryString.keyword) {
      if(modelName ==='Product')
      {
      keywordFilter.$or = [
        { title: { $regex: this.queryString.keyword, $options: 'i' } },
        { description: { $regex: this.queryString.keyword, $options: 'i' } }
      ];
    }
    else
    {
      keywordFilter.$or = [
        { name: { $regex: this.queryString.keyword, $options: 'i' } }, 
      ];
    }
      this.mongooseQuery   = this.mongooseQuery .find(keywordFilter);
      // this.mongooseQuery = this.mongooseQuery.find({ ...this.mongooseQuery.getFilter(), ...keywordFilter });
    }
    return this;
    }

    // تقسيم النتائج إلى صفحات.
    paginate(countDocuments)
    {
        const myPage = this.queryString.page * 1 || 1;
        //limit هو طريقة في قواعد البيانات (مثل MongoDB) تُستخدم لتحديد عدد النتائج القصوى التي تُرجعها الاستعلامات.
        const myLimit = this.queryString.limit * 1 || 15;
        const mySkip = (myPage - 1) * myLimit;
        const ensIndexPage = myPage *myLimit;

        //Pagination result
        const pagimation={};
        pagimation.currentPage= myPage;
        pagimation.limit= myLimit;
        pagimation.numberOfPages=Math.ceil(countDocuments / myLimit);//50 /10 

        //next Page
        if(ensIndexPage < countDocuments)
        {
          pagimation.next=myPage +1;
        }
        //priv Page
        if(mySkip > 0)
        {
          pagimation.priv = myPage - 1;
        }
        this.mongooseQuery = this.mongooseQuery.skip(mySkip)  .limit(myLimit);
        this.paginateResult = pagimation;
        return this;
        

    }
}
module.exports= ApiFeatures;