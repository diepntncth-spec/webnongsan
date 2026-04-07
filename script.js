```javascript
let vuons = []
let nongsans = []
let los = []

function themVuon(){

let ten = document.getElementById("tenVuon").value
let diachi = document.getElementById("diaChi").value

let vuon = {

id: Date.now(),
ten: ten,
diachi: diachi

}

vuons.push(vuon)

capNhatVuon()

}

function capNhatVuon(){

let html=""

vuons.forEach(v=>{

html += `<option value="${v.id}">${v.ten}</option>`

})

document.getElementById("vuonSelect").innerHTML = html

}

function themNongSan(){

let ten = document.getElementById("tenNongSan").value
let loai = document.getElementById("loaiNongSan").value

let ns = {

id: Date.now(),
ten: ten,
loai: loai

}

nongsans.push(ns)

capNhatNongSan()

}

function capNhatNongSan(){

let html=""

nongsans.forEach(n=>{

html += `<option value="${n.id}">${n.ten}</option>`

})

document.getElementById("nongSanSelect").innerHTML = html

}

function themLo(){

let vuon = document.getElementById("vuonSelect").value
let ns = document.getElementById("nongSanSelect").value
let sl = document.getElementById("soLuong").value

let lo = {

id: Date.now(),
vuon: vuon,
nongsan: ns,
soluong: sl

}

los.push(lo)

hienThiLo()

}

function hienThiLo(){

let html=""

los.forEach(l=>{

let v = vuons.find(x=>x.id==l.vuon)
let n = nongsans.find(x=>x.id==l.nongsan)

html += `
<li>

${n.ten} - ${v.ten} - SL: ${l.soluong}

<button onclick="baoGiaMao(${l.id})">Báo giả mạo</button>

</li>
`

})

document.getElementById("dsLo").innerHTML = html

}

function baoGiaMao(id){

alert("⚠️ Lô này bị báo giả mạo!")

}
```
