var width, height,pixelRatio;

function init(){
	
	pixelRatio = window.devicePixelRatio;
	
	//Setup Canvas resolution;
	canvas.width *= pixelRatio;
	canvas.height*= pixelRatio;
	width = canvas.width;
	height= canvas.height;
    canvas.style.width  = "500px";
    canvas.style.height = "1200px";

    //Initialize tile size
	tileWidth = 80*pixelRatio;
	tileHeight=90*pixelRatio;
    
    //Settings Init
    settingsInit();

    updateCanvas();
}

function clicked(event){
	prevent = click(event);
	rect = event.target.getBoundingClientRect();
	tempy = event.pageY-rect.top-document.body.scrollTop-document.documentElement.scrollTop;
	tempy = tempy.toFixed(2);
	mapSettlement();
	updateCanvas();
	if(prevent) event.preventDefault();
}

function click(event){
	rect = event.target.getBoundingClientRect();
	x = event.pageX-rect.left-document.body.scrollLeft-document.documentElement.scrollLeft;
	y = event.pageY-rect.top-document.body.scrollTop-document.documentElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;
	
	if(mode==0){
		//-----Select Resource Type Screen
		tx = xy2xindex(x,y)+1;
		ty = xy2yindex(x,y)+1;
		switch(tx*3+ty){
			case 1:selectedResource = clay;		break;
			case 2:selectedResource = desert;	break;
			case 3:selectedResource = iron;		break;
			case 5:selectedResource = wood;		break;
			case 6:selectedResource = wheat;	break;
			case 7:selectedResource = sheep;	break;
			default: return true;
		}
		mode=1;
		resourceType=0;
		return true;
		
	}else if(mode==1){
		//-----Main Screen
		if(y>width*0.89){
			newMapRequired = false;
			gap = width/10;
			for(i=1;i<6;i++){
				tx = width/2-gap*3+i*gap;
				ty = width*0.95    
				if(dist(x,y,tx,ty)<18*pixelRatio){roll(i+1); return true;}
			}
			for(i=1;i<6;i++){
				tx = width/2-gap*3+i*gap;
				ty = width*0.925+gap;
				if(dist(x,y,tx,ty)<18*pixelRatio){roll(i+7); return true;}
			}
			if(dist(x,y,width/2-gap*3+7*gap,(width*1.875+gap)/2)<18*pixelRatio){rindex=Math.max(rindex-1,0); updateCanvas();return false;}
		}else{
			newMapRequired = true;
			//-----Select Settlement Type
			if(dist(x,y,width*6.0/7, 20*pixelRatio)<20*pixelRatio){ selectedResource = 0; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.0/7, 60*pixelRatio)<20*pixelRatio){ selectedResource = 1; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.0/7,100*pixelRatio)<20*pixelRatio){ selectedResource = 2; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.0/7,140*pixelRatio)<20*pixelRatio){ selectedResource = 3; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.5/7, 20*pixelRatio)<20*pixelRatio){ selectedResource = 4; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.5/7, 60*pixelRatio)<20*pixelRatio){ selectedResource = 5; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.5/7,100*pixelRatio)<20*pixelRatio){ selectedResource = 6; 	resourceType =1; 	  return false;}
			if(dist(x,y,width*6.5/7,140*pixelRatio)<20*pixelRatio){ selectedResource = 7; 	resourceType =1; 	  return false;}
			//-----Undo Settlement
			if(dist(x,y,width*6.5/7,180*pixelRatio)<20*pixelRatio){settleNumber=Math.max(settleNumber-1,0);		  return false;}

			//-----Select NumberTile
			if(dist(x,y,width*6.0/7,360*pixelRatio)<20*pixelRatio){							resourceType =2;	  return false;}
			//-----Undo NumberTile
			if(dist(x,y,width*6.5/7,360*pixelRatio)<20*pixelRatio){ntNumber=Math.max(ntNumber-1,0);				  return true;}

			tx = xy2xindex(x,y);
			ty = xy2yindex(x,y);
			if(tx==-1&&ty==-3){
				//-----User hit the Hex on corner
				mode=0;
				
				return false;
			}
			if(validIndex(tx,ty)==false) return false;
			if(resourceType==0){
				//-----Place a tile on the field
				selection[tx+2][ty+2] = selectedResource;
			}else if(resourceType==1){
				//-----Place a settlement on the field
				settlement[settleNumber][0] = tx;
				settlement[settleNumber][1] = ty;
				tx=(tx+ty/2)*tileWidth+width/2;
				ty=ty*tileHeight*3/4+width/2;
				ta=line2Angle(tx,ty,x,y);
				settlement[settleNumber][2] = ta;
				settlement[settleNumber][3] = selectedResource;
				settleNumber++;
			}else if(resourceType==2){
				//-----Place a numberTile on the field
				if(ntNumber==19) ntNumber--;
				numbers[ntNumber][0] = tx;
				numbers[ntNumber][1] = ty;
				ntNumber++;
			}
			return true;
		}
	}
}