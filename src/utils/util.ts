import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TranscriptItem } from "./type";
import { detectLanguage } from "./languageUtils";

export const resetScrollPosition = (e: React.MouseEvent<HTMLDivElement>) => {
  const innerText = e.currentTarget.querySelector(".inner-text") as HTMLElement;
  if (innerText) {
    innerText.style.animation = "none";
    innerText.offsetHeight;
    innerText.style.animation = "";
  }
};

// UUID generation function that works in both browser and test environments
export const uuid = () => {
  // Check if window and crypto are available (browser environment)
  if (typeof window !== "undefined" && window.crypto) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const array = new Uint8Array(1);
      window.crypto.getRandomValues(array);
      const r = array[0] % 16;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } else {
    // Fallback for test environments
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const localStorageCleanup = () => {
  localStorage.clear();
};

// Enhanced sentence completion check with language-specific rules
export const isCompleteSentence = (text: string): boolean => {
  const trimmedText = text.trim();
  if (!trimmedText) return false;

  const language = detectLanguage(trimmedText);

  switch (language) {
    case "en":
      return isEnglishCompleteSentence(trimmedText);
    case "zh":
      return isChineseCompleteSentence(trimmedText);
    case "ja":
      return isJapaneseCompleteSentence(trimmedText);
    case "ko":
      return isKoreanCompleteSentence(trimmedText);
    default:
      return /[.!?。！？｡!?]$/.test(trimmedText);
  }
};

// English sentence completion rules
const isEnglishCompleteSentence = (text: string): boolean => {
  // Check for sentence-ending punctuation
  if (/[.!?]$/.test(text)) {
    // Avoid abbreviations like "Mr.", "Dr.", "etc."
    const commonAbbreviations =
      /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|i\.e|e\.g|Inc|Ltd|Corp|Co)\.$$/i;
    if (commonAbbreviations.test(text)) {
      return false;
    }
    return true;
  }

  // If ends with comma, semicolon, or dash, it's likely incomplete
  if (/[,;:\-–—]$/.test(text)) {
    return false;
  }

  // Check for incomplete phrases that suggest continuation
  const incompletePatterns = [
    /\b(?:that|which|who|whom|whose|where|when|why|how)\s*$/i, // Relative pronouns at end
    /\b(?:and|or|but|so|because|since|while|although|though|if|unless|until|before|after)\s*$/i, // Conjunctions at end
    /\b(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their)\s*$/i, // Articles/determiners at end
    /\b(?:very|quite|rather|extremely|incredibly|absolutely)\s*$/i, // Adverbs that modify following words
    /\b(?:about|above|across|after|against|along|among|around|at|before|behind|below|beneath|beside|between|beyond|by|down|during|except|for|from|in|inside|into|like|near|of|off|on|onto|outside|over|through|throughout|to|toward|under|until|up|upon|with|within|without)\s*$/i, // Prepositions
  ];

  if (incompletePatterns.some((pattern) => pattern.test(text))) {
    return false;
  }

  // Special case: sentences ending with quoted terms or technical concepts
  const endsWithQuotedConcept =
    /(?:known as|called|termed|named|referred to as)\s+(?:an?\s+)?['""][^'""]+['""]$|['""][^'""]+['""]$/i.test(
      text
    );
  if (endsWithQuotedConcept) {
    return false; // These often need temporal or source context
  }

  // Enhanced: Check for nouns that typically require continuation (ability, content, etc.)
  const endsWithIncompleteNoun =
    /\b(?:ability|capacity|power|skill|talent|potential|opportunity|chance|possibility|way|method|means|approach|strategy|plan|idea|concept|thought|notion|belief|opinion|view|perspective|understanding|knowledge|information|data|evidence|proof|reason|cause|purpose|goal|objective|aim|target|result|outcome|effect|impact|influence|consequence|implication|significance|importance|value|worth|benefit|advantage|disadvantage|problem|issue|challenge|difficulty|obstacle|barrier|limitation|restriction|requirement|condition|situation|circumstance|context|background|setting|environment|atmosphere|mood|tone|style|manner|fashion|approach|technique|procedure|process|system|structure|framework|model|pattern|trend|tendency|habit|custom|tradition|practice|behavior|action|activity|task|job|work|effort|attempt|try|endeavor|project|program|initiative|campaign|movement|development|progress|advancement|improvement|enhancement|upgrade|update|revision|modification|change|transformation|shift|transition|evolution|growth|expansion|extension|addition|supplement|complement|alternative|option|choice|selection|decision|judgment|assessment|evaluation|analysis|examination|investigation|study|research|exploration|discovery|finding|conclusion|summary|overview|review|report|account|description|explanation|definition|interpretation|translation|version|edition|copy|example|instance|case|scenario|situation|story|tale|narrative|account|record|history|background|origin|source|foundation|basis|ground|reason|justification|excuse|explanation|clarification|detail|aspect|feature|characteristic|quality|property|attribute|trait|element|component|part|section|segment|portion|piece|fragment|bit|item|thing|object|entity|being|creature|person|individual|character|figure|personality|identity|role|position|status|rank|level|degree|extent|scope|range|scale|size|dimension|measurement|quantity|amount|number|count|total|sum|aggregate|collection|group|set|series|sequence|order|arrangement|organization|structure|formation|composition|makeup|content|substance|material|matter|stuff|element|ingredient|component|factor|aspect|feature|detail|point|issue|topic|subject|theme|matter|concern|interest|focus|emphasis|priority|importance|significance|relevance|connection|relationship|link|bond|tie|association|correlation|correspondence|similarity|difference|distinction|contrast|comparison|analogy|metaphor|symbol|sign|indication|signal|clue|hint|suggestion|recommendation|advice|guidance|instruction|direction|command|order|request|demand|requirement|expectation|hope|wish|desire|want|need|necessity|essential|fundamental|basic|primary|main|major|key|central|core|heart|essence|nature|character|quality|feature|aspect|element|component|part|section|area|region|zone|territory|domain|field|sphere|realm|world|universe|space|place|location|position|spot|site|venue|setting|scene|stage|platform|base|foundation|ground|floor|surface|top|bottom|side|edge|border|boundary|limit|end|beginning|start|opening|entrance|exit|way|path|route|road|street|avenue|lane|track|trail|course|direction|destination|goal|target|aim|objective|purpose|intention|plan|scheme|design|blueprint|outline|framework|structure|system|network|web|chain|series|sequence|line|row|column|list|catalog|inventory|collection|assembly|gathering|meeting|conference|session|event|occasion|ceremony|celebration|festival|party|gathering|reunion|encounter|experience|adventure|journey|trip|voyage|tour|visit|stay|stop|break|pause|rest|interval|gap|space|distance|length|width|height|depth|thickness|size|scale|proportion|ratio|percentage|fraction|part|portion|share|section|segment|division|category|class|type|kind|sort|variety|form|shape|appearance|look|style|design|pattern|model|example|sample|specimen|instance|case|situation|condition|state|status|position|place|rank|level|grade|standard|quality|caliber|excellence|superiority|advantage|benefit|profit|gain|reward|prize|award|recognition|acknowledgment|appreciation|gratitude|thanks|credit|praise|compliment|approval|endorsement|support|backing|assistance|help|aid|service|favor|kindness|generosity|charity|donation|contribution|investment|commitment|dedication|devotion|loyalty|faithfulness|reliability|dependability|trustworthiness|honesty|integrity|sincerity|authenticity|genuineness|truth|reality|fact|actuality|certainty|assurance|confidence|belief|faith|trust|hope|optimism|positivity|enthusiasm|excitement|passion|interest|curiosity|wonder|amazement|surprise|shock|astonishment|bewilderment|confusion|uncertainty|doubt|skepticism|suspicion|concern|worry|anxiety|fear|apprehension|nervousness|tension|stress|pressure|strain|burden|load|weight|responsibility|duty|obligation|commitment|promise|pledge|vow|oath|agreement|contract|deal|arrangement|understanding|compromise|settlement|resolution|solution|answer|response|reply|reaction|feedback|comment|remark|observation|note|statement|declaration|announcement|proclamation|notification|warning|alert|alarm|signal|message|communication|information|news|report|update|bulletin|notice|advisory|guidance|instruction|direction|command|order|request|appeal|plea|petition|proposal|suggestion|recommendation|advice|tip|hint|clue|indication|sign|symptom|evidence|proof|confirmation|verification|validation|authentication|authorization|permission|approval|consent|agreement|acceptance|acknowledgment|recognition|admission|confession|disclosure|revelation|discovery|finding|result|outcome|consequence|effect|impact|influence|significance|importance|value|worth|merit|quality|excellence|superiority|advantage|benefit|profit|gain|success|achievement|accomplishment|attainment|fulfillment|satisfaction|pleasure|joy|happiness|delight|enjoyment|entertainment|amusement|fun|recreation|relaxation|rest|peace|calm|tranquility|serenity|harmony|balance|stability|security|safety|protection|defense|shelter|refuge|sanctuary|haven|home|place|location|destination|goal|target|objective|purpose|mission|vision|dream|aspiration|ambition|desire|wish|hope|expectation|anticipation|prediction|forecast|projection|estimate|calculation|assessment|evaluation|judgment|opinion|view|perspective|standpoint|position|stance|attitude|approach|method|technique|strategy|tactic|plan|scheme|design|blueprint|framework|structure|system|organization|arrangement|setup|configuration|format|layout|pattern|model|template|example|sample|illustration|demonstration|presentation|display|exhibition|show|performance|act|play|drama|comedy|tragedy|story|tale|narrative|account|record|history|chronicle|biography|autobiography|memoir|diary|journal|log|register|catalog|inventory|list|index|directory|guide|manual|handbook|textbook|reference|source|resource|material|content|substance|matter|stuff|thing|item|object|article|piece|work|creation|product|output|result|outcome|achievement|accomplishment|success|victory|triumph|win|conquest|defeat|loss|failure|mistake|error|fault|flaw|defect|problem|issue|difficulty|challenge|obstacle|barrier|hindrance|impediment|complication|complexity|intricacy|sophistication|refinement|elegance|beauty|attractiveness|appeal|charm|grace|style|fashion|trend|movement|development|progress|advancement|improvement|enhancement|upgrade|evolution|growth|expansion|increase|rise|boost|lift|elevation|promotion|advancement|progression|development|maturation|ripening|flowering|blooming|blossoming|flourishing|thriving|prospering|succeeding|achieving|accomplishing|attaining|reaching|arriving|coming|going|moving|traveling|journeying|exploring|discovering|finding|locating|identifying|recognizing|acknowledging|accepting|embracing|welcoming|greeting|meeting|encountering|experiencing|undergoing|enduring|suffering|struggling|fighting|battling|competing|contesting|challenging|confronting|facing|dealing|handling|managing|controlling|directing|leading|guiding|instructing|teaching|educating|training|preparing|equipping|providing|supplying|offering|giving|presenting|delivering|transferring|transmitting|communicating|expressing|conveying|sharing|spreading|distributing|circulating|broadcasting|publishing|releasing|launching|introducing|presenting|revealing|disclosing|exposing|uncovering|discovering|finding|locating|identifying|recognizing|understanding|comprehending|grasping|realizing|appreciating|valuing|treasuring|cherishing|loving|adoring|admiring|respecting|honoring|revering|worshipping|praising|celebrating|commemorating|remembering|recalling|reminiscing|reflecting|contemplating|considering|thinking|pondering|wondering|questioning|doubting|suspecting|believing|trusting|hoping|expecting|anticipating|predicting|forecasting|projecting|planning|preparing|organizing|arranging|scheduling|timing|coordinating|synchronizing|aligning|matching|pairing|combining|merging|joining|connecting|linking|bonding|attaching|fastening|securing|fixing|repairing|mending|healing|curing|treating|addressing|solving|resolving|settling|concluding|finishing|completing|ending|stopping|ceasing|terminating|closing|shutting|sealing|locking|securing|protecting|defending|guarding|watching|monitoring|observing|examining|inspecting|checking|testing|trying|attempting|endeavoring|striving|working|laboring|toiling|struggling|fighting|battling|competing|racing|running|walking|moving|traveling|going|coming|arriving|departing|leaving|exiting|entering|approaching|reaching|touching|feeling|sensing|perceiving|noticing|observing|seeing|viewing|looking|watching|staring|gazing|glancing|peeking|glimpsing|spotting|detecting|discovering|finding|locating|identifying|recognizing|knowing|understanding|comprehending|grasping|realizing|learning|studying|researching|investigating|exploring|examining|analyzing|evaluating|assessing|judging|deciding|choosing|selecting|picking|opting|preferring|favoring|liking|loving|enjoying|appreciating|valuing|treasuring|cherishing|caring|nurturing|supporting|helping|assisting|aiding|serving|providing|supplying|offering|giving|donating|contributing|sharing|distributing|spreading|extending|expanding|growing|developing|progressing|advancing|improving|enhancing|upgrading|updating|revising|modifying|changing|transforming|converting|turning|shifting|moving|transferring|transporting|carrying|bearing|holding|grasping|gripping|clutching|embracing|hugging|kissing|touching|feeling|caressing|stroking|patting|tapping|hitting|striking|beating|pounding|hammering|knocking|banging|crashing|smashing|breaking|shattering|destroying|demolishing|ruining|damaging|harming|hurting|injuring|wounding|cutting|slicing|chopping|slashing|stabbing|piercing|penetrating|entering|invading|attacking|assaulting|fighting|battling|warring|competing|contesting|challenging|opposing|resisting|defending|protecting|guarding|shielding|covering|hiding|concealing|masking|disguising|camouflaging|blending|mixing|combining|merging|joining|uniting|connecting|linking|bonding|binding|tying|fastening|attaching|securing|fixing|mounting|installing|setting|placing|positioning|locating|situating|establishing|founding|creating|making|building|constructing|assembling|manufacturing|producing|generating|developing|forming|shaping|molding|sculpting|carving|crafting|designing|planning|preparing|organizing|arranging|coordinating|managing|controlling|directing|leading|guiding|supervising|overseeing|monitoring|watching|observing|checking|inspecting|examining|testing|evaluating|assessing|measuring|calculating|computing|figuring|determining|deciding|concluding|inferring|deducing|reasoning|thinking|considering|contemplating|reflecting|pondering|wondering|questioning|asking|inquiring|investigating|researching|studying|learning|discovering|finding|uncovering|revealing|exposing|showing|displaying|demonstrating|illustrating|explaining|describing|defining|clarifying|interpreting|translating|converting|transforming|changing|modifying|altering|adjusting|adapting|accommodating|fitting|suiting|matching|corresponding|relating|connecting|associating|linking|bonding|joining|uniting|combining|merging|blending|mixing|integrating|incorporating|including|containing|comprising|consisting|involving|engaging|participating|contributing|sharing|cooperating|collaborating|working|partnering|teaming|grouping|gathering|assembling|meeting|convening|congregating|collecting|accumulating|amassing|stockpiling|storing|keeping|maintaining|preserving|conserving|protecting|safeguarding|securing|defending|guarding|watching|monitoring|supervising|overseeing|managing|controlling|directing|leading|heading|commanding|ordering|instructing|teaching|educating|training|coaching|mentoring|guiding|advising|counseling|consulting|helping|assisting|supporting|backing|endorsing|approving|accepting|embracing|welcoming|greeting|receiving|taking|getting|obtaining|acquiring|gaining|earning|winning|achieving|accomplishing|attaining|reaching|arriving|coming|approaching|nearing|closing|ending|finishing|completing|concluding|terminating|stopping|ceasing|quitting|leaving|departing|going|moving|traveling|journeying|exploring|wandering|roaming|drifting|floating|flying|soaring|climbing|ascending|rising|lifting|elevating|raising|boosting|increasing|growing|expanding|extending|stretching|reaching|touching|feeling|sensing|perceiving|experiencing|undergoing|suffering|enduring|tolerating|accepting|embracing|welcoming|enjoying|loving|liking|preferring|choosing|selecting|deciding|determining|concluding|finishing|ending)$/i.test(
      text
    );
  if (endsWithIncompleteNoun) {
    return false;
  }

  // Check for complete clauses without punctuation
  const hasSubjectVerb =
    /\b(?:I|you|he|she|it|we|they|this|that|there)\s+(?:am|is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|shall|may|might)\b/i.test(
      text
    );
  const isLongEnough = text.split(/\s+/).length >= 5;

  // Only consider it complete if it has subject-verb AND doesn't end with incomplete patterns
  return (
    hasSubjectVerb &&
    isLongEnough &&
    !/\b(?:story|news|information|data|report|article|book|movie|show|video|song|music|game|app|website|page|post|comment|message|email|letter|note|document|file|photo|picture|image|video|audio)\s*$/i.test(
      text
    )
  );
};

