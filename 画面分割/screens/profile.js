/* ================= プロフィール ================= */
PAGES.profile=function(){
  const P=db.profile;
  $("#page").innerHTML=`
    ${crumb("プロフィール")}
    <h2 class="pagettl">プロフィール編集</h2>
    <div class="panel">
      <div class="card">
        <div class="field"><label>氏名</label><input id="pr_name" value="${esc(P.name)}"></div>
        <div class="field"><label>メールアドレス(ログインID)</label><input id="pr_email" value="${esc(P.email)}"></div>
        <div class="formfoot"><button class="btn" onclick="profileSave()">保存する</button></div>
      </div>
      <div class="card">
        <b style="color:var(--navy)">パスワード変更</b>
        <div class="grid2" style="margin-top:10px">
          <div class="field"><label>現在のパスワード</label><input type="password" id="pw_old"></div>
          <div class="field"><label>新しいパスワード</label><input type="password" id="pw_new"></div>
        </div>
        <div class="formfoot"><button class="btn" onclick="pwChange()">パスワードを変更する</button></div>
      </div>
    </div>`;
};
function profileSave(){
  const email=$("#pr_email").value.trim();
  if(!email){alert("メールアドレスを入力してください。");return;}
  db.profile.name=$("#pr_name").value;db.profile.email=email;save();
  $("#userLabel").textContent=db.profile.name+"("+db.profile.email+")";
  alert("保存しました。次回から新しいメールアドレスでログインしてください。");
}
function pwChange(){
  if($("#pw_old").value!==db.profile.pw){alert("現在のパスワードが一致しません。");return;}
  if(($("#pw_new").value||"").length<4){alert("新しいパスワードは4文字以上で入力してください。");return;}
  db.profile.pw=$("#pw_new").value;save();alert("パスワードを変更しました。");show("profile");
}
