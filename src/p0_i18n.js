// ───────────────────────── i18n: English / 한국어 / 中文 / 日本語 ─────────────────────────
const LANGS = ['en', 'ko', 'zh', 'ja'];
const D = {
  // intro
  sub: ['A house in Seoul', '서울의 한 집', '首尔的家', 'ソウルの家'],
  intro: [
    'A brick villa in Seoul in November. The door is open. Walk the alley, the yard, the balcony and the roof, and use the kitchen, shower, bed and TV.',
    '11월 서울의 벽돌 빌라예요. 문이 열려 있어요. 골목, 마당, 베란다, 옥상을 걸어 보고 주방, 샤워, 침대, TV를 써 보세요.',
    '十一月的首尔，一栋红砖多世带住宅。门开着，巷子、院子、阳台、屋顶都能走，厨房、淋浴、床、电视都能用。',
    '11月のソウル、レンガ造りのヴィラ。ドアは開いています。路地、庭、ベランダ、屋上を歩いて、キッチン、シャワー、ベッド、テレビを使ってみてください。'],
  k_move: ['Move', '이동', '移动', '移動'], v_move: ['WASD or arrow keys, Shift to run', 'WASD 또는 방향키, Shift로 달리기', 'WASD 或方向键，Shift 跑', 'WASD か矢印キー、Shiftで走る'],
  k_look: ['Look', '시점', '视角', '視点'], v_look: ['Click the view, then move the mouse (or drag)', '화면을 클릭한 뒤 마우스를 움직이거나 드래그', '点击画面后移动鼠标，或按住拖动', '画面をクリックしてマウスを動かす（またはドラッグ）'],
  k_act: ['Interact', '상호작용', '互动', '操作'], v_act: ['Press E near an object', '물건 가까이에서 E 키', '靠近物体后按 E', '物に近づいてEキー'],
  k_wx: ['Weather', '날씨', '天气', '天気'], v_wx: ['Top buttons, or keys 1 to 4', '위쪽 버튼 또는 1~4 키', '顶部按钮，或按 1 2 3 4', '上のボタン、または1〜4キー'],
  k_ph: ['Phone', '휴대폰', '手机', 'スマホ'], v_ph: ['Left stick to move, drag the right side to look, button at bottom right to interact', '왼쪽 스틱으로 이동, 오른쪽을 밀어 시점 이동, 오른쪽 아래 버튼으로 상호작용', '左下摇杆移动，右半屏滑动转视角，右下按钮互动', '左のスティックで移動、右側をなぞって視点、右下のボタンで操作'],
  btn_free: ['Explore freely', '자유롭게 둘러보기', '自由参观', '自由に見て回る'], btn_tour: ['Room tour', '룸투어', '房屋导览', 'ルームツアー'],
  loading: ['Building the house ...', '집을 짓는 중 ...', '正在建造房子 ...', '家を建てています ...'],
  // hud
  wx_clear: ['Clear', '맑음', '晴', '晴'], wx_rain: ['Rain', '비', '雨', '雨'], wx_snow: ['Snow', '눈', '雪', '雪'], wx_night: ['Night', '밤', '夜', '夜'],
  wx_clear2: ['맑음', 'Clear', '맑음', '맑음'], wx_rain2: ['비', 'Rain', '비', '비'], wx_snow2: ['눈', 'Snow', '눈', '눈'], wx_night2: ['밤', 'Night', '밤', '밤'],
  snd_on: ['Sound on', '소리 켬', '声音 开', '音 オン'], snd_off: ['Sound off', '소리 끔', '声音 关', '音 オフ'],
  hint_pc: ['WASD to move · mouse to look · E to interact', 'WASD 이동 · 마우스로 둘러보기 · E 상호작용', 'WASD 移动 · 鼠标环顾 · E 互动', 'WASDで移動 · マウスで見回す · Eで操作'], hint_touch: ['Left stick to move · drag to look · tap the button to interact', '왼쪽 스틱으로 이동 · 드래그로 둘러보기 · 버튼으로 상호작용', '左侧摇杆移动 · 拖动环顾 · 点按钮互动', '左スティックで移動 · ドラッグで見回す · ボタンで操作'],
  tour_btn: ['Tour', '투어', '导览', 'ツアー'],
  tour_next: ['Next', '다음', '下一站', '次へ'], tour_prev: ['Back', '이전', '上一站', '戻る'], tour_exit: ['Exit tour', '투어 종료', '退出导览', 'ツアー終了'],
  tour_end: ['That is the tour. Explore on your own from here.', '투어가 끝났어요. 이제 자유롭게 둘러보세요.', '导览结束，接下来随便逛吧。', 'ツアー終了です。ここからは自由に見て回れます。'],
  // tour stops
  t_street: ['The alley', '골목', '小巷', '路地'],
  d_street: ['A narrow Seoul side street. Brick villas, ginkgo trees, overhead wires, and a convenience store on the corner.', '서울의 좁은 골목. 벽돌 빌라, 은행나무, 얽힌 전선, 모퉁이의 편의점.', '首尔的窄巷。红砖联排、银杏树、头顶的电线，街角有便利店。', 'ソウルの細い路地。レンガ造りのヴィラ、イチョウ、頭上の電線、角のコンビニ。'],
  t_yard: ['Front yard', '마당', '小院', '庭'],
  d_yard: ['A persimmon tree, onggi jars and chrysanthemum pots. The gate is always open.', '감나무, 장독, 국화 화분. 대문은 늘 열려 있어요.', '柿子树、酱缸、菊花盆栽。大门一直开着。', '柿の木、甕（おんぎ）、菊の鉢。門はいつも開いています。'],
  t_entry: ['Entrance (현관)', '현관', '玄关 (현관)', '玄関（현관）'],
  d_entry: ['Shoes come off here. A tiled step, a shoe cabinet and slippers.', '신발은 여기서 벗어요. 타일 바닥, 신발장, 슬리퍼.', '在这里脱鞋。瓷砖地面、鞋柜、拖鞋。', 'ここで靴を脱ぎます。タイルの床、下駄箱、スリッパ。'],
  t_living: ['Living room', '거실', '客厅', 'リビング'],
  d_living: ['A sofa facing the TV, a rug, and ondol heating under the wooden floor.', 'TV를 마주한 소파, 러그, 나무 바닥 아래의 온돌.', '对着电视的沙发、地毯，木地板下是地暖（온돌）。', 'テレビに向かうソファ、ラグ、木の床の下にはオンドル。'],
  t_kitchen: ['Kitchen', '주방', '厨房', 'キッチン'],
  d_kitchen: ['Cook ramyeon on the gas stove. The fridge and the pantry are within reach.', '가스레인지로 라면을 끓여요. 냉장고와 찬장이 손 닿는 곳에 있어요.', '在燃气灶上煮拉面。冰箱和柜子都伸手可及。', 'ガスコンロでラーメンを作れます。冷蔵庫と棚はすぐ手の届くところ。'],
  t_bath: ['Bathroom', '욕실', '浴室', 'バスルーム'],
  d_bath: ['Shower, mirror and a tiled floor. The mirror fogs up when the water runs.', '샤워 공간, 거울, 타일 바닥. 물을 틀면 거울에 김이 서려요.', '淋浴间、镜子、瓷砖地面。放水时镜子会起雾。', 'シャワー、鏡、タイルの床。お湯を出すと鏡が曇ります。'],
  t_bed: ['Bedroom (2F)', '침실 (2층)', '卧室 (二楼)', '寝室（2階）'],
  d_bed: ['A low bed, a desk by the window and a wardrobe. Sleep to skip to morning.', '낮은 침대, 창가 책상, 옷장. 자면 아침이 와요.', '矮床、窗边书桌、衣柜。睡一觉就到早上。', '低いベッド、窓際の机、クローゼット。寝ると朝になります。'],
  t_balcony: ['Balcony', '베란다', '阳台', 'ベランダ'],
  d_balcony: ['Plants and the air-conditioner outdoor unit, just like a real Seoul villa.', '화분과 에어컨 실외기. 서울 빌라 그대로예요.', '绿植和空调外机，和真正的首尔联排一样。', '植木鉢とエアコンの室外機。ソウルのヴィラそのままです。'],
  t_roof: ['Rooftop', '옥상', '屋顶', '屋上'],
  d_roof: ['A green-painted roof, a wooden platform, drying chili peppers, and the city all around.', '녹색 방수 바닥, 평상, 말리는 고추, 그리고 사방으로 펼쳐진 도시.', '绿色防水地面、平床、晾晒的辣椒，四周都是城市。', '緑の防水床、平床（ピョンサン）、干し唐辛子、周りに広がる街。'],
  t_dusk: ['Evening', '저녁', '傍晚', '夕方'],
  d_dusk: ['Lights come on window by window. Try the weather buttons.', '창문마다 불이 켜져요. 날씨 버튼도 눌러 보세요.', '窗户一扇接一扇亮起来。试试天气按钮。', '窓に一つずつ明かりがともります。天気ボタンも試してみて。'],
  // interactions
  door_close: ['Close the door', '문 닫기', '关门', 'ドアを閉める'], door_open: ['Open the door', '문 열기', '开门', 'ドアを開ける'],
  door_t1: ['The door is open. A breeze comes in.', '문이 열려 있어요. 바람이 들어와요.', '门开着，风进来了。', 'ドアが開いている。風が入ってくる。'], door_t0: ['The door is closed.', '문을 닫았어요.', '门关上了。', 'ドアを閉めた。'],
  sw1: ['Lights, 1F', '1층 불', '一楼开关灯', '1階の電気'], sw2: ['Lights, 2F', '2층 불', '二楼开关灯', '2階の電気'], lamp: ['Bedside lamp', '침대 옆 조명', '床头灯', 'ベッドサイドランプ'],
  ondol_off: ['Turn off floor heating', '온돌 끄기', '关闭地暖', 'オンドルを切る'], ondol_on: ['Turn on floor heating (온돌)', '온돌 켜기', '打开地暖 (온돌)', 'オンドルをつける'],
  ondol_t1: ['The floor slowly warms up.', '바닥이 서서히 따뜻해져요.', '地板慢慢暖起来。', '床がゆっくり温まる。'], ondol_t0: ['Floor heating off.', '온돌을 껐어요.', '地暖关了。', 'オンドルを切った。'],
  fr_open: ['Open the fridge', '냉장고 열기', '开冰箱', '冷蔵庫を開ける'], fr_close: ['Close the fridge', '냉장고 닫기', '关冰箱', '冷蔵庫を閉める'],
  fr_t: ['Kimchi, eggs, milk and half a bottle of soju.', '김치, 계란, 우유, 그리고 소주 반 병.', '泡菜、鸡蛋、牛奶、半瓶烧酒。', 'キムチ、卵、牛乳、焼酎が半分。'],
  cup_take: ['Take a pack of ramyeon', '라면 한 봉지 꺼내기', '拿一包辛拉面', 'ラーメンを一袋取る'], cup_have: ['There is another pack in here', '찬장에 한 봉지 더 있어요', '柜子里还有一包', '棚にもう一袋ある'],
  cup_t1: ['Got a pack of ramyeon. Head to the stove.', '라면을 꺼냈어요. 가스레인지로 가요.', '拿到一包辛拉面。去灶台。', 'ラーメンを手に入れた。コンロへ。'], cup_t2: ['Cook the one in your hand first.', '들고 있는 것부터 끓여요.', '先把手里这包煮了。', '持っている分を先に作ろう。'],
  st_none: ['Stove (no noodles yet)', '가스레인지 (라면이 아직 없어요)', '灶台 (还没有面)', 'コンロ（麺がまだない）'], st_have: ['Start cooking', '끓이기 시작', '开火煮面', '火をつけて作る'],
  st_cooking: ['Cooking...', '끓이는 중…', '煮着呢…', '調理中…'], st_ready: ['Turn off the heat and serve', '불 끄고 담기', '关火，盛到碗里', '火を止めて盛りつける'], st_idle: ['Stove', '가스레인지', '灶台', 'コンロ'],
  st_t0: ['Get a pack of noodles from the cupboard first.', '먼저 찬장에서 라면을 꺼내요.', '先去柜子拿包泡面。', 'まず棚からラーメンを取ろう。'],
  st_t1: ['Flame on. About 8 seconds until it boils.', '불을 켰어요. 끓을 때까지 8초쯤.', '点火。等水开，大约 8 秒。', '点火した。沸騰まで約8秒。'],
  st_t2: ['Done. Turn off the heat and serve.', '다 됐어요. 불 끄고 담아요.', '面煮好了。去灶台关火盛出来。', 'できあがり。火を止めて盛りつけよう。'],
  st_t3: ['Served. Carry it to the table.', '담았어요. 식탁으로 가져가요.', '盛好了，端到餐桌上吃。', '盛りつけた。テーブルへ。'],
  eat: ['Eat', '먹기', '吃面', '食べる'],
  eat_t: ['맛있다. Steam on your face, warmth in your belly.', '맛있다. 김이 얼굴에 닿고 배가 따뜻해져요.', '맛있다。热气扑在脸上，肚子暖了。', '맛있다。湯気が顔にあたり、おなかが温まる。'],
  tv_on: ['Turn on the TV', 'TV 켜기', '开电视', 'テレビをつける'], tv_off: ['Turn off the TV', 'TV 끄기', '关电视', 'テレビを消す'],
  sit: ['Sit and watch TV', '앉아서 TV 보기', '坐下看电视', '座ってテレビを見る'], sit_t: ['You sit down. Press E or move to stand up.', '앉았어요. E 키나 이동키로 일어나요.', '坐下了。按 E 或移动键站起来。', '座った。Eか移動キーで立つ。'], stand: ['Stand up', '일어나기', '站起来', '立ち上がる'],
  sh_on: ['Take a shower', '샤워하기', '洗澡', 'シャワーを浴びる'], sh_off: ['Turn off the shower', '샤워 끄기', '关掉淋浴', 'シャワーを止める'],
  sh_t: ['Perfect temperature. The mirror starts to fog.', '물이 딱 좋아요. 거울에 김이 서려요.', '水温刚好。镜子开始起雾。', 'ちょうどいい温度。鏡が曇ってくる。'],
  sh_auto: ['The water switched off by itself.', '물이 저절로 꺼졌어요.', '水自动关了。', '水が自動で止まった。'],
  flush: ['Flush', '물 내리기', '冲水', '流す'], wash: ['Wash hands', '손 씻기', '洗手', '手を洗う'], wash_t: ['Clean hands.', '손이 깨끗해졌어요.', '手洗干净了。', '手がきれいになった。'],
  sleep: ['Go to sleep', '자기', '睡觉', '寝る'], sleep_a: ['잘 자요  ·  Good night', '잘 자요', '잘 자요  ·  晚安', '잘 자요  ·  おやすみ'], sleep_b: ['아침이에요  ·  Morning', '아침이에요', '아침이에요  ·  天亮了', '아침이에요  ·  朝です'],
  sleep_t: ['Morning. Birds outside the window.', '아침이에요. 창밖에서 새소리가 들려요.', '早上了。窗外有鸟叫。', '朝だ。窓の外で鳥が鳴いている。'],
  pc: ['Check the computer', '컴퓨터 보기', '看看电脑', 'パソコンを見る'], pc_t: ['3 unread emails. Not now.', '읽지 않은 메일 3통. 나중에 볼게요.', '邮箱里有 3 封未读。先不看了。', '未読メールが3通。あとにしよう。'],
  vend: ['Buy a hot coffee (₩1,000)', '따뜻한 캔커피 사기 (1,000원)', '买一罐热咖啡 (1,000원)', '温かい缶コーヒーを買う（1,000ウォン）'],
  vend_t: ['Thunk. A hot can drops out and warms your hands.', '덜컹. 따뜻한 캔이 나와서 손이 녹아요.', '咚。热罐装咖啡掉了出来，暖了暖手。', 'ガコン。温かい缶が出てきて手が温まる。'],
  cat: ['Pet the cat', '고양이 쓰다듬기', '摸摸猫', '猫をなでる'], cat_t: ['The cat purrs and rubs against your hand.', '고양이가 가르랑거리며 손에 머리를 비벼요.', '小猫发出呼噜声，蹭了蹭你的手。', '猫がゴロゴロ言って手にすり寄る。'],
  wx_t_clear: ['Clear. A light breeze.', '맑음. 바람이 가벼워요.', '晴。风很轻。', '晴れ。そよ風。'], wx_t_rain: ['It starts to rain.', '비가 내리기 시작해요.', '开始下雨。', '雨が降り出した。'], wx_t_snow: ['It is snowing.', '눈이 내려요.', '下雪了。', '雪が降ってきた。'],
  enter_t: ['Walk forward and go inside.', '앞으로 걸어 집 안으로 들어가세요.', '向前走，进门。', '前に進んで、家に入ろう。'],
  hi: ['Say hello', '인사하기', '打招呼', 'あいさつする'], pick: ['Sit on the bench', '벤치에 앉기', '坐在长椅上', 'ベンチに座る'],
};
// short neighbourhood small talk: Korean line plus a translation
const TALK = [
  { ko: '안녕하세요!', en: 'Hello!', zh: '你好！', ja: 'こんにちは！' },
  { ko: '오늘 날씨 참 좋네요.', en: 'Nice weather today.', zh: '今天天气真好。', ja: '今日はいい天気ですね。' },
  { ko: '춥죠? 따뜻하게 입으세요.', en: 'Cold, isn\'t it? Stay warm.', zh: '冷吧？多穿点。', ja: '寒いですね。暖かくしてください。' },
  { ko: '이 동네 처음이세요?', en: 'First time in this neighborhood?', zh: '第一次来这一带吗？', ja: 'この辺りは初めてですか？' },
  { ko: '안녕히 가세요.', en: 'Take care.', zh: '慢走。', ja: 'お気をつけて。' },
];
const TALK_RAIN = { ko: '비 오는데 우산 챙기셨어요?', en: 'It is raining. Do you have an umbrella?', zh: '下雨了，带伞了吗？', ja: '雨ですよ、傘はありますか？' };
const TALK_SNOW = { ko: '눈이 오네요. 미끄러우니 조심하세요.', en: 'It is snowing. Watch your step, it is slippery.', zh: '下雪了，路滑，小心点。', ja: '雪ですね。滑るので気をつけて。' };
const TALK_NIGHT = { ko: '밤인데 아직도 안 들어가셨어요?', en: 'Still out this late?', zh: '这么晚了还没回家？', ja: 'こんな時間までお出かけですか？' };
let LANG = 'en';
try {
  const s = localStorage.getItem('seoul-lang');
  if (LANGS.includes(s)) LANG = s; else { const n = (navigator.language || 'en').toLowerCase(); LANG = n.startsWith('ko') ? 'ko' : n.startsWith('zh') ? 'zh' : n.startsWith('ja') ? 'ja' : 'en'; }
} catch (e) { /* storage may be blocked; default to English */ }
function T(k) { const e = D[k]; if (!e) return k; return e[LANGS.indexOf(LANG)] || e[0]; }
function say(line) { return LANG === 'ko' ? line.ko : `${line.ko}  ·  ${line[LANG]}`; }
const langHooks = [];
function applyLang() {
  document.documentElement.lang = { en: 'en', ko: 'ko', zh: 'zh-CN', ja: 'ja' }[LANG];
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = T(el.dataset.i18n); });
  document.querySelectorAll('#lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
  const m = $('mute'); if (m) m.textContent = T(m.getAttribute('aria-pressed') === 'true' ? 'snd_off' : 'snd_on');
  document.title = LANG === 'ko' ? '서울의 집' : LANG === 'zh' ? '首尔的家' : LANG === 'ja' ? 'ソウルの家' : 'Seoul House';
  langHooks.forEach((f) => f());
}
function setLang(l) { if (!LANGS.includes(l)) return; LANG = l; try { localStorage.setItem('seoul-lang', l); } catch (e) { /* optional */ } applyLang(); }

