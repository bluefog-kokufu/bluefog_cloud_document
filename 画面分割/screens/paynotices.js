/* ================= 支払通知書 ================= */
let payF={from:"",to:""}, payEditId=null;
function noticeCalc(n){
  let sub=0,tax=0;
  (n.items||[]).forEach(it=>{
    const a=(Number(it.price)||0)*(Number(it.qty)||0);
    sub+=a; if(it.tax==="外税")tax+=calcTax(a);
  });
  return {sub,tax,total:sub+tax};
}
PAGES.paynotices=function(){
  const list=db.paymentNotices.filter(n=>{
    if(payF.from&&n.payDate<payF.from)return false;
    if(payF.to&&n.payDate>payF.to)return false;
    return true;
  }).sort((a,b)=>(b.created||"").localeCompare(a.created||""));
  $("#page").innerHTML=`
    ${crumb("支払通知書一覧")}
    <h2 class="pagettl">支払通知書一覧</h2>
    <div class="panel">
      <div class="toolbar">
        支払日: <input type="date" id="nF" value="${esc(payF.from)}" style="width:150px">
        〜 <input type="date" id="nT" value="${esc(payF.to)}" style="width:150px">
        <button class="btn small" onclick="payF={from:$('#nF').value,to:$('#nT').value};show('paynotices')">絞り込み</button>
        <span style="flex:1"></span>
        <button class="btn ghost small" onclick="payEditId=null;show('payform')">支払通知書作成</button>
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="list">
          <tr><th>通知番号</th><th>件名</th><th>支払日</th><th class="num">合計金額</th><th>作成日</th><th>取引先</th><th>操作</th></tr>
          ${list.map(n=>{const c=noticeCalc(n);return `<tr>
            <td><a onclick="noticeView('${n.id}')">${esc(n.id)}</a></td>
            <td>${esc(n.title)}</td>
            <td>${dotDate(n.payDate)}</td>
            <td class="num">${yen(c.total)}</td>
            <td>${dotDate(n.created)}</td>
            <td>${esc(custName(n.custId))}</td>
            <td><button class="icon-btn" title="表示" onclick="noticeView('${n.id}')">📄</button>
                <button class="icon-btn" title="編集" onclick="payEditId='${n.id}';show('payform')">✎</button>
                <button class="icon-btn" title="削除" onclick="noticeDel('${n.id}')">🗑</button></td>
          </tr>`;}).join("")||`<tr><td colspan="7" class="muted">データがありません</td></tr>`}
        </table>
        <div class="pager"><button>&lt;</button><button class="cur">1</button><button>&gt;</button></div>
      </div>
    </div>`;
};
function noticeDel(id){if(confirm("この支払通知書を削除しますか?")){db.paymentNotices=db.paymentNotices.filter(n=>n.id!==id);save();show("paynotices");}}
let payDraft=null;
PAGES.payform=function(){
  if(payEditId){
    const src=db.paymentNotices.find(n=>n.id===payEditId);
    if(!payDraft||payDraft.id!==payEditId)payDraft=JSON.parse(JSON.stringify(src));
  }else if(!payDraft||payDraft._saved||db.paymentNotices.find(n=>n.id===payDraft.id)){
    payDraft={id:autoNoticeNo(), custId:"", title:"", payDate:today(), created:today(), items:[]};
  }
  const co=db.settings.company, c=noticeCalc(payDraft);
  $("#page").innerHTML=`
    ${crumb("支払通知書作成")}
    <h2 class="pagettl">← 支払通知書${payEditId?"編集":"作成"}</h2>
    <div class="panel">
      <div class="card">
        <div class="secttl"><span class="n">1</span>取引先情報</div>
        <div class="field"><label><span class="req">必須</span>取引先名</label>
          <select id="nf_cust">${custOptions(payDraft.custId)}</select></div>
      </div>
      <div class="card">
        <div class="secttl"><span class="n">2</span>事業者情報</div>
        <div style="font-size:13px"><b>${esc(co.name)}</b><br><span class="muted">〒${esc(co.zip)} ${esc(co.addr)}</span></div>
      </div>
      <div class="card">
        <div class="secttl"><span class="n">3</span>入金口座情報 <button class="btn ghost small" onclick="bankEdit()">編集 預金口座情報</button></div>
        <div style="font-size:13px">${esc(co.bank)||'<span style="color:var(--danger)">銀行情報を更新してください</span>'}</div>
      </div>
      <div class="card">
        <div class="secttl"><span class="n">4</span>基本情報</div>
        <div class="grid2">
          <div class="field"><label>支払日</label><input type="date" id="nf_date" value="${esc(payDraft.payDate)}"></div>
          <div class="field"><label>支払通知書番号</label><input value="${esc(payDraft.id)}" readonly style="background:#eef2f8"><div class="muted">自動番号発行</div></div>
        </div>
        <div class="field"><label>件名</label><input id="nf_title" value="${esc(payDraft.title)}"></div>
      </div>
      <div class="card">
        <div class="secttl"><span class="n">5</span>明細情報</div>
        <div class="right"><button class="btn ghost small" onclick="payItemAdd()">明細を新規登録</button></div>
        <div style="overflow-x:auto">
        <table class="sheet" id="payItems">
          <tr><th>日付<span class="req" style="margin-left:4px">必須</span></th><th>品目<span class="req" style="margin-left:4px">必須</span></th><th>単価<span class="req" style="margin-left:4px">必須</span></th><th>単位</th><th>数量<span class="req" style="margin-left:4px">必須</span></th><th>消費税</th><th>金額</th><th></th></tr>
          ${payDraft.items.map((it,i)=>`<tr>
            <td><input type="date" data-i="${i}" data-k="date" value="${esc(it.date)}" style="width:140px"></td>
            <td><input data-i="${i}" data-k="item" value="${esc(it.item)}" style="min-width:160px"></td>
            <td><input type="number" data-i="${i}" data-k="price" value="${it.price||""}" style="width:110px;text-align:right"></td>
            <td><input data-i="${i}" data-k="unit" value="${esc(it.unit)}" style="width:60px"></td>
            <td><input type="number" data-i="${i}" data-k="qty" value="${it.qty||""}" style="width:70px;text-align:right"></td>
            <td><select data-i="${i}" data-k="tax" style="width:90px"><option ${it.tax==="外税"?"selected":""}>外税</option><option ${it.tax==="非課税"?"selected":""}>非課税</option></select></td>
            <td class="num" style="padding:4px 8px">${num((Number(it.price)||0)*(Number(it.qty)||0))}</td>
            <td><button class="icon-btn" onclick="payItemDel(${i})">🗑</button></td>
          </tr>`).join("")||`<tr><td colspan="8" class="muted" style="text-align:center;padding:14px">明細がありません。「明細を新規登録」で追加してください。</td></tr>`}
        </table>
        </div>
        <table class="sheet" style="max-width:360px;margin-left:auto;margin-top:12px">
          <tr><td>小計</td><td class="num" style="padding:4px 8px;width:160px">${yen(c.sub)}</td></tr>
          <tr><td>消費税(外税)</td><td class="num" style="padding:4px 8px">${yen(c.tax)}</td></tr>
          <tr><td class="total">合計(税込み)</td><td class="total num" style="padding:4px 8px">${yen(c.total)}</td></tr>
        </table>
      </div>
      <div class="formfoot">
        <button class="btn ghost" onclick="payDraft=null;payEditId=null;show('paynotices')">キャンセル</button>
        <button class="btn" onclick="noticeSave()">${payEditId?"更新":"作成"}</button>
      </div>
    </div>`;
  $("#nf_cust").addEventListener("change",e=>payDraft.custId=e.target.value);
  $("#nf_date").addEventListener("change",e=>payDraft.payDate=e.target.value);
  $("#nf_title").addEventListener("input",e=>payDraft.title=e.target.value);
  $("#payItems").addEventListener("change",e=>{
    const i=e.target.dataset.i;if(i==null)return;
    const k=e.target.dataset.k;
    payDraft.items[i][k]=(k==="price"||k==="qty")?Number(e.target.value)||0:e.target.value;
    payDraft.custId=$("#nf_cust").value;payDraft.payDate=$("#nf_date").value;payDraft.title=$("#nf_title").value;
    show("payform");
  });
};
function autoNoticeNo(){
  const d=today().replaceAll("-","");
  const n=db.paymentNotices.filter(x=>x.id.includes(d)).length+1;
  return `SC-${d}-${String(n).padStart(3,"0")}`;
}
function payItemAdd(){payDraft.custId=$("#nf_cust").value;payDraft.payDate=$("#nf_date").value;payDraft.title=$("#nf_title").value;
  payDraft.items.push({date:today(),item:"",price:0,unit:"式",qty:1,tax:"外税"});show("payform");}
