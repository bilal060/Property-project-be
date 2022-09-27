const express = require('express');
const multer = require('multer');
const path = require('path');
const { setSingleFilePathToBody, setMultipleFilePathToBody } = require('@/middlewares/setFilePathToBody');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();
const adminController = require('@/controllers/erpControllers/adminController');
const roleController = require('@/controllers/erpControllers/roleController');
const societyController = require('@/controllers/erpControllers/societyController');
const phaseController = require('@/controllers/erpControllers/phaseController');
const blockController = require('@/controllers/erpControllers/blockController');
const propertyController = require('@/controllers/erpControllers/propertyController');
const { isValidAdminToken } = require('@/middlewares/Authentication');
const { RoleCheck } = require('@/middlewares/RoleChecker');
const multipleUpload = require('@/middlewares/upload');

// //_______________________________ Admin management_______________________________

var adminPhotoStorage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'public/uploads/user');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const adminPhotoUpload = multer({ storage: adminPhotoStorage });

router
  .route('/admin/create')
  .post([adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(adminController.create));
router.route('/admin/read/:id').get(catchErrors(adminController.read));
// router.route("/admin/update/:id").patch(catchErrors(adminController.update));
// router.route("/admin/delete/:id").delete(isValidAdminToken,catchErrors(adminController.delete));
router.route('/admin/search').get(catchErrors(adminController.search));
router.route('/admin/list').get(catchErrors(adminController.list));
router.route('/admin/profile').get(catchErrors(adminController.profile));
router.route('/admin/status/:id').patch([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(adminController.status));
// router
//   .route("/admin/photo")
//   .post(
//     [adminPhotoUpload.single("photo"), setSingleFilePathToBody],
//     catchErrors(adminController.photo)
//   );
// router
//   .route("/admin/password-update/:id")
//   .patch(catchErrors(adminController.updatePassword));

// //____________________________ Role management_______________________________

router.route('/role/create').post([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(roleController.create));
router.route('/role/read/:id').get(catchErrors(roleController.read));
router.route('/role/update/:id').patch([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(roleController.update));
router.route('/role/delete/:id').delete(isValidAdminToken, catchErrors(roleController.delete));
router.route('/role/search').get(catchErrors(roleController.search));
router.route('/role/list').get(catchErrors(roleController.list));
router.route('/role/filter').get(catchErrors(roleController.filter));


// ---------------------------------Api for Societies----------------

router.route('/society/create').post([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(societyController.create));
router.route('/society/list').get(catchErrors(societyController.list));
router.route('/society/read/:id').get(catchErrors(societyController.read));
router.route('/society/update/:id').patch([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(societyController.update));
router.route('/society/delete/:id').delete(isValidAdminToken, catchErrors(societyController.delete));
router.route('/society/getPictureByPath/:path').get(catchErrors(societyController.getPictureByPath));



// // ---------------------------------Api for Phases----------------
router.route('/phase/create').post([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(phaseController.create));
router.route('/phase/list').get(catchErrors(phaseController.list));
router.route('/phase/read/:id').get(catchErrors(phaseController.read));
router.route('/phase/getPhaseBySocietyId/:id').get(catchErrors(phaseController.getPhaseBySocietyId))
router.route('/phase/update/:id').patch([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(phaseController.update));
router.route('/phase/delete/:id').delete(isValidAdminToken, catchErrors(phaseController.delete));

// // ---------------------------------Api for Blocks-------------------
router.route('/block/create').post([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(blockController.create));
router.route('/block/list').get(catchErrors(blockController.list));
router.route('/block/read/:id').get(catchErrors(blockController.read));
router.route('/block/update/:id').patch([isValidAdminToken, adminPhotoUpload.single('photo'), setSingleFilePathToBody], catchErrors(blockController.update));
router.route('/block/delete/:id').delete(isValidAdminToken, catchErrors(blockController.delete));

// // ---------------------------------Api for Property---------------------

router.route('/property/create').post([RoleCheck, multipleUpload, setMultipleFilePathToBody], catchErrors(propertyController.create));
router.route('/property/list').get(catchErrors(propertyController.list));
router.route('/property/read/:id').get(catchErrors(propertyController.read));
router.route('/property/update/:id').patch([RoleCheck, multipleUpload, setMultipleFilePathToBody], catchErrors(propertyController.update));
router.route('/property/delete/:id').delete(RoleCheck, catchErrors(propertyController.delete));


module.exports = router;
