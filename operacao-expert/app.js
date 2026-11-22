'use strict';
const $ = selector => document.querySelector(selector);
const key = 'operacao-meta-v1';
const today = new Date().toLocaleDateString('sv-SE', {timeZone:'America/Sao_Paulo'});
const sample = {
  bms:[{id:'bm1',name:'BM Demonstração',meta:'100001',owner:'Equipe de mídia'}],
  accounts:[{id:'ac1',name:'Conta Exemplo',meta:'200001',bm:'bm1',status:'Ativa'}],
  assets:[{id:'as1',name:'Pixel Exemplo',type:'Pixel',account:'ac1',reference:'300001',ownerBm:'bm1',sharedBms:[]}],
  access:['UTMify','VTurb','RedTrack'].map((platform,index)=>({id:'tool'+index,platform,name:'',owner:'',reference:''})),
  spend:[{id:'sp1',account:'ac1',date:today,amount:'250.00',currency:'BRL',note:'Lançamento de exemplo'}]
};
let data;
try { data = JSON.parse(localStorage.getItem(key)) || sample; } catch { data = sample; }
data.links??=[];
let localData=data;
let sharedMode=false;
let page = 'spend';
let linkCategory='';
const expandedBms = new Set();
let editing;
const filter = {account:'',start:today.slice(0,7)+'-01',end:''};
const dialog = $('#editor');
const real = 'BRL';
const options = values => values.map(value => [value,value]);
const records = list => data[list].map(item => [item.id,item.name]);
const name = (list,id) => data[list].find(record => record.id === id)?.name || '—';
const schema = {
  spend:{label:'Lançamento',fields:[['account','Conta','select',()=>records('accounts')],['date','Data','date',today],['amount','Valor (R$)','number'],['note','Observação','text',null,true]],columns:['Data','Conta','Valor','Observação'],row:r=>[date(r.date),name('accounts',r.account),r.currency===real?money(cents(r.amount)): 'Conversão pendente',r.note]},
  bms:{label:'BM',fields:[['name','Nome','text'],['meta','ID da BM','text'],['owner','Responsável','text',null,true]],columns:['Nome','ID na Meta','Responsável'],row:r=>[r.name,r.meta,r.owner]},
  accounts:{label:'Conta de anúncios',fields:[['name','Nome','text'],['meta','ID da conta','text'],['bm','BM','select',()=>records('bms')],['status','Status','select',()=>options(['Ativa','Pausada','Restrita'])]],columns:['Conta','ID na Meta','BM','Status','Cartão'],row:r=>[r.name,r.meta,name('bms',r.bm),r.status,accountCards(r.id)]},
  assets:{label:'Ativo',fields:[['name','Nome ou apelido','text'],['type','Tipo','select',()=>options(['Página','Pixel','Perfil conectado','Cartão'])],['account','Conta','select',()=>records('accounts')],['reference','ID, usuário ou final do cartão','text',null,true]],columns:['Nome','Tipo','Conta','Referência','BM proprietária','Compartilhado com'],row:r=>[r.name,r.type,name('accounts',r.account),r.reference,r.type==='Pixel'?(r.ownerBm?name('bms',r.ownerBm):'A definir'):'',r.type==='Pixel'?(r.sharedBms||[]).map(id=>name('bms',id)).join(', '):'']},
  links:{label:'Link',fields:[['name','Nome','text'],['category','Categoria','text',null,true],['url','Endereço (URL)','url'],['description','Descrição','text',null,true]],columns:['Nome','Categoria','Descrição','Link'],row:r=>[r.name,r.category,r.description,r.url]},
  access:{label:'Plataforma',fields:[['platform','Nome da plataforma','text'],['plan','Plano','text',null,true],['monthlyFee','Mensalidade (R$)','number',null,true],['name','Usuário ou e-mail','text',null,true],['owner','Responsável','text',null,true]],columns:['Plataforma','Plano','Mensalidade','Usuário','Responsável','Senha'],row:r=>[r.platform || 'Meta',r.plan,r.monthlyFee!=null&&r.monthlyFee!==''?money(cents(r.monthlyFee)):'',r.name,r.owner,r.secret?'Salva':'—']}
};
const pages = {
  spend:['Gastos','Acompanhe os gastos com anúncios e assinaturas.','Lançar gasto','spend'],
  accounts:['BMs','Abra uma BM para ver e gerenciar suas contas de anúncio.','Nova BM','bms'],
  assets:['Ativos','Vincule páginas, pixels, perfis e cartões às contas.','Novo ativo','assets'],
  links:['Links','Organize os endereços usados pela equipe.','Novo link','links'],
  access:['Plataformas','Cadastre as ferramentas usadas na operação e seus dados de acesso.','Nova plataforma','access']
};
function el(tag,value='',cls=''){
  const node=document.createElement(tag);
  node.textContent=value;
  if(cls) node.className=cls;
  return node;
}
function button(label,action,cls='quiet'){
  const node=el('button',label,cls);
  node.type='button';
  node.addEventListener('click',action);
  return node;
}
function date(value){ return value.split('-').reverse().join('/'); }
function cents(amount){ return Math.round(Number(amount)*100); }
function money(cents,currency=real){
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency}).format(cents/100);
}
function monthlyPlatformTotal(){
  return data.access.reduce((total,platform)=>total+cents(platform.monthlyFee??0),0);
}
function totalCard(label,total,detail){
  const card=el('div','','card');
  card.append(el('span',label),el('strong',money(total)));
  if(detail) card.append(el('p',detail,'card-detail'));
  return card;
}
function field([id,label,type,initial,optional],value){
  const wrapper=el('label',label);
  const input=el(type==='select'?'select':'input');
  input.name=id;
  input.required=!optional;
  if(type==='select'){
    for(const [key,title] of initial()) input.add(new Option(title,key));
  } else {
    input.type=type;
    if(type==='number') { input.min=id==='monthlyFee'?'0':'0.01';input.max='999999999.99';input.step='0.01'; }
  }
  if(value!==undefined || type!=='select') input.value=value??initial??'';
  wrapper.append(input);
  return wrapper;
}
function accountCards(accountId){
  return data.assets.filter(asset=>asset.type==='Cartão'&&asset.account===accountId)
    .map(card=>card.reference?card.name+' · •••• '+card.reference:card.name).join(', ');
}
function webUrl(value){
  try{
    const url=new URL(value);
    if(['https:','http:'].includes(url.protocol)&&!url.username&&!url.password) return url.href;
  }catch{}
  return null;
}
function table(type,title,items,panel=el('div','','panel')){
  if(title) panel.append(el('h2',title));
  if(!items.length){panel.append(el('p','Nenhum registro encontrado.','empty'));return panel;}
  const grid=el('table');
  const head=grid.createTHead().insertRow();
  for(const column of [...schema[type].columns,'Ações']){
    const cell=el('th',column);cell.scope='col';head.append(cell);
  }
  const body=grid.createTBody();
  for(const item of items){
    const row=body.insertRow();
    if(type==='bms') row.className='bm-row';
    const details=type==='bms'?body.insertRow():null;
    for(const [index,value] of schema[type].row(item).entries()){
      const cell=row.insertCell();
      if(details&&index===0){
        const toggle=button(value,()=>{
          if(expandedBms.has(item.id)) expandedBms.delete(item.id);
          else expandedBms.add(item.id);
          details.hidden=!expandedBms.has(item.id);
          toggle.setAttribute('aria-expanded',String(!details.hidden));
        },'bm-link');
        toggle.setAttribute('aria-expanded',String(expandedBms.has(item.id)));
        toggle.setAttribute('aria-controls','accounts-'+item.id);
        cell.append(toggle);
      } else if(type==='links'&&schema.links.columns[index]==='Link'&&webUrl(value)){
        const link=el('a','Abrir link');
        link.href=webUrl(value);
        link.target='_blank';
        link.rel='noopener noreferrer';
        cell.append(link);
      } else cell.textContent=value||'—';
    }
    const actions=row.insertCell();
    actions.append(button('Editar',()=>open(type,item)));
    if(type==='accounts'){
      const addCard=button('Adicionar cartão',()=>open('assets',null,null,item));
      addCard.setAttribute('aria-label','Adicionar cartão à conta '+item.name);
      actions.append(addCard);
    }
    if(details){
      details.id='accounts-'+item.id;
      details.hidden=!expandedBms.has(item.id);
      details.className='bm-details';
      const cell=details.insertCell();
      cell.colSpan=schema[type].columns.length+1;
      const section=el('div','','panel');
      const toolbar=el('div','','bm-toolbar');
      toolbar.append(el('h2','Contas de anúncio'),button('Adicionar conta',()=>open('accounts',null,item),'primary'));
      section.append(toolbar);
      cell.append(table('accounts','',data.accounts.filter(account=>account.bm===item.id),section));
    }
  }
  panel.append(grid);
  return panel;
}
function linkList(){
  const items=[...data.links].sort((a,b)=>(a.category||'').localeCompare(b.category||'','pt-BR')||
    a.name.localeCompare(b.name,'pt-BR'));
  const categoryKey=item=>item.category?.trim().toLocaleLowerCase('pt-BR')||'';
  const names=new Map(items.filter(categoryKey).map(item=>[categoryKey(item),item.category.trim()]));
  if(linkCategory&&!names.has(linkCategory)) linkCategory='';
  const section=el('section');
  const controls=el('div','','link-filters');
  const category=field(['linkCategory','Filtrar por categoria','select',
    ()=>[['','Todas as categorias'],...names],true],linkCategory);
  const results=el('div');
  const update=()=>{
    const filtered=linkCategory?items.filter(item=>categoryKey(item)===linkCategory):items;
    results.replaceChildren(table('links','',filtered));
  };
  category.lastChild.addEventListener('change',event=>{linkCategory=event.target.value;update();});
  controls.append(category);
  if(names.size) section.append(controls);
  section.append(results);
  update();
  return section;
}
function draw(){
  $('nav').replaceChildren(...Object.entries(pages).map(([id,[title]])=>{
    const tab=button(title,()=>{page=id;draw();},'');
    if(page===id) tab.setAttribute('aria-current','true');
    return tab;
  }));
  const [title,description,action,type]=pages[page];
  $('header div').textContent=['access','links'].includes(page)?'Operação / '+title:'Operação / Meta Ads';
  const heading=el('div','','heading');
  const intro=el('div');intro.append(el('h1',title),el('p',description));
  heading.append(intro);
  if(data[type]!==null) heading.append(button(action,()=>open(type),'primary'));
  const view=$('#view');view.replaceChildren(heading);
  if(page==='spend'){
    const panel=el('div','','panel');
    const filters=el('div','','filters');
    for(const spec of [
      ['account','Conta','select',()=>[['','Todas as contas'],...records('accounts')],true],
      ['start','De','date',null,true],['end','Até','date',null,true]
    ]){
      const wrapper=field(spec,filter[spec[0]]);
      wrapper.lastChild.addEventListener('change',event=>{filter[spec[0]]=event.target.value;draw();});
      filters.append(wrapper);
    }
    const items=data.spend.filter(r=>(!filter.account||r.account===filter.account)&&
      (!filter.start||r.date>=filter.start)&&(!filter.end||r.date<=filter.end))
      .sort((a,b)=>b.date.localeCompare(a.date));
    const cards=el('div','','cards');
    const total=items.filter(r=>r.currency===real).reduce((sum,r)=>sum+cents(r.amount),0);
    cards.classList.add('spend-totals');
    cards.append(
      totalCard('Facebook Ads',total,'Gastos das contas e do período selecionados'),
      totalCard('Plataformas',monthlyPlatformTotal(),'Por mês · Mensalidades cadastradas')
    );
    panel.append(el('h2','Lançamentos de Facebook Ads'));
    if(items.some(r=>r.currency!==real)){
      panel.append(el('p','Edite os gastos com conversão pendente para incluí-los no total em reais.','empty'));
    }
    panel.append(filters);
    view.append(cards,table(type,'',items,panel));
  } else {
    if(page==='access'){
      const cards=el('div','','cards');
      cards.append(totalCard('Total mensal de plataformas',monthlyPlatformTotal()));
      view.append(cards);
    }
    if(data[type]===null){
      const note=el('p','Execute a migração de Links no SQL Editor do Supabase e clique em Atualizar dados. ','empty');
      const link=el('a','Abrir migração');
      link.href='configurar-links.sql';
      link.target='_blank';
      link.rel='noopener noreferrer';
      note.append(link);
      view.append(note);
    } else if(type==='links') view.append(linkList());
    else view.append(table(type,'',data[type]));
  }
}
async function passwordKey(master,salt){
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(master),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},
    material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']
  );
}
async function encryptPassword(password,master){
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await passwordKey(master,salt);
  const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(password));
  return {salt:[...salt],iv:[...iv],ciphertext:[...new Uint8Array(bytes)]};
}
async function decryptPassword(secret,master){
  const key=await passwordKey(master,new Uint8Array(secret.salt));
  const bytes=await crypto.subtle.decrypt(
    {name:'AES-GCM',iv:new Uint8Array(secret.iv)},key,new Uint8Array(secret.ciphertext)
  );
  return new TextDecoder().decode(bytes);
}
function passwordFields(secret){
  const password=field(['platformPassword',secret?'Nova senha da plataforma':'Senha da plataforma','password',null,true]);
  const master=field(['masterPassword','Senha mestra','password',null,true]);
  password.lastChild.autocomplete='new-password';
  master.lastChild.autocomplete='off';
  const hint=el('p',secret?'Use a senha mestra para consultar a senha salva. Deixe a nova senha em branco para mantê-la.':
    'Para guardar uma senha, use uma senha mestra de pelo menos 12 caracteres. Guarde-a para poder consultar suas senhas.');
  hint.className='password-hint';
  $('#fields').append(password,master,hint);
  if(!secret) return;
  const output=el('input');
  output.readOnly=true;
  output.hidden=true;
  output.setAttribute('aria-label','Senha da plataforma revelada');
  const reveal=button('Mostrar senha',async()=>{
    if(!output.hidden){
      output.value='';output.hidden=true;reveal.textContent='Mostrar senha';return;
    }
    const passphrase=master.lastChild.value;
    if(!passphrase){$('#error').textContent='Preencha a senha mestra.';return;}
    reveal.disabled=true;
    $('#error').textContent='';
    try {
      output.value=await decryptPassword(secret,passphrase);
      if(output.isConnected&&dialog.open){
        output.hidden=false;reveal.textContent='Ocultar senha';
      } else output.value='';
    } catch {
      if(reveal.isConnected&&dialog.open) $('#error').textContent='Não foi possível revelar a senha. Confira a senha mestra.';
    } finally {
      reveal.disabled=false;
    }
  });
  $('#fields').append(reveal,output);
}
function configureAssetFields(item){
  const type=$('#fields [name=type]');
  const account=$('#fields [name=account]');
  account.add(new Option('Selecione uma conta',''),0);
  account.value=item?.account||'';
  const owner=field(['ownerBm','BM proprietária','select',()=>[['','Selecione uma BM'],...records('bms')]],item?.ownerBm||'');
  const ownerSelect=owner.lastChild;
  const shared=el('fieldset','','pixel-sharing');
  shared.append(el('legend','Compartilhado com'));
  if(!data.bms.length) shared.append(el('p','Cadastre uma BM para vincular o pixel.'));
  for(const bm of data.bms){
    const label=el('label');
    const check=el('input');
    check.type='checkbox';
    check.name='sharedBms';
    check.value=bm.id;
    check.checked=(item?.sharedBms||[]).includes(bm.id);
    label.append(check,document.createTextNode(bm.name));
    shared.append(label);
  }
  const refresh=()=>{
    const pixel=type.value==='Pixel';
    account.required=!pixel;
    owner.hidden=shared.hidden=!pixel;
    ownerSelect.disabled=!pixel;
    for(const check of shared.querySelectorAll('input')){
      check.disabled=!pixel||check.value===ownerSelect.value;
      if(pixel&&check.disabled) check.checked=false;
    }
  };
  type.addEventListener('change',refresh);
  ownerSelect.addEventListener('change',refresh);
  $('#fields').append(owner,shared);
  refresh();
}
let saving=false;
function open(type,item,bm,cardAccount){
  editing={type,id:item?.id,bm:bm?.id,cardAccount:cardAccount?.id};
  $('#error').textContent='';
  $('#form-title').textContent=(item?'Editar · ':'Adicionar · ')+schema[type].label;
  const foreignSpend=type==='spend'&&item&&item.currency!==real;
  const values=foreignSpend?{...item,amount:''}:type==='access'&&item?{...item,platform:item.platform||'Meta'}:item;
  const specs=schema[type].fields.filter(([key])=>(!bm||key!=='bm')&&(!cardAccount||!['type','account'].includes(key)));
  $('#fields').replaceChildren(...specs.map(spec=>field(spec,values?.[spec[0]])));
  if(foreignSpend){
    $('#fields').prepend(el('p','Valor original: '+money(cents(item.amount),item.currency)+'. Informe o equivalente em reais.'));
  }
  if(cardAccount){
    $('#form-title').textContent='Adicionar cartão';
    $('#fields').prepend(el('p','Conta · '+cardAccount.name));
    const reference=$('#fields [name=reference]');
    reference.parentElement.firstChild.nodeValue='Últimos quatro dígitos';
    reference.inputMode='numeric';
    reference.maxLength=4;
    reference.required=true;
  } else if(type==='assets') configureAssetFields(item);
  if(type==='access') passwordFields(item?.secret);
  if(bm) $('#fields').prepend(el('p','BM · '+bm.name));
  const missing=[...$('#fields').querySelectorAll('select')].some(select=>!select.options.length);
  $('#form .primary').disabled=missing;
  if(missing) $('#error').textContent=type==='accounts'?'Cadastre uma BM primeiro.':'Cadastre uma conta de anúncios primeiro.';
  dialog.showModal();
}
$('#close').onclick=()=>dialog.close();
$('#cancel').onclick=()=>dialog.close();
dialog.addEventListener('cancel',event=>{if(saving) event.preventDefault();});
dialog.addEventListener('close',()=>{if(!dialog.open) $('#fields').replaceChildren();});
$('#form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(saving) return;
  const {type,id,bm,cardAccount}=editing;
  const formData=new FormData(event.target);
  const values=Object.fromEntries(schema[type].fields
    .filter(([key])=>formData.has(key))
    .map(([key])=>[key,formData.get(key).trim()]));
  if(bm) values.bm=bm;
  if(cardAccount){
    values.type='Cartão';
    values.account=cardAccount;
  }
  if(type==='links'&&!webUrl(values.url)){
    $('#error').textContent='Informe um endereço que comece com https:// ou http://.';return;
  }
  if(type==='spend') values.currency=real;
  const pixel=type==='assets'&&values.type==='Pixel';
  if(pixel){
    values.ownerBm=formData.get('ownerBm');
    if(!data.bms.some(bm=>bm.id===values.ownerBm)){
      $('#error').textContent='Selecione a BM proprietária do pixel.';return;
    }
    values.sharedBms=formData.getAll('sharedBms').filter(id=>id!==values.ownerBm&&data.bms.some(bm=>bm.id===id));
  }
  if(schema[type].fields.some(([key,,, ,optional])=>!optional&&!values[key]&&!(pixel&&key==='account'))){
    $('#error').textContent='Preencha os campos obrigatórios.';return;
  }
  if(type==='assets'&&values.type==='Cartão'&&(cardAccount||values.reference)&&!/^\d{4}$/.test(values.reference)){
    $('#error').textContent='Informe somente os quatro últimos dígitos do cartão.';return;
  }
  if(values.meta&&data[type].some(row=>row.meta===values.meta&&row.id!==id)){
    $('#error').textContent='Já existe um registro com esse ID.';return;
  }
  const record={id:id||globalThis.crypto?.randomUUID?.()||Date.now().toString(36),...values};
  if(type==='access'){
    const existing=data.access.find(row=>row.id===id);
    const password=formData.get('platformPassword');
    const master=formData.get('masterPassword');
    if(existing?.reference) record.reference=existing.reference;
    if(existing?.secret) record.secret=existing.secret;
    if(password){
      if(master.length<12){
        $('#error').textContent='Use uma senha mestra com pelo menos 12 caracteres.';return;
      }
      const firstSecret=existing?.secret||data.access.find(row=>row.secret)?.secret;
      const controls=[$('#form .primary'),$('#close'),$('#cancel')];
      saving=true;
      for(const control of controls) control.disabled=true;
      $('#error').textContent='';
      try {
        if(firstSecret) await decryptPassword(firstSecret,master);
        record.secret=await encryptPassword(password,master);
      } catch {
        $('#error').textContent='Não foi possível proteger a senha. Confira a senha mestra.';
        return;
      } finally {
        saving=false;
        for(const control of controls) control.disabled=false;
      }
    }
  }
  const next={...data,[type]:id?data[type].map(row=>row.id===id?record:row):[...data[type],record]};
  if(sharedMode){
    const previous=data[type].find(row=>row.id===id);
    const controls=[$('#form .primary'),$('#close'),$('#cancel')];
    saving=true;
    for(const control of controls) control.disabled=true;
    try{
      record.revision=await expertCloud.save(type,record,previous);
    } catch(error){
      $('#error').textContent=error.status?'Não foi possível salvar no Supabase. Confira seu acesso ou atualize os dados.':error.message;
      return;
    } finally {
      saving=false;
      for(const control of controls) control.disabled=false;
    }
  } else {
    try { localStorage.setItem(key,JSON.stringify(next)); }
    catch { $('#error').textContent='O navegador não conseguiu guardar o registro.';return; }
    localData=next;
  }
  data=next;
  dialog.close();
  draw();
});
const loginScreen=$('#cloud-login');
const panelSidebar=$('#panel-sidebar');
const panelMain=$('#panel-main');
const cloudForm=$('#cloud-form');
const cloudToggle=$('#cloud-toggle');
const cloudRefresh=$('#cloud-refresh');
const cloudStatus=$('#cloud-status');
let loadingCloud=false;

