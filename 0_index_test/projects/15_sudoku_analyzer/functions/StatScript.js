const calculateVariance = (array)=>{
	var total = array.length;
	var ave = array.reduce(function(a,b,c){return a+b; })/total;
	var std = array.reduce(function(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return Math.sqrt(std);
}

const getAve = (array)=>{return array.reduce(function(a,b,c){return a+b;})/array.length;}

const getAveStd = (array)=>{
	const total = array.length;
	const ave = array.reduce(function(a,b,c){return a+b; })/total;
	const std = array.reduce(function(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return [ave, Math.sqrt(std)];
}

const findError = (theoretical, emperical)=>{
	return 100*(Math.abs(emperical-theoretical)/theoretical);
}

const getMedian = (array)=>{
	array.sort(function(a,b){
		if(a[0]>b[0]) return -1;
		if(a[0]<b[0]) return  1;
		return 0;
	});
	return array[Math.floor(array.length/2)];
}

console.log("Loaded: StatScript.js");