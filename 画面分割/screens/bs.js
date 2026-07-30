/* ================= 貸借対照表 ================= */
PAGES.bs=function(){
  const B=db.bs, ta=sumRows(B.assets), tl=sumRows(B.liabs), te=sumRows(B.equity);
  $("#page").innerHTML=`
    ${crumb("貸借対照表")}
    <h2 class="pagettl">貸借対照表</h2>
    <div class="panel">
      <div class="sheet-head">
        <div>
          <button class="btn ghost small" onclick="bsAdd('assets')">+ 資産 1行追加</button>
          <button class="btn ghost small" onclick="bsAdd('liabs')">+ 負債 1行追加</button>
          <button class="btn ghost small" onclick="bsAdd('equity')">+ 純資産 1行追加</button>
        </div>
        <span class="ttl" style="margin:0 auto">貸借対照表</span>
        <span class="unit">(単位:円)</span>
      </div>
      <div class="sheet-head">日付: <input type="date" id="bs_date" value="${esc(B.date)}" style="width:160px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" id="bsWrap">
        <table class="sheet" id="bsA">
          <tr><th colspan="2">資産の部</th></tr>
          ${rowsEditor(B.assets,"assets")}
          <tr><td class="total">資産の部合計</td><td class="total num" style="padding:4px 8px">${num(ta)}</td></tr>
        </table>
        <table class="sheet" id="bsL">
          <tr><th colspan="2">負債の部</th></tr>
          ${rowsEditor(B.liabs,"liabs")}
          <tr><td class="total">負債の部合計</td><td class="total num" style="padding:4px 8px">${num(tl)}</td></tr>
          <tr><th colspan="2">純資産の部</th></tr>
          ${rowsEditor(B.equity,"equity")}
          <tr><td class="total">純資産の部合計</td><td class="total num" style="padding:4px 8px">${num(te)}</td></tr>
          <tr><td class="total">負債・純資産の部合計</td><td class="total num" style="padding:4px 8px">${num(tl+te)}</td></tr>
        </table>
      </div>
      ${ta!==tl+te?`<div style="color:var(--danger);font-size:12px;margin-top:8px">⚠ 資産合計(${num(ta)})と負債・純資産合計(${num(tl+te)})が一致していません。</div>`:`<div style="color:var(--ok);font-size:12px;margin-top:8px">✓ 貸借一致しています。</div>`}
      <div class="formfoot">
        <button class="btn" onclick="db.bs.date=$('#bs_date').value;save();alert('保存しました。')">保存する</button>
        <button class="btn ghost" onclick="bsCsv()">CSV保存</button>
      </div>
    </div>`;
  bindSheet("#bsWrap",{assets:B.assets,liabs:B.liabs,equity:B.equity},"bs");
  $("#bs_date").addEventListener("change",e=>{db.bs.date=e.target.value;save();});
};
function bsAdd(k){db.bs[k].push({name:"",v:0});save();show("bs");}
function bsCsv(){
  const B=db.bs;
  csvDownload("貸借対照表.csv",[["貸借対照表","日付",B.date],["【資産の部】",""],
    ...B.assets.map(r=>[r.name,r.v]),["資産の部合計",sumRows(B.assets)],["【負債の部】",""],
    ...B.liabs.map(r=>[r.name,r.v]),["負債の部合計",sumRows(B.liabs)],["【純資産の部】",""],
    ...B.equity.map(r=>[r.name,r.v]),["純資産の部合計",sumRows(B.equity)],
    ["負債・純資産の部合計",sumRows(B.liabs)+sumRows(B.equity)]]);
}
