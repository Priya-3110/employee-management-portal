const fs = require('fs');
const path = require('path');

const removeUploadedFile = (publicPath) => {
  if (!publicPath) return;

  const fileName = path.basename(publicPath);
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  removeUploadedFile,
};
