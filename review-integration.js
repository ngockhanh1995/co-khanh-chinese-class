/* R259: one source-aware Smart Review presentation across HSK1–HSK3. */
'use strict';
function r259Level(record,meta={}){const explicit=Number(meta.hskLevel||record.hskLevel);if([1,2,3].includes(explicit))return explicit;const match=String(meta.activity||record.activity||record.q||'').match(/HSK\s*([123])/i);return match?Number(match[1]):1;}
function r259Part(q,meta={}){return meta.sourcePart||({lesson_vocab:'Luyện từ vựng',lesson_choice:'Chọn đáp án',lesson_arrange:'Sắp xếp câu',lesson_reading:'Đọc hiểu'}[meta.type])||({listening:'Nghe',reading:'Đọc',writing:'Viết',vocab:'Từ vựng',grammar:'Ngữ pháp'}[q.skill])||q.part||(['mock_test','final_test','combined_test','mini_test','quick_test'].includes(meta.type)?(q.audio?'Nghe':'Đọc'):'Bài luyện');}
const R259_SOURCE=r238Source;
r238Source=function(x,m={}){const level=r259Level(x,m),n=Number(m.questionNumber)||(Number.isInteger(x.sourceIndex)?x.sourceIndex+1:0);return R259_SOURCE(x,{...m,hskLevel:level,sourcePart:m.sourcePart||r259Part(x,m)||(['mock_test','final_test'].includes(m.type)?(n<=(level===2?35:20)?'Nghe':'Đọc'):''),sourceId:m.sourceId||m.activity||''});};
const R259_STORE=r174StoreWrong;
r174StoreWrong=function(x,m={}){const meta={...m,hskLevel:r259Level(x,m)};const out=R259_STORE(x,meta),data=r174Read(),key=r174Key(x,meta),record=data[key];if(record){for(const name of ['answerIndex','acceptedAnswers','reviewImageRefs','reviewAudioRef','secureAttempt','secureExamKey','skill','reviewScenes','writingFormat','pinyin'])if(x[name]!==undefined)record[name]=structuredClone(x[name]);if(meta.type==='lesson_vocab')record.category='Từ vựng';else if(x.skill)record.category=({listening:'Nghe',reading:'Đọc',writing:'Viết',grammar:'Ngữ pháp',vocab:'Từ vựng'}[x.skill])||record.category;r174Write(data);}return out;};
function r259Capture(run,q,i,level){const type=q.tokens?'lesson_arrange':run.type==='practice'?({vocabPractice:'lesson_vocab',vocab:'lesson_vocab',grammarPractice:'lesson_choice',choice:'lesson_choice',readingPractice:'lesson_reading',reading:'lesson_reading',arrangePractice:'lesson_arrange',arrange:'lesson_arrange'}[run.kind]||'lesson_choice'):run.type||({mini:'mini_test',quick:'quick_test',stage:'combined_test',final:'final_test',mock:'mock_test'}[run.kind]);const pictures=q.pictures?.map(k=>H2_SCENES[k].cn),options=q.tokens||q.hanzi?[]:pictures||q.a?.slice()||[],answer=q.tokens||q.hanzi?q.answer:pictures?pictures[q.ok]:q.a[q.ok];const prompt=(q.passage?q.passage+'\n':'')+(q.audio?q.audio+'\n':'')+(q.picture?'Tranh: '+(H2_SCENES[q.picture]?.cn||q.picture)+'\n':'')+(q.tokens?'Sắp xếp câu: '+q.tokens.slice().sort((a,b)=>a.index-b.index).map(t=>t.text).join(' '):q.text||q.q||'');const x={q:level===2?'HSK2 · '+prompt:prompt,a:answer,e:q.e,options,tokens:q.tokens?q.tokens.slice().sort((a,b)=>a.index-b.index).map(t=>t.text):[],writingFormat:q.tokens?'arrange':q.hanzi?'hanzi':undefined,pinyin:q.pinyin,sourceIndex:i,answerIndex:q.ok,skill:q.skill,acceptedAnswers:q.acceptedAnswers||[]};r174StoreWrong(x,{hskLevel:level,type,activity:(level===2?'HSK2 · ':'')+run.title,lessonNumber:run.lesson||null,questionNumber:i+1,sourcePart:r259Part(q,{type}),sourceId:'HSK'+level+':'+run.kind+':'+run.id});renderSmartReview();}
h2CaptureWrong=function(run,q,i){r259Capture(run,q,i,2);};
h3Capture=function(q,i){r259Capture(H3_RUN,q,i,3);};
function r259Plain(value){const template=document.createElement('template');template.innerHTML=String(value??'');template.content.querySelectorAll('rt,script,style').forEach(el=>el.remove());return template.content.textContent.trim();}
function r259HasChoices(r){return Array.isArray(r.options)&&r.options.length>0&&!(r.tokens||[]).length&&r.activityType!=='lesson_arrange';}
const R259_MARKUP=smartReviewPracticeMarkup;
smartReviewPracticeMarkup=function(r){if(!r259HasChoices(r))return R259_MARKUP(r);return r259MediaMarkup(r)+'<div class="smartReviewOptionList">'+r.options.map((option,index)=>'<label class="smartReviewNativeChoice"><input type="radio" name="sr_'+escapeHtmlAttr(r.id)+'" value="'+escapeHtmlAttr(option)+'"><span>'+ckExamOption(r259Plain(option),index)+'</span></label>').join('')+'</div>';};
const R259_USER=smartReviewUserAnswer;
smartReviewUserAnswer=function(r,id){if(r259HasChoices(r))return document.getElementById('srp_'+id)?.querySelector('input[type="radio"]:checked')?.value||'';return R259_USER(r,id);};
const R259_SHOW=showSmartReviewAnswer;
showSmartReviewAnswer=function(id){R259_SHOW(id);const r=r174Read()[id]||smartReviewItems().find(x=>x.id===id),el=document.getElementById('sra_'+id);if(!r||!el)return;let index=Number.isInteger(r.answerIndex)?r.answerIndex:(r.options||[]).findIndex(option=>normalizeSmartReviewAnswer(option)===normalizeSmartReviewAnswer(r.a));el.innerHTML='<b>Đáp án: '+(index>=0?ckExamOption(r259Plain(r.a),index):esc(r259Plain(r.a)))+'</b><div style="margin-top:5px">'+esc(r.e||'')+'</div>';};
const R259_CHECK=checkSmartReviewPractice;
checkSmartReviewPractice=function(id){const out=R259_CHECK(id);const result=document.getElementById('srr_'+id);if(result?.classList.contains('ok')||result?.classList.contains('bad')&&!result.textContent.includes('Hãy hoàn thành'))showSmartReviewAnswer(id);return out;};
// Import only the wrong questions of the authenticated student's submitted attempts.
ckExamStoreReview=function(bank,answers,attempt){bank=ckExamDisplayBank(bank);const mark='ck_exam_review_r259_'+attempt;if(localStorage.getItem(mark)){r285RepairReviewBank(bank,attempt);return;}const legacy=localStorage.getItem('ck_exam_review_'+attempt),type=bank.kind==='mock'?'mock_test':'final_test',exam=CK_EXAMS.find(e=>e.level===bank.level&&String(e.id)===String(bank.id)&&e.kind===bank.kind);if(exam)bank.title=exam.title;let data=r174Read();bank.questions.forEach((q,position)=>{const i=Number(q.questionNumber)>0?Number(q.questionNumber)-1:position;if(hskAnswerIsCorrect(q,answers[i]))return;const refs=q.reviewImageRefs|| (q.img?[q.img]:bank.level===2&&bank.kind==='mock'?(i<10?[bank.images[i<5?'judge1':'judge2'][i%5]]:i<20?bank.images[i<15?'listen1':'listen2']:i<40&&i>=35?bank.images.read1:[]):[]);const pictures=q.pictures?.map(k=>H2_SCENES[k]?.cn||k);const prompt=bank.level===2?'HSK2 · '+(q.passage?q.passage+'\n':'')+(q.text||q.q||''):r259Plain(q.q||q.text);const x={q:prompt,a:pictures?pictures[q.ok]:q.a[q.ok],e:q.e,options:q.format?[]:pictures||q.a.slice(),tokens:q.format==='arrange'?(q.tokens||[]).map(t=>typeof t==='string'?t:t.text):[],writingFormat:q.format,pinyin:q.pinyin,sourceIndex:i,answerIndex:q.ok,skill:q.skill,acceptedAnswers:q.acceptedAnswers||[],reviewImageRefs:refs,reviewScenes:q.pictures|| (q.picture?[q.picture]:[]),reviewAudioRef:bank.audioRef,secureAttempt:attempt,secureExamKey:exam?.key};const meta={activity:bank.title,type,hskLevel:bank.level,lessonNumber:null,questionNumber:i+1,sourcePart:r259Part(q,{type}),sourceId:exam?.key||String(bank.id)};const key=r174Key(x,meta),old=data[key];if(old&&(legacy||(old.reviewedAttempts||[]).includes(attempt))){Object.assign(old,x,{sources:r238MergeSources(old.sources,r238Source(x,meta)),questionNumber:i+1,sourcePart:meta.sourcePart});data[key]=old;r174Write(data);}else{r174StoreWrong(x,meta);data=r174Read();}if(data[key]){data[key].reviewedAttempts=[...new Set([...(data[key].reviewedAttempts||[]),attempt])];r174Write(data);}});localStorage.setItem(mark,'1');localStorage.setItem('ck_exam_review_'+attempt,'1');r237Schedule(true);};
let R259_REVIEW_JOB=null,R259_LOCKED_KEYS=[];
async function r259SyncExamReviews(){if(!STUDENT_ACCESS_READY||!CK_STUDENT_ID)return false;const owner=CK_STUDENT_ID;if(R259_REVIEW_JOB?.owner===owner)return R259_REVIEW_JOB.promise;const job={owner};R259_REVIEW_JOB=job;job.promise=(async()=>{try{let offset=0;for(;;){const data=await ckExamAPI({action:'review_items',offset});if(owner!==CK_STUDENT_ID)return false;R259_LOCKED_KEYS=data.lockedKeys||[];for(const item of data.items||[])ckExamStoreReview(item.bank,item.answers,item.attempt);if(!data.hasMore)break;offset+=20;}if(owner===CK_STUDENT_ID){renderSmartReview();await r237Sync();}return true;}catch{return false;}finally{if(R259_REVIEW_JOB===job)R259_REVIEW_JOB=null;}})();return job.promise;}
const R259_SYNC=syncAchievementFromCloud;
syncAchievementFromCloud=async function(){const owner=CK_STUDENT_ID,out=await R259_SYNC(...arguments);if(owner===CK_STUDENT_ID)await r259SyncExamReviews();return out;};
const R259_OPEN_ACH=openAchievements;
openAchievements=function(){const out=R259_OPEN_ACH(...arguments);r259SyncExamReviews();return out;};
const R259_RENDER=renderSmartReview;
renderSmartReview=function(){const out=R259_RENDER(...arguments);const root=document.getElementById('wrong');if(!root)return out;r259LoadReviewImages();const total=smartReviewItems().length,limit=window.R259_REVIEW_LIMIT||20;if(total>limit){const more=document.createElement('button');more.type='button';more.className='btn soft';more.textContent='Xem thêm câu sai ('+Math.min(limit,total)+'/'+total+')';more.onclick=()=>{window.R259_REVIEW_LIMIT=limit+20;renderSmartReview();};root.append(more);}let keys=R259_LOCKED_KEYS.filter(key=>!CK_ACH_REVIEW_SCOPE||CK_EXAMS.find(e=>e.key===key)?.level===CK_ACH_LEVEL);if(keys.length){const note=document.createElement('p');note.className='ckReviewReleaseNotice muted';note.textContent='Một số bài đã nộp đang khóa lời giải. Câu sai của các đề này sẽ được bổ sung khi giáo viên mở lời giải.';root.prepend(note);}return out;};
// All catalog clicks and old saved routes use the same secure exam entry point.
document.addEventListener('click',event=>{const button=event.target.closest?.('button[onclick]');if(!button)return;const key=ckExamCatalogKey(button);if(key){event.preventDefault();event.stopImmediatePropagation();ckExamOpen(key);}},true);
const R259_H2_RENDER=h2RenderQuiz;
h2RenderQuiz=function(){if(H2_RUN&&['mock','final'].includes(H2_RUN.kind))return ckExamOpen(H2_RUN.kind==='final'?'hsk2-final':'hsk2-mock-'+H2_RUN.id);return R259_H2_RENDER(...arguments);};

