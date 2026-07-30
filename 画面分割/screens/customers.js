/* ================= customers ================= */
let custQ="";
PAGES.customers=function(){
  const list=db.customers.filter(c=>!custQ||[c.name,c.person,c.email,c.tel].join(" ").includes(custQ));
  $("#page").innerHTML=`
    ${crumb("顧客一覧")}
    <h2 class="pagettl">顧客一覧</h2>
    <div class="panel">
      <div class="toolbar">
        <input type="text" id="custQ" placeholder="会社名・担当者・メール等で検索" value="${esc(custQ)}">
        <button class="btn small" onclick="custQ=$('#custQ').value;show('customers')">検索</button>
        <span style="flex:1"></span>
        <button class="btn ghost small" onclick="custForm()">顧客作成</button>
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="list">
          <tr><th>会社名</th><th>担当者</th><th>メールアドレス</th><th>電話番号</th><th>支払サイト</th><th>登録番号</th><th>操作</th></tr>
          ${list.map(c=>`<tr>
            <td><a onclick="custForm('${c.id}')">${esc(c.name)}</a></td>
            <td>${esc(c.person)}</td><td>${esc(c.email)}</td><td>${esc(c.tel)}</td>
            <td>${esc(c.site)}</td><td class="muted">${esc(c.regNo)}</td>
            <td><button class="icon-btn" title="編集" onclick="custForm('${c.id}')">✎</button>
                <button class="icon-btn" title="削除" onclick="custDel('${c.id}')">🗑</button></td>
          </tr>`).join("")||`<tr><td colspan="7" class="muted">該当する顧客がありません。</td></tr>`}
        </table>
        <div class="pager"><button>&lt;</button><button class="cur">1</button><button>&gt;</button></div>
      </div>
    </div>`;
  $("#custQ").addEventListener("keydown",e=>{if(e.key==="Enter"){custQ=e.target.value;show("customers");}});
};
function custForm(id, afterSave){
  const c=id?db.customers.find(x=>x.id===id):{name:"",person:"",email:"",tel:"",addr:"",site:"月末締め翌月末払い",regNo:"",memo:""};
  openModal(`
    <h3>${id?"顧客編集":"顧客作成"}</h3>
    <div class="field"><label><span class="req">必須</span>会社名</label><input id="cf_name" value="${esc(c.name)}"></div>
    <div class="grid2">
      <div class="field"><label>担当者名</label><input id="cf_person" value="${esc(c.person)}"></div>
      <div class="field"><label>メールアドレス</label><input id="cf_email" value="${esc(c.email)}"></div>
      <div class="field"><label>電話番号</label><input id="cf_tel" value="${esc(c.tel)}"></div>
      <div class="field"><label>支払サイト</label>
        <select id="cf_site">${["月末締め翌月末払い","月末締め翌々月末払い","20日締め翌月10日払い","即時払い","その他"].map(s=>`<option ${c.site===s?"selected":""}>${s}</option>`).join("")}</select></div>
    </div>
    <div class="field"><label>住所</label><input id="cf_addr" value="${esc(c.addr)}"></div>
    <div class="field"><label>適格請求書発行事業者 登録番号</label><input id="cf_reg" placeholder="T1234567890123" value="${esc(c.regNo)}"></div>
    <div class="field"><label>メモ</label><textarea id="cf_memo" rows="2">${esc(c.memo)}</textarea></div>
    <div class="formfoot">
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="custSave('${id||""}',${afterSave?"true":"false"})">${id?"更新":"作成"}</button>
    </div>`);
}
function custSave(id, reopenTx){
  const name=$("#cf_name").value.trim();
  if(!name){alert("会社名は必須です。");return;}
  const data={name,person:$("#cf_person").value,email:$("#cf_email").value,tel:$("#cf_tel").value,
    addr:$("#cf_addr").value,site:$("#cf_site").value,regNo:$("#cf_reg").value,memo:$("#cf_memo").value};
  if(id){Object.assign(db.customers.find(c=>c.id===id),data);}
  else{data.id="c"+uid();db.customers.push(data);}
  save();closeModal();
  if(reopenTx==="true"||reopenTx===true){/* return to tx form */}
  const active=document.querySelector("#sideNav a.active");
  show(active?active.dataset.page:"customers");
}
function custDel(id){
  if(!confirm("この顧客を削除しますか?関連する取引の表示名は「(削除済み)」になります。"))return;
  db.customers=db.customers.filter(c=>c.id!==id);save();show("customers");
}
