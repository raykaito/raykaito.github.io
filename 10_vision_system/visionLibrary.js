const dx = [1, 1, 0,-1,-1,-1, 0, 1];
const dy = [0, 1, 1, 1, 0,-1,-1,-1];

const newWindow = () => {
	return {
		centerWidthHeight : (centerX, centerY, widthIn, heightIn) => {
			let xpos = Math.floor(centerX-widthIn /2);
			let ypos = Math.floor(centerY-heightIn/2);
			return new ImageData([hct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerWidthHeight : (xpos, ypos, widthIn, heightIn) => {
			return new ImageData([hct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerToCorner : (xmin, ymin, xmax, ymax) => {
			return new ImageData([hct.getImageData(xmin, ymin, (xmax-xmin), (ymax-ymin)), xmin, ymin]);
		}
	};
}

class ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		//Set up variables
		this.imgIn= imgIn;
		this.xpos = xpos;
		this.ypos = ypos;
		this.dxpos= Math.floor(xpos/canvasScale);
		this.dypos= Math.floor(ypos/canvasScale);
		
		this.width  = imgIn.width;
		this.height = imgIn.height;
		this.area   = this.width*this.height;
		this.dwidth = Math.floor(this.width/canvasScale);
		this.dheight= Math.floor(this.height/canvasScale);
		this.darea  = this.dwidth*this.dheight;
		
		this.imgOut = hct.createImageData(this.width , this.height);
		this.dimgOut = ct.createImageData(this.dwidth, this.dheight);

		//Initialize dimgOut
		for(let i=0;i<imgIn.data.length;i++){
			this.imgOut.data[i] = imgIn.data[i];
		}
		return this;
	}
	//getters and setters
	get passdata(){return [this.imgOut, this.xpos, this.ypos]; }
	get dimageOut(){
		this.updateDisplayImage();
		return this.dimgOut;
	}

	display(){
		this.updateDisplayImage();
		//ct.putImageData(this.imgOut, 0,0);//this.dxpos, this.dypos);
		ct.putImageData(this.dimgOut, this.dxpos, this.dypos);
		ct.strokeStyle = "rgb(0,255,0)";
		ct.lineWidth = 0;
		ct.rect(this.dxpos+0.5,this.dypos+0.5,this.dwidth-1,this.dheight-1);
		ct.stroke();
	}
	updateDisplayImage(){
		let xy;
		for(let i=0;i<this.darea;i++){
			xy = this.i2xy(i, this.dwidth);
			xy[0]*=canvasScale;
			xy[1]*=canvasScale;
			this.dimgOut.data[4*i  ] = this.getPix(this.imgOut,xy, 0);
			this.dimgOut.data[4*i+1] = this.getPix(this.imgOut,xy, 1);
			this.dimgOut.data[4*i+2] = this.getPix(this.imgOut,xy, 2);
			this.dimgOut.data[4*i+3] = this.getPix(this.imgOut,xy, 3);
		}
	}
	xy2i(xy,width=this.width){
		return Math.floor(xy[0])+width*Math.floor(xy[1]);
	}
	i2xy(i, width=this.width){
		return [i%width, Math.floor(i/width)];
	}
	setPix(indexIn, value, type){
		//Check if indexIn is xy or index
		let index;
		if(indexIn.length==2) 	index = this.xy2i(indexIn);
		else					index = indexIn;

		//Set the pixel based on type
		if(type=="all"||type==0) this.imgOut.data[4*index+0] = value;
		if(type=="all"||type==1) this.imgOut.data[4*index+1] = value;
		if(type=="all"||type==2) this.imgOut.data[4*index+2] = value;
	}
	getPix(imgIn, indexIn, type){
		//Check if indexIn is xy or index
		let index;
		if(indexIn.length==2) 	index = this.xy2i(indexIn, imgIn.width);
		else					index = indexIn;

		//Get the pixel based on type
		let rgbValue =0;
		if(type=="all"||type==0) rgbValue += imgIn.data[4*index+0];
		if(type=="all"||type==1) rgbValue += imgIn.data[4*index+1];
		if(type=="all"||type==2) rgbValue += imgIn.data[4*index+2];
		if(				type==3) rgbValue += imgIn.data[4*index+3];
		if(type=="all") rgbValue /= 3;

		return rgbValue;
	}
}

class RotatableImageData extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.length = Math.floor(Math.sqrt(this.width*this.width+this.height*this.height));
		this.rotatedImageData = new Array(this.length*this.length*3);
	}
	rotateImage(angle = 0, centerxy = [this.width/2, this.height/2]){
		let x, y, xo, yo, index;
		let a, b,  c,  d, theta;
		
		theta = -1*angle*Math.PI/180;
		a = Math.cos(theta);
		b = Math.sin(theta);
		c = -b;
		d = a;
		
		for(let i=0;i<this.length*this.length;i++){
			xo = i%this.length-this.length/2+this.width/2-centerxy[0];
			yo = Math.floor(i/this.length-this.length/2+this.height/2-centerxy[1]);
			x  = Math.floor(xo*a + yo*c+centerxy[0]);
			y  = Math.floor(xo*b + yo*d+centerxy[1]);

			if(x<0||x>=this.width||y<0||y>=this.height){
				this.rotatedImageData[3*i+0] = 255;
				this.rotatedImageData[3*i+1] = 255;
				this.rotatedImageData[3*i+2] = 255;
				continue;
			}
			index = this.xy2i([x,y],this.width);
			this.rotatedImageData[3*i+0] = this.getPix(this.imgIn, index, 0);
			this.rotatedImageData[3*i+1] = this.getPix(this.imgIn, index, 1);
			this.rotatedImageData[3*i+2] = this.getPix(this.imgIn, index, 2);
		}
	}
	pasteRotatedImageData(){
		for(let i=0;i<this.area;i++){
			let xy = this.i2xy(i, this.width);
			xy[0] = Math.floor(xy[0]+this.length/2-this.width/2);
			xy[1] = Math.floor(xy[1]+this.length/2-this.height/2);
			this.setPix(i, this.rotatedImageData[3*this.xy2i(xy, this.length)+0], 0);
			this.setPix(i, this.rotatedImageData[3*this.xy2i(xy, this.length)+1], 1);
			this.setPix(i, this.rotatedImageData[3*this.xy2i(xy, this.length)+2], 2);
		}
		hct.putImageData(this.imgOut, 0, 0);
	}
}

class derivativeFilter extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.horizontalDerivative = new Array(this.area).fill(0);
		this.verticalDerivative = new Array(this.area).fill(0);
		this.maximumDerivative = new Array(this.area).fill(0);
		this.threshholdToMaxRatio = 5;
		this.scanDerivative();
	}
	applyFilter(){
		let threshhold = 0;
		for(let i=0;i<this.area;i++){
			threshhold = Math.max(threshhold, this.maximumDerivative[i]);
		}
		threshhold /= this.threshholdToMaxRatio;

		let averageRGB;
		let darkPixelCount = 0;
		for(let index=0;index<this.area;index++){
			if(this.maximumDerivative[index]>threshhold){
				averageRGB = 0;
				darkPixelCount++;
			}else{
				averageRGB = 255;
			}
			this.setPix(index, averageRGB, "all");
		}
		return darkPixelCount/this.area;
	}
	scanDerivative(){
		let newRGB, lastRGB;
		for(let x=0; x<this.width;x++){
			for(let y=0; y<this.height;y++){
				if(y==0){
					lastRGB = this.getPix(this.imgIn, [x,y], "all");
					continue;
				}
				newRGB = this.getPix(this.imgIn, [x,y], "all");
				this.verticalDerivative[this.xy2i([x,y],this.width)] = Math.abs(lastRGB-newRGB);
				lastRGB = newRGB;
			}
		}
		for(let y=0; y<this.height;y++){
			for(let x=0; x<this.width;x++){
				if(x==0){
					lastRGB = this.getPix(this.imgIn, [x,y], "all");
					continue;
				}
				newRGB = this.getPix(this.imgIn, [x,y], "all");
				this.horizontalDerivative[this.xy2i([x,y],this.width)] = Math.abs(lastRGB-newRGB);
				lastRGB = newRGB;
			}
		}
		for(let i=0;i<this.area;i++) this.maximumDerivative[i] = Math.max(this.horizontalDerivative[i], this.verticalDerivative[i]);
	}
}

