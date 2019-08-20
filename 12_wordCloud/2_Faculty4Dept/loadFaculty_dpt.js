const posCode = ['001','002','003','004','005','006','007','008','009','010','011','012'];
const posName = ['教授','准教授','講師','助教','特任教授','特任准教授','特任講師','特任助教','特定教授','特定准教授','特定講師','特定助教'];
const posName_en = ['Professor','Associate Professor','Associate Professor (Lecturer)','Assistant Professor','Specially Appointed Professor','Specially Appointed Associate Professor','Specially Appointed Associate Professor (Lecturer)','Specially Appointed Assistant Professor','Visiting Professor','Visiting Associate Professor','Visiting Associate Professor (Lecturer)','Visiting Assistant Professor','Others'];  

const deptCode = ['011','012','013','014','015','016','017','018','019','020','021','022','023','','024','025','','026','027','028','029','030','','','',''];
const deptName = ['数学系','物理学系','化学系','地球惑星科学系','機械系','システム制御系','電気電子系','情報通信系','経営工学系','材料系','応用化学系','数理・計算科学系','情報工学系','','生命理工学系','建築学系','','土木・環境工学系','融合理工学系','社会・人間科学系','イノベーション科学系','技術経営専門職学位課程','','','',''];
const deptName_en = ['Mathematics','Physics','Chemistry','Earth and Planetary Sciences','Mechanical Engineering','Systems and Control Engineering','Electrical and Electronic Engineering','Information and Communications Engineering','Industrial Engineering and Economics','Materials Science and Engineering','Chemical Science and Engineering','Mathematical and Computing Science','Computer Science','','Life Science and Technology','Architecture and Building Engineering','','Civil and Environmental Engineering','Transdisciplinary Science and Engineering','Social and Human Sciences','Innovation Science','Technology and Innovation Management','','','',''];

const courseCode = ['011','012','013','014','015','016','017','018','019','020','021','022','023','005','024','025','006','026','027','028','029','030','001','002','003','004'];
const courseName = ['数学コース','物理学コース','化学コース','地球惑星科学コース','機械コース','システム制御コース','電気電子コース','情報通信コース','経営工学コース','材料コース','応用化学コース','数理・計算科学コース','情報工学コース','知能情報コース','生命理工学コース','建築学コース','都市・環境学コース','土木工学コース','地球環境共創コース','社会・人間科学コース','イノベーション科学コース','技術経営専門職学位課程','エネルギーコース','エンジニアリングデザインコース','ライフエンジニアリングコース','原子核工学コース'];
const courseName_en = ['Mathematics','Physics','Chemistry','Earth and Planetary Sciences','Mechanical Engineering','Systems and Control Engineering','Electrical and Electronic Engineering','Information and Communications Engineering','Industrial Engineering and Economics','Materials Science and Engineering','Chemical Science and Engineering','Mathematical and Computing Science','Computer Science','Artificial Intelligence','Life Science and Technology','Architecture and Building Engineering','Urban Design and Built Environment','Civil Engineering','Global Engineering for Development Environment and Society','Social and Human Sciences','Innovation Science','Technology and Innovation Management','Energy Science and Engineering','Engineering Sciences and Design','Human Centered Science and Biomedical Engineering','Nuclear Engineering'];

const lnk1 = "https://search.star.titech.ac.jp/titech-ss/pursuer.act?event=outside&";
const lnk2 = "&lang=jp";
const lnk2_en = "&lang=en";

const sections = ['あ','aa','か','ka','さ','sa','た','ta','な','na','は','ha','ま','ma','や','ya','ら','ra','わ','wa'];
const sectionLimits_en = ['F','K','P','U'];
const sectionIDs_en = ['ae','fj','ko','pt','uz'];
const sectionTitles_en = ['A - E','F - J','K - O','P - T','U - Z'];

let department = -1;

const loadRemoteTxt = function(url, en = false) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
      txt2Array(this.responseText, en);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
};

const loadLocalTxt = function(event, en = false) {
  const input = event.target;

  const reader = new FileReader();
  reader.onload = function(){
    txt2Array(reader.result, en);
  };
  reader.readAsText(input.files[0]);
};

const txt2Array = function(txt, en){
  const arr = txt.split('\n');
  let temp = [];
  let res = [];
  let counter = 0;
  for(let i = 0; i < arr.length; i++){
    temp[i] = arr[i].split('\t');
    if(i>=5&&temp[i].length>5&&temp[i][5]!=""){
      res[counter] = temp[i];
      counter++;
    }
  }
  if(en){
    loadFaculty_en(res);
  }else{
    loadFaculty(res)
  }
};

