console.log("Running activator.js");
//Check if activator.js had been run or not.
if(activated==undefined){
    var activated = false;
}else{
    activated = true;
}
//Prepare function to load js files
function loadJS(url,setTheTimeout = false){
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = () => resolve(true);
        document.body.appendChild(script);
        if(setTheTimeout) setTimeout(() => resolve(false),10);
    });
}
async function loadJSinOrder(){
    const local_functionjs_oaded = await loadJS("canvas.js",true);
    //Load important JS files
    if(local_functionjs_oaded){
        await loadJS("vision_program.js");
        await loadJS("video_stream.js");
        await loadJS("runner.js");
    }else{
        await loadJS("https://raykaito.github.io/25_touchless_control/canvas.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/vision_program.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/video_stream.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/runner.js");
    }
    openFullScreen();
    console.log("Every JS file loaded from "+(local_functionjs_oaded?"local directory.":"github directory."));
}

//Load js if not activated
if(!activated){
    loadJSinOrder();
}else{
    turnOn();
}
