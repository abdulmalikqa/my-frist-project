const userRout = require('./userRout');
const authService = require('./authRoutes') 
 const categoryRoute = require('./categoryRoutes')
 const subCategory = require('../Routes/subCategoryRoute')
 const brandRout = require('../Routes/brandRoute')
 const productRout = require('../Routes/productRoutes')
 const orderRout = require('../Routes/orderRoutes')
 const orderStatsRout = require('../Routes/orderStatsRout')
 const policyRoutes = require('../Routes/policyRoutes');
 const analyticsRoutes = require('../Routes/analyticsRoutes');
const mountRoutes = (app) => { 
 
  app.use('/api/v1/user', userRout);  
  app.use('/api/v1/auth' , authService )
  app.use('/api/v1/category', categoryRoute)
  app.use('/api/v1/subcategory', subCategory)
  app.use('/api/v1/brand', brandRout)
  app.use('/api/v1/products',productRout)
  app.use('/api/v1/orders' , orderRout)
  app.use('/api/v1/stats' , orderStatsRout)
  app.use('/api/v1/policies', policyRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
};

module.exports = mountRoutes;