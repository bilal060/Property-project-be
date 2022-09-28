const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const {
  login,
  register,
  logout,
} = require('@/controllers/erpControllers/authJwtController ');
const { isValidAdminToken } = require('@/middlewares/Authentication');
const { setSingleFilePathToBody } = require('@/middlewares/setFilePathToBody');
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
router.route('/logout').post(isValidAdminToken, catchErrors(logout));

module.exports = router;
