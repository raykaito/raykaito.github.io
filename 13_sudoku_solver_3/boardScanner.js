class VisionProgram_BoardReader{
	constructor(){
		//tells if the program has failed or not
		this.failed;
		//Orientation of the board
		this.xc;
		this.yc;
		this.rotationAngle;
		this.vAngle;//at x=0, x position shifts(+) as it moves in +y direction
		this.dy; //y position shifts(+) as it moves in +x direction and as it moves in +y direction
		this.dx; //x position shifts(+) as it moves in +y direction and as it moves in +x direction
		this.cellCountX;
		this.cellCountY;
		//Properties of the board
		this.cellLength;
		this.cellLengthy;
		//Index of the corners
		this.xIndexMin;
		this.yIndexMin;
		this.scanInterval = 1;
		this.lastTime = Date.now();
		//Info about empty cells
		this.emptyCells = new Array(64);
	}
	startScan(){
		//Initialize the scanner
		this.init();
		if(this.failed) return false;

		//find angle, intersection and cell length
		this.getXYangle();
		if(this.failed) return false;

		//rotate canvas
		rotateCanvas(this.xc, this.yc, this.rotationAngle);

		//locate the four corners
		this.getFourCorners();
		if(this.failed) return false;

		//scan the numbers
		this.scanEmptyCells();
		return true;
	}
	init(){
		if((Date.now()-this.lastTime)<this.scanInterval){
			this.abort("not time to scan yet");
			return false;
		}
		this.lastTime = Date.now();
		this.cellLength = -1;
		this.failed=false;
	}
	temp(){
		const imgX = newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1);
		const scnX = new IntersectionDetector(imgX.passdata, 0,1);

		ct.fillStyle = "cyan";
		ct.font = "40px Arial";
		const number1 = hcanvas.width;
		const number2 = hcanvas.height;
		const number3 = scnX.std;
		ct.fillText(Math.round((number1)*100)/100,10/canvasScale,30/canvasScale);
		ct.fillText(Math.round((number2)*100)/100,10/canvasScale,55/canvasScale);
		ct.fillText(Math.round((number3)*100)/100,10/canvasScale,80/canvasScale);
	}
	abort(msg){
		this.failed=true;
		console.log(msg);
	}
	getXYangle(){
		const rangeOfSearch = hcanvas.width/2;
		const numberOfLines = 10;
		const xCorner = (hcanvas.width - rangeOfSearch)/2;
		const yCorner = (hcanvas.height- rangeOfSearch)/2;
		let inH = new Array(numberOfLines+1);
		let inV = new Array(numberOfLines+1);
		const disp = (mode==4?1:0);
		if(mode==5){
			const imgH = newWindow().centerWidthHeight(hcanvas.width/2,  yCorner+rangeOfSearch*(0.5), rangeOfSearch, 1);
			const scannerH = new IntersectionDetector(imgH.passdata, 0, 2);//((i==0||i==numberOfLines)?1:0));
			this.abort("mode==5");
			return;
		}
		//Gather Circles
		for(let i=0;i<=numberOfLines;i++){
			const imgH = newWindow().centerWidthHeight(hcanvas.width/2,  yCorner+rangeOfSearch*(i/numberOfLines), rangeOfSearch, 1);
			const imgV = newWindow().centerWidthHeight(xCorner+rangeOfSearch*(i/numberOfLines), hcanvas.height/2, 1, rangeOfSearch);
			const scannerH = new IntersectionDetector(imgH.passdata, 0, disp);//((i==0||i==numberOfLines)?1:0));
			const scannerV = new IntersectionDetector(imgV.passdata, 1, disp);//((i==0||i==numberOfLines)?1:0));
			inH[i] = scannerH.intersections;
			inV[i] = scannerV.intersections;
		}
		if(mode==4){
			this.abort("mode==4");
			return;
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
		}
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
		for(let i=0;i<xyV.length;i++){
			circle(xyV[i][0],xyV[i][1],15);
			circle(xyV[i][2],xyV[i][3],15);
		}
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
		this.xc = xy1[0];
		this.yc = xy1[1];
		this.rotationAngle = -getDir([xyH[0][0],xyH[0][1]],[xyH[0][2],xyH[0][3]]);
		if(mode==3){
			line([xy1,xy2,1],["red",4]); //Top line
			line([xy2,xy3,1],["red",4]); // Right line
			line([xy3,xy4,1],["red",4]); //bottom line
			line([xy4,xy1,1],["red",4]); //left line
			this.abort("mode==3");
			return;
		}
		//Calculate cell length
		let gapList = new Array();
		for(let i=0;i<xyV.length-1;i++){
			gapList[gapList.length] = xyV[i+1][0]-xyV[i][0];
		}
		for(let i=0;i<xyH.length-1;i++){
			gapList[gapList.length] = xyH[i+1][1]-xyH[i][1];
		}
		//Analyze the gapList
		const acceptableErrorPercentage = 5;
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
		this.cellCountY = Math.round(sideLength4/this.cellLength);
		/*
		ct.fillStyle = "cyan";
		ct.font = "40px Arial";
		ct.fillText(Math.round((sideLength2/this.cellLength)*100)/100,300/canvasScale,200/canvasScale);
		ct.fillText(Math.round((sideLength4/this.cellLength)*100)/100,100/canvasScale,200/canvasScale);
		ct.fillText(Math.round((sideLength1/this.cellLength)*100)/100,200/canvasScale,100/canvasScale);
		ct.fillText(Math.round((sideLength3/this.cellLength)*100)/100,200/canvasScale,400/canvasScale);
		*/
		this.vAngle= getDir([xyV[0][0],xyV[0][1]],[xyV[0][2],xyV[0][3]])+this.rotationAngle-90;
		this.dx = Math.pow((sideLength2/sideLength4),(1/this.cellCountX));
		this.dy = Math.pow((sideLength3/sideLength1),(1/this.cellCountY));
		if(this.cellCountX*this.cellCountY==0){
			this.abort("cell length not found");
			return;
		}
		const partialx = (this.dx==1)?(1):((1/Math.log(this.dx)*(Math.pow(this.dx,this.cellCountX)-1)));
		const partialy = (this.dy==1)?(1):((1/Math.log(this.dy)*(Math.pow(this.dy,this.cellCountY)-1)));
		this.cellLength = sideLength1/partialx;
		this.cellLengthy= sideLength4/partialy;
		return;
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
				xIndex1 = xIndex2 = (xFrontDead?xfrontLow-1:xfrontHigh+1);
			}else{
				xIndex1 = xfrontLow;
				xIndex2 = xfrontHigh;
				yIndex1 = yIndex2 = (yFrontDead?yfrontLow-1:yfrontHigh+1);
			}
			const result = this.checkForLine(xIndex1, yIndex1, xIndex2, yIndex2);
			if(verticalScan){
				if(!xFrontDead){
					if(result)	xfrontHigh = xIndex1;		
					else 		xFrontDead = true;
				}else{
					if(result)	xfrontLow = xIndex1;
					else {this.abort("unable to find corners");return;}
				}
			}else{
				if(!yFrontDead){
					if(result)	yfrontHigh = yIndex1;		
					else 		yFrontDead = true;
				}else{
					if(result)	yfrontLow = yIndex1;
					else {this.abort("unable to find corners"); return;}
				}
			}
		}
		this.xIndexMin = xfrontLow-0.5;
		this.yIndexMin = yfrontLow-0.5;
		const xyc1 = this.getXYfromIndex(this.xIndexMin  ,this.yIndexMin  );
		const xyc2 = this.getXYfromIndex(this.xIndexMin+8,this.yIndexMin  );
		const xyc3 = this.getXYfromIndex(this.xIndexMin+8,this.yIndexMin+8);
		const xyc4 = this.getXYfromIndex(this.xIndexMin  ,this.yIndexMin+8);
		/*
		circle([xyc1[0],xyc1[1],9]);
		circle([xyc2[0],xyc2[1],9]);
		circle([xyc3[0],xyc3[1],9]);
		circle([xyc4[0],xyc4[1],9]);
		*/
		return;
	}
	checkForLine(xIndex1, yIndex1, xIndex2, yIndex2){
		const v = false;
		//Get Position to Scan
		const verticalScan = (xIndex1==xIndex2);
		const xy1 = this.getXYfromIndex((xIndex1-0.5), (yIndex1-0.5));
		const xy2 = this.getXYfromIndex((xIndex2-0.5), (yIndex2-0.5));
		const xc = (xy1[0]+xy2[0])/2;
		const yc = (xy1[1]+xy2[1])/2;
		const width = verticalScan?1:(getDist(xy1,xy2));
		const height= verticalScan?(getDist(xy1,xy2)):1;
		if(width*height<1){
			this.abort("unknown error has occured");
			return;
		}
		//Scan the appropriate section
		const img = newWindow().centerWidthHeight(xc,yc,width,height);
		const scanner = new IntersectionDetector(img.passdata, verticalScan, v);
		const inter = scanner.intersections;
		//Analyze the result
		const expectedLines = (xIndex2-xIndex1)+(yIndex2-yIndex1);
		const acceptableErrorPercentage = 5;
		const minCounter = expectedLines*0.5;
		let counter = 0;
		for(let i=0;i<expectedLines;i++){
			const expectedPosition = this.getXYfromIndex(xIndex1+(verticalScan?-0.5:i),yIndex1+(verticalScan?i:-0.5));
			for(let j=0;j<inter.length;j++){
				const actualPosition = (verticalScan?scanner.ypos:scanner.xpos)+inter[j];
				const error = Math.abs(100*(expectedPosition[verticalScan?1:0]-actualPosition)/this.cellLength);
				if(error<acceptableErrorPercentage){
					ct.fillStyle = "red";
					ct.font = "20px Arial";
					//ct.fillText(Math.floor(100*findError(cellLength/2,(inter[i]%cellLength)))/100,xy1[0]/canvasScale,(scanner.ypos+inter[i])/canvasScale);
					if(v) ct.fillText(Math.floor(100*error)/100,expectedPosition[0]/canvasScale,expectedPosition[1]/canvasScale);
					counter++;
					break;
				}
			}
		}
		return (counter>=minCounter);
	}
	getXYfromIndex(xIndex, yIndex){
		const partialx = (this.dx==1)?(1):((1/Math.log(this.dx)*(Math.pow(this.dx,xIndex)-1)));
		const partialy = (this.dy==1)?(1):((1/Math.log(this.dy)*(Math.pow(this.dy,yIndex)-1)));
		const x = (this.cellLength *partialx)*Math.pow(this.dy,yIndex)-getXYfromDirDis(this.vAngle,yIndex*this.cellLength)[1]+this.xc;
		const y = (this.cellLengthy*partialy)*Math.pow(this.dx,xIndex)+this.yc;
		return [x,y];
	}
	scanEmptyCells(){
		for(let xi=0;xi<9;xi++){
			for(let yi=0;yi<9;yi++){
				if(this.checkEmpty(xi+this.xIndexMin,yi+this.yIndexMin)){
					this.emptyCells[xi+9*yi] = 1;
					/*
					line(this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin-0.4),
						 this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin+0.4),3*pixelRatio,"red");
					line(this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin+0.4),
						 this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin-0.4),3*pixelRatio,"red");
					*/
				}else{
					this.emptyCells[xi+9*yi] = 0;
					line([this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin-0.4),
						 this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin-0.4)],["red",3]);
					line([this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin-0.4),
						 this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin+0.4)],["red",3]);
					line([this.getXYfromIndex(xi+this.xIndexMin+0.4,yi+this.yIndexMin+0.4),
						 this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin+0.4)],["red",3]);
					line([this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin+0.4),
						 this.getXYfromIndex(xi+this.xIndexMin-0.4,yi+this.yIndexMin-0.4)],["red",3]);
				}
			}
		}
		if(mode==2){
			this.abort("mode==2");
			return;
		}
		console.log("success: "+(Date.now()-animationStartTime));
		return;
	}
	checkEmpty(xi,yi){
		const xyc = this.getXYfromIndex(xi,yi);
		const img = newWindow().centerWidthHeight(xyc[0],xyc[1],this.cellLength/2,1);
		const scn = new IntersectionDetector(img.passdata, 0);
		return (scn.std<15);
	}
}
console.log("Loaded: boardScanner.js");