import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, setDoc, doc, getDocs, getDoc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

import firebaseConfig from "./db.js"
while(true){
debugger;
}
document.addEventListener('keydown', e => {
  
  if (e.key === 'F12') e.preventDefault();
  
 
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') e.preventDefault();
  
  
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') e.preventDefault();
  
  
  if (e.ctrlKey && e.key.toLowerCase() === 'u') e.preventDefault();
});
document.addEventListener('contextmenu', e => e.preventDefault());


const supabase1 = supabase.createClient('https://cprwecsggnwqnnggnmex.storage.supabase.co/storage/v1/s3', 'f411c1598e55c6d2c1c76ebc660824f4');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const fsdb = getFirestore(app);
const storage = getStorage(app);


const ROLE_LABELS = { admin:"Администратор", user:"Пользователь"  };
const ROLE_CLASS  = { admin:"chat-role-badge chat-role-admin", user:"chat-role-badge chat-role-user",  };
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const toast = $('#toast');

function showToast(msg, type='info'){
  toast.textContent = msg;
  toast.style.background = type==='error' ? '#2e2323' : '#23272e';
  toast.style.color = type==='error' ? '#f66' : (type==='success' ? '#3fcf7f' : '#fff');
  toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 2200);
}
function escapeHtml(s){ return (s??'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') }
function fmtTime(ts){ const d=new Date(ts); return d.toLocaleString('ru-RU',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}) }
function avatarOf(nick){ return "https://ui-avatars.com/api/?name="+encodeURIComponent(nick||'?')+"&background=323a47&color=3fa7ff" }
function preview(text, n=40){ if(!text) return ""; const t=text.replace(/\s+/g,' ').trim(); return t.length>n? t.slice(0,n-1)+'…':t }
function isValidUsername(u){ return /^[a-zA-Z0-9_]{4,}$/.test(u||''); }

function isSameDay(a,b){ const da=new Date(a), db=new Date(b); return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate(); }
function dayStart(ts){ const d=new Date(ts); d.setHours(0,0,0,0); return +d; }
function dayLabel(ts){
  const now=Date.now(); const today=dayStart(now), yest=today-24*60*60*1000, dd=dayStart(ts);
  if(dd===today) return 'Сегодня';
  if(dd===yest) return 'Вчера';
  const d=new Date(ts); const z=n=>n.toString().padStart(2,'0');
  return `${z(d.getDate())}.${z(d.getMonth()+1)}.${d.getFullYear()}`;
}
function plural(n, one, few, many){
  const n10 = n % 10, n100 = n % 100;
  if(n10===1 && n100!==11) return one;
  if(n10>=2 && n10<=4 && (n100<10 || n100>=20)) return few;
  return many;
}
function formatDuration(ms){
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  const parts=[];
  if(h>0) parts.push(`${h} ${plural(h,'час','часа','часов')}`);
  if(m>0) parts.push(`${m} ${plural(m,'минута','минуты','минут')}`);
  if(h===0 && m===0) parts.push(`${sec} ${plural(sec,'секунда','секунды','секунд')}`);
  return parts.join(' ');
}

const sbProfileBtn = $('#profile');
const sbAuthBtn    = $('#auth');
const sbMessengerBtn = $('#messenger');
const sbStoriesBtn = $('#stories');

const storiesModal = $('#storiesModal');
const closeStories = $('#closeStories');
const storyVideo = $('#storyVideo');
const storiesList = $('#storiesList');
const addStoryBtn = $('#addStoryBtn');



async function loadStories(){
  try{
    const qy = query(collection(fsdb,'stories'), orderBy('createdAt','desc'));
    const snap = await getDocs(qy);
    storiesList.innerHTML = '';
    const now = Date.now();
    if(snap.empty){
      storiesList.innerHTML = `<div class="shorts-empty">Пустовато тут как то...</div>`;
      return;
    }
    for (const d of snap.docs){
      const s = d.data();
      if(now - (s.createdAt||0) > 24*60*60*1000){
        try{
          if(s.videoUrl){
            const fileRef = sref(storage, s.videoUrl); 
            await deleteObject(fileRef).catch(()=>{});
          }
          await deleteDoc(doc(fsdb,'stories',d.id));
        }catch(_){}
        continue;
      }
      const wrap = document.createElement('div');
      wrap.className='shorts-card';
      const el = document.createElement('video');
      el.src = s.videoUrl;
      el.controls = true;
      el.playsInline = true;
      el.preload = 'metadata';
      wrap.appendChild(el);

      const caption = document.createElement('div');
      caption.style.cssText='position:absolute;left:10px;top:8px;background:rgba(0,0,0,.45);color:#fff;padding:4px 8px;border-radius:10px;font-weight:700;font-size:.9em';
      caption.textContent = '@' + (s.username||'user');
      wrap.appendChild(caption);

      storiesList.appendChild(wrap);
    }
  }catch(err){
    storiesList.innerHTML = `<div style="color:#f66">Ошибка загрузки историй</div>`;
  }
}
const storyInput = document.getElementById('storyVideo');
function getVideoDuration(file){
  return new Promise((resolve,reject)=>{
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload='metadata';
    v.onloadedmetadata = ()=>{
      URL.revokeObjectURL(url);
      resolve(v.duration || 0);
    };
    v.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать видео')); };
    v.src = url;
  });
}

