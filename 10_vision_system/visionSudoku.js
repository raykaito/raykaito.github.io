class VisionProgram_SudokuReader{
	constructor(){
		this.time = 50;
		this.interval;
	}
	startReading(phase=1, additionalInfo = false){
		//look for Optimal Fuzzy range;
		if(phase==1){
			//variables;
			this.fuzzyRange = 0;
			this.dprThreshhold = 0.25;
			this.minDpr=1;
			this.minDprFuzzyRange=0;

			const imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
			this.imgDataFuzzy = new Filter(imgData.passdata);
			this.interval = setInterval(()=>{sudokuV.findOptimalFuzzyRange();}, this.time);
		}
		//look for the starting point and angle
		if(phase==2){
			const shrinkBlack_1 = new Filter(additionalInfo);
				  shrinkBlack_1.fuzzy(3);

			const shrinkBlack_2 = new Binarize(shrinkBlack_1.passdata);
				  shrinkBlack_2.thresh = 1;
				  shrinkBlack_2.binarize();
				  shrinkBlack_2.display(1);

			//setTimeout(()=>{sudokuV.startReading(3, imgData);}, this.time);
		}
		if(phase==3){
			additionalInfo.scanBlobs();
			additionalInfo.display(1);
		}
		//Rotate the image
	}
	ShrinkBlack(){
	}

	findOptimalFuzzyRange(){
		this.imgDataFuzzy.fuzzy(this.fuzzyRange);
		const imgDataDFilter = new derivativeFilter(this.imgDataFuzzy.passdata);
			  imgDataDFilter.applyFilter();
			  imgDataDFilter.display(1);

		const expandBlack_1 = new Filter(imgDataDFilter.passdata);
			  expandBlack_1.fuzzy(3);

		const expandBlack_2 = new Binarize(expandBlack_1.passdata);
			  expandBlack_2.thresh = 254;
			  expandBlack_2.binarize();

		const darkPixelRatio = expandBlack_2.darkPixelRatio;

		if(darkPixelRatio<this.dprThreshhold){
			clearInterval(this.interval);
			this.startReading(2, expandBlack_2.passdata);
			return;
		}

		if(darkPixelRatio<this.minDpr){
			this.minDpr = darkPixelRatio;
			this.minDprFuzzyRange = this.fuzzyRange;
		}

		this.fuzzyRange++;

		if(this.fuzzyRange>this.imgDataFuzzy._width/40){
			alert("This program failed to find Optimal Filter Parameter. But the program will continue to run..."+this.imgDataFuzzy._width);
			clearInterval(this.interval);
			this.imgDataFuzzy.fuzzy(this.minDprFuzzyRange);
			const imgDataDFilter = new derivativeFilter(this.imgDataFuzzy.passdata);
				  imgDataDFilter.applyFilter();
				  imgDataDFilter.display(1);

			const expandBlack_1 = new Filter(imgDataDFilter.passdata);
				  expandBlack_1.fuzzy(3);

			const expandBlack_2 = new Binarize(expandBlack_1.passdata);
				  expandBlack_2.thresh = 254;
				  expandBlack_2.binarize();

			this.startReading(2, expandBlack_2.passdata);
			return;
		}
	}
}
/*
function findStartingPointAndAngle(){
	const imageDataNew = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	const binarizedImageData = binarizeBoundary(imageDataNew.passdata);
	const scanLineImageData = new FindLine(binarizedImageData.passdata);
	return scanLineImageData.findIntersection();
}

function binarizeBoundary(imageData){
	const dprThreshhold = 0.25;
	const fuzzyImageData = new Filter(imageData);
	let darkPixelRatio = new Array()
	for(let fuzzyRange = 0;fuzzyRange<6;fuzzyRange++){
		fuzzyImageData.fuzzy(fuzzyRange);
		derivativeFilteredImageData = new derivativeFilter(fuzzyImageData.passdata);
		darkPixelRatio[fuzzyRange] = derivativeFilteredImageData.applyFilter();

		if(darkPixelRatio[fuzzyRange]<dprThreshhold){
			derivativeFilteredImageData.display();
			return derivativeFilteredImageData;
		}
	}
	alert("You need to take better picture.");
	return false;
}

function button1(){
	//let startX, startY, startAngle;
	//[startX, startY, startAngle]
	const variable = findStartingPointAndAngle();
	if(variable==false){
		console.log("The program failed to determine the Starting Point");
		return;
	}
	variable[2] = (variable[2]+405)%90-45;
	imageDataOriginal = newWindow().cornerToCorner(0,0,hcanvas.width, hcanvas.height);
	imageRotor = new RotatableImageData(imageDataOriginal.passdata);
	imageRotor.rotateImage(variable[2], [variable[0], variable[1]]);
	imageRotor.pasteRotatedImageData();
	imageRotor.display();
}
*/