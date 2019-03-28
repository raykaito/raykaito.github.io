class VisionProgram_SudokuReader{
	constructor(){
		this.time = 250;
		this.interval;
	}
	startReading(phase=1, additionalInfo = false){
		//look for Optimal Fuzzy range;
		if(phase==1){
			//variables;
			this.fuzzyRange = 0;
			this.dprThreshhold = 0.25;

			const imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
			this.imgDataFuzzy = new Filter(imgData.passdata);
			this.interval = setInterval(()=>{sudokuV.findOptimalFuzzyRange();}, this.time);
		}
		//look for the starting point and angle
		if(phase==2){
			const imgData = new FindBlob(additionalInfo);
			imgData.display();
			setTimeout(()=>{sudokuV.startReading(3, imgData);}, this.time);
		}
		if(phase==3){
			additionalInfo.scanBlobs();
			additionalInfo.eraseSmallerBlobs();
			additionalInfo.display();
		}
		//Rotate the image
	}

	findOptimalFuzzyRange(){
		this.imgDataFuzzy.fuzzy(this.fuzzyRange);
		this.imgDataFuzzy.display();
		const imgDataDFilter = new derivativeFilter(this.imgDataFuzzy.passdata);
		const darkPixelRatio = imgDataDFilter.applyFilter();
		if(darkPixelRatio<this.dprThreshhold){
			clearInterval(this.interval);
			//imgDataDFilter.display();
			this.startReading(2, imgDataDFilter.passdata);
			return;
		}
		this.fuzzyRange++;
		if(this.fuzzyRange>20){
			alert("This program failed to find Optimal Filter Parameter.");
			clearInterval(this.interval);
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