class FindLine extends RotatableImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.lineIntensity = new Array(this.length);
		this.maxIntensityIndex;
		this.maxIntensity;
		this.angle = 0;
	}
	set scanAngle(value){this.angle = value;}

	findIntersection(){
		const angleIndex = this.findMaxIntensityAngle();
		this.angle = angleIndex[0]+90;
		this.scanIntensity();
		const coordinateBeforeRotation = [angleIndex[1], this.length-this.maxIntensityIndex];

		console.log(coordinateBeforeRotation);
		console.log(this.angle-90);

		const theta = -1*(this.angle-90)*Math.PI/180;
		const abcd = [Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta)];

		const xo = coordinateBeforeRotation[0]-this.length/2;
		const yo = coordinateBeforeRotation[1]-this.length/2;
		const x  = Math.floor(xo*abcd[0] + yo*abcd[2] + this.width/2);
		const y  = Math.floor(xo*abcd[1] + yo*abcd[3] + this.height/2);

		circle(this.dxpos+x/canvasScale, this.dypos+y/canvasScale, 10);


		return [this.xpos+x, this.ypos+y, this.angle];
	}

	findMaxIntensityAngle(){
		let maxIntensityAtAngle = 0;
		let maxIntensityAngle = 0;
		let maxIntensityIndex = 0;
		for(let i=0;i<180;i++){
			this.angle = i;
			this.scanIntensity();
			if(this.maxIntensity>maxIntensityAtAngle){
				maxIntensityAtAngle = this.maxIntensity;
				maxIntensityAngle   = this.angle;
				maxIntensityIndex   = this.maxIntensityIndex;
			}
		}
		return [maxIntensityAngle, maxIntensityIndex];
	}
	
	scanIntensity(){
		this.rotateImage(this.angle);
		this.maxIntensity = 0;
		this.maxIntensityIndex = 0;
		for(let i=0;i<this.length;i++){
			this.lineIntensity[i] = 0;
			for(let j=0;j<this.length;j++){
				this.lineIntensity[i] += (255-this.rotatedImageData[3*(i+j*this.length)]);
			}
			if(this.lineIntensity[i]>this.maxIntensity){
				this.maxIntensity = this.lineIntensity[i];
				this.maxIntensityIndex = i;
			}
		}
	}
	updateDisplayImage(){
		super.updateDisplayImage();
		let y, x, xtemp, ytemp;
		let theta = this.angle*Math.PI/180;
		for(let x=0;true&&x<this.dwidth;x++){
			xtemp = this.dwidth/2-x;
			y = xtemp*Math.tan(theta);
			y = Math.floor(y+this.dheight/2);
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)  ] = 255;
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)+1] =   0;
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)+2] = 255;
		}
		for(let y=0;true&&y<this.dheight;y++){
			ytemp = y-this.dheight/2;
			x = ytemp*Math.tan(Math.PI/2+theta);
			x = Math.floor(x+this.dwidth/2);
			if(x<0||x>=this.dwidth) continue;
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)  ] = 255;
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)+1] =   0;
			this.dimgOut.data[4*this.xy2i([x,y],this.dwidth)+2] = 255;
		}
	}
	displayGraph(){
		this.scanIntensity();
		ct.fillStyle = "rgb(255,  0,255)";
		ct.fillRect(0,0,202,102);
		ct.fillStyle = "rgb(255,255,255)";
		ct.fillRect(1,1,200,100);
		ct.fillStyle = "rgb(  0,  0,  0)";
		let index, intensity;
		for(let i=0;i<200;i++){
			index = Math.floor(i*this.length/200);
			intensity = 100*this.lineIntensity[index]/this.maxIntensity;
			ct.fillRect(i+1,101-intensity,1,intensity);
		}
	}
}

