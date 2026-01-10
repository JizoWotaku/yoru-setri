export type Song = {
  title: string;
  keywords: string;
};

export const SONG_LIST: Song[] = [
  { title: "SE", keywords: "seえすいー" },
  { title: "MC", keywords: "mcえむしー" },
  {
    title: "あたしイズム宣言‼︎!",
    keywords:
      "あたしイズム宣言‼︎!atashiizumusengenあたしいずむせんげんアタシイズムセンゲン",
  },
  { title: "ソライロ", keywords: "ソライロsorairoそらいろソライロ" },
  {
    title: "ド・ド・ド・ド・ドーナッツ",
    keywords:
      "ド・ド・ド・ド・ドーナッツdododododonattsuどどどどどーなっつドドドドドーナッツdonut",
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
    title: "青春らいおっと",
    keywords: "青春らいおっとseishunriotせいしゅんらいおっとセイシュンライオット",
  },
  {
    title: "青春はサイダー!",
    keywords: "青春はサイダー!seishunwasaidaせいしゅんはさいだーセイシュンハサイダーcider",
  },
  {
    title: "待っていてね。",
    keywords: "待っていてね。matteiteneまっていてねマッテイテネ",
  },
  {
    title: "指先の向こう",
    keywords: "指先の向こうyubisakinomukouゆびさきのむこうユビサキノムコウ",
  },
  {
    title: "BRAND NEW ME!",
    keywords: "brand new me!brandnewmeぶらんどにゅーみーブランドニューミーbnm",
  },
  { title: "新曲", keywords: "新曲shinkyokuしんきょくシンキョクnew" },
];

// 既存コードとの互換性のため（もし他で使っていれば）
export const MUSIC_LIST = SONG_LIST.map((s) => s.title);