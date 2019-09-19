class VisionProgram_numberReader{
	constructor(){
		//Board orientation info
		this.originalCanvas = document.createElement("canvas");
		this.oct = this.originalCanvas.getContext("2d");
		this.canvas = document.createElement("canvas");
		this.ct = this.canvas.getContext("2d");
		this.numberCanvas = document.createElement("canvas");
		this.nct = this.numberCanvas.getContext("2d");
		this.sideLength = 16;
		this.numberCanvas.width = this.sideLength*81;
		this.numberCanvas.height = this.sideLength;
		//emptyCells
		this.emptyCells = new Array(81).fill(0);
		this.ECClimit = 5;//Empty cells counter upper limit
		this.resetBoard();
	}
	get sudokuArray(){return this.sudoku;}
	startScan(br){
		//---------Init Section Start---------//
		this.lastTime = Date.now();
		this.timeIsUp = false;
		this.handleNewBoard(br);
		if(this.timeToList==false) return;
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
		if(br.failed||this.timeToList) return;
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
		if(this.boardRead==false){
			this.xy1=[0,0];
			this.xy2=[0,0];
			this.xy3=[0,0];
			this.xy4=[0,0];
			this.boardReadTime = Date.now();
			this.minmaxCornerLocation = hcanvas.width;
			this.boardRead = true;
		}else if((Date.now()-this.boardReadTime)>2000){
			//Now it is time to start listing
			this.timeToList = true;
		}
		if(this.timeToList) return;
		const xy1 = br.getXYfromIndex(br.xIndexMin  , br.yIndexMin  );
		const xy2 = br.getXYfromIndex(br.xIndexMin+8, br.yIndexMin  );
		const xy3 = br.getXYfromIndex(br.xIndexMin+8, br.yIndexMin+8);
		const xy4 = br.getXYfromIndex(br.xIndexMin  , br.yIndexMin+8);
		const newMinmaxCornerLocation = Math.max(getDist(this.xy1,xy1),getDist(this.xy2,xy2),getDist(this.xy3,xy3),getDist(this.xy4,xy4));
		this.xy1 = xy1;
		this.xy2 = xy2;
		this.xy3 = xy3;
		this.xy4 = xy4;
		if(newMinmaxCornerLocation<this.minmaxCornerLocation){
			this.minmaxCornerLocation = newMinmaxCornerLocation;
			//New minMax and ready to update the board
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
			this.oct.drawImage(canvas,0,0);
			console.log("Number Scanner Canavs Updated");
		}
	}
	resetBoard(){
		console.log("resetBoard");
		this.boardRead = false;
		//Time Keeping stuff
		this.scanInterval = 30;
		this.timeIsUp = false;
		this.lastState = 0;
		//-------------Pre List--------------//
		this.timeToList = false;
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
		this.nct.fillStyle = "black";
		this.nct.fillRect(0,0,this.numberCanvas.width,this.numberCanvas.height);
	}
	listNumbers(){
		for(;this.lastState<81;this.lastState++){
			if(this.checkTime()) return;
			if(this.emptyCells[this.lastState]<0){
				this.unknwnIndex[this.unknwnIndex.length] = this.lastState;
				this.list(this.lastState%9,Math.floor(this.lastState/9));
			}
		}
		//Now the numbers are listed
		this.numbersListed = true;
		this.lastState = 0;
		this.similarity = new Array(this.listedCounter*this.listedCounter).fill(0);
		this.sameNumberIndex = new Array(this.listedCounter).fill(-1);
		mct.drawImage(this.numberCanvas,0,0);
	}
	list(xi,yi){
		const xy1 = this.getXYfromIndex(xi-0.4,yi-0.4);
		const xy2 = this.getXYfromIndex(xi+0.4,yi+0.4);
		const img_original  = newWindow(this.ct).cornerToCorner(xy1[0], xy1[1], xy2[0], xy2[1]);
		const img_binarize  = new Binarize(img_original.passdata);
		const img_filtered  = new Filter(  img_original.passdata,2);
		const img_binarized = new Binarize(img_filtered.passdata);
		const img_blob      = new FindBlob(img_binarized.passdata,1);
		img_blob.eraseSmallerBlobs();
		const img_number = img_blob.blob;
		this.nct.drawImage(img_number,this.listedCounter*16,0,16,16);
		//Display Filtered, Binarized, etced Images
		
		mct.drawImage(img_original.updateDisplayImage() ,32, (1+this.listedCounter)*32,31,31);
		mct.drawImage(img_binarize.updateDisplayImage()	,64, (1+this.listedCounter)*32,31,31);
		mct.drawImage(img_filtered.updateDisplayImage()	,96, (1+this.listedCounter)*32,31,31);
		mct.drawImage(img_binarized.updateDisplayImage(),128, (1+this.listedCounter)*32,31,31);
		mct.drawImage(img_number						,160, (1+this.listedCounter)*32,31,31);
		

		//Distance Transform
		/*
		const imgWindow = newWindow(mct).cornerWidthHeight(0, this.listedCounter*17,16,16);
		const imgDT = new DistanceTransform(imgWindow.passdata);
		mct.drawImage(imgDT.canvas,0, this.listedCounter*17,16,16);
		*/
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
		const imgDataXi = this.nct.getImageData(xi*16,0,16,16);
		const imgDataYi = this.nct.getImageData(yi*16,0,16,16);
		//Count Error
		let similarity = 0;
		for(let i=0;i<256;i++){
			similarity -= Math.abs(imgDataXi.data[4*i+1]-imgDataYi.data[4*i+1]);
		}
		this.similarity[this.lastState] = similarity;
		//mct.fillStyle = "white";
		//mct.font = "bold 12px Arial";
		//mct.fillText(Math.floor(-similarity/400),xi*19+32,yi*17+12);
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
				/*
				mct.strokeStyle = "lime";
				mct.lineWidth = 1;
				mct.strokeRect(x*19+32,y*17,19,16);
				*/
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
		sudoku = new Sudoku(corners,newWindow(this.oct).cornerToCorner(0,0,this.originalCanvas.width,this.originalCanvas.height).updateDisplayImage(),[this.xc,this.yc,-this.rotationAngle]);
		for(let i=0;i<this.sudoku.length;i++){
			if(this.sudoku[i]!=0) sudoku.setNumber(i%9,Math.floor(i/9),this.sudoku[i],true);
		}
		let index = 1;
		//Rotate Board
		this.oct.save();
	    this.oct.translate(this.xc/canvasScale,this.yc/canvasScale);
	    this.oct.rotate( +deg2rad(this.rotationAngle) );
	    this.oct.translate( -this.xc/canvasScale, -this.yc/canvasScale );
		this.oct.drawImage(this.originalCanvas,0,0);
		this.oct.restore();
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
		sudoku.startSolving(100);
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