// Enhanced Chinese sentence completion rules
const isChineseCompleteSentence = (text: string): boolean => {
  // Check for Chinese punctuation
  if (/[。！？]$/.test(text)) {
    return true;
  }

  // Enhanced: Check for incomplete patterns that suggest continuation
  const endsWithIncompletePattern = /[，、；：—–-]$/.test(text);
  if (endsWithIncompletePattern) {
    return false;
  }

  // Enhanced: Check for incomplete noun phrases or concepts that need continuation
  const endsWithIncompleteNoun =
    /(?:能力|技能|方法|方式|策略|计划|想法|概念|思想|目的|目标|结果|影响|意义|重要性|价值|好处|优势|问题|挑战|困难|障碍|限制|要求|条件|情况|背景|环境|方式|技术|过程|系统|结构|模式|趋势|发展|进步|改进|变化|增长|扩展|选择|决定|判断|评估|分析|研究|探索|发现|结论|总结|报告|描述|解释|定义|例子|情况|故事|历史|来源|基础|原因|细节|特点|特征|质量|属性|元素|部分|内容|物质|材料|因素|方面|重点|主题|关注|兴趣|焦点|重要性|相关性|连接|关系|联系|相似性|差异|对比|符号|标志|指示|信号|线索|建议|推荐|建议|指导|指令|命令|要求|期望|希望|愿望|需要|必要性|性质|特性|地方|位置|场所|地点|现场|平台|基础|表面|边缘|边界|限制|开始|开端|入口|出口|路径|路线|方向|目的地|意图|设计|框架|网络|链条|系列|列表|目录|收集|组织|会议|活动|经历|冒险|旅程|访问|休息|间隔|距离|长度|宽度|高度|比例|百分比|部分|份额|类别|类型|种类|形式|形状|外观|样式|模式|样本|状态|等级|标准|质量|优势|利益|奖励|认可|赞赏|信用|赞扬|支持|帮助|服务|贡献|投资|承诺|忠诚|可靠性|诚实|真实|现实|事实|确定性|信心|信念|信任|希望|乐观|热情|兴奋|激情|好奇心|惊讶|困惑|不确定|怀疑|担心|焦虑|恐惧|紧张|压力|负担|责任|义务|承诺|协议|合同|安排|理解|妥协|解决|答案|回应|反应|反馈|评论|观察|声明|宣布|通知|警告|消息|沟通|信息|新闻|更新|通知|许可|批准|同意|接受|承认|披露|发现|成就|成功|失败|错误|问题|困难|复杂性|美丽|吸引力|魅力|风格|时尚|运动|进步|升级|演变|增长|扩展|补充|替代|选择|决定|结论)$/i.test(
      text
    );
  if (endsWithIncompleteNoun) {
    return false;
  }

  // Check for semantic ending patterns (了吗呢吧啊的地得着过来去上下)
  const hasCommonEndings = /[了吗呢吧啊的地得着过来去上下]$/.test(text);
  const isLongEnough = Array.from(text).length >= 4;

  return hasCommonEndings && isLongEnough;
};

