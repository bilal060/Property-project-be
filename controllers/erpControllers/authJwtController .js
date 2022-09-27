const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { stubFalse } = require('lodash');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
require('dotenv').config({ path: '.variables.env' });

exports.register = async (req, res) => {
  try {
    console.log(req.body);
    const { firstName, lastName, email, password, confirmPassword, userType } = req.body;

    // validate
    if (!firstName || !lastName || !email || !password || !confirmPassword || !userType)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Not all fields have been entered.',
      });

    if (password !== confirmPassword)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Password and confirm password are not matched.',
      });
    const cRole = await Role.findOne({ roleType: userType });
    const user = await User.findOne({ email: email, removed: false });
    if (user)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'account already exist please Login.',
      });
    const newUser = new User();
    const passwordHash = newUser.generateHash(password);
    await new User({
      firstName, lastName, email, password: passwordHash, role: cRole._id, photo: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`
    }).save();

    res.json({
      success: true,
      result: null,
      message: 'Successfully registered user',
    });
  } catch (err) {
    res.status(500).json({ success: false, result: null, message: err.message, error: err });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Not all fields have been entered.',
      });

    const user = await User.findOne({ email: email, removed: false });
    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'No account with this email has been registered.',
      });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid credentials.',
      });



    const result = await User.findOneAndUpdate(
      { _id: user._id },
      { isLoggedIn: true },
      {
        new: true,
      }
    ).exec();
    console.log(result)
    const token = jwt.sign(
      {
        id: result._id,
        role: result.role.roleType,
        isLoggedIn: result.isLoggedIn,
      },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );
    res.cookie('token', token, {
      maxAge: req.body.rememberMe ? 72 * 60 * 60 * 1000 : 60 * 60 * 1000,
      domain: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.json({
      success: true,
      result: {
        token,
        user: {
          _id: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          createdAt: result.createdAt,
          isLoggedIn: result.isLoggedIn
        }
      },
      message: 'Successfully login user',
    });
  } catch (err) {
    res.status(500).json({ success: false, result: null, message: err.message, error: err });
  }
};


// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // validate
//     if (!email || !password)
//       return res.status(400).json({
//         success: false,
//         result: null,
//         message: 'Not all fields have been entered.',
//       });

//     const admin = await Admin.findOne({ email: email, removed: false });
//     if (!admin)
//       return res.status(400).json({
//         success: false,
//         result: null,
//         message: 'No account with this email has been registered.',
//       });


//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch)
//       return res.status(400).json({
//         success: false,
//         result: null,
//         message: 'Invalid credentials.',
//       });

//     const token = jwt.sign(
//       {
//         id: admin._id,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '72h' }
//     );

//     const result = await Admin.findOneAndUpdate(
//       { _id: admin._id },
//       { isLoggedIn: true },
//       {
//         new: true,
//       }
//     ).exec();

//     res.cookie('token', token, {
//       maxAge: req.body.remember ? 72 * 60 * 60 * 1000 : 60 * 60 * 1000,
//       sameSite: 'none',
//       httpOnly: true,
//       secure: true,
//     });

//     res.json({
//       success: true,
//       result: {
//         token,
//         admin: {
//           id: result._id,
//           name: result.name,
//           isLoggedIn: result.isLoggedIn,
//         },
//       },
//       message: 'Successfully login admin',
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, result: null, message: err.message, error: err });
//   }
// };

exports.logout = async (req, res) => {
  const result = await Admin.findOneAndUpdate(
    { _id: req.admin._id },
    { isLoggedIn: false },
    {
      new: true,
    }
  ).exec();

  res.clearCookie('token');
  res.json({ isLoggedOut: true });
};



