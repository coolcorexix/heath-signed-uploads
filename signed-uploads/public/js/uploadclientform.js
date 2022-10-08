document.addEventListener('DOMContentLoaded', async () => {
	let camera_stream = null;
	let media_recorder = null;
	let blobs_recorded = [];

	var startTime = Date.now();
	var timeThreshold = 1000;
	var detectPermissionDialog = function(allowed) {
		console.log(allowed, Date.now() - startTime);
		if (Date.now() - startTime > timeThreshold) {
			
		}
		document.getElementById("tip-container").style.display = 'none';
	};
	var successCallback = function(stream) {
		detectPermissionDialog(true);
		
		camera_stream = stream;
		console.log(stream);
		// set MIME type of recording as video/webm
		media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });

		// event : new recorded video blob available 
		media_recorder.addEventListener('dataavailable', function (e) {
			// blobs_recorded.push(e.data);
			sendPieceOfVideoToServer(e.data);
			console.log('data available');
		});

		// start recording with each recorded blob having 1 second video
		media_recorder.start(3000);
		
		document.getElementById("tip-container").setAttribute("data-prop", "set");
		document.getElementById("tip-container").style.display = 'none';
		document.getElementById("description").style.display = 'block';
	};
	var errorCallback = function(error) {
		console.log(error);
		if ((error.name == 'NotAllowedError') ||
			(error.name == 'PermissionDismissedError')) {
			detectPermissionDialog(false);
		}

		document.getElementById("tip-container").setAttribute("data-prop", "set");
		document.getElementById("tip-container").style.display = 'none';
		document.getElementById("description").style.display = 'block';
		alert("Please allow camera and microphone and reload the page to continue.");
	};

	setTimeout(function() {
		if(document.getElementById("tip-container").getAttribute("data-prop") !== "set")
			document.getElementById("tip-container").style.display = 'block';
	}, 1000);
	navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(successCallback, errorCallback);

	// event : recording stopped & all blobs sent
	//media_recorder.addEventListener('stop', function () {
		// create local object URL from the recorded video blobs
		//let video_local = URL.createObjectURL(new Blob(blobs_recorded, { type: 'video/webm' }));
		//download_link.href = video_local;
	//});

	//	Cloudinary
	const signResponse = await fetch('/api/signuploadform');
	const signData = await signResponse.json();

	function sendPieceOfVideoToServer(eventData) {
		const formData = new FormData();
	
		// Append parameters to the form data. The parameters that are signed using 
		// the signing function (signuploadform) need to match these.
		formData.append("file", new Blob([eventData], { type: 'video/webm' }));
		formData.append("api_key", signData.apikey);
		formData.append("timestamp", signData.timestamp);
		formData.append("signature", signData.signature);
		formData.append("transformation", "q_50");
		formData.append("eager", "c_fill,g_auto:face,h_300,w_300");
		formData.append("eager_async", "true");
		formData.append("folder", "reaction_videos");

		fetch(url, {
			method: "POST",
			body: formData
		})
	}

	const url = "https://api.cloudinary.com/v1_1/" + signData.cloudname + "/auto/upload";
	const form = document.querySelector("form");

	form.addEventListener("submit", (e) => {
		e.preventDefault();

		const formData = new FormData();

		// Append parameters to the form data. The parameters that are signed using 
		// the signing function (signuploadform) need to match these.
		media_recorder.stop();
		formData.append("file", new Blob(blobs_recorded, { type: 'video/webm' }));
		formData.append("api_key", signData.apikey);
		formData.append("timestamp", signData.timestamp);
		formData.append("signature", signData.signature);
		formData.append("transformation", "q_50");
		formData.append("eager", "c_fill,g_auto:face,h_300,w_300");
		formData.append("eager_async", "true");
		formData.append("folder", "reaction_videos");

		fetch(url, {
			method: "POST",
			body: formData
		})
		
		        .then((response) => {
                                return response.text();
                        })
                        .then((data) => {
                                alert(data);
                                //console.log(JSON.parse(data))
                                //var str = JSON.stringify(JSON.parse(data), null, 4);
                                //document.getElementById("formdata").innerHTML += str;
                        });	
	});

})