// Enhanced Japanese sentence completion rules
const isJapaneseCompleteSentence = (text: string): boolean => {
  // Check for Japanese punctuation
  if (/[。！？]$/.test(text)) {
    return true;
  }

  // Enhanced: Check for incomplete patterns
  const endsWithIncompletePattern = /[、，；：—–-]$/.test(text);
  if (endsWithIncompletePattern) {
    return false;
  }

  // Enhanced: Check for incomplete noun phrases that need continuation
  const endsWithIncompleteNoun =
    /(?:能力|技術|方法|方式|戦略|計画|アイデア|概念|思想|目的|目標|結果|影響|意味|重要性|価値|利益|問題|課題|困難|障害|制限|要求|条件|状況|背景|環境|技術|プロセス|システム|構造|パターン|傾向|発展|進歩|改善|変化|成長|拡張|選択|決定|判断|評価|分析|研究|探索|発見|結論|要約|報告|説明|定義|例|状況|物語|歴史|源|基礎|理由|詳細|側面|特徴|品質|属性|要素|部分|内容|物質|材料|要因|観点|重点|テーマ|関心|焦点|重要性|関連性|接続|関係|類似性|違い|対比|シンボル|記号|指示|信号|手がかり|提案|推奨|アドバイス|指導|指示|命令|要求|期待|希望|願望|必要性|性質|特性|場所|位置|地点|現場|プラットフォーム|基盤|表面|端|境界|制限|始まり|開始|入口|出口|経路|ルート|方向|目的地|意図|設計|フレームワーク|ネットワーク|コチェーン|シリーズ|リスト|カタログ|コレクション|組織|会議|活動|経験|冒険|旅|訪問|休憩|間隔|距離|長さ|幅|高さ|比率|割合|部分|シェア|カテゴリ|タイプ|種類|形式|形状|外観|スタイル|パターン|サンプル|状態|ランク|標準|品質|優位性|利益|報酬|認識|感謝|信用|称賛|支援|助け|サービス|貢献|投資|コミット|忠誠|信頼性|正直|真実|現実|事実|確実性|信頼|信念|希望|楽観|熱意|興奮|情熱|好奇心|驚き|混乱|不確実|疑い|心配|不安|恐れ|緊張|ストレス|負担|責任|義務|約束|合意|契約|取り決め|理解|妥協|解決|答え|応答|反応|フィードバック|コメント|観察|声明|発表|通知|警告|メッセージ|コミュニケーション|情報|ニュース|更新|通知|許可|承認|同意|受諾|認識|開示|発見|成果|成功|失敗|間違い|問題|困難|複雑さ|美しさ|魅力|チャーム|スタイル|ファッション|運動|進歩|アップグレード|進化|成長|フォルム|補完|代替|選択|決定|結論)$/i.test(
      text
    );
  if (endsWithIncompleteNoun) {
    return false;
  }

  // Check for Japanese sentence endings (polite and casual forms)
  const politeEndings = /[ます|ました|でした|です|である|だった|だ]$/.test(
    text
  );
  const casualEndings = /[る|た|だ|よ|ね|か|な|わ|ぞ|ぜ]$/.test(text);
  const isLongEnough = Array.from(text).length >= 5;

  return (politeEndings || casualEndings) && isLongEnough;
};

