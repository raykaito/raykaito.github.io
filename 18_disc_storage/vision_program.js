class VisionProgram{
    constructor(originalCanvas,displayCanvas){
        this.oCanvas = originalCanvas;
        this.dCanvas = displayCanvas;
        this.canvasScale = this.dCanvas.canvas.width/this.oCanvas.canvas.width;
    }
    locatePeaks(xi,yi,xf,yf){
        return [x,y];
    }
    newROI(x=0,y=0,width=1,height=1,theta=0){
        //Create New Canvas
        const roi = new Canvas();
        roi.resize(width,height);
        //Copy and paste the ROI from oCanvas
        roi.ct.save();
        roi.translate(-x,-y);
        roi.rotateRad(-theta);
        //Copy the region to ROI
        roi.ct.drawImage(this.oCanvas.canvas,0,0);
        roi.ct.restore();
        //Create Image Data
        const imgData = new ImageData([roi.ct.getImageData(0,0,width,height),x,y,theta]);
        return imgData;
    }
    displayImageDataO(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        log([tempCanvas.width,tempCanvas.height]);
        this.oCanvas.ct.save();
        this.oCanvas.translate(x,y);
        this.oCanvas.rotateRad(theta);
        this.oCanvas.drawImage(tempCanvas,0,0,tempCanvas.width,tempCanvas.height,0,0,tempCanvas.width,tempCanvas.height);
        this.oCanvas.drawRect("lime",0,0,tempCanvas.width,tempCanvas.height);
        this.oCanvas.ct.restore();
    }
    displayImageDataD(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        log([tempCanvas.width,tempCanvas.height]);
        this.dCanvas.ct.save();
        this.dCanvas.translate(x*this.canvasScale,y*this.canvasScale);
        this.dCanvas.rotateRad(theta);
        this.dCanvas.drawImage(tempCanvas,0,0,tempCanvas.width,tempCanvas.height,0,0,tempCanvas.width*this.canvasScale,tempCanvas.height*this.canvasScale);
        this.dCanvas.drawRect("lime",0,0,tempCanvas.width*this.canvasScale,tempCanvas.height*this.canvasScale);
        this.dCanvas.ct.restore();
    }
}

class ImageData{
    constructor([imgIn,xpos=0,ypos=0,theta=0]){
        this.imgIn = imgIn;
        this.xpos = xpos;
        this.ypos = ypos;
        this.width = imgIn.width;
        this.height= imgIn.height;
        this.theta= theta;

        this.imgOut = imgIn;
        for(let i=0;i<imgIn.data.length;i++){
            this.imgOut.data[i]=imgIn.data[i];
        }
    }
    get passData(){
        return [this.imgOut, this.xpos, this.ypos, theta];
    }
    prepareDisplayCanvas(){
        const tempCanvas = new Canvas();
        tempCanvas.resize(this.width,this.height);
        tempCanvas.ct.putImageData(this.imgOut,0,0);
        return [tempCanvas.canvas,this.xpos,this.ypos,this.theta];
    }
}

class LineScanner extends ImageData{
    constructor(imgIn,xpos=0,ypos=0,theta=0){
        super(imgIn,xpos,ypos,theta);
    }
}

console.log("Loaded: vision_program.js");