function getTopTen(){	
	var topTenIndex = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
	var topTenScore = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
	var i, j, score;
	//get top 10;
	for(i=0;i<row*col;i++){
		if(getSide(i)!=0) continue;
		score = b.getScore(b.currentPlayer, true, i);
		for(j=9;j>=0;j--){
			if(topTenIndex[j]==-1){
				if(j!=9){
					topTenIndex[j+1]=topTenIndex[j];
					topTenScore[j+1]=topTenScore[j];
				}
				topTenIndex[j]=i;
				topTenScore[j]=score;
				continue;
			}
			if(score>topTenScore[j]){
				if(j!=9){
					topTenIndex[j+1]=topTenIndex[j];
					topTenScore[j+1]=topTenScore[j];
				}
				topTenIndex[j]=i;
				topTenScore[j]=score;
			}else{
				break;
			}
		}
	}
	return topTenIndex;
}

function analyzeAll(){
	var i;
	for(i=0;i<row*col;i++){
		judge(i);
		updateTile(i);
	}
}

function analyze(index){
	judge(index);
	updateTiles(index);
}

function updateTiles(index){
	var ro, co, i, range, r, c;
	i=0; range=5;
	ro = tor(index);
	co = toc(index);
	for(i=-range;i<=range;i++){
		r=ro+i; c=co;
		if(r>=0&&r<row) updateTile(toi(r,c));
		
		r=ro; c=co+i;
		if(c>=0&&c<col) updateTile(toi(r,c));
		
		r=ro+i; c=co+i;
		if(r>=0&&r<row&&c>=0&&c<col) updateTile(toi(r,c));
		
		r=ro+i; c=co-i;
		if(r>=0&&r<row&&c>=0&&c<col) updateTile(toi(r,c));
	}
}

