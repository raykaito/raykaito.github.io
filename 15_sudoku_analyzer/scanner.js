class Scanner{
    constructor(){
        //Create Canvas for Original Video Image
        this.ocanvas = document.createElement("canvas");
        this.oct = this.ocanvas.getContext("2d");
        this.vWidth = 0;
        this.vHeight = 0;

        //Initialize Board Reader Class
        this.boardV = new VisionProgram_BoardReader();
        this.numberV= new VisionProgram_NumberReader();

        this.front=false;
        this.constraints = {
            audio:false,
            video:{
                //width:1920,
                //height:1080,
                width:480,
                height:590,
                facingMode:(this.front?"user":"environment")
            }
        };
        if(false){
            this.drawImage();
        }else{
            navigator.mediaDevices.getUserMedia(this.constraints).then(handleSuccess);
        }
    }
    handleSuccess(stream){
        video.srcObject = stream;
        this.resizeOcanvas(0);
        drawVideo();
    }
    stopVideo(){
        let stream = video.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        video.srcObject = null;
    }
    drawImage(){
        animationStartTime = Date.now();
        ct.restore();
        ct.save();
        if(width!=this.vWidth) this.resizeOcanvas(width);
        draw();
        this.oct.drawImage(canvas,0,0,width,height,0,0,this.vWidth,this.vWidth);
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result){requestAnimationFrame(drawImage);}
        else{       requestAnimationFrame(scanNumbers);}
    }
    drawVideo(){
        animationStartTime = Date.now();
        const newWidth = Math.min(video.videoWidth,video.videoHeight*(width/height));
        if(newWidth==0){
            requestAnimationFrame(drawVideo);
            return;
        }
        ct.restore();
        ct.save();
        if(newWidth!=this.vWidth) this.resizeOcanvas(newWidth);
        this.oct.drawImage(video,this.sx,this.sy,this.vWidth,this.vHeight,0,0,this.vWidth,this.vHeight);
              ct.drawImage(this.ocanvas,0,0,this.vWidth,this.vHeight,0,0,width,height);
        
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result) requestAnimationFrame(drawVideo);
        else{
            this.stopVideo();
            //draw();
            requestAnimationFrame(scanNumbers);
        }
    }
    drawProgress(){
        animationStartTime = Date.now();
        let result = false;
        //console.log("slider"+(slider.value+1));
        for(let i=0;i<Number(slider.value)+1;i++){
            result=this.numberV.makeProgress();
            if(result) break;
        }
        if(!result){
            requestAnimationFrame(scanNumbers);
        }else{
            const solvable = sudoku.startSolving();
            if(solvable==false){
                alert("Scanning process might have failed. Drag and Drop to correct the mistake.");
                changePhase("Correct Scanning Error");
                this.numberV.startCorrection();
            }
        }
    }
    userInput(inputType, x, y){
        this.numberV.userInput(inputType, x, y);
    }
    draw(){
        this.numberV.draw();
    }
    resizeOcanvas(newWidth){
        this.vWidth = newWidth;
        this.vHeight= newWidth*(height/width);
        if(this.vWidth!=0){
            if(video.videoWidth>video.videoHeight*(width/height)){
                this.sx = (video.videoWidth - video.videoHeight*(width/height))/2;
                this.sy = 0;
            }else{
                this.sx = 0;
                this.sy = (video.videoHeight - video.videoWidth*(height/width))/2;
            }
        }
        this.ocanvas.width = this.vWidth;
        this.ocanvas.height= this.vHeight;
        canvasScale = this.ocanvas.width/width;
        console.log("Ocanvas Dim: ("+this.ocanvas.width+","+this.ocanvas.height);
    }
}