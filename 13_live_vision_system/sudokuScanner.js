class VisionProgram_SudokuReader{
	constructor(){
		this.cellLength;
		this.failed=false;
	}
	abort(msg){
		this.failed=true;
		console.log(msg);
	}
	startScan(){
		//find angle and an intersection
		let result = this.getXYangle();
		if(this.failed) return;
	}
	getXYangle(){
		const rangeOfSearch = hcanvas.width/2;
		const numberOfLines = 10;
		const xCorner = (hcanvas.width - rangeOfSearch)/2;
		const yCorner = (hcanvas.height- rangeOfSearch)/2;
		let intersectionsH = new Array(numberOfLines+1);
		let intersectionsV = new Array(numberOfLines+1);
		for(let i=0;i<=numberOfLines;i++){
			const imgH = newWindow().centerWidthHeight(hcanvas.width/2,  yCorner+rangeOfSearch*(i/numberOfLines), rangeOfSearch, 1);
			const imgV = newWindow().centerWidthHeight(xCorner+rangeOfSearch*(i/numberOfLines), hcanvas.height/2, 1, rangeOfSearch);
			const scannerH = new IntersectionDetector(imgH.passdata, 0, 1);
			const scannerV = new IntersectionDetector(imgV.passdata, 1, 1);
			intersectionsH[i] = scannerH.intersections;
			intersectionsV[i] = scannerV.intersections;
		}
		let success = false;
		if(success){
			return result;
		}else{
			this.abort("unable to find angle and an intersection");
		}
	}
	findAngleXY(){
		//Scan for lines at horizontal line in middle
		let imgData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, this.cellMax, 1);
		let scanner = new IntersectionDetector(imgData.passdata,0,1);
		const array = scanner.lineIntensitySorted;
		//Check if the detected line is continuous
		for(let i=0;i<10;i++){
			const angle = this.findAngle(scanner.xpos+array[i][1],scanner.ypos);
			return "fail";
			const angleCandidate = this.findAngleCandidate(scanner.xpos+array[i][1],scanner.ypos);
			return "fail";
			const angleReliable = this.findAngleReliable(scanner.xpos+array[i][1],scanner.ypos, angleCandidate);
			if(angleReliable!="fail"){
				console.log("Angle Successfully Found: "+angleReliable);
				return [90-angleReliable,scanner.xpos+array[i][1],scanner.ypos] ;
			}
		}
		this.abort("Failed to find angle");
		return "fail";
	}
}
console.log("Loaded: sudokuScanner.js");