function payItemDel(i){payDraft.items.splice(i,1);show("payform");}
function noticeSave(){
  payDraft.custId=$("#nf_cust").value;payDraft.payDate=$("#nf_date").value;payDraft.title=$("#nf_title").value;
  if(!payDraft.custId){alert("取引先名は必須です。");return;}
  if(!payDraft.items.length){alert("明細を1件以上登録してください。");return;}
  for(const it of payDraft.items){if(!it.date||!it.item||!it.price||!it.qty){alert("明細の必須項目(日付・品目・単価・数量)を入力してください。");return;}}
  if(payEditId){
    const i=db.paymentNotices.findIndex(n=>n.id===payEditId);
    db.paymentNotices[i]=payDraft;
  }else{
    db.paymentNotices.push(payDraft);
  }
  payDraft._saved=true;save();payEditId=null;payDraft=null;show("paynotices");
}
function noticeHtml(n){
  const cust=db.customers.find(x=>x.id===n.custId)||{name:"(削除済み)",addr:""};
  const co=db.settings.company, c=noticeCalc(n);
  return `
  <div class="invoice">
    <h1>支払通知書</h1>
    <div class="inv-head">
      <div>
        <div style="font-size:15px;font-weight:700;border-bottom:1px solid #333;padding-bottom:4px;margin-bottom:6px">${esc(cust.name)} 御中</div>
        <div class="muted">${esc(cust.addr)}</div>
        <div style="margin-top:14px">下記のとおりお支払いいたします。</div>
        <div class="inv-total">お支払金額(税込) ${yen(c.total)}</div>
        <div style="margin-top:8px;font-size:13px">お支払日:${dotDate(n.payDate)}</div>
      </div>
      <div style="text-align:right;font-size:12px">
        <div>通知番号:${esc(n.id)}</div>
        <div>作成日:${dotDate(n.created)}</div>
        <div style="margin-top:10px;font-weight:700;font-size:14px">${esc(co.name)}</div>
        <div>〒${esc(co.zip)} ${esc(co.addr)}</div>
        <div>TEL:${esc(co.tel)}</div>
        <div>登録番号:${esc(co.regNo)}</div>
      </div>
    </div>
    ${n.title?`<div style="font-size:13px;margin-bottom:6px">件名:${esc(n.title)}</div>`:""}
    <table class="inv">
      <tr><th>日付</th><th style="width:40%">品目</th><th class="num">単価</th><th>単位</th><th class="num">数量</th><th>消費税</th><th class="num">金額</th></tr>
      ${n.items.map(it=>`<tr>
        <td>${dotDate(it.date)}</td><td>${esc(it.item)}</td>
        <td class="num">${num(it.price)}</td><td style="text-align:center">${esc(it.unit)}</td>
        <td class="num">${num(it.qty)}</td><td style="text-align:center">${esc(it.tax)}</td>
        <td class="num">${num((Number(it.price)||0)*(Number(it.qty)||0))}</td></tr>`).join("")}
      <tr><td colspan="6" style="text-align:right">小計</td><td class="num">${yen(c.sub)}</td></tr>
      <tr><td colspan="6" style="text-align:right">消費税(外税)</td><td class="num">${yen(c.tax)}</td></tr>
      <tr><td colspan="6" style="text-align:right;font-weight:700">合計(税込み)</td><td class="num" style="font-weight:700">${yen(c.total)}</td></tr>
    </table>
    <div style="margin-top:16px;font-size:12px"><b>お振込先(入金口座)</b>:${esc(co.bank)}</div>
  </div>`;
}
function noticeView(id){
  const n=db.paymentNotices.find(x=>x.id===id);
  openModal(`${noticeHtml(n)}
    <div class="formfoot no-print" style="justify-content:center">
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn accent" onclick="noticePrint('${id}')">印刷 / PDF保存</button>
    </div>`);
}
function noticePrint(id){
  const n=db.paymentNotices.find(x=>x.id===id);
  $("#invoicePrintArea").innerHTML=noticeHtml(n);
  document.body.classList.add("printing-invoice");
  window.print();
  document.body.classList.remove("printing-invoice");
}
function bankEdit(){
  openModal(`
    <h3>預金口座情報の編集</h3>
    <div class="field"><label>入金口座(銀行名・支店名・種別・口座番号・名義)</label>
      <input id="bk_val" value="${esc(db.settings.company.bank)}" placeholder="〇〇銀行 △△支店 普通 1234567 カ)〇〇"></div>
    <div class="formfoot">
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="db.settings.company.bank=$('#bk_val').value;save();closeModal();show('payform')">保存する</button>
    </div>`);
}
