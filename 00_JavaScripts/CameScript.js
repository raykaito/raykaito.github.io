class Camera{
	constructor(video){
		this.video = video;
	    this.handleSuccess = function(stream) {
	        video.srcObject = stream;
	    };
	    this.front = false;
	    this.constraints = {
	        audio: false,
	        video: {
	            width: 1920,
	            height: 1080,
	            facingMode: (this.front ? "user" : "environment")
	        }
	    };
	    navigator.mediaDevices.getUserMedia(this.constraints).then(this.handleSuccess);
	}
}

console.log("Loaded: CameScript.js");
