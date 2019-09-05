class VisionProgram_numberReader{
	constructor(){
		//Canvas Info
		this.canvas = document.createElement("canvas");
		this.ct = this.canvas.getContext("2d");
		//emptyCells
		this.emptyCells = new Array(64).fill(0);
		this.ECClimit = 5;//Empty cells counter upper limit
		this.ECmismatchCounter=10;
		this.ECMMlimit=10;//Empty Cells mismatch counter limit;
		//Board orientation info
		this.dx;
		this.dy;
		this.xc;
		this.yc;
		this.vAngle;
		this.cellLength;
		this.cellLengthy;
		this.rotationAngle;
	}
	startScan(br){
		if(br.failed==false){
			this.handleNewBoard(br);
		}
		rotateCanvas(this.xc, this.yc, this.rotationAngle);
		ct.fillStyle = "cyan";
		ct.font = "40px Arial";
		const number1 = this.ECmismatchCounter;
		ct.fillText(Math.round((number1)*100)/100,10/canvasScale,30/canvasScale);
		console.log(number1);
		console.log(this.emptyCells);
	}
	handleNewBoard(br){
		//Check if empty cell info matches
		let matched = true;
		for(let i=0;i<64;i++){
			const newCell = br.emptyCells[i]?1:-1;
			if(this.emptyCells[i]*newCell<=0) matched = false;
			this.emptyCells[i] = keepInBound(this.emptyCells[i]+newCell,-this.ECClimit,this.ECClimit);
		}
		if(matched==false){
			if(this.ECmismatchCounter<this.ECMMlimit)	this.ECmismatchCounter++;
			return;
		}
		this.ECmismatchCounter = 0;
		//Now the board is confirmed to be true;
		this.dx = br.dx;
		this.dy = br.dy;
		this.xc = br.xc;
		this.yc = br.yc;
		this.vAngle = br.vAngle;
		this.cellLength = br.cellLength;
		this.cellLengthy = br.cellLengthy
		this.rotationAngle = br.rotationAngle;
		this.canvas.width = hcanvas.width;
		this.canvas.height= hcanvas.height;
		this.ct.drawImage(hcanvas,0,0);
	}	
	getXYfromIndex(xIndex, yIndex){
		const partialx = (this.dx==1)?(1):((1/Math.log(this.dx)*(Math.pow(this.dx,xIndex)-1)));
		const partialy = (this.dy==1)?(1):((1/Math.log(this.dy)*(Math.pow(this.dy,yIndex)-1)));
		const x = (this.cellLength *partialx)*Math.pow(this.dy,yIndex)-getXYfromDirDis(this.vAngle,yIndex*this.cellLength)[1]+this.xc;
		const y = (this.cellLengthy*partialy)*Math.pow(this.dx,xIndex)+this.yc;
		return [x,y];
	}
	init(){
	}
	abort(msg){
	}
}
console.log("Loaded: numberScanner.js");