function laplase(){
	cpuActive = true;
	var i, k, j, r=15;//r: how many times it will fight over;
	var topTenIndex;
	var winratio, record=-1, champ=0;

	topTenIndex = getTopTen();

	b.saveb();
	
	for(k=0;k<10;k++){
		winratio = 0;
		for(i=0;i<r;i++){
			
			b.loadb();
			
			b.setStone(topTenIndex[k]);

			while(stateIndex==0){
				if(b.moveCount-b.sm>30){
					winratio++;
					break;
				}
				aiMove(2);
			}
			if(-1==b.currentPlayer*b.sc&&stateIndex!=0){
				winratio+=2;
			}
		}

		b.loadb();
		
		if(winratio==r*2){
			cpuActive = false;
			return topTenIndex[k];
		}
		if(winratio>record){
			champ = k;
			record=winratio;
		}
		console.log("Winning Probability: "+(winratio/2/r*100));
	}
	console.log("champ: "+champ);
	cpuActive = false;
	return topTenIndex[champ];
}