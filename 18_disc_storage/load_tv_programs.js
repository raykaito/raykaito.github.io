class TVListManager{
    constructor(){
        this.tvProgramList = new Array();//{title:,hiragana:,discNumber:,row:,rowIndex:}
        this.tvTable = document.getElementById("TVPrograms");
    }
    loadRemoteTxt(url){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200){
            tvManager.loadTVPrograms(this.responseText);
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
            if(Number(a.discNumber)<Number(b.discNumber)) return  1;
            if(Number(a.discNumber)>Number(b.discNumber)) return -1;
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
        const discNumber = newRow.insertCell(1);
        title.innerHTML = tvProgram.title;
        discNumber.innerHTML = tvProgram.discNumber;
        discNumber.setAttribute("align","center");
        tvProgram.row = newRow;
        tvProgram.rowIndex = newRow.rowIndex;
    }
    addDiscNumber(row){
        discScanner.addDiscNumber(Number(row.cells[1].innerText));
    }
    updateTVProgram(){ 
    }
}

console.log("Loaded: load_tv_programs.js");