class VideoStream{
    constructor(video,fullScreenCanvas){
        this.video = video;
        this.vProgram = new VisionProgram(fullScreenCanvas);
        this.streamerOn = false;

        this.front=true;
        this.constraints = {
            audio:false,
            video:{
                width:50,
                height:50,
                facingMode:(this.front?"user":"environment")
            }
        };
        this.videoWidth = -1;
        this.videoHeight= -1;

        //requestedFrame or Timeout
        this.animeRequest;
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        const sideLength = Math.min(mediaSettings.width, mediaSettings.height);
        this.videoWidth = sideLength;
        this.videoHeight= sideLength;
        this.vProgram.resizeOcanvas(this.videoWidth,this.videoHeight);
        this.video.play();
        this.streamerOn = true;
        this.drawVideo();
    }
    startScan(){        
        if(this.streamerOn) return;
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream)=>{this.handleSuccess(stream);});
    }
    stopScan(){
        if(!this.streamerOn) return;
        let stream = this.video.srcObject;
        if(stream==null) return;
        cancelAnimationFrame(this.animeRequest);
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        this.video.srcObject = null;
        this.streamerOn = false;
    }
    drawVideo(){
        if(this.streamerOn){
            this.vProgram.run(this.video);
            //this.animeRequest = requestAnimationFrame(()=>{this.drawVideo();});
            this.animeRequest = setTimeout(()=>{this.drawVideo();},30);
        }
    }
    switchStreamerOnOff(defaultInput){
        if(defaultInput==undefined){
            if(this.streamerOn){
                this.stopScan();
            }else{
                this.startScan();
            }
        }else if(defaultInput==false){
            this.stopScan();
        }else if(defaultInput==true){
            this.startScan();
        }
    }
}
console.log("Loaded: streamer.js");