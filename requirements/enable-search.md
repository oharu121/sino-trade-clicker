Currently the tool is for general usage. However, I want to build an interface that is tailored for sinotrade.
The goal is to create 2 tabs for 2 sources of articles.
under each tab user can click a drop down to select or search which article that the user wish to increase the view counts.

First, I found this graphql endpoint:
https://www.sinotrade.com.tw/richclub/api/graphql

there are 2 sections we want to fetch the articles from:

# sections

## 1. 深談總經

### example payload:
{
    "variables": {
        "input": {
            "channel": "6514f8b3b13f2760605fcef1",
            "limit": 10,
            "page": 0,
            "skip": 1
        }
    },
"query": "query ($input: clientGetContentListInput) {\n  clientGetArticleList(input: $input) {\n    filtered {\n      _id\n      title\n    }\n  }\n}\n"
}

### example response:
{
    "data": {
        "clientGetArticleList": {
            "filtered": [
                {
                    "_id": "68ff23fb032bb6011632bed5",
                    "title": "中國四中全會落幕，通過十五五年規劃，美中角力下，科技自立自強成為中國政策核心，陸港股能否複製美股AI行情？"
                },
                {
                    "_id": "68f5ca6d032bb601160a9f8e",
                    "title": "美國兩家區域銀行-錫安、西聯接連暴雷，會演變為系統性金融危機嗎?"
                },
                {
                    "_id": "68ec65ac671b969c1f2eda00",
                    "title": "中國稀土極限施壓，川普宣布加徵100%關稅，美中衝突急遽升級，4月解放日後的股市大修正會重演嗎? "
                },
                {
                    "_id": "68e4a15046b10f98ffe2f4bc",
                    "title": "不畏政府關門，美股依舊續創新高，背後的底氣是什麼? 美股的狂歡還能持續多久？"
                },
                {
                    "_id": "68db4d363871f084b4205daf",
                    "title": "鮑爾的美股高估值說、鷹派聲浪、強勁數據與政治僵局夾擊，美股會陷入修正格局嗎？"
                },
                {
                    "_id": "68d0b81391d5da84c2a3e057",
                    "title": "Fed如預期降息1碼，該如何解讀Powell所提的「風控式降息」?美股、美債後續會怎麼走? "
                },
                {
                    "_id": "68c7a91d931c2878853e60d3",
                    "title": "美CPI尚屬溫和，Fed本週降息已成定局，美股四大指數同創新高，近期是否還有催化劑可推升美股再締新猷? "
                },
                {
                    "_id": "68be49e465fa565ec69323c0",
                    "title": "美非農再度爆冷，景氣已搭上失速列車? Fed 9月會降息2碼? "
                },
                {
                    "_id": "68b50297ff4b3269a0a6e167",
                    "title": "預售屋解約潮來襲? 房市即將崩盤，央行應鬆綁信用管制…..許多負面消息鋪天蓋地而來，台灣房市真如媒體報導慘澹? 一文掌握台灣房市實際狀況"
                },
                {
                    "_id": "68ac01f90b776d5ef01137be",
                    "title": "Fed主席鮑爾(Powell)在Jackson Hole演說意外放鴿，為9月降息開啟綠燈，市場歡聲雷動，然之後是否為政策全面轉向寬鬆的開始?"
                },
                {
                    "_id": "68a284515d98113e2d3aa4bb",
                    "title": "通膨超預期，降息還有戲？9月FOMC該聽財長還是Fed官員？醫療股蠢蠢欲動！"
                },
                {
                    "_id": "689952717728123e3b8fb259",
                    "title": "美股財報表現出色，半導體關稅利空出盡？NASDAQ與AI概念股又創歷史新高，GPT-5問世，嚇得投資人「吃硬不吃軟」？美下半年景氣走緩，只要買入Mag 7任何風險攏無驚？"
                },
                {
                    "_id": "68901e7892495e3e81c39856",
                    "title": "川普關稅恐影響消費，加上非農爆冷，美國景氣會衰退嗎? 美股出現修正，後市怎麼看?"
                }
            ]
        }
    }
}

