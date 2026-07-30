/* ================= 財務三表共通 ================= */
function rowsEditor(rows,prefix){
  return rows.map((r,i)=>`<tr>
    <td><input data-p="${prefix}" data-i="${i}" data-k="name" value="${esc(r.name)}"></td>
    <td style="width:180px"><input data-p="${prefix}" data-i="${i}" data-k="v" type="number" value="${r.v||0}" style="text-align:right"></td>
  </tr>`).join("");
}
function sumRows(rows){return rows.reduce((t,r)=>t+(Number(r.v)||0),0);}
function bindSheet(tableId,map,page){
  $(tableId).addEventListener("change",e=>{
    const p=e.target.dataset.p;if(!p)return;
    map[p][e.target.dataset.i][e.target.dataset.k]=e.target.dataset.k==="v"?Number(e.target.value)||0:e.target.value;
    save();show(page);
  });
}
function tri(n){return n<0?"△"+num(-n):num(n);}
