'use strict';

const expertCloud = (() => {
  const endpoint = 'https://wvxcdduqicfqkqahwesb.supabase.co';
  const publishable = 'sb_publishable_uu9QxxB7YNG0ACvwUxlcgg_Dm82m1fR';
  const tables = {bms:'expert_bms',accounts:'expert_accounts',assets:'expert_assets',access:'expert_platforms',spend:'expert_spend',links:'expert_links'};
  let session;

  async function request(path,{method='GET',body,token,headers={}}={}){
    const response=await fetch(endpoint+path,{
      method,headers:{apikey:publishable,...(token?{Authorization:'Bearer '+token}:{}),
        ...(body?{'Content-Type':'application/json'}:{}),...headers},
      body:body?JSON.stringify(body):undefined
    });
    const result=await response.json().catch(()=>null);
    if(!response.ok){
      const error=new Error('Falha na comunicação com o Supabase.');
      error.status=response.status;
      error.code=result?.code;
      throw error;
    }
    return result;
  }
  async function token(){
    if(session.expires_at <= Date.now()/1000+45){
      session=await request('/auth/v1/token?grant_type=refresh_token',{
        method:'POST',body:{refresh_token:session.refresh_token}
      });
    }
    return session.access_token;
  }
  async function load(){
    const accessToken=await token();
    const member=await request('/rest/v1/expert_members?select=user_id',{token:accessToken});
    if(!member.length) throw new Error('Seu usuário ainda precisa ser autorizado no Supabase.');
    const entries=await Promise.all(Object.entries(tables).map(async ([type,table])=>{
      const result=[];
      for(let offset=0;;offset+=500){
        const rows=await request('/rest/v1/'+table+'?select=id,record,revision&order=id&limit=500&offset='+offset,{token:accessToken})
          .catch(error=>{
            if(type==='links'&&['PGRST205','42P01'].includes(error.code)) return null;
            throw error;
          });
        if(rows===null) return [type,null];
        result.push(...rows.map(row=>{
          const {encryptedPassword,...record}=row.record;
          return {...record,id:row.id,revision:row.revision,
            ...(type==='access'&&encryptedPassword?{secret:encryptedPassword}:{})};
        }));
        if(rows.length<500) break;
      }
      return [type,result];
    }));
    return Object.fromEntries(entries);
  }
  async function signIn(email,password){
    try{
      session=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    } catch(error){
      throw new Error([400,401].includes(error.status)?'Confira seu e-mail e sua senha.':'Não foi possível conectar ao Supabase.');
    }
    try {return await load();}
    catch(error){
      session=undefined;
      if(error.code==='PGRST205'||error.code==='42P01') throw new Error('Execute primeiro o SQL de configuração no Supabase.');
      throw error;
    }
  }
  async function save(type,record,previous){
    const {id,secret,revision,...values}=record;
    if(type==='access'&&secret) values.encryptedPassword=secret;
    const path='/rest/v1/'+tables[type]+(previous?'?id=eq.'+encodeURIComponent(id)+'&revision=eq.'+previous.revision:'');
    const tokenValue=await token();
    const saved=await request(path,{
      method:previous?'PATCH':'POST',token:tokenValue,headers:{Prefer:'return=representation'},
      body:previous?{record:values,revision:previous.revision+1}:{id,record:values}
    });
    if(!saved.length) throw new Error('Este registro mudou ou seu acesso foi removido. Atualize os dados e tente novamente.');
    return saved[0].revision;
  }
  return {signIn,load,save,signOut:()=>{session=undefined;}};
})();
