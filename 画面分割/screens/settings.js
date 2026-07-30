/* ================= 設定 ================= */
PAGES.settings=function(){
  const S=db.settings,co=S.company;
  $("#page").innerHTML=`
    ${crumb("会計・消費税設定")}
    <h2 class="pagettl">会計 / 端数・消費税設定</h2>
    <div class="panel">
      <div class="card">
        <b style="color:var(--navy)">消費税・端数処理</b>
        <div class="grid2" style="margin-top:10px">
          <div class="field"><label>消費税率(%)</label>
            <select id="st_tax">${[10,8,0].map(t=>`<option value="${t}" ${S.taxRate==t?"selected":""}>${t}%</option>`).join("")}</select></div>
          <div class="field"><label>端数処理</label>
            <select id="st_round">
              <option value="floor" ${S.rounding==="floor"?"selected":""}>切り捨て</option>
              <option value="round" ${S.rounding==="round"?"selected":""}>四捨五入</option>
              <option value="ceil" ${S.rounding==="ceil"?"selected":""}>切り上げ</option>
            </select></div>
        </div>
      </div>
      <div class="card">
        <b style="color:var(--navy)">自社情報(請求書に記載されます)</b>
        <div class="grid2" style="margin-top:10px">
          <div class="field"><label>会社名</label><input id="st_name" value="${esc(co.name)}"></div>
          <div class="field"><label>適格請求書発行事業者 登録番号</label><input id="st_reg" value="${esc(co.regNo)}"></div>
          <div class="field"><label>郵便番号</label><input id="st_zip" value="${esc(co.zip)}"></div>
          <div class="field"><label>電話番号</label><input id="st_tel" value="${esc(co.tel)}"></div>
        </div>
        <div class="field"><label>住所</label><input id="st_addr" value="${esc(co.addr)}"></div>
        <div class="field"><label>振込先</label><input id="st_bank" value="${esc(co.bank)}"></div>
      </div>
      <div class="formfoot">
        <button class="btn" onclick="settingsSave()">保存する</button>
        <button class="btn danger" onclick="resetAll()">デモデータを初期化</button>
      </div>
    </div>`;
};
function settingsSave(){
  const S=db.settings;
  S.taxRate=Number($("#st_tax").value);S.rounding=$("#st_round").value;
  Object.assign(S.company,{name:$("#st_name").value,regNo:$("#st_reg").value,zip:$("#st_zip").value,
    tel:$("#st_tel").value,addr:$("#st_addr").value,bank:$("#st_bank").value});
  save();alert("保存しました。");
}
function resetAll(){
  if(!confirm("すべてのデータを初期状態に戻します。よろしいですか?"))return;
  try{localStorage.removeItem(LS_KEY);}catch(e){}
  location.reload();
}
