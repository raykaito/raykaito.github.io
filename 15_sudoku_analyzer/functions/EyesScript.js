const dx = [1, 1, 0,-1,-1,-1, 0, 1];
const dy = [0, 1, 1, 1, 0,-1,-1,-1];

const newWindow = (xct = hct) => {
	return {
		centerWidthHeight : (centerX, centerY, widthIn, heightIn) => {
			let xpos = Math.floor(centerX-widthIn /2);
			let ypos = Math.floor(centerY-heightIn/2);
			return new ImageData([xct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerWidthHeight : (xpos, ypos, widthIn, heightIn) => {
			return new ImageData([xct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerToCorner : (xmin, ymin, xmax, ymax) => {
			return new ImageData([xct.getImageData(xmin, ymin, (xmax-xmin+1), (ymax-ymin+1)), xmin, ymin]);
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
		
		this.imgOut = imgIn;
		this.dimgOut = ca.ct.createImageData(this.dwidth, this.dheight);

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

		ca.ct.beginPath();
		ca.ct.strokeStyle = "rgb(0,255,0)";
		ca.ct.lineWidth = 1;
		ca.ct.rect(dxpos-0.5,dypos-0.5,actual?this.width+1:this.dwidth+1,actual?this.height+1:this.dheight+1);

		//ct.clearRect(dxpos,dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ca.ct.drawImage(timg,dxpos, dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ca.ct.stroke();
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
	setPix(indexIn, value, type="all"){
		//Check if indexIn is xy or index
		let index;
		if(indexIn.length==2) 	index = this.xy2i(indexIn);
		else					index = indexIn;

		//Set the pixel based on type
		if(type=="all"||type==0) this.imgOut.data[4*index+0] = value;
		if(type=="all"||type==1) this.imgOut.data[4*index+1] = value;
		if(type=="all"||type==2) this.imgOut.data[4*index+2] = value;
	}
	getPix(imgIn, indexIn, type="all"){
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

class IntersectionDetector extends ImageData{
	constructor([imgIn,xpos,ypos]=[hct.getImageData(0,0,hcanvas.width,hcanvas.height), 0, 0],vertical=false, display=0){
		super([imgIn, xpos, ypos]);
		this.vertical = vertical;
		this.dataArray;
		this.variance;
		this.dataSmoothArray;
		this.dataSlopeArray;
		this.lineIntensityArray;
		this.indexList;
		this.lineIntensityFiltered;
		this.updateLineIntensity();
		if(display!=0)this.display(0);
		if(display==1)this.displayIntersections();
		if(display==2)this.displayLineIntensity(0);
	}
	get data(){return this.dataArray;}
	get dataSmooth(){return this.dataSmoothArray;}
	get dataSlope(){return this.dataSlopeArray;}
	get lineIntensity(){return this.lineIntensityArray;}
	get intersections(){return this.indexList;}
	get std(){return this.variance;}
	updateLineIntensity(){
		this.dataArray = this.getdata();
		this.dataSmoothArray = smoothenArray(this.dataArray,2);//smoothenArrayVariableRange(this.dataArray);
		this.variance = calculateVariance(this.dataSmoothArray);
		this.dataSlopeArray = getSlopeIntensity(this.dataSmoothArray);
		this.lineIntensityArray = getLineIntensity(this.dataSlopeArray);
		this.indexList = this.getIntersections(this.lineIntensityArray);
	}
	getdata(){
		let data = new Array();
		if(this.vertical)	for(let i=0;i<this.height;i++)	data[i] = this.getPix(this.imgIn,[0,i],"all");
		else				for(let i=0;i<this.width;i++)	data[i] = this.getPix(this.imgIn,[i,0],"all");
		return data;
	}
	getIntersections(ain){
		const thresh = Math.max(15,this.variance);
		let indexList = new Array();
		let tempArray = new Array;
		for(let i=0;i<ain.length;i++){
			if(ain[i]>thresh){
				indexList[indexList.length] = i;
			}
			if(ain[i]!=0){
				tempArray[i] = ain[i];
			}else{
				tempArray[i] = thresh;
			}
		}
		this.lineIntensityFiltered = tempArray;
		return indexList;
	}
	displayLineIntensity(input = 0){
		if(input==0){
			displayArray(this.dataArray,0);
		}else if(input==1){
			displayArray(this.dataSmoothArray,1);
		}else if(input==2){
			displayArray(this.lineIntensityArray,2);
		}else if(input==3){
			displayArray(this.lineIntensityFiltered,3);
		}
	}
	displayIntersections(){
		for(let i=0;i<this.indexList.length;i++){
			circle([(this.xpos+(this.indexList[i]*(!this.vertical))),(this.ypos+(this.indexList[i]*this.vertical)),3]);
		}
	}
}

class Binarize extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		this.histogram = new Array(256);
		this.updateHistogram();
		this.threshold = (preset?preset:this.getThreshold());
		this.binarize();
	}
	get histo(){return this.histogram;}
	set thresh(threshIn){
		this.threshold = threshIn;
	}
	getThreshold(){
		const minBlackArea = Math.ceil(this.area*0.15);
		const maxBlackArea = Math.floor(this.area*0.45);
		let lowerCount = 0;
		let upperCount = 0;
		let lowerFound = -1;
		let upperFound = -1;
		//Find Lower Limit of Threshhold
		for(let i=0;i<this.histogram.length;i++){
			lowerCount += this.histogram[i];
			if(lowerCount>minBlackArea){
				lowerFound = i-1;
				break;
			}
		}
		//Find Upper Limit of Threshhold
		for(let i=0;i<this.histogram.length;i++){
			upperCount += this.histogram[i];
			if(upperCount>maxBlackArea){
				upperFound = i;
				break;
			}
		}
		//Find the optimal thresh
		let record = 0;
		let king = -1;
		for(let t=lowerFound;t<=upperFound;t++){
			const lowA = new Array();
			const highA= new Array();
			for(let i=0;i<this.area;i++){
				const newPix = this.getPix(this.imgIn,i);
				if(newPix>=t)	highA[highA.length] = newPix;
				else 			lowA[lowA.length]   = newPix;
			}
			if(lowA.length*highA.length==0) continue;
			let lowAve, lowStd;
			let highAve, highStd;
			[lowAve, lowStd] = getAveStd(lowA);
			[highAve, highStd] = getAveStd(highA);
			if((highAve-lowAve)/(lowStd+highStd)>record){
				record = (highAve-lowAve)/(lowStd+highStd);
				king = t;
			}
		}
		return king;
	}
	white2Transparent(){
		for(let i=0;i<this.width*this.height;i++){
			this.imgOut.data[4*i+3] = (this.getPix(this.imgOut,i,"all")==255)?0:255;
		}
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
				this.imgOut.data[4*i+c] = (brightness<=3*this.threshold)?0:255;
			}
		}
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
	get blob(){
		const mi = this.maxAreaIndex;
		const tcanvas = document.createElement("canvas");
		let xMin, yMin, xMax, yMax;
		const offset = this.width*0;
		if(this.blobNumber!=0){
			xMin = Math.max(this.blobInfo[mi][1]-offset,0);
			yMin = Math.max(this.blobInfo[mi][2]-offset,0);
			xMax = Math.min(this.blobInfo[mi][3]+offset,this.width);
			yMax = Math.min(this.blobInfo[mi][4]+offset,this.height);
		}else{
			xMin = 0;
			yMin = 0;
			xMax = this.width;
			yMax = this.height;
		}
		tcanvas.width = Math.max(1,xMax-xMin);
		tcanvas.height= Math.max(1,yMax-yMin);
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),xMin-(tcanvas.height-tcanvas.width)/2,yMin,tcanvas.height,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
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
		return super.updateDisplayImage();
	}
	eraseSmallerBlobs(){
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
				this.setPix(i, 255, "all");
			}else if(this.getPix(this.imgOut,i,1)==0){
				this.setPix(i, 0, "all");
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
				if(xMax-xMin>=this.width-3||yMax-yMin>=this.height-3){
					console.log("EdgeFound");
				}else{
					this.maxArea = area;
					this.maxAreaIndex = this.blobNumber-1;
				}
			}
		}
	}
}

class DistanceTransform extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.distanceTransfrom();
	}
	get canvas(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),0,0,tcanvas.width,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
	}
	distanceTransfrom(){
		//Fill Holes
		for(let i=0;i<this.area;i++){
			const [x,y] = this.i2xy(i);
			if(x==0||y==0||x==this.width-1||y==this.height-1) continue;
			const pixelAt = this.getPix(this.imgIn,i,1);
			if(pixelAt==0) continue;
			for(let di=0;di<8;di+=2){
				const dpixel = this.getPix(this.imgOut,[x+dx[di],y+dy[di]],1);
				if(dpixel!=0) break;
				if(di==6) this.setPix(i,0);
			}
		}
		let brightness=255;
		//Scan from Top Left to Bottom Right
		for(let i=0;i<this.area;i++){
			const [x,y] = this.i2xy(i);
			const pixelAt = this.getPix(this.imgIn,i,1);
			//If white, reset brightness and continue;
			if(pixelAt==255){
				brightness = 255;
				continue;
			}
			//If it is at the edge
			if(x==0||y==0){
				brightness = 254;
				this.setPix(i,brightness);
				continue;
			}
			//Check brightness above
			const pixelUp = this.getPix(this.imgOut,[x,y-1],1);
			brightness = Math.max(brightness,pixelUp);
			//Set brightness and continue
			brightness--;
			this.setPix(i,brightness);
		}
		//Scan from Bottom Right to Top Left
		brightness=255;
		for(let i=this.area-1;i>=0;i--){
			const [x,y] = this.i2xy(i);
			const pixelAt = this.getPix(this.imgIn,i,1);
			//If white, reset brightness and continue;
			if(pixelAt==255){
				brightness = 255;
				continue;
			}
			//If it is at the edge
			if(x==this.width-1||y==this.height-1){
				brightness = 254;
				if(brightness>pixelAt) this.setPix(i,brightness);
				continue;
			}
			//Check brightness below
			const pixelDo = this.getPix(this.imgOut,[x,y+1],1);
			brightness = Math.max(brightness,pixelDo);
			//Set brightness and continue
			brightness--;
			if(brightness>pixelAt) this.setPix(i,brightness);
		}
	}
}
class NumberReader extends ImageData{//After Skeltonize
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		//Cell Info
		this.xMax;
		this.yMax;
		this.xMin;
		this.yMin;
		this.map = new Array(this.area).fill(-3);//(-3):White (-4~):joint (-1):doesn't belong to edge(0~):edge number
		//Original Edge/Joint Info
		this.resetMap();
		this.edges = new Array();//[i,toEdge,connected_Edge/Joint_Index,length]
		this.joints= new Array();//[i,numOfNeighbor]
		this.gatherEdgeInfo();
		this.updateMapBasedOnEdgeJoint(this.edges,this.joints);
		//Survived Edge/Joint Info
		this.sedges = new Array();
		this.sjoints= new Array();
		for(let ei=0;ei<this.edges.length;ei++){ this.sedges[ei] = this.edges[ei];}
		for(let ji=0;ji<this.joints.length;ji++){ this.sjoints[ji] = this.joints[ji];}
		while(true){
			const changed = this.gatherSEdgeInfo();
			this.resetMap();
			this.updateMapBasedOnEdgeJoint(this.sedges,this.sjoints,!changed);
			if(changed==false) break;
		}
	}
	get canvas(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),0,0,tcanvas.width,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
	}
	resetMap(){
	//Gather Index for Live Cells. Also window Size
		this.liveCells = new Array();
		this.xMax = 0;
		this.xMin = this.width;
		this.yMax = 0;
		this.yMin = this.height;
		for(let i=0;i<this.area;i++){
			const pixelAt = this.getPix(this.imgIn,i,1);
			if(pixelAt<255){
				this.liveCells[this.liveCells.length] = i;
				const [x,y] = this.i2xy(i);
				this.map[i] = -1;
				this.xMax = Math.max(this.xMax,x);
				this.xMin = Math.min(this.xMin,x);
				this.yMax = Math.max(this.yMax,y);
				this.yMin = Math.min(this.yMin,y);
			}
		}
	}
	gatherEdgeInfo(){
		//Gather edge/joint info.
		for(let i=0;i<this.liveCells.length;i++){
			const [x,y] = this.i2xy(this.liveCells[i]);
			let switchCounter = 0;
			let lastNeighbor = (this.getPix(this.imgIn,[x+dx[7],y+dy[7]],1)==255);
			for(let j=0;j<8;j++){
				let pixelNeighbor = (this.getPix(this.imgIn,[x+dx[j],y+dy[j]],1)==255);
				//Check if it exceeds the boundary
				if((x+dx[j])<0||(x+dx[j])>=this.width||(y+dy[j])<0||(y+dy[j])>=this.height){
					pixelNeighbor = (255==255);
				}
				if(pixelNeighbor!=lastNeighbor){
					switchCounter++;
					lastNeighbor = pixelNeighbor;
				}
			}
			if(switchCounter==2) this.edges[this.edges.length] = [this.liveCells[i],-1,-1,-1];
			if(switchCounter==6) this.joints[this.joints.length] = [this.liveCells[i],3];
			if(switchCounter==8) this.joints[this.joints.length] = [this.liveCells[i],4];
		}
	}
	gatherSEdgeInfo(){
		//Edges [i,toEdge,connected_Edge/Joint_Index,length]
		//Joints[i,numOfNeighbor]
		//get joints with 2,3 edges
		let edges = new Array();
		let joints= new Array();
		for(let ei=0;ei<this.sedges.length;ei++){ edges[ei] = this.sedges[ei];}
		for(let ji=0;ji<this.sjoints.length;ji++){ joints[ji] = this.sjoints[ji];}
		this.sedges = new Array();
		this.sjoints= new Array();
		let jointList = new Array(joints.length).fill([0,-1,0]);//[Num of Edges,Shortest Edge Len., Shortest Edge I]
		//search each edge and reflect them to Joints
		for(let edgei=0;edgei<edges.length;edgei++){
			const edge = edges[edgei];
			if(edge[1]==false){
				if(jointList[edge[2]][0]==0){
					jointList[edge[2]]=[1,edge[3],edgei];
					continue;
				}else{
					jointList[edge[2]][0]++;
					const newLength = edge[3];
					if(newLength<jointList[edge[2]][1]){
						jointList[edge[2]][1]=newLength;
						jointList[edge[2]][2]=edgei;
					}
				}
			}
		}
		//Determine which joint&Edge to remove
		let removeEdgeIndex  = new Array();
		let removeJointIndex = new Array();
		for(let jli=0;jli<jointList.length;jli++){
			const joint = jointList[jli];
			if(joint[0]>=2&&joints[jli][1]!=4){
				removeJointIndex[removeJointIndex.length] = jli;
				removeEdgeIndex [removeEdgeIndex.length]  = joint[2];
			}
		}
		let changed = false;
		for(let edgei=0;edgei<edges.length;edgei++){
			let itwasREI = false;
			for(let reiI=0;reiI<removeEdgeIndex.length;reiI++){
				if(edgei==removeEdgeIndex[reiI]){
					itwasREI = true;
					changed = true;
					break;
				}
			}
			if(itwasREI==false) this.sedges[this.sedges.length] = edges[edgei];
		}
		for(let jointi=0;jointi<joints.length;jointi++){
			let itwasRJI = false;
			for(let rjiI=0;rjiI<removeJointIndex.length;rjiI++){
				if(jointi==removeJointIndex[rjiI]){
					itwasRJI = true;
					changed = true;
					break;
				}
			}
			if(itwasRJI==false) this.sjoints[this.sjoints.length] = joints[jointi];
		}
		return changed;
	}
	updateMapBasedOnEdgeJoint(edges,joints,color=false){
		//map each map index based on the edge number
		for(let i=0;i<edges.length;i++){
			this.map[edges[i][0]] = i;
			if(color) this.setPix(edges[i][0],255,0);
		}
		for(let i=0;i<joints.length;i++){
			this.map[joints[i][0]] = -4-i;
			if(color) this.setPix(joints[i][0],255,2);
		}
		//For each Edge, Find its destination [joint or another edge];
		for(let edgei=0;edgei<edges.length;edgei++){
			let changed = true;
			let counter = 1;
			while(changed){
				changed=false;
				for(let liveCelli=0;liveCelli<this.liveCells.length;liveCelli++){
					//if not -1, continue
					const mapi = this.liveCells[liveCelli];
					const [x,y] = this.i2xy(mapi);
					if(this.map[mapi]==edgei) continue;
					//if neighbor is edge, then become the edge
					for(let i=0;i<8;i+=2){
						const dmapi = this.xy2i([(x+dx[i]),(y+dy[i])]);
						//If neibor is the Edge
						if(this.map[dmapi]==edgei){
							if(this.map[mapi]!=-1){//Current Position is not NoBelonger
								if(this.map[mapi]<=-4){//Current Position is Joint
									edges[edgei][1] = false;
									edges[edgei][2] = -this.map[mapi]-4;
								}else{					//Current Position is Edge
									edges[edgei][1] = true;
									edges[edgei][2] = this.map[mapi];
								}
							}else{//Current Position is NoBelonger
								counter++;
								this.map[mapi]=edgei;
								edges[edgei][3] = counter;
								changed=true;
								break;
							}
						}
					}
				}
			}
		}
	}
	recognizeNumber(){
		//Edges [i,toEdge,connected_Edge/Joint_Index,length]
		//Joints[i,numOfNeighbor]
		for(let edgei=0;edgei<this.edges.length;edgei++){
			const [x,y] = this.i2xy(this.edges[edgei][0]);
			const e = this.edges[edgei][1];
			const l = this.edges[edgei][3];
		}
		const edgeCount = this.edges.length;
		let jointCount = 0;
		for(let jointsi=0;jointsi<this.joints.length;jointsi++){
			if(this.joints[jointsi][1]==4) jointCount+=2;
			else jointCount++;
		}
		if(jointCount-edgeCount==2){return 8;}
		if(jointCount-edgeCount==0){//4,6or9;
			//getLongestSedge [i_sedge,length,i_sjoint]
			let longest = [-1,0,-1];
			for(let ei=0;ei<this.sedges.length;ei++){
				const sedge = this.sedges[ei];
				if(sedge[3]>longest[1]){
					longest[0]=sedge[0];
					longest[1]=sedge[3];
					longest[2]=this.sjoints[sedge[2]][0];
				}
			}
			const [xe,ye] = this.i2xy(longest[0])//get xy of the longest sedge
			const [xj,yj] = this.i2xy(longest[2])//get xy of the joint
			if(ye<yj) return 6;

			//Get xmax edge(not Sedge)
			let xmax = [-1,-1];//[i_edge,xmax]
			for(let ei=0;ei<this.edges.length;ei++){
				const edge = this.edges[ei];
				const [x,y]= this.i2xy(edge[0]);
				if(x>xmax[1]){
					xmax[0]=edge[0];
					xmax[1]=x;
				}
			}
			if(xmax[1]==this.xMax) return 4;
			return 9;
		}
		if(jointCount-edgeCount==-2){//1,2,3,5 or 7
			//Get xy up and xy down
			let [xu,yu] = this.i2xy(this.sedges[0][0]);
			let [xd,yd] = this.i2xy(this.sedges[1][0]);
			if(yu>yd){
				const yt=yu;
				const xt=xy;
				yu=yd;
				xu=xd;
				xd=xt;
				yd=yt;
			}
			const width = this.xMax-this.xMin;
			const height= this.yMax-this.yMin;
			xu-=this.xMin;
			xd-=this.xMin;
			yu-=this.uMin;
			yd-=this.yMin;
			//Scan vertically and count (Black/White) switch
			let minSwitchDist = this.height;
			let lastSwitchY = 0;
			let threeSwitchCount = 0;
			let lessThanHalfSwitchDistXmax = 0;
			for(let x=0;x<this.width;x++){
				let switchCounter=0;
				let currentValueNegThree = true;
				for(let y=0;y<this.height;y++){
					const mapValueNegThree = (this.map[this.xy2i([x,y])]==-3);
					if(currentValueNegThree!=mapValueNegThree){
						if(currentValueNegThree){
							switchCounter++;
							if(switchCounter>=2){
								minSwitchDist = Math.min(minSwitchDist,(y-lastSwitchY));
								if(minSwitchDist<height/2) lessThanHalfSwitchDistXmax = x;
							}
							lastSwitchY = y;
						}
						currentValueNegThree = !currentValueNegThree;
					}
				}
				if(switchCounter>=3){
					threeSwitchCount++;
				}
			}
			//return threeSwitchCount+","+width;
			if(threeSwitchCount>width*0.2){//2,3 or 5
				if(xu<width/2&&xd>width/2) return 2;
				if(xu>width/2&&xd<width/2) return 5;
				return 3;
			}else{
				if(lessThanHalfSwitchDistXmax-this.xMin>width/2) return 7;
				return 1;
			}
		}
		else return "";
	}
}
class Skeltonize extends ImageData{//After the distance Transformation
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.skeltonize();
	}
	get canvas(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),0,0,tcanvas.width,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
	}
	skeltonize(){
		//Gather Index for Live Cells[brightness][number] = index
		let liveCells = new Array(255);
		let minBrightness = 255;
		let maxBrightness = 0;
		for(let i=0;i<liveCells.length;i++){
			liveCells[i] = new Array();
		}
		for(let i=0;i<this.area;i++){
			const pixelAt = this.getPix(this.imgIn,i,1);
			if(pixelAt<255){
				minBrightness = Math.min(minBrightness,pixelAt);
				maxBrightness = Math.max(maxBrightness,pixelAt);
				liveCells[pixelAt][liveCells[pixelAt].length] = i;
			}
		}
		for(let brightness=254;brightness>=0;brightness--){
			for(let lag=3;lag>=0;lag--){
				if(brightness+lag>254) continue;
				for(let i=0;i<liveCells[brightness+lag].length;i++){
					const [x,y] = this.i2xy(liveCells[brightness+lag][i]);
					let switchCounter = 0;
					let neighborCounter = 0;
					let lastNeighbor = (this.getPix(this.imgIn,[x+dx[7],y+dy[7]],1)==255);
					for(let j=0;j<8;j++){
						const pixelNeighbor = (this.getPix(this.imgIn,[x+dx[j],y+dy[j]],1)==255);
						if(!pixelNeighbor) neighborCounter++;
						if(pixelNeighbor!=lastNeighbor){
							switchCounter++;
							lastNeighbor = pixelNeighbor;
						}
					}
					if(switchCounter>=4||neighborCounter==1){
						//Dont Kill
						continue;
					}else{
						this.setPix([x,y],255);
					}
				}
			}
		}
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgIn,i,1)!=255) this.setPix(i,0);
		}
		return;
	}
}
class Resize extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0],newWidth, newHeight){
		super([imgIn, xpos, ypos]);
		const tcanvas = document.createElement("canvas");
		tcanvas.width = newWidth;
		tcanvas.height= newHeight;
		const tct = tcanvas.getContext("2d");
		const canvasIn = super.updateDisplayImage(); 
		tct.drawImage(canvasIn,0,0,canvasIn.width,canvasIn.height,0,0,newWidth,newHeight);
		this.imgIn = tct.getImageData(0,0,newWidth,newHeight);
		
		this.width  = this.imgIn.width;
		this.height = this.imgIn.height;
		this.area   = this.width*this.height;
		this.dwidth = Math.ceil(this.width/canvasScale);
		this.dheight= Math.ceil(this.height/canvasScale);
		this.darea  = this.dwidth*this.dheight;
		
		this.imgOut = this.imgIn;
		this.dimgOut = ca.ct.createImageData(this.dwidth, this.dheight);

		//Initialize dimgOut
		for(let i=0;i<this.imgIn.data.length;i++){
			this.imgOut.data[i] = this.imgIn.data[i];
		}
		return this;
	}
}
class EdgeFree extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.clearEdge();
	}
	clearEdge(){
		for(let x=0;x<this.width;x++){
			this.setPix([x,0],255);
			this.setPix([x,this.height-1],255);
		}
		for(let y=0;y<this.height;y++){
			this.setPix([0,y],255);
			this.setPix([this.width-1,y],255);
		}
	}
}
console.log("Loaded: EyesScript.js");