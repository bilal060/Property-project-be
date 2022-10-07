const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.variables.env' });
const { stubFalse } = require('lodash');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const User = mongoose.model('User');
const Appointment = mongoose.model('Appointment');
const Role = mongoose.model('Role');
const SendMail = require('@/middlewares/SendEmail');
const MeetingSchedule = require('@/views/EmailTemplates/MeetingSchedule');
const initScheduledJobs = require('@/middlewares/croneJobs');
initScheduledJobs
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, userType, photo } = req.body;
    // validate
    if (!firstName || !lastName || !email || !password || !confirmPassword || !userType || !photo)
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
      firstName, lastName, email, password: passwordHash, role: cRole._id, photo: photo
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
          isLoggedIn: result.isLoggedIn,
          photo: result.photo,
          company: result.company,
          address: result.address,
          about: result.about,
        }
      },
      message: 'Successfully login user',
    });
  } catch (err) {
    res.status(500).json({ success: false, result: null, message: err.message, error: err });
  }
};


exports.updateUser = async (req, res) => {
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
};


exports.agents = async (req, res) => {
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
};


exports.agentById = async (req, res) => {
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
};

exports.contactAgent = async (req, res) => {
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
};


exports.getAppointMents = async (req, res) => {
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
};
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



