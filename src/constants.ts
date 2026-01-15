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

export const MUSIC_LIST = SONG_LIST.map((s) => s.title);

// ★変更：LiveEventにplaceを追加
export type LiveEvent = {
  date: string;     // YYYY-MM-DD形式
  liveName: string;
  place?: string;   // 会場名（任意）
};

// ライブ予定
export const LIVE_EVENTS: LiveEvent[] = [
  { date: "2026-01-03", liveName: "「アイドル甲子園 in clubasia」-DAY2-" },
  { date: "2026-01-03", liveName: "IDOL ∞ INFINITY 新春SP" },
  { date: "2026-01-15", liveName: "MARQUEE祭 Vol.168", place: "Spotify O-WEST" },
  { date: "2026-01-16", liveName: "→Taria.Presents 「NexTime vol.2」", place: "白金高輪SELENE b2" },
  { date: "2026-01-17", liveName: "アイドルマリアージュVol.43", place: "有明 スモールワールズ" },
  { date: "2026-01-18", liveName: "渋谷JACK～NEWYEAR SP～", place: "渋谷VIDENT" },
  { date: "2026-01-28", liveName: "GIGA•GIGA SONIC presented by UtaTen / チェキチャ", place: "duo MUSIC EXCHANGE" },
  { date: "2026-01-30", liveName: "新塘真理 BIRTHDAY LIVE 2026", place: "SHIBUYA DIVE" },
  { date: "2026-01-31", liveName: "「アイドル甲子園 in KANDA SQUARE HALL」DAY1" },
  { date: "2026-02-01", liveName: "「アイドル甲子園 in KANDA SQUARE HALL」DAY2" },
  { date: "2026-02-02", liveName: "TOKYO GIRLS GIRLS" },
  { date: "2026-02-03", liveName: "GIGA•GIGA SONIC", place: "Zepp Shinjuku" },
  { date: "2026-02-07", liveName: "LEADING WINTER", place: "KANDA SQUARE HALL" },
  { date: "2026-02-15", liveName: "MARQUEE祭mini Vol.300", place: "Spotify O-nest" },
];