// Enhanced Korean sentence completion rules
const isKoreanCompleteSentence = (text: string): boolean => {
  // Check for Korean punctuation
  if (/[。！？]$/.test(text)) {
    return true;
  }

  // Enhanced: Check for incomplete patterns
  const endsWithIncompletePattern = /[，、；：—–-]$/.test(text);
  if (endsWithIncompletePattern) {
    return false;
  }

  // Enhanced: Check for incomplete noun phrases that need continuation
  const endsWithIncompleteNoun =
    /(?:능력|기술|방법|방식|전략|계획|아이디어|개념|생각|목적|목표|결과|영향|의미|중요성|가치|이익|문제|과제|어려움|장애|제한|요구|조건|상황|배경|환경|기술|과정|시스템|구조|패턴|경향|발전|진보|개선|변화|성장|확장|선택|결정|판단|평가|분석|연구|탐색|발견|결론|요약|보고서|설명|정의|예|상황|이야기|역사|출처|기초|이유|세부사항|측면|특징|품질|속성|요소|부분|내용|물질|재료|요인|관점|중점|주제|관심|초점|중요성|관련성|연결|관계|유사성|차이|대비|상징|기호|지시|신호|단서|제안|추천|조언|지도|지시|명령|요구|기대|희망|소망|필요성|성질|특성|장소|위치|지점|현장|플랫폼|기반|표면|가장자리|경계|제한|시작|개시|입구|출구|경로|루트|방향|목적지|의도|설계|프레임워크|네트워크|체인|시리즈|목록|카탈로그|컬렉션|조직|회의|활동|경험|모험|여행|방문|휴식|간격|거리|길이|폭|높이|비율|백분율|부분|공유|카테고리|유형|종류|형식|모양|외관|스타일|패턴|샘플|상태|순위|표준|품질|우위|이익|보상|인식|감사|신용|칭찬|지원|도움|서비스|기여|투자|약속|충성|신뢰성|정직|진실|현실|사실|확실성|신뢰|믿음|희망|낙관|열정|흥분|열정|호기심|놀라움|혼란|불확실|의심|걱정|불안|두려움|긴장|스트레스|부담|책임|의무|약속|합의|계약|약정|이해|타협|해결|답|응답|반응|피드백|댓글|관찰|성명|발표|통지|경고|메시지|커뮤니케이션|정보|뉴스|업데이트|통지|허가|승인|동의|수락|인정|공개|발견|성과|성공|실패|실수|문제|어려움|복잡성|아름다움|매력|매력|스타일|패션|운동|진보|업그레이드|진화|성장|확장|보완|대안|선택|결정|결론)$/i.test(
      text
    );
  if (endsWithIncompleteNoun) {
    return false;
  }

  // Check for Korean sentence endings
  const politeEndings = /[습니다|ㅂ니다|세요|어요|아요|지요|죠]$/.test(text);
  const casualEndings = /[다|야|아|어|지|네|요]$/.test(text);
  const isLongEnough = Array.from(text).length >= 4;

  return (politeEndings || casualEndings) && isLongEnough;
};

