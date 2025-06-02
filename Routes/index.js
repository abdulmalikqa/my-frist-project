const userRout = require('./userRout');

const mountRoutes = (app) => { 

  app.use('/api/v1/user', userRout);  
};

module.exports = mountRoutes;