class VisionProgram_SudokuReader{
	constructor(){
		this.time = 100;
		this.interval;
		this.afterRotation = false;
	}
	startReading(phase=1, additionalInfo = false){
		if(phase==1){//look for Optimal Fuzzy Range;
			//variables;
			if(additionalInfo) this.afterRotation = true;
			this.fuzzyRange = 0;
			this.minDpr=1;
			this.minDprFuzzyRange=0;
			this.imgData_1 = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, 10);//Math.max(10,hcanvas.height/80));
			
			this.interval = setInterval(()=>{sudokuV.findOptimalFuzzyRange();}, this.time);
		}
		if(phase==2){
			const imgData_2 = newWindow().cornerWidthHeight(0, 0, hcanvas.width, hcanvas.height);
			const fuzzyImage = new Filter(imgData_2.passdata, this.minDprFuzzyRange);
			fuzzyImage.display();

			setTimeout(()=>{sudokuV.startReading(3, fuzzyImage);}, this.time);
		}
		if(phase==3){
			if(this.afterRotation){
				stepper.saveOriginalImageData();
				stepper.startStepping();
			}else{
				stepper.saveOriginalImageData();
				stepper.startStepping();
			}
			return;
		}
	}
	filterPreset_1(imgData, fuzzyRange){
		//fuzzy_derivativeFilter_expandBlack
		const fuzzy = new Filter(imgData.passdata, fuzzyRange);
		const deriv = new derivativeFilter(fuzzy.passdata, true);
		const black = new Filter(deriv.passdata, 3);
		const binar = new Binarize(black.passdata, 254);
		black.display(1);
		return  binar;
	}
	findOptimalFuzzyRange(){
		const binarizedImage = this.filterPreset_1(this.imgData_1, this.fuzzyRange);
		const darkPixelRatio = binarizedImage.darkPixelRatio;

		if(darkPixelRatio<this.minDpr){
			this.minDpr = darkPixelRatio;
			this.minDprFuzzyRange = this.fuzzyRange;
		}

		this.fuzzyRange++;
		
		if(this.fuzzyRange>this.imgData_1._width/40){
			clearInterval(this.interval);
			setTimeout(()=>{sudokuV.startReading(2, binarizedImage.passdata);}, this.time);
			return;
		}
	}
}