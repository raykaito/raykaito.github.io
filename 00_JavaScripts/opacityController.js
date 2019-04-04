var timeInterval;

function showObject(body, object){

  object.style.opacity = 0;
  body.style.opacity = 1;

  var counter = 0;
  var steps = 10; //# steps to reach Op=1
  var lapse = 1000; //# in ms to reach Op=1;

  timeInterval = setInterval(updateCounter, lapse/steps);

  function updateCounter(){
    counter++;
    updateOpacity();
  }

  function updateOpacity(){
    if(counter/steps>1){
       clearInterval(timeInterval);
    }
    object.style.opacity  = counter/steps;
  }
}

function showByRow(body, table){
    var rows  = table.rows;
    var rownum= rows.length;
    var i=0;

    opacityInit();
 
    var counter =    0;
    var steps   =   10; //# frames to reach Op=1;
    var lapse   = 1000; //# in ms  to reach Op=1;
    var offset  =  500/rownum; //Offset time btwn table rows;
    var tempOpac;

    timeInterval = setInterval(updateCounter, lapse/steps);

    function opacityInit(){
      for(i=0;i<rownum;i++){
        rows[i].style.opacity = 0;
      }
      table.style.opacity = 1;
      body.style.opacity = 1;
    }
    function updateCounter(){
      counter++;
      updateOpacity();
    }

    function updateOpacity(){
      for(i=0;i<rownum;i++){
        opacity = getOpacity(i);
        rows[i].style.opacity = opacity;
      }
      if(opacity>1){
        clearInterval(timeInterval)
      }
    }

    function getOpacity(x){
      tempOpac = counter/steps;
      tempOpac-= x*offset/lapse;
      if(tempOpac<  0) tempOpac =   0;
      if(tempOpac>100) tempOpac = 100;
      return tempOpac;
    }
}


function leavepage(object, url){

  var counter = 0;
  var steps = 10;   //# steps to reach Op=0;
  var lapse = 1000; //# in ms to reach Op=0;

  clearInterval(timeInterval);

  timeInterval = setInterval(downdateCounter,lapse/steps);

  function downdateCounter(){
    counter++;
    if((steps-counter)/steps<0){
      clearInterval(timeInterval);
      window.location.href = url;
      setTimeout(showObject(object),2000);
      return;
    }
    object.style.opacity = (steps-counter)/steps;
  }
}