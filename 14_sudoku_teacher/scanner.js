startCamera = () => {
    const video = document.getElementById("player");
    let handleSuccess = function(stream) {
        video.srcObject = stream;
    };
    let front = false;
    let constraints = {
        audio: false,
        video: {
            width: 1920,
            height: 1080,
            facingMode: (front ? "user" : "environment")
        }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
    drawVideo();
}