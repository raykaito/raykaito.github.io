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
		this.fontsListNot = ["32px Arial","32px Courier"];
		this.fontsList = ["32px Arial",
						  "32px Trebuchet MS",
						  "32px Arial Black",
						  "32px Impact",
						  "32px Courier",
						  "32px Times New Roman",
						  "32px Verdana",
						  "32px Comic Sans MS"];
		//Time info // SavePoint
		this.timeIsUp = false;
		this.scanInterval = 50;
		this.lastTime;
		this.lastCell = 0;//Which cell was it reading?
		this.lastNumber = 1; //Which example number was it compared with?
		this.lastFont = 0; //Which font was being used?
		this.errorRecord = 100;
		this.candidateRecord = 0;
		this.fontRecord = 0;
	}
	temp(){
		for(let j=0;j<this.fontsList.length;j++){
			for(let i=1;i<=10;i++){
				mct.font = this.fontsList[j];
				mct.fillStyle = "white";
				if(i!=10)mct.fillRect(i*34-34,j*34,32,32);
				else mct.fillRect(i*34-34,j*34,mct.measureText(this.fontsList[j]).width,32);
				mct.fillStyle = "black";
				if(i!=10)mct.fillText(i,i*34-34,(j+1)*34);
				else mct.fillText(this.fontsList[j],i*34-34,(j+1)*34);
			}
		}

	}
	startScan(br){
		//----------Init Section Start----------//
		this.lastTime = Date.now();
		this.timeIsUp = false;
		if(br.failed==false)	this.handleNewBoard(br);
		else 					rotateCanvas(this.xc, this.yc, this.rotationAngle);
		if(this.boardRead==false) return;
		//----------Display Known Numbers----------//
		ct.strokeStyle = "lightGreen";
		line(this.getXYfromIndex(-0.5,-0.5),this.getXYfromIndex( 8.5,-0.5),3);
		line(this.getXYfromIndex( 8.5,-0.5),this.getXYfromIndex( 8.5, 8.5),3);
		line(this.getXYfromIndex( 8.5, 8.5),this.getXYfromIndex(-0.5, 8.5),3);
		line(this.getXYfromIndex(-0.5, 8.5),this.getXYfromIndex(-0.5,-0.5),3);
		for(let i=0;i<81;i++){
			if(this.emptyCells[i]<0&&this.numbers[i]!=0){
				ct.fillStyle = "cyan";
				ct.font = "40px Arial";
				const xy = this.getXYfromIndex(i%9-0.2,Math.floor(i/9)+0.25);
				text(xy,this.numbers[i]);
			}
		}
		//----------Read the 9 candidates----------//
		for(let i=this.lastCell;i<81;i++){
			if(this.emptyCells[i]<0){
				this.lastCell = i;
				this.read(i%9,Math.floor(i/9));
			}
			this.checkTime();
			if(this.timeIsUp) return;
		}
	}
	read(xi, yi){
		if(this.numbers[xi+yi*9]!=0) return;
		const xy1 = this.getXYfromIndex(xi-0.4,yi-0.4);
		const xy2 = this.getXYfromIndex(xi+0.4,yi+0.4);
		const img = newWindow(this.ct).cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
		const binarizedImg = new Binarize(img.passdata);
		const blobFinder = new FindBlob(binarizedImg.passdata,1);
		blobFinder.eraseSmallerBlobs();
		blobFinder.display();
		const image = blobFinder.blob;
		const imgBN = img.updateDisplayImage();
		mct.drawImage(image,0, this.numberCounter*17,16,16);
		mct.drawImage(imgBN,17, this.numberCounter*17,16,16);
		//Compare with "examples"
		let error = this.errorRecord;
		let candidate = this.candidateRecord;
		let font  = this.fontRecord;
		for(let i=this.lastNumber;i<=9;i++){
			let errorLocal = 100;
			let candidateLocal = 0;
			let fontLocal = 0;
			for(let j=this.lastFont;j<this.fontsList.length;j++){
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
				if(j!=this.fontsList.length-1) this.checkTime();
				else this.lastFont = 0;
				if(this.timeIsUp) this.saveEverything(error,candidate,font,i,j+1);
				if(this.timeIsUp) return;
			}
		}
		this.tryNumber(candidate,mct.getImageData(0, this.numberCounter*17,16,16),this.fontsList[font],2);
		this.numbers[xi+yi*9] = candidate;
		this.numberCounter++;
		this.errorRecord = 100;
		this.candidateRecord = 0;
		this.fontRecord = 0;
		this.lastFont = 0;
		this.lastNumber = 1;
	}
	read_bak(xi, yi){
		if(this.numbers[xi+yi*9]!=0) return;
		const xy1 = this.getXYfromIndex(xi-0.4,yi-0.4);
		const xy2 = this.getXYfromIndex(xi+0.4,yi+0.4);
		const img = newWindow(this.ct).cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
		const binarizedImg = new Binarize(img.passdata);
		const blobFinder = new FindBlob(binarizedImg.passdata,1);
		blobFinder.eraseSmallerBlobs();
		blobFinder.display();
		const image = blobFinder.blob;
		const imgBN = img.updateDisplayImage();
		mct.drawImage(image,0, this.numberCounter*17,16,16);
		mct.drawImage(imgBN,17, this.numberCounter*17,16,16);
		//Compare with "examples"
		let error = this.errorRecord;
		let candidate = this.candidateRecord;
		let font  = this.fontRecord;
		for(let i=this.lastNumber;i<=9;i++){
			let errorLocal = 100;
			let candidateLocal = 0;
			let fontLocal = 0;
			for(let j=this.lastFont;j<this.fontsList.length;j++){
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
				if(j!=this.fontsList.length-1) this.checkTime();
				else this.lastFont = 0;
				if(this.timeIsUp) this.saveEverything(error,candidate,font,i,j+1);
				if(this.timeIsUp) return;
			}
		}
		this.tryNumber(candidate,mct.getImageData(0, this.numberCounter*17,16,16),this.fontsList[font],2);
		this.numbers[xi+yi*9] = candidate;
		this.numberCounter++;
		this.errorRecord = 100;
		this.candidateRecord = 0;
		this.fontRecord = 0;
		this.lastFont = 0;
		this.lastNumber = 1;
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
		this.lastCell = 0;
		this.errorRecord = 100;
		this.candidateRecord = 0;
		this.fontRecord = 0;
		this.lastNumber = 1;
		this.lastFont = 0;
		mct.fillStyle = "black";
		mct.fillRect(0,0,mcanvas.width,mcanvas.height);
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
	saveEverything(error, candidate, font, i, j){
		this.errorRecord = error;
		this.candidateRecord = candidate;
		this.fontRecord = font;
		this.lastNumber = i;
		this.lastFont = j;
	}
}
console.log("Loaded: numberScanner.js");