storyInput?.addEventListener('change', async (e) => {
  const file = storyInput.files?.[0];
  if (!file) return;

  // Проверка пользователя
  if (!curUser) {
    showToast('Войдите, чтобы публиковать', 'error');
    storyInput.value = '';
    return;
  }

  if (isBanned) {
    showToast('Вы заблокированы', 'error');
    storyInput.value = '';
    return;
  }

  try {
    
    const dur = await getVideoDuration(file);
    if (dur > 60) {
      storyInput.value = '';
      return showToast('Видео должно быть до 1 минуты', 'error');
    }

    
    const fileName = `${Date.now()}${file.name}`;
    const path = `stories/${fileName}`;

    

    
    const { error: uploadError } = await supabase1.storage.from('stories').upload(path, file);
    if (uploadError) throw uploadError;
    const { publicUrl: videoUrl } = supabase1.storage.from('stories').getPublicUrl(path);

    
    const { error: dbError } = await supabase1.from('stories').insert([{
    uid: curUser.uid,
    username: curUserData.username || (curUser.email||'').split('@')[0],
    video_url: videoUrl,
    created_at: Date.now()
    }]);
    if (dbError) throw dbError;

    
    storyInput.value = '';
    showToast('История добавлена', 'success');

    
    await loadStories();

  } catch (err) {
    console.error(err);
    showToast('Ошибка загрузки видео', 'error');
    storyInput.value = '';
  }
});


const authModal = $('#authModal'); const closeAuth = $('#closeAuth');
const profileModal = $('#profileModal'); const closeProfile = $('#closeProfile');

const userPickerModal = $('#userPickerModal'); const closeUserPicker = $('#closeUserPicker');
const userSearch = $('#userSearch'); const userPickerList = $('#userPickerList');
const groupTitleInput = $('#groupTitleInput'); const createGroupBtn = $('#createGroupBtn');

const chatPanel = $('#chatPanel'); const chatList = $('#chatList');
const chatSearch = $('#chatSearch');
const addChatBtn = $('#addChatBtn'); const chatMessages = $('#chatMessages');
const chatInput = $('#chatInput'); const chatSend = $('#chatSend');
const peerName = $('#peerName'); const peerAvatar = $('#peerAvatar');
const callBtnHeader = $('#callBtnHeader'); const clearChatBtn = $('#clearChatBtn');
const membersBtn = $('#membersBtn');

const profileEmail = $('#profileEmail'); const profileUsername = $('#profileUsername');
const profileRoleBadge = $('#profileRoleBadge'); const profileAvatar = $('#profileAvatar');
const editUsernameBtn = $('#editUsernameBtn');
const newPasswordInput = $('#newPasswordInput'); const changePasswordBtn = $('#changePasswordBtn');
const openAdminPanel = $('#openAdminPanel');


const newsModal = $('#newsModal'); const closeNews = $('#closeNews');
const postForm = $('#postForm'); const postText = $('#postText'); const postImage = $('#postImage'); const postsList = $('#postsList'); const postFormHint = $('#postFormHint');

const membersModal = $('#membersModal'); const membersList = $('#membersList'); const closeMembers = $('#closeMembers');
closeMembers.onclick = ()=>hideModal(membersModal);

const adminPanelModal = $('#adminPanelModal');
const adminSearch = $('#adminSearch');
const adminUsers = $('#adminUsers');
$('#closeAdminPanel').onclick = ()=>hideModal(adminPanelModal);
const bannedModal = $('#bannedModal'); const banReasonEl = $('#banReason'); const banUntilEl = $('#banUntil');

let curUser = null;
let curUserData = {username:"", avatar:"", role:"user", email:""};
let usersCache = {};    
let msgsUnsub = null;
let currentGroupId = null;
let currentGroupDoc = null;

let selectedForChat = new Set();

let callPeerUid = null;
let callPeerNick = '';
let pc = null;
let localStream = null;
let callDocRef = null;
let unsubCallDoc = null;
let unsubCallerCandidates = null;
let unsubCalleeCandidates = null;
let isCaller = false;
let isMuted = false;
let callGroupId = null;
let callStartTs = 0;
let callNotified = false;

let isBanned = false;

const showModal = el => el.style.display='flex';
const hideModal = el => el.style.display='none';

function setAuthUI(authenticated){
  if(authenticated){
    sbProfileBtn.style.display='';
    sbAuthBtn.style.display='none';
  }else{
    sbProfileBtn.style.display='none';
    sbAuthBtn.style.display='';
  }
}
function getRoleBadge(role){
  const cls = ROLE_CLASS[role] || ROLE_CLASS.user;
  const title = ROLE_LABELS[role] || ROLE_LABELS.user;
  return `<span class="${cls}">${title}</span>`;
}

const pillButtons = document.querySelectorAll(".pill-navbar button");
pillButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    pillButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

$('#register').addEventListener('submit', async e=>{
  e.preventDefault();
  const username = $('#registerUsername').value.trim();
  const email = $('#registerEmail').value.trim();
  const pass  = $('#registerPassword').value.trim();
  if(!username || !email || !pass) return showToast('Заполните все поля','error');
  if(!isValidUsername(username)) return showToast('Недопустимый username','error');
  try{
    const taken = await get(ref(rtdb,'usernames/'+username));
    if(taken.exists()) return showToast('Username уже занят','error');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const role = "user";
    
    await set(ref(rtdb, 'users/'+cred.user.uid), { email, username, avatar:'', role });
    console.log(cred.user.uid);
    await set(ref(rtdb,'usernames/'+username), cred.user.uid);
    showToast('Успешная регистрация','success');
    hideModal(authModal);
  }catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
});
$('#login').addEventListener('submit', async e=>{
 
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const pass  = $('#loginPassword').value.trim();
  if(!email || !pass) return showToast('Заполните все поля','error');
  try{
    
    await signInWithEmailAndPassword(auth, email, pass);
    showToast('Вход выполнен','success');
    hideModal(authModal);
  }catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
  try {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  
  showToast('Вход выполнен','success');
  hideModal(authModal);
} catch(err) {
  showToast('Ошибка: ' + (err.message || err), 'error');
}

});
const logoutBtnEl = document.getElementById('logoutBtn');
if(logoutBtnEl) logoutBtnEl.onclick = ()=>signOut(auth);

