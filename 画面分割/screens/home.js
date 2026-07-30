/* ================= home ================= */
PAGES.home=function(){
  const ar=db.sales.filter(s=>s.status!=="入金済").reduce((t,s)=>t+Number(s.amount)+Number(s.tax),0);
  const ap=db.purchases.filter(p=>p.status!=="支払い済").reduce((t,p)=>t+Number(p.amount)+Number(p.tax),0);
  const month=today().slice(0,7);
  const ms=db.sales.filter(s=>(s.date||"").startsWith(month)).reduce((t,s)=>t+Number(s.amount),0);
  $("#page").innerHTML=`
    ${crumb("マイページ")}
    <h2 class="pagettl">マイページトップ</h2>
    <div class="cards">
      <div class="stat"><div class="t">登録顧客数</div><div class="v">${db.customers.length} 社</div></div>
      <div class="stat"><div class="t">今月の売上(税抜)</div><div class="v">${yen(ms)}</div></div>
      <div class="stat"><div class="t">未回収売掛金(税込)</div><div class="v">${yen(ar)}</div></div>
      <div class="stat"><div class="t">未払買掛金(税込)</div><div class="v">${yen(ap)}</div></div>
    </div>
    <div class="panel">
      <div class="card">
        <b style="color:var(--navy)">お知らせ</b>
        <ul class="notice" style="margin-top:8px">
          <li><span class="d">2026.07.23</span><a href="manual.html" target="_blank"><b>操作マニュアルのお知らせ</b> — ユーザー利用マニュアルはこちら</a> <a href="manual.pdf" target="_blank" class="muted">(PDF版)</a></li>
          <li><span class="d">2026.07.01</span>電子帳簿保存法対応:タイムスタンプ付与機能を更新しました。</li>
          <li><span class="d">2026.06.15</span>インボイス(適格請求書)テンプレートを更新しました。</li>
          <li><span class="d">2026.05.10</span>財務三表のCSV保存機能を追加しました。</li>
        </ul>
      </div>
      <div class="card">
        <b style="color:var(--navy)">クイックメニュー</b>
        <div class="toolbar" style="margin-top:10px">
          <button class="btn accent small" onclick="show('customers')">顧客管理</button>
          <button class="btn accent small" onclick="show('sales')">取引管理(売上)</button>
          <button class="btn accent small" onclick="show('purchases')">取引書類(仕入)</button>
          <button class="btn accent small" onclick="show('ledger')">総勘定元帳</button>
          <button class="btn accent small" onclick="show('bs')">財務三表</button>
        </div>
      </div>
    </div>`;
};