function r259MediaMarkup(r){let html='';if(r.secureAttempt&&(r.reviewImageRefs||[]).length)html+='<div class="ckReviewPictures">'+r.reviewImageRefs.map((ref,i)=>'<figure><b>'+((r.reviewImageRefs.length>1)?String.fromCharCode(65+i):'')+'</b><img data-review-ref="'+escapeHtmlAttr(ref)+'" data-review-attempt="'+escapeHtmlAttr(r.secureAttempt)+'" alt="Đang tải hình câu sai…"></figure>').join('')+'</div>';if(r.reviewScenes?.length)html+='<div class="h2PictureSet">'+r.reviewScenes.map((scene,i)=>'<figure><b>'+String.fromCharCode(65+i)+'</b>'+h2Scene(scene,'Hình '+String.fromCharCode(65+i))+'</figure>').join('')+'</div>';if(r.secureAttempt&&r.reviewAudioRef&&r.skill==='listening')html+='<button type="button" class="btn soft" onclick="r259ReviewAudio(this)" data-review-attempt="'+escapeHtmlAttr(r.secureAttempt)+'" data-review-ref="'+escapeHtmlAttr(r.reviewAudioRef)+'">🎧 Nghe audio của đề</button>';return html;}
let R259_MEDIA_GENERATION=0;
async function r259LoadReviewImages(){const generation=++R259_MEDIA_GENERATION,owner=CK_STUDENT_ID,groups=new Map();for(const img of document.querySelectorAll('#wrong img[data-review-ref]:not([src])')){if(img.dataset.reviewLoadFailed)continue;const key=img.dataset.reviewAttempt+'|'+img.dataset.reviewRef;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(img);}const queue=[...groups.values()];await Promise.all(Array.from({length:Math.min(4,queue.length)},async()=>{while(queue.length&&owner===CK_STUDENT_ID&&generation===R259_MEDIA_GENERATION){const images=queue.shift(),img=images[0];try{const d=await r283ReviewImage(img.dataset.reviewAttempt,img.dataset.reviewRef);if(owner!==CK_STUDENT_ID||generation!==R259_MEDIA_GENERATION)return;for(const image of images){image.src=d.data;image.alt='Hình câu sai';}}catch{if(owner===CK_STUDENT_ID&&generation===R259_MEDIA_GENERATION)for(const image of images){image.dataset.reviewLoadFailed='true';image.alt='Chưa tải được hình câu sai. Tải lại trang để thử lại.';}}}}));}
async function r259ReviewAudio(button){const owner=CK_STUDENT_ID;button.disabled=true;try{const response=await ckExamAPI({action:'review_media',attempt:button.dataset.reviewAttempt,ref:button.dataset.reviewRef},false,true),blob=await response.blob();if(owner!==CK_STUDENT_ID||!button.isConnected)return;const url=URL.createObjectURL(blob),audio=document.createElement('audio');audio.className='ckReviewAudio';R259_AUDIO_URLS.add(url);audio.controls=true;audio.src=url;audio.style.width='100%';button.after(audio);button.textContent='🎧 Audio đã tải';audio.play().catch(()=>{});}catch{button.textContent='Chưa tải được audio. Bấm để thử lại.';button.disabled=false;}}

