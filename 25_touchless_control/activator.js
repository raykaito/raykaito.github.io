console.log("Running activator.js");
//Prepare function to load js files
function loadJS(url){
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = resolve;
        document.body.appendChild(script);
    });
}
async function loadJSinOrder(){
    const localTest = false;
    //Load important JS files
    if(localTest){
        await loadJS("functions.js");
        await loadJS("canvas.js");
        await loadJS("vision_program.js");
        await loadJS("video_stream.js");
        await loadJS("runner.js");
    }else{
        await loadJS("https://raykaito.github.io/25_touchless_control/functions.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/canvas.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/vision_program.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/video_stream.js");
        await loadJS("https://raykaito.github.io/25_touchless_control/runner.js");
    }
    openFullScreen();
    console.log("Every JS file loaded");
}

loadJSinOrder();
