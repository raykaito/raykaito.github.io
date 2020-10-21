class VisionProgram{
    constructor(fullScreenCanvas){
        //Prepare Original/Display Canvas
        this.oCanvas = new Canvas();
        this.oimgdata = new Array(2);//for Odd and Even
        this.dCanvas = fullScreenCanvas;
        
        //For smoothening the data
        this.smoothNumber = 5;
        this.turnRate = new Array(this.smoothNumber).fill(0);
        this.shakeRate = new Array(this.smoothNumber).fill(0);

        //Record of center of mass (x,y) for Fourier Polynomial
        this.listNumber = 20;
        this.xList = new Array(this.listNumber).fill(25);
        this.yList = new Array(this.listNumber).fill(25);

        //Parameters to control the vision program
        this.counter = -1;
        this.mode = 0;//0:Scanning 1:Idle
        this.modeChangeAsked = 0;
        this.modeChangeAskedTime = 0;
        this.modeChangeAccepetedTime = 0;
        console.log("this.counter,cmx,cmy,cwTotal,ccwTotal,turnRate,totalDifference");
    }
    resizeOcanvas(width,height){
        //Resize the original canvas
        this.oCanvas.resize(width,height);
        this.oCanvas.resizeStyle(width,height,true);
        this.width = width;
        this.height= height;
        this.scanWidthMin = this.width/6;
        this.scanWidthMax = this.width-this.scanWidthMin;
        
        //Prepare the Image data
        this.oimgdata[0] = this.oCanvas.ct.createImageData(width,height);
        this.oimgdata[1] = this.oCanvas.ct.createImageData(width,height);
        this.oimgdiff = this.oCanvas.ct.createImageData(width,height);
        this.oimgdiff.data.fill(255);
    }
    run(video){
        //Inclement Counter and Update OddEven (0,1)
        this.counter++;
        const oddEven = this.counter%2;

        //Load video to original canvas
        this.oCanvas.drawImage(video,0,0,this.width,this.height);
        this.oimgdata[oddEven] = this.oCanvas.ct.getImageData(0,0,this.width,this.height);
        if(this.counter<=this.smoothNumber) return;

        //Get center of mass (x,y) and total difference
        let totalDifference = 0;
        let cmx = 0;
        let cmy = 0;
        for(let i=0;i<this.width*this.height;i++){
            const [x,y] = this.i2xy(i);
            let localDifference = 0;
            if(x<this.scanWidthMin||x>this.scanWidthMax||y<this.scanWidthMin||y>this.scanWidthMax){
                localDifference += Math.abs(this.oimgdata[0].data[4*i+0] - this.oimgdata[1].data[4*i+0]);
                localDifference += Math.abs(this.oimgdata[0].data[4*i+1] - this.oimgdata[1].data[4*i+1]);
                localDifference += Math.abs(this.oimgdata[0].data[4*i+2] - this.oimgdata[1].data[4*i+2]);
            }
            this.oimgdiff.data[4*i+0] = localDifference;
            this.oimgdiff.data[4*i+1] = localDifference;
            this.oimgdiff.data[4*i+2] = localDifference;
            totalDifference += localDifference;
            cmx += localDifference*x;
            cmy += localDifference*y;
        }
        cmx /= totalDifference;
        cmy /= totalDifference;
        
        this.oimgdiff.data[4*this.xy2i([cmx,cmy])+1] = 255;

        //Add center of mass to the x and y list
        this.xList[this.counter%this.listNumber] = cmx;
        this.yList[this.counter%this.listNumber] = cmy;

        //Get fourier coefficients based on the x and y list
        const coeff = getFourierCoefficients(this.xList,this.yList);
        const [mag,freq]= sum(coeff[0],coeff[1]);
        //grapher.update(this.xList,1);

        //Calculate the turn rate which controls the scroll
        this.turnRate[this.counter%this.smoothNumber] = freq;
        this.shakeRate[this.counter%this.smoothNumber]= totalDifference;
        console.log(this.counter+","+cmx+","+cmy+","+mag+","+freq+","+average(this.turnRate)+","+Math.abs(average(this.turnRate)));

        if(this.mode==0){
            //Prepare display canvas
            this.dCanvas.resizeToFitScreen();
            this.dCanvas.drawFrame(this.mode?"red":"lime");

            if(false){
                //Prepare wipe information
                const sideLength = Math.min(this.dCanvas.canvas.width, this.dCanvas.canvas.height);
                const dWipeOffset = Math.floor(sideLength/100)*this.dCanvas.pixelRatio;
                const dWipeLength = Math.floor(sideLength/6);
                const dcmx = dWipeLength*(cmx/this.width);
                const dcmy = dWipeLength*(cmy/this.height);

                //Draw wipe
                this.oimgdiff.data[4*(Math.floor(cmx)+Math.floor(cmy)*this.width)+2]=255
                this.oCanvas.ct.putImageData(this.oimgdiff,0,0);
                this.dCanvas.drawImage(this.oCanvas.canvas,0,0,this.width,this.height,dWipeOffset,dWipeOffset,dWipeLength,dWipeLength);
                this.dCanvas.drawRect(dWipeOffset,dWipeOffset,dWipeLength,dWipeLength,"black");
                this.dCanvas.fillRect(dWipeOffset+dcmx-5,dWipeOffset+dcmy-5,10,10,"red");
            }
            //Check for turn or mode change
            if(Math.abs(average(this.turnRate))>2&&this.mode==0){
                window.scrollBy(0,average(this.turnRate)*Math.abs(average(this.turnRate)));
                //console.log(average(this.turnRate));
                this.modeChangeAsked = 0;
                this.modeChangeAccepetedTime = Date.now();
            }
        }else{
            this.dCanvas.fillAll("black");
        }
        //this.dCanvas.ct.putImageData(this.oimgdiff,0,0);
        //this.dCanvas.drawImage(grapher.canvas,0,0,grapher.canvas.width,grapher.canvas.height,0,50,grapher.canvas.width,grapher.canvas.height);
        //Check for Mode Change
        if(getVariance(this.shakeRate)>40000){
            if(this.modeChangeAsked == 0&&Date.now()-this.modeChangeAccepetedTime>2000){
                this.modeChangeAsked = 1;
                this.modeChangeAskedTime = Date.now();
            }
        }
        if(this.modeChangeAsked){
            if(Date.now()-this.modeChangeAskedTime>200){
                this.modeChangeAsked = 0;
                this.modeChangeAccepetedTime = Date.now();
                this.mode = (this.mode+1)%2;
            }
        }


    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
}

function average(array){
    let total = 0;
    for(let i=0;i<array.length;i++){
        total+=array[i];
    }
    return total/array.length;
}

function getVariance(array){
    let total = 0;
    for(let i=0;i<array.length;i++){
        total+=array[i];
    }
    const average = total/array.length
    let variance = 0;
    for(let i=0;i<array.length;i++){
        variance += Math.pow((array[i]-average),2);
    }
    return Math.sqrt(variance/array.length);
}

function sum(arrayx,arrayy){
    //Take care of Odds first (positive freq);
    let sigo = new Array((arrayx.length+1)/2);
    for(let index=1;index<arrayx.length;index+=2){
        const frequency = (index+1)/2;
        sigo[frequency] = Math.sqrt(arrayx[index]*arrayx[index]+arrayy[index]*arrayy[index]);
    }
    //Take care of Evens (negative freq);
    let sige = new Array((arrayx.length+1)/2);
    for(let index=2;index<arrayx.length;index+=2){
        const frequency = index/2;
        sige[frequency] = Math.sqrt(arrayx[index]*arrayx[index]+arrayy[index]*arrayy[index]);
    }
    let mag = freq = 0;
    for(let index=1;index<sige.length;index++){
        mag += sigo[index]-sige[index];
        freq += (sigo[index]-sige[index])*index;
    }
    if(Math.abs(mag)>15){
        freq/=Math.abs(mag);
    }else{
        freq = 0;
    }
    return [mag,freq];
}

function getFourierCoefficients(list,ilist){
    const indexMax = 23;
    const freqMin = 1;
    const freqMax = 4;
    const T = list.length;
    const omega = 2*Math.PI/T;
    const fourierCoefficients = new Array(2);
    fourierCoefficients[0] = new Array(indexMax).fill(0);
    fourierCoefficients[1] = new Array(indexMax).fill(0);
    for(let index=0;index<indexMax;index++){
        let freq = 0;
        if(index!=0){
            const odd = index%2;
            freq = (index+odd-2)/(indexMax-3);// freq = [0/40,40/40]
            freq = freq*(freqMax-freqMin)+freqMin;// freq = [freqMin,freqMax];
            if(!odd) freq*=-1; //Even is negative
        }
        let integral = 0;
        let integrali= 0;
        for(let t=0;t<list.length;t++){
            integral +=( list[t]-fourierCoefficients[0][0])*Math.cos(-1*freq*t*omega);
            integrali+=( list[t]-fourierCoefficients[0][0])*Math.sin(-1*freq*t*omega);
            integrali+=(ilist[t]-fourierCoefficients[1][0])*Math.cos(-1*freq*t*omega);
            integral -=(ilist[t]-fourierCoefficients[1][0])*Math.sin(-1*freq*t*omega);
        }
        fourierCoefficients[0][index] = integral/T;
        fourierCoefficients[1][index] = integrali/T;
    }
    return fourierCoefficients;
}

console.log("Loaded: vision_program.js");