const R259_SELECT_LEVEL=selectAchievementLevel;selectAchievementLevel=function(){window.R259_REVIEW_LIMIT=20;return R259_SELECT_LEVEL(...arguments);};
const R259_AUDIO_URLS=new Set();
function r259ClearReviewAudio(){for(const audio of document.querySelectorAll('audio.ckReviewAudio')){const button=audio.previousElementSibling;if(button?.matches('button[data-review-ref]')){button.disabled=false;button.textContent='🎧 Nghe audio của đề';}audio.pause();audio.removeAttribute('src');audio.load();audio.remove();}for(const url of R259_AUDIO_URLS)URL.revokeObjectURL(url);R259_AUDIO_URLS.clear();R259_MEDIA_GENERATION++;}
const R259_SWITCH_CACHE=switchStudentCache;
switchStudentCache=function(){r259ClearReviewAudio();R259_LOCKED_KEYS=[];window.R259_REVIEW_LIMIT=20;return R259_SWITCH_CACHE(...arguments);};
const R259_OPEN_PAGE=openPage;
openPage=function(id){if(id!=='progress')r259ClearReviewAudio();return R259_OPEN_PAGE(...arguments);};
window.addEventListener('pagehide',r259ClearReviewAudio);

// R283: background sync must never replace a student's in-progress review card.
let R283_VIEW=null;
const R283_EXPLANATIONS=new Map(),R283_SOURCES=new Map(),R283_IMAGE_CACHE=new Map();
let R283_SOURCE_RUN=null,R283_SOURCE_TABS=null,R283_IMAGE_JOB=null;
const R283_RECOVER_SOURCE=r238RecoverSources;
r238RecoverSources=function(record){
 if(record.sources?.length)return record;
 if(R283_SOURCE_RUN!==H2_RUN||R283_SOURCE_TABS!==H2_LESSON_TABS){R283_SOURCES.clear();R283_SOURCE_RUN=H2_RUN;R283_SOURCE_TABS=H2_LESSON_TABS;}
 const key=JSON.stringify([record.hskLevel,record.activityType,record.lessonNumber,record.activity,record.q,record.a,record.questionNumber,record.sourcePart]);
 if(!R283_SOURCES.has(key)){const recovered=R283_RECOVER_SOURCE(record);if(R283_SOURCES.size>=2000)R283_SOURCES.clear();R283_SOURCES.set(key,recovered.sources||null);}
 const sources=R283_SOURCES.get(key);return sources?{...record,sources}:record;
};
const R283_REFRESH_EXPLANATION=r248RefreshH3Explanation;
r248RefreshH3Explanation=function(record){
 if(achievementReviewLevel(record)!==3)return record;
 const key=JSON.stringify([record.lessonNumber,record.activityType,record.q,record.a,record.tokens]);
 if(!R283_EXPLANATIONS.has(key)){const fresh=R283_REFRESH_EXPLANATION(record);if(R283_EXPLANATIONS.size>=2000)R283_EXPLANATIONS.clear();R283_EXPLANATIONS.set(key,fresh===record?null:fresh.e);}
 const explanation=R283_EXPLANATIONS.get(key);return explanation===null?record:{...record,e:explanation};
};
const R283_WRITE_REVIEW=r174Write;
r174Write=function(data){try{if(localStorage.getItem(R174_REVIEW_KEY)===JSON.stringify(data))return true;}catch{}return R283_WRITE_REVIEW(data);};

