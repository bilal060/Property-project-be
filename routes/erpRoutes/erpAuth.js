const express = require('express');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const {
  login,
  register,
  logout,
} = require('@/controllers/erpControllers/authJwtController ');
const { isValidAdminToken } = require('@/middlewares/Authentication');

router.route('/login').post(catchErrors(login));
router.route('/register').post(catchErrors(register));
router.route('/logout').post(isValidAdminToken, catchErrors(logout));

module.exports = router;
