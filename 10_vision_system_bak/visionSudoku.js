class VisionProgram_SudokuReader{
	constructor(){
	}
	abort(msg){
		alert(msg);
	}
	startReading(phase=1, additionalInfo = false){
		if(phase==1){//look for Optimal Fuzzy Range;
			const imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6/canvasScale, hcanvas.height/6/canvasScale);//Math.max(10,hcanvas.height/80));
			const func_2= (input)=>{this.startReading(2, input);}
			GetOptimalFuzzyRange(imgData, func_2, true);
		}
		if(phase==2){//Apply Fuzzy filter to new Window
			const imgData_2 = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/5, hcanvas.height/5);
			const binarizedImage = filterPreset_1(imgData_2, additionalInfo);
			binarizedImage.display(0);

			setTimeout(()=>{this.startReading(3, binarizedImage);}, 250);
		}
		if(phase==3){//Scan for lines
			const lineScanner = new LineScanner(additionalInfo.passdata, true);
			const cellInfo = this.getCellInfo(lineScanner);

			if(cellInfo[0]==false){
				lineScanner.display();
				this.abort(cellInfo[1]);
				return;
			}

			this.drawSquare(cellInfo);

			setTimeout(()=>{this.startReading(4, Math.atan(cellInfo[2]));}, 1500);
		}
		if(phase==4){
			this.rotateCanvas(this.xStartCellCenter, this.yStartCellCenter, additionalInfo);

			setTimeout(()=>{this.startReading(5);}, 250);
		}
		if(phase==5){
			this.frame = new SudokuCellInformation(this.xStartCellCenter, this.yStartCellCenter, this.cellInnerLength, this.minDprFuzzyRange);
		}
	}
	getCellInfo(lineScanner){//0 for X and 1 for Y
		const intersects = lineScanner.intersects;
		const angles = lineScanner.angles;
		let intersectMids = [];
		let lineGaps = []
		for(let phase=0;phase<2;phase++){
			//phase 0 for X and phase 1 for Ylet cellLengthMax = 0;
			let cellLengthMax = 0;
			let maxIndex = 0;
			for(let i=2;i<intersects[phase].length;i+=2){
				const cellLength = intersects[phase][i]-intersects[phase][i-1];
				if(cellLength>cellLengthMax){
					cellLengthMax = cellLength;
					maxIndex = i;
				}
			}
			if(maxIndex==0){
				return [false, ("No cells found. MaxIndex for "+phase?"Y":"X"+" is 0.")];
			}
			lineGaps[phase] = cellLengthMax;
			intersectMids[phase] = (intersects[phase][maxIndex]+intersects[phase][maxIndex-1])/2;
			
		}
		const legRatioError = (Math.abs(lineGaps[0]-lineGaps[1])/(lineGaps[0]+lineGaps[1]));
		if(legRatioError>0.05){
			return [false, ("Cell Leg Ratio Error is T00 high. ("+Math.floor(10000*legRatioError)/100+"%)")];
		}

		const x = (intersectMids[0]+(angles[0]*intersectMids[1]))/(1-angles[0]*angles[1]);
		const y = (intersectMids[1]+x*angles[1]);

		return [[x,y], (lineGaps[0]+lineGaps[1])/2, angles[0]];
	}
	drawSquare(cellInfo){
		this.xStartCellCenter = cellInfo[0][0];
		this.yStartCellCenter = cellInfo[0][1];
		this.cellInnerLength  = cellInfo[1];

		const x = this.xStartCellCenter/canvasScale;
		const y = this.yStartCellCenter/canvasScale;
		const l = this.cellInnerLength/canvasScale;
		const angle = -Math.atan(cellInfo[2]);

		ct.save();
		ct.transform(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), x, y);
		ct.strokeStyle = "rgb(255,0,0)";
		ct.lineWidth = 5;
		ct.beginPath();
		ct.rect(-l/2,-l/2,l,l);
		ct.stroke();
		ct.restore();
	}
	rotateCanvas(x,y,t){
		//Small canvas
		ct.clearRect(0,0,canvas.width, canvas.height);
		ct.save();
		ct.translate(x/canvasScale,y/canvasScale);
		ct.rotate(t);
		ct.translate(-x/canvasScale,-y/canvasScale);
		ct.drawImage(img, 0,0,canvas.width, canvas.height);
		ct.restore();

		//Hidden canvas
		hct.clearRect(0,0,hcanvas.width, hcanvas.height);
		hct.save();
		hct.translate(x,y);
		hct.rotate(t);
		hct.translate(-x,-y);
		hct.drawImage(himg, 0,0,hcanvas.width, hcanvas.height);
		hct.restore();
	}
}

