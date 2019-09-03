class VisionProgram_SudokuReader{
	constructor(){
		//tells if the program as failed or not
		this.failed;
		//Orientation of the board
		this.xCofR;
		this.yCofR;
		this.rotationAngle;
		this.vAngle;//angle of vertical line at xyCofR
		this.xScale;//vertical   distance exapnds as it moves in +x direction
		this.yScale;//horizontal distance exapnds as it moves in +y direction
		//Properties of the board
		this.cellLength;
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
		return;

		//rotate canvas
		rotateCanvas(this.xCofR, this.yCofR, this.rotationAngle);

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
		}
		for(let i=0;i<xyV.length;i++){
			circle(xyV[i][0],xyV[i][1],15);
			circle(xyV[i][2],xyV[i][3],15);
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
		}
		for(let i=0;i<xyH.length;i++){
			circle(xyH[i][0],xyH[i][1],15);
			circle(xyH[i][2],xyH[i][3],15);
		}
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
		const xy3 = getXfrom4points([xyV[0           ][0],xyV[0           ][1]],
									[xyV[0           ][2],xyV[0           ][3]],
									[xyH[xyH.length-1][0],xyH[xyH.length-1][1]],
									[xyH[xyH.length-1][2],xyH[xyH.length-1][3]]);
		const xy4 = getXfrom4points([xyV[xyV.length-1][0],xyV[xyV.length-1][1]],
									[xyV[xyV.length-1][2],xyV[xyV.length-1][3]],
									[xyH[xyH.length-1][0],xyH[xyH.length-1][1]],
									[xyH[xyH.length-1][2],xyH[xyH.length-1][3]]);
		this.xCofR = xy1[0];
		this.yCofR = xy1[0];
		this.rotationAngle = -getDir([xyH[0][0],xyH[0][1]],[xyH[0][2],xyH[0][3]]);
		ct.strokeStyle = "cyan";
		line(xy1,xy2);
		line(xy2,xy4);
		line(xy3,xy4);
		line(xy3,xy1);
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
		const cellCountX = Math.round(getDist(xy1,xy2)/this.cellLength);
		const cellCountY = Math.round(getDist(xy1,xy3)/this.cellLength);
		this.vAngle = getDir([xyV[0][0],xyV[0][1]],[xyV[0][2],xyV[0][3]])+this.rotationAngle-90;
		this.xScale = getDist(xy2,xy4)/getDist(xy1,xy3)/cellCountX;
		this.yScale = getDist(xy3,xy4)/getDist(xy1,xy2)/cellCountY;
		ct.fillStyle = "cyan";
		ct.font = "20px Arial";
		ct.fillText(cellCountX+","+cellCountY,this.xCofR,this.yCofR);
		return;
	}
}
console.log("Loaded: sudokuScanner.js");