editUsernameBtn.onclick = async ()=>{
  if(!curUser) return;
  const current = curUserData.username || '';
  const nn = prompt('Новый username (латиница/цифры/_, минимум 4)', current);
  if(!nn) return;
  if(!isValidUsername(nn)) return showToast('Недопустимый username','error');
  if(nn===current) return showToast('Без изменений','info');
  const snap = await get(ref(rtdb, 'usernames/'+nn));
  if(snap.exists()) return showToast('Username уже занят','error');

  if(current) await set(ref(rtdb, 'usernames/'+current), null);
  await update(ref(rtdb,'users/'+curUser.uid),{username:nn});
  await set(ref(rtdb,'usernames/'+nn), curUser.uid);
  curUserData.username = nn;
  profileUsername.textContent = nn || '(не задан)';
  await refreshUsersCache();
  showToast('Username обновлён','success');
};

changePasswordBtn.onclick = async ()=>{
  if(!curUser) return;
  const p = newPasswordInput.value.trim();
  if(!p) return showToast('Введите новый пароль','error');
  try{ await updatePassword(curUser, p); newPasswordInput.value=''; showToast('Пароль изменён','success'); }
  catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
};

sbAuthBtn.onclick = ()=>{
  showModal(authModal);
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const tabUnderline = document.getElementById('tabUnderline');
  function activateTab(tab) {
    tabLogin.classList.remove('active');
    tabRegister.classList.remove('active');
    tab.classList.add('active');
    if(tab===tabLogin){
      loginTab.style.display = '';
      registerTab.style.display = 'none';
      tabUnderline.style.left = '0';
      tabUnderline.style.width = '50%';
    }else{
      loginTab.style.display = 'none';
      registerTab.style.display = '';
      tabUnderline.style.left = '50%';
      tabUnderline.style.width = '50%';
    }
  }
  tabLogin.onclick = ()=>activateTab(tabLogin);
  tabRegister.onclick = ()=>activateTab(tabRegister);
  activateTab(tabLogin);
};
closeAuth.onclick   = ()=>hideModal(authModal);
sbProfileBtn.onclick = ()=>{ if(!curUser) return; showModal(profileModal); };
closeProfile.onclick = ()=>hideModal(profileModal);

async function refreshUsersCache(){
  const snap = await get(ref(rtdb,'users'));
  usersCache = snap.exists()? snap.val() : {};
}
function openUserPicker(){
  $('#userSearch').value = '';
  groupTitleInput.value = '';
  selectedForChat = new Set();
  renderUserPicker('');
  showModal(userPickerModal);
}
function renderUserPicker(filter){
  const f = (filter||'').toLowerCase();
  userPickerList.innerHTML='';
  Object.entries(usersCache).forEach(([uid,u])=>{
    if(!curUser || uid===curUser.uid) return;
    const needle = (u.username||'')+' '+(u.email||'');
    if(f && !needle.toLowerCase().includes(f)) return;
    const av = u.avatar || avatarOf(u.username||u.email);
    const el = document.createElement('div');
    el.className = 'user-circle';
    el.dataset.uid = uid;
    if(selectedForChat.has(uid)) el.classList.add('selected');
    el.innerHTML = `<img src="${av}" alt=""><span>@${escapeHtml(u.username||'—')}</span>`;
    el.onclick = ()=>{
      if(selectedForChat.has(uid)){ selectedForChat.delete(uid); el.classList.remove('selected'); }
      else { selectedForChat.add(uid); el.classList.add('selected'); }
    };
    userPickerList.appendChild(el);
  });
}
userSearch.addEventListener('input', e=>renderUserPicker(e.target.value));
addChatBtn.onclick = openUserPicker;
closeUserPicker.onclick=()=>hideModal(userPickerModal);

createGroupBtn.onclick = async ()=>{
  if(!curUser) return;
  const memberUids = Array.from(selectedForChat);
  if(memberUids.length===0){ showToast('Выберите хотя бы одного участника','error'); return; }
  const titleRaw = groupTitleInput.value.trim();
  const isOneToOne = memberUids.length===1;
  const title = titleRaw || (isOneToOne ? '@'+(usersCache[memberUids[0]]?.username||'user') : 'Группа');
  const id = await createGroupChat(memberUids, title);
  hideModal(userPickerModal);
  if(id) openGroup(id);
};

async function createGroupChat(memberUids, title){
  const now = Date.now();
  const members = Array.from(new Set([curUser.uid, ...memberUids]));
  const docRef = await addDoc(collection(fsdb, "groups"), {
    title, members, createdBy: curUser.uid, createdAt: now, updatedAt: now, lastMessage: ''
  });
  showToast('Группа создана','success');
  return docRef.id;
}

