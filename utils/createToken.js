const jwt = require('jsonwebtoken');



// توليد التوكن
const createToken = (payload) =>
    jwt.sign({ userId: payload }, process.env.JWT_KEY, {
      expiresIn: process.env.JWT_EX,
    });

    module.exports =createToken;