class Filter extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
	}
	horizontalFuzzy(range = 1){
		if(range==0) return;
		let counter, tempR, tempG, tempB, index;
		for(let y=0;y<this.height;y++){
			counter = tempR = tempG = tempB = 0;
			for(let x=-range;x<this.width+range;x++){
				index = this.xy2i([x,y], this.width);
				
				if(x+range<this.width){
					counter++;
					tempR += this.getPix(this.imgIn, index+range, 0);
					tempG += this.getPix(this.imgIn, index+range, 1);
					tempB += this.getPix(this.imgIn, index+range, 2);
				}
				
				if(x-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range, 0);
					tempG -= this.getPix(this.imgIn, index-range, 1);
					tempB -= this.getPix(this.imgIn, index-range, 2);
				}
				this.imgOut.data[4*index  ] = tempR/counter;
				this.imgOut.data[4*index+1] = tempG/counter;
				this.imgOut.data[4*index+2] = tempB/counter;
			}
		}
	}
	verticalFuzzy(range = 1){
		if(range==0) return;
		let counter, tempR, tempG, tempB, index;
		for(let x=0;x<this.width;x++){
			counter = tempR = tempG = tempB = 0;
			for(let y=-range;y<this.height+range;y++){
				index = this.xy2i([x,y], this.width);
				
				if(y+range<this.height){
					counter++;
					tempR += this.getPix(this.imgIn, index+range*this.width, 0);
					tempG += this.getPix(this.imgIn, index+range*this.width, 1);
					tempB += this.getPix(this.imgIn, index+range*this.width, 2);
				}
				
				if(y-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range*this.width, 0);
					tempG -= this.getPix(this.imgIn, index-range*this.width, 1);
					tempB -= this.getPix(this.imgIn, index-range*this.width, 2);
				}
				this.imgOut.data[4*index  ] = tempR/counter;
				this.imgOut.data[4*index+1] = tempG/counter;
				this.imgOut.data[4*index+2] = tempB/counter;
			}
		}
	}
	fuzzy(range = 1){
		if(range==0) return;
		let imgHolder = {data: new Array(this.area*4)};
		//let imgHolder.data = new Array(this.area*4);
		let counter, tempR, tempG, tempB, index;
		for(let y=0;y<this.height;y++){
			counter = tempR = tempG = tempB = 0;
			for(let x=-range;x<this.width+range;x++){
				index = this.xy2i([x,y], this.width);
				
				if(x+range<this.width){
					counter++;
					tempR += this.getPix(this.imgIn, index+range, 0);
					tempG += this.getPix(this.imgIn, index+range, 1);
					tempB += this.getPix(this.imgIn, index+range, 2);
				}
				
				if(x-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range, 0);
					tempG -= this.getPix(this.imgIn, index-range, 1);
					tempB -= this.getPix(this.imgIn, index-range, 2);
				}
				if(x>=0&&x<this.width){
					imgHolder.data[4*index  ] = tempR/counter;
					imgHolder.data[4*index+1] = tempG/counter;
					imgHolder.data[4*index+2] = tempB/counter;
				}
			}
		}
		for(let x=0;x<this.width;x++){
			counter = tempR = tempG = tempB = 0;
			for(let y=-range;y<this.height+range;y++){
				index = this.xy2i([x,y], this.width);
				
				if(y+range<this.height){
					counter++;
					tempR += this.getPix(imgHolder, index+range*this.width, 0);
					tempG += this.getPix(imgHolder, index+range*this.width, 1);
					tempB += this.getPix(imgHolder, index+range*this.width, 2);
				}
				
				if(y-range>=0){
					counter--;
					tempR -= this.getPix(imgHolder, index-range*this.width, 0);
					tempG -= this.getPix(imgHolder, index-range*this.width, 1);
					tempB -= this.getPix(imgHolder, index-range*this.width, 2);
				}
				if(y>=0&&y<this.height){
					this.imgOut.data[4*index  ] = tempR/counter;
					this.imgOut.data[4*index+1] = tempG/counter;
					this.imgOut.data[4*index+2] = tempB/counter;
				}
			}
		}
	}
}

