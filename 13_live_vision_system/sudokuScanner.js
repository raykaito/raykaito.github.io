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
		let inH = new Array(numberOfLines+1);
		let inV = new Array(numberOfLines+1);
		//Gather Circles
		for(let i=0;i<=numberOfLines;i++){
			const imgH = newWindow().centerWidthHeight(hcanvas.width/2,  yCorner+rangeOfSearch*(i/numberOfLines), rangeOfSearch, 1);
			const imgV = newWindow().centerWidthHeight(xCorner+rangeOfSearch*(i/numberOfLines), hcanvas.height/2, 1, rangeOfSearch);
			const scannerH = new IntersectionDetector(imgH.passdata, 0, 0);
			const scannerV = new IntersectionDetector(imgV.passdata, 1, 0);
			inH[i] = scannerH.intersections;
			inV[i] = scannerV.intersections;
		}
		//Analyze intersections horizontal
		const acceptableError = rangeOfSearch/100;
		const minInterCounter = numberOfLines*0.7;
		let xyV = new Array();
		for(let upperIndex = 0;upperIndex<inH[0].length;upperIndex++){
			const xup = inH[0][upperIndex];
			for(let lowerIndex = 0;lowerIndex<inH[numberOfLines].length;lowerIndex++){
				const xlo = inH[numberOfLines][lowerIndex];
				let interCounter = 0;
				for(let i=1;i<numberOfLines;i++){
					const xta = xup+(xlo-xup)*i/numberOfLines;
					let error = rangeOfSearch;
					for(let index = 0;index<inH[i].length;index++){
						error = Math.min(Math.abs(inH[i][index]-xta),error);
					}
					if(error<acceptableError)interCounter++;
				}
				if(interCounter>=minInterCounter){
					xyV[xyV.length] = [xCorner+xup,yCorner,xCorner+xlo,yCorner+rangeOfSearch];
				}
			}
		}
		for(let i=0;i<xyV.length;i++){
			circle(xyV[i][0]/canvasScale,xyV[i][1]/canvasScale,5);
			circle(xyV[i][2]/canvasScale,xyV[i][3]/canvasScale,5);
		}
		//Analyze intersections vertical
		let xyH = new Array();
		for(let upperIndex = 0;upperIndex<inV[0].length;upperIndex++){
			const xup = inV[0][upperIndex];
			for(let lowerIndex = 0;lowerIndex<inV[numberOfLines].length;lowerIndex++){
				const xlo = inV[numberOfLines][lowerIndex];
				let interCounter = 0;
				for(let i=1;i<numberOfLines;i++){
					const xta = xup+(xlo-xup)*i/numberOfLines;
					let error = rangeOfSearch;
					for(let index = 0;index<inV[i].length;index++){
						error = Math.min(Math.abs(inV[i][index]-xta),error);
					}
					if(error<acceptableError)interCounter++;
				}
				if(interCounter>=minInterCounter){
					xyH[xyH.length] = [yCorner,xCorner+xup,yCorner+rangeOfSearch,xCorner+xlo];
				}
			}
		}
		for(let i=0;i<xyH.length;i++){
			circle(xyH[i][0]/canvasScale,xyH[i][1]/canvasScale,5);
			circle(xyH[i][2]/canvasScale,xyH[i][3]/canvasScale,5);
		}
		if(xyV.length*xyH.length==0){
			this.abort("unable to find lines");
			return;
		}
		//get angle and cell length

		const success = false;
		if(success){
			return result;
		}else{
			this.abort("unable to find angle and an intersection");
		}
	}
}
console.log("Loaded: sudokuScanner.js");