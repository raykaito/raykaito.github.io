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
	constructor([imgIn,xpos,ypos]=[hct.getImageData(0,0,hcanvas.width,hcanvas.height), 0, 0]){
		//Set up variables
		this.imgIn= imgIn;
		this.xpos = xpos;
		this.ypos = ypos;
		this.dxpos= Math.floor(xpos/canvasScale);
		this.dypos= Math.floor(ypos/canvasScale);
		
		this.width  = imgIn.width;
		this.height = imgIn.height;
		this.area   = this.width*this.height;
		this.dwidth = Math.ceil(this.width/canvasScale);
		this.dheight= Math.ceil(this.height/canvasScale);
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
	display(actual = false){
		const dxpos = this.dxpos+Math.floor((this.dwidth-this.width)/2)*actual;
		const dypos = this.dypos+Math.floor((this.dheight-this.height)/2)*actual;
		
		const timg = this.updateDisplayImage(actual);

		ct.beginPath();
		ct.strokeStyle = "rgb(0,255,0)";
		ct.lineWidth = 0;
		ct.rect(dxpos-0.5,dypos-0.5,actual?this.width+1:this.dwidth+1,actual?this.height+1:this.dheight+1);

		//ct.clearRect(dxpos,dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ct.drawImage(timg,dxpos, dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ct.stroke();
	}
	updateDisplayImage(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.putImageData(this.imgOut,0,0);
		return tcanvas;
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
	constructor([imgIn,xpos,ypos]=[hct.getImageData(0,0,hcanvas.width,hcanvas.height), 0, 0]){
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

class IntersectionDetector extends ImageData{
	constructor([imgIn,xpos,ypos]=[hct.getImageData(0,0,hcanvas.width,hcanvas.height), 0, 0],vertical=false, display=false){
		super([imgIn, xpos, ypos]);
		this.vertical = vertical;
		this.dataArray;
		this.variance;
		this.dataSmoothArray;
		this.dataSlopeArray;
		this.lineIntensityArray;
		this.indexList;
		this.updateLineIntensity();
		if(display){
			this.displayLineIntensity();
			//this.display(0);
			this.displayIntersections();
		}
	}
	get data(){return this.dataArray;}
	get dataSmooth(){return this.dataSmoothArray;}
	get dataSlope(){return this.dataSlopeArray;}
	get lineIntensity(){return this.lineIntensityArray;}
	get intersections(){return this.indexList;}
	updateLineIntensity(){
		this.dataArray = this.getdata();
		this.variance = calculateVariance(this.dataArray);
		this.dataSmoothArray = smoothenArrayVariableRange(this.dataArray);
		this.dataSlopeArray = getSlopeIntensity(this.dataSmoothArray);
		this.lineIntensityArray = getLineIntensity(this.dataSlopeArray);
		this.indexList = this.getIntersections(this.lineIntensityArray);
	}
	getdata(){
		let data = new Array();
		if(this.vertical)
			for(let i=0;i<this.height;i++)	data[i] = this.getPix(this.imgIn,[0,i],"all");
		else
			for(let i=0;i<this.width;i++)	data[i] = this.getPix(this.imgIn,[i,0],"all");
		return data;
	}
	getIntersections(ain){
		let indexList = new Array();
		for(let i=0;i<ain.length;i++){
			if(ain[i]>this.variance){
				indexList[indexList.length] = i;
			}
		}
		return indexList;
	}
	displayLineIntensity(){
		displayArray(this.dataArray,0);
		displayArray(this.dataSmoothArray,1);
		displayArray(this.lineIntensityArray,2);
	}
	displayIntersections(){
		for(let i=0;i<this.indexList.length;i++){
			circle((this.xpos+(this.indexList[i]*(!this.vertical)))/canvasScale,(this.ypos+(this.indexList[i]*this.vertical))/canvasScale,3);
		}
	}
}

class doubleFuzzySubtraction extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset=false){
		super([imgIn, xpos, ypos]);
		this.baseFuzzyRange = preset[0];
		this.sharFuzzyRange = preset[1];
		if(preset!=false) this.applyFilter();
	}
	applyFilter(){
		const fuzzy_base = new Filter(this.passdata, this.baseFuzzyRange);
		const fuzzy_shar = new Filter(this.passdata, this.sharFuzzyRange);
		const imgData_base = fuzzy_base.passdata[0];
		const imgData_shar = fuzzy_shar.passdata[0];
		let difference;
		for(let i=0;i<this.area;i++){
			difference = (this.getPix(imgData_base,i,0)-this.getPix(imgData_shar,i,0));
			this.setPix(i, difference, "all");
		}
		let max = 0;
		for(let i=0;i<this.area;i++){
			max = Math.max(max,this.getPix(this.imgOut,i, 0));
		}
		for(let i=0;i<this.area;i++){
			const pix = this.getPix(this.imgOut,i, 0);
			this.setPix(i, Math.floor(255-pix/max*255), "all");;
		}

	}
}

class derivativeFilter extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset=false){
		super([imgIn, xpos, ypos]);
		this.horizontalDerivative = new Array(this.area).fill(0);
		this.verticalDerivative = new Array(this.area).fill(0);
		this.maximumDerivative = new Array(this.area).fill(0);
		this.threshholdToMaxRatio = 5;
		this.scanDerivative();

