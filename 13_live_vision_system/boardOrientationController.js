class BoardOrientationController{
	constructor(){
		//Board orientation info
		this.canvas = document.createElement("canvas");
		this.ct = this.canvas.getContext("2d");
		this.boardRead = false;
		this.dx;
		this.dy;
		this.xc;
		this.yc;
		this.vAngle;
		this.cellLength;
		this.cellLengthy;
		this.rotationAngle;
		this.xIndexMin;
		this.yIndexMin;
		//emptyCells
		this.emptyCells = new Array(81).fill(0);
		this.ECClimit = 5;//Empty cells counter upper limit
		//Time Keeping stuff
		this.timeIsUp = false;
		this.lastState = 0;
		//---------findNumbers----------//
		this.numbersListed = false;
		this.numbersFound = false;
		this.similarity;
	}
	startScan(br){
		//----------Init Section Start----------//
		this.lastTime = Date.now();
		this.timeIsUp = false;
		if(br.failed==false)	this.handleNewBoard(br);
		else 					rotateCanvas(this.xc, this.yc, this.rotationAngle);
		if(this.boardRead==false) return;
		//----------Display the Frame----------//
		ct.strokeStyle = "lightGreen";
		line(this.getXYfromIndex(-0.5,-0.5),this.getXYfromIndex( 8.5,-0.5),3);
		line(this.getXYfromIndex( 8.5,-0.5),this.getXYfromIndex( 8.5, 8.5),3);
		line(this.getXYfromIndex( 8.5, 8.5),this.getXYfromIndex(-0.5, 8.5),3);
		line(this.getXYfromIndex(-0.5, 8.5),this.getXYfromIndex(-0.5,-0.5),3);
		//----------List the Numbers----------//
		if(this.numbersListed==false) this.listNumbers();
	}
	listNumbers(){
		return;
		for(let i=0;i<81;i++){
			if(this.emptyCells[i]<0&&this.numbers[i]!=0){
				ct.fillStyle = "cyan";
				ct.font = "40px Arial";
				const xy = this.getXYfromIndex(i%9-0.2,Math.floor(i/9)+0.25);
				text(xy,this.numbers[i]);
			}
		}
	}
	handleNewBoard(br){
		//Check if empty cell info matches
		let matched = true;
		for(let i=0;i<81;i++){
			const newCell = br.emptyCells[i]?1:-1;
			if(this.emptyCells[i]*newCell<=0) matched = false;
			this.emptyCells[i] = keepInBound(this.emptyCells[i]+newCell,-this.ECClimit,this.ECClimit);
			if(this.emptyCells[i]==0) this.resetBoard();
		}
		if(matched==false) return;
		//Board info confirmed, and ready to update 
		this.boardRead = true;
		this.dx = br.dx;
		this.dy = br.dy;
		this.xc = br.xc;
		this.yc = br.yc;
		this.vAngle = br.vAngle;
		this.cellLength = br.cellLength;
		this.cellLengthy = br.cellLengthy
		this.rotationAngle = br.rotationAngle;
		this.xIndexMin = br.xIndexMin;
		this.yIndexMin = br.yIndexMin;
		this.canvas.width = hcanvas.width;
		this.canvas.height= hcanvas.height;
		this.ct.drawImage(hcanvas,0,0);
	}
	resetBoard(){
		this.boardRead = false;
		this.numbersListed = false;
		this.numbersShrunk = false;
	}
	getXYfromIndex(xin, yin){
		const xIndex = xin+this.xIndexMin;
		const yIndex = yin+this.yIndexMin;
		const partialx = (this.dx==1)?(1):((1/Math.log(this.dx)*(Math.pow(this.dx,xIndex)-1)));
		const partialy = (this.dy==1)?(1):((1/Math.log(this.dy)*(Math.pow(this.dy,yIndex)-1)));
		const x = (this.cellLength *partialx)*Math.pow(this.dy,yIndex)-getXYfromDirDis(this.vAngle,yIndex*this.cellLength)[1]+this.xc;
		const y = (this.cellLengthy*partialy)*Math.pow(this.dx,xIndex)+this.yc;
		return [x,y];
	}
	checkTime(msg){
		if((Date.now()-this.lastTime)>this.scanInterval){
			this.timeIsUp = true;
			//Save Everything
		}
	}
}
console.log("Loaded: numberScanner.js");