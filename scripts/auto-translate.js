// auto-translate.js — Full Script with Batching, Progress Tracking, Recovery,
// Category Translation, Backup, Flags, and Error Handling

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  languages: ['de', 'en', 'es', 'fr'],
  baseLanguage: 'de',
  fallbackLanguage: 'en',
  openaiModel: 'gpt-4o-mini',
  maxTokens: 150,
  temperature: 0.3,
  batchSize: 10,
  backupEnabled: true,
  dryRun: false,
  checkOnly: false,
  saveProgress: true,
  maxRetries: 3,
  resultsFile: 'translation-results.json'
};

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const QUESTIONS_DIR = path.join(PROJECT_ROOT, 'public', 'questions');
const CATEGORIES_FILE = path.join(QUESTIONS_DIR, 'categories.json');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'translation-backups');
const RESULTS_FILE = path.join(PROJECT_ROOT, CONFIG.resultsFile);

// Language names for prompts
const LANGUAGE_NAMES = { de: 'German', en: 'English', es: 'Spanish', fr: 'French' };

/*** Utility: parse CLI flags ***/
process.argv.slice(2).forEach(arg => {
  if (arg === '--dry-run') CONFIG.dryRun = true;
  if (arg === '--check-only') { CONFIG.checkOnly = true; CONFIG.dryRun = true; }
  if (arg === '--no-backup') CONFIG.backupEnabled = false;
});

/*** Backup Creator ***/
function createBackup() {
  if (!CONFIG.backupEnabled) return;
  const ts = new Date().toISOString().replace(/[.:]/g, '-');
  const dest = path.join(BACKUP_DIR, `backup-${ts}`);
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(QUESTIONS_DIR, dest, { recursive: true });
  console.log(`📁 Backup created at ${dest}`);
}

/*** Progress Tracker ***/
class TranslationProgressTracker {
  constructor() {
    this.results = { startTime: new Date().toISOString(), totalTokensUsed: 0,
      translationsCompleted: 0, errors: [], completedCategories: {},
      translatedQuestions: {}, status: 'running' };
    this.loadExisting();
  }
  loadExisting() {
    if (!CONFIG.saveProgress) return;
    if (fs.existsSync(RESULTS_FILE)) {
      try {
        const existing = JSON.parse(fs.readFileSync(RESULTS_FILE));
        if (existing.status === 'running') {
          console.log('📄 Resuming existing session');
          Object.assign(this.results, existing);
        }
      } catch(_){}
    }
  }
  save() { if (!CONFIG.saveProgress) return;
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null,2));
  }
  markCategory(language, categoryId, count) {
    this.results.completedCategories[language] = this.results.completedCategories[language] || {};
    this.results.completedCategories[language][categoryId] = { completed: true, count, timestamp: new Date().toISOString() };
    this.save();
  }
  addQuestion(language, categoryId, tokens) {
    this.results.translationsCompleted++;
    this.results.totalTokensUsed += tokens;
    this.save();
  }
  addError(err, ctx) {
    this.results.errors.push({ error: err.message, context: ctx, timestamp: new Date().toISOString() });
    this.save();
  }
  complete(status='completed') {
    this.results.status = status;
    this.results.endTime = new Date().toISOString();
    this.save();
    console.log(`\n📊 Completed: ${this.results.translationsCompleted} translations, ~${this.results.totalTokensUsed} tokens, ${this.results.errors.length} errors`);
  }
}

