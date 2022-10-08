const cloudinary = require('cloudinary').v2;

// Configure your cloud name, API key and API secret:
const myconfig = cloudinary.config({
  cloud_name: 'intaface',
  api_key: '685627258596357',
  api_secret: 'quqKw4VFSYsEDNVvqNA0LhOVSrs',
  secure: true
});

//CLOUD_NAME:intaface 
//API_KEY:685627258596357
//API_SECRET:quqKw4VFSYsEDNVvqNA0LhOVSrs

exports.myconfig = myconfig;