// Check if two transcript items should be merged based on semantic continuity
const shouldMergeItems = (
  current: TranscriptItem,
  next: TranscriptItem,
  language: string
): boolean => {
  const currentText = current.transcript.trim();
  const nextText = next.transcript.trim();

  switch (language) {
    case "en":
      return shouldMergeEnglish(currentText, nextText);
    case "zh":
      return shouldMergeChinese(currentText, nextText);
    case "ja":
      return shouldMergeJapanese(currentText, nextText);
    case "ko":
      return shouldMergeKorean(currentText, nextText);
    default:
      return !isCompleteSentence(currentText);
  }
};

const shouldMergeEnglish = (current: string, next: string): boolean => {
  // Don't merge if current is complete
  if (isEnglishCompleteSentence(current)) return false;

  // Always merge if current ends with comma, semicolon, colon, or dash
  if (/[,;:\-–—]$/.test(current)) {
    return true;
  }

  // Merge if current ends with conjunction or preposition
  const endsWithConnector =
    /\b(?:and|or|but|so|because|since|while|when|where|if|that|which|who|with|for|in|on|at|by|from|to|of|about|during|through|over|under|between|among|against|toward|upon|within|without|before|after|above|below|beside|behind|beyond|across|along|around|near|inside|outside|onto|into|upon)$/i.test(
      current
    );

  // Merge if next starts with continuation words
  const startsWithContinuation =
    /^(?:and|or|but|so|then|also|however|therefore|moreover|furthermore|meanwhile|nevertheless|that|which|who|whom|whose|where|when|why|how)/i.test(
      next
    );

  // Enhanced: Merge if next starts with infinitive phrases (to + verb)
  const nextStartsWithInfinitive = /^to\s+\w+/i.test(next);

  // Enhanced: Merge if next starts with common verb phrases that complete the thought
  const nextStartsWithVerbPhrase =
    /^(?:needs?|wants?|requires?|demands?|expects?|hopes?|wishes?|desires?|aims?|seeks?|tries?|attempts?|strives?|works?|struggles?|fights?|battles?|competes?|contests?|challenges?|faces?|confronts?|deals?|handles?|manages?|controls?|directs?|leads?|guides?|helps?|assists?|supports?|serves?|provides?|offers?|gives?|shares?|contributes?|participates?|engages?|involves?|includes?|contains?|comprises?|consists?|features?|highlights?|emphasizes?|focuses?|concentrates?|targets?|points?|indicates?|shows?|reveals?|displays?|presents?|introduces?|announces?|declares?|states?|says?|tells?|speaks?|talks?|communicates?|expresses?|conveys?|spreads?|distributes?|starts?|begins?|ends?|finishes?|completes?|concludes?|stops?|continues?|proceeds?|develops?|grows?|increases?|improves?|changes?|moves?|takes?|brings?|sends?|delivers?|reaches?|touches?|feels?|experiences?|enjoys?|appreciates?|loves?|likes?|prefers?|chooses?|selects?|decides?)\b/i.test(
      next
    );

  // Merge if current ends with incomplete noun phrases
  const endsWithIncompleteNoun =
    /\b(?:story|news|information|data|report|article|book|movie|show|video|song|music|game|app|website|page|post|comment|message|email|letter|note|document|file|photo|picture|image|video|audio|thing|stuff|item|object|person|people|man|woman|child|boy|girl|student|teacher|worker|employee|customer|client|user|member|friend|family|parent|mother|father|brother|sister|son|daughter)$/i.test(
      current
    );

  // Merge if next starts with prepositional phrases that modify the previous noun
  const startsWithModifier =
    /^(?:about|of|in|on|at|by|from|to|with|for|during|through|over|under|between|among|against|toward|upon|within|without|before|after|above|below|beside|behind|beyond|across|along|around|near|inside|outside|onto|into)\s/i.test(
      next
    );

  // Special case: merge temporal/source information that follows quoted concepts or technical terms
  const currentEndsWithQuotedConcept =
    /(?:known as|called|termed|named|referred to as)\s+(?:an?\s+)?['""][^'""]+['""]$|['""][^'""]+['""]$/i.test(
      current
    );
  const nextIsTemporalOrSource =
    /^(?:from|in|during|since|around|about|circa|c\.|dating|originating)\s+(?:the\s+)?(?:\d{4}s?|\d{1,2}th\s+century|ancient|medieval|modern|early|late|mid)/i.test(
      next
    );

  return (
    endsWithConnector ||
    startsWithContinuation ||
    nextStartsWithInfinitive ||
    nextStartsWithVerbPhrase ||
    (endsWithIncompleteNoun && startsWithModifier) ||
    (currentEndsWithQuotedConcept && nextIsTemporalOrSource)
  );
};