/*** Translation Service ***/
class TranslationService {
  constructor(key) { this.apiKey = key; this.times = []; }
  async rateLimit() {
    const now=Date.now(); this.times=this.times.filter(t=>t>now-60000);
    if(this.times.length>=30) await new Promise(r=>setTimeout(r,60000-(now-this.times[0])));
  }
  async translateBatch(items, lang, ctx) {
    if (CONFIG.checkOnly) return items.map(i=>({...i, translatedText:`[? ${i.text}]`}));
    const numbered = items.map((i,j)=>`${j+1}. "${i.text}"`).join('\n');
    const prompt = `You are a translator. Translate to ${LANGUAGE_NAMES[lang]}. Context: ${ctx}\nReturn numbered translations.`;
    const payload={model:CONFIG.openaiModel,messages:[{role:'system',content:prompt},{role:'user',content:numbered}],max_tokens:CONFIG.maxTokens*items.length,temperature:CONFIG.temperature};
    await this.rateLimit(); this.times.push(Date.now());
    const res=await this.callAPI(payload);
    const lines=res.split('\n').filter(l=>/^\d+\./.test(l)).map(l=>l.replace(/^\d+\.\s*/,''));
    return items.map((i,j)=>({...i, translatedText: lines[j]?.trim()||''}));
  }
  callAPI(payload){return new Promise((res,rej)=>{const d=JSON.stringify(payload);
    const r=https.request({hostname:'api.openai.com',port:443,path:'/v1/chat/completions',method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${this.apiKey}`,'Content-Length':Buffer.byteLength(d)}}, resp=>{let b='';resp.on('data',c=>b+=c);resp.on('end',()=>{try{const p=JSON.parse(b);if(p.error) return rej(new Error(p.error.message));res(p.choices[0].message.content);}catch(e){rej(e);}});});r.on('error',rej);r.write(d);r.end();});}
}

/*** Category Analyzer ***/
class CategoryAnalyzer {
  constructor(){this.categories=[];this.files={}};
  loadCats(){this.categories=JSON.parse(fs.readFileSync(CATEGORIES_FILE));}
  loadFiles(){for(const l of CONFIG.languages){this.files[l]={};
      for(const c of this.categories){const f=path.join(QUESTIONS_DIR,l,`${c.id}.json`);
        this.files[l][c.id]=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)) : [];
      }}
  }
  getMissing(){const miss={};
    for(const l of CONFIG.languages){ if(l===CONFIG.baseLanguage) continue; miss[l]={};
      for(const c of this.categories){const base=this.files[CONFIG.baseLanguage][c.id]||[];
        const exist=new Set((this.files[l][c.id]||[]).map(q=>q.questionId));
        miss[l][c.id]=base.filter(q=>!exist.has(q.questionId));
      }}return miss;
  }
  // translate category names
  async translateCategoryNames(tran){for(const c of this.categories){
      for(const l of CONFIG.languages){if(!c[l]){
        try{const t=await tran.translateBatch([{text:c[CONFIG.baseLanguage],questionId: c.id}],l,'Category name');c[l]=t[0].translatedText;}catch{} }
      }
    }
    if(!CONFIG.dryRun)fs.writeFileSync(CATEGORIES_FILE,JSON.stringify(this.categories,null,2));
  }
}

/*** Main ***/
async function main(){
  const key=process.env.OPENAI_API_KEY; if(!key) throw new Error('API key missing');
  if(!CONFIG.dryRun) createBackup();
  const serv=new TranslationService(key),ana=new CategoryAnalyzer(),trk=new TranslationProgressTracker();
  ana.loadCats(); ana.loadFiles();

  // translate category names if needed
  await ana.translateCategoryNames(serv);
  const missing=ana.getMissing();
    // In check-only mode, just report and exit with appropriate code
  if(CONFIG.checkOnly){
    let totalMissing=0;
    
    // First check missing translations in all categories/languages
    for(const [lang,cats] of Object.entries(missing)){
      for(const [catId,items] of Object.entries(cats)){
        if(items.length > 0) {
          console.log(`❌ Missing ${items.length} translations for ${lang}/${catId}`);
          totalMissing+=items.length;
        }
      }
    }
    
    // Then check for significant differences in question counts
    for(const l of CONFIG.languages){ 
      if(l===CONFIG.baseLanguage) continue;
      for(const c of ana.categories){
        const baseCount = (ana.files[CONFIG.baseLanguage][c.id] || []).length;
        const langCount = (ana.files[l][c.id] || []).length;
        
        if(langCount === 0 && baseCount > 0) {
          console.log(`❌ Missing question file for ${l}/${c.id}`);
          totalMissing += baseCount; // Count all missing questions
        } else if(baseCount > 0 && langCount > 0) {
          const difference = Math.abs(baseCount - langCount);
          const percentage = Math.round((difference / baseCount) * 100);
          if(percentage > 20) {
            console.log(`❌ Significant question count difference for ${c.id}: ${CONFIG.baseLanguage}=${baseCount}, ${l}=${langCount} (${percentage}% difference)`);
            totalMissing += difference; // Count the difference as missing translations
          }
        }
      }
    }
    
    if(totalMissing === 0) {
      console.log(`✅ No missing translations found`);
    } else {
      console.log(`📊 Found ${totalMissing} missing translations`);
    }
    process.exit(totalMissing > 0 ? 1 : 0);
  }
  
  for(const [lang,cats] of Object.entries(missing)){
    for(const [catId,items] of Object.entries(cats)){
      if(trk.results.completedCategories[lang]?.[catId]?.completed) continue;
      if(!items.length){ trk.markCategory(lang,catId,0); continue; }
      console.log(`📂 ${lang}/${catId}: ${items.length}`);
      const allTrans=[];
      for(let i=0;i<items.length;i+=CONFIG.batchSize){ const batch=items.slice(i,i+CONFIG.batchSize);
        try{ const trs=await serv.translateBatch(batch,lang,catId);
          trs.forEach(()=>trk.addQuestion(lang,catId,CONFIG.maxTokens)); allTrans.push(...trs);        }catch(e){ console.warn(`⚠️ Translation failed for ${lang}/${catId}: ${e.message}`); trk.addError(e,`${lang}/${catId}`); }
      }
      try{
        const out=path.join(QUESTIONS_DIR,lang,`${catId}.json`);
        if(!fs.existsSync(path.join(QUESTIONS_DIR,lang))) fs.mkdirSync(path.join(QUESTIONS_DIR,lang),{recursive:true});
        const exist=fs.existsSync(out)?JSON.parse(fs.readFileSync(out)):[];
        const existIds=new Set(exist.map(q=>q.questionId));
        const newQs=allTrans.filter(q=>q.translatedText&&!existIds.has(q.questionId)).map(q=>({questionId:q.questionId,text:q.translatedText}));
        const merged=[...exist,...newQs]; if(!CONFIG.dryRun) fs.writeFileSync(out,JSON.stringify(merged,null,2));
        trk.markCategory(lang,catId,newQs.length);
      }catch(e){ console.error(`❌ Failed to save ${lang}/${catId}: ${e.message}`); trk.addError(e,`save-${lang}/${catId}`); }
    }
  }
  trk.complete(); console.log('🏁 Done');
}

if(require.main===module) main().catch(e=>{console.error(e);process.exit(1)});
