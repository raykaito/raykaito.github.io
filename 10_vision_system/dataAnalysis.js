const getLocalMinMaxIndex = (array, localMaxNumber) => {
	
	let minmaxIndexList;
	const minmax = getAbsoluteMinMax(array);
	const indexC = new binarySearchIndexController(minmax[1]);
	while(indexC.range>=0.5){
		console.log(indexC.index);
		minmaxIndexList = isLocalMaxLTOET(array, localMaxNumber, indexC.index);
		if(minmaxIndexList==false){
			indexC.step(1);
			continue;
		}
		if(minmaxIndexList[1].length<localMaxNumber){
			indexC.step(-1);
			continue;
		}
		console.log("pass");
		break;
	}
	if(indexC.range<0.5) console.log("FAIL!");
	console.log(minmaxIndexList);
}

const isLocalMaxLTOET = (array, localMaxNumberLimit, fuzzy) =>{
	let localMaxIndex = new Array();
	let localMinIndex = new Array();
	let lookingForMax = true;
	let localExtreme  = 0;
	let maxIndexIndex = 0;
	for(let i=0;i<array.length;i++){
		if( ((lookingForMax?1:-1)*(localExtreme-array[i]) - fuzzy)>0){
			if(lookingForMax){
				localMaxIndex[maxIndexIndex] = localExtreme;
				if(maxIndexIndex>=localMaxNumberLimit) return false;
			}else{
				localMinIndex[maxIndexIndex] = localExtreme;
				maxIndexIndex++;
			}
			lookingForMax = !lookingForMax;
			localExtreme = array[i];
			continue;
		}
		if(lookingForMax){
			localExtreme = Math.max(array[i],localExtreme);
		}else{
			localExtreme = Math.min(array[i], localExtreme);
		}
	}
	return [localMinIndex, localMaxIndex];
}

class binarySearchIndexController{
	
	constructor(maxIndex){
		this.currentIndex = nextBinary(maxIndex);
		this.searchRange = this.currentIndex/2;
		this.step(-1);
	}
	
	get index(){return this.currentIndex;}
	get range(){return this.searchRange;}

	step(num){
		this.currentIndex += this.searchRange*num;
		this.searchRange /= 2;
	}
}

const nextBinary= (num) => {return Number(toDecimal(Math.pow(10, (""+toBinary(num)).length)));}
const toBinary  = (num) => {return Number(ConvertBase(num).from(10).to(2));}
const toDecimal = (num) => {return Number(ConvertBase(num).from(2).to(10));}

const ConvertBase = (num) => {
	return {
		from : (baseFrom) =>  {
			return {
				to : (baseTo) => {
					return parseInt(num, baseFrom).toString(baseTo);
				}
			};
		}
	};
}

const getAbsoluteMinMax = (array) => {
	let minmax = new Array(2);
	minmax[0] = minmax[1] = array[0]
	for(let i=1;i<array.length;i++){
		minmax[0] = Math.min(minmax[0], array[i]);
		minmax[1] = Math.max(minmax[1], array[i]);
	}
	return minmax;
}

const smoothenArrayLMN = (array, localMaxNumber) => {
	let increaseing, newArray, localMaxCounter;
	for(let range=1;range<array.length;range++){
		newArray = smoothenArray(array, range);
		increasing = true;
		localMaxCounter = 0;
		for(let i=0;i<array.length-1;i++){
			if(increasing){
				if(newArray[i+1]<newArray[i]){
					increasing = false;
					localMaxCounter++;
				}
			}else{
				if(newArray[i+1]>newArray[i]){
					increasing = true;
				}
			}
		}
		console.log("range: "+range+" LMC: "+localMaxCounter);
		if(localMaxCounter<=localMaxNumber){
			console.log(range);
			break;
		}
	}
	return newArray;
}

const smoothenArray = (array, range) => {
	if(range==0) return array;
	let newArray, accumulator, counter;
	accumulator = counter = 0;
	newArray = new Array(array.length).fill(-1);
	for (let i=-range;i<array.length+range;i++){
		if(i+range<array.length){
			accumulator+=array[i+range];
			counter++;
		}
		if(i-range>=0){
			accumulator-=array[i-range];
			counter--;
		}
		if(i>=0&&i<array.length){
			newArray[i] = accumulator/counter;
		}
	}
	return newArray;
}

const countLocalMax = (array) => {
	let increaseing, localMaxCounter;
	for(let range=1;range<array.length;range++){
		increasing = true;
		localMaxCounter = 0;
		for(let i=0;i<array.length-1;i++){
			if(increasing){
				if(array[i+1]<array[i]){
					increasing = false;
					localMaxCounter++;
				}
			}else{
				if(array[i+1]>array[i]){
					increasing = true;
				}
			}
		}
	}
	return localMaxCounter;
}