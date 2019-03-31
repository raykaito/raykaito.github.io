class VisionProgram_SudokuReader{
	constructor(){
		this.time = 100;
		this.interval;
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
			const lineScanner = new LineScanner(additionalInfo.passdata);
			lineScanner.scanHorizontal();
			lineScanner.scanVertical();
			lineScanner.display(0);
			const center_CellInnerLegLength = this.getCellInfo(lineScanner);
			if(center_CellInnerLegLength==false){
				lineScanner.display(1);
				return;
			}
			const x = center_CellInnerLegLength[0][0];
			const y = center_CellInnerLegLength[0][1];
			const l = center_CellInnerLegLength[1];
			circle(x/canvasScale, y/canvasScale, l/canvasScale/2);
		}
	}
	filterPreset_1(imgData, fuzzyRange){
		//fuzzy_derivativeFilter_expandBlack
		const fuzzy = new Filter(imgData.passdata, fuzzyRange);
		const deriv = new derivativeFilter(fuzzy.passdata, true);
		const black = new Filter(deriv.passdata, 3);
		const binar = new Binarize(black.passdata, 254);
		return  binar;
	}
	findOptimalFuzzyRange(){
		const binarizedImage = this.filterPreset_1(this.imgData_1, this.fuzzyRange);
		const darkPixelRatio = binarizedImage.darkPixelRatio;

		binarizedImage.display(1);

		if(darkPixelRatio<this.minDpr){
			this.minDpr = darkPixelRatio;
			this.minDprFuzzyRange = this.fuzzyRange;
		}

		this.fuzzyRange++;
		
		if(this.fuzzyRange>this.imgData_1._width/40*canvasScale){
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
				console.log("No cells found. maxIndex for X is 0");
				return false;
			}
			lineGaps[phase] = cellLengthMax;
			intersectMids[phase] = (intersects[phase][maxIndex]+intersects[phase][maxIndex-1])/2;
			
		}

		const x = (intersectMids[0]+(angles[0]*intersectMids[1]))/(1-angles[0]*angles[1]);
		const y = (intersectMids[1]+x*angles[1]);

		return [[x,y], (lineGaps[0]+lineGaps[1])/2];
	}
}