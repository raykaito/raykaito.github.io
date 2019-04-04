const calculateVariance = (array)=>{
	var total = array.length;
	var ave = array.reduce(function(a,b,c){return a+b; })/total;
	var std = array.reduce(function(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return Math.sqrt(std);
}

const getAveStd = (array)=>{
	const total = array.length;
	const ave = array.reduce(function(a,b,c){return a+b; })/total;
	const std = array.reduce(function(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return [ave, Math.sqrt(std)];
}

console.log("Loaded: StatScript.js");