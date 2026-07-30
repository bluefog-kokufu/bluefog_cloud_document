/* ================= purchases (発注・書類アップロード) ================= */
const P_DOCS=[["quote","見積書"],["invoice","請求書"],["receipt","領収書"],["contract","契約書"]];
let purF={q:"",from:"",to:"",method:"",status:""};
PAGES.purchases=function(){
  const list=db.purchases.filter(p=>{
    if(purF.method&&p.method!==purF.method)return false;
    if(purF.status&&p.status!==purF.status)return false;
    if(purF.from&&p.date<purF.from)return false;
    if(purF.to&&p.date>purF.to)return false;
    if(purF.q&&![p.id,custName(p.custId),p.memo].join(" ").includes(purF.q))return false;
    return true;
  }).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("#page").innerHTML=`
    ${crumb("取引書類一覧")}
    <h2 class="pagettl">取引書類一覧(仕入・アップロード)</h2>
    <div class="panel">
      <div class="toolbar">
        <input type="text" id="pQ" placeholder="No・取引先名で検索" value="${esc(purF.q)}">
        <input type="date" id="pF" title="発行日:開始日" value="${esc(purF.from)}" style="width:150px">
        <input type="date" id="pT" title="発行日:終了日" value="${esc(purF.to)}" style="width:150px">
        <select id="pM"><option value="">入金方法</option>${["現金","普通預金","当座預金","クレジット"].map(m=>`<option ${purF.method===m?"selected":""}>${m}</option>`).join("")}</select>
        <select id="pS"><option value="">ステータス</option>${["未払い","支払い済"].map(m=>`<option ${purF.status===m?"selected":""}>${m}</option>`).join("")}</select>
        <button class="btn small" onclick="purF={q:$('#pQ').value,from:$('#pF').value,to:$('#pT').value,method:$('#pM').value,status:$('#pS').value};show('purchases')">絞り込み</button>
        <span style="flex:1"></span>
        <button class="btn ghost small" onclick="purForm()">取引作成</button>
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="list">
          <tr><th>No</th><th>取引年月日</th><th>取引先名</th><th>入金方法</th><th class="num">取引金額</th><th class="num">税額</th><th>アップロード</th><th>ステータス</th>${P_DOCS.map(d=>`<th>${d[1]}</th>`).join("")}<th>操作</th></tr>
          ${list.map(p=>`<tr>
            <td class="muted">${esc(p.id)}</td>
            <td>${dotDate(p.date)}</td>
            <td>${esc(custName(p.custId))}</td>
            <td>${esc(p.method)}</td>
            <td class="num">${yen(p.amount)}</td>
            <td class="num">${yen(p.tax)}</td>
            <td>${dotDate(p.up)}</td>
            <td><span class="badge ${p.status==="支払い済"?"warn":"gray"}">${p.status}</span></td>
            ${P_DOCS.map(d=>`<td>${p.files&&p.files[d[0]]?`<a onclick="fileOpen('${p.id}','${d[0]}')">PDF</a>`:""}</td>`).join("")}
            <td><button class="icon-btn" title="編集" onclick="purForm('${p.id}')">✎</button>
                <button class="icon-btn" title="削除" onclick="purDel('${p.id}')">🗑</button></td>
          </tr>`).join("")||`<tr><td colspan="${9+P_DOCS.length}" class="muted">取引書類がありません。</td></tr>`}
        </table>
        <div class="pager"><button>&lt;</button><button class="cur">1</button><button>&gt;</button></div>
      </div>
      <div class="muted">アップロードされた書類には受領後すみやかにタイムスタンプ(アップロード日時)が付与され、「取引年月日」「取引金額」「取引先」で検索できます(電子帳簿保存法対応)。</div>
    </div>`;
};
let purFiles={};
function purForm(id){
  const p=id?db.purchases.find(x=>x.id===id):{date:today(),custId:"",method:"",amount:"",tax:"",status:"未払い",files:{},memo:""};
  purFiles=Object.assign({},p.files);
  openModal(`
    <h3>${id?"取引書類編集":"取引書類一覧(アップロード)作成"}</h3>
    <div class="grid2">
      <div>
        <div class="field"><label><span class="req">必須</span>取引先名</label>
          <select id="pf_cust">${custOptions(p.custId)}</select>
          <div style="margin-top:6px"><button class="btn ghost small" onclick="custForm(null,true)">顧客情報を新規登録</button></div>
        </div>
        <div class="field"><label><span class="req">必須</span>取引年月日</label><input type="date" id="pf_date" value="${esc(p.date)}"></div>
        <div class="field"><label><span class="req">必須</span>入金方法</label>
          <select id="pf_method"><option value="">選択してください</option>${["現金","普通預金","当座預金","クレジット"].map(m=>`<option ${p.method===m?"selected":""}>${m}</option>`).join("")}</select></div>
        <div class="field"><label><span class="req">必須</span>取引金額(税抜)</label><input type="number" id="pf_amount" value="${esc(p.amount)}" oninput="$('#pf_tax').value=calcTax(Number(this.value)||0)"></div>
        <div class="field"><label><span class="req">必須</span>税額</label><input type="number" id="pf_tax" value="${esc(p.tax)}"></div>
        <div class="field"><label><span class="req">必須</span>ステータス</label>
          <select id="pf_status">${["未払い","支払い済"].map(m=>`<option ${p.status===m?"selected":""}>${m}</option>`).join("")}</select></div>
      </div>
      <div>
        ${P_DOCS.map(d=>`
          <div class="field"><label>${d[1]}</label>
            <div class="upload-box ${purFiles[d[0]]?"has":""}" id="ub_${d[0]}">
              ${purFiles[d[0]]?"✓ アップロード済み":"⬆ ファイルを選択またはここにドロップします<br>PDF, JPG, PNG (up to 10MB)"}
            </div>
            <input type="file" id="uf_${d[0]}" accept=".pdf,.jpg,.jpeg,.png" style="margin-top:6px">
          </div>`).join("")}
        <div class="field"><label>メモ</label><textarea id="pf_memo" rows="2">${esc(p.memo)}</textarea></div>
      </div>
    </div>
    <div class="formfoot">
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="purSave('${id||""}')">${id?"更新":"作成"}</button>
    </div>`);
  P_DOCS.forEach(d=>{
    $("#uf_"+d[0]).addEventListener("change",e=>{
      const f=e.target.files[0];if(!f)return;
      if(f.size>10*1024*1024){alert("10MB以下のファイルを選択してください。");e.target.value="";return;}
      const r=new FileReader();
      r.onload=()=>{purFiles[d[0]]={name:f.name,data:r.result,ts:nowStamp()};
        const b=$("#ub_"+d[0]);b.classList.add("has");b.innerHTML="✓ "+esc(f.name);};
      r.readAsDataURL(f);
    });
  });
}
function purSave(id){
  const custId=$("#pf_cust").value,date=$("#pf_date").value,method=$("#pf_method").value;
  if(!custId||!date||!method||!$("#pf_amount").value){alert("必須項目を入力してください。");return;}
  const data={custId,date,method,amount:Number($("#pf_amount").value),tax:Number($("#pf_tax").value),
    status:$("#pf_status").value,memo:$("#pf_memo").value,files:purFiles,up:today()};
  if(id){Object.assign(db.purchases.find(p=>p.id===id),data);}
  else{data.id=uid().slice(0,9);db.purchases.push(data);}
  save();closeModal();show("purchases");
}
function purDel(id){if(confirm("この取引書類を削除しますか?")){db.purchases=db.purchases.filter(p=>p.id!==id);save();show("purchases");}}
function fileOpen(pid,key){
  const p=db.purchases.find(x=>x.id===pid),f=p.files[key];
  if(!f){alert("サンプルデータのためファイル実体はありません。");return;}
  const a=document.createElement("a");a.href=f.data;a.download=f.name;a.click();
}
