const posName = ['Professor','Associate Professor','Associate Professor (Lecturer)','Assistant Professor','Specially Appointed Professor','Specially Appointed Associate Professor','Specially Appointed Associate Professor (Lecturer)','Specially Appointed Assistant Professor','Visiting Professor','Visiting Associate Professor','Visiting Associate Professor (Lecturer)','Visiting Assistant Professor','Others'];  
const deptName = ['Mathematics','Physics','Chemistry','Earth and Planetary Sciences','Mechanical Engineering','Systems and Control Engineering','Electrical and Electronic Engineering','Information and Communications Engineering','Industrial Engineering and Economics','Materials Science and Engineering','Chemical Science and Engineering','Mathematical and Computing Science','Computer Science','','Life Science and Technology','Architecture and Building Engineering','','Civil and Environmental Engineering','Transdisciplinary Science and Engineering','Social and Human Sciences','Innovation Science','Technology and Innovation Management','','','',''];
const courseName = ['Mathematics','Physics','Chemistry','Earth and Planetary Sciences','Mechanical Engineering','Systems and Control Engineering','Electrical and Electronic Engineering','Information and Communications Engineering','Industrial Engineering and Economics','Materials Science and Engineering','Chemical Science and Engineering','Mathematical and Computing Science','Computer Science','Artificial Intelligence','Life Science and Technology','Architecture and Building Engineering','Urban Design and Built Environment','Civil Engineering','Global Engineering for Development Environment and Society','Social and Human Sciences','Innovation Science','Technology and Innovation Management','Energy Science and Engineering','Engineering Sciences and Design','Human Centered Science and Biomedical Engineering','Nuclear Engineering'];
const courseNameTab  = ['Mechanical Engineering','Energy Science and Engineering','Engineering Sciences and Design','Human Centered Science and Biomedical Engineering','Nuclear Engineering'];
const lnk1 = "https://search.star.titech.ac.jp/titech-ss/pursuer.act?event=outside&";
const lnk2 = "&lang=jp"

const loadRemoteTxt = function(url) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200)
      txt2Array(this.responseText);
  };
  xhttp.open("GET", url, true);
  xhttp.send();
};

const loadLocalTxt = function(event) {
  const input = event.target;

  const reader = new FileReader();
  reader.onload = function(){
    txt2Array(reader.result);
  };
  reader.readAsText(input.files[0]);
};

const txt2Array = function(txt){
  const arr = txt.split('\n');
  let res = [];
  for(let i = 0; i < arr.length; i++){
    res[i] = arr[i].split('\t');
    if(i>=5&&res[i][0]!=""){
      console.log(res[i]);
      appendProfessor(res[i]);
    }
  }
};

const appendProfessor = function(res,en=false){
  //Append title
  const hea4 = document.createElement("H4");
  const titl = document.createTextNode(res[3]);
  hea4.appendChild(titl);
  document.getElementById("aa").appendChild(hea4);
  //Create the Article
  const arti = document.createElement("ARTICLE");
  //Append professor
  const head = document.createElement("H5");
  const prof = document.createTextNode(res[5+en*6]+" "+res[6+en*6]);
  head.appendChild(prof);
  arti.appendChild(head);
  //Append Links
  const unor = document.createElement("UL");
  const lis1 = document.createElement("LI");
  const lis2 = document.createElement("LI");
  const lin1 = document.createElement("A");
  const lin2 = document.createElement("A");
  const brea = document.createElement("BR");
  const spa1 = document.createElement("SPAN");
  const spa2 = document.createElement("SPAN");
  const dtil = document.createTextNode(en?"Link":"詳細リスト");
  const rsch = document.createTextNode(en?"Researcher Profile":"研究者情報");
  const star = document.createTextNode("(STAR Search)");

  unor.setAttribute('class', 'btn');
  lis1.setAttribute('class', 'link01');
  lis2.setAttribute('class', 'link02');
  lin1.setAttribute('href', res[49]);
  lin1.setAttribute('target', "_blank");
  lin2.setAttribute('href', lnk1+res[51]+lnk2);
  lin2.setAttribute('target', "_blank");

  lin1.appendChild(spa1);
  lin2.appendChild(spa2);
  lin1.appendChild(dtil);
  lin2.appendChild(rsch);
  lin2.appendChild(brea);
  lin2.appendChild(star);
  lis1.appendChild(lin1);
  lis2.appendChild(lin2);
  unor.appendChild(lis1);
  unor.appendChild(lis2);
  arti.appendChild(unor);
  //Append Course
  let string = res[13] + " " + res[15]
  for(let i=17;res[i]!="";i+=4){
    string = string + " / " + res[i] + " " + res[i+2];
  }
  const dfl1 = document.createElement("DL");
  const dft1 = document.createElement("DT");
  const dfd1 = document.createElement("DD");
  const cou1 = document.createTextNode(en?"Major, Department":"担当系・コース");
  const cou2 = document.createTextNode(string);

  dft1.appendChild(cou1);
  dfd1.appendChild(cou2);
  dfl1.appendChild(dft1);
  dfl1.appendChild(dfd1);
  arti.appendChild(dfl1);
  //Append Keywords
  let course = res[41+en]
  for(let i=43+en;res[i]!=""&&i<49;i+=2){
    course += " / " + res[i];
  }
  const dfl2 = document.createElement("DL");
  const dft2 = document.createElement("DT");
  const dfd2 = document.createElement("DD");
  const key1 = document.createTextNode(en?"Research Field":"研究分野");
  const key2 = document.createTextNode(course);

  dft2.appendChild(key1);
  dfd2.appendChild(key2);
  dfl2.appendChild(dft2);
  dfl2.appendChild(dfd2);
  arti.appendChild(dfl2);

  document.getElementById("aa").appendChild(arti);

};

loadRemoteTxt("../faculty.txt");
