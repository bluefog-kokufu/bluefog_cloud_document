/* ================= 賃貸革命連携 (CSVマスタ) ================= */
const MASTERS={m_landlords:"家主基本情報",m_contractors:"契約者情報",m_repairers:"修繕業者情報",m_agents:"仲介・管理業者情報",m_insurers:"保険会社情報"};
let masterQ="";
Object.keys(MASTERS).forEach(k=>{PAGES[k]=()=>masterPage(k);});
function masterPage(k){
  const label=MASTERS[k];
  const rows=(db.masters[k]||[]).filter(r=>!masterQ||[r.no,r.name].join(" ").includes(masterQ));
  $("#page").innerHTML=`
    ${crumb(label+"一覧")}
    <h2 class="pagettl">${label}一覧</h2>
    <div class="panel">
      <div class="toolbar">
        <input type="text" id="mQ" placeholder="No・名称を検索" value="${esc(masterQ)}">
        <button class="btn small" onclick="masterQ=$('#mQ').value;show('${k}')">検索</button>
      </div>
      <div class="csvbar">
        <button class="btn yellow small" onclick="masterExport('${k}')">⬇ エクスポート(CSV)</button>
        <button class="btn blue small" onclick="$('#mFile').click()">⬆ CSVアップロード</button>
        <button class="btn green small" onclick="masterTemplate('${k}')">⬇ CSVテンプレート</button>
        <button class="btn ghost small" onclick="masterForm('${k}')">新規登録</button>
        <input type="file" id="mFile" accept=".csv" style="display:none">
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="list">
          <tr><th>No</th><th>名称</th><th>更新日時 ↓</th><th>操作</th></tr>
          ${rows.map((r,i)=>`<tr>
            <td>${esc(r.no)}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.updated)}</td>
            <td><button class="icon-btn" title="編集" onclick="masterForm('${k}',${i})">✎</button>
                <button class="icon-btn" title="削除" onclick="masterDel('${k}',${i})">🗑</button></td>
          </tr>`).join("")||`<tr><td colspan="4" class="muted" style="text-align:center;padding:16px">データがありません。CSVをアップロードしてください。</td></tr>`}
        </table>
        <div class="pager"><button>&lt;</button><button class="cur">1</button><button>&gt;</button></div>
      </div>
      <div class="muted">賃貸革命からエクスポートしたCSV(No,名称)をアップロードすると一括登録できます。</div>
    </div>`;
  $("#mQ").addEventListener("keydown",e=>{if(e.key==="Enter"){masterQ=e.target.value;show(k);}});
  $("#mFile").addEventListener("change",e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{
      const rows=parseCsv(r.result).filter(x=>x.length&&x.join("").trim());
      let added=0;
      rows.forEach((x,i)=>{
        if(i===0&&(x[0]==="No"||x[0]==="no"||x[0]==="No"))return; // header
        db.masters[k].push({no:x[0]||"",name:x[1]||"",updated:nowStamp()});added++;
      });
      save();alert(added+"件を登録しました。");show(k);
    };
    r.readAsText(f,"UTF-8");
  });
}
function parseCsv(text){
  const out=[];let row=[],cur="",q=false;
  text=String(text).replace(/^﻿/,"");
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){
      if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else q=false;}
      else cur+=ch;
    }else{
      if(ch==='"')q=true;
      else if(ch===","){row.push(cur);cur="";}
      else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cur);out.push(row);row=[];cur="";}
      else cur+=ch;
    }
  }
  if(cur!==""||row.length){row.push(cur);out.push(row);}
  return out;
}
function masterExport(k){
  csvDownload(MASTERS[k]+".csv",[["No","名称","更新日時"],...(db.masters[k]||[]).map(r=>[r.no,r.name,r.updated])]);
}
function masterTemplate(k){
  csvDownload(MASTERS[k]+"_テンプレート.csv",[["No","名称"],["1","サンプル名称"]]);
}
function masterForm(k,i){
  const r=i!=null?db.masters[k][i]:{no:"",name:""};
  openModal(`
    <h3>${MASTERS[k]} ${i!=null?"編集":"新規登録"}</h3>
    <div class="grid2">
      <div class="field"><label>No</label><input id="mf_no" value="${esc(r.no)}"></div>
      <div class="field"><label><span class="req">必須</span>名称</label><input id="mf_name" value="${esc(r.name)}"></div>
    </div>
    <div class="formfoot">
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="masterSave('${k}',${i!=null?i:-1})">保存する</button>
    </div>`);
}
function masterSave(k,i){
  const name=$("#mf_name").value.trim();
  if(!name){alert("名称は必須です。");return;}
  const data={no:$("#mf_no").value,name,updated:nowStamp()};
  if(i>=0)db.masters[k][i]=data;else db.masters[k].push(data);
  save();closeModal();show(k);
}
function masterDel(k,i){if(confirm("削除しますか?")){db.masters[k].splice(i,1);save();show(k);}}