class FindBlob extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.blobMap  = new Array(this.area);
		this.dblobMap = new Array(this.darea);
		this.blobInfo= new Array();//[Area, xMin, yMin, xMax, yMax]
		this.blobNumber = 0;
		this.maxArea = 0;
		this.maxAreaIndex = 0;
	}
	get blobNum(){
		return this.blobNumber;
	}
	updateDisplayImage(){
		super.updateDisplayImage();
		let xy;
		for(let i=0;i<this.darea;i++){
			xy = this.i2xy(i, this.dwidth);
			xy[0]*=canvasScale;
			xy[1]*=canvasScale;
			this.dblobMap[i] = this.blobMap[this.xy2i(xy,this.imgOut.width)];
		}
		for(let i=0;i<this.darea;i++){
			if(this.getPix(this.dimgOut,i,1)==0&&this.dblobMap[i]!=(10*(this.maxAreaIndex+1))){
				this.dimgOut.data[4*i+0]=0;
				this.dimgOut.data[4*i+2]=0;
			}
		}
	}
	eraseSmallerBlobs(){
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
				this.setPix(i, 255, "all");
			}
		}
	}
	scanBlobs(){
		//Init the information
		this.blobNumber = 0;
		for(let i=0;i<this.area;i++){
			this.blobMap[i]=0;
		}
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgOut,i,0)==255) continue;
			if(this.blobMap[i]!=0) continue;
			this.blobNumber++;

			//Set up variables
			let tx = new Array();//Temps[]
			let ty = new Array();//Temps[]
			let left, right;
			let tim = 0;			//Temp Index Maximum
			let tic = 0;			//Temp Index Current
			tx[0] = i%this.width;
			ty[0] = Math.floor(i/this.width);

			let area, xMin, yMin, xMax, yMax;
			area = 0;
			xMin = xMax = tx[0]; 
			yMin = yMax = ty[0];

			while(tim!=-1){
				//go up until the end
				while(ty[tic]>=0&&this.getPix(this.imgOut, [tx[tic],ty[tic]-1], 0)==0){
					ty[tic]--;
				}

				//Trun off Left Right and check for yMin
				left  = false;
				right = false;
				yMin = Math.min(yMin,ty[tic]);
				while(ty[tic]<this.height&&this.getPix(this.imgOut, [tx[tic],ty[tic]], 0)==0){
					//Travel down one by one
					let index = this.xy2i([tx[tic],ty[tic]], this.imgOut.width);
					this.blobMap[index] = this.blobNumber*10;
					this.imgOut.data[4*index+0] = 255;
					this.imgOut.data[4*index+1] = 0;
					this.imgOut.data[4*index+2] = 255;
					area++;

					//Check for Cell on Left
					if(tx[tic]>0){
						if(left!=(this.getPix(this.imgOut, [tx[tic]-1,ty[tic]], 0)==0)){
							left = !left;
							if(left){
								xMin = Math.min(xMin,tx[tic]-1);
								ty.splice(0,0,ty[tic]);
								tx.splice(0,0,tx[tic]-1);
								tim++;
								tic++;
							}
						}
					}

					//Check for Cell on Right
					if(tx[tic]<this.width-1){
						if(right!=(this.getPix(this.imgOut, [tx[tic]+1,ty[tic]], 0)==0)){
							right = !right;
							if(right){
								xMax = Math.max(xMax,tx[tic]+1);
								ty.splice(0,0,ty[tic]);
								tx.splice(0,0,tx[tic]+1);
								tim++;
								tic++;
							}
						}
					}
					ty[tic]++;
				}
				yMax = Math.max(yMax,ty[tic]-1);
				tim--;
				tic=tim;
			}
			this.blobInfo[this.blobNumber-1] = [area, xMin, yMin, xMax, yMax];
			if(area>this.maxArea){
				this.maxArea = area;
				this.maxAreaIndex = this.blobNumber-1;
			}
		}
		console.log(this.blobNumber+" blobs found. Largest Area: "+this.maxArea+" pixels.");
	}
}

