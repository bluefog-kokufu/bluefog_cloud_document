/* ================= 総勘定元帳 ================= */
const ACCTS=["現金","普通預金","売掛金","買掛金","商品","備品","借入金","資本金","売上高","仕入高","給料手当","地代家賃","通信費","消耗品費","雑費"];
PAGES.ledger=function(){
  const L=db.ledger;
  let bal=0;
  $("#page").innerHTML=`
    ${crumb("総勘定元帳")}
    <h2 class="pagettl">総勘定元帳</h2>
    <div class="panel">
      <div class="sheet-head">
        <button class="btn ghost small" onclick="ledgerAdd()">+ 1行追加</button>
        <span class="ttl" style="margin-left:auto;margin-right:auto">総勘定元帳</span>
      </div>
      <div class="sheet-head">日付: <input type="date" id="lg_date" value="${esc(L.date)}" style="width:160px"></div>
      <div style="overflow-x:auto">
      <table class="sheet" id="lgTable">
        <tr><th>伝票No.</th><th>月</th><th>日</th><th>勘定科目</th><th>摘要</th><th>仕丁</th><th>借方</th><th>貸方</th><th>残高</th></tr>
        ${L.rows.map((r,i)=>{bal+=Number(r.dr||0)-Number(r.cr||0);return `<tr>
          <td><input data-i="${i}" data-k="no" value="${esc(r.no)}" style="width:80px"></td>
          <td><input data-i="${i}" data-k="m" value="${esc(r.m)}" style="width:44px;text-align:center"></td>
          <td><input data-i="${i}" data-k="d" value="${esc(r.d)}" style="width:44px;text-align:center"></td>
          <td><select data-i="${i}" data-k="acct" style="width:120px"><option value=""></option>${ACCTS.map(a=>`<option ${r.acct===a?"selected":""}>${a}</option>`).join("")}</select></td>
          <td><input data-i="${i}" data-k="note" value="${esc(r.note)}"></td>
          <td><input data-i="${i}" data-k="page" value="${esc(r.page)}" style="width:44px;text-align:center"></td>
          <td><input data-i="${i}" data-k="dr" type="number" class="num" value="${r.dr||""}" style="width:110px;text-align:right"></td>
          <td><input data-i="${i}" data-k="cr" type="number" class="num" value="${r.cr||""}" style="width:110px;text-align:right"></td>
          <td class="num" style="padding:4px 8px">${num(bal)}</td>
        </tr>`;}).join("")}
        <tr><td class="total" colspan="6">合計</td>
          <td class="total num" style="padding:4px 8px">${num(L.rows.reduce((t,r)=>t+Number(r.dr||0),0))}</td>
          <td class="total num" style="padding:4px 8px">${num(L.rows.reduce((t,r)=>t+Number(r.cr||0),0))}</td>
          <td class="total num" style="padding:4px 8px">${num(bal)}</td></tr>
      </table>
      </div>
      <div class="formfoot">
        <button class="btn" onclick="ledgerSave(true)">保存する</button>
        <button class="btn ghost" onclick="ledgerCsv()">CSV保存</button>
      </div>
    </div>`;
  $("#lgTable").addEventListener("change",e=>{
    const i=e.target.dataset.i,k=e.target.dataset.k;
    if(i==null)return;
    db.ledger.rows[i][k]=(k==="dr"||k==="cr")?Number(e.target.value)||0:e.target.value;
    if(k==="dr"||k==="cr"){save();show("ledger");}
  });
  $("#lg_date").addEventListener("change",e=>{db.ledger.date=e.target.value;save();});
};
function ledgerAdd(){ledgerCollect();db.ledger.rows.push({no:"",m:"",d:"",acct:"",note:"",page:"",dr:0,cr:0});save();show("ledger");}
function ledgerCollect(){
  document.querySelectorAll("#lgTable [data-i]").forEach(el=>{
    const k=el.dataset.k;
    db.ledger.rows[el.dataset.i][k]=(k==="dr"||k==="cr")?Number(el.value)||0:el.value;
  });
}
function ledgerSave(msg){ledgerCollect();db.ledger.date=$("#lg_date").value;save();if(msg)alert("保存しました。");show("ledger");}
function ledgerCsv(){
  ledgerCollect();let bal=0;
  csvDownload("総勘定元帳.csv",[["伝票No.","月","日","勘定科目","摘要","仕丁","借方","貸方","残高"],
    ...db.ledger.rows.map(r=>{bal+=Number(r.dr||0)-Number(r.cr||0);return [r.no,r.m,r.d,r.acct,r.note,r.page,r.dr,r.cr,bal];})]);
}
