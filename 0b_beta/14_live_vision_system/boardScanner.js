class VisionProgram_BoardReader{
	constructor(){
		this.filed = false;
	}
	temp(){
		const time = Date.now();
		const scnX = new IntersectionDetector(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,1);/*
		const scnA = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);
		const scnB = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);
		const scnC = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);
		const scnD = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);
		const scnE = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);
		const scnF = new LinearScanner(newWindow().centerWidthHeight(hcanvas.width/2,hcanvas.height/2,hcanvas.width*0.8,1).passdata, 0,0);*/
		//console.log(Date.now()-time);
	}
}
console.log("Loaded: boardScanner.js");