const shouldMergeChinese = (current: string, next: string): boolean => {
  if (isChineseCompleteSentence(current)) return false;

  // Always merge if current ends with comma, semicolon, or dash
  if (/[，、；：—–-]$/.test(current)) {
    return true;
  }

  // Enhanced: Chinese continuation patterns
  const endsWithConnector = /[和或但所以因为当如果那这而且不过然后还也]$/.test(
    current
  );
  const startsWithContinuation =
    /^[和或但所以然后还也而且不过因此并且以及同时另外此外]/.test(next);

  // Enhanced: Merge if next starts with verb phrases or complements
  const nextStartsWithVerbPhrase =
    /^(?:需要|想要|要求|期望|希望|渴望|目标|寻求|尝试|努力|工作|奋斗|战斗|竞争|挑战|面对|处理|管理|控制|指导|领导|帮助|协助|支持|服务|提供|给予|分享|贡献|参与|参加|包括|包含|组成|特色|强调|专注|集中|针对|指向|表明|显示|揭示|展示|呈现|介绍|宣布|声明|说|告诉|讲|谈|沟通|表达|传达|传播|分发|开始|结束|完成|停止|继续|进行|前进|发展|成长|扩展|增加|上升|提升|增强|改善|升级|更新|修改|改变|转变|移动|转移|运输|携带|带来|发送|交付|供应|延伸|到达|触摸|感觉|感知|体验|享受|欣赏|喜爱|喜欢|偏爱|选择|决定)/.test(
      next
    );

  // Enhanced: Merge if current ends with incomplete noun and next provides context
  const currentEndsWithIncompleteNoun =
    /(?:能力|方法|方式|想法|概念|目的|目标|结果|影响|意义|价值|问题|挑战|条件|情况|背景|技术|过程|系统|结构|发展|变化|选择|决定|分析|研究|发现|内容|方面|特点|关系|地方|位置|方向|设计|经历|距离|类型|形式|状态|标准|帮助|服务|信息|消息|许可|成果|美丽|风格|运动|结论)$/.test(
      current
    );
  const nextProvidesContext =
    /^(?:的|是|在|从|到|为|与|和|或|但|所以|因为|当|如果|虽然|尽管|除了|关于|通过|根据|按照|依据|基于|由于|为了|以便|以免|以防|无论|不管|不论|即使|就算|哪怕|只要|只有|除非|假如|倘若|要是|万一|一旦|既然|因此|于是|然后|接着|随后|最后|最终|总之|总的来说|总而言之|换句话说|也就是说|换言之|简而言之|具体来说|详细来说|进一步说|更准确地说|更确切地说)/.test(
      next
    );

  return (
    endsWithConnector ||
    startsWithContinuation ||
    nextStartsWithVerbPhrase ||
    (currentEndsWithIncompleteNoun && nextProvidesContext)
  );
};

