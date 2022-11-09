const express = require('express');
const router = express.Router();
const path = require('path');
const { setSingleFilePathToBody, setMultipleFilePathToBody } = require('@/middlewares/setFilePathToBody');
const { catchErrors } = require('@/handlers/errorHandlers');
var multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const adminController = require('@/controllers/erpControllers/adminController');
const roleController = require('@/controllers/erpControllers/roleController');
const societyController = require('@/controllers/erpControllers/societyController');
const phaseController = require('@/controllers/erpControllers/phaseController');
const blockController = require('@/controllers/erpControllers/blockController');
const propertyController = require('@/controllers/erpControllers/propertyController');
const eventsController = require('@/controllers/erpControllers/eventsController');
const fileReaderController = require("@/controllers/erpControllers/fileReaderController")
const { isValidAdminToken } = require('@/middlewares/Authentication');
const { RoleCheck } = require('@/middlewares/RoleChecker');
const multipleUpload = require('@/middlewares/upload');
const WhatsAppCntrl = require('@/controllers/erpControllers/whatsAppController');


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
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/xlxsFiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileUpload = multer({ storage: storage });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Assets/sent");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.substring(file.originalname.indexOf(".") + 1);
    if (req.body.mediaType === 'audio' && ext !== 'mp3') {
      const uuid = uuidv4();
      cb(null, uuid + "." + 'ogg');
      req.body["fileName"] = uuid + "." + 'ogg';
    }
    else {
      const uuid = uuidv4();

      cb(null, uuid + "." + ext);
      req.body["fileName"] = uuid + "." + ext;
    }
  },
});

const WhatsAppfileUpload = multer({ storage: storage });

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


// // --------------------------------- Api for Events ---------------------

router.route('/events/create').post(RoleCheck, catchErrors(eventsController.create));
router.route('/events/list').get(RoleCheck, catchErrors(eventsController.list));
router.route('/events/read/:id').get(RoleCheck, catchErrors(eventsController.read));
router.route('/events/update/:id').patch(RoleCheck, catchErrors(eventsController.update));
router.route('/events/delete/:id').delete(RoleCheck, catchErrors(eventsController.delete));
// ------------------------------------ File Reader
router.route('/readfiledata/:id').post(fileUpload.array("xlsx"), catchErrors(fileReaderController.raedFileData));
router.route('/getProperties').get(catchErrors(fileReaderController.getPropertiesBySocietyId));

//  ---------------------------------- WhatsApp Route
router.post("/createMsg", WhatsAppCntrl.CreateMessage)
router.get("/createMsg", WhatsAppCntrl.createMsgGet)
router.get("/loadfile", WhatsAppCntrl.loadFile)
router.get("/loadAllMesssages", WhatsAppCntrl.loadAllMessages)
router.get("/last_message", WhatsAppCntrl.lastMessage)
router.post("/send_text_message", WhatsAppCntrl.sendTextMessage)
router.post("/send_multimedia_message", fileUpload.single("file"), WhatsAppCntrl.sendMultiMediaMessage)
module.exports = router;
