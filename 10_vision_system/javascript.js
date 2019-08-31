let img, himg;
let sudokuV;

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

const imageLoaded = function() {
	resize(this.height/this.width);
	ct.drawImage(this, 0,0,canvas.width, canvas.height);
};

const himageLoaded = function() {
	resizeH(this.width, this.height);
	hct.drawImage(this,0,0,this.width,this.height);
	const start = Date.now();
	sudokuV.startScan();
	console.log(Math.floor((Date.now()-start)));
};

const imagesLoaded = function() {
};

const button1 = function(){
	const minLength = Math.min(hcanvas.width,hcanvas.height);
	const imageData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, minLength/2, minLength/2);
	lyzer = new IntersectionDetector(imageData.passdata);
};

const button2 = function(){
};

const button3 = function(){
};

const button4 = function(){
};

const changeParameter = function(){
	const s1 = Number(slider1.value);
	const s2 = Number(slider2.value);
	const s3 = Number(slider3.value);
	const s4 = Number(slider4.value);
	lyzer.setYposition(s1/100);
	lyzer.updateLineIntensity();
	lyzer.displayLineIntensity();
	lyzer.display(0);
};

console.log("Loaded: javascript.js");