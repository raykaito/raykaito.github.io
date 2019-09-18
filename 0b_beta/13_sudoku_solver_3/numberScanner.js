class VisionProgram_numberReader{
	constructor(){
		//Board orientation info
		this.originalCanvas = document.createElement("canvas");
		this.oct = this.originalCanvas.getContext("2d");
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
		this.scanInterval = 1;
		this.timeIsUp = false;
		this.lastState = 0;
		//---------------List----------------//
		this.unknwnIndex = new Array();
		this.numbersListed = false;
		this.listedCounter = 0;
		//----------Similarity Array---------//
		this.similarityAcquired = false;
		this.similarity;
		//-----------Sudoku Matrix-----------//
		this.sudokuCreated = false;
		this.sameNumberIndex = new Array();
		this.sudoku = new Array(81).fill(0);
	}
	get sudokuArray(){return this.sudoku;}
	startScan(br){
		//---------Init Section Start---------//
		this.lastTime = Date.now();
		this.timeIsUp = false;
		if(br.failed==false)	this.handleNewBoard(br);
		else 					rotateCanvas(this.xc, this.yc, this.rotationAngle);
		if(this.boardRead==false) return;
		//----------Display the Frame----------//
		line(this.getXYfromIndex(-0.5,-0.5),this.getXYfromIndex( 8.5,-0.5),3, "lime");
		line(this.getXYfromIndex( 8.5,-0.5),this.getXYfromIndex( 8.5, 8.5),3, "lime");
		line(this.getXYfromIndex( 8.5, 8.5),this.getXYfromIndex(-0.5, 8.5),3, "lime");
		line(this.getXYfromIndex(-0.5, 8.5),this.getXYfromIndex(-0.5,-0.5),3, "lime");
		//----------List the Numbers-----------//
		if(this.numbersListed==false) this.listNumbers();
		if(this.numbersListed==false) return;
		//----------Compare the list-----------//
		if(this.similarityAcquired==false) this.getSimilarity();
		if(this.similarityAcquired==false) return;
		//------create the Sudoku Matrix------//
		if(this.sudokuCreated==false) this.createSudokuMatrix();
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
		//Check if MinMax corner locations record was broken or not
		const xy1 = br.getXYfromIndex(br.xIndexMin  , br.yIndexMin  );
		const xy2 = br.getXYfromIndex(br.xIndexMin+8, br.yIndexMin  );
		const xy3 = br.getXYfromIndex(br.xIndexMin+8, br.yIndexMin+8);
		const xy4 = br.getXYfromIndex(br.xIndexMin  , br.yIndexMin+8);
		circle([xy1[0],xy1[1],3]);
		circle([xy2[0],xy2[1],3]);
		circle([xy3[0],xy3[1],3]);
		circle([xy4[0],xy4[1],3]);
		return;
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

		this.originalCanvas.width = canvas.width;
		this.originalCanvas.height= canvas.height;
		this.oct.save();
	    this.oct.translate(this.xc/canvasScale,this.yc/canvasScale);
	    this.oct.rotate( +deg2rad(this.rotationAngle) );
	    this.oct.translate( -this.xc/canvasScale, -this.yc/canvasScale );
		this.oct.drawImage(canvas,0,0);
		this.oct.restore();
	}
	resetBoard(){
		this.boardRead = false;
		//Time Keeping stuff
		this.scanInterval = 30;
		this.timeIsUp = false;
		this.lastState = 0;
		//---------------List----------------//
		this.unknwnIndex = new Array();
		this.numbersListed = false;
		this.listedCounter = 0;
		//----------Similarity Array---------//
		this.similarityAcquired = false;
		this.similarity;
		//-----------Sudoku Matrix-----------//
		this.sudokuCreated = false;
		this.sameNumberIndex = new Array();
		this.sudoku = new Array(81).fill(0);
		mct.fillStyle = "black";
		mct.fillRect(0,-40,mcanvas.width,mcanvas.height-40);
	}
	listNumbers(){
		for(;this.lastState<81;this.lastState++){
			if(this.checkTime()) return;
			if(this.emptyCells[this.lastState]<0){
				this.unknwnIndex[this.unknwnIndex.length] = this.lastState;
				this.list(this.lastState%9,Math.floor(this.lastState/9));
			}
		}
		this.numbersListed = true;
		this.lastState = 0;
		this.similarity = new Array(this.listedCounter*this.listedCounter).fill(0);
		this.sameNumberIndex = new Array(this.listedCounter).fill(-1);
	}
	list(xi,yi){
		const xy1 = this.getXYfromIndex(xi-0.4,yi-0.4);
		const xy2 = this.getXYfromIndex(xi+0.4,yi+0.4);
		const img = newWindow(this.ct).cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
		const binarizedImg = new Binarize(img.passdata);
		const blobFinder = new FindBlob(binarizedImg.passdata,1);
		blobFinder.eraseSmallerBlobs();
		const image = blobFinder.blob;
		const imgBN = img.updateDisplayImage();
		mct.drawImage(image,0, this.listedCounter*17,16,16);
		mct.drawImage(imgBN,17, this.listedCounter*17,16,16);
		mct.drawImage(imgBN,this.listedCounter*19+31, -17,16,16);
		//Distance Transform
		/*
		const imgWindow = newWindow(mct).cornerWidthHeight(0, this.listedCounter*17,16,16);
		const imgDT = new DistanceTransform(imgWindow.passdata);
		mct.drawImage(imgDT.canvas,0, this.listedCounter*17,16,16);
		*/
		mct.strokeStyle = "gray";
	    mct.lineWidth = 1;
	    mct.beginPath();
	    mct.moveTo(0, this.listedCounter*17);
	    mct.lineTo(mcanvas.width, this.listedCounter*17);
	    mct.stroke();

		this.listedCounter++;
	}
	getSimilarity(){
		for(;this.lastState<this.listedCounter*this.listedCounter;this.lastState++){
			if(this.checkTime()) return;
			const x = 			 this.lastState%this.listedCounter ;
			const y = Math.floor(this.lastState/this.listedCounter);
			if(x<=y) continue;
			this.compare(x, y);
		}
		this.similarityAcquired = true;
		this.lastState = 0;
	}
	compare(xi, yi){
		const imgDataXi = mct.getImageData(0, xi*17+40,16,16);
		const imgDataYi = mct.getImageData(0, yi*17+40,16,16);
		//Count Error
		let similarity = 0;
		for(let i=0;i<256;i++){
			similarity -= Math.abs(imgDataXi.data[4*i+1]-imgDataYi.data[4*i+1]);
		}
		this.similarity[this.lastState] = similarity;
		mct.fillStyle = "white";
		mct.font = "bold 12px Arial";
		mct.fillText(Math.floor(-similarity/400),xi*19+32,yi*17+12);
		return;
	}
	createSudokuMatrix(){
		let numberToErase = this.listedCounter-9;
		//-----Look for the numbers which are the same
		if(numberToErase!=0){
			let sortedSimilarity = new Array(this.similarity.length);
			for(let i=0;i<sortedSimilarity.length;i++)	sortedSimilarity[i] = [this.similarity[i],i];
			sortedSimilarity.sort(function(a,b){
				if(a[0]<b[0]) return  1;
				if(a[0]>b[0]) return -1;
				return 0;
			});
			console.log(sortedSimilarity);
			const startingIndex = this.listedCounter*(this.listedCounter+1)/2;
			for(let i=startingIndex;i<this.listedCounter*this.listedCounter;i++){
				if(sortedSimilarity[i][0]<-8000){
					this.resetBoard();
					return;
				}
				const index = sortedSimilarity[i][1];
				const x = 			 index%this.listedCounter ;
				const y = Math.floor(index/this.listedCounter);
				if(this.sameNumberIndex[x]==-1){
					numberToErase--;
				}
				this.sameNumberIndex[x] = y;
				mct.strokeStyle = "lime";
				mct.lineWidth = 1;
				mct.strokeRect(x*19+32,y*17,19,16);
				if(numberToErase==0) break;
			}
		}
		//--------Create Sudoku array based on the array above
		let originalCounter = 1;
		for(let i=0;i<this.listedCounter;i++){
			if(this.sameNumberIndex[i]==-1){
				this.sameNumberIndex[i] = originalCounter;
				originalCounter++;
			}else{
				this.sameNumberIndex[i] = this.sameNumberIndex[this.sameNumberIndex[i]];
			}
			this.sudoku[this.unknwnIndex[i]] = this.sameNumberIndex[i];
		}
		this.sudokuCreated = true;
		//Create Sudoku class
		kill();
		let corners = new Array(4);
		corners[0] = this.getXYfromIndex(8,8,1);
		corners[1] = this.getXYfromIndex(0,8,1);
		corners[2] = this.getXYfromIndex(0,0,1);
		corners[3] = this.getXYfromIndex(8,0,1);
		//Compensate for the different canvas size
		const numList = [0,1,7,8,4,9,5,6,2,3];
		const numListNot = [0,1,2,3,4,5,6,7,8,9];
		sudoku = new Sudoku(corners,newWindow(this.oct).cornerToCorner(0,0,this.originalCanvas.width,this.originalCanvas.height).updateDisplayImage());
		for(let i=0;i<this.sudoku.length;i++){
			if(this.sudoku[i]!=0) sudoku.setNumber(i%9,Math.floor(i/9),this.sudoku[i],true);
		}
		let index = 1;
		for(let i=0;i<81;i++){
			if(this.sudoku[i]!=index) continue;
			const xi = i%9;
			const yi = Math.floor(i/9);
			const xy1 = this.getXYfromIndex(xi-0.35,yi-0.35,true);
			const xy2 = this.getXYfromIndex(xi+0.35,yi+0.35,true);
			const img = newWindow(this.oct).cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
			const binarizedImg = new Binarize(img.passdata);
			binarizedImg.white2Transparent();
			sudoku.saveNumberPlate(index,binarizedImg.updateDisplayImage());
			index++;
		}
		startSolving(100);
		//------------display sudoku for test
		console.log("-------------");
		const stringList = [" ",1,2,3,4,5,6,7,8,9];
		const stringListNot = [" ",6,1,3,8,2,9,4,5,7];
		for(let i=0;i<9;i++){
			let string = "|";
			for(let j=0;j<9;j++){
				string += stringList[this.sudoku[i*9+j]];
				if((j+1)%3==0) string += "|";
			}
			console.log(string);
			if((i+1)%3==0) console.log("-------------");
		}
	}
	getXYfromIndex(xin, yin,canvasScaleEnabled=false){
		const xIndex = xin+this.xIndexMin;
		const yIndex = yin+this.yIndexMin;
		const partialx = (this.dx==1)?(1):((1/Math.log(this.dx)*(Math.pow(this.dx,xIndex)-1)));
		const partialy = (this.dy==1)?(1):((1/Math.log(this.dy)*(Math.pow(this.dy,yIndex)-1)));
		const x = (this.cellLength *partialx)*Math.pow(this.dy,yIndex)-getXYfromDirDis(this.vAngle,yIndex*this.cellLength)[1]+this.xc;
		const y = (this.cellLengthy*partialy)*Math.pow(this.dx,xIndex)+this.yc;
		return [x/(canvasScaleEnabled?canvasScale:1),y/(canvasScaleEnabled?canvasScale:1)];
	}
	checkTime(){
		if((Date.now()-this.lastTime)>this.scanInterval)	return true;
		else return false;
	}
}
console.log("Loaded: numberScanner.js");