let groupsUnsub = null;
function listenGroupList(){
  if(groupsUnsub) groupsUnsub();
  const qy = query(collection(fsdb,'groups'), where('members','array-contains', curUser.uid));
  groupsUnsub = onSnapshot(qy, snap=>{
    const arr = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderChatList(arr);
  });
}
let lastGroupList = [];
function renderChatList(items){
  lastGroupList = items.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const term = (chatSearch.value||'').toLowerCase();
  chatList.innerHTML='';
  lastGroupList.forEach(g=>{
    if(term && !((g.title||'').toLowerCase().includes(term))) return;
    const selected = g.id === currentGroupId ? 'selected' : '';
    const avatarText = g.title?.slice(0,2).toUpperCase() || 'GR';
    const li = document.createElement('div');
    li.className = `chat-item ${selected}`;
    li.dataset.gid = g.id;
    li.innerHTML = `
      <div class="chat-item-avatar" style="display:grid;place-items:center;font-weight:800;color:#8ecbff;background:#1e2733">${escapeHtml(avatarText)}</div>
      <div class="chat-item-txt" style="flex:1;min-width:0">
        <div class="chat-item-nick">${escapeHtml(g.title||'Без названия')}</div>
        <div class="chat-item-last">${escapeHtml(g.lastMessage||'')}</div>
      </div>
      <button class="icon-btn chat-remove-btn" title="Убрать из списка" style="margin-left:8px;font-size:1.2em;">🗑️</button>
    `;
    li.querySelector('.chat-item-txt').onclick = ()=>openGroup(g.id);
    li.querySelector('.chat-remove-btn').onclick = async (e)=>{
      e.stopPropagation();
      if(!confirm('Убрать этот чат из списка?')) return;
      const groupRef = doc(fsdb, 'groups', g.id);
      const snap = await getDoc(groupRef);
      const data = snap.data();
      if(!data) return;
      const newMembers = (data.members||[]).filter(uid=>uid!==curUser.uid);
      await updateDoc(groupRef, { members: newMembers });
      showToast('Чат убран из списка','success');
    };
    chatList.appendChild(li);
  });
}
chatSearch.addEventListener('input', ()=>renderChatList(lastGroupList));

async function openGroup(groupId){
  if(msgsUnsub){ msgsUnsub(); msgsUnsub=null; }
  currentGroupId = groupId;
  const gdoc = await getDoc(doc(fsdb,'groups', groupId));
  currentGroupDoc = gdoc.exists() ? {id:gdoc.id, ...gdoc.data()} : null;
  renderChatHeader(currentGroupDoc);
  const qy = query(collection(fsdb,'groups',currentGroupId, 'messages'), orderBy('timestamp','asc'));
  msgsUnsub = onSnapshot(qy, snap=>{
    const msgs = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderMessages(msgs);
  });
  callBtnHeader.onclick = ()=>startCallForCurrentGroup();
  clearChatBtn.onclick = ()=>clearCurrentGroupChat();
  membersBtn.onclick = ()=> openMembersModal(currentGroupDoc);
}

function renderChatHeader(group){
  const has = !!group;
  if(!has){
    peerAvatar.src=''; peerName.textContent='Выберите чат';
    callBtnHeader.disabled=true; clearChatBtn.disabled=true; membersBtn.disabled=true; return;
  }
  const txt = (group.title||'GR').slice(0,2).toUpperCase();
  const svg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='#1e2733'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='34' fill='#8ecbff' font-weight='800'>${txt}</text></svg>`
  )}`;
  peerAvatar.src = svg;
  peerName.textContent = `${group.title||'Группа'} · ${group.members?.length||0} чл.`;
  callBtnHeader.disabled=false; clearChatBtn.disabled=false; membersBtn.disabled=false;
}

function openMembersModal(group){
    if(curUserData.role == "admin"){
        membersList.innerHTML = '';
  (group?.members||[]).forEach(uid=>{
    const u = usersCache[uid]||{};
    const nickname = u.username ? '@'+u.username : (u.email||'').split('@')[0]||'???';
    const avatar = u.avatar || avatarOf(nickname);
    const role = u.role==='admin' ? 'Разработчик' : 'Пользователь';
    const div = document.createElement('div');
    div.className='user-item';
    div.innerHTML = `<img src="${avatar}" alt="">
      <div class="meta"><b>${escapeHtml(nickname)}</b><div style="color:#aaa">${role}</div></div>`;
    membersList.appendChild(div);
  });
  showModal(membersModal);
    }
  
}

