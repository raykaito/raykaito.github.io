var colorL = ["black", "purple", "blue", "lightgreen", "cyan", "yellow", "red"]
var xoffsetL = [-1,1,-1,1,1,0,-1,0];
var yoffsetL = [-1,1,1,-1,0,1,0,-1];
var digitd = [
	111101101101111,
	110010010010111,
	111001111100111,
	111001111001111,
	101101111001001,
	111100111001111,
	111100111101111,
	111001001001001,
	111101111101111,
	111101111001001,];

function Cell(num, xi, yi){
	var number = num;
	var counts = 0;
	var x = xi;
	var y = yi;
	var digit = false;

	this.draw = function(){
		//Cell Background
		ct.beginPath();
		ct.rect((x+0.5)*cellLeg-sqLargeLeg/2, (y+0.5)*cellLeg-sqLargeLeg/2,sqLargeLeg,sqLargeLeg);
		if(gameover){
			if(digit){
				ct.fillStyle = "rgb(225,225,225)";
			}else{
				ct.fillStyle = "rgb(128,128,128)";
			}
		}else{
			if(number==0) ct.fillStyle = "rgb(48 ,48 , 48)";
			if(number> 0) ct.fillStyle = "rgb(128,128,128)";
			if(number< 0) ct.fillStyle = "rgb(128,  0,  0)";
		}
		ct.fill();

		if(number<0&&gameover) return;
		//Draw the Dots
		if(Math.abs(number) == 1){
			ct.beginPath();
			ct.rect((x+0.5)*cellLeg-sqSmallLeg/2, (y+0.5)*cellLeg-sqSmallLeg/2, sqSmallLeg, sqSmallLeg);
			ct.fillStyle = "white";
			ct.fill();
		}else{
			for(var i=0;i<Math.abs(number);i++){
				ct.beginPath();
				ct.rect((x+0.5)*cellLeg-sqSmallLeg/2+xoffsetL[i]*sqCenter/2, (y+0.5)*cellLeg-sqSmallLeg/2+yoffsetL[i]*sqCenter/2, sqSmallLeg, sqSmallLeg);
				ct.fillStyle = "white";
				ct.fill();
			}
		}
		//Draw Counts
		if(Math.abs(number) == 1 && counts == 1){
			ct.beginPath();
			ct.rect((x+0.5)*cellLeg-sqSmallLeg/2, (y+0.5)*cellLeg-sqSmallLeg/2, sqSmallLeg, sqSmallLeg);
			ct.fillStyle = "black";
			ct.fill();
		}else{
			for(var i=0;i<Math.abs(counts);i++){
				ct.beginPath();
				ct.rect((x+0.5)*cellLeg-sqSmallLeg/2+xoffsetL[i]*sqCenter/2, (y+0.5)*cellLeg-sqSmallLeg/2+yoffsetL[i]*sqCenter/2, sqSmallLeg, sqSmallLeg);
				ct.fillStyle = "black";
				ct.fill();
			}
		}
	};

	this.countDot = function(){
		if(counts<number){
			counts++;
			this.draw();
			return true;
		}else{
			return false;
		}
	};

	this.setDigit = function(digitIn){
		digit = digitIn;
		this.draw();
	};

	this.number = function(){
		return number;
	};

	this.die = function(){
		this.setNum(-1);
	};

	this.shatter = function(){
		if(number<=1) return;
		if(x<=0 || x>=(getCol()-1)) return;
		if(y<=0 || y>=(getRow()-1)) return;
		for(var i=0;i<Math.abs(number);i++){
			if(cellNumber(x+xoffsetL[i],y+yoffsetL[i])!=0) return;
		}
		for(var i=0;i<Math.abs(number);i++){
			spawnCell(x+xoffsetL[i],y+yoffsetL[i],1);
		}
		this.setNum(0);
	}

	this.multiply = function(xi,yi){
		if(number<0) return;
		if(cellNumber(xi ,yi)!=0) return;
		if(number==1){
			this.setNum(0);
			spawnCell(xi,yi,1);
		}else{
			this.setNum(number/2);
			spawnCell(xi,yi,number);
		}
	};

	this.setNum = function(num){
		if(number<0) return;
		number = Math.floor(num);
		this.draw();
	};

	this.gainXp = function(){
		if(number==0) return;

		//Negative Number (Dead)
		if(number==-8){
			for(var i=0;i<8;i++){
				xo = xoffsetL[i]+x;
				yo = yoffsetL[i]+y;
				spawnCell(xo, yo, -1);
			}
			return;
		}

		//Positive Number (Alive)
		if(number==8){
			for(var i=0;i<8;i++){
				xo = xoffsetL[i]+x;
				yo = yoffsetL[i]+y;
				spawnCell(xo, yo, 1, true);
			}
			this.die();
			return;
		}
		number*=2;
		this.draw();
	};

}

console.log("Loaded: cell.js");