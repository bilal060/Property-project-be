const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const {
  login,
  register,
  updateUser,
  logout,
  agents,
  agentById,
  contactAgent,
  getAppointMents,
  resetPassword,
  getUserList,
  getRolesList
} = require('@/controllers/erpControllers/authJwtController ');
const { isValidAdminToken, isLoggedin } = require('@/middlewares/Authentication');
const { setSingleFilePathToBody } = require('@/middlewares/setFilePathToBody');
const { RoleCheck } = require('@/middlewares/RoleChecker');
var adminPhotoStorage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'public/uploads/user');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const adminPhotoUpload = multer({ storage: adminPhotoStorage });
router.route('/login').post(catchErrors(login));
router.route('/register').post([adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(register));
router.route('/reset-password').patch(isLoggedin, catchErrors(resetPassword));
router.route('/user/:id').patch(isLoggedin, catchErrors(updateUser));
router.route('/agents/list').get(catchErrors(agents))
router.route('/agents/read/:id').get(catchErrors(agentById))
router.route('/agents/contact/:id').post(isLoggedin, catchErrors(contactAgent));
router.route('/agents/appointements/list').get(isLoggedin, catchErrors(getAppointMents));
router.route('/userlist').get(isValidAdminToken, catchErrors(getUserList));
router.route('/roleslist').get(isValidAdminToken, catchErrors(getRolesList));
router.route('/logout').post(isValidAdminToken, catchErrors(logout));


module.exports = router;
