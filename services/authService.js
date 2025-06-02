
const asyncHandler = require('express-async-handler');
const  userSchema = require('../Model/userModel'); // نموذج المستخدم
const jwt = require('jsonwebtoken');

exports.googleLogin = asyncHandler(async (req, res) => {
  const { email, name, picture, googleId } = req.body;

  let user = await userSchema.findOne({ email });

  if (!user) {
    user = await userSchema.create({
      name,
      email,
      googleId,
      profileImg: picture,
      active: true,
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(200).json({ token, user });
});