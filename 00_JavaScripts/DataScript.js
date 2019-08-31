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

const reverseBinaryCounter = (number, digit)=>{
	number = number.toString(2).split("").reverse().join("");
	while(number.length<digit) number = number + "0";
	number = parseInt(number,2);
	return number;
}

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

const getMaxIndex = (array) => {
	let max = array[0];
	let maxIndex = 0;
	for(let i=1;i<array.length;i++){
		if(array[i]>max){
			max = array[i];
			maxIndex = i;
		}
	}
	return [maxIndex,max];
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

const getLineIntensity = (array) => {
	let lineIntensity = new Array(array.length).fill(0);
	let lastNegative = -1;
	let negativeIntensity = 0;
	for(let i=0;i<array.length;i++){
		if(array[i]>0){
			if(lastNegative<0){
				continue;
			}else{
				lineIntensity[Math.floor((i+lastNegative)/2)] = array[i]+negativeIntensity;
				lastNegative = -1;
			}
		}else{
			lastNegative = i;
			negativeIntensity = Math.abs(array[i]);
		}
	}
	return lineIntensity;
}

const getSlopeIntensity = (array) => {
	let consistency = 0;// (+) indicates the upward slope and (-) indicates the negative
	let counter = 1;
	let peakDerivatives = new Array(array.length-1).fill(0);
	let maxDerivative = 0;
	for(let i=0;i<array.length-1;i++){
		const newDerivative = array[i+1]-array[i];
		if(consistency*newDerivative>0){
			consistency+=newDerivative;
			counter++;
			continue;
		}else{
			peakDerivatives[i-Math.floor(counter/2)]=consistency;
			if(Math.abs(consistency)>maxDerivative) maxDerivative = Math.abs(consistency);
			counter = 1;
			consistency = newDerivative;
		}
	}
	return peakDerivatives;
}

const smoothenArrayVariableRange = (array) => {
	//Find Optimal Smoothening Range
	let lastScore = 0;
	let dataSmooth = new Array(array.length);
	for(let range=0;range<10;range++){
		//Smoothen Array
		dataSmooth = smoothenArray(array,range);
		//Find Derivative
		let derivative = new Array(dataSmooth.length-1);
		for(let i=0;i<derivative.length;i++) derivative[i] = Math.abs(dataSmooth[i+1]-dataSmooth[i]);
		//Exclude top 10% of Derivative Array
		derivative.sort(function(a,b){
			if(a<b) return -1;
			if(a>b) return  1;
			return 0;
		})
		let aaa = new Array(Math.floor(derivative.length*0.9))
		for (let i=0;i<aaa.length;i++) aaa[i] = derivative[i];
		const minmax = getAbsoluteMinMax(dataSmooth);
		const newScore = (minmax[1]-minmax[0])/(5+calculateVariance(aaa));
		if(newScore<lastScore) break;
		else lastScore = newScore;
	}
	return dataSmooth;
}

const smoothenArray = (array, range) => {
	if(range==0) return array;
	let newArray, accumulator, counter;
	accumulator = 0;
	counter = 0;
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

const countLocalMin = function(array){
	invertedA = new Array(array.length).fill(0);
	for(let i=0;i<array.length;i++) invertedA[i] = -array[i];
	return countLocalMax(invertedA);
}

const interpolate = (outLow, outHigh, rate)=>{//Rate 0.00 ~ 1.00
	return outLow+(outHigh-outLow)*rate;
}

const loopInBound = (num, upper)=>{
	num=num%upper;
	if(num>=0)
		return num;
	else
		return num+upper;
}

const keepInBound = (num, low, high)=>{
	if(num<low) return low;
	if(num>high)return high;
	return num;
}

const checkInBound = (num, low, high)=>{
	if(num>=low&&num<=high)
		return true;
	else
		return false;
}

console.log("Loaded: DataScript.js");