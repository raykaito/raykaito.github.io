class VisionProgram_SudokuReader{
	constructor(){
		this.cellLength;
		this.failed;
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
		const  xyAngle = this.getXYangle();
		if(this.failed) return;

		//rotate canvas
		rotateCanvas(xyAngle);

		//locate the four corners
		const xyCorner = this.getFourCorners(xyAngle[0],xyAngle[1]);
	}
	temp(){
		const imgX = newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1);
		const scnX = new IntersectionDetector(imgX.passdata, 0,1);
	}
	getFourCorners(xin, yin){
		const cl = this.cellLength;
		const x = xin +cl/2;
		const y = yin +cl/2;
		const xc = x%cl;
		const yc = y%cl;
		const nx = Math.min(15,Math.floor(hcanvas.width /cl));
		const ny = Math.min(15,Math.floor(hcanvas.height/cl));
		let inX = new Array(), xIndex;
		let inY = new Array(), yIndex;
		const acceptableErrorPercentage = 5;
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
		for(let i=0;i<ny;i++){
			let counter=0;
			for(let j=0;j<inX[i].length-1;j++){
				if(findError(cl,inX[i][j+1]-inX[i][j])<acceptableErrorPercentage){
					counter++;
				}
			}
			ct.fillStyle = "cyan";
			ct.font = "20px Arial";
			ct.fillText(""+counter,xc,yc+cl*i);
		}
		for(let i=0;i<nx;i++){
			let counter=0;
			for(let j=0;j<inY[i].length-1;j++){
				if(findError(cl,inY[i][j+1]-inY[i][j])<acceptableErrorPercentage){
					counter++;
				}
			}
			ct.fillStyle = "cyan";
			ct.font = "20px Arial";
			ct.fillText(""+counter,xc+cl*i,yc);
		}
		//Analyze intersections horizontal
		circle((xc+cl* xIndex   )/canvasScale,(yc+cl* yIndex   )/canvasScale,this.cellLength/2/canvasScale);
		circle((xc+cl*(xIndex+8))/canvasScale,(yc+cl* yIndex   )/canvasScale,this.cellLength/2/canvasScale);
		circle((xc+cl* xIndex   )/canvasScale,(yc+cl*(yIndex+8))/canvasScale,this.cellLength/2/canvasScale);
		circle((xc+cl*(xIndex+8))/canvasScale,(yc+cl*(yIndex+8))/canvasScale,this.cellLength/2/canvasScale);
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
			circle(xyV[i][0]/canvasScale,xyV[i][1]/canvasScale,15);
			circle(xyV[i][2]/canvasScale,xyV[i][3]/canvasScale,15);
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
			circle(xyH[i][0]/canvasScale,xyH[i][1]/canvasScale,15);
			circle(xyH[i][2]/canvasScale,xyH[i][3]/canvasScale,15);
		}*/
		if(xyV.length*xyH.length==0){
			this.abort("unable to find lines");
			return;
		}
		//Calculate x, y, and angle
		const x1 = xyV[0][0],
		      y1 = xyV[0][1],
		      x2 = xyV[0][2],
		      y2 = xyV[0][3],
		      x3 = xyH[0][0],
		      y3 = xyH[0][1],
		      x4 = xyH[0][2],
		      y4 = xyH[0][3];
		//Check if the board is perfectly aligned
		let x = 0, y = 0;
		if(x2==x1||y3==y4){
			x = x1;
			y = y3;
		}else if(y1==y2||x3==x4){
			x = x3;
			y = y1;
		}else{
			y = ((x3-x1)+(x2-x1)*(y1/(y2-y1))+(x4-x3)*(y3/(y3-y4)))/((x2-x1)/(y2-y1)+(x4-x3)/(y3-y4));
			x = (y-y1)/(y2-y1)*(x2-x1)+x1;
		}
		const angle = -getDir([xyH[0][0],xyH[0][1]],[xyH[0][2],xyH[0][3]]);
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
				this.cellLength = gapList[i]*Math.cos(deg2rad(angle));
				break;
			}
		}
		if(this.cellLength==-1){
			this.abort("cell length not found");
			return;
		}
		return [x,y,angle];
	}
}
console.log("Loaded: sudokuScanner.js");