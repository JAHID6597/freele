const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "./public/uploads/";

    if (!fs.existsSync(dir))
      fs.mkdirSync(dir);

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });
module.exports = upload;