const shouldMergeJapanese = (current: string, next: string): boolean => {
  if (isJapaneseCompleteSentence(current)) return false;

  // Always merge if current ends with comma, semicolon, or dash
  if (/[、，；：—–-]$/.test(current)) {
    return true;
  }

  // Enhanced: Japanese continuation patterns
  const endsWithConnector =
    /[て|で|が|を|に|は|と|や|から|まで|ので|けれど|しかし|でも|そして|また|さらに]$/.test(
      current
    );
  const startsWithContinuation =
    /^[そして|それで|でも|しかし|また|さらに|そのため|したがって|つまり|すなわち|要するに|結局|最終的に|最後に|総じて|全体的に|具体的に|詳細に|さらに詳しく]/.test(
      next
    );

  // Enhanced: Merge if next starts with verb phrases
  const nextStartsWithVerbPhrase =
    /^(?:必要|欲しい|要求|期待|希望|願望|目標|求める|試す|努力|働く|奮闘|戦う|競争|挑戦|直面|対処|管理|制御|指導|リード|助ける|支援|サポート|サービス|提供|与える|共有|貢献|参加|含む|含有|構成|特徴|強調|集中|焦点|対象|指す|示す|明らかに|表示|提示|紹介|発表|宣言|言う|話す|コミュニケーション|表現|伝達|広がる|配布|開始|始める|終了|完了|停止|続ける|進行|前進|発展|成長|拡張|増加|上昇|向上|強化|改善|アップグレード|更新|修正|変更|変換|移動|転送|輸送|運ぶ|持参|送信|配達|供給|延長|到達|触れる|感じる|知覚|体験|楽しむ|感謝|愛|好き|好む|選択|決定)/.test(
      next
    );

  // Enhanced: Merge if current ends with incomplete noun and next provides context
  const currentEndsWithIncompleteNoun =
    /(?:能力|技術|方法|アイデア|概念|目的|目標|結果|影響|意味|価値|問題|課題|条件|状況|背景|技術|プロセス|システム|構造|発展|変化|選択|決定|分析|研究|発見|内容|観点|特徴|関係|場所|位置|方向|設計|経験|距離|タイプ|形式|状態|標準|助け|サービス|情報|メッセージ|許可|成果|美しさ|スタイル|運動|結論)$/.test(
      current
    );
  const nextProvidesContext =
    /^(?:の|は|が|を|に|で|と|や|から|まで|について|による|によって|に関して|に対して|のために|として|という|である|です|ます|した|する|される|できる|できない|必要|重要|可能|不可能|簡単|困難|良い|悪い|大きい|小さい|高い|低い|新しい|古い|美しい|醜い|速い|遅い|強い|弱い|明るい|暗い|熱い|冷たい|甘い|苦い|重い|軽い|長い|短い|広い|狭い|深い|浅い|厚い|薄い|硬い|柔らかい|滑らか|粗い|清潔|汚い|安全|危険|健康|病気|幸せ|悲しい|怒り|恐れ|驚き|興味|退屈|疲れ|元気|忙しい|暇|豊か|貧しい|有名|無名|成功|失敗|勝利|敗北|開始|終了|到着|出発|入学|卒業|結婚|離婚|誕生|死亡|購入|販売|建設|破壊|創造|発明|発見|学習|教育|訓練|練習|準備|計画|実行|完了|評価|改善|修正|変更|移動|旅行|訪問|滞在|帰宅|出発|到着|会議|議論|交渉|合意|契約|約束|決定|選択|判断|評価|分析|研究|調査|実験|テスト|確認|証明|説明|記述|定義|翻訳|通訳|理解|学習|記憶|忘却|思考|考慮|検討|反省|瞑想|集中|注意|観察|監視|検査|点検|確認|テスト|試験|評価|判定|測定|計算|推定|予測|予想|期待|希望|願望|欲求|必要|要求|命令|指示|助言|提案|推奨|警告|注意|通知|報告|発表|宣言|声明|表現|伝達|コミュニケーション|会話|議論|討論|辞論|説得|交渉|合意|妥協|解決|決定|結論)/.test(
      next
    );

  return (
    endsWithConnector ||
    startsWithContinuation ||
    nextStartsWithVerbPhrase ||
    (currentEndsWithIncompleteNoun && nextProvidesContext)
  );
};

