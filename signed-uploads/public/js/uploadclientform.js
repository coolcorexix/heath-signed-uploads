const YT_PlayerState_UNSTARTED = -1;
const YT_PlayerState_PLAYING = 1;
const REACTION_VIDEO_DURATION = 3000;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

let haveStartedRecording = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: "dV-znS6RPbQ",
    playerVars: { autoplay: 0, controls: 0 },
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

async function onPlayerStateChange(e) {
  if (haveStartedRecording || e.data !== YT_PlayerState_PLAYING) {
    return;
  }
  let camera_stream = null;
  let media_recorder = null;

  var startTime = Date.now();
  var timeThreshold = 1000;
  var detectPermissionDialog = function (allowed) {
    console.log(allowed, Date.now() - startTime);
    if (Date.now() - startTime > timeThreshold) {
    }
    document.getElementById("tip-container").style.display = "none";
  };
  var successCallback = function (stream) {
    detectPermissionDialog(true);

    camera_stream = stream;
    console.log(stream);
    // set MIME type of recording as video/webm
    media_recorder = new MediaRecorder(camera_stream, {
      mimeType: "video/webm",
    });

    // event : new recorded video blob available
    media_recorder.addEventListener("dataavailable", function (e) {
      sendPieceOfVideoToServer(e.data);
      console.log("data available");
    });

    // start recording with each recorded blob having REACTION_VIDEO_DURATION seconds video
    media_recorder.start(REACTION_VIDEO_DURATION);
	haveStartedRecording=true;

    document.getElementById("tip-container").setAttribute("data-prop", "set");
    document.getElementById("tip-container").style.display = "none";
    document.getElementById("description").style.display = "block";
  };
  var errorCallback = function (error) {
    console.log(error);
    if (
      error.name == "NotAllowedError" ||
      error.name == "PermissionDismissedError"
    ) {
      detectPermissionDialog(false);
    }

    document.getElementById("tip-container").setAttribute("data-prop", "set");
    document.getElementById("tip-container").style.display = "none";
    document.getElementById("description").style.display = "block";
    alert(
      "Please allow camera and microphone and reload the page to continue."
    );
  };

  setTimeout(function () {
    if (
      document.getElementById("tip-container").getAttribute("data-prop") !==
      "set"
    )
      document.getElementById("tip-container").style.display = "block";
  }, 1000);
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(successCallback, errorCallback);

  // event : recording stopped & all blobs sent
  //media_recorder.addEventListener('stop', function () {
  // create local object URL from the recorded video blobs
  //let video_local = URL.createObjectURL(new Blob(blobs_recorded, { type: 'video/webm' }));
  //download_link.href = video_local;
  //});

  //	Cloudinary


  async function sendPieceOfVideoToServer(eventData) {
	const signResponse = await fetch("/api/signuploadform");
	const signData = await signResponse.json();
	const url =
	  "https://api.cloudinary.com/v1_1/" + signData.cloudname + "/auto/upload";
    const formData = new FormData();

    // Append parameters to the form data. The parameters that are signed using
    // the signing function (signuploadform) need to match these.
    formData.append("file", new Blob([eventData], { type: "video/webm" }));
    formData.append("api_key", signData.apikey);
    formData.append("timestamp", signData.timestamp);
    formData.append("signature", signData.signature);
    formData.append("transformation", "q_50");
    formData.append("eager", "c_fill,g_auto:face,h_300,w_300");
    formData.append("eager_async", "true");
    formData.append("folder", "reaction_videos");

    fetch(url, {
      method: "POST",
      body: formData,
    });
  }
}
