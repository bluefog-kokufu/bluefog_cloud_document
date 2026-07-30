/* ================= clock ================= */
function tickClock(){
  const el=document.getElementById("clockTime");if(!el)return;
  const d=new Date(),p=x=>String(x).padStart(2,"0");
  el.textContent=`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  document.getElementById("clockDate").textContent=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${"日月火水木金土"[d.getDay()]})`;
}
setInterval(tickClock,1000);tickClock();

/* ================= init ================= */
loadDb();
$("#loginPw").addEventListener("keydown",e=>{if(e.key==="Enter")doLogin();});
if(sessionStorage.getItem("bf_login")==="1"){showApp();}
/* demo deep-link: #auto&page=sales&modal=cust */
(function(){
  const h=location.hash.slice(1);
  if(!h||!/(^|&)auto(&|=|$)/.test(h))return;
  const m={};h.split("&").forEach(x=>{const[k,v]=x.split("=");m[k]=v||"";});
  sessionStorage.setItem("bf_login","1");showApp();
  if(m.page&&PAGES[m.page])show(m.page);
  if(m.modal==="cust")custForm();
  else if(m.modal==="sale")saleForm();
  else if(m.modal==="pur")purForm();
  else if(m.modal==="invoice")invoiceView(db.sales[0].id);
  else if(m.modal==="notice")noticeView(db.paymentNotices[0].id);
})();