class Binarize extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.histogram = new Array(256).fill(0);
		this.smoothHistogram = new Array(256).fill(0);
		this.max;
		this.threshhold = 64;
		this.updateHistogram();
	}
	set thresh(threshIn){
		this.threshhold = threshIn;
	}
	updateSmoothHistogram(range = 1){
		this.smoothHistogram = smoothenArray(this.histogram, range);
		console.log(countLocalMax(this.smoothHistogram));
	}
	updateHistogram(){
		let index;
		for(let i=0;i<this.histogram.length;i++) this.histogram[i]=0;
		for(let i=0;i<this.imgIn.data.length;i+=4){
			index  = Math.floor(this.getPix(this.imgIn,i,"all"));
			this.histogram[index]++;
		}
		this.max = this.histogram.reduce((a,b)=>{return Math.max(a,b);},0);
	}
	binarize(){
		let darkness;
		for(let i=0;i<this.width*this.height;i++){
			darkness = this.imgIn.data[4*i+0];
			darkness+= this.imgIn.data[4*i+1];
			darkness+= this.imgIn.data[4*i+2];
			for(let c=0;c<3;c++){
				this.imgOut.data[4*i+c] = (3*this.threshhold>darkness)?0:255;
			}
		}
	}
	displayHistogram(){
		ct.fillStyle = "rgb(255,  0,255)";
		ct.fillRect(0,0,258,102);
		ct.fillStyle = "rgb(255,255,255)";
		ct.fillRect(1,1,256,100);
		ct.fillStyle = "rgb(  0,  0,  0)";
		for(let i=0;i<256;i++){
			ct.fillRect(i+1,101-Math.ceil(this.histogram[i]*100/this.max),1,Math.ceil(this.histogram[i]*100/this.max));
		}
		ct.fillStyle = "red";
		ct.fillRect(this.threshhold+1,1, 1,100);
	}
	displaySmoothHistogram(){
		ct.fillStyle = "rgb(255,  0,255)";
		ct.fillRect(0,200,258,102);
		ct.fillStyle = "rgb(255,255,255)";
		ct.fillRect(1,201,256,100);
		ct.fillStyle = "rgb(  0,  0,  0)";
		for(let i=0;i<256;i++){
			ct.fillRect(i+1,301-Math.ceil(this.smoothHistogram[i]*100/this.max),1,Math.ceil(this.smoothHistogram[i]*100/this.max));
		}
		ct.fillStyle = "red";
		ct.fillRect(this.threshhold+1,201, 1,100);
	}
}