class TVListManager{
    constructor(){
        this.tvProgramList = new Array();//{title:,hiragana:,discNumber:,row:,rowIndex:}
        this.tvTable = document.getElementById("TVPrograms");
        this.fInput = document.getElementById("fileInput");
        this.searchBar = document.getElementById("searchBar");
        addEventListener('keyup',()=>{this.updateSearchResult(tvManager);},false);
    }
    loadRemoteTxt(url){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200){
                tvManager.loadTVPrograms(this.responseText);
                tvManager.fInput.style.display = "none";
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
    loadLocalTxt(event) {
        const input = event.target;

        const reader = new FileReader();
        reader.onload = ()=>{
            this.loadTVPrograms(reader.result);
        };
        reader.readAsText(input.files[0]);
    }
    loadTVPrograms(txt){
        const arr = txt.split('\n');
        for(let i = 1; i < arr.length; i++){
            const tvProgramTemp = arr[i].split('\t');
            if(tvProgramTemp==""){
              break;
            }
            this.tvProgramList[i-1] = {     title:tvProgramTemp[0],
                                         hiragana:tvProgramTemp[1],
                                       discNumber:tvProgramTemp[2]};
        }
        this.tvProgramList.sort(function(a,b){
            if(a.hiragana<b.hiragana) return 1;
            if(a.hiragana>b.hiragana) return -1;
            return 0;
        })
        for(let i=0;i<this.tvProgramList.length;i++){
            this.appendTVProgram(this.tvProgramList[i]);
        }
        console.log(this.tvProgramList);
    }
    appendTVProgram(tvProgram){
        const newRow = this.tvTable.insertRow(1);
        newRow.setAttribute("onclick","tvManager.addDiscNumber(this)");

        const title = newRow.insertCell(0);
        title.innerHTML = tvProgram.title;
        title.setAttribute("align","left");
        
        const discNumber = newRow.insertCell(1);
        discNumber.innerHTML = tvProgram.discNumber;
        discNumber.setAttribute("align","center");
        
        tvProgram.row = newRow;
        tvProgram.rowIndex = newRow.rowIndex;
    }
    addDiscNumber(row){
        const title = row.cells[0].innerText;
        const discNumber = Number(row.cells[1].innerText);
        alert("[ "+title+" ] ディスクの番号は "+discNumber+" です")
        discScanner.addDiscNumber(discNumber);
    }
    updateSearchResult(tvManager){
        const tv = tvManager;
        const targetText = tv.searchBar.value;
        const targetTextKatakana = tv.hiraganaToKatakana(targetText);
        console.log(tv.tvProgramList);
        for(let tvProgramIndex = 0;tvProgramIndex<tv.tvProgramList.length;tvProgramIndex++){
            const foundOnTitle          = tv.tvProgramList[tvProgramIndex].title.search(targetText)+1;
            const foundOnTitleKata      = tv.tvProgramList[tvProgramIndex].title.search(targetTextKatakana)+1;
            const foundOnHiragana       = tv.tvProgramList[tvProgramIndex].hiragana.search(targetText)+1;
            const foundOnHiraganaKata   = tv.tvProgramList[tvProgramIndex].hiragana.search(targetTextKatakana)+1;
            if(foundOnTitle+foundOnHiragana+foundOnTitleKata+foundOnHiraganaKata>0){
                tv.tvProgramList[tvProgramIndex].row.style.display = "table-row";
            }else{
                tv.tvProgramList[tvProgramIndex].row.style.display = "none";
            }
        }
    }
    hiraganaToKatakana(str){
        return str.replace(/[\u3041-\u3096]/g,function(match){
            const chr = match.charCodeAt(0) + 0x60;
            return String.fromCharCode(chr);
        });
    }
}

console.log("Loaded: load_tv_programs.js");