		if(preset!=false) this.applyFilter();
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

class LineScanner extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset=false){
		super([imgIn, xpos, ypos]);
		//Absolute X and Y intersects
		this.absxIntersect = new Array();
		this.absyIntersect = new Array();

		//For Horizontal
		this.xPioneer = new Array(this.height);
		this.xAngle = 0;
		this.xAngleFixed = true;

		//For Vertical
		this.yPioneer = new Array(this.width);
		this.yAngle = 0;
		this.yAngleFixed = true;

		//Parameter for scanHorizontal();
		this.whiteToBlack = true;
		this.bandWidth = Math.tan(deg2rad(1))*this.height;
		this.minPioneersInBand = 0.6;

		//Parameter for getAngle();
		this.allowableRange = 5;

		//Parameter for nextX() and nextY();
		this.lineThresh=10;

		if(preset!=false){
			this.scanHorizontal();
			this.scanVertical();
			//this.display();
		}
	}
	set bandWidthAngle(angle){
		this.bandWidth = Math.tan(deg2rad(angle))*this.height;
	}
	set InBandrate(rateIn){
		this.minPioneersInBand = rateIn;
	}

	get intersects(){return [this.absxIntersect, this.absyIntersect];}
	get angles()	{return [this.xAngle, this.yAngle];}
	
	scanHorizontal(){
		//Set up Variables
		let threshhold = 1;
		let xIntersects = new Array();
		let intersectCounter = 0;
		this.xPioneer.fill(0);
		this.xAngle = 0;
		this.xAngleFixed = false;
		this.whiteToBlack = true;

		let sortedXPioneer = new Array(this.height);

		while(true){
			let noProgress = true;
			for(let y=0;y<this.xPioneer.length;y++){
				if(Math.floor(this.xPioneer[y]-this.xAngle*y)<threshhold){
					const nextX = this.nextX([this.xPioneer[y],y]);
					if(nextX==-1) continue;
					this.xPioneer[y] = nextX;
					noProgress = false;
				}
				continue;
			}
			if(!this.xAngleFixed) this.xAngle = this.getAngle(this.xPioneer);

			sortedXPioneer = this.sortPioneer(this.xPioneer, this.xAngle);

			if(this.lineDetected(sortedXPioneer)){
				this.xAngleFixed = true;
				xIntersects[intersectCounter] = this.getIntersect(sortedXPioneer);

				if(xIntersects[intersectCounter]<=xIntersects[intersectCounter-1]){
					xIntersects.pop();
					break;
				}

				threshhold = this.getNewThreshhold(sortedXPioneer, true)+1;
				this.whiteToBlack = !this.whiteToBlack;
				intersectCounter++;
				continue;
			}

			threshhold = this.getNewThreshhold(sortedXPioneer);

			if(noProgress)break;
		}
		for(let y=0;y<this.height;y++){
			for(let i=0;i<xIntersects.length;i++){
				let index = [Math.floor(xIntersects[i]+y*this.xAngle),y];
				this.setPix(index,255 ,0);
				this.setPix(index,0   ,1);
				this.setPix(index,0   ,2);
			}
		}
		this.absxIntersect = [];
		for(let i in xIntersects){
			xIntersects[i] -= this.xAngle*this.ypos-this.xpos;
			this.absxIntersect[i] = xIntersects[i];
		}
		return;
	}

	scanVertical(){
		//Set up Variables
		let threshhold = 1;
		let yIntersects = new Array();
		let intersectCounter = 0;
		this.yPioneer.fill(0);
		this.yAngle = 0;
		this.yAngleFixed = false;
		this.whiteToBlack = true;

		let sortedYPioneer = new Array(this.width);

		while(true){
			let noProgress = true;
			for(let x=0;x<this.yPioneer.length;x++){
				if(Math.floor(this.yPioneer[x]-this.yAngle*x)<threshhold){
					const nextY = this.nextY([x, this.yPioneer[x]]);
					if(nextY==-1) continue;
					this.yPioneer[x] = nextY;
					noProgress = false;
				}
				continue;
			}
			if(!this.yAngleFixed) this.yAngle = this.getAngle(this.yPioneer);

			sortedYPioneer = this.sortPioneer(this.yPioneer, this.yAngle);

			if(this.lineDetected(sortedYPioneer)){
				this.yAngleFixed = true;
				yIntersects[intersectCounter] = this.getIntersect(sortedYPioneer);

				if(yIntersects[intersectCounter]<=yIntersects[intersectCounter-1]){
					yIntersects.pop();
					break;
				}

				threshhold = this.getNewThreshhold(sortedYPioneer, true)+1;
				this.whiteToBlack = !this.whiteToBlack;
				intersectCounter++;
				continue;
			}

			threshhold = this.getNewThreshhold(sortedYPioneer);

			if(noProgress)break;
		}
		for(let x=0;x<this.width;x++){
			for(let i=0;i<yIntersects.length;i++){
				let index = [x, Math.floor(yIntersects[i]+x*this.yAngle)];
				this.setPix(index,255 ,0);
				this.setPix(index,0   ,1);
				this.setPix(index,0   ,2);
			}
		}
		this.absyIntersect = [];
		for(let i in yIntersects){
			yIntersects[i] -= this.yAngle*this.xpos-this.ypos;
			this.absyIntersect[i] = yIntersects[i];
		}
	}
	sortPioneer(pioneerIn, angleIn){
		const sortedPioneer = new Array(pioneerIn.length);
		for(let i=0;i<pioneerIn.length;i++)
			sortedPioneer[i] = Math.floor(pioneerIn[i]-angleIn*i);
		sortedPioneer.sort(function(a,b){return a - b;});
		return sortedPioneer;
	}
	lineDetected(sortedPioneer){		
		const median = sortedPioneer[Math.floor(sortedPioneer.length/2)];
		const lowThresh = median - this.bandWidth/2;
		const highThresh = median + this.bandWidth/2;

		let counter = 0;
		for(let i=0;i<sortedPioneer.length;i++){
			if(sortedPioneer[i]<lowThresh) continue;
			if(sortedPioneer[i]>highThresh)break;
			counter++
		}

		const InBandRatio = counter/sortedPioneer.length;

		return (InBandRatio>this.minPioneersInBand);
	}
	getIntersect(sortedPioneer){
		let counter,  maxCounter,  maxCounterPioneer,  currentPioneer;
		    counter = maxCounter = maxCounterPioneer = currentPioneer = 0;
		
		for(let i=0;i<sortedPioneer.length;i++){
			if(currentPioneer<sortedPioneer[i]||i==sortedPioneer.length-1){
				if(counter>maxCounter){
					maxCounterPioneer = currentPioneer;
					maxCounter = counter;
				}
				currentPioneer = sortedPioneer[i];
				counter = 0;
			}
			counter++;
		}
		if(maxCounterPioneer==0){
			console.log(sortedPioneer);
		}
		return maxCounterPioneer;

	}

	getNewThreshhold(sortedPioneer, flipped = false){		
		const median = (sortedPioneer[Math.floor(sortedPioneer.length/2)]);
		if(flipped) return median+this.bandWidth/2;
		const lowThresh = median - this.bandWidth*2;

		if(sortedPioneer[0]<lowThresh) return lowThresh;

		return sortedPioneer[Math.floor(sortedPioneer.length*0.02)]+1;
	}

	getAngle(pioneer){
		let derivative = new Array(pioneer.length-1);
		for(let i=0;i<pioneer.length-1;i++){
			derivative[i] = pioneer[i+1]-pioneer[i];
		}
		
		let streak,  maxStreak,  maxStreakIndex,  newStreakIndex,  rangeMin,  rangeMax;
		    streak = maxStreak = maxStreakIndex = newStreakIndex = rangeMin = rangeMax = 0;
		let streakBreakCount = 0;

		let startStreak = true;
		
		for(let i=0;i<pioneer.length-1;i++){
			if(startStreak){
				streakBreakCount++;
				if(streak>maxStreak){
					maxStreak = streak;
					maxStreakIndex = newStreakIndex;
				}
				rangeMin = rangeMax = derivative[i];
				newStreakIndex = i;
				streak = 0;
				startStreak = false;
				continue;
			}
			rangeMin = Math.min(rangeMin, derivative[i]);
			rangeMax = Math.max(rangeMax, derivative[i]);
			if(rangeMax-rangeMin>this.allowableRange){
				startStreak = true;
				continue;
			}
			streak++;
		}

		let accumulator = 0;

		//This is for a case in which streak==this.height
		if(streakBreakCount==1){
			maxStreakIndex=0;
			maxStreak=pioneer.length-1;
		}

		for(let y=maxStreakIndex;y<maxStreakIndex+maxStreak;y++){
			accumulator+=derivative[y];
		}
		const angle = accumulator/maxStreak;
		return angle;
	}

	nextX(xy){
		if(xy[0]==this.width-1) return -1;
		let newR, lastR = this.getPix(this.imgIn, xy, 0);
		for(;xy[0]<this.width;){
			xy[0]++;
			newR = this.getPix(this.imgIn, xy, 0);
			if(this.whiteToBlack){
				if(newR-lastR<-this.lineThresh) return xy[0];
			}else{
				if(newR-lastR> this.lineThresh) return xy[0];
			}
			lastR = newR;
		}
		return this.width-1;
	}

	nextY(xy){
		if(xy[1]==this.height-1) return -1;
		let newR, lastR = this.getPix(this.imgIn, xy, 0);
		for(;xy[1]<this.height;){
			xy[1]++;
			newR = this.getPix(this.imgIn, xy, 0);
			if(this.whiteToBlack){
				if(newR-lastR<-this.lineThresh) return xy[1];
			}else{
				if(newR-lastR> this.lineThresh) return xy[1];
			}
			lastR = newR;
		}
		return this.height-1;
	}
}

