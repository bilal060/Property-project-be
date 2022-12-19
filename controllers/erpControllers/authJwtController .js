const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.variables.env' });
const { stubFalse } = require('lodash');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const User = mongoose.model('User');
const Appointment = mongoose.model('Appointment');
const Role = mongoose.model('Role');
const otpModel = mongoose.model('otprecords')
const SendMail = require('@/middlewares/SendEmail');
const MeetingSchedule = require('@/views/EmailTemplates/MeetingSchedule');
const initScheduledJobs = require('@/middlewares/croneJobs');
const otpGenerator = require('@/utils/otpGenerator');
const confirmAccount = require('@/views/EmailTemplates/confirmAccount');
const forgotPassword = require('@/views/EmailTemplates/forgotPassword');
initScheduledJobs
const authCntrl = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, confirmPassword, userType, photo } = req.body;
      console.log(firstName, lastName, email, password, phone, confirmPassword, userType, photo)
      // validate
      if (!firstName || !lastName || !email || !password || !phone || !confirmPassword || !userType || !photo) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      } if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Password and confirm password are not matched.',
        });
      }
      const cRole = await Role.findOne({ roleType: userType });
      const user = await User.findOne({ email: email, removed: false });
      if (user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'account already exist please Login.',
        });
      }
      const userWithPhone = await User.findOne({ phone: phone, removed: false });
      if (userWithPhone) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Phone Number Already Exist',
        });
      }
      const newUser = new User();
      const passwordHash = newUser.generateHash(password);
      await new User({
        firstName, lastName, email, phone, password: passwordHash, role: cRole._id, photo: photo
      }).save();
      const emailOtp = await new otpModel({
        email: email,
        otp: otpGenerator()
      }).save();
      await SendMail(email, confirmAccount(emailOtp.otp), 'Confirm Account')
      const phoneOtp = await new otpModel({
        phone: phone,
        otp: otpGenerator()
      }).save();
      console.log(phoneOtp)
      res.json({
        success: true,
        result: null,
        message: 'Successfully registered user',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  login: async (req, res) => {
    try {
      const { userEmailPhone, password } = req.body;  // validate
      if (!userEmailPhone || !password)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      const user = await User.findOne({
        $or: [{
          "email": userEmailPhone
        }, {
          "phone": userEmailPhone
        }]
      });
      console.log(user)
      // const user = await User.findOne({ email: email, removed: false });
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
      }); res.json({
        success: true,
        result: {
          token,
          user: {
            _id: result._id,
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            createdAt: result.createdAt,
            isLoggedIn: result.isLoggedIn,
            photo: result.photo,
            phone: result.phone,
            compny: result.company,
            address: result.address,
            about: result.about,
          }
        },
        message: 'Successfully login user',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  updateUser: async (req, res) => {
    try {
      const body = { ...req.body }
      body.updatedBy = req.user._id.toString();
      const result = await User.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
        new: true,
        runValidators: true,
      }).exec();
      if (!result) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No document found by this id: ' + req.params.id,
        });
      } else {
        res.json({
          success: true,
          result: {
            user: {
              _id: result._id,
              firstName: result.firstName,
              lastName: result.lastName,
              email: result.email,
              createdAt: result.createdAt,
              isLoggedIn: result.isLoggedIn,
              photo: result.photo,
              phone: result.phone,
              company: result.company,
              address: result.address,
              about: result.about,
            }
          },
          message: 'Successfully updated profile',
        });
      }
    } catch (err) {
      if (err.name == 'ValidationError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          error: err,
        });
      } else {
        // Server Error
        return res.status(500).json({
          success: false,
          result: null,
          message: 'Oops there is an Error',
          error: err,
        });
      }
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, password, confirmPassword, } = req.body;
      // validate
      if (!currentPassword || !password || !confirmPassword)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      if (password !== confirmPassword)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Password and Current Password Are Not Same.',
        });
      const user = await User.findOne({ _id: req.user.id, removed: false });
      if (!user)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'account not found.',
        });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Invalid current Passowrd.',
        });
      const newUser = new User();
      const passwordHash = newUser.generateHash(password);
      const result = await User.findOneAndUpdate(
        { _id: user._id },
        { password: passwordHash },
        {
          new: true,
        }
      ).exec();
      res.json({
        success: true,
        result: null,
        message: 'Successfully changes password',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password, confirmPassword, } = req.body;
      // validate
      if (!password || !confirmPassword)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      if (password !== confirmPassword)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Password and Current Password Are Not Same.',
        });
      const user = await User.findOne({ _id: req.user.id, removed: false });
      if (!user)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'account not found.',
        });
      const newUser = new User();
      const passwordHash = newUser.generateHash(password);
      const result = await User.findOneAndUpdate(
        { _id: user._id },
        { password: passwordHash },
        {
          new: true,
        }
      ).exec();
      await otpModel.deleteMany({ email: user.email })
      await otpModel.deleteMany({ phone: user.phone })
      res.json({
        success: true,
        result: null,
        message: 'Successfully changes password',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { value, resetType } = req.body;
      if (resetType === "email") {
        const user = await User.findOne({ email: value, removed: false });
        if (!user) {
          return res.status(400).json({
            success: false,
            result: null,
            message: 'account does not  exist with this email',
          });
        }
        const emailOtp = await new otpModel({
          email: value,
          otp: otpGenerator()
        }).save();
        const token = jwt.sign(
          {
            id: user._id,
            otp: emailOtp.otp
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        await SendMail(user.email, forgotPassword(emailOtp.otp, user.firstName, token), `${emailOtp.otp} is your StateBook account recovery code`)
        res.json({
          success: true,
          result: null,
          message: 'reset email sent Successfully',
        });
      } else if (resetType === "phone") {
        const userWithPhone = await User.findOne({ phone: value, removed: false });
        if (!userWithPhone) {
          return res.status(400).json({
            success: false,
            result: null,
            message: 'account does not  exist with this email',
          });
        }
        const phoneOtp = await new otpModel({
          phone: value,
          otp: otpGenerator()
        }).save();
        console.log(phoneOtp)
        res.json({
          success: true,
          result: null,
          message: 'reset code sent Successfully',
        });
      }


    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },
  verifyCode: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      const OtpData = await otpModel.findOne({
        otp: code
      })
      if (!OtpData) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'invalid otp.',
        });
      }
      console.log(OtpData)
      let user;
      if (OtpData.email) {
        user = await User.findOne({ email: OtpData.email, removed: false });
      } else if (OtpData.phone) {
        user = await User.findOne({ phone: OtpData.phone, removed: false });
      }

      const token = jwt.sign(
        {
          id: user._id,
          otp: code
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({
        success: true,
        result: token,
        message: 'otp Verified',
      });
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, code } = req.body;
      // validate
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      } const user = await User.findOne({ email: email, isEmailVerified: false, removed: false });
      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'account not found.',
        });
      }
      const emailOtp = otpModel.findOne({
        email: email,
        otp: code
      })
      if (emailOtp) {
        const result = await User.findOneAndUpdate(
          { email: email },
          { isEmailVerified: true, isActive: true },
          {
            new: true,
          }
        ).exec();
        await otpModel.remove({
          email: email
        })
        res.json({
          success: true,
          result: null,
          message: 'Email Verified Successfully ',
        });
      } else {
        res.json({
          success: true,
          result: null,
          message: 'Email Verification Failed ',
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },
  verifyPhone: async (req, res) => {
    try {
      const { phone, code } = req.body;
      // validate
      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Not all fields have been entered.',
        });
      } const user = await User.findOne({ phone: phone, isPhoneVerified: false, removed: false });
      if (!user) {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'account not found.',
        });
      }
      const phoneOtp = await otpModel.findOne({
        phone: phone,
        otp: code
      })
      if (phoneOtp) {
        console.log(phoneOtp)
        const result = await User.findOneAndUpdate(
          { phone: phone },
          { isPhoneVerified: true, isActive: true },
          {
            new: true,
          }
        ).exec();
        await otpModel.remove({
          phone: phone
        })
        res.json({
          success: true,
          result: null,
          message: 'Phone Verified Successfully ',
        });
      } else {
        res.json({
          success: true,
          result: null,
          message: 'Phone Verification Failed ',
        });
      }
    } catch (err) {
      res.status(500).json({ success: false, result: null, message: err.message, error: err });
    }
  },
  agents: async (req, res) => {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    try {
      const cRole = await Role.findOne({ roleType: 'agent' });
      const resultsPromise = await User.find({ role: cRole._id, removed: false })
        .select('-role -password -removed -enabled -isLoggedIn')
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' })
      // Counting the total documents
      const countPromise = User.count({ role: cRole._id, removed: false });
      // Resolving both promises
      const [result, count] = await Promise.all([resultsPromise, countPromise]);
      // Calculating total pages
      const pages = Math.ceil(count / limit);
      // Getting Pagination Object
      const pagination = { page, pages, count };
      if (count > 0) {
        return res.status(200).json({
          success: true,
          result,
          pagination,
          message: 'Successfully found all documents',
        });
      } else {
        return res.status(203).json({
          success: false,
          result: [],
          pagination,
          message: 'Collection is Empty',
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        result: [],
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },


  agentById: async (req, res) => {
    try {
      const result = await User.findOne({ _id: req.params.id, removed: false }).select('-role -password -removed -enabled -isLoggedIn')
      // If no results found, return document not found
      if (!result) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No document found by this id: ' + req.params.id,
        });
      } else {
        // Return success resposne
        return res.status(200).json({
          success: true,
          result,
          message: 'we found this document by this id: ' + req.params.id,
        });
      }
    } catch (err) {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },

  contactAgent: async (req, res) => {
    try {
      const result = await User.findOne({ _id: req.params.id, removed: false }).select('-role -password -removed -enabled -isLoggedIn')
      const appointment = await Appointment.findOne({ appointedTo: req.params.id, createdBy: req.user._id, removed: false, confirmation: false }).select('-role -password -removed -enabled -isLoggedIn')
      if (appointment) {
        res.status(400).json({
          success: true,
          result: null,
          message: 'You Already have pending Appointment',
        });
      } else {
        const body = { ...req.body }
        body.createdBy = req.user._id;
        body.appointedTo = result._id;
        await new Appointment(body).save();
        initScheduledJobs(req.body, result)
        // const html = MeetingSchedule(req.body, result);
        // SendMail('awhitlo4@asu.edu', html, "Appointment");
        res.status(200).json({
          success: true,
          result: null,
          message: 'Successfully Created Appointment',
        });
      }
    } catch (err) {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },


  getAppointMents: async (req, res) => {
    try {
      const query = { ...req.query }
      query.removed = false
      const result = await Appointment.find(query)
      // If no results found, return document not found
      if (!result) {
        return res.status(404).json({
          success: false,
          result: null,
          message: 'No appointments Found',
        });
      } else {
        // Return success resposne
        return res.status(200).json({
          success: true,
          result,
          message: 'Found Appointsments',
        });
      }
    } catch (err) {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },

  getUserList: async (req, res) => {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit; try {
      let query = { removed: false }
      //  Query the database for a list of all results
      const resultsPromise = User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' })
        .populate();
      // Counting the total documents
      const countPromise = User.count(query);
      // Resolving both promises
      const [result, count] = await Promise.all([resultsPromise, countPromise]);
      // Calculating total pages
      const pages = Math.ceil(count / limit);  // Getting Pagination Object
      const pagination = { page, pages, count };
      console.log(result)
      if (count > 0) {
        return res.status(200).json({
          success: true,
          result,
          pagination,
          message: 'Successfully found all documents',
        });
      } else {
        return res.status(203).json({
          success: false,
          result: [],
          pagination,
          message: 'Collection is Empty',
        });
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        success: false,
        result: [],
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },
  getRolesList: async (req, res) => {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit; try {
      let query = { removed: false }
      //  Query the database for a list of all results
      const resultsPromise = Role.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' })
        .populate();
      // Counting the total documents
      const countPromise = Role.count(query);
      // Resolving both promises
      const [result, count] = await Promise.all([resultsPromise, countPromise]);
      // Calculating total pages
      const pages = Math.ceil(count / limit);  // Getting Pagination Object
      const pagination = { page, pages, count };
      console.log(result)
      if (count > 0) {
        return res.status(200).json({
          success: true,
          result,
          pagination,
          message: 'Successfully found all documents',
        });
      } else {
        return res.status(203).json({
          success: false,
          result: [],
          pagination,
          message: 'Collection is Empty',
        });
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        success: false,
        result: [],
        message: 'Oops there is an Error',
        error: err,
      });
    }
  },
  logout: async (req, res) => {
    const result = await Admin.findOneAndUpdate(
      { _id: req.admin._id },
      { isLoggedIn: false },
      {
        new: true,
      }
    ).exec(); res.clearCookie('token');
    res.json({ isLoggedOut: true });
  },

}


module.exports = authCntrl