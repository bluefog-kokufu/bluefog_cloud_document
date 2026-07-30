/* ================= 損益計算書 ================= */
PAGES.pl=function(){
  const P=db.pl;
  const rev=P.rows.filter(r=>r.type==="収益"),exp=P.rows.filter(r=>r.type==="費用");
  const profit=sumRows(rev)-sumRows(exp);
  $("#page").innerHTML=`
    ${crumb("損益計算書")}
    <h2 class="pagettl">損益計算書</h2>
    <div class="panel">
      <div class="sheet-head">
        <button class="btn ghost small" onclick="plAdd()">+ 1行追加</button>
        <span class="ttl" style="margin:0 auto">損益計算書</span>
        <span class="unit">(単位:円)</span>
      </div>
      <div class="sheet-head">自: <input type="date" id="pl_from" value="${esc(P.from)}" style="width:150px">
        至: <input type="date" id="pl_to" value="${esc(P.to)}" style="width:150px"></div>
      <table class="sheet" id="plTable">
        <tr><th>科目</th><th style="width:120px">区分</th><th style="width:200px">金額</th></tr>
        ${P.rows.map((r,i)=>`<tr>
          <td><input data-i="${i}" data-k="name" value="${esc(r.name)}"></td>
          <td><select data-i="${i}" data-k="type"><option ${r.type==="収益"?"selected":""}>収益</option><option ${r.type==="費用"?"selected":""}>費用</option></select></td>
          <td><input data-i="${i}" data-k="v" type="number" value="${r.v||0}" style="text-align:right"></td>
        </tr>`).join("")}
        <tr><td class="total" colspan="2">収益合計</td><td class="total num" style="padding:4px 8px">${num(sumRows(rev))}</td></tr>
        <tr><td class="total" colspan="2">費用合計</td><td class="total num" style="padding:4px 8px">${num(sumRows(exp))}</td></tr>
        <tr><td class="total" colspan="2">当期純利益</td><td class="total num" style="padding:4px 8px">${tri(profit)}</td></tr>
      </table>
      <div class="formfoot">
        <button class="btn" onclick="db.pl.from=$('#pl_from').value;db.pl.to=$('#pl_to').value;save();alert('保存しました。')">保存する</button>
        <button class="btn ghost" onclick="plCsv()">CSV保存</button>
      </div>
    </div>`;
  $("#plTable").addEventListener("change",e=>{
    const i=e.target.dataset.i;if(i==null)return;
    db.pl.rows[i][e.target.dataset.k]=e.target.dataset.k==="v"?Number(e.target.value)||0:e.target.value;
    save();show("pl");
  });
};
function plAdd(){db.pl.rows.push({name:"",type:"費用",v:0});save();show("pl");}
function plCsv(){
  const P=db.pl,rev=P.rows.filter(r=>r.type==="収益"),exp=P.rows.filter(r=>r.type==="費用");
  csvDownload("損益計算書.csv",[["損益計算書","自",P.from,"至",P.to],["科目","区分","金額"],
    ...P.rows.map(r=>[r.name,r.type,r.v]),["収益合計","",sumRows(rev)],["費用合計","",sumRows(exp)],
    ["当期純利益","",sumRows(rev)-sumRows(exp)]]);
}
