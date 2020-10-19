class VisionProgram{
    constructor(fullScreenCanvas){
        this.oCanvas = new Canvas();
        this.oimgdata = new Array(2);//for Odd and Even
        this.listNumber = 15;
        this.smoothNumber = 5;
        this.spreadFactor = new Array(this.smoothNumber).fill(10);
        this.difference = new Array(this.difference).fill(0);
        this.xList = new Array(this.listNumber).fill(25);
        this.yList = new Array(this.listNumber).fill(25);
        this.counter = -1;
        //Prepare DisplayCanvas
        this.dCanvas = fullScreenCanvas;
        this.resizeOcanvas(1,1);
    }
    resizeOcanvas(width,height){
        this.oCanvas.resize(width,height);
        this.oCanvas.resizeStyle(width,height,true);
        this.width = width;
        this.height= height;
        this.oimgdata[0] = this.oCanvas.ct.createImageData(width,height);
        this.oimgdata[1] = this.oCanvas.ct.createImageData(width,height);
        this.oimgdiff = this.oCanvas.ct.createImageData(width,height);
        console.log("counter,cmx,cmy,cwTotal,ccwTotal,diff,totalMass,variance");
    }
    run(video){
        this.counter++;
        //Load video to Ocanvas and prepare Dcanvas
        const oddEven = this.counter%2;
        this.oCanvas.drawImage(video,0,0,this.width,this.height);
        this.oimgdata[oddEven] = this.oCanvas.ct.getImageData(0,0,this.width,this.height);
        if(this.counter==0) return;
        this.oimgdiff = this.oCanvas.ct.createImageData(this.width,this.height);
        this.dCanvas.resizeToFitScreen();
        this.dCanvas.drawFrame("lime");
        const sideLength = Math.min(this.dCanvas.canvas.width, this.dCanvas.canvas.height);
        const dWipeOffset = Math.floor(sideLength/100);
        const dWipeLength = Math.floor(sideLength/6);
        //Get CM position, delta position, total Mass and std
        let totalDifference = 0;
        let cmx = 0;
        let cmy = 0;
        for(let i=0;i<this.width*this.height;i++){
            const [x,y] = this.i2xy(i);
            let localDifference = 0;
            localDifference += Math.abs(this.oimgdata[0].data[4*i+0] - this.oimgdata[1].data[4*i+0]);
            localDifference += Math.abs(this.oimgdata[0].data[4*i+1] - this.oimgdata[1].data[4*i+1]);
            localDifference += Math.abs(this.oimgdata[0].data[4*i+2] - this.oimgdata[1].data[4*i+2]);
            this.oimgdiff.data[4*i+0] = localDifference;
            this.oimgdiff.data[4*i+1] = localDifference;
            this.oimgdiff.data[4*i+2] = localDifference;
            this.oimgdiff.data[4*i+3] = 255;
            totalDifference += localDifference;
            cmx += localDifference*x;
            cmy += localDifference*y;
        }
        cmx /= totalDifference;
        cmy /= totalDifference;
        let variance = 0;
        for(let i=0;i<this.width*this.height;i++){
            const [x,y] = this.i2xy(i);
            variance += Math.pow((x-cmx),2)*this.oimgdiff.data[4*i+0];
            variance += Math.pow((y-cmy),2)*this.oimgdiff.data[4*i+0];
        }
        variance/=this.width*this.height;
        this.xList[this.counter%this.listNumber] = cmx;
        this.yList[this.counter%this.listNumber] = cmy;
        const coeff = getFourierCoefficients(this.xList,this.yList);
        const [cwTotal,ccwTotal]= sum(coeff[0],coeff[1]);
        const diff = cwTotal-ccwTotal;
        this.spreadFactor[this.counter%this.smoothNumber] = totalDifference/variance;
        this.difference[this.counter%this.smoothNumber] = diff;
        if(average(this.spreadFactor)==NaN)alert("stop");
        console.log(this.counter+","+cmx+","+cmy+","+cwTotal+","+ccwTotal+","+average(this.difference)+","+totalDifference+","+variance);
        this.oCanvas.ct.putImageData(this.oimgdiff,0,0);

        this.dCanvas.drawImage(this.oCanvas.canvas,0,0,this.width,this.height,dWipeOffset,dWipeOffset,dWipeLength,dWipeLength);
        this.dCanvas.drawRect(dWipeOffset,dWipeOffset,dWipeLength,dWipeLength,"black");
        if(Math.abs(average(this.difference))>average(this.spreadFactor)/2&&Math.abs(average(this.difference))>15){
            window.scrollBy(0,average(this.difference)*5);
            this.dCanvas.fillRect(dWipeOffset+this.dCanvas.pixelRatio*(2*cmx-5),dWipeOffset+this.dCanvas.pixelRatio*(2*cmy-5),this.dCanvas.pixelRatio*10,this.dCanvas.pixelRatio*10,"red");
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

function num2n(num){
    const odd = (num%2==1);
    if(odd){
        return Math.ceil(num/2);
    }else{
        return Math.ceil(num/2)*-1;
    }
}

function sum(arrayx,arrayy){
    let totalPosi = 0;
    let totalNega = 0;
    for(let num=1;num<arrayx.length;num++){
        const n = num2n(num);
        if(n>0){
            totalPosi+=n*n*Math.sqrt(arrayx[n]*arrayx[n]+arrayy[n]*arrayy[n]);
        }else{
            totalNega+=n*n*Math.sqrt(arrayx[n]*arrayx[n]+arrayy[n]*arrayy[n]);
        }
    }
    return [totalPosi,totalNega];
}


function getFourierCoefficients(list,ilist){
    const numMax = Math.floor(list.length/5)*2+1;
    const T = list.length;
    const omega = 2*Math.PI/T;
    const fourierCoefficients = new Array(2);
    fourierCoefficients[0] = new Array(numMax);
    fourierCoefficients[1] = new Array(numMax);
    for(let num=0;num<numMax;num++){
        const n = num2n(num);
        let integral = 0;
        let integrali= 0;
        for(let t=0;t<list.length;t++){
            integral +=( list[t])*Math.cos(-1*n*t*omega);
            integrali+=( list[t])*Math.sin(-1*n*t*omega);
            integrali+=(ilist[t])*Math.cos(-1*n*t*omega);
            integral -=(ilist[t])*Math.sin(-1*n*t*omega);
        }
        fourierCoefficients[0][n] = integral/T;
        fourierCoefficients[1][n] = integrali/T;
    }
    return fourierCoefficients;
}

console.log("Loaded: vision_program.js");