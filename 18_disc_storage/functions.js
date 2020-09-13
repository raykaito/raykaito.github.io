let outLine=false;
let ya = 1;
function dcClicked(){
    outLine =! outLine;
    ya++;
    log("display Canvas Clicked");
}

const getDist=(xt,yt,xi=0,yi=0)=>{
    return Math.sqrt((xt-xi)*(xt-xi)+(yt-yi)*(yt-yi));
}
const getDir=(xt,yt,xi=0,yi=0)=>{
    return Math.atan2(yt-yi,xt-xi);
}
const deg2rad=(deg)=>{
    return deg/180*Math.PI;
}
const rad2deg=(rad)=>{
    return rad*180/Math.PI;
}


const smoothenArray=(data, range)=>{
    let counter=0;
    let sum = 0;
    let smoothdata = new Array(data.length);
    for(let i=-range; i<data.length+range; i++){
        if(i+range<data.length){
            counter++;
            sum+=data[i+range];
        }
        if(i-range>=0){
            counter--;
            sum-=data[i-range];
        }
        if(i>=0&&i<data.length){
            smoothdata[i]=sum/counter;
        }
    }
    return smoothdata;
}
const takeDerivative=(data)=>{
    let derivative = new Array(data.length);
    let rightSlope = 0;
    let leftSlope = 0;
    for(let i=0;i<data.length;i++){
        if(i>0){
            leftSlope=rightSlope;
        }
        if(i+1<data.length){
            rightSlope = data[i+1]-data[i];
        }
        derivative[i]=rightSlope+leftSlope;
    }
    return derivative;
}
const dualIntegrate=(data)=>{
    let dualInt = new Array(data.length).fill(50);
    let sum=0;
    for(let i=0;i<data.length;i++){
        if(data[i]<0){
            sum+=data[i];
            dualInt[i] = sum+50;
        }else{
            sum = 0;
        }
    }
    sum=0;
    for(let i=data.length-1;i>=0;i--){
        if(data[i]>0){
            sum+=data[i];
            dualInt[i] = sum+50;
        }else{
            sum = 0;
        }
    }
    return dualInt;
}
const lineIntensity=(data)=>{
    let intensity = new Array(data.length).fill(0);
    for(let i=0;i<data.length-1;i++){
        intensity[i] = Math.max(0,data[i+1]-data[i]);
    }
    return intensity;
}
const getMin=(data)=>{return Math.min(...data);}
const getMax=(data)=>{return Math.max(...data);}
const getMinIndex=(data)=>{
    let min = data[0];
    let minIndex = 0;
    for(let i=1;i<data.length;i++){
        if(data[i]<min){
            min = data[i];
            minIndex=i;
        }
    }
    return minIndex;
}
const getMaxIndex=(data)=>{
    let max = data[0];
    let maxIndex = 0;
    for(let i=1;i<data.length;i++){
        if(data[i]>max){
            max = data[i];
            maxIndex=i;
        }
    }
    return maxIndex;
}

console.log("Loaded: functions.js");