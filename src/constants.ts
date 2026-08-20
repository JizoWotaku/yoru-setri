export type Song = {
  title: string;
  keywords: string;
};

export const SONG_LIST: Song[] = [
  { title: "SE", keywords: "seえすいー" },
  { title: "MC", keywords: "mcえむしー" },
  { title: "アンコール", keywords: "encoreあんこーる" },
  { title: "生く空蝉", keywords: ""},
  { title: "皆SUMMER☆HIGHLIGHT!", keywords: "みなさま" },
  { title: "Delight", keywords: "でらいとデライトDelight"},
  {
    title: "あたしイズム宣言!!!",
    keywords:
      "あたしイズム宣言!!!atashiizumusengenあたしいずむせんげんアタシイズムセンゲン",
  },
  {
    title: "ふわり、初恋。",
    keywords: "ふわり、初恋。fuwarihatsukoiふわりはつこいフワリハツコイ",
  },
  {
    title: "君とあの日の距離",
    keywords:
      "君とあの日の距離kimitoanohinokyoriきみとあのひのきょりキミトアノヒノキョリkimikyoきみきょキミキョ",
  },
  {
    title: "君と描く夢",
    keywords:
      "君と描く夢きみとえがくゆめキミトエガクユメkimitoegakuyume",
  },
  {
    title: "月から金まで",
    keywords:
      "月から金までgetsukarakinmadeげつからきんまでゲツカラキンマデgetsu",
  },
  {
    title: "等身大のアイラブミー",
    keywords:
      "等身大のアイラブミーtoushindainoairabumiとうしんだいのあいらぶみートウシンダイノアイラブミーiloveme",
  },
  {
    title: "遠回りがいいっ!",
    keywords: "遠回りがいいっ!toomwarigaiiとおまわりがいいトオマワリガイイ",
  },
  {
    title: "特別な時間",
    keywords: "特別な時間tokubetsunajikanとくべつなじかんトクベツナジカン",
  },
  { title: "好きって。", keywords: "好きって。sukitte好きってすきってスキッテ" },
  {
    title: "指先の向こう",
    keywords: "指先の向こうyubisakinomukouゆびさきのむこうユビサキノムコウ",
  },
  {
    title: "青春はサイダー!",
    keywords: "青春はサイダー!seishunwasaidaせいしゅんはさいだーセイシュンハサイダーcider",
  },
  {
    title: "青春らいおっと",
    keywords: "青春らいおっとseishunriotせいしゅんらいおっとセイシュンライオット",
  },
  {
    title: "待っていてね。",
    keywords: "待っていてね。matteiteneまっていてねマッテイテネ",
  },
  { title: "ソライロ", keywords: "ソライロsorairoそらいろソライロ" },
  {
    title: "ド・ド・ド・ド・ドーナッツ",
    keywords:
      "ド・ド・ド・ド・ドーナッツdododododonattsuどどどどどーなっつドドドドドーナッツdonut",
  },
  {
    title: "BRAND NEW ME!",
    keywords: "brand new me!brandnewmeぶらんどにゅーみーブランドニューミーbnm",
  },
];

export const MUSIC_LIST = SONG_LIST.map((s) => s.title);

// ★変更：LiveEventにplaceを追加
export type LiveEvent = {
  date: string;     // YYYY-MM-DD形式
  liveName: string;
  place?: string;   // 会場名（任意）
};

// ライブ予定
// { date: "2026-", liveName: "", place: "" },
export const LIVE_EVENTS: LiveEvent[] = [
{ date: "2026-07-26", liveName: "キニなるlive 無銭2MAN LIVE", place: "渋谷GRIT" },
{ date: "2026-07-27", liveName: "Girl’Bomb!! 〜 真夏の祭典 〜", place: "Spotify O-EAST" },
{ date: "2026-07-27", liveName: "森宮藍presents「もりもりまつり！」", place: "Viblue EBISU" },
{ date: "2026-07-29", liveName: "花色フェス〜夏花火2026〜", place: "品川ステラボール" },
{ date: "2026-07-30", liveName: "IDOL BIBLE vol.1", place: "VeatsSHIBUYA" },
{ date: "2026-08-01", liveName: "TOKYO GIRLS GIRLS extra!!", place: "EBiS303" },
{ date: "2026-08-05", liveName: "IDOL SUMMER JUNGLE 2026", place: "お台場R地区" },
{ date: "2026-08-05", liveName: "ふぉにコレ! vol.4", place: "品川ステラボール" },
{ date: "2026-08-06", liveName: "IDOL SUMMER JUNGLE 2026", place: "お台場R地区" },
{ date: "2026-08-10", liveName: "NEO KASSEN2026", place: "" },
{ date: "2026-08-11", liveName: "【女性限定LIVE】Girls place to be. vol.3", place: "シティーホール＆ギャラリー五反田" },
{ date: "2026-08-16", liveName: "君と見るそら×原宿ベルエポック", place: "原宿ベルエポック美容専門学校第2校舎イベントホール" },
{ date: "2026-08-20", liveName: "MARQUEE祭 Vol.180", place: "Spotify O-WEST" },
{ date: "2026-08-29", liveName: "超WEGO 2026", place: "WEGO 1.3.5... 原宿店" },
{ date: "2026-08-30", liveName: "@ JAM EXPO 2026 supported by UP-T", place: "横浜アリーナ" },
];