function showDataMode(){
  expandedBms.clear();
  filter.account='';
  linkCategory='';
  loginScreen.hidden=true;
  panelSidebar.hidden=panelMain.hidden=false;
  document.body.classList.remove('login-active');
  cloudToggle.textContent=sharedMode?'Sair':'Entrar na equipe';
  cloudRefresh.hidden=!sharedMode;
  $('.local').textContent=sharedMode?'Equipe · Dados no Supabase':'Modo local · Dados neste navegador';
  draw();
  $('#view h1').tabIndex=-1;
  $('#view h1').focus();
}
cloudToggle.onclick=()=>{
  expertCloud.signOut();
  sharedMode=false;
  data=localData;
  $('#view').replaceChildren();
  panelSidebar.hidden=panelMain.hidden=true;
  document.body.classList.add('login-active');
  loginScreen.hidden=false;
  cloudStatus.textContent='';
  $('#cloud-error').textContent='';
  cloudForm.reset();
  cloudForm.elements.email.focus();
};
const localButton=$('#cloud-local');
localButton.onclick=()=>{
  cloudForm.reset();
  showDataMode();
};
localButton.disabled=$('#cloud-submit').disabled=false;
cloudForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(loadingCloud) return;
  const formData=new FormData(cloudForm);
  const controls=[$('#cloud-submit'),localButton];
  controls.forEach(control=>control.disabled=true);
  loadingCloud=true;
  $('#cloud-error').textContent='';
  try{
    data=await expertCloud.signIn(formData.get('email').trim(),formData.get('password'));
    sharedMode=true;
    cloudForm.reset();
    showDataMode();
  } catch(error){
    $('#cloud-error').textContent=error.message;
  } finally {
    loadingCloud=false;
    controls.forEach(control=>control.disabled=false);
  }
});
cloudRefresh.onclick=async()=>{
  if(loadingCloud) return;
  loadingCloud=true;
  cloudToggle.disabled=cloudRefresh.disabled=true;
  $('#view').inert=true;
  try{
    data=await expertCloud.load();
    draw();
    cloudStatus.textContent='Dados atualizados.';
  }catch{
    cloudStatus.textContent='Falha ao atualizar. Confira seu acesso e entre novamente se precisar.';
  }finally{
    $('#view').inert=false;
    cloudToggle.disabled=cloudRefresh.disabled=false;
    loadingCloud=false;
  }
};

const themeToggle=$('#theme-toggle');
const themeKey='operacao-expert-theme';
function applyTheme(dark){
  document.documentElement.dataset.theme=dark?'dark':'light';
  themeToggle.setAttribute('aria-checked',String(dark));
}
let savedTheme;
try { savedTheme=localStorage.getItem(themeKey); } catch {}
applyTheme(savedTheme==='dark');
themeToggle.onclick=()=>{
  const dark=document.documentElement.dataset.theme!=='dark';
  applyTheme(dark);
  try{ localStorage.setItem(themeKey,dark?'dark':'light'); }catch{}
};
