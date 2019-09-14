class Repeater{
	constructor(f_Repeat_In, f_End_In, timeInterval){
		this.minimumTime = 10;
		this.timeInterval = timeInterval;

		this.functionToRepeat = ()=>{return f_Repeat_In();};
		this.f_theEnd = (result)=>{f_End_In(result);}
		this.callFunction();
	}
	callFunction(){
		this.startTime = performance.now();
		const result = this.functionToRepeat();
		this.functionCalled(result);
	}
	functionCalled(result){
		const lapse = performance.now() - this.startTime;
		const tilNext = this.timeInterval - lapse;
		const tilNextAbs = Math.max(this.minimumTime, tilNext);

		if(result==="continue"){
			setTimeout(()=>{this.callFunction();},  tilNextAbs);
		}else{
			setTimeout(this.f_theEnd, tilNextAbs, result);
		}
	}
}

console.log("Loaded: ItvlScript.js");
