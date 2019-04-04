var img, himg;

function initJS(){
	sudokuV = new VisionProgram_SudokuReader();
	ex = [1,1,0,-1,-1,-1, 0, 1];
	ey = [0,1,1, 1, 0,-1,-1,-1];
}

document.getElementById('inp').onchange = function(e) {
	 ctResized = false;
	hctResized = false;
   img = new Image();
  himg = new Image();
   img.onload =  imageLoaded;
  himg.onload = himageLoaded;
   img.src = URL.createObjectURL(this.files[0]);
  himg.src = URL.createObjectURL(this.files[0]);
};

function imageLoaded() {
	resize(this.height/this.width);
	ct.drawImage(this, 0,0,canvas.width, canvas.height);
}

function himageLoaded() {
	resizeH(this.width, this.height);
	hct.drawImage(this,0,0,this.width,this.height);
}

function findStartingPointAndAngle(){
	const imageDataNew = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	const binarizedImageData = binarizeBoundary(imageDataNew.passdata);
	const scanLineImageData = new FindLine(binarizedImageData.passdata);
	return scanLineImageData.findIntersection(10);
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
	sudokuV.startReading(1);
	return;
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

function button2(){
	const imageData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	df = new doubleFuzzySubtraction(imageData.passdata, [80,6]);
	df.display(1);
}

function button3(){
	const imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	binar = new Binarize(imgData.passdata);
}

function button4(){
	sudokuV.fillNextCellInfo(true);
}

function changeParameter1(){
	binar.thresh = Number(slider1.value);
	binar.binarize();
	const blob = new FindBlob(binar.passdata, true);
	blob.display(1);
}

function changeParameter2(){
	binar.updateThreshFromDarkPixelRatio(Number(slider2.value)/100);
	binar.binarize();
	binar.display(1);
	binar.displayHistogram();
}

function changeParameter3(){
	df.allowedDerivative = Number(slider3.value);
	df.display();
}

function imagesLoaded(){
}

function GetOptimalFuzzyRange(imgData, funcAfter, show=false){
	this.imgData_1 = imgData;
	this.fuzzyRange = 0;
	this.minDpr=1;
	this.minDprFuzzyRange=0;
	findOptimalFuzzyRange=()=>{
		const binarizedImage = filterPreset_1(this.imgData_1, this.fuzzyRange);
		const darkPixelRatio = binarizedImage.darkPixelRatio;
		const abort = (darkPixelRatio<0.5);

		if(show) binarizedImage.display(1);

		if(darkPixelRatio<this.minDpr){
			this.minDpr = darkPixelRatio;
			this.minDprFuzzyRange = this.fuzzyRange;
		}

		this.fuzzyRange++;
		
		if(abort||this.fuzzyRange>this.imgData_1._width/40*canvasScale){
			return this.minDprFuzzyRange;
		}
		return "continue";
	}
	const func_1= ()=>{return findOptimalFuzzyRange();}
	const rep = new Repeater(func_1, (result)=>{funcAfter(result);} , 120);
}

const filterPreset_1=(imgData, fuzzyRange, anotherFuzzyRange = 3)=>{
	//fuzzy_derivativeFilter_expandBlack
	const fuzzy = new Filter(imgData.passdata, fuzzyRange);
	const deriv = new derivativeFilter(fuzzy.passdata, true);
	const black = new Filter(deriv.passdata, anotherFuzzyRange);
	const binar = new Binarize(black.passdata, 254);
	return  binar;
}
const filterPreset_2=(imgData, rate, fuzzyRange)=>{
	const fuzzy = new Filter(imgData.passdata, fuzzyRange);
	const binar = new Binarize(fuzzy.passdata);
	binar.updateThreshFromDarkPixelRatio(rate);
	binar.binarize();
	return binar;
}

console.log("Loaded: javascript.js");