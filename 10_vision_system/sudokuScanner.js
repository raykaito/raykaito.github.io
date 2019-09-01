class VisionProgram_SudokuReader{
	constructor(){
		this.cellMax;//Max Length of the Cell
		this.cellLength;
	}
	abort(msg){
		console.log(msg);
	}
	startScan(){
		this.cellMax = Math.min(hcanvas.width,hcanvas.height)/8;//Max Length of the Cell
		//Find one vertical line to measure the angle
		const angleXY = this.findAngleXY();
		if(angleXY=="fail") return;
		//Rotate the Image 
		this.rotateImage(angleXY);
		//Find four corners of the board
		const fourCorners = this.findFourCorners(angleXY);
		if(fourCorners=="fail") return;
		let nwxy,nexy,sexy,swxy;
		[nwxy,nexy,sexy,swxy] = fourCorners;
		circle(sexy[0]/canvasScale,sexy[1]/canvasScale,this.cellLength/2/canvasScale);
		circle(nexy[0]/canvasScale,nexy[1]/canvasScale,this.cellLength/2/canvasScale);
		circle(swxy[0]/canvasScale,swxy[1]/canvasScale,this.cellLength/2/canvasScale);
		circle(nwxy[0]/canvasScale,nwxy[1]/canvasScale,this.cellLength/2/canvasScale);
	}
	findFourCorners([angle, xin, yin]){
		let xy = this.findStartingXY(xin,yin);
		if(xy=="fail") return "fail";
		const startingPoint = this.findCross(xy[0], xy[1]);
		//go east
		const eeEdge = this.findEdge(startingPoint[0],startingPoint[1], 1, 0);
		const esEdge = this.findEdge(eeEdge[0]		 ,eeEdge[1]		  , 0, 1);
		const enEdge = this.findEdge(eeEdge[0]		 ,eeEdge[1]		  , 0,-1);
		//go west
		const wwEdge = this.findEdge(startingPoint[0],startingPoint[1],-1, 0);
		const wsEdge = this.findEdge(wwEdge[0]		 ,wwEdge[1]		  , 0, 1);
		const wnEdge = this.findEdge(wwEdge[0]		 ,wwEdge[1]		  , 0,-1);
		//go north
		const nnEdge = this.findEdge(startingPoint[0],startingPoint[1], 0,-1);
		const neEdge = this.findEdge(nnEdge[0]		 ,nnEdge[1]		  , 1, 0);
		const nwEdge = this.findEdge(nnEdge[0]		 ,nnEdge[1]		  ,-1, 0);
		//go south
		const ssEdge = this.findEdge(startingPoint[0],startingPoint[1], 0, 1);
		const seEdge = this.findEdge(ssEdge[0]		 ,ssEdge[1]		  , 1, 0);
		const swEdge = this.findEdge(ssEdge[0]		 ,ssEdge[1]		  ,-1, 0);
		//Determine the X index
		let xIndex = -1;
		if(		eeEdge[2]+wwEdge[2]==7) xIndex = wwEdge[2];
		else if(neEdge[2]+nwEdge[2]==7) xIndex = nwEdge[2];
		else if(seEdge[2]+swEdge[2]==7) xIndex = swEdge[2];
		//Determine the Y index
		let yIndex = -1;
		if(		nnEdge[2]+ssEdge[2]==7) yIndex = nnEdge[2];
		else if(enEdge[2]+esEdge[2]==7) yIndex = enEdge[2];
		else if(wnEdge[2]+wsEdge[2]==7) yIndex = wnEdge[2];
		//Check if index has been determined
		if(xIndex==-1||yIndex==-1){
			this.abort("Failed to find corners");
			return "fail";
		}
		//Get four corners.
		let sexy, swxy, nexy, nwxy;
		const cl = this.cellLength/2;
		if(eeEdge[2]==7-xIndex){
			if(esEdge[2]==7-yIndex) sexy = [esEdge[0]+cl,esEdge[1]+cl]; 
			if(enEdge[2]==  yIndex) nexy = [enEdge[0]+cl,enEdge[1]-cl]; 
		}
		if(wwEdge[2]==  xIndex){
			if(wsEdge[2]==7-yIndex) swxy = [wsEdge[0]-cl,wsEdge[1]+cl]; 
			if(wnEdge[2]==  yIndex) nwxy = [wnEdge[0]-cl,wnEdge[1]-cl]; 
		}
		if(nnEdge[2]==  yIndex){
			if(neEdge[2]==7-xIndex) nexy = [neEdge[0]+cl,neEdge[1]-cl]; 
			if(nwEdge[2]==  xIndex) nwxy = [nwEdge[0]-cl,nwEdge[1]-cl]; 
		}
		if(ssEdge[2]==7-yIndex){
			if(seEdge[2]==7-xIndex) sexy = [seEdge[0]+cl,seEdge[1]+cl]; 
			if(swEdge[2]==  xIndex) swxy = [swEdge[0]-cl,swEdge[1]+cl]; 
		}
		return [nwxy,nexy,sexy,swxy];
	}
	findEdge(xin,yin,dxin,dyin){
		let x = xin;
		let y = yin;
		let dx=dxin*this.cellLength;
		let dy=dyin*this.cellLength;
		let counter = 0;
		while(true){
			const result = this.findCross(x+dx,y+dy);
			const nX  = result[0];
			const nY  = result[1];
			if(result[2]){
				dx=nX-x;
				dy=nY-y;
				x =nX;
				y =nY;
				circle(x/canvasScale,y/canvasScale,3);
				counter++;
			}else{
				return [x,y,counter];
			}
			continue;
		}
	}
	findCross(xin,yin){
		const error=20;
		const intensity = 2;

		const offset = this.cellLength/12;
		const length = this.cellLength*0.8;
		const imgn = newWindow().centerWidthHeight(xin,yin-offset  ,length,1);
		const imgs = newWindow().centerWidthHeight(xin,yin+offset  ,length,1);
		const imgw = newWindow().centerWidthHeight(xin-offset,yin,1,length);
		const imge = newWindow().centerWidthHeight(xin+offset,yin,1,length);
		const scnn = new IntersectionDetector(imgn.passdata,0,0);
		const scns = new IntersectionDetector(imgs.passdata,0,0);
		const scnw = new IntersectionDetector(imgw.passdata,1,0);
		const scne = new IntersectionDetector(imge.passdata,1,0);
		const arrn = scnn.lineIntensitySorted[0][1];
		const arrs = scns.lineIntensitySorted[0][1];
		const arrw = scnw.lineIntensitySorted[0][1];
		const arre = scne.lineIntensitySorted[0][1];
		const itst = [	scnn.lineIntensitySorted[0][0]/scnn.lineIntensitySorted[1][0],
						scns.lineIntensitySorted[0][0]/scns.lineIntensitySorted[1][0],
						scnw.lineIntensitySorted[0][0]/scnw.lineIntensitySorted[1][0],
						scne.lineIntensitySorted[0][0]/scne.lineIntensitySorted[1][0]];
		if(itst[0]<intensity||itst[1]<intensity||itst[2]<intensity||itst[3]<intensity){
			console.log("NG intensity");
			console.log(itst);
			return [0,0,false];
		}
		const errs = [findError(arrn,length/2), findError(arrs,length/2), findError(arrw,length/2), findError(arre,length/2)];
		if(errs[0]>error||errs[1]>error||errs[2]>error||errs[3]>error){
			console.log("NG error");
			console.log(errs);
			return [0,0,false];
		}
		const newX = (arrn+arrs)/2+xin-length/2;
		const newY = (arrw+arre)/2+yin-length/2;
		return [newX, newY, errs, itst];
	}
	findStartingXY(xin,yin){
		const offset = this.cellMax/20;
		const imgr = newWindow().centerWidthHeight(xin+offset,yin,1,this.cellMax*2);
		const scannerr = new IntersectionDetector(imgr.passdata,1,1);
		const arrayr = scannerr.lineIntensitySorted;
		let lineIndex = [0,0];
		let indexCounter = 0;
		for(let i=0;i<10;i++){
			const xnew = xin-offset;
			const ynew = scannerr.ypos+arrayr[i][1];
			const index = this.confirmHorizontalLine(xnew, ynew);
			if(index!="fail"){
				lineIndex[indexCounter] = ynew;
				indexCounter++;
				if(indexCounter==2){
					this.cellLength = Math.abs(lineIndex[1]-lineIndex[0]);
					const startingPoint = this.findCross(xin,lineIndex[0]);
					circle(startingPoint[0]/canvasScale,startingPoint[1]/canvasScale,3);
					console.log(startingPoint);
					const nextPoint = this.findCross(xin,lineIndex[0]+this.cellLength);
					circle(nextPoint[0]/canvasScale,nextPoint[1]/canvasScale,3);
					console.log(nextPoint);
					this.cellLength=(nextPoint[1]-startingPoint[1]);
					return [startingPoint[0],startingPoint[1]];
				}
			}
		}
		this.abort("horizontalLine Not Found");
		return "fail";
	}
	confirmHorizontalLine(xin,yin){
		const tryCount = 10;
		const step = this.cellMax/tryCount;
		let successCounter = 0;
		//Scan In Lower Direction
		for(let i=0;i<tryCount;i++){
			const xnew = xin-(1+i)*step;
			const img = newWindow().centerWidthHeight(xnew,yin,1,this.cellMax/5);
			const scanner = new IntersectionDetector(img.passdata, 1);
			const array = scanner.lineIntensity;
			const newY = yin-this.cellMax/10+getMaxIndex(array)[0];
			const dir = getDir([xin,yin],[xnew,newY]);
			if(findError(dir,180)<3) successCounter++;
		}
		if(successCounter<7) return "fail";
		return true;
	}

	rotateImage(angleXY){
		const d = 90-angleXY[0];
		const x = angleXY[1];
		const y = angleXY[2];
		const r = deg2rad(d);
		hct.save();
		hct.translate(x,y);
		hct.rotate( r );
		hct.translate( -x, -y );
		hct.drawImage( himg, 0, 0 );
		hct.restore();
		ct.translate(x/canvasScale,y/canvasScale);
		ct.rotate( -r );
		ct.translate( -x/canvasScale, -y/canvasScale );
	}
	findAngleXY(){
		//Scan for lines at horizontal line in middle
		let imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, this.cellMax, 1);
		let scanner = new IntersectionDetector(imgData.passdata);
		const array = scanner.lineIntensitySorted;
		//Check if the detected line is continuous
		for(let i=0;i<10;i++){
			const angleCandidate = this.findAngleCandidate(scanner.xpos+array[i][1],scanner.ypos);
			const angleReliable = this.findAngleReliable(scanner.xpos+array[i][1],scanner.ypos, angleCandidate);
			if(angleReliable!="fail"){
				console.log("Angle Successfully Found: "+angleReliable);
				return [angleReliable,scanner.xpos+array[i][1],scanner.ypos] ;
			}
		}
		this.abort("Failed to find angle");
		return "fail";
	}
	findAngleReliable(xin, yin, dirIn){
		const tryCount = 10;
		const xyStep = getXYfromDirDis(dirIn,this.cellMax/tryCount);
		let successCounter = 0;
		let dirList = new Array(tryCount);
		//Scan In Lower Direction
		for(let i=0;i<tryCount;i++){
			const xnew = xin+(i+1)*xyStep[0];
			const ynew = yin+(i+1)*xyStep[1];
			const img = newWindow().centerWidthHeight(xnew,ynew,this.cellMax/5,1);
			const scanner = new IntersectionDetector(img.passdata);
			const array = scanner.lineIntensity;
			const newX = xnew-this.cellMax/10+getMaxIndex(array)[0];
			dirList[i] = getDir([xin,yin],[newX,ynew]);
			if(findError(dirList[i],dirIn)<3) successCounter++;
		}
		if(successCounter<7) return "fail";
		return getMedian(dirList);
	}
	findAngleCandidate(xin, yin){
		let xnow = xin;
		let yupper = yin+this.cellMax/8;
		let ylower = yin+this.cellMax/4;
		let imgDataUpper = newWindow().centerWidthHeight(xnow,yupper,this.cellMax/5,1);
		let imgDataLower = newWindow().centerWidthHeight(xnow,ylower,this.cellMax/5,1);
		let scannerUpper = new IntersectionDetector(imgDataUpper.passdata);
		let scannerLower = new IntersectionDetector(imgDataLower.passdata);
		let arrayUpper = scannerUpper.lineIntensity;
		let arrayLower = scannerLower.lineIntensity;
		const newXupper = getMaxIndex(arrayUpper);
		const newXLower = getMaxIndex(arrayLower);
		const newXreliable = xin-this.cellMax/10+(newXupper[1]>newXLower[1]?newXupper[0]:newXLower[0]);
		const newYreliable = (newXupper[1]>newXLower[1])?yupper:ylower;
		return getDir([xin,yin],[newXreliable,newYreliable]);
	}
}