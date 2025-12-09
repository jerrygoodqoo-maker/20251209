// 共用題庫，所有提問者都會從這裡隨機抽題
const questionPool = [
  {
    question: "台積電的股票代號?",
    options: ["1.0050", "2.2330", "3.2317"],
    answer: 2,
    hint: "這家公司是台灣的「護國神山」。",
  },
  {
    question: "比特幣的單位是捨麼？",
    options: ["1.bit", "2.聰", "3.coin"],
    answer: 2,
    hint: "創造者名為中本聰。",
  },
  {
    question: "由元大發行成分股包含台灣前50大公司的股票代號為？",
    options: ["1.006208", "2.0500", "3.0050"],
    answer: 3,
    hint: "前(50)大。",
  },
  {
    question: "比特幣可分割至小數點後幾位數？",
    options: ["1.8", "2.10", "3.7"],
    answer: 1,
    hint: "你可以購買0.00000001顆比特幣。",
  },
  {
    question: "比特幣最多會有多少顆？",
    options: ["1.4000萬顆", "2.無限發行", "3.2100萬顆"],
    answer: 3,
    hint: "有人稱之為數位黃金。",
  },
  {
    question: "12/9之前 台積電最高股價是多少？",
    options: ["1.1525", "2.1480", "3.1545"],
    answer: 1,
    hint: "最高點的日期在10/31。",
  },
  {
    question: "何者非追蹤美國前500大公司的指數？",
    options: ["1. QQQ", "2. SPY", "3. VOO"],
    answer: 1,
    hint: "又稱標普500。",
  },
  {
    question: "何者為穩定幣？",
    options: ["1.ETH", "2.DOGE", "3.USDT"],
    answer: 3,
    hint: "穩定幣與美元掛鉤。",
  },
  {
    question: "曾經由多位諾獎得主和聯準會前主席等人物組成的夢幻團隊 公司名為？",
    options: ["1.TSMC", "2.JPMorgan", "3.LTCM"],
    answer: 3,
    hint: "全名為長期資本管理公司。",
  },
  // 您可以在這裡輕鬆加入更多新題目！
];