class SudokuCellInformation{
	constructor(xStart, yStart, cellLegLength, fuzzyIn){
		this.gapBtwnCells = cellLegLength*1.1;
		this.initialFuzzy = fuzzyIn;
		this.cell = new Array(289);
		for(let i=0;i<289;i++){
			this.cell[i] = {
				x: 			0,
				y: 			0,
				fuzzy: 		0,
				legLength: 	0,
				scanned: 	false,
				cellFound: 	false,
				noMoreNei: 	false
			}
		}
		this.xMax = this.xMin = this.yMax = this.yMin = 8;

		this.currentDirection = 0;
		this.currentIndex = 144;
		this.currentXY = [xStart, yStart];

		this.vFree = true;
		this.hFree = true;

		this.fillNextCellInfo(true);
	}
	i2xy(indexIn){	return [indexIn%17,Math.floor(indexIn/17)];}
	xy2i(xy)	 {	return xy[0]+xy[1]*17;}
	fillCellInfo_1(){
		const x = this.currentXY[0];
		const y = this.currentXY[1];
		const l = this.gapBtwnCells*2;

		let imgData, imgData_processed, scanner, cen_leg, fuzzyRange;

		imgData = newWindow().centerWidthHeight(x,y, hcanvas.width/6/canvasScale, hcanvas.height/6/canvasScale);
		const func_2= (input)=>{this.fillCellInfo_2(input);}
		GetOptimalFuzzyRange(imgData, func_2);
	}
	fillCellInfo_2(fuzzyRange){
		const x = this.currentXY[0];
		const y = this.currentXY[1];
		const l = this.gapBtwnCells*1.5;

		let imgData, imgData_processed, scanner, cen_leg;

		imgData = newWindow().centerWidthHeight(x,y,l,l);
		imgData_processed = filterPreset_1(imgData, fuzzyRange, 2);
		//imgData_processed = sudokuV.filterPreset_2(imgData, 0.17, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange));
			scanner = new LineScanner(imgData_processed.passdata);
			scanner.bandWidthAngle = 1.5;
			scanner.InBandrate = 0.5;
			scanner.scanHorizontal();
			scanner.scanVertical();

		cen_leg = sudokuV.getCellInfo(scanner);

		if(cen_leg[0]!=false){
			this.cellFound(cen_leg, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange));
			ct.strokeStyle="rgb(0,255,0)";
		}else{
			this.cellNotFound(x,y,l/1.8);
			scanner.display();
			ct.strokeStyle="rgb(255,0,0)";
		}
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-1);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-2);
		this.getNextTarget();
	}
	updateMinMax(){
		const xy = this.i2xy(this.currentIndex);
		this.xMax = Math.max(this.xMax, xy[0]);
		this.xMin = Math.min(this.xMin, xy[0]);
		this.yMax = Math.max(this.yMax, xy[1]);
		this.yMin = Math.min(this.yMin, xy[1]);

		if(this.xMax-this.xMin==8) this.hFree = false;
		if(this.yMax-this.yMin==8) this.vFree = false;
	}
	cellFound(cen_leg, fuzzyIn){
		this.cell[this.currentIndex].scanned = true;
		this.cell[this.currentIndex].found = true;
		this.cell[this.currentIndex].fuzzy = fuzzyIn;
		this.cell[this.currentIndex].x = cen_leg[0][0];
		this.cell[this.currentIndex].y = cen_leg[0][1];
		this.cell[this.currentIndex].legLength = cen_leg[1];
		this.currentXY = cen_leg[0];
		this.updateMinMax();
	}
	cellNotFound(x,y,leg){
		this.cell[this.currentIndex].scanned = true;
		this.cell[this.currentIndex].found = false;
		this.cell[this.currentIndex].x = x;
		this.cell[this.currentIndex].y = y;
		this.cell[this.currentIndex].legLength = leg;
	}
	fillNextCellInfo(quick = false){
		this.fillCellInfo_1();
		return;
		const x = this.currentXY[0];
		const y = this.currentXY[1];
		const l = this.gapBtwnCells*1.5;

		let imgData, imgData_processed, scanner, cen_leg, fuzzyRange;
		for(fuzzyRange=-1;fuzzyRange<l/40*canvasScale;fuzzyRange++){
			imgData = newWindow().centerWidthHeight(x,y,l,l);
			imgData_processed = filterPreset_1(imgData, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange),2);
			//imgData_processed = sudokuV.filterPreset_2(imgData, 0.17, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange));
			scanner = new LineScanner(imgData_processed.passdata);
			scanner.bandWidthAngle = 1;
			scanner.InBandrate = 0.7;
			scanner.scanHorizontal();
			scanner.scanVertical();
			cen_leg = sudokuV.getCellInfo(scanner);
			//scanner.display(1);
			if(quick||cen_leg[0]!=false) break;
		}
		if(cen_leg[0]!=false){
			this.cellFound(cen_leg, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange));
			ct.strokeStyle="rgb(0,255,0)";
		}else{
			this.cellNotFound(x,y,l/1.8);
			//scanner.display(1);
			ct.strokeStyle="rgb(255,0,0)";
		}
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-1);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-2);
		this.getNextTarget();
	}
	getNextTarget(){
		const width  = this.xMax-this.xMin;
		const height = this.yMax-this.yMin;
		const jumpDist = Math.max(1,Math.floor((9-Math.min(width,height))/2));
		if(width<=height){
			//Jump sideways
			//check negative direction
			let x=this.xMin;
			let y, i;
			for(y=this.yMin;y<=this.yMax;y++){
				i=this.xy2i([x,y]);
				if(this.cell[i].found){
					break;
				}
			}
			let target = this.xy2i([x-jumpDist,y]);
			if(this.cell[target].scanned==false){
				let xy_cord = this.getXY_Cord(i);
				this.currentXY = [xy_cord[0]-jumpDist*this.gapBtwnCells, xy_cord[1]];
				this.currentIndex = this.xy2i([x-jumpDist, y]);
				setTimeout(()=>{this.fillNextCellInfo(true);}, 100);
				console.log("1xy is "+this.i2xy(target)+","+target);
				return;
			}

			//Now Try Positive Direction
			x=this.xMax;
			for(y=this.yMax;y>=this.yMin;y--){
				i=this.xy2i([x,y]);
				if(this.cell[i].found){
					break;
				}
			}
			target = this.xy2i([x+jumpDist,y]);
			if(this.cell[target].scanned==false){
				let xy_cord = this.getXY_Cord(i);
				this.currentXY = [xy_cord[0]+jumpDist*this.gapBtwnCells, xy_cord[1]];
				this.currentIndex = this.xy2i([x+jumpDist, y]);
				setTimeout(()=>{this.fillNextCellInfo(true);}, 100);
				console.log("2xy is "+this.i2xy(target));
				return;
			}
			alert("1Its time to improve the filters");
			return;
		}else{
			//Jump vertically
			//check negative direction
			let y=this.yMin;
			let x, i;
			for(x=this.xMin;x<=this.xMax;x++){
				i=this.xy2i([x,y]);
				if(this.cell[i].found){
					break;
				}
			}
			let target = this.xy2i([x,y-jumpDist]);
			if(this.cell[target].scanned==false){
				let xy_cord = this.getXY_Cord(i);
				this.currentXY = [xy_cord[0], xy_cord[1]-jumpDist*this.gapBtwnCells];
				this.currentIndex = this.xy2i([x, y-jumpDist]);
				setTimeout(()=>{this.fillNextCellInfo(true);}, 100);
				console.log("3xy is "+this.i2xy(target));
				return;
			}

			//Now Try Positive Direction
			y=this.yMax;
			for(x=this.xMax;x>=this.xMin;x--){
				i=this.xy2i([x,y]);
				if(this.cell[i].found){
					break;
				}
			}
			target = this.xy2i([x,y+jumpDist]);
			if(this.cell[target].scanned==false){
				let xy_cord = this.getXY_Cord(i);
				this.currentXY = [xy_cord[0], xy_cord[1]+jumpDist*this.gapBtwnCells];
				this.currentIndex = this.xy2i([x, y+jumpDist]);
				setTimeout(()=>{this.fillNextCellInfo(true);}, 100);
				console.log("4xy is "+this.i2xy(target));
				return;
			}
			alert("2Its time to improve the filters"+this.i2xy(target));
			return;
		}
	}
	getNextTarget_old(){
		for(let x = this.xMin;x<=this.xMax;x++){
			for(let y=this.yMin;y<=this.yMax;y++){
				const i = this.xy2i([x,y]);
				if(this.cell[i].found&&!this.cell[i].noMoreNei){
					let cd = this.getFirstUnscannedCell(x,y);//Direction is from 0~7.
					if(cd === false) continue;
					let xy_cord = this.getXY_Cord([x,y]);
					this.currentXY = [xy_cord[0]+dx[cd]*this.gapBtwnCells, xy_cord[1]+dy[cd]*this.gapBtwnCells];
					this.currentIndex = this.xy2i([x+dx[cd], y+dy[cd]]);
					setTimeout(()=>{this.fillNextCellInfo(true);}, 60);
					return;
				}
			}
		}
	}
	//for each cell, make another boolean to indicate that no neibors are free
	getFirstUnscannedCell(xIndex, yIndex){
		for(let cd=0;cd<8;cd++){
			let newX = xIndex+dx[cd];
			if(!this.hFree&&(newX<this.xMin||newX>this.xMax)) continue;
			let newY = yIndex+dy[cd];
			if(!this.vFree&&(newY<this.yMin||newY>this.yMax)) continue;
			let i = this.xy2i([newX, newY]);
			if(this.cell[i].scanned==false){
				return cd;
			}
		}
		this.cell[this.xy2i([xIndex,yIndex])].noMoreNei = true;
		console.log(xIndex,yIndex);
		return false;
	}
	getXY_Cord(xy){
		let i;
		if(xy.length==2){
			i = this.xy2i([xIndex, yIndex]);
		}else{
			i = xy;
		}
		return [this.cell[i].x, this.cell[i].y];
	}
}