async function r283ReviewImage(attempt,ref){
 const key=CK_STUDENT_ID+'|'+attempt+'|'+ref;
 if(!R283_IMAGE_CACHE.has(key)){
  if(R283_IMAGE_CACHE.size>=48)R283_IMAGE_CACHE.delete(R283_IMAGE_CACHE.keys().next().value);
  const job=ckExamAPI({action:'review_media',attempt,ref}).catch(error=>{R283_IMAGE_CACHE.delete(key);throw error;});
  R283_IMAGE_CACHE.set(key,job);
 }
 return R283_IMAGE_CACHE.get(key);
}
const R283_LOAD_IMAGES=r259LoadReviewImages;
r259LoadReviewImages=function(){
 const owner=CK_STUDENT_ID,root=document.getElementById('wrong');if(!root)return Promise.resolve();r283ReserveReviewMedia(root);
 if(R283_IMAGE_JOB?.owner===owner&&R283_IMAGE_JOB.root===root){R283_IMAGE_JOB.again=true;return R283_IMAGE_JOB.promise;}
 const job={owner,root,again:false};R283_IMAGE_JOB=job;
 job.promise=Promise.resolve(R283_LOAD_IMAGES()).finally(()=>{if(R283_IMAGE_JOB!==job)return;R283_IMAGE_JOB=null;if(job.again&&owner===CK_STUDENT_ID&&root.isConnected)queueMicrotask(()=>r259LoadReviewImages());});
 return job.promise;
};
function r283ReviewVisible(root){const page=root.closest('.page');return (!page||page.classList.contains('on'))&&!root.closest('[hidden]');}
function r283ReserveReviewMedia(root){for(const img of root.querySelectorAll('.ckReviewPictures figure:only-child img')){img.style.height='260px';img.style.width='100%';img.style.objectFit='contain';}}
function r283DisposeReviewMedia(root){for(const audio of root.querySelectorAll('audio.ckReviewAudio')){audio.pause();URL.revokeObjectURL(audio.src);R259_AUDIO_URLS.delete(audio.src);audio.removeAttribute('src');audio.load();}}
function r283ReviewCard(record,index){
 const card=document.createElement('div');card.className='smartReviewItem';card.id='sr_'+record.id;
 card.innerHTML='<div class="smartReviewTop"><div><b>'+esc(record.q)+'</b><div class="muted">'+r238SourceMarkup(record)+'</div></div><div class="smartReviewPriority"></div></div>'+
  '<div class="smartReviewPractice"><div><b>Làm lại câu này:</b></div>'+smartReviewPracticeMarkup(record)+'<div class="smartReviewActions"><button type="button" class="btn">Kiểm tra</button><button type="button" class="btn soft">Làm lại</button></div><div class="smartReviewResult"></div><div class="smartReviewMeta"></div></div>'+
  '<div class="smartReviewAnswer"><b>Đáp án: '+esc(record.a)+'</b><div style="margin-top:5px">'+esc(record.e||'')+'</div></div>';
 card.querySelector('.smartReviewPractice').id='srp_'+record.id;
 card.querySelector('.smartReviewResult').id='srr_'+record.id;
 card.querySelector('.smartReviewAnswer').id='sra_'+record.id;
 const buttons=card.querySelectorAll('.smartReviewActions button');buttons[0].onclick=()=>checkSmartReviewPractice(record.id);buttons[1].onclick=()=>resetSmartReviewPractice(record.id);
 r283ReviewMeta(card,record,index);r285DecorateReview(card,record);r283ReserveReviewMedia(card);return card;
}
function r283ReviewMeta(card,record,index){
 const mastered=record.status==='mastered';card.dataset.reviewMastered=String(mastered);
 const priority=card.querySelector('.smartReviewPriority');if(priority){priority.style.cssText='flex:0 0 140px;max-width:40%;min-height:36px';priority.previousElementSibling.style.minWidth='0';priority.textContent=mastered?'✓ Đã vững':'Câu ôn '+(index+1)+' · sai '+(Number(record.wrongCount)||0)+' lần';}
 const meta=card.querySelector('.smartReviewMeta');if(meta)meta.textContent='Đúng liên tiếp: '+(Number(record.correctStreak)||0)+'/2 · Sai khi ôn: '+(Number(record.reviewWrong)||0);
}
function r283UpdateReview(view,items){
 const data=r174Read(),all=Object.values(data).filter(record=>achievementReviewLevel(record)===CK_ACH_LEVEL);
 [...view.list.children].forEach((card,index)=>{const record=data[card.id.slice(3)];if(record){r283ReviewMeta(card,record,index);r285DecorateReview(card,record);}});
 const stats=document.getElementById('smartReviewStats');if(stats){const counts={};for(const record of items)counts[record.category]=(counts[record.category]||0)+1;stats.innerHTML='<span class="smartReviewPill">Đang ôn: '+items.length+'</span><span class="smartReviewPill">Đã vững: '+all.filter(record=>record.status==='mastered').length+'</span>'+(view.categories||(view.categories=Object.keys(counts).slice(0,3))).map(category=>'<span class="smartReviewPill">'+esc(category)+': '+(counts[category]||0)+'</span>').join('');}
 for(const card of view.list.children)r284ScheduleMastered(view,card,data[card.id.slice(3)]);
 const shown=new Set([...view.list.children].map(card=>card.id)),unseen=items.filter(record=>!shown.has('sr_'+record.id)).length;
 view.more.hidden=!unseen;view.more.textContent='Xem thêm câu ôn ('+unseen+' câu chưa hiển thị)';
 if(!items.length&&!view.list.children.length){view.empty.hidden=false;view.empty.textContent='Chưa có câu sai cần ôn.';}else view.empty.hidden=true;
}
const R283_RENDER_REVIEW=renderSmartReview;
renderSmartReview=function(...args){
 const root=document.getElementById('wrong');if(!root||!r283ReviewVisible(root))return;
 let view=R283_VIEW;
 if(!view||view.owner!==CK_STUDENT_ID||view.level!==CK_ACH_LEVEL||view.root!==root||!view.list.isConnected){
  r284ClearMasteredTimers();if(view)r259ClearReviewAudio();
  const out=R283_RENDER_REVIEW(...args);
  root.querySelectorAll(':scope > button').forEach(button=>button.remove());
  let list=root.querySelector('.smartReviewList');if(!list){list=document.createElement('div');list.className='smartReviewList';root.append(list);}
  const empty=root.querySelector('.smartReviewEmpty')||document.createElement('p');if(!empty.isConnected){empty.className='smartReviewEmpty';root.append(empty);}
  const controls=document.createElement('div');controls.className='smartReviewStableActions';controls.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:16px';
  const more=document.createElement('button');more.type='button';more.className='btn soft';controls.append(more);root.append(controls);
  view={owner:CK_STUDENT_ID,level:CK_ACH_LEVEL,root,list,empty,more};R283_VIEW=view;
  more.onclick=()=>{window.R259_REVIEW_LIMIT=(window.R259_REVIEW_LIMIT||20)+20;renderSmartReview();};
  r283UpdateReview(view,smartReviewItems());return out;
 }
 const items=smartReviewItems(),shown=new Set([...view.list.children].map(card=>card.id));let added=false;
 for(const record of items){if(view.list.children.length>=(window.R259_REVIEW_LIMIT||20))break;if(shown.has('sr_'+record.id))continue;view.list.append(r283ReviewCard(record,view.list.children.length));shown.add('sr_'+record.id);added=true;}
 r283UpdateReview(view,items);if(added||root.querySelector('img[data-review-ref]:not([src]):not([data-review-load-failed])'))r259LoadReviewImages();
};
const R283_SWITCH_CACHE=switchStudentCache;
switchStudentCache=function(...args){r284ClearMasteredTimers();r285ClearOriginalIndex();R283_VIEW=null;R283_EXPLANATIONS.clear();R283_SOURCES.clear();R283_IMAGE_CACHE.clear();R283_IMAGE_JOB=null;return R283_SWITCH_CACHE(...args);};