function renderMessages(messages){
  chatMessages.innerHTML='';
  if(messages.length===0){
    chatMessages.innerHTML = '<div style="color:#666;text-align:center;margin-top:16px">Сообщений пока нет. Напишите первым!</div>';
    return;
  }
  let lastLabel = null;
  messages.forEach(m=>{
    const label = dayLabel(m.timestamp||Date.now());
    if(label!==lastLabel){
      const sep = document.createElement('div');
      sep.className='msg-date-sep';
      sep.textContent = label;
      chatMessages.appendChild(sep);
      lastLabel = label;
    }
    renderMessage(m);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function renderMessage(m){
  if(m.system){
    const el = document.createElement('div');
    el.className='msg-system';
    el.textContent = m.message||'';
    chatMessages.appendChild(el);
    return;
  }

  const u = usersCache[m.uid]||{};
  const nickname = u.username ? '@'+u.username : (u.email||'').split('@')[0] || '???';
  const avatar = u.avatar || avatarOf(nickname);
  const role = u.role || 'user';

  const row = document.createElement('div');
  row.className='msg-row';
  row.innerHTML = `
    <img class="msg-avatar" src="${avatar}" alt="">
    <div style="flex:1;min-width:0">
      <div class="msg-head">
        <span class="msg-nick">${escapeHtml(nickname)}</span>
        ${getRoleBadge(role)}
        <span class="msg-time">${fmtTime(m.timestamp||Date.now())}</span>
        ${m.uid===curUser?.uid ? `<button class="icon-btn" data-id="${m.id}" title="Редактировать">✏️</button>` : ''}
      </div>
      <div class="msg-body"><span class="msg-text">${escapeHtml(m.message||'')}</span></div>
    </div>
  `;
  chatMessages.appendChild(row);

  if(m.uid===curUser?.uid){
    row.querySelector('.icon-btn').onclick = async ()=>{
      const newText = prompt('Изменить сообщение', m.message||'');
      if(!newText || !currentGroupId) return;
      await updateDoc(doc(fsdb,"groups",currentGroupId,"messages",m.id), { message:newText.trim(), edited:true });
    };
  }
}

async function sendMessage(){
  const text = chatInput.value.trim();
  if(!text || !curUser || !currentGroupId) return;
  if(isBanned){ showToast('Вы заблокированы','error'); return; }
  const ts = Date.now();
  chatInput.value=''; chatInput.focus();
  await addDoc(collection(fsdb,"groups",currentGroupId,"messages"),{
    uid:curUser.uid, message:text, timestamp:ts
  });
  await updateDoc(doc(fsdb,'groups', currentGroupId),{
    lastMessage: preview(text),
    updatedAt: ts
  });
}
chatSend.onclick = sendMessage;
chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMessage(); });

async function clearCurrentGroupChat(){
  if(!currentGroupId) return;
  if(!confirm('Очистить все сообщения в этом чате?')) return;
  const msgsRef = collection(fsdb,"groups",currentGroupId,"messages");
  const snap = await getDocs(msgsRef);
  const batch = writeBatch(fsdb);
  snap.docs.forEach(d=>batch.delete(d.ref));
  await batch.commit();
  await updateDoc(doc(fsdb,'groups',currentGroupId),{ lastMessage:'', updatedAt: Date.now() });
  showToast('Чат очищен','success');
}

sbMessengerBtn.onclick = ()=>{ showModal(chatPanel); setTimeout(()=>chatInput.focus(),50); };
$('#closeChatBtn').onclick = ()=> hideModal(chatPanel);
const CALLS_COLLECTION = 'calls';
const GROUP_CALLS = 'groupCalls';

function createPeerConnection(){
  const rtc = new RTCPeerConnection({ iceServers:[{urls:'stun:stun.l.google.com:19302'}] });
  rtc.ontrack = e=>{ $('#remoteAudio').srcObject = e.streams[0]; };
  return rtc;
}
function showCallModal(status, nick, actions=[]){
  $('#callStatus').textContent = status;
  $('#callPeer').textContent = nick||'';
  const area = $('#callActions'); area.innerHTML='';
  actions.forEach(b=>area.appendChild(b));
  showModal($('#callModal'));
}
function hideCallModal(){ hideModal($('#callModal')); $('#callJoined').textContent=''; }
$('#closeCallModal').onclick = hideCallModal;

async function postCallSystemMessage(kind, opts={}){
  try{
    if(!callGroupId) return;
    const callId = callDocRef?.id || ('grp-'+currentGroupId+'-'+Date.now());
    const ts = Date.now();
    let text = '';
    if(kind==='missed'){
      text = `Пропущенный звонок от ${callPeerNick||'@user'}`;
    }else if(kind==='ended'){
      const dur = opts.durationMs||0;
      text = `Завершённый звонок (${formatDuration(dur)})`;
    }
    const mid = `call-${callId}-${kind}`;
    await setDoc(doc(fsdb,"groups",callGroupId,"messages", mid), {
      uid:'system', system:true, type:'call', message:text, timestamp:ts
    }, {merge:true});
    await updateDoc(doc(fsdb,'groups', callGroupId),{
      lastMessage: text,
      updatedAt: ts
    });
  }catch(_){}
}

async function startCallWithUser(peerUid, peerNick){
  callPeerUid = peerUid; callPeerNick = peerNick; isCaller = true; isMuted=false;
  callStartTs = 0; callNotified = false;

  const btnMute   = document.createElement('button'); btnMute.className='app-button'; btnMute.textContent='🔇 Mute';
  const btnHangup = document.createElement('button'); btnHangup.className='app-button'; btnHangup.textContent='❌ Завершить';
  btnMute.onclick = toggleMute; btnHangup.onclick = endCall;
  showCallModal('Звоним...', peerNick, [btnMute, btnHangup]);

  try{
    pc = createPeerConnection();
    localStream = await navigator.mediaDevices.getUserMedia({audio:true});
    localStream.getTracks().forEach(t=>pc.addTrack(t, localStream));

    callDocRef = await addDoc(collection(fsdb, CALLS_COLLECTION),{
      callerUid: curUser.uid, callerNick: curUserData.username || curUser.email,
      calleeUid: peerUid, status:'offer', created: Date.now(),
      groupId: callGroupId || currentGroupId || null
    });

    const callerCandidatesCol = collection(fsdb, CALLS_COLLECTION, callDocRef.id, 'callerCandidates');
    const calleeCandidatesCol = collection(fsdb, CALLS_COLLECTION, callDocRef.id, 'calleeCandidates');

    pc.onicecandidate = e=>{ if(e.candidate) addDoc(callerCandidatesCol, {candidate: e.candidate.toJSON()}); };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(callDocRef, { offer: JSON.stringify(offer) }, {merge:true});

    unsubCallDoc = onSnapshot(callDocRef, async snap=>{
      const data = snap.data();
      if(data?.answer && !pc.currentRemoteDescription){
        await pc.setRemoteDescription(JSON.parse(data.answer));
        if(callStartTs===0) callStartTs = Date.now();
        showCallModal('Вызов...', peerNick, [btnMute, btnHangup]);
      }
      if(data?.status==='end') await endCall(/*remote*/true);
    });
    unsubCalleeCandidates = onSnapshot(calleeCandidatesCol, (snap)=>{
      snap.docChanges().forEach(async change=>{
        if(change.type==='added'){
          try{ await pc.addIceCandidate(change.doc.data().candidate); }catch(_){}
        }
      });
    });
  }catch(err){
    showToast('Ошибка WebRTC: '+(err.message||err),'error');
    await endCall();
  }
}
function listenIncomingCalls(){
  onSnapshot(collection(fsdb, CALLS_COLLECTION), (snap)=>{
    snap.docChanges().forEach(change=>{
      const d = change.doc.data();
      if(!curUser) return;
      if(d.calleeUid===curUser.uid && d.status==='offer' && d.offer){
        onIncomingCall(change.doc.id, d);
      }
    });
  });
}
function onIncomingCall(callId, data){
  callPeerUid = data.callerUid; callPeerNick = data.callerNick || '???'; isCaller = false; isMuted=false;
  callGroupId = data.groupId || null;
  callStartTs = 0; callNotified = false;

  const btnAccept = document.createElement('button'); btnAccept.className='app-button'; btnAccept.textContent='✅ Принять';
  const btnReject = document.createElement('button'); btnReject.className='app-button'; btnReject.textContent='❌ Отклонить';
  btnAccept.onclick = ()=>acceptCall(callId, data);
  btnReject.onclick = ()=>rejectCall(callId);
  showCallModal('Входящий звонок...', callPeerNick, [btnAccept, btnReject]);
}
async function acceptCall(callId, data){
  const btnMute   = document.createElement('button'); btnMute.className='app-button'; btnMute.textContent='🔇 Mute';
  const btnHangup = document.createElement('button'); btnHangup.className='app-button'; btnHangup.textContent='❌ Завершить';
  btnMute.onclick = toggleMute; btnHangup.onclick = endCall;
  showCallModal('Вызов...', callPeerNick, [btnMute, btnHangup]);

  pc = createPeerConnection();
  localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  localStream.getTracks().forEach(t=>pc.addTrack(t, localStream));

  callDocRef = doc(fsdb, CALLS_COLLECTION, callId);
  const callerCandidatesCol = collection(fsdb, CALLS_COLLECTION, callId, 'callerCandidates');
  const calleeCandidatesCol = collection(fsdb, CALLS_COLLECTION, callId, 'calleeCandidates');

  pc.onicecandidate = e=>{ if(e.candidate) addDoc(calleeCandidatesCol, {candidate: e.candidate.toJSON()}); };

  const offer = JSON.parse(data.offer);
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await setDoc(callDocRef, { answer: JSON.stringify(answer), status:'answer' }, {merge:true});

  if(callStartTs===0) callStartTs = Date.now();

  unsubCallDoc = onSnapshot(callDocRef, async snap=>{
    const dd = snap.data();
    if(dd?.status==='end') await endCall(/*remote*/true);
  });
  unsubCallerCandidates = onSnapshot(callerCandidatesCol, (snap)=>{
    snap.docChanges().forEach(async change=>{
      if(change.type==='added'){
        try{ await pc.addIceCandidate(change.doc.data().candidate); }catch(_){}
      }
    });
  });
}
async function rejectCall(callId){
  await setDoc(doc(fsdb,CALLS_COLLECTION,callId), {status:'end'}, {merge:true});
  if(!callNotified && !callStartTs){ await postCallSystemMessage('missed'); callNotified=true; }
  await endCall();
}
function toggleMute(){
  if(!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach(t=>t.enabled = !isMuted);
  const btn = Array.from($('#callActions').children).find(b=>/Mute|Unmute/.test(b.textContent));
  if(btn) btn.textContent = isMuted ? '🔈 Unmute' : '🔇 Mute';
}
async function endCall(remote=false){
  try{
    if(!callNotified){
      if(callStartTs>0){
        await postCallSystemMessage('ended', {durationMs: Date.now()-callStartTs});
      }else if(!remote){
        await postCallSystemMessage('missed');
      }
      callNotified = true;
    }
  }catch(_){}
  hideCallModal();
  try{
    if(unsubCallDoc){unsubCallDoc();unsubCallDoc=null;}
    if(unsubCallerCandidates){unsubCallerCandidates();unsubCallerCandidates=null;}
    if(unsubCalleeCandidates){unsubCalleeCandidates();unsubCalleeCandidates=null;}
    if(pc){ pc.close(); pc=null; }
    if(localStream){ localStream.getTracks().forEach(t=>t.stop()); localStream=null; }
    $('#remoteAudio').srcObject = null;

    if(callDocRef){
      await setDoc(callDocRef, {status:'end'}, {merge:true});
    }
  }catch(_){}
  callPeerUid = null; callPeerNick=''; isCaller=false; isMuted=false;
  callStartTs = 0; callGroupId = null;
}

let groupCallUnsub = null;
let currentGroupCallId = null;
let groupCallStartTs = 0;
let groupCallIsCreator = false;

function renderJoinedUsers(joined){
  const names = (joined||[]).map(uid => {
    const u = usersCache[uid]||{};
    return u.username ? '@'+u.username : (u.email||'').split('@')[0]||'???';
  });
  $('#callJoined').textContent = names.length ? 'В звонке: ' + names.join(', ') : '';
}
async function startCallForCurrentGroup(){
  if(!currentGroupDoc) return;
  const members = currentGroupDoc.members||[];
  if(members.length===2){
    const other = members.find(u=>u!==curUser.uid);
    const nick  = usersCache[other]?.username ? '@'+usersCache[other].username : (usersCache[other]?.email||'').split('@')[0]||'Пользователь';
    callGroupId = currentGroupId;
    return startCallWithUser(other, nick);
  }
  const existing = await findActiveGroupCall(currentGroupId);
  if(existing){
    return joinGroupCall(existing.id, existing.data());
  }
  const now = Date.now();
  const docRef = await addDoc(collection(fsdb, GROUP_CALLS),{
    groupId: currentGroupId,
    creatorUid: curUser.uid,
    members: members,
    joined: [curUser.uid],
    active: true,
    createdAt: now
  });
  return joinGroupCall(docRef.id, {groupId:currentGroupId, members, joined:[curUser.uid], active:true, creatorUid:curUser.uid});
}
async function findActiveGroupCall(groupId){
  const snap = await getDocs(query(collection(fsdb, GROUP_CALLS), where('groupId','==',groupId), where('active','==',true)));
  const doc0 = snap.docs[0];
  if(doc0) return { id: doc0.id, data: ()=>doc0.data() };
  return null;
}
async function joinGroupCall(callId, data){
  currentGroupCallId = callId;
  if(groupCallUnsub) groupCallUnsub();
  const callRef = doc(fsdb, GROUP_CALLS, callId);

  if(!localStream){
    localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  }

  groupCallUnsub = onSnapshot(callRef, (s)=>{
    const d = s.data();
    if(!d || !d.active){ leaveGroupCall(); return; }
    renderJoinedUsers(d.joined||[]);
  });

  const s = await getDoc(callRef);
  const d = s.data()||{};
  const joined = Array.from(new Set([...(d.joined||[]), curUser.uid]));
  await updateDoc(callRef, { joined });

  const btnLeave = document.createElement('button'); 
  btnLeave.className='app-button'; 
  btnLeave.textContent='❌ Отменить';
  btnLeave.onclick = leaveGroupCall;
  showCallModal('Групповой звонок', currentGroupDoc?.title||'Группа', [btnLeave]);

  $('#remoteAudio').srcObject = localStream;

  groupCallIsCreator = (d.creatorUid||data.creatorUid) === curUser.uid;
  groupCallStartTs = Date.now();
}
async function leaveGroupCall(){
  try{
    if(!currentGroupCallId) return hideCallModal();
    const callRef = doc(fsdb, GROUP_CALLS, currentGroupCallId);
    const s = await getDoc(callRef);
    const d = s.data()||{};
    const joined = (d.joined||[]).filter(uid=>uid!==curUser.uid);
    const stillActive = joined.length>0;
    await updateDoc(callRef, { joined, active: stillActive });

    if(groupCallIsCreator && !stillActive){
      const dur = Date.now()-groupCallStartTs;
      const mid = `gcall-${currentGroupCallId}-ended`;
      await setDoc(doc(fsdb,"groups", currentGroupId, "messages", mid), {
        uid:'system', system:true, type:'call', message:`Групповой звонок завершён (${formatDuration(dur)})`, timestamp: Date.now()
      }, {merge:true});
      await updateDoc(doc(fsdb,'groups', currentGroupId),{
        lastMessage: `Групповой звонок завершён (${formatDuration(dur)})`,
        updatedAt: Date.now()
      });
    }
  }catch(_){}
  if(groupCallUnsub){ groupCallUnsub(); groupCallUnsub=null; }
  currentGroupCallId=null;
  groupCallStartTs=0; groupCallIsCreator=false;
  hideCallModal();
}

function renderAdminList(filter=''){
    if(curUser.role == "admin"){
        
    
  const f = (filter||'').toLowerCase();
  adminUsers.innerHTML = '';
  Object.entries(usersCache).forEach(([uid,u])=>{
    const needle = ((u.username||'')+' '+(u.email||'')).toLowerCase();
    if(f && !needle.includes(f)) return;
    const nick = u.username ? '@'+u.username : (u.email||'').split('@')[0]||'user';
    const avatar = u.avatar || avatarOf(nick);
    const role = u.role==='admin' ? 'Администратор' : 'Пользователь';

    const banned = u.ban && (!u.ban.until || Date.now() < u.ban.until);
    const untilTxt = banned ? new Date(u.ban.until).toLocaleString('ru-RU') : '';
    const row = document.createElement('div');
    row.className='urow';
    row.innerHTML = `
      <img src="${avatar}" alt="">
      <div class="meta">
        <div><b>${escapeHtml(nick)}</b> <span class="tag">${role}</span></div>
        <div style="color:#aaa">${escapeHtml(u.email||'')}</div>
        ${banned ? `<div style="color:#ff7d7d">Бан до: ${untilTxt}<br>Причина: ${escapeHtml(u.ban.reason||'—')}</div>` : ''}
      </div>
      <div class="actions">
        ${banned
          ? `<button class="app-button" data-act="unban">🔓 Разбан</button>`
          : `<button class="app-button" data-act="ban">🚫 Бан</button>`}
      </div>
    `;
    row.querySelector('[data-act]').onclick = async ()=>{
      if(row.querySelector('[data-act]').dataset.act === 'ban'){
        const reason = prompt('Причина бана:','Нарушение правил');
        if(!reason) return;
        const minsStr = prompt('Срок (минуты):','60');
        const mins = parseInt(minsStr,10);
        if(isNaN(mins) || mins<=0) return showToast('Некорректный срок','error');
        await set(ref(rtdb,'users/'+uid+'/ban'), { reason, until: Date.now()+mins*60000 });
        showToast('Пользователь забанен','success');
      }else{
        await set(ref(rtdb,'users/'+uid+'/ban'), null);
        showToast('Пользователь разбанен','success');
      }
      await refreshUsersCache();
      renderAdminList(adminSearch.value);
    };
    adminUsers.appendChild(row);
  });
    }
}
if(curUser.role == "admin"){
adminSearch.addEventListener('input',()=>renderAdminList(adminSearch.value));
}
document.getElementById('openAdminPanel').onclick = () => {
  renderAdminList('');
  if(curUser.role == "admin"){
    showModal(adminPanelModal);
  }
  
};


onAuthStateChanged(auth, async (user) => {
  curUser = user || null;

  if (user) {
    await initUser(user.uid);
    setAuthUI(true);
    async function initUser(uid) {
  try {
    const snap = await get(ref(rtdb, 'users/' + uid));
    if (!snap.exists()) {
      console.warn("⚠️ Пользователь не найден в БД");
      showToast("Проблема с подключением или профиль отсутствует", "error");
      return;
    }

    const u = snap.val();
    curUserData = {
      username: u.username || '',
      avatar: u.avatar || '',
      role: u.role || 'user',
      email: u.email || ''
    };

    const banned = u.ban && (!u.ban.until || Date.now() < u.ban.until);
    if (banned) {
      banReasonEl.textContent = u.ban.reason || "Не указана";
      banUntilEl.textContent = u.ban.until
        ? new Date(u.ban.until).toLocaleString("ru-RU")
        : "Навсегда";

      showModal(bannedModal);
      return;
    }

  } catch (err) {
    console.error("Ошибка загрузки пользователя:", err);
    showToast("Ошибка соединения с Firebase", "error");
  }
}
    profileEmail.textContent = user.email;

    try {
      const snap = await get(ref(rtdb, 'users/' + user.uid));
      const u = snap.exists() ? snap.val() : {};

      curUserData = {
        username: u.username || '',
        avatar: u.avatar || '',
        role: u.role ,
        email: user.email
      };

      profileUsername.textContent   = curUserData.username || '(не задан)';
      profileRoleBadge.textContent  = ROLE_LABELS[curUserData.role] || 'Пользователь';
      profileRoleBadge.className    = ROLE_CLASS[curUserData.role]  || ROLE_CLASS.user;
      profileAvatar.src             = curUserData.avatar || avatarOf(curUserData.username);

      if(curUserData.role == "admin"){
        openAdminPanel.style.display = "inline-flex";
      }
      else{
        openAdminPanel.style.display = "none";
      }
      

    } catch (err) {
      console.error("Ошибка получения данных пользователя:", err);
    }
  } else {
    setAuthUI(false);
    curUserData = null;
    openAdminPanel.style.display = "none";
    };

    onAuthStateChanged(auth, async (user) => {
  if (user) {
    curUser = user;

    const snap = await get(ref(rtdb, 'users/' + user.uid));
    if (snap.exists()) {
      curUserData = snap.val();

      if (curUserData.ban) {
        const ban = curUserData.ban;
        const stillBanned = !ban.until || Date.now() < ban.until;

        if (stillBanned) {
          banReasonEl.textContent = ban.reason || 'Не указана';
          banUntilEl.textContent = ban.until ? new Date(ban.until).toLocaleString('ru-RU') : 'Бессрочно';
          showModal(bannedModal);

          document.querySelector('.pill-navbar').style.display = 'none';

          return;
        } else {
          await set(ref(rtdb, 'users/' + user.uid + '/ban'), null);
        }
      }
    }

    setAuthUI(true);
    await refreshUsersCache();
  } else {
    curUser = null;
    curUserData = {};
    setAuthUI(false);
  }
});

  });

async function checkBan(uid){
  const snap = await get(ref(rtdb,'users/'+uid+'/ban'));
  if(!snap.exists()){ isBanned=false; return; }
  const ban = snap.val();
  if(!ban.until || Date.now() < ban.until){
    isBanned = true;
    banReasonEl.textContent = ban.reason || 'Не указана';
    banUntilEl.textContent  = ban.until ? new Date(ban.until).toLocaleString('ru-RU') : 'Бессрочно';
    showModal(bannedModal);
  }else{
    await set(ref(rtdb,'users/'+uid+'/ban'), null);
    isBanned=false;
  }
}

async function bootstrap(){
  setAuthUI(false);
  onAuthStateChanged(auth, async (user)=>{
    curUser = user || null;
    if(user){
      setAuthUI(true);
      profileEmail.textContent = user.email;

      const snap = await get(ref(rtdb,'users/'+user.uid));
      const u = snap.exists()? snap.val() : {};
      curUserData = {
        username:u.username||'',
        avatar:u.avatar||'',
        role:u.role|| (user.email===ADMIN_EMAIL?'admin':'user'),
        email:user.email
      };
      profileUsername.textContent = curUserData.username || '(не задан)';    profileRoleBadge.textContent = ROLE_LABELS[curUserData.role] || 'Пользователь';
      profileRoleBadge.className = ROLE_CLASS[curUserData.role] || ROLE_CLASS.user;
      profileAvatar.src = curUserData.avatar || avatarOf(curUserData.username||user.email);

      await refreshUsersCache();
      listenGroupList();
      listenIncomingCalls();
      postForm.style.display = '';
      postFormHint.style.display = 'none';
    }else{
      setAuthUI(false);
      curUserData = {username:"", avatar:"", role:"user", email:""};
      usersCache = {};
      chatList.innerHTML='';
      chatMessages.innerHTML='';
      postForm.style.display = 'none';
      postFormHint.style.display = '';
    }
  });
}
bootstrap();
