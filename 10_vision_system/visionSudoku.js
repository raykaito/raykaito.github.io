class VisionProgram_SudokuReader{
	constructor(){
		this.time = 60;
		this.interval;
	}
	abort(msg){
		clearInterval(this.interval);
		alert(msg);
	}
	startReading(phase=1, additionalInfo = false){
		if(phase==1){//look for Optimal Fuzzy Range;
			//variables;
			this.fuzzyRange = 0;
			this.minDpr=1;
			this.minDprFuzzyRange=0;
			this.imgData_1 = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6/canvasScale, hcanvas.height/6/canvasScale);//Math.max(10,hcanvas.height/80));
			
			this.interval = setInterval(()=>{sudokuV.findOptimalFuzzyRange();}, this.time);
		}
		if(phase==2){//Apply Fuzzy filter to new Window
			const imgData_2 = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/5, hcanvas.height/5);
			const binarizedImage = this.filterPreset_1(imgData_2, this.minDprFuzzyRange);
			binarizedImage.display(0);

			setTimeout(()=>{sudokuV.startReading(3, binarizedImage);}, this.time);
		}
		if(phase==3){//Scan for lines
			const lineScanner = new LineScanner(additionalInfo.passdata, true);
			const center_CellInnerLegLength = this.getCellInfo(lineScanner);

			if(center_CellInnerLegLength[0]==false){
				lineScanner.display(1);
				this.abort(center_CellInnerLegLength[1]);
				return;
			}

			this.xStartCellCenter = center_CellInnerLegLength[0][0];
			this.yStartCellCenter = center_CellInnerLegLength[0][1];
			this.cellInnerLength  = center_CellInnerLegLength[1];

			const x = this.xStartCellCenter;
			const y = this.yStartCellCenter;
			const l = this.cellInnerLength;
			const angle = rad2deg(Math.atan(lineScanner.angles[0]));

			circle(x/canvasScale, y/canvasScale, l/canvasScale/2);
			circle(x/canvasScale, y/canvasScale, l/canvasScale/2-1);
			circle(x/canvasScale, y/canvasScale, l/canvasScale/2-2);

			setTimeout(()=>{sudokuV.startReading(4, angle);}, this.time+500);
		}
		if(phase==4){
			this.rotateCanvas(this.xStartCellCenter, this.yStartCellCenter, additionalInfo);

			setTimeout(()=>{sudokuV.startReading(5);}, this.time);
		}
		if(phase==5){
			this.frame = new SudokuFrameInformation(this.xStartCellCenter, this.yStartCellCenter, this.cellInnerLength, this.minDprFuzzyRange);
		}
	}
	fillNextCellInfo(){
		this.frame.fillNextCellInfo(true);
	}
	filterPreset_1(imgData, fuzzyRange){
		//fuzzy_derivativeFilter_expandBlack
		const fuzzy = new Filter(imgData.passdata, fuzzyRange);
		const deriv = new derivativeFilter(fuzzy.passdata, true);
		const black = new Filter(deriv.passdata, 3);
		const binar = new Binarize(black.passdata, 254);
		return  binar;
	}
	filterPreset_2(imgData, rate){
		const binar = new Binarize(imgData.passdata);
		binar.updateThreshFromDarkPixelRatio(rate);
		binar.binarize();
		return binar;
	}
	findOptimalFuzzyRange(){
		const binarizedImage = this.filterPreset_1(this.imgData_1, this.fuzzyRange);
		const darkPixelRatio = binarizedImage.darkPixelRatio;
		const abort = (darkPixelRatio<0.5);

		binarizedImage.display(1);

		if(darkPixelRatio<this.minDpr){
			this.minDpr = darkPixelRatio;
			this.minDprFuzzyRange = this.fuzzyRange;
		}

		this.fuzzyRange++;
		
		if(abort||this.fuzzyRange>this.imgData_1._width/40*canvasScale){
			clearInterval(this.interval);
			setTimeout(()=>{sudokuV.startReading(2, binarizedImage.passdata);}, this.time);
			return;
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

		return [[x,y], (lineGaps[0]+lineGaps[1])/2];
	}
	rotateCanvas(x,y,t){
		//Small canvas
		ct.clearRect(0,0,canvas.width, canvas.height);
		ct.save();
		ct.translate(x/canvasScale,y/canvasScale);
		ct.rotate(deg2rad(t));
		ct.translate(-x/canvasScale,-y/canvasScale);
		ct.drawImage(img, 0,0,canvas.width, canvas.height);
		ct.restore();

		//Hidden canvas
		hct.clearRect(0,0,hcanvas.width, hcanvas.height);
		hct.save();
		hct.translate(x,y);
		hct.rotate(deg2rad(t));
		hct.translate(-x,-y);
		hct.drawImage(himg, 0,0,hcanvas.width, hcanvas.height);
		hct.restore();
	}
}

class SudokuFrameInformation{
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
		//This is the starting point
		this.cell[144] = {
			x: 			xStart,
			y: 			yStart,
			fuzzy: 		fuzzyIn,
			legLength: 	cellLegLength,
			scanned: 	true,
			cellFound: 	true
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
		const x = this.currentXY[0];
		const y = this.currentXY[1];
		const l = this.gapBtwnCells*1.5;

		let imgData, imgData_processed, scanner, cen_leg, fuzzyRange;
		for(fuzzyRange=-1;fuzzyRange<l/40*canvasScale;fuzzyRange++){
			imgData = newWindow().centerWidthHeight(x,y,l,l);
			//imgData_processed = sudokuV.filterPreset_1(imgData, ((fuzzyRange==-1)?this.initialFuzzy:fuzzyRange));
			imgData_processed = sudokuV.filterPreset_2(imgData, 0.13);
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
			ct.strokeStyle="lightGreen";
		}else{
			this.cellNotFound(x,y,l/1.8);
			ct.strokeStyle="Yellow";
		}
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-1);
		circle(this.currentXY[0]/canvasScale, this.currentXY[1]/canvasScale, this.cell[this.currentIndex].legLength/canvasScale/2-2);
		this.getNextTarget();
	}
	getNextTarget(){
		for(let x = this.xMin;x<=this.xMax;x++){
			for(let y=this.xMin;y<=this.yMax;y++){
				const i = this.xy2i([x,y]);
				if(this.cell[i].found&&!this.cell[i].noMoreNei){
					let cd = this.getFirstUnscannedCell(x,y);//Direction is from 0~7.
					if(cd === false) continue;
					let xy_cord = this.getXY_Cord(x,y);
					this.currentXY = [xy_cord[0]+dx[cd]*this.gapBtwnCells, xy_cord[1]+dy[cd]*this.gapBtwnCells];
					this.currentIndex = this.xy2i([x+dx[cd], y+dy[cd]]);
					setTimeout(()=>{sudokuV.fillNextCellInfo();}, 60);
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
	getXY_Cord(xIndex, yIndex){
		const i = this.xy2i([xIndex, yIndex]);
		return [this.cell[i].x, this.cell[i].y];
	}
}