function loadXMLDoc(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      
      var arr = this.responseText.split('\n');
      console.log(arr);
      //1次元配列を2次元配列に変換
      var res = [];
      for(var i = 0; i < arr.length; i++){
        //空白行が出てきた時点で終了
        if(arr[i] == '') break;

        //","ごとに配列化
        res[i] = arr[i].split('\t');
      }
      console.log(res);

      document.getElementById("demo").innerHTML = res[0][0];
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}
var openFile = function(event) {
  var input = event.target;

  var reader = new FileReader();
  reader.onload = function(){
    var text = reader.result;
    console.log(reader.result.substring(0, 200));
  };
  reader.readAsText(input.files[0]);
};