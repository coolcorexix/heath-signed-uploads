const cloudinary = require('cloudinary').v2;
require('../public/js/config');
const apiSecret = cloudinary.config().api_secret;

// Server-side function used to sign an upload with a couple of
// example eager transformations included in the request.
const signuploadform = () => {
  const timestamp = Math.round((new Date).getTime()/1000);

  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    transformation: 'q_50',
    eager: 'c_fill,g_auto:face,h_300,w_300',
    eager_async: 'true',
    folder: 'reaction_videos'}, apiSecret);

  return { timestamp, signature }
}

module.exports = {
  signuploadform
}
