class VisionProgram_SudokuReader{
	constructor(){
		//tells if the program as failed or not
		this.failed;
		//Orientation of the board
		this.xCofR;
		this.yCofR;
		this.rotationAngle;
		this.vAngle;//at x=0, x position shifts(+) as it moves in +y direction
		this.dy; //y position shifts(+) as it moves in +x direction and as it moves in +y direction
		this.dx; //x position shifts(+) as it moves in +y direction and as it moves in +x direction
		this.cellCountX;
		this.cellCountY;
		//Properties of the board
		this.cellLength;
		this.cellLengthy;
	}
	init(){
		this.cellLength = -1;
		this.failed=false;
	}
	abort(msg){
		this.failed=true;
		console.log(msg);
	}
	startScan(){
		this.init();
		//find angle, intersection and cell length
		this.getXYangle();
		if(this.failed) return;

		//rotate canvas
		rotateCanvas(this.xCofR, this.yCofR, this.rotationAngle);

		//locate the four corners
		this.getFourCorners();
	}
	temp(){
		const imgX = newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1);
		const scnX = new IntersectionDetector(imgX.passdata, 0,1);
	}
	getXYfromIndex(xIndex, yIndex){
		const x = (xIndex*this.cellLength )*(1+yIndex*this.cellLength *this.dx)-getXYfromDirDis(this.vAngle,yIndex*this.cellLength)[1]+this.xCofR;
		const y = (yIndex*this.cellLengthy)*(1+xIndex*this.cellLengthy*this.dy)+this.yCofR;
		return [x,y];
	}
	checkForLine(xIndex1, yIndex1, xIndex2, yIndex2){
		//Get Position to Scan
		const verticalScan = (xIndex1==xIndex2);
		const xyTemp1 = this.getXYfromIndex(xIndex1, yIndex1);
		const xyTemp2 = this.getXYfromIndex(xIndex2, yIndex2);
		const xy1 = [xyTemp1[0]-this.cellLength/2,xyTemp1[1]-this.cellLengthy/2];
		const xy2 = [xyTemp2[0]-this.cellLength/2,xyTemp2[1]-this.cellLengthy/2];
		const xc = (xy1[0]+xy2[0])/2;
		const yc = (xy1[1]+xy2[1])/2;
		const width = verticalScan?1:(getDist(xy1,xy2));
		const height= verticalScan?(getDist(xy1,xy2)):1;
		//Scan the appropriate section
		const img = newWindow().centerWidthHeight(xc,yc,width,height);
		const scanner = new IntersectionDetector(img.passdata, verticalScan, 1);
		const inter = scanner.intersections;
		//Analyze the result
		const cellLengtha = verticalScan?(this.cellLengthy)*(1+xIndex1*this.cellLengthy*this.dy):(this.cellLength)*(1+yIndex1*this.cellLength *this.dx);
		const cellLength = width*height/(xIndex2-xIndex1+yIndex2-yIndex1);
		const acceptableErrorPercentage = 10;
		const minCounter = (xIndex2-xIndex1+yIndex2-yIndex1)*0.5;
		let counter = 0;
		for(let i=0;i<inter.length;i++){
			ct.fillStyle = "red";
			ct.font = "20px Arial";
			//ct.fillText(Math.floor(100*findError(cellLength/2,(inter[i]%cellLength)))/100,xy1[0]/canvasScale,(scanner.ypos+inter[i])/canvasScale);
			ct.fillText((inter[i]),xy1[0]/canvasScale,(scanner.ypos+inter[i])/canvasScale);
			if(findError(cellLength/2,(inter[i]%cellLength))<acceptableErrorPercentage){
				counter++;
			}
		}
		ct.fillText(counter+","+width*height,xy1[0]/canvasScale,xy1[1]/canvasScale);
		if(counter>=minCounter){
			ct.strokeStyle = "red";
			circle(xy1[0],xy1[1],5);
			circle(xy2[0],xy2[1],5);
			return true;
		}else{
			return false;
		}
	}
	getFourCorners(){
		let xfrontHigh= this.cellCountX+1;
		let yfrontHigh= this.cellCountY+1;
		let xfrontLow = 0;
		let yfrontLow = 0;
		let xFrontDead = false;//This turns true when xfrontHigh is at the end;
		let yFrontDead = false;//This turns true when xfrontHigh is at the end;
		let xIndex1, yIndex1, xIndex2, yIndex2;

		while((xfrontHigh-xfrontLow+yfrontHigh-yfrontLow)<16){
			const verticalScan = (xfrontHigh-xfrontLow)<(yfrontHigh-yfrontLow);
			if(verticalScan){
				yIndex1 = yfrontLow;
				yIndex2 = yfrontHigh;
				if(xFrontDead){
					xIndex1 = xfrontLow-1;
					xIndex2 = xfrontLow-1;
				}else{
					xIndex1 = xfrontHigh+1;
					xIndex2 = xfrontHigh+1;
				}
			}else{
				xIndex1 = xfrontLow;
				xIndex2 = xfrontHigh;
				if(yFrontDead){
					yIndex1 = yfrontLow-1;
					yIndex2 = yfrontLow-1;
				}else{
					yIndex1 = yfrontHigh+1;
					yIndex2 = yfrontHigh+1;
				}
			}
			const result = this.checkForLine(xIndex1, yIndex1, xIndex2, yIndex2);
			if(verticalScan){
				if(!xFrontDead){
					if(result){
						xfrontHigh = xIndex1;
						continue;						
					}else{
						xFrontDead = true;
					}
				}else{
					xfrontLow = xIndex1;
					continue;
				}
			}else{
				if(!yFrontDead){
					if(result){
						yfrontHigh = yIndex1;
						continue;						
					}else{
						yFrontDead = true;
					}
				}else{
					yfrontLow = yIndex1;
					continue;
				}
			}
		}
		return;
	}
	getFourCorners_bak(xin, yin){
		const cl = this.cellLength;
		const x = xin +cl/2;
		const y = yin +cl/2;
		const xc = x%cl;
		const yc = y%cl;
		const nx = Math.min(15,Math.floor(hcanvas.width /cl));
		const ny = Math.min(15,Math.floor(hcanvas.height/cl));
		let inX = new Array(), xIndex;
		let inY = new Array(), yIndex;
		const acceptableErrorPercentage = 10;
		const minCounter = 2;
		for(let i=0;i<ny;i++){
			const imgX = newWindow().cornerWidthHeight(xc,yc+cl*i,nx*cl,1);
			const scnX = new IntersectionDetector(imgX.passdata, 0, 0);
			inX[i] = scnX.intersections;
		}
		for(let i=0;i<nx;i++){
			const imgY = newWindow().cornerWidthHeight(xc+cl*i,yc,1,ny*cl);
			const scnY = new IntersectionDetector(imgY.passdata, 1, 0);
			inY[i] = scnY.intersections;
		}
		//Count the empty boxes;
		let ebx = new Array(ny).fill(0);
		let eby = new Array(nx).fill(0);
		for(let i=0;i<ny;i++){
			for(let j=0;j<inX[i].length-1;j++){
				if(findError(cl,inX[i][j+1]-inX[i][j])<acceptableErrorPercentage){
					circle((xc+(inX[i][j+1]+inX[i][j])/2),(yc+cl*i),this.cellLength/2);
					ebx[i]++;
					eby[Math.floor((inX[i][j+1]+inX[i][j])/2/cl)]++;
				}
			}
			ct.fillStyle = "cyan";
			ct.font = "20px Arial";
			ct.fillText(""+ebx[i],(xc),(yc+cl*i));
		}
		for(let i=0;i<nx;i++){
			for(let j=0;j<inY[i].length-1;j++){
				if(findError(cl,inY[i][j+1]-inY[i][j])<acceptableErrorPercentage){
					circle((xc+cl*i),(yc+(inY[i][j+1]+inY[i][j])/2),this.cellLength/4);
					ct.fillStyle = "red";
					ct.font = "10px Arial";
					ct.fillText(""+Math.floor(findError(cl,inY[i][j+1]-inY[i][j])*10)/10,(xc+cl*i),(yc+(inY[i][j+1]+inY[i][j])/2),);
					eby[i]++;
					ebx[Math.floor((inY[i][j+1]+inY[i][j])/2/cl)]++;
				}
			}
			ct.fillStyle = "cyan";
			ct.font = "20px Arial";
			ct.fillText(""+eby[i],(xc+cl*i),(yc));
		}
		//Analyze intersections horizontal
		circle((xc+cl* xIndex   ),(yc+cl* yIndex   ),this.cellLength/2);
		circle((xc+cl*(xIndex+8)),(yc+cl* yIndex   ),this.cellLength/2);
		circle((xc+cl* xIndex   ),(yc+cl*(yIndex+8)),this.cellLength/2);
		circle((xc+cl*(xIndex+8)),(yc+cl*(yIndex+8)),this.cellLength/2);
		//Analyze X intersections
	}
	getXYangle(){
		const rangeOfSearch = hcanvas.width/2;
		const numberOfLines = 10;
		const xCorner = (hcanvas.width - rangeOfSearch)/2;
		const yCorner = (hcanvas.height- rangeOfSearch)/2;
		let inH = new Array(numberOfLines+1);
		let inV = new Array(numberOfLines+1);
		//Gather Circles
		for(let i=0;i<=numberOfLines;i++){
			const imgH = newWindow().centerWidthHeight(hcanvas.width/2,  yCorner+rangeOfSearch*(i/numberOfLines), rangeOfSearch, 1);
			const imgV = newWindow().centerWidthHeight(xCorner+rangeOfSearch*(i/numberOfLines), hcanvas.height/2, 1, rangeOfSearch);
			const scannerH = new IntersectionDetector(imgH.passdata, 0, 0);//((i==0||i==numberOfLines)?1:0));
			const scannerV = new IntersectionDetector(imgV.passdata, 1, 0);//((i==0||i==numberOfLines)?1:0));
			inH[i] = scannerH.intersections;
			inV[i] = scannerV.intersections;
		}
		//Analyze intersections horizontal
		const acceptableError = rangeOfSearch/100;
		const minInterCounter = numberOfLines*0.7;
		let xyV = new Array();
		for(let upperIndex = 0;upperIndex<inH[0].length;upperIndex++){
			const xup = inH[0][upperIndex];
			for(let lowerIndex = 0;lowerIndex<inH[numberOfLines].length;lowerIndex++){
				const xlo = inH[numberOfLines][lowerIndex];
				let interCounter = 0;
				for(let i=1;i<numberOfLines;i++){
					const xta = xup+(xlo-xup)*i/numberOfLines;
					let error = rangeOfSearch;
					for(let index = 0;index<inH[i].length;index++){
						error = Math.min(Math.abs(inH[i][index]-xta),error);
					}
					if(error<acceptableError)interCounter++;
				}
				if(interCounter>=minInterCounter){
					xyV[xyV.length] = [xCorner+xup,yCorner,xCorner+xlo,yCorner+rangeOfSearch];
				}
			}
		}/*
		for(let i=0;i<xyV.length;i++){
			circle(xyV[i][0],xyV[i][1],15);
			circle(xyV[i][2],xyV[i][3],15);
		}*/
		//Analyze intersections vertical
		let xyH = new Array();
		for(let upperIndex = 0;upperIndex<inV[0].length;upperIndex++){
			const xup = inV[0][upperIndex];
			for(let lowerIndex = 0;lowerIndex<inV[numberOfLines].length;lowerIndex++){
				const xlo = inV[numberOfLines][lowerIndex];
				let interCounter = 0;
				for(let i=1;i<numberOfLines;i++){
					const xta = xup+(xlo-xup)*i/numberOfLines;
					let error = rangeOfSearch;
					for(let index = 0;index<inV[i].length;index++){
						error = Math.min(Math.abs(inV[i][index]-xta),error);
					}
					if(error<acceptableError)interCounter++;
				}
				if(interCounter>=minInterCounter){
					xyH[xyH.length] = [yCorner,xCorner+xup,yCorner+rangeOfSearch,xCorner+xlo];
				}
			}
		}/*
		for(let i=0;i<xyH.length;i++){
			circle(xyH[i][0],xyH[i][1],15);
			circle(xyH[i][2],xyH[i][3],15);
		}*/
		if(xyV.length*xyH.length==0){
			this.abort("unable to find lines");
			return;
		}
		//Calculate x, y, and angle
		const xy1 = getXfrom4points([xyV[0           ][0],xyV[0           ][1]],
									[xyV[0           ][2],xyV[0           ][3]],
									[xyH[0           ][0],xyH[0           ][1]],
									[xyH[0           ][2],xyH[0           ][3]]);
		const xy2 = getXfrom4points([xyV[xyV.length-1][0],xyV[xyV.length-1][1]],
									[xyV[xyV.length-1][2],xyV[xyV.length-1][3]],
									[xyH[0           ][0],xyH[0           ][1]],
									[xyH[0           ][2],xyH[0           ][3]]);
		const xy3 = getXfrom4points([xyV[xyV.length-1][0],xyV[xyV.length-1][1]],
									[xyV[xyV.length-1][2],xyV[xyV.length-1][3]],
									[xyH[xyH.length-1][0],xyH[xyH.length-1][1]],
									[xyH[xyH.length-1][2],xyH[xyH.length-1][3]]);
		const xy4 = getXfrom4points([xyV[0           ][0],xyV[0           ][1]],
									[xyV[0           ][2],xyV[0           ][3]],
									[xyH[xyH.length-1][0],xyH[xyH.length-1][1]],
									[xyH[xyH.length-1][2],xyH[xyH.length-1][3]]);
		this.xCofR = xy1[0];
		this.yCofR = xy1[1];
		this.rotationAngle = -getDir([xyH[0][0],xyH[0][1]],[xyH[0][2],xyH[0][3]]);
		ct.strokeStyle = "cyan";
		line(xy1,xy2);
		line(xy2,xy3);
		line(xy3,xy4);
		line(xy4,xy1);
		//Calculate cell length
		let gapList = new Array();
		for(let i=0;i<xyV.length-1;i++){
			gapList[gapList.length] = xyV[i+1][0]-xyV[i][0];
		}
		for(let i=0;i<xyH.length-1;i++){
			gapList[gapList.length] = xyH[i+1][1]-xyH[i][1];
		}
		//Analyze the gapList
		const acceptableErrorPercentage = 3;
		const minCounter = 3;
		let counter;
		for(let i=0;i<gapList.length;i++){
			counter = 0;
			for(let j=0;j<gapList.length;j++){
				if(findError(gapList[i],gapList[j])<acceptableErrorPercentage) counter++;
			}
			if(counter>=minCounter){
				this.cellLength = gapList[i]*Math.cos(deg2rad(this.rotationAngle));
				break;
			}
		}
		if(this.cellLength==-1){
			this.abort("cell length not found");
			return;
		}
		//Analyze properties which increases the accuracy
		const sideLength1 = getDist(xy1,xy2);//upper side
		const sideLength2 = getDist(xy2,xy3);//rigth side
		const sideLength3 = getDist(xy3,xy4);//lower side
		const sideLength4 = getDist(xy4,xy1);//lefto side
		this.cellCountX = Math.round(sideLength1/this.cellLength);
		this.cellCountY = Math.round(sideLength2/this.cellLength);
		this.vAngle= getDir([xyV[0][0],xyV[0][1]],[xyV[0][2],xyV[0][3]])+this.rotationAngle-90;
		this.dx = (sideLength3-sideLength1)/sideLength4/sideLength1;
		this.dy = (sideLength2-sideLength4)/sideLength4/sideLength1;
		if(this.cellCountX*this.cellCountY==0){
			this.abort("cell length not found");
			return;
		}
		this.cellLength = sideLength1/this.cellCountX;
		this.cellLengthy= sideLength4/this.cellCountY;
		ct.fillStyle = "cyan";
		ct.font = "40px Arial";
		//ct.fillText(Math.round(this.vAngle*100)/100,100/canvasScale,100/canvasScale);
		return;
	}
}
console.log("Loaded: sudokuScanner.js");