## 2. 股市熱話
### example payload:
{
    "variables": {
        "input": {
            "channel": "630c2850c6435a2ff402ccfb",
            "limit": 10,
            "page": 0,
            "skip": 1
        }
    },
"query": "query ($input: clientGetContentListInput) {\n  clientGetArticleList(input: $input) {\n    filtered {\n      _id\n      title\n    }\n  }\n}\n"
}

### example response:
{
    "data": {
        "clientGetArticleList": {
            "filtered": [
                {
                    "_id": "690aa7df0f5fbf11b91c790e",
                    "title": "美股重挫 AI泡沫憂慮引爆賣壓 華爾街巨頭警告回調將至｜股市話題"
                },
                {
                    "_id": "690a90cd59fccb1149c8dfcf",
                    "title": "美股AI風暴！費半崩4％、輝達台積電ADR慘跌；台股力守28K；普發1萬今登記，CoWoS缺口擴大｜1105晨間重點財經新聞摘要｜"
                },
                {
                    "_id": "690a905e7522c611c7406152",
                    "title": "美股盤後｜投行CEO警告股市回調，科技股領跌 1105"
                },
                {
                    "_id": "6909a49f97789711e3e0a4dd",
                    "title": "憂心估值高，AI股暴跌；衝高回跌，28500點站不上"
                },
                {
                    "_id": "6909bee9726f07118f040915",
                    "title": "台股美股焦點1104｜川普關稅案衝擊全球貿易、三星掀記憶體漲價潮、液冷散熱族群再獲大摩加持"
                },
                {
                    "_id": "6909ba493027fc1181f5a04a",
                    "title": "三大法人買賣超 – 外資買超(2330)台積電、(2454)聯發科，投信買超(2330)台積電、(2383)台光電，法人合計賣超115.76億元 (1104)"
                },
                {
                    "_id": "6909b82cc7113b11208e8aca",
                    "title": "Samsung 暫停 DDR5 報價掀記憶體風暴！台灣供應鏈南亞科、力成、群聯迎來轉機？｜股市話題"
                },
                {
                    "_id": "6909b2ad2a074211d5e002b8",
                    "title": "今日漲停跌停股｜化工、電纜、電支三箭齊發！中石化、華榮、綠界科技領漲台股 1104"
                },
                {
                    "_id": "6909aed997789711e3e0df76",
                    "title": "台股盤後｜衝高遇亂流 指數創新高後回落失守5日線 1104"
                },
                {
                    "_id": "6909a65d97789711e3e0aeb3",
                    "title": "史上最重要案件-川普關稅案判決，將如何影響全球貿易格局和金融市場｜股市話題"
                },
                {
                    "_id": "69095a519696eb119d8a42a8",
                    "title": "高階耳機及醫療OTC帶動，4Q25獲利重回成長軌道？【豐學PRIME盤後精選】"
                },
                {
                    "_id": "69099183c34df7115702439f",
                    "title": "美股法說 NVTS｜納微半導體 Navitas 轉型陣痛中的氮化鎵龍頭與台灣供應鏈布局 (NVTS US)"
                },
                {
                    "_id": "690990fa0f5fbf11b9178f48",
                    "title": "美股法說 VRTX｜Vertex 囊腫纖維化藥廠拓展版圖，台灣供應鏈受惠CDMO商機 (VRTX US)"
                },
                {
                    "_id": "69099032726f07118f02f1fe",
                    "title": "美股法說 PLTR｜Palantir AI平台爆發成長 營收年增63%，8檔台灣供應鏈整理 (PLTR US)"
                },
                {
                    "_id": "690978ce2a074211d5deac37",
                    "title": "液冷時代來臨!大摩全面調升散熱族群目標價 四大廠商迎AI伺服器黃金商機｜股市話題"
                },
                {
                    "_id": "690963874aaef11136d44988",
                    "title": "BLACKPINK、SUPER JUNIOR 接力來台開唱！演唱會概念股怎麼看？一文掌握營收、財報與亮點  ｜股市話題"
                },
                {
                    "_id": "690947e5e720d511f10b27eb",
                    "title": "川普變臉狠擋輝達Blackwell！台積電獲國家隊回補，記憶體封測醞釀二位數漲價潮｜1104晨間重點財經新聞摘要｜"
                },
                {
                    "_id": "69094028c34df7115700111c",
                    "title": "美股盤後｜亞馬遜宣布與OpenAI合作，科技與晶片股勁揚 1104"
                },
                {
                    "_id": "69086a4dd74b96117304fd03",
                    "title": "台股美股焦點1103｜川習會暫休兵暗潮湧動、AI散熱電網齊漲停"
                },
                {
                    "_id": "690866989696eb119d854995",
                    "title": "三大法人買賣超 – 外資買超(2330)台積電、(3037)欣興，投信買超(2368)金像電、(2383)台光電，法人合計賣超85.88億元 (1103)"
                },
                {
                    "_id": "69083aab39ec31116534b5fc",
                    "title": "聯發科(2454) 展望好壞均有，AI Asic仍值得期待【豐學PRIME盤後精選】"
                },
                {
                    "_id": "69085b9125428d11ab15a70a",
                    "title": "台股盤後｜記憶體點火再創高　指數突破28300點續寫新猷 1103"
                },
                {
                    "_id": "690852a259fccb1149bd9b4e",
                    "title": "台積電衝1510創收盤新高！勞動基金大賺5,588億，美關稅爭議與AI趨勢全面解析｜1103午後重點財經新聞摘要｜"
                },
                {
                    "_id": "69084ffae720d511f1063451",
                    "title": "今日漲停跌停股｜AI散熱、電網建設齊發力！建準、華城、穩懋領軍漲停潮 1103"
                },
                {
                    "_id": "6908240439ec31116534217e",
                    "title": "川習會落幕，美中談成什麼？一年休兵協議背後誰才是真贏家？具體協議內容一表整理！【川普政策整理】"
                },
                {
                    "_id": "6907f530c34df71157f8a244",
                    "title": "AI巨浪推升台股直奔29K！CoWoS雙雄目標價飆漲逾五成、金融業配息行情看俏｜1103晨間重點財經新聞摘要｜"
                },
                {
                    "_id": "6907ee08c34df71157f88036",
                    "title": "美股盤後｜科技巨頭助美股達成快樂萬聖節行情，S&P 500月線連6紅 1103"
                },
                {
                    "_id": "69045c0c3027fc1181df996b",
                    "title": "科技巨頭助美股達成快樂萬聖節行情，S&P 500月線連6紅；AI繼續升溫，多頭攀高"
                },
                {
                    "_id": "69047f00d74b961173f70d73",
                    "title": "本週台股法說會焦點：聯發科、光寶科、日月光及穩懋等AI浪潮引領電子股業績，惟股價反應兩極分化｜股市話題"
                },
                {
                    "_id": "6904733d9696eb119d77373b",
                    "title": "三大法人買賣超 – 外資買超(3711)日月光投控、(2327)國巨*，投信買超(2368)金像電、(3661)世芯-KY，法人合計賣超240.25億元 (1031)"
                },
                {
                    "_id": "69046f4f3027fc1181e00df2",
                    "title": "CSP是什麼？美國四大雲端龍頭掀起史上最大資本支出 - 掌握全球90%代工的鴻海、廣達策略與展望｜股市話題"
                },
                {
                    "_id": "6904642b25428d11ab078cb0",
                    "title": "台股盤後｜10月收月線尾盤爆量急殺，指數翻黑收跌54點 1031"
                },
                {
                    "_id": "69045cce2a074211d5ca264e",
                    "title": "今日漲停跌停股｜AI封測領軍！日月光、華城、穩懋領漲 台股重電與半導體族群全面爆發 1031"
                },
                {
                    "_id": "69042b8c3027fc1181de540f",
                    "title": "美股法說 LLY｜禮來 Eli Lilly 減重藥熱潮推升業績、攜手輝達布局AI藥物研發 (LLY US)"
                },
                {
                    "_id": "69042b3e3027fc1181de51e3",
                    "title": "美股法說 COIN｜Coinbase Q3財報超預期，營收年增55%！但股價為何逆勢下跌？Base鏈獲利、Deribit併購成焦點 (COIN US)"
                },
                {
                    "_id": "69042acee720d511f1f6e988",
                    "title": "美股法說 AMZN｜Amazon 亞馬遜 AWS 成長加速、AI 投資成效顯現 (AMZN US)"
                },
                {
                    "_id": "69042a2d25428d11ab060f58",
                    "title": "美股法說 AAPL｜Apple 蘋果 iPhone 17 熱銷帶動營收創新高，服務業務成長亮眼 (AAPL US)"
                },
                {
                    "_id": "69040db559fccb1149ad4d85",
                    "title": "美參院本週三度反川普關稅 最終51:47通過終止全球關稅政策｜股市話題"
                },
                {
                    "_id": "690402bb97789711e3c88045",
                    "title": "「濃霧說」撼動市場！川習會休兵也救不了美股AI支出崩跌，台股創高回檔，Fed降息腳步生變？｜1031晨間重點財經新聞摘要｜"
                },
                {
                    "_id": "690401317522c611c7246fe8",
                    "title": "睽違六年歷史性會晤：2025年韓國釜山川習會全紀錄，六大協議一次看｜股市話題"
                },
                {
                    "_id": "69031bc34aaef11136ba0ad7",
                    "title": "AI支出起疑慮，科技股下挫；利多實現，休息再戰"
                },
                {
                    "_id": "6903fad7c34df71157ea6f43",
                    "title": "美股盤後｜市場消化FOMC、企業財報，四大指數收黑 1031"
                },
                {
                    "_id": "690328a139ec311165214ec5",
                    "title": "Apple法說會前瞻：iPhone銷售創高、AI戰略加速，投資人必看三大重點！"
                },
                {
                    "_id": "69032183c34df71157e6eeba",
                    "title": "台股美股焦點1030｜Meta獲利暴跌83%堅定AI投資、Fed降息1碼結束縮表、輝達助攻愛得萬供應鏈"
                },
                {
                    "_id": "690321854aaef11136ba314a",
                    "title": "三大法人買賣超 – 外資買超(1519)華城、(3231)緯創，投信買超(3017)奇鋐、(3661)世芯-KY，法人合計賣超29.76億元 (1030)"
                },
                {
                    "_id": "6903181dc34df71157e6ae65",
                    "title": "輝達衝破 5 兆美元、習川會達成協議！台股創高後震盪，央行監管穩定幣、房市交易九年新低｜1030午後重點財經新聞摘要｜"
                },
                {
                    "_id": "690319293027fc1181d91be2",
                    "title": "今日漲停跌停股｜網通、航運領軍！建漢、萬海、晶豪科今日亮燈漲停 1030"
                },
                {
                    "_id": "690314ed032bb60116472c9c",
                    "title": "台股盤後｜指數盤中創高後震盪收斂 航運網通領漲28287點 1030"
                },
                {
                    "_id": "6902ccadda8bdd00ef1ff14b",
                    "title": "聯準會宣布降息1並結束縮表 12月政策前景充滿不確定性｜股市話題"
                },
                {
                    "_id": "6902c914e4167200d48d7959",
                    "title": "美股法說 META｜Meta 2025 Q3 營收創新高但稅務衝擊引發股價震盪 (META US)"
                }
            ]
        }
    }
}

# how to form the url:
The url would be `https://www.sinotrade.com.tw/richclub/MacroExpert/${title}--${_id}` for each entry in `filtered`
then we can send get request to the url to increase the view counts.

if title contains `,` or space etc, the should be replaced with `-`.
However at the end of the title it will always be `--`, for example:
{
    "_id": "68e4a15046b10f98ffe2f4bc",
    "title": "不畏政府關門，美股依舊續創新高，背後的底氣是什麼? 美股的狂歡還能持續多久？"
}
the url becomes: https://www.sinotrade.com.tw/richclub/MacroExpert/不畏政府關門-美股依舊續創新高-背後的底氣是什麼--美股的狂歡還能持續多久--68e4a15046b10f98ffe2f4bc

# about each tab
when on `深談總經` 訪問次數 should be defaulted to `200`
when on `股市熱話` 訪問次數 should be defaulted to `2000`

# for both tabs
訪問間隔 should be measured in milli seconds and be defaulted to and cannot be under `300` ms
eliminates ⚡ 並行處理 for simplicity.