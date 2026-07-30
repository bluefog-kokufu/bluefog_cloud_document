"use strict";
/* ================= state ================= */
const DEFAULT_DB = {
  profile:{name:"ユーザー企業 ご担当者", email:"user@user.com", pw:"password"},
  settings:{taxRate:10, rounding:"floor",
    company:{name:"ユーザー企業株式会社", regNo:"T1234567890123", zip:"600-0000",
      addr:"京都府京都市中京区〇〇町1-2-3", tel:"075-000-0000",
      bank:"〇〇銀行 △△支店 普通 1234567 ユーザーキギヨウ(カ"}},
  customers:[
    {id:"c1", name:"test1株式会社", person:"山田 太郎", email:"info@test1.co.jp", tel:"03-0000-0000", addr:"東京都千代田区1-1-1", site:"月末締め翌月末払い", regNo:"T9876543210987", memo:""},
    {id:"c2", name:"サンプル商事株式会社", person:"佐藤 花子", email:"sato@sample.co.jp", tel:"06-0000-0000", addr:"大阪府大阪市北区2-2-2", site:"20日締め翌月10日払い", regNo:"", memo:""}
  ],
  sales:[
    {id:"01h04cdeeq8pgxgswe8ab7qb83", date:"2026-05-11", custId:"c1", method:"現金", amount:55000, tax:5500, status:"請求済", invoiced:"", memo:""},
    {id:"01h10apet73rdvnymkzqf3wq5f", date:"2026-05-21", custId:"c1", method:"現金", amount:132000, tax:13200, status:"請求済", invoiced:"2026-05-21 23:37", memo:""}
  ],
  purchases:[
    {id:"5bzsfdnj2", date:"2026-05-21", custId:"c1", method:"現金", amount:88000, tax:8800, up:"2026-05-21", status:"支払い済", files:{}, memo:""},
    {id:"8jfrhv3ms", date:"2026-05-16", custId:"c1", method:"普通預金", amount:46200, tax:4620, up:"2026-05-16", status:"支払い済", files:{}, memo:""},
    {id:"85tagbt6s", date:"2026-05-15", custId:"c1", method:"現金", amount:27500, tax:2750, up:"2026-05-15", status:"支払い済", files:{}, memo:""}
  ],
  ledger:{date:"2026-05-02", rows:[{no:"test1", m:"1", d:"3", acct:"売掛金", note:"商品売上", page:"1", dr:55000, cr:0}]},
  bs:{date:"2026-08-16",
    assets:[{name:"現金及び預金", v:3550000},{name:"売掛金", v:1450000},{name:"固定資産", v:5500000}],
    liabs:[{name:"買掛金", v:980000},{name:"長期借入金", v:3200000}],
    equity:[{name:"資本金", v:5000000},{name:"利益剰余金", v:1320000}]},
  pl:{from:"2026-01-01", to:"2026-12-31",
    rows:[{name:"売上高", type:"収益", v:12800000},{name:"売上原価", type:"費用", v:6400000},{name:"販売費及び一般管理費", type:"費用", v:3200000}]},
  cf:{from:"2026-01-01", to:"2026-12-31", beg:2100000,
    op:[{name:"税引前当期純利益", v:3450000}],
    inv:[{name:"有形固定資産の取得による支出", v:-1200000}],
    fin:[{name:"長期借入金の返済による支出", v:-800000}]},
  paymentNotices:[
    {id:"SC-20260701-001", custId:"c1", title:"6月分お支払いのご案内", payDate:"2026-07-31", created:"2026-07-01",
     items:[{date:"2026-06-30", item:"業務委託料(6月分)", price:120000, unit:"式", qty:1, tax:"外税"},
            {date:"2026-06-30", item:"交通費実費", price:3200, unit:"式", qty:1, tax:"非課税"}]}
  ],
  masters:{m_landlords:[], m_contractors:[], m_repairers:[], m_agents:[], m_insurers:[]}
};
let db;
const LS_KEY="bluefog_cloud_db_v1";
function loadDb(){
  try{const s=localStorage.getItem(LS_KEY); if(s){db=JSON.parse(s);}}catch(e){}
  if(!db)db=JSON.parse(JSON.stringify(DEFAULT_DB));
  /* migration for saved data from older versions */
  if(!db.paymentNotices)db.paymentNotices=JSON.parse(JSON.stringify(DEFAULT_DB.paymentNotices));
  if(!db.masters)db.masters=JSON.parse(JSON.stringify(DEFAULT_DB.masters));
}
function save(){ try{localStorage.setItem(LS_KEY, JSON.stringify(db));}catch(e){} }

/* ================= helpers ================= */
const $=s=>document.querySelector(s);
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function yen(n){n=Number(n)||0;return "¥"+n.toLocaleString("ja-JP");}
function num(n){n=Number(n)||0;return n.toLocaleString("ja-JP");}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function today(){const d=new Date();return d.toISOString().slice(0,10);}
function nowStamp(){const d=new Date();const p=x=>String(x).padStart(2,"0");return `${d.getFullYear()}.${p(d.getMonth()+1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function dotDate(s){return s?s.replaceAll("-","."):"";}
function custName(id){const c=db.customers.find(c=>c.id===id);return c?c.name:"(削除済み)";}
function calcTax(amount){
  const r=Number(db.settings.taxRate)/100, raw=amount*r, m=db.settings.rounding;
  return m==="ceil"?Math.ceil(raw):m==="round"?Math.round(raw):Math.floor(raw);
}
function csvDownload(filename, rows){
  const csv=rows.map(r=>r.map(c=>{c=String(c==null?"":c);return /[",\n]/.test(c)?'"'+c.replaceAll('"','""')+'"':c;}).join(",")).join("\r\n");
  const blob=new Blob(["﻿"+csv],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}
function openModal(html){$("#modalBox").innerHTML=html;$("#modalBg").classList.add("open");}
function closeModal(){$("#modalBg").classList.remove("open");}
$("#modalBg") && document.addEventListener("click",e=>{if(e.target.id==="modalBg")closeModal();});
/* ================= auth ================= */
function doLogin(){
  const em=$("#loginEmail").value.trim(), pw=$("#loginPw").value;
  if(em===db.profile.email && pw===db.profile.pw){
    sessionStorage.setItem("bf_login","1");
    showApp();
  }else{
    $("#loginErr").textContent="メールアドレスまたはパスワードが正しくありません。";
  }
}
function logout(){sessionStorage.removeItem("bf_login");location.reload();}
function showApp(){
  $("#loginView").style.display="none";$("#app").style.display="block";
  $("#userLabel").textContent=db.profile.name+"("+db.profile.email+")";
  show("home");
}
/* ================= router ================= */
const PAGES={};
function show(page){
  document.querySelectorAll("#sideNav a").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
  PAGES[page]();
  window.scrollTo(0,0);
}
document.querySelectorAll("#sideNav a").forEach(a=>a.onclick=()=>show(a.dataset.page));
function crumb(label){return `<div class="crumb"><a onclick="show('home')">ホーム</a> / ${label}</div>`;}


