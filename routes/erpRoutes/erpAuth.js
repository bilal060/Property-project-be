const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { catchErrors } = require('@/handlers/errorHandlers');
const { isValidAdminToken, isLoggedin } = require('@/middlewares/Authentication');
const { setSingleFilePathToBody } = require('@/middlewares/setFilePathToBody');
const { RoleCheck } = require('@/middlewares/RoleChecker');
const authCntrl = require('@/controllers/erpControllers/authJwtController ');
var adminPhotoStorage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'public/uploads/user');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
  
});
const adminPhotoUpload = multer({ storage: adminPhotoStorage });
router.route('/login').post(catchErrors(authCntrl.login));
router.route('/register').post([adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(authCntrl.register));
router.route('/change-password').patch(isLoggedin, catchErrors(authCntrl.changePassword));
router.route('/user/:id').patch(isLoggedin, catchErrors(authCntrl.updateUser));
router.route('/ceoslist').get(isLoggedin, catchErrors(authCntrl.getCeos));
router.route('/forgotpassword').post(catchErrors(authCntrl.forgotPassword));
router.route('/verifyemail').post(catchErrors(authCntrl.verifyEmail))
router.route("/verifyphone").post(catchErrors(authCntrl.verifyPhone))
router.route("/accountverification").post(catchErrors(authCntrl.accountVerification))
router.route("/verifycode").post(catchErrors(authCntrl.verifyCode));
router.route("/resetpassword").post(isLoggedin, catchErrors(authCntrl.resetPassword));
router.route('/agents/list').get(catchErrors(authCntrl.agents))
router.route('/agents/read/:id').get(catchErrors(authCntrl.agentById))
router.route('/agents/contact/:id').post(isLoggedin, catchErrors(authCntrl.contactAgent));
router.route('/agents/appointements/list').get(isLoggedin, catchErrors(authCntrl.getAppointMents));
router.route('/userlist').get(isValidAdminToken, catchErrors(authCntrl.getUserList));
router.route('/roleslist').get(isValidAdminToken, catchErrors(authCntrl.getRolesList));
router.route('/logout').post(isValidAdminToken, catchErrors(authCntrl.logout));


module.exports = router;
