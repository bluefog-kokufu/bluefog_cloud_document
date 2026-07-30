/* ================= sales (受注管理) ================= */
let saleF={q:"",method:"",status:""};
PAGES.sales=function(){
  const list=db.sales.filter(s=>{
    if(saleF.method&&s.method!==saleF.method)return false;
    if(saleF.status&&s.status!==saleF.status)return false;
    if(saleF.q&&![s.id,custName(s.custId),s.memo].join(" ").includes(saleF.q))return false;
    return true;
  }).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("#page").innerHTML=`
    ${crumb("取引一覧")}
    <h2 class="pagettl">取引一覧(売上)</h2>
    <div class="panel">
      <div class="toolbar">
        <input type="text" id="sQ" placeholder="No・取引先名で検索" value="${esc(saleF.q)}">
        <select id="sM"><option value="">入金方法</option>${["現金","普通預金","当座預金","クレジット"].map(m=>`<option ${saleF.method===m?"selected":""}>${m}</option>`).join("")}</select>
        <select id="sS"><option value="">ステータス</option>${["未請求","請求済","入金済"].map(m=>`<option ${saleF.status===m?"selected":""}>${m}</option>`).join("")}</select>
        <button class="btn small" onclick="saleF={q:$('#sQ').value,method:$('#sM').value,status:$('#sS').value};show('sales')">絞り込み</button>
        <span style="flex:1"></span>
        <button class="btn ghost small" onclick="saleForm()">取引作成</button>
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="list">
          <tr><th>No</th><th>作成日</th><th>取引先名</th><th>入金方法</th><th class="num">請求金額</th><th class="num">税額</th><th>請求書</th><th>作成日時/履歴</th><th>ステータス</th><th>操作</th></tr>
          ${list.map(s=>`<tr>
            <td class="muted" style="max-width:170px;overflow:hidden;text-overflow:ellipsis">${esc(s.id)}</td>
            <td>${dotDate(s.date)}</td>
            <td>${esc(custName(s.custId))}</td>
            <td>${esc(s.method)}</td>
            <td class="num">${yen(s.amount)}</td>
            <td class="num">${yen(s.tax)}</td>
            <td>${s.invoiced?`<a onclick="invoiceView('${s.id}')">⬇ 表示</a>`:`<a onclick="invoiceView('${s.id}')">請求書作成</a>`}</td>
            <td class="muted">${esc(s.invoiced)}</td>
            <td><span class="badge ${s.status==="入金済"?"paid":s.status==="請求済"?"warn":"gray"}">${s.status}</span></td>
            <td><button class="icon-btn" title="編集" onclick="saleForm('${s.id}')">✎</button>
                <button class="icon-btn" title="削除" onclick="saleDel('${s.id}')">🗑</button></td>
          </tr>`).join("")||`<tr><td colspan="10" class="muted">取引がありません。</td></tr>`}
        </table>
        <div class="pager"><button>&lt;</button><button class="cur">1</button><button>&gt;</button></div>
      </div>
    </div>`;
};
function custOptions(sel){
  return `<option value="">選択してください</option>`+db.customers.map(c=>`<option value="${c.id}" ${sel===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
}
function saleForm(id){
  const s=id?db.sales.find(x=>x.id===id):{date:today(),custId:"",method:"",amount:"",tax:"",status:"未請求",memo:""};
  openModal(`
    <h3>${id?"取引編集":"取引作成"}(売上)</h3>
    <div class="field"><label><span class="req">必須</span>取引先名</label>
      <select id="tf_cust">${custOptions(s.custId)}</select>
      <div style="margin-top:6px"><button class="btn ghost small" onclick="custForm(null,true)">顧客情報を新規登録</button></div>
    </div>
    <div class="grid2">
      <div class="field"><label><span class="req">必須</span>作成日</label><input type="date" id="tf_date" value="${esc(s.date)}"></div>
      <div class="field"><label><span class="req">必須</span>入金方法</label>
        <select id="tf_method"><option value="">選択してください</option>${["現金","普通預金","当座預金","クレジット"].map(m=>`<option ${s.method===m?"selected":""}>${m}</option>`).join("")}</select></div>
      <div class="field"><label><span class="req">必須</span>請求金額(税抜)</label><input type="number" id="tf_amount" value="${esc(s.amount)}" oninput="$('#tf_tax').value=calcTax(Number(this.value)||0)"></div>
      <div class="field"><label><span class="req">必須</span>税額</label><input type="number" id="tf_tax" value="${esc(s.tax)}"><div class="muted">金額入力で自動計算(税率${esc(db.settings.taxRate)}%・${roundLabel()})</div></div>
      <div class="field"><label><span class="req">必須</span>ステータス</label>
        <select id="tf_status">${["未請求","請求済","入金済"].map(m=>`<option ${s.status===m?"selected":""}>${m}</option>`).join("")}</select></div>
    </div>
    <div class="field"><label>摘要・メモ</label><input id="tf_memo" value="${esc(s.memo)}"></div>
    <div class="formfoot">
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="saleSave('${id||""}')">${id?"更新":"作成"}</button>
    </div>`);
}
function saleSave(id){
  const custId=$("#tf_cust").value, date=$("#tf_date").value, method=$("#tf_method").value,
        amount=Number($("#tf_amount").value), tax=Number($("#tf_tax").value), status=$("#tf_status").value;
  if(!custId||!date||!method||!$("#tf_amount").value){alert("必須項目を入力してください。");return;}
  const data={custId,date,method,amount,tax,status,memo:$("#tf_memo").value};
  if(id){Object.assign(db.sales.find(s=>s.id===id),data);}
  else{data.id=uid();data.invoiced="";db.sales.push(data);}
  save();closeModal();show("sales");
}
function saleDel(id){if(confirm("この取引を削除しますか?")){db.sales=db.sales.filter(s=>s.id!==id);save();show("sales");}}
function roundLabel(){return {floor:"切り捨て",round:"四捨五入",ceil:"切り上げ"}[db.settings.rounding];}

/* ================= invoice (適格請求書) ================= */
function invoiceHtml(s){
  const c=db.customers.find(x=>x.id===s.custId)||{name:"(削除済み)",addr:"",regNo:""};
  const co=db.settings.company, total=Number(s.amount)+Number(s.tax);
  return `
  <div class="invoice">
    <h1>請求書</h1>
    <div class="inv-head">
      <div>
        <div style="font-size:15px;font-weight:700;border-bottom:1px solid #333;padding-bottom:4px;margin-bottom:6px">${esc(c.name)} 御中</div>
        <div class="muted">${esc(c.addr)}</div>
        <div style="margin-top:14px">下記のとおりご請求申し上げます。</div>
        <div class="inv-total">ご請求金額(税込) ${yen(total)}</div>
      </div>
      <div style="text-align:right;font-size:12px">
        <div>請求書番号:${esc(s.id)}</div>
        <div>発行日:${dotDate(s.date)}</div>
        <div style="margin-top:10px;font-weight:700;font-size:14px">${esc(co.name)}</div>
        <div>〒${esc(co.zip)} ${esc(co.addr)}</div>
        <div>TEL:${esc(co.tel)}</div>
        <div>登録番号:${esc(co.regNo)}</div>
      </div>
    </div>
    <table class="inv">
      <tr><th style="width:50%">品目・摘要</th><th>税区分</th><th class="num">金額(税抜)</th></tr>
      <tr><td>${esc(s.memo||"商品売上")}</td><td style="text-align:center">${esc(db.settings.taxRate)}%対象</td><td class="num">${yen(s.amount)}</td></tr>
      <tr><td colspan="2" style="text-align:right">小計(税抜)</td><td class="num">${yen(s.amount)}</td></tr>
      <tr><td colspan="2" style="text-align:right">消費税(${esc(db.settings.taxRate)}%)</td><td class="num">${yen(s.tax)}</td></tr>
      <tr><td colspan="2" style="text-align:right;font-weight:700">合計(税込)</td><td class="num" style="font-weight:700">${yen(total)}</td></tr>
    </table>
    <div style="margin-top:16px;font-size:12px">
      <b>お振込先</b>:${esc(co.bank)}<br>
      <span class="muted">恐れ入りますが、振込手数料は貴社にてご負担願います。お支払期限:${esc(c.site||"")}</span>
    </div>
  </div>`;
}
function invoiceView(id){
  const s=db.sales.find(x=>x.id===id);
  if(!s.custId||!db.customers.find(c=>c.id===s.custId)){alert("取引先が未設定のため請求書を作成できません。");return;}
  openModal(`
    ${invoiceHtml(s)}
    <div class="formfoot no-print" style="justify-content:center">
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn accent" onclick="invoicePrint('${id}')">印刷 / PDF保存</button>
      ${s.status==="未請求"?`<button class="btn" onclick="invoiceIssue('${id}')">請求済にする</button>`:""}
    </div>`);
  if(!s.invoiced){s.invoiced=nowStamp();save();}
}
function invoiceIssue(id){const s=db.sales.find(x=>x.id===id);s.status="請求済";s.invoiced=nowStamp();save();closeModal();show("sales");}
function invoicePrint(id){
  const s=db.sales.find(x=>x.id===id);
  $("#invoicePrintArea").innerHTML=invoiceHtml(s);
  document.body.classList.add("printing-invoice");
  window.print();
  document.body.classList.remove("printing-invoice");
}
