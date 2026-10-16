(function(root) {
  'use strict';
  const PANTRY = ['食用油','盐','生抽','香醋','白糖','料酒','老抽','蚝油','淀粉','香油','黑胡椒','白胡椒粉','花椒','八角','干辣椒','豆瓣酱','番茄酱','芝麻酱','黄豆酱','甜面酱','辣椒油','冰糖','孜然','咖喱块','蒸鱼豉油','白芝麻','桂皮','香叶','五香粉','沙拉酱','橄榄油','豆豉','红葱酥'];
  PANTRY.push('白醋','辣椒面','泡椒');
  const DEFAULT_PANTRY = ['食用油','盐','生抽','香醋','白糖'];
  const ALIASES = {'西红柿':'番茄','洋芋':'土豆','马铃薯':'土豆','卷心菜':'包菜','圆白菜':'包菜','花菜':'菜花','蒜':'大蒜','姜':'生姜','葱花':'小葱','香葱':'小葱','葱':'小葱','蒜末':'大蒜','姜末':'生姜','胡萝卜丁':'胡萝卜','白饭':'米饭','剩饭':'米饭','隔夜饭':'米饭','虾仁':'虾','鸡蛋液':'鸡蛋','油':'食用油','醋':'香醋','糖':'白糖','砂糖':'白糖','白胡椒':'白胡椒粉','熟白芝麻':'白芝麻','熟芝麻':'白芝麻','黑胡椒粉':'黑胡椒'};
  function normalize(x){x=String(x).trim();return ALIASES[x]||x;}
  // 用量、步骤已整理的首批菜谱；其余菜谱保留原做法并补入步骤中写明的材料。
  const EDITED = {
    '番茄炒蛋':{required:['番茄','鸡蛋','食用油','盐'],optional:['小葱','白糖'],minutes:15,image:'assets/tomato-eggs.png',servings:'约1–2人份',amounts:['番茄2个','鸡蛋2个','食用油约1汤匙','盐少许','小葱、白糖按口味选用'],steps:['番茄洗净切块；鸡蛋打散，加一小撮盐。','锅中放油，倒入蛋液，炒至凝固后盛出。','原锅下番茄，中火翻炒出汁；喜欢偏甜口味可放少许糖。','倒回鸡蛋翻匀，加盐调味；有葱花可撒一点，没有也能做。']},
    '青椒肉丝':{required:['猪肉','青椒','大蒜','食用油','盐','生抽','料酒','淀粉'],optional:[],minutes:25,image:'assets/pepper-pork.png',servings:'约1–2人份',amounts:['猪肉约150克','青椒2个','大蒜2瓣','生抽1汤匙','料酒1茶匙','淀粉1茶匙','食用油、盐适量'],steps:['猪肉切细丝，加入生抽、料酒、淀粉拌匀，腌约10分钟；青椒切丝，蒜切末。','锅中热油，下肉丝炒散，炒至熟透后盛出。','锅中放蒜末炒香，加入青椒丝翻炒至熟。','倒回肉丝翻炒均匀，尝味后少量加盐。']},
    '蛋炒饭':{required:['米饭','鸡蛋','食用油','盐'],optional:['胡萝卜','小葱','生抽'],minutes:15,image:'assets/egg-rice.png',servings:'约1人份',amounts:['熟米饭1碗','鸡蛋1–2个','食用油约1汤匙','盐少许','胡萝卜、小葱、生抽可选'],steps:['将熟米饭拨散，鸡蛋打散；如有胡萝卜切小丁、小葱切碎。','锅中热油，下蛋液炒至凝固，盛出。','如使用胡萝卜丁，先在锅里炒熟；下米饭炒散，翻炒至充分热透。','倒回鸡蛋，加入盐翻匀；生抽、葱花按喜好选用。']}
  };
  // 按原做法逐道补列材料，避免从“洗去淀粉”“粥面起米油”等文字误推原料。
  const EXTRA=Object.fromEntries(`宫保鸡丁|生抽,料酒,淀粉,香醋,白糖,花椒,食用油
红烧肉|料酒,生抽,老抽,食用油
糖醋里脊|盐,料酒,白糖,白醋,食用油
回锅肉|生姜,大葱,料酒,甜面酱,白糖
鱼香肉丝|生抽,香醋,白糖,淀粉,生姜,大蒜,泡椒,食用油
红烧排骨|生抽,老抽,料酒,食用油
糖醋排骨|料酒,生抽,白糖,食用油
可乐鸡翅|料酒,生抽,老抽,食用油
香菇滑鸡|生抽,蚝油,淀粉,食用油
土豆炖牛腩|生姜,生抽,老抽,料酒,八角,桂皮,盐,食用油
黑椒牛柳|生抽,蚝油,淀粉,食用油
番茄牛腩|生抽,番茄酱,盐,食用油
孜然羊肉|料酒,生抽,淀粉,辣椒面,盐,食用油
小炒黄牛肉|生抽,淀粉,生姜,大蒜,盐,食用油
京酱肉丝|淀粉,白糖,食用油
梅菜扣肉|老抽,生抽,白糖,食用油
白切鸡|食用油
蒜香排骨|生抽,蚝油,白糖,淀粉,食用油
西兰花炒牛肉|生抽,淀粉,盐,蚝油,食用油
咖喱鸡|食用油
辣子鸡|生姜,生抽,料酒,淀粉,盐,食用油
卤鸡腿|生抽,老抽,冰糖,桂皮,香叶
肉末茄子|盐,豆瓣酱,生抽,白糖,食用油
农家小炒肉|豆豉,生抽,盐
麻婆豆腐|盐,生姜,大蒜,淀粉,食用油
清蒸鲈鱼|料酒,盐,蒸鱼豉油,食用油
红烧带鱼|淀粉,生抽,老抽,料酒,白糖,食用油
白灼虾|料酒,生抽,香醋
油焖大虾|生姜,生抽,白糖,食用油
酸菜鱼|盐,淀粉,生姜,大蒜,食用油
番茄鱼片|淀粉,盐,食用油
蛤蜊蒸蛋|盐,生抽,香油
铁板鱿鱼|大蒜,孜然,辣椒面,生抽,食用油
香煎三文鱼|盐,黑胡椒,食用油
虾仁滑蛋|盐,淀粉,牛奶,食用油
地三鲜|大蒜,生抽,蚝油,白糖,淀粉,食用油
醋溜土豆丝|干辣椒,花椒,盐,食用油
干煸四季豆|生抽,盐,食用油
蒜蓉西兰花|盐,食用油
上汤娃娃菜|大蒜,盐,食用油
家常豆腐|大蒜,生抽,蚝油,白糖,淀粉,食用油
手撕包菜|花椒,香醋,生抽,盐,食用油
蚝油生菜|盐,蚝油,生抽,白糖,淀粉,食用油
清炒芦笋|盐,白胡椒粉,食用油
香菇油菜|盐,蚝油,生抽,淀粉,食用油
木耳炒山药|大蒜,盐,生抽,食用油
糖醋藕丁|白糖,生抽,食用油
韭菜炒鸡蛋|盐,食用油
清炒豆芽|香醋,盐,食用油
蒜香蒸茄子|生抽,香醋,白糖,食用油
虎皮青椒|生抽,香醋,白糖,盐,食用油
清炒荷兰豆|盐,食用油
手撕杏鲍菇|大蒜,辣椒面,盐,食用油
蒜蓉菠菜|盐,香油,食用油
冬瓜烧香菇|生姜,生抽,蚝油,盐,淀粉,食用油
苦瓜炒蛋|盐,白糖,食用油
番茄鸡蛋汤|盐,香油,食用油
紫菜蛋花汤|生抽,香油,盐
冬瓜排骨汤|盐,白胡椒粉
玉米排骨汤|生姜,盐
山药排骨汤|生姜,盐
萝卜牛腩汤|八角,盐,白胡椒粉
冬瓜丸子汤|生姜,淀粉,盐,香油
丝瓜蛋汤|盐,香油,食用油
蘑菇鸡汤|盐
酸辣汤|生抽,盐,白胡椒粉,淀粉,香醋,香油
白菜豆腐汤|盐,白胡椒粉,食用油
菌菇汤|生姜,盐,白胡椒粉,食用油
罗宋汤|包菜,番茄酱,盐,黑胡椒,食用油
蛤蜊冬瓜汤|盐
凉拌黄瓜|盐,生抽,白糖,香油
凉拌木耳|大蒜,生抽,香醋,白糖,香油
口水鸡|生姜,大葱,料酒,生抽,香醋,辣椒油,花椒,白糖,大蒜
凉拌腐竹|大蒜,生抽,香醋,盐,香油,辣椒油
凉拌海带丝|生抽,白糖,香油
凉拌三丝|大蒜,生抽,香醋,白糖,香油
凉拌菠菜|生抽,香醋,盐,香油,食用油
凉拌金针菇|大蒜,生抽,香醋,盐,白糖,食用油
凉拌豆芽|大蒜,生抽,香醋,盐,香油,辣椒油
蒜泥白肉|生姜,大葱,料酒,生抽,香醋,辣椒油,白糖
鸡胸肉蔬菜沙拉|盐,黑胡椒,橄榄油,柠檬,食用油
皮蛋豆腐|大蒜,生抽,香醋,香油
凉拌莴笋丝|盐,生抽,白糖,香油
麻酱拌茄子|生抽,香醋,盐
扬州炒饭|盐,生抽,食用油
番茄鸡蛋面|生抽,盐,食用油
葱油拌面|老抽,白糖,食用油
炸酱面|大葱,生姜
火腿鸡蛋三明治|盐,黑胡椒,沙拉酱,食用油
牛油果鸡蛋吐司|盐,黑胡椒,柠檬
燕麦牛奶粥|
皮蛋瘦肉粥|盐,食用油,生抽,淀粉,白胡椒粉
小米南瓜粥|
手抓饼加蛋|甜面酱或番茄酱
番茄肉酱意面|盐,番茄酱,白糖,黑胡椒,食用油
台式卤肉饭|红葱酥,大蒜,生抽,老抽,冰糖,五香粉
紫菜包饭|黄瓜,香油,盐,食用油
鸡蛋羹|盐,生抽,香油`.split('\n').map(s=>{const [n,items]=s.split('|');return [n,items?items.split(','):[]];}));
  function isPantry(x){return x.split('或').every(p=>PANTRY.includes(p)||p==='白醋'||p==='辣椒面');}
  function available(x,have){return x.split('或').some(p=>have.has(p));}
  function recipes(raw){
    return raw.map((r,id)=>{
      if(r[5]) return {...r[5],id,name:r[0],tags:r[2],kcal:r[3],steps:r[4].split("|"),reviewed:true};
      const edited=EDITED[r[0]];
      if(edited) return {...edited,id,name:r[0],tags:r[2],kcal:r[3],reviewed:true};
      let required=r[1].map(normalize), optional=[];
      // 葱花等点缀只在原食材已列出、且步骤明确为末尾撒入时视为可省略。
      if(required.includes('小葱') && /撒葱花/.test(r[4])) {required=required.filter(x=>x!=='小葱');optional.push('小葱');}
      if(!Object.prototype.hasOwnProperty.call(EXTRA,r[0]))throw new Error('菜谱缺少材料核对：'+r[0]);
      required.push(...EXTRA[r[0]]);
      required=Array.from(new Set(required));optional=Array.from(new Set(optional)).filter(x=>!required.includes(x));
      return {id,name:r[0],required,optional,tags:r[2],kcal:r[3],steps:r[4].split('|'),reviewed:false};
    });
  }
  function match(recipe,ingredients,pantry){
    const have=new Set(ingredients.concat(pantry).map(normalize));
    const missing=recipe.required.filter(x=>!available(x,have));
    const matchedFood=recipe.required.filter(x=>!isPantry(x)&&available(x,have)).length;
    return {recipe,missing,matchedFood,missingFood:missing.filter(x=>!isPantry(x)),missingPantry:missing.filter(isPantry)};
  }
  function rank(all,ingredients,pantry,tags=[]){
    if(!ingredients.length)return {ready:[],near:[]};
    const list=all.filter(r=>tags.every(t=>r.tags.includes(t))).map(r=>match(r,ingredients,pantry));
    const order=(a,b)=>a.missing.length-b.missing.length || (a.recipe.minutes||999)-(b.recipe.minutes||999) || b.matchedFood-a.matchedFood || a.recipe.id-b.recipe.id;
    return {ready:list.filter(o=>o.missing.length===0).sort(order),near:list.filter(o=>o.matchedFood>0&&o.missing.length>0&&o.missing.length<=2).sort(order)};
  }
  const api={PANTRY,DEFAULT_PANTRY,ALIASES,normalize,recipes,match,rank,isPantry,available};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.Caibao=api;
})(typeof globalThis==='object'?globalThis:this);