// R284: remove only the mastered card; never rebuild or reorder its neighbours.
const R284_MASTERED_TIMERS=new Map();
function r284ClearMasteredTimers(){for(const timer of R284_MASTERED_TIMERS.values())clearTimeout(timer);R284_MASTERED_TIMERS.clear();}
function r284ScheduleMastered(view,card,record){
 if(record?.status!=='mastered'){if(R284_MASTERED_TIMERS.has(card)){clearTimeout(R284_MASTERED_TIMERS.get(card));R284_MASTERED_TIMERS.delete(card);}return;}
 if(R284_MASTERED_TIMERS.has(card))return;
 const timer=setTimeout(()=>{
  R284_MASTERED_TIMERS.delete(card);
  if(R283_VIEW!==view||view.owner!==CK_STUDENT_ID||view.level!==CK_ACH_LEVEL||!card.isConnected||r174Read()[card.id.slice(3)]?.status!=='mastered')return;
  const focus=document.activeElement,focusedCard=focus?.closest?.('.smartReviewItem');
  const anchor=focusedCard&&focusedCard!==card&&view.list.contains(focusedCard)?focusedCard:[...view.list.children].find(node=>node!==card&&node.getBoundingClientRect().bottom>0);
  const top=anchor?.getBoundingClientRect().top,visible=r283ReviewVisible(view.root);
  r283DisposeReviewMedia(card);card.remove();
  renderSmartReview();
  if(visible&&anchor?.isConnected&&Number.isFinite(top)){const shift=anchor.getBoundingClientRect().top-top;if(shift)window.scrollBy(0,shift);}
  if(focus?.isConnected&&document.activeElement!==focus)focus.focus({preventScroll:true});
 },1500);
 R284_MASTERED_TIMERS.set(card,timer);
}
const R284_CHECK_REVIEW=checkSmartReviewPractice;
checkSmartReviewPractice=function(id){const out=R284_CHECK_REVIEW(...arguments),view=R283_VIEW;if(view&&view.owner===CK_STUDENT_ID&&view.level===CK_ACH_LEVEL){const card=document.getElementById('sr_'+id);if(card)r284ScheduleMastered(view,card,r174Read()[id]);}return out;};

