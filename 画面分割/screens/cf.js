/* ================= キャッシュフロー計算書 ================= */
PAGES.cf=function(){
  const C=db.cf, so=sumRows(C.op), si=sumRows(C.inv), sf=sumRows(C.fin);
  const delta=so+si+sf, end=Number(C.beg||0)+delta;
  const sec=(rows,p)=>rows.map((r,i)=>`<tr>
      <td style="padding-left:24px"><input data-p="${p}" data-i="${i}" data-k="name" value="${esc(r.name)}"></td>
      <td style="width:200px"><input data-p="${p}" data-i="${i}" data-k="v" type="number" value="${r.v||0}" style="text-align:right"></td>
    </tr>`).join("");
  $("#page").innerHTML=`
    ${crumb("キャッシュフロー計算書")}
    <h2 class="pagettl">キャッシュフロー計算書</h2>
    <div class="panel">
      <div class="sheet-head">
        <div>
          <button class="btn ghost small" onclick="cfAdd('op')">+ 営業活動 1行追加</button>
          <button class="btn ghost small" onclick="cfAdd('inv')">+ 投資活動 1行追加</button>
          <button class="btn ghost small" onclick="cfAdd('fin')">+ 財務活動 1行追加</button>
        </div>
        <span class="ttl" style="margin:0 auto">キャッシュフロー計算書</span>
        <span class="unit">(単位:円)</span>
      </div>
      <div class="sheet-head">自: <input type="date" id="cf_from" value="${esc(C.from)}" style="width:150px">
        至: <input type="date" id="cf_to" value="${esc(C.to)}" style="width:150px"></div>
      <table class="sheet" id="cfTable">
        <tr><th colspan="2">Ⅰ 営業活動によるキャッシュ・フロー</th></tr>
        ${sec(C.op,"op")}
        <tr><td class="total">営業活動によるキャッシュ・フロー</td><td class="total num" style="padding:4px 8px">${tri(so)}</td></tr>
        <tr><th colspan="2">Ⅱ 投資活動によるキャッシュ・フロー</th></tr>
        ${sec(C.inv,"inv")}
        <tr><td class="total">投資活動によるキャッシュ・フロー</td><td class="total num" style="padding:4px 8px">${tri(si)}</td></tr>
        <tr><th colspan="2">Ⅲ 財務活動によるキャッシュ・フロー</th></tr>
        ${sec(C.fin,"fin")}
        <tr><td class="total">財務活動によるキャッシュ・フロー</td><td class="total num" style="padding:4px 8px">${tri(sf)}</td></tr>
        <tr><td class="total">Ⅳ 現金及び現金同等物の増減額</td><td class="total num" style="padding:4px 8px">${tri(delta)}</td></tr>
        <tr><td class="total">Ⅴ 現金及び現金同等物の期首残高</td><td style="width:200px"><input id="cf_beg" type="number" value="${C.beg||0}" style="text-align:right"></td></tr>
        <tr><td class="total">Ⅵ 現金及び現金同等物の期末残高</td><td class="total num" style="padding:4px 8px">${tri(end)}</td></tr>
      </table>
      <div class="formfoot">
        <button class="btn" onclick="db.cf.from=$('#cf_from').value;db.cf.to=$('#cf_to').value;save();alert('保存しました。')">保存する</button>
        <button class="btn ghost" onclick="cfCsv()">CSV保存</button>
      </div>
    </div>`;
  bindSheet("#cfTable",{op:C.op,inv:C.inv,fin:C.fin},"cf");
  $("#cf_beg").addEventListener("change",e=>{db.cf.beg=Number(e.target.value)||0;save();show("cf");});
};
function cfAdd(k){db.cf[k].push({name:"",v:0});save();show("cf");}
function cfCsv(){
  const C=db.cf,so=sumRows(C.op),si=sumRows(C.inv),sf=sumRows(C.fin);
  csvDownload("キャッシュフロー計算書.csv",[["キャッシュフロー計算書","自",C.from,"至",C.to],
    ["Ⅰ 営業活動によるキャッシュ・フロー",""],...C.op.map(r=>[r.name,r.v]),["営業活動によるキャッシュ・フロー",so],
    ["Ⅱ 投資活動によるキャッシュ・フロー",""],...C.inv.map(r=>[r.name,r.v]),["投資活動によるキャッシュ・フロー",si],
    ["Ⅲ 財務活動によるキャッシュ・フロー",""],...C.fin.map(r=>[r.name,r.v]),["財務活動によるキャッシュ・フロー",sf],
    ["Ⅳ 現金及び現金同等物の増減額",so+si+sf],["Ⅴ 現金及び現金同等物の期首残高",C.beg],
    ["Ⅵ 現金及び現金同等物の期末残高",Number(C.beg||0)+so+si+sf]]);
}