class Filter extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);

		if(preset!=false) this.fuzzyR(preset);
	}
	fuzzyR(range = 1){
		if(range==0) return;
		let imgHolder = {data: new Array(this.area*4)};
		let counter, tempR, index;
		for(let y=0;y<this.height;y++){
			counter = tempR = 0;
			for(let x=-range;x<this.width+range;x++){
				index = this.xy2i([x,y], this.width);
				
				if(x+range<this.width){
					counter++;
					tempR += this.getPix(this.imgIn, index+range, 0);
				}
				
				if(x-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range, 0);
				}
				if(x>=0&&x<this.width){
					imgHolder.data[4*index] = tempR/counter;
				}
			}
		}
		for(let x=0;x<this.width;x++){
			counter = tempR = 0;
			for(let y=-range;y<this.height+range;y++){
				index = this.xy2i([x,y], this.width);
				
				if(y+range<this.height){
					counter++;
					tempR += this.getPix(imgHolder, index+range*this.width, 0);
				}
				
				if(y-range>=0){
					counter--;
					tempR -= this.getPix(imgHolder, index-range*this.width, 0);
				}
				if(y>=0&&y<this.height){
					this.setPix(index, Math.floor(tempR/counter), "all");
				}
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
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		this.blobMap  = new Array(this.area);
		this.dblobMap = new Array(this.darea);
		this.blobInfo= new Array();//[Area, xMin, yMin, xMax, yMax]
		this.blobNumber = 0;
		this.maxArea = 0;
		this.maxAreaIndex = 0;

		if(preset!=false) this.scanBlobs();
	}
	get blobNum(){
		return this.blobNumber;
	}
	updateDisplayImage(actual = false){
		if(actual){
			for(let i=0;i<this.area;i++){
				if(this.getPix(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
					this.imgOut.data[4*i+0]=0;
					this.imgOut.data[4*i+2]=0;
				}
			}			
			return;
		}
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
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		this.histogram = new Array(256).fill(0);
		this.smoothHistogram = new Array(256).fill(0);
		this.max;

		if(preset!=false){
			this.threshhold = preset;
			this.updateHistogram();
			this.binarize();
		}else{
			this.threshhold = 64;
			this.updateHistogram();
		}
	}
	set thresh(threshIn){
		this.threshhold = threshIn;
	}
	get darkPixelRatio(){
		let darkPixel = 0;
		for(let i=this.threshhold;i>=0;i--){
			darkPixel+=this.histogram[i];
		}
		return darkPixel/this.area;
	}
	updateThreshFromDarkPixelRatio(ratio){
		let counter = 0;
		let threshCounter = ratio*this.area;
		for(let i=0;i<256;i++){
			counter+=this.histogram[i];
			if(counter>=threshCounter){
				this.thresh = i;
				return;
			}
		}
	}
	updateSmoothHistogram(range = 1){
		this.smoothHistogram = smoothenArray(this.histogram, range);
		console.log(countLocalMax(this.smoothHistogram));
	}
	updateHistogram(){
		let index;
		for(let i=0;i<this.histogram.length;i++) this.histogram[i]=0;
		for(let i=0;i<this.area;i++){
			index  = Math.floor(this.getPix(this.imgIn,i,"all"));
			this.histogram[index]++;
		}
		this.max = this.histogram.reduce((a,b)=>{return Math.max(a,b);},0);
	}
	binarize(){
		let brightness;
		for(let i=0;i<this.width*this.height;i++){
			brightness = this.imgIn.data[4*i+0];
			brightness+= this.imgIn.data[4*i+1];
			brightness+= this.imgIn.data[4*i+2];
			for(let c=0;c<3;c++){
				this.imgOut.data[4*i+c] = (brightness<=3*this.threshhold)?0:255;
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

console.log("Loaded: EyesScript.js");