const loadFaculty = function(res){
  let currentSection="";
  let currentSectionElement="";
  const main = document.getElementById("main");
  console.log(res.length);
  for(let i=0;i<res.length;i++){
    //Check for the new Section
    if(res[i][7]!=currentSection){
      currentSection=res[i][7];
      currentSectionElement = createSection(res[i][7], main);
    }
    appendProfessor(res[i],currentSectionElement,false);
    console.log(i+","+res[i][5]);
  }  
};

const createSection = function(newSection, main){
  //find newID
  let i=0;
  for(;i<sections.length;i++){
    if(newSection==sections[i]) break;
  }
  const id = sections[i+1];
  //create new element
  const sect = document.createElement("SECTION");
  const head = document.createElement("H3");
  const text = document.createTextNode("教員名："+newSection+"行");
  sect.setAttribute("id",id);
  sect.setAttribute("class","tabContents");
  head.setAttribute("class","bgGreen");
  //head.appendChild(text);
  //sect.appendChild(head);
  main.appendChild(sect);
  return sect;
};

const loadFaculty_en = function(res){
  //Sort Professors in Alphabetical Order
  res.sort(function(a,b){
    if(a[12]+" "+a[11]<b[12]+" "+b[11]) return -1;
    if(a[12]+" "+a[11]>b[12]+" "+b[11]) return  1;
    return 0;
  })
  let currentSectionIndex=-1;
  let currentSectionElement="";
  const main = document.getElementById("main");

  for(let i=0;i<res.length;i++){
    //Check if new Section is needed or not
    if(currentSectionIndex!=getCurrentSectionIndex_en(res[i][12])){
      currentSectionIndex=getCurrentSectionIndex_en(res[i][12]);
      currentSectionElement = createSection_en(currentSectionIndex, main);
    }
    appendProfessor(res[i],currentSectionElement,true);
      console.log(res[i]);
  }  
};

const getCurrentSectionIndex_en = function(lastName){
  let i=0;
  for(;i<sectionLimits_en.length;i++){
    if(lastName<sectionLimits_en[i]) break;
  }
  return i;
}

const createSection_en = function(newSectionIndex, main){
  const id = sectionIDs_en[newSectionIndex];
  //create new element
  const sect = document.createElement("SECTION");
  const head = document.createElement("H3");
  const text = document.createTextNode(sectionTitles_en[newSectionIndex]);
  sect.setAttribute("id",id);
  sect.setAttribute("class","tabContents");
  head.setAttribute("class","bgGreen");
  //head.appendChild(text);
  //sect.appendChild(head);
  main.appendChild(sect);
  return sect;
};

const appendProfessor = function(res,sect,en=false){
  if(wrongDepartment(res)) return;
  const primary = checkIfPrimary(res);
  //Append title
  const hea4 = document.createElement("H4");
  const titl = document.createTextNode(getPos(res[4],en));
  hea4.appendChild(titl);
  sect.appendChild(hea4);
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
  lin2.setAttribute('href', (lnk1+res[51]+(en?lnk2_en:lnk2)));
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
  const dfl1 = document.createElement("DL");
  const dft1 = document.createElement("DT");
  const dfd1 = document.createElement("DD");
  const cou1 = document.createTextNode(en?"Energy Course":"エネルギ―コース");
  const cou2 = document.createTextNode(primary?(en?"Primary":"主担当"):(en?"Secondary":"副担当"));

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

  //Append Location
  const dfl3 = document.createElement("DL");
  const dft3 = document.createElement("DT");
  const dfd3 = document.createElement("DD");
  const loc1 = document.createTextNode(en?"Office Location":"居所");
  const loc2 = document.createTextNode(res[55+en*2]+" "+res[56+en*2]);

  dft3.appendChild(loc1);
  dfd3.appendChild(loc2);
  dfl3.appendChild(dft3);
  dfl3.appendChild(dfd3);
  arti.appendChild(dfl3);

  sect.appendChild(arti);

};

const wrongDepartment = function(res){
  for(let i=14;res[i]!="";i+=4){
    if(parseInt(res[i+2])==1){
      return parseInt(res[i])!=department;
    }
  }
}

const checkIfPrimary = function(res){
  return parseInt(res[16])==1;
}

const getCodeIndex = function(codeArray,targetValue){
  let i=0;
  for(;i<codeArray.length;i++){
    if(parseInt(codeArray[i])==parseInt(targetValue)) return i;
  }
  console.log("desired code not found.");
  console.log("target Value: "+targetValue);
  console.log("code Array  : "+codeArray);
  return -1;
};

const getPos = function(code,en=false){
  if(en)return posName_en[getCodeIndex(posCode,code)];
  else  return posName[getCodeIndex(posCode,code)];
};

const getDept = function(code,en=false){
  if(en)return deptName_en[getCodeIndex(deptCode,code)];
  else  return deptName[getCodeIndex(deptCode,code)];
};

const getCourse = function(code,en=false){
  if(en)return courseName_en[getCodeIndex(courseCode,code)];
  else  return courseName[getCodeIndex(courseCode,code)];
};