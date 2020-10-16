class VideoStream{
    constructor(video){
        this.video = video;
        this.vProgram = new VisionProgram();

        this.front=true;
        this.constraints = {
            audio:false,
            video:{
                width:800,
                height:800,
                facingMode:(this.front?"user":"environment")
            }
        };
        this.videoWidth = -1;
        this.videoHeight= -1;

        //Animation Properties
        this.animeRequest;

        //Initialize visionProgram
        this.textStreamerStatus = document.getElementById("textStreamerStatus");
        //this.startScan();
        this.updateStreamerStatus();
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        this.vProgram.resizeOcanvas(this.videoWidth,this.videoHeight)
        this.video.play();
        this.streamerOn = true;
        this.drawVideo();
        this.updateStreamerStatus();
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
        this.updateStreamerStatus();
    }
    drawVideo(){
        if(this.streamerOn){
            this.vProgram.run(this.video);
            this.animeRequest = requestAnimationFrame(()=>{this.drawVideo();});
        }
    }
    addDiscNumber(number){
        this.targetNumber = number;
        this.startScan();
        window.scrollTo(0,0);
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
    updateStreamerStatus(){
        if(this.streamerOn){
            this.textStreamerStatus.innerHTML = "Camera <B><font color='green'>ON</font></B>/OFF";
        }else{
            this.textStreamerStatus.innerHTML = "Camera ON/<B><font color='red'>OFF</font></B>";
        }
    }
}
console.log("Loaded: streamer.js");