// R285: retry the original question format; never invent a free-text exercise.
let R285_ORIGINAL_INDEX=null,R285_ORIGINAL_RAW=null;
function r285ClearOriginalIndex(){R285_ORIGINAL_INDEX=null;R285_ORIGINAL_RAW=null;}
function r285OriginalKey(level,lesson,question,answer){const norm=value=>r174Norm(/[<>]/.test(String(value))?r259Plain(value):String(value??''));return [level,lesson||0,norm(question),norm(answer)].join('|');}
function r285IndexSource(index,level,lesson,question,answer,options,tokens){
 options=Array.isArray(options)?options:[];tokens=Array.isArray(tokens)?tokens:[];if(!question||!answer||(!options.length&&!tokens.length))return;
 const source=tokens?.length?{tokens:tokens.slice()}:{options:options.slice()};
 for(const n of new Set([Number(lesson)||0,0])){
  const key=r285OriginalKey(level,n,question,answer);
  if(!index.has(key))index.set(key,source);else if(JSON.stringify(index.get(key))!==JSON.stringify(source))index.set(key,null);
 }
}
function r285OriginalIndex(){
 if(!R285_ORIGINAL_INDEX){
  const index=new Map();
  const add=(level,lesson,q)=>{if(Array.isArray(q)){if(Array.isArray(q[1]))r285IndexSource(index,level,lesson,q[0],q[1][q[2]],q[1]);return;}if(!q)return;const tokens=(q.tokens||[]).map(t=>typeof t==='string'?t:t.text);r285IndexSource(index,level,lesson,q.q||q.text,q.answer||q.a?.[q.ok],q.a,tokens);if(tokens.length)r285IndexSource(index,level,lesson,'@arrange',q.answer,null,tokens);};
  if(typeof QUICK_TEST_BANKS!=='undefined')for(const bank of Object.values(QUICK_TEST_BANKS))for(const q of bank)add(1,null,q);
  if(typeof course!=='undefined')course.forEach((lesson,i)=>{for(const q of lesson.bank||[])add(1,i+1,q);for(const q of lesson.readingQs||[])add(1,i+1,q);});
  if(typeof CHOICE_QUESTION_BANK!=='undefined')CHOICE_QUESTION_BANK.forEach((bank,i)=>bank.forEach(q=>r285IndexSource(index,1,i+1,q[0],q[1],q[2])));
  if(typeof ARRANGE_SENTENCE_BANK!=='undefined')ARRANGE_SENTENCE_BANK.forEach((bank,i)=>bank.forEach(text=>{const tokens=text.split('/').map(t=>t.trim()).filter(Boolean);r285IndexSource(index,1,i+1,'@arrange',tokens.join(''),null,tokens);}));
  if(typeof HSK3_COURSE!=='undefined')for(const lesson of HSK3_COURSE)for(const q of [...lesson.choice,...lesson.arrange,...lesson.reading,...lesson.listening])add(3,lesson.n,q);
  R285_ORIGINAL_INDEX=index;
 }
 const raw=localStorage.getItem(R174_REVIEW_KEY)||'{}';
 if(raw!==R285_ORIGINAL_RAW){R285_ORIGINAL_RAW=raw;let data={};try{data=JSON.parse(raw);}catch{}for(const record of Object.values(data)){const level=achievementReviewLevel(record);if(record.options?.length>1)r285IndexSource(R285_ORIGINAL_INDEX,level,record.lessonNumber,record.q,record.a,record.options);if(record.tokens?.length)r285IndexSource(R285_ORIGINAL_INDEX,level,record.lessonNumber,'@arrange',record.a,null,record.tokens);}}
 return R285_ORIGINAL_INDEX;
}
function r285Original(record){
 if(record.writingFormat==='hanzi'||record.hanzi)return {...record,originalFormat:'hanzi'};
 if(Array.isArray(record.tokens)&&record.tokens.length)return {...record,originalFormat:'arrange'};
 if(Array.isArray(record.options)&&record.options.length>1&&record.writingFormat!=='arrange'&&record.activityType!=='lesson_arrange')return {...record,originalFormat:'choice'};
 const index=r285OriginalIndex(),level=achievementReviewLevel(record),arrange=record.writingFormat==='arrange'||record.activityType==='lesson_arrange'||/^Sắp xếp câu\s*:/i.test(record.q||'');
 const prompt=arrange?'@arrange':record.q;
 const original=index.get(r285OriginalKey(level,record.lessonNumber,prompt,record.a))||index.get(r285OriginalKey(level,0,prompt,record.a));
 return original?{...record,...original,originalFormat:original.tokens?'arrange':'choice'}:{...record,originalFormat:'missing'};
}
function r285RepairReviewBank(bank,attempt){
 const data=r174Read();let changed=false;
 for(const record of Object.values(data)){if(record.secureAttempt!==attempt)continue;const q=bank.questions.find((q,i)=>Number(q.questionNumber||i+1)===Number(record.questionNumber));if(!q)continue;
  const before=JSON.stringify(record);
  if(q.format){record.writingFormat=q.format;record.options=[];record.tokens=q.format==='arrange'?(q.tokens||[]).map(t=>typeof t==='string'?t:t.text):[];record.pinyin=q.pinyin;record.acceptedAnswers=q.alternatives||[];}
  else if(q.a?.length>1){record.options=q.pictures?q.pictures.map(k=>H2_SCENES[k]?.cn||k):q.a.slice();record.answerIndex=q.ok;}
  if(JSON.stringify(record)!==before)changed=true;
 }
 if(changed)r174Write(data);
}
smartReviewPracticeMarkup=function(record){
 const r=r285Original(record),id=escapeHtmlAttr(r.id||r.key);
 if(r.originalFormat==='choice')return r259MediaMarkup(r)+'<div class="smartReviewOptionList">'+r.options.map((option,index)=>'<label class="smartReviewNativeChoice"><input type="radio" name="sr_'+id+'" value="'+escapeHtmlAttr(option)+'"><span>'+ckExamOption(r259Plain(option),index)+'</span></label>').join('')+'</div>';
 if(r.originalFormat==='arrange'){const tokens=seededShuffle(r.tokens.slice(),(Number(r.lessonNumber)||1)*907+31);return r259MediaMarkup(r)+'<div class="smartReviewArrange" id="srarea_'+id+'">'+tokens.map((token,index)=>'<button type="button" class="smartReviewToken" data-token-index="'+index+'" onclick="addSmartReviewToken(this)">'+esc(token)+'</button>').join('')+'</div><div class="smartReviewBuilt" id="srb_'+id+'"></div>';}
 if(r.originalFormat==='hanzi')return '<label class="smartReviewOriginalHanzi">'+(r.pinyin?'<span>'+esc(r.pinyin)+'</span> ':'')+'<input class="smartReviewInput" id="sri_'+id+'" maxlength="1" autocomplete="off" aria-label="Điền chữ Hán vào chỗ trống của câu gốc" style="width:5em" data-original-format="hanzi"></label>';
 return '<p class="muted">Dữ liệu cũ chưa lưu đủ lựa chọn của câu gốc. Em có thể xem phần chữa bên dưới.</p>';
};
smartReviewUserAnswer=function(record,id){const box=document.getElementById('srp_'+id);if(!box)return '';const choice=box.querySelector('input[type="radio"]:checked');if(choice)return choice.value;if(box.querySelector('.smartReviewBuilt'))return [...box.querySelectorAll('.smartReviewBuiltToken')].map(token=>token.textContent.trim()).join(' ');return box.querySelector('input[data-original-format="hanzi"]')?.value||'';};
function r285DecorateReview(card,record){
 const practice=card.querySelector('.smartReviewPractice');if(!practice)return;
 const heading=practice.firstElementChild;if(heading?.textContent.trim()==='Làm lại câu này:')heading.remove();
 const original=r285Original(record),missing=original.originalFormat==='missing',actions=practice.querySelector('.smartReviewActions');
 if(card.dataset.originalReviewMissing==='true'&&!missing){
  const focus=document.activeElement,anchor=focus?.closest?.('.smartReviewItem'),top=anchor&&anchor!==card?anchor.getBoundingClientRect().top:null;
  const result=practice.querySelector('.smartReviewResult'),meta=practice.querySelector('.smartReviewMeta'),holder=document.createElement('div');holder.innerHTML=smartReviewPracticeMarkup({...record,id:card.id.slice(3)});
  practice.replaceChildren(...holder.childNodes,actions,result,meta);r283ReserveReviewMedia(card);
  if(anchor?.isConnected&&Number.isFinite(top)){const shift=anchor.getBoundingClientRect().top-top;if(shift)window.scrollBy(0,shift);}if(focus?.isConnected&&document.activeElement!==focus)focus.focus({preventScroll:true});
 }
 card.dataset.originalReviewMissing=String(missing);
 const buttons=actions?.querySelectorAll('button');if(!buttons?.length)return;
 buttons[0].hidden=missing;buttons[0].onclick=()=>checkSmartReviewPractice(card.id.slice(3));
 buttons[1].textContent=missing?'Xem chữa':'Làm lại';buttons[1].onclick=()=>missing?showSmartReviewAnswer(card.id.slice(3)):resetSmartReviewPractice(card.id.slice(3));
}

showSmartReviewAnswer=function(id){const record=r174Read()[id]||smartReviewItems().find(r=>r.id===id),answer=document.getElementById('sra_'+id);if(!record||!answer)return;const original=r285Original(record),index=original.originalFormat==='choice'?original.options.findIndex(option=>normalizeSmartReviewAnswer(option)===normalizeSmartReviewAnswer(record.a)):-1;answer.style.display='block';answer.innerHTML='<b>Đáp án: '+(index>=0?ckExamOption(r259Plain(record.a),index):esc(r259Plain(record.a)))+'</b><div style="margin-top:5px">'+esc(record.e||'')+'</div>';};
