class DiscScanner{
    constructor(video,displayCanvas){
        //Get display canvas info
        this.dCanvas = displayCanvas;
        this.oCanvas = new Canvas();
        //this.oCanvas.appendSelf();
        this.video = video;

        //The disc number it is looking for
        this.targetNumber = -1;
        this.textScannerStatus = document.getElementById("textScannerStatus");
        this.scannerOn = false;
        this.updateScannerStatus();

        this.front=false;
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
        this.vProgram = new VisionProgram(this.oCanvas,this.dCanvas);
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        this.oCanvas.resize(this.videoWidth,this.videoHeight/2);
        this.vProgram.resizeOcanvas(this.videoWidth,this.videoHeight/2)
        this.oCanvas.resizeStyle(this.videoWidth,this.videoHeight/2,true);
        this.video.play();
        this.drawVideo();
        this.scannerOn = true;
        this.updateScannerStatus();
    }
    startScan(){        
        if(this.scannerOn) return;
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream)=>{this.handleSuccess(stream);});
    }
    stopScan(){
        if(!this.scannerOn) return;
        let stream = this.video.srcObject;
        if(stream==null) return;
        cancelAnimationFrame(this.animeRequest);
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        this.video.srcObject = null;
        this.scannerOn = false;
        this.updateScannerStatus();
    }
    drawVideo(){
        this.oCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        this.dCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/4);
        this.vProgram.run(this.targetNumber);
        this.animeRequest = requestAnimationFrame(()=>{this.drawVideo();});
    }
    addDiscNumber(number){
        this.targetNumber = number;
        this.startScan();
        window.scrollTo(0,0);
    }
    switchScannerOnOff(defaultInput){
        if(defaultInput==undefined){
            if(this.scannerOn){
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
    updateScannerStatus(){
        if(this.scannerOn){
            this.dCanvas.showCanvas();
            this.textScannerStatus.innerHTML = "Camera <B><font color='green'>ON</font></B>/OFF";
        }else{
            this.dCanvas.hideCanvas();
            this.textScannerStatus.innerHTML = "Camera ON/<B><font color='red'>OFF</font></B>";
        }
    }
}
console.log("Loaded: scanner.js");