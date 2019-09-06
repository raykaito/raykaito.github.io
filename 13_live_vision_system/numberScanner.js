class VisionProgram_numberReader{
	constructor(){
		//Canvas Info
		this.canvas = document.createElement("canvas");
		this.ct = this.canvas.getContext("2d");
		//emptyCells
		this.emptyCells = new Array(81).fill(0);
		this.ECClimit = 5;//Empty cells counter upper limit
		//Board orientation info
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
		//Numbers info
		this.numbersRead = false;
		this.numbers = new Array(81).fill(0);
		this.numberCounter = 0;
		this.ncanvas = document.createElement("canvas");
		this.nct = this.ncanvas.getContext("2d");
		this.ncanvas.width = 32;
		this.ncanvas.height= 32;
		this.fontsListNot = ["32px Times New Roman"];
		this.fontsList = ["32px Arial ",
						  "32px Trebuchet MS",
						  "32px Arial Black",
						  "32px Impact",
						  "32px Courier",
						  "32px Times New Roman",
						  "32px Verdana",
						  "32px Comic Sans MS"];
		//Time info
		this.scanInterval = 500;
		this.lastTime = Date.now();
	}
	temp(){
		mct.font = this.fontsList[0];
		const textWidth = Math.ceil(mct.measureText(1).width);
		mct.fillStyle = "white";
		mct.fillRect(1,1,textWidth,32);
		mct.fillStyle = "black";
		mct.fillText(1,1,33);
		const imgData = mct.getImageData(0,0,textWidth,32);
		const binarizedImg = new Binarize([imgData,0,0]);
		displayArray(binarizedImg.histo,2);
		binarizedImg.display();

	}
	startScan(br){
		//this.temp();
		//return;
		if(br.failed==false){
			this.handleNewBoard(br);
		}else{
			rotateCanvas(this.xc, this.yc, this.rotationAngle);			
		}
		if(this.boardRead==false) return;
		for(let i=0;i<81;i++){
			if((Date.now()-this.lastTime)>this.scanInterval){
				this.abort("Time is Up");
				this.lastTime = Date.now();
				return false;
			}
			if(this.emptyCells[i]<0){
				if(this.numberCounter>=90) continue;
				this.read(i%9,Math.floor(i/9));
				
				ct.fillStyle = "cyan";
				ct.font = "40px Arial";
				const xy = this.getXYfromIndex(i%9,Math.floor(i/9));
				text(xy,this.numbers[i]);
				
			}
		}
	}
	read(xi, yi){
		if(this.numbers[xi+yi*9]!=0) return;
		const xy1 = this.getXYfromIndex(xi-0.4,yi-0.4);
		const xy2 = this.getXYfromIndex(xi+0.4,yi+0.4);
		const img = newWindow().cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
		const binarizedImg = new Binarize(img.passdata);
		const blobFinder = new FindBlob(binarizedImg.passdata,1);
		blobFinder.eraseSmallerBlobs();
		blobFinder.display();
		const image = blobFinder.blob;
		const imgBN = img.updateDisplayImage();
		mct.drawImage(image,0, this.numberCounter*17,16,16);
		mct.drawImage(imgBN,17, this.numberCounter*17,16,16);
		//Compare with "examples"
		let error = 100;
		let candidate = 0;
		let font  = 0;
		for(let i=1;i<=9;i++){
			let errorLocal = 100;
			let candidateLocal = 0;
			let fontLocal = 0;
			for(let j=0;j<this.fontsList.length;j++){
				const newError = this.tryNumber(i,mct.getImageData(0, this.numberCounter*17,16,16),this.fontsList[j]);
				if(newError<error){
					error = newError;
					candidate = i;
					font = j;
				}
				if(newError<errorLocal){
					errorLocal = newError;
					candidateLocal = i;
					fontLocal = j;
				}
				this.tryNumber(candidateLocal,mct.getImageData(0, this.numberCounter*17,16,16),this.fontsList[fontLocal],1);
			}
		}
		this.tryNumber(candidate,mct.getImageData(0, this.numberCounter*17,16,16),this.fontsList[font],2);
		this.numbers[xi+yi*9] = candidate;
		this.numberCounter++;
	}
	tryNumber(num, imgDataIn, font,draw = 0){
		if(draw==2) mct.fillStyle = "black";
		if(draw==2) mct.fillStyle = "black";
		if(draw==1) mct.fillStyle = "cyan";
		if(draw==0) mct.fillStyle = "cyan";
		mct.fillRect(num*40,this.numberCounter*17,39,16);
		//Prepare Example Image
		const textWidth = Math.ceil(this.nct.measureText(num).width*1.1);
		this.nct.fillStyle = "white";
		this.nct.fillRect(0,0,textWidth,32);
		this.nct.fillStyle = "black";
		this.nct.font = font;
		this.nct.fillText(num,0,32);
		//blobFinder the ex Image
		const imgData = this.nct.getImageData(0,0,textWidth,32);
		const binarizedImg = new Binarize([imgData,0,0],220);
		const blobFinder = new FindBlob(binarizedImg.passdata,1);
		blobFinder.eraseSmallerBlobs();
		const imgIx = blobFinder.blob;
		//Paste Image on the Monitor canvas
		mct.drawImage(imgIx,num*40,this.numberCounter*17,16,16);
		const imgDataIx = mct.getImageData(num*40,this.numberCounter*17,16,16);
		
		//Count Error
		let error = 0;
		for(let i=0;i<256;i++){
			error += (imgDataIn.data[4*i+1]!=imgDataIx.data[4*i+1]);
		}
		error = error*100/256;
		mct.fillStyle = "white";
		mct.font = "bold 16px Arial";
		mct.fillText(Math.floor(error),num*40+16,this.numberCounter*17+16);
		return error;
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
		this.numbersRead = false;
		this.numberCounter = 0;
		for(let i=0;i<81;i++) this.numbers[i] = 0;
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
	init(){
	}
	abort(msg){
	}
}
console.log("Loaded: numberScanner.js");