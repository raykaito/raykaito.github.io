class VisionProgram{
    constructor(){
        this.oCanvas = new Canvas();
        this.oimgdata;
        //Prepare DisplayCanvas
        this.dCanvas = new Canvas(document.getElementById('displayCanvas'));
        this.resizeOcanvas(1,1);

        this.houghTrans = new houghTransform();
        this.histogram = new Histogram();
        this.edgeExtraction = new Binary();
    }
    resizeOcanvas(width,height){
        this.oCanvas.resize(width,height);
        this.oCanvas.resizeStyle(width,height,true);
        this.dCanvas.flexResize(0.95,height/width);
        this.dCanvas.fillAll("white");
        table.width = this.dCanvas.canvas.style.width;
        this.width = width;
        this.height= height;
        this.wScale = this.dCanvas.canvas.width /this.oCanvas.canvas.width;
        this.hScale = this.dCanvas.canvas.height/this.oCanvas.canvas.height;
    }
    run(video){
        this.oCanvas.drawImage(video,0,0,this.width,this.height);
        this.dCanvas.drawImage(video,0,0,this.width,this.height);
        this.oimgdata = this.oCanvas.ct.getImageData(0,0,this.width,this.height);

        const width = 200;
        const height = 100;

        const lineDetectionROI_L = this.newROI((this.width-width)/2,(this.height-height)/2,width,height);
        this.histogram.autoBinarizeWithOtsuMethod(lineDetectionROI_L);
        graphA.update(this.histogram.bin);
        graphA.ct.strokeStyle = "red";
        graphA.ct.lineWidth = 1;
        graphA.line(this.histogram.thresh+1,1,this.histogram.thresh+1,101);

        this.edgeExtraction.updateROI(this.histogram.passROI);
        this.edgeExtraction.extractEdge(this.histogram.passROI);
        //this.displayImageDataD(this.edgeExtraction);

        const [inter_L, angle_L] = this.houghTrans.autoIntAngleAquisition(this.edgeExtraction.passROI);
        this.displayImageDataD(this.houghTrans);
        plotA.ct.strokeStyle = "red";
        plotA.ct.lineWidth = 1;
        const x = this.houghTrans.maxIndex%this.houghTrans.rangeTheta+1;
        const y = Math.floor(this.houghTrans.maxIndex/this.houghTrans.rangeTheta)+1;
        plotA.drawRect(x-3,y-3,7,7,"red");
        plotA.drawRect(x-2,y-2,5,5,"red");

    }
    newROI(x=0,y=0,width=1,height=1,theta=0,dx=0,dy=0){
        x=Math.floor(x);
        y=Math.floor(y);
        width=Math.floor(width);
        height=Math.floor(height);
        if(theta==0){
            //Crop from oimagedata
            let imgData = this.oCanvas.ct.createImageData(width,height);
            for(let xi=0;xi<width;xi++){
                for(let yi=0;yi<height;yi++){
                    const indexOut = this.xy2i([xi,yi],width);
                    const indexIn  = this.xy2i([xi+x+dx*yi,yi+y+dy*xi],this.width);
                    for(let i=0;i<4;i++){
                        imgData.data[indexOut*4+i] = this.oimgdata.data[indexIn*4+i];
                    }
                }
            }
            return [imgData, x,y,theta,dx,dy];
        }else{
            //Create New Canvas
            const roi = new Canvas();
            roi.resize(width,height);
            //Copy and paste the ROI from oCanvas
            roi.ct.save();
            roi.rotateRad(-theta);
            roi.translate(-x,-y);
            //Copy the region to ROI
            roi.ct.drawImage(this.oCanvas.canvas,0,0);
            roi.ct.restore();
            //Create Image Data
            return [roi.ct.getImageData(0,0,width,height),x,y,theta,dx,dy];
        }
    }
    displayImageDataO(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        const tc = tempCanvas.canvas;
        this.oCanvas.ct.lineWidth = 1;
        if(theta==0){            
            this.oCanvas.drawRect(-1+x,-1+y,tc.width+2,tc.height+2,"lime");
            this.oCanvas.drawImage(tc,0,0,tc.width,tc.height,x,y,tc.width,tc.height);
            imgData.odraw(this.oCanvas);
            return;
        }else{
            this.oCanvas.ct.save();
            this.oCanvas.translate(x,y);
            this.oCanvas.rotateRad(theta);
            this.oCanvas.drawRect(-1,-1,tc.width+2,tc.height+2,"lime");
            this.oCanvas.drawImage(tc,0,0,tc.width,tc.height,0,0,tc.width,tc.height);
            imgData.odraw(this.oCanvas);
            this.oCanvas.ct.restore();
        }
    }
    displayImageDataD(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        const tc = tempCanvas.canvas;
        this.dCanvas.ct.lineWidth = 1;
        if(theta==0){
            const xpos = Math.floor(x*this.wScale);
            const ypos = Math.floor(y*this.hScale);
            const width = Math.floor(tc.width*this.wScale);
            const height= Math.floor(tc.height*this.hScale);        
            this.dCanvas.drawRect(xpos-1,ypos-1,width+2,height+2,"lime");
            this.dCanvas.drawImage(tc,0,0,tc.width,tc.height,xpos,ypos,width,height);
            imgData.ddraw(this.dCanvas);
            return;
        }else{
            this.dCanvas.ct.save();
            this.dCanvas.translate(x*this.wScale,y*this.hScale);
            this.dCanvas.rotateRad(theta);
            this.dCanvas.drawRect(-1,-1,tc.width*this.wScale+2,tc.height*this.hScale+2,"lime");
            this.dCanvas.drawImage(tc,0,0,tc.width,tc.height,0,0,tc.width*this.wScale,tc.height*this.hScale);
            imgData.ddraw(this.dCanvas);
            this.dCanvas.ct.restore();
        }
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
}

class imgData{
    constructor(){
    }
    updateROI([imgIn,xpos,ypos,theta,dx,dy],imgOutInit="copy"){
        this.imgIn = {data:new Uint8ClampedArray(imgIn.width*imgIn.height*4)};
        this.imgIn.data.set(imgIn.data);
        this.xpos = xpos;
        this.ypos = ypos;
        this.width = imgIn.width;
        this.height= imgIn.height;
        this.theta= theta;
        this.imgOut = imgIn;
        this.dx = dx;
        this.dy = dy;
        if(imgOutInit!="copy"){
            for(let i=0;i<imgIn.data.length;i++){
                if(i%4==3){
                    this.imgOut.data[i]=255;
                }else{
                    this.imgOut.data[i]=imgOutInit;
                }
            }
        }
    }
    get passROI(){
        return [this.imgOut, this.xpos, this.ypos, this.theta,this.dx,this.dy];
    }
    prepareDisplayCanvas(){
        const tempCanvas = new Canvas();
        tempCanvas.resize(this.width,this.height);
        tempCanvas.ct.putImageData(this.imgOut,0,0);
        return [tempCanvas,this.xpos,this.ypos,this.theta];
    }
    odraw(){}
    ddraw(){}
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
    setPixXY(indexIn, value, type="all"){this.setPixI(this.xy2i(indexIn),value,type);}
    getPixXY(imgIn, indexIn, type="all"){return this.getPixI(imgIn,this.xy2i(indexIn, imgIn.width),type);}
    setPixI(index, value, type="all"){
        //Set the pixel based on type
        if(type=="all"){
            this.imgOut.data[4*index  ] = value;
            this.imgOut.data[4*index+1] = value;
            this.imgOut.data[4*index+2] = value;
        }else{
            this.imgOut.data[4*index+type] = value;
        }
    }
    getPixI(imgIn,index,type="all"){
        //Get the pixel based on type
        if(type=="all"){
            return (imgIn.data[4*index]+imgIn.data[4*index+1]+imgIn.data[4*index+2])/3;
        }else{
            return imgIn.data[4*index+type];
        }
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
}

class Histogram extends imgData{
    constructor(){
        super();
        this.bin = new Array(256).fill(0);
        this.otsu= new Array(256);
        this.thresh;
    }
    autoBinarizeWithOtsuMethod(ROI){
        this.updateROI(ROI);
        this.updateBin();
        this.getOtsu();
        this.getOtsuThresh();
        this.binarize();
    }
    updateBin(imgIn = this.imgIn){
        this.bin.fill(0);
        for(let i=0;i<imgIn.data.length/4;i++){
            this.bin[Math.floor(this.getPixI(imgIn,i))]++;
        }
    }
    getOtsu(){
        let totalP = new Array(this.bin.length).fill(0);
        let totalN = new Array(this.bin.length).fill(0);
        let firstAccumulativeP = new Array(this.bin.length).fill(0);
        let firstAccumulativeN = new Array(this.bin.length).fill(0);
        let secondAccumulativeP = new Array(this.bin.length).fill(0);
        let secondAccumulativeN = new Array(this.bin.length).fill(0);
        for(let i=0;i<this.bin.length;i++){
            totalP[i] = this.bin[i];
            firstAccumulativeP[i] = this.bin[i]*i;
            secondAccumulativeP[i] = this.bin[i]*i*i;
            if(i>0){
                totalP[i]+=totalP[i-1];
                firstAccumulativeP[i]+=firstAccumulativeP[i-1];
                secondAccumulativeP[i]+=secondAccumulativeP[i-1];
            }
        }
        for(let i=this.bin.length-1;i>=0;i--){
            totalN[i] = this.bin[i];
            firstAccumulativeN[i] = this.bin[i]*i;
            secondAccumulativeN[i] = this.bin[i]*i*i;
            if(i<this.bin.length-1){
                totalN[i]+=totalN[i+1];
                firstAccumulativeN[i]+=firstAccumulativeN[i+1];
                secondAccumulativeN[i]+=secondAccumulativeN[i+1];
            }
        }
        let otsu = new Array(256).fill(0);
        for(let i=0;i<this.bin.length;i++){
            const centerP = firstAccumulativeP[i]/Math.max(1,totalP[i]);
            const centerN = firstAccumulativeN[i]/Math.max(1,totalN[i]);
            const varianceP = secondAccumulativeP[i]-centerP*centerP*totalP[i];
            const varianceN = secondAccumulativeN[i]-centerN*centerN*totalN[i];
            otsu[i] = varianceP+varianceN;
        }
        this.otsu = otsu;    
    }
    getOtsuThresh(){
        this.thresh = getMinIndex(this.otsu);
    }
    binarize(){
        for(let i=0;i<this.imgIn.data.length/4;i++){
            const value = this.getPixI(this.imgIn,i);
            if(value>this.thresh){
                this.setPixI(i,255);
            }else{
                this.setPixI(i,0);
            }
        }
    }
}

class Binary extends imgData{
    constructor(){
        super();
    }
    updateROI(ROI){
        super.updateROI(ROI,0);
    }
    invert(){
        //Horizontal Edge Scan
        for(let y=0;y<this.height;y++){
            for(let x=0;x<this.width;x++){
                const value = (this.getPixXY(this.imgIn,[x,y]));
                this.setPixXY([x,y],255-value);
            }
        }
    }
    extractEdge(){
        //Horizontal Edge Scan
        for(let y=0;y<this.height;y++){
            let pastBlack = (this.getPixXY(this.imgIn,[0,y])==0);
            let nowBlack;
            for(let x=1;x<this.width;x++){
                nowBlack = (this.getPixXY(this.imgIn,[x,y])==0);
                if(nowBlack!=pastBlack){
                    if(nowBlack){
                        this.setPixXY([x,y],255);
                    }else{
                        this.setPixXY([x-1,y],255);
                    }
                    pastBlack = nowBlack;
                }
            }
        }
        //Vertical Edge Scan
        for(let x=0;x<this.width;x++){
            let pastBlack = (this.getPixXY(this.imgIn,[x,0])==0);
            let nowBlack;
            for(let y=1;y<this.height;y++){
                nowBlack = (this.getPixXY(this.imgIn,[x,y])==0);
                if(nowBlack!=pastBlack){
                    if(nowBlack){
                        this.setPixXY([x,y],255);
                    }else{
                        this.setPixXY([x,y-1],255);
                    }
                    pastBlack = nowBlack;
                }
            }
        }
    }
}

class houghTransform extends imgData{
    constructor(rho=100,theta=180){
        super();
        //range for rho and theta
        this.rangeRho = rho;
        this.rangeTheta = theta;
        this.intensity = new Array(this.rangeRho*this.rangeTheta);
        //important Parameters
        this.ySkip = 100;
        this.thetaStart = -90;
        this.scaleTheta = 1;
        this.scaleRho = 1;
    }
    autoIntAngleAquisition(ROI){
        this.updateROI(ROI);
        this.yLines(15);
        this.transform();
        this.detectLine();
        return [this.getXInter(), this.getAngle()];
    }
    yLines(numLine=10){
        this.ySkip = Math.floor(this.height/numLine);
    }
    transform(){
        const width = this.width;
        const height= this.height;
        this.scaleRho = this.rangeRho/width;
        this.intensity.fill(0);
        for(let i=1;i<this.imgIn.data.length/4;i++){
            const [x,y] = this.i2xy(i);
            if(y%this.ySkip!=0) continue;
            if(this.getPixI(this.imgIn,i)!=0){
                this.updateIntensity(x,y,1);
            }
        }
        plotA.update(this.intensity,this.rangeTheta);
    }
    updateIntensity(x,y,value){
        if(value==0) return;
        const radiusi = getDist(x,y);
        const thetai  = getDir(x,y);
        for(let theta=0;theta<this.rangeTheta;theta++){
            const currentTheta = thetai+deg2rad(this.thetaStart+this.scaleTheta*theta);
            const rho = radiusi*Math.cos(currentTheta);
            const rhoIndex = Math.floor(this.scaleRho*rho);
            this.intensity[rhoIndex*this.rangeTheta+theta]+=value;
        }
    }
    detectLine(){
        this.maxIndex = getMaxIndex(this.intensity);
        this.thetaMax = this.thetaStart+this.scaleTheta*(this.maxIndex%this.rangeTheta);
        this.rhoMax = 1/this.scaleRho*Math.floor(this.maxIndex/this.rangeTheta);
    }
    getXInter(){
        return this.xpos+this.rhoMax/Math.cos(deg2rad(this.thetaMax));
    }
    getAngle(){
        return this.thetaMax;
    }
    prepareDisplayCanvas(){
        const [tempCanvas,xpos,ypos,theta] = super.prepareDisplayCanvas();
        const xi=this.rhoMax/Math.cos(deg2rad(this.thetaMax));
        const yi=0;
        const xt=xi+this.height*Math.sin(deg2rad(this.thetaMax));
        const yt=this.height;
        tempCanvas.ct.strokeStyle = "lime";
        tempCanvas.ct.lineWidth = 2;
        tempCanvas.line(xi,yi,xt,yt);
        return [tempCanvas,xpos,ypos,theta];
    }
}

class LineScanner extends imgData{
    constructor(smoothrange = 1){
        super();
        this.lineIntensity = new Array(5);
        this.smoothrange = smoothrange;
    }
    autoLineIntensityAquisition(ROI){
        this.updateROI(ROI);
        this.updateLineIntensity();
        return this.lineIntensity;
    }
    getData(){
        let data = new Array(this.width);
        for(let i=0;i<this.width*this.height;i++){
            data[i]=this.getPixI(this.imgIn,i);
        }
        return data;
    }
    updateLineIntensity(){
        const d_0_original = this.getData();
        const d_1_smoothen = smoothenArray(d_0_original, this.smoothrange);
        const d_2_derivative = takeDerivative(d_1_smoothen);
        const d_3_dualInt = dualIntegrate(d_2_derivative);
        this.lineIntensity = highPass(getLineIntensity(d_3_dualInt));
    }
    scanForCode(ROI){
        this.updateROI(ROI);
        const rawData = this.getData();
        //Get each Bar (12 bars)
        let waitForBlack = true;
        let blackStart = -1;
        let center = new Array();
        let width = new Array();
        for(let i=rawData.length-1;i>=0;i--){
            if(waitForBlack){
                if(rawData[i]==0){
                    waitForBlack = false;
                    blackStart = i;
                }
            }else{
                if(rawData[i]!=0){
                    waitForBlack = true;
                    center[center.length] = (i+blackStart)/2;
                    width[width.length]  = blackStart-i;
                }
            }
            if(center.length==12) break;
        }
        //check for errors
        if(center.length<12) return "CodeNotFound";
        if(width[0]>width[11]) width.reverse();
        for(let i=1;i<center.length;i++){
            if(Math.abs(center[i]-center[i-1])>width[11]*2){
                return "CodeNotFound";
            }
        }        
        const thresh = (width[0]+width[11])/2;
        let binaryString = new String();
        for(let i=1;i<11;i++){
            binaryString+=(width[i]>thresh?"1":"0");
        }
        return [parseInt(binaryString,2),center[0],center[center.length-1]];
    }
}

const average=(imgdata,xrange=1,yrange=1)=>{
    let imgHolder = {data: new Array(imgdata.width*imgdata.height*4)};
    let counter, tempR, tempG, tempB, index;
    for(let y=0;y<imgdata.height;y++){
        counter = tempR = tempG = tempB = 0;
        for(let x=-xrange;x<imgdata.width+xrange;x++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(x+xrange<imgdata.width){
                counter++;
                tempR += imgdata.data[4*(index+xrange)+0];
                tempG += imgdata.data[4*(index+xrange)+1];
                tempB += imgdata.data[4*(index+xrange)+2];
            }
            
            if(x-xrange>=0){
                counter--;
                tempR -= imgdata.data[4*(index-xrange)+0];
                tempG -= imgdata.data[4*(index-xrange)+1];
                tempB -= imgdata.data[4*(index-xrange)+2];
            }
            if(x>=0&&x<imgdata.width){
                imgHolder.data[4*index  ] = tempR/counter;
                imgHolder.data[4*index+1] = tempG/counter;
                imgHolder.data[4*index+2] = tempB/counter;
            }
        }
    }
    for(let x=0;x<imgdata.width;x++){
        counter = tempR = tempG = tempB = 0;
        for(let y=-yrange;y<imgdata.height+yrange;y++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(y+yrange<imgdata.height){
                counter++;
                tempR += imgHolder.data[4*(index+yrange*imgdata.width)+0];
                tempG += imgHolder.data[4*(index+yrange*imgdata.width)+1];
                tempB += imgHolder.data[4*(index+yrange*imgdata.width)+2];
            }
            
            if(y-yrange>=0){
                counter--;
                tempR -= imgHolder.data[4*(index-yrange*imgdata.width)+0];
                tempG -= imgHolder.data[4*(index-yrange*imgdata.width)+1];
                tempB -= imgHolder.data[4*(index-yrange*imgdata.width)+2];
            }
            if(y>=0&&y<imgdata.height){
                imgdata.data[4*index  ] = tempR/counter;
                imgdata.data[4*index+1] = tempG/counter;
                imgdata.data[4*index+2] = tempB/counter;
            }
        }
    }
}

console.log("Loaded: vision_program.js");