const shouldMergeKorean = (current: string, next: string): boolean => {
  if (isKoreanCompleteSentence(current)) return false;

  // Always merge if current ends with comma, semicolon, or dash
  if (/[，、；：—–-]$/.test(current)) {
    return true;
  }

  // Enhanced: Korean continuation patterns
  const endsWithConnector =
    /[고|며|면|서|니까|지만|는데|으로|에서|에게|와|과|그리고|그러나|하지만|또한|그래서]$/.test(
      current
    );
  const startsWithContinuation =
    /^[그리고|그런데|하지만|그러나|또한|그래서|따라서|즉|요컨대|결국|최종적으로|마지막으로|전반적으로|구체적으로|자세히|더욱|더욱더]/.test(
      next
    );

  // Enhanced: Merge if next starts with verb phrases
  const nextStartsWithVerbPhrase =
    /^(?:필요|원하는|요구|기대|희망|소망|목표|추구|시도|노력|일|투쟁|싸움|경쟁|도전|직면|처리|관리|제어|지도|리드|도움|지원|서비스|제공|주는|공유|기여|참여|참가|포함|구성|특징|강조|집중|초점|대상|가리키는|보여주는|명확히|표시|제시|소개|발표|선언|말하는|이야기|대화|커뮤니케이션|표현|전달|확산|배포|시작|끝|완료|중지|계속|진행|전진|발전|성장|확장|증가|상승|향상|강화|개선|업그레이드|업데이트|수정|변경|변환|이동|전송|운송|운반|가져오는|보내는|배달|공급|연장|도달|터치|느끼는|지각|경험|즐기는|감사|사랑|좋아하는|선호|선택|결정)/.test(
      next
    );

  // Enhanced: Merge if current ends with incomplete noun and next provides context
  const currentEndsWithIncompleteNoun =
    /(?:능력|기술|방법|아이디어|개념|목적|목표|결과|영향|의미|가치|문제|과제|조건|상황|배경|기술|과정|시스템|구조|발전|변화|선택|결정|분석|연구|발견|내용|관점|특징|관계|장소|위치|방향|설계|경험|거리|유형|형식|상태|표준|도움|서비스|정보|메시지|허가|성과|아름다움|스타일|운동|결론)$/.test(
      current
    );
  const nextProvidesContext =
    /^(?:의|는|이|가|을|를|에|에서|와|과|로|으로|부터|까지|에게|에게서|한테|한테서|보다|처럼|같이|대해|대하여|관해|관하여|위해|위하여|때문에|인해|의해|따라|따르면|의하면|통해|통하여|거쳐|걸쳐|동안|사이|중|속|안|밖|위|아래|앞|뒤|옆|근처|주변|주위|중간|가운데|중앙|끝|시작|처음|마지막|다음|이전|전|후|좌|우|동|서|남|북|상|하|내|외|표|리|겉|속|밑|윗|아랫|앞|뒷|옆|중|외|내부|외부|표면|이면|전면|후면|측면|상면|하면|내면|외면|정면|배면|좌면|우면|상단|하단|전단|후단|좌단|우단|중단|말단|끝단|시단|종단|기단|정상|바닥|천장|벽|문|창|입구|출구|통로|길|도로|거리|골목|광장|공원|건물|집|방|부엌|화장실|침실|거실|서재|사무실|교실|강의실|회의실|식당|카페|상점|시장|병원|학교|대학|회사|공장|농장|목장|바다|강|호수|산|언덕|평야|사막|숲|정글|도시|마을|시골|나라|세계|우주|지구|달|태양|별|행성|은하|시간|공간|순간|시각|시점|기간|시대|세기|년|월|일|시|분|초|과거|현재|미래|어제|오늘|내일|아침|점심|저녁|밤|새벽|낮|주말|평일|휴일|방학|학기|계절|봄|여름|가을|겨울|날씨|기후|온도|습도|바람|비|눈|구름|햇빛|그늘|어둠|밝음|색깔|빨강|파랑|노랑|초록|검정|하양|회색|갈색|주황|보라|분홍|크기|무게|길이|폭|높이|깊이|두께|넓이|좁음|큼|작음|높음|낮음|깊음|얕음|두꺼움|얇음|무거움|가벼움|빠름|느림|강함|약함|딱딱함|부드러움|거침|매끄러움|뜨거움|차가움|따뜻함|시원함|달콤함|쓴맛|짠맛|신맛|매운맛|담백함|진함|연함|밝음|어둠|선명함|흐림|깨끗함|더러움|안전|위험|건강|질병|행복|슬픔|기쁨|분노|두려움|놀라움|관심|지루함|피로|활기|바쁨|한가함|부유함|가난|유명함|무명|성공|실패|승리|패배|시작|끝|도착|출발|입학|졸업|결혼|이혼|출생|사망|구매|판매|건설|파괴|창조|발명|발견|학습|교육|훈련|연습|준비|계획|실행|완료|평가|개선|수정|변경|이동|여행|방문|체류|귀가|출발|도착|회의|토론|협상|합의|계약|약속|결정|선택|판단|평가|분석|연구|조사|실험|테스트|확인|증명|설명|기술|정의|번역|통역|이해|학습|기억|망각|사고|고려|검토|반성|명상|집중|주의|관찰|감시|검사|점검|확인|테스트|시험|평가|판정|측정|계산|추정|예측|예상|기대|희망|소망|욕구|필요|요구|명령|지시|조언|제안|추천|경고|주의|통지|보고|발표|선언|성명|표현|전달|커뮤니케이션|대화|토론|논의|논쟁|설득|협상|합의|타협|해결|결정|결론)/.test(
      next
    );

  return (
    endsWithConnector ||
    startsWithContinuation ||
    nextStartsWithVerbPhrase ||
    (currentEndsWithIncompleteNoun && nextProvidesContext)
  );
};

// Enhanced function to automatically merge transcript items with improved language support
export const autoMergeTranscriptItems = (
  transcript: TranscriptItem[],
  maxDuration: number = 15, // Default 15 seconds max
  minDuration: number = 3, // Minimum 3 seconds to avoid too short segments
  maxWords: number = 25 // Maximum words per merged item
): TranscriptItem[] => {
  if (transcript.length < 2) {
    return transcript;
  }

  // Sort by start time
  const sortedTranscript = [...transcript].sort((a, b) => a.start - b.start);
  const result: TranscriptItem[] = [];
  let current: TranscriptItem | null = null;

  for (const item of sortedTranscript) {
    if (!current) {
      current = { ...item };
      continue;
    }

    const language = detectLanguage(current.transcript);
    const currentDuration = current.end - current.start;
    const mergedDuration = item.end - current.start;
    const mergedWordCount = (current.transcript + " " + item.transcript).split(
      /\s+/
    ).length;

    // Check various merge conditions
    const isCurrentComplete = isCompleteSentence(current.transcript);
    const wouldExceedTimeLimit = mergedDuration > maxDuration;
    const wouldExceedWordLimit = mergedWordCount > maxWords;
    const hasMinimumDuration = currentDuration >= minDuration;
    const shouldMergeSemantics = shouldMergeItems(current, item, language);

    // Decision logic for merging
    const shouldFinalizeCurrent =
      (isCurrentComplete && hasMinimumDuration) || // Complete sentence with minimum duration
      wouldExceedTimeLimit || // Would exceed time limit
      wouldExceedWordLimit || // Would exceed word limit
      !shouldMergeSemantics; // Semantically shouldn't merge

    if (shouldFinalizeCurrent) {
      result.push(current);
      current = { ...item };
    } else {
      // Merge items with proper spacing
      const separator =
        language === "zh" || language === "ja" || language === "ko" ? "" : " ";
      current = {
        start: current.start,
        end: item.end,
        transcript: current.transcript + separator + item.transcript,
      };
    }
  }

  // Add the last item
  if (current) {
    result.push(current);
  }

  return result;
};