function updateTile(index){
	if(getSide(index)!=0) return;
	
	var dire, dr, dc, i, lengthRecord, sp, rev;//ScoredPlayer, Reverser
	var nrow, ncol, r, c, score;
	
	r = tor(index); c = toc(index);
	rev = sp = 1;
	
	b.t[index].clear();
	for(sp=1;sp>-3;sp-=2){
		if(sp==1)temp = b.t[index].bscore;
		if(sp!=1)temp = b.t[index].wscore;
		for(rev=1;rev>-3;rev-=2){
			for(dire=0;dire<4;dire++){
				
				lengthRecord = 0;
				aLength = adLength = aPossible = 0;
				bLength = bdLength = bPossible = 0;
				aopen = bopen = adopen = bdopen = false;
				
				switch(dire){
					case  0: dr= 1; dc= 0; break;//Horizontal
					case  1: dr= 0; dc= 1; break;//Vertical
					case  2: dr= 1; dc=-1; break;//Diagonal
					case  3: dr= 1; dc= 1; break;//Diagonal
					default: dr= 0; dc =0;
				}
				for(i=1;i<=5;i++){
					nrow=dr*i+r; ncol=dc*i+c;
					if(nrow>=row || nrow<0) break;
					if(ncol>=col || ncol<0) break;
					if(getSide(toi(nrow,ncol))==-sp*rev) break;
					if(getSide(toi(nrow,ncol))== sp*rev){//Players Stone
						if(aLength==aPossible){
							aLength++;
							adLength++;
						}else if(adLength==(aPossible-1)){
							adLength++;
						}
					}else{											//Empty
						aopen = true;								//XOE
						if(aLength!=adLength) adopen = true;		//XEOE
					}
					aPossible++;
				}
				for(i=-1;i>=-5;i--){
					nrow=dr*i+r; ncol=dc*i+c;
					if(nrow>=row || nrow<0) break;
					if(ncol>=col || ncol<0) break;
					if(getSide(toi(nrow,ncol))==-sp*rev) break;
					if(getSide(toi(nrow,ncol))== sp*rev){
						if(bLength==bPossible){
							bLength++;
							bdLength++;
						}else if(bdLength==(bPossible-1) && (aLength==adLength)){
							bdLength++;
						}
					}else{
						bopen = true;
						if(bLength!=bdLength && (aLength==adLength)) bdopen = true;
					}
					bPossible++;
				}
				length   = aLength   + bLength  ;
				dLength  = adLength  + bdLength ;
				possible = aPossible + bPossible;
				
				if(possible<4) continue;
				if(length>lengthRecord){
					lengthRecord = length;
				}
				if(rev==1){
					if(length>=4) 					 	{temp[1] += 8888;}		//Hit here, you win
					if(length==3  &&(aopen && bopen))	{temp[1] += 2400;}		//Hit here, 4 in row with two open ends
					if(length==3  &&(aopen || bopen))	{temp[1] +=  100;}		//Hit here, 4 in row with one open end
					if(dLength==3 &&   length!=3    )	{temp[1] +=  100;}		//Hit here, 4 in row with one hole
					if(length==2  &&(aopen && bopen))	{temp[1] +=  100;}		//Hit here, 3 in row with two open ends
					if(dLength==2 &&(adopen&&bopen))	{temp[1] +=  100;}		//Hit here, 3 in row with one hole
					if(dLength==2 &&(bdopen&&aopen))	{temp[1] +=  100;}		//Hit here, 3 in row with one hole
				}else{
					if(length>=4) 					 	{temp[1] += 6666;}		//Hit here, you win
					if(length==3  &&(aopen && bopen))	{temp[1] += 1800;}		//Hit here, 4 in row with two open ends
					if(length==3  &&(aopen || bopen))	{temp[1] +=   80;}		//Hit here, 4 in row with one open end
					if(dLength==3 &&   length!=3    )	{temp[1] +=   80;}		//Hit here, 4 in row with one hole
					if(length==2  &&(aopen && bopen))	{temp[1] +=   80;}		//Hit here, 3 in row with two open ends
					if(dLength==2 &&(adopen&&bopen))	{temp[1] +=   80;}		//Hit here, 3 in row with one hole
					if(dLength==2 &&(bdopen&&aopen))	{temp[1] +=   80;}		//Hit here, 3 in row with one hole
					if(adLength==3&&(adopen)&&aLength!=0){temp[1]+= 1800;}		//Hit here, it blocks
					if(bdLength==3&&(bdopen)&&bLength!=0){temp[1]+= 1800;}		//Hit here, it blocks
				}

				if(rev==1){
					temp[1] += lengthRecord*lengthRecord*5;
					temp[0] += lengthRecord*lengthRecord*5;
				}else{
					temp[1] += lengthRecord*lengthRecord*4;
					temp[0] += lengthRecord*lengthRecord*4;
				}
			}
		}
	}
}

function judge(index){
	if(getSide(index)!=b.currentPlayer){
		stateIndex=0;
		return;
	}
	var dire,dr,dc,i,counter;
	var nrow, ncol;
	var freeSpace=0;
	var r = tor(index), c = toc(index);

	for(i=0;i<row*col;i++){
		if(getSide(i)==0) freeSpace++;
	}
	if(freeSpace==0){
		stateIndex = 3;
		return;
	}
	
	for(dire=0;dire<4;dire++){
		counter = 1;
		switch(dire){
			case  0: dr= 1; dc= 0; break;//Horizontal
			case  1: dr= 0; dc= 1; break;//Vertical
			case  2: dr= 1; dc=-1; break;//Diagonal
			case  3: dr= 1; dc= 1; break;//Diagonal
			default: dr= 0; dc =0;
		}
		for(i=1;i<5;i++){
			nrow=dr*i+r; ncol=dc*i+c;
			if(nrow>=row || nrow<0) break;
			if(ncol>=col || ncol<0) break;
			if(getSide(toi(nrow,ncol))!=b.currentPlayer) break;
			counter++;
		}
		for(i=-1;i>-5;i--){
			nrow=dr*i+r; ncol=dc*i+c;
			if(nrow>=row || nrow<0) break;
			if(ncol>=col || ncol<0) break;
			if(getSide(toi(nrow,ncol))!=b.currentPlayer) break;
			counter++;
		}
		if(counter>=5){
			stateIndex = b.currentPlayer==1?1:2;
			return;
		}
	}
}