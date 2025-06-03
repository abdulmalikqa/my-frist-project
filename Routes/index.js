const userRout = require('./userRout');
const authService = require('./authRoutes') 

const mountRoutes = (app) => { 
 
  app.use('/api/v1/user', userRout);  
  app.use('/api/v1/auth' , authService )
};

module.exports = mountRoutes;