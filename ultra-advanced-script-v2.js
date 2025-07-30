// データ管理
let wineRecords = JSON.parse(localStorage.getItem('ultraAdvancedWineRecords')) || [];
let currentWineId = null;
let currentRecordId = null;
let isUpdateMode = false;
let isEditingWine = false;
let aromaChart = null;
let currentPage = 1;
let itemsPerPage = 5;
let totalPages = 1;
let currentSort = 'name';
let paintCanvas = null;
let paintCtx = null;
let isDrawing = false;
let savedDrawings = [];

// 初期化時にテストデータを追加
function initializeTestData() {
    if (wineRecords.length === 0) {
        wineRecords = [
            {
                id: "1704456000000",
                wineName: "シャトー・マルゴー",
                producer: "シャトー・マルゴー",
                country: "フランス",
                region: "ボルドー メドック",
                vintage: "2015",
                price: "80000",
                wineType: "red",
                grapes: "カベルネ・ソーヴィニヨン 85%, メルロー 15%",
                alcohol: "13.5",
                soil: "砂利質土壌",
                climate: "海洋性気候",
                history: "1855年格付け第1級",
                winemaker: "ポール・ポンタリエ",
                
                colorTone: "deep_red",
                colorIntensity: "intense",
                clarity: "clear",
                viscosity: "medium",
                
                firstImpressionIntensity: "intense",
                firstImpressionNotes: "カシスとバニラの香り",
                swirlingIntensity: "very_intense",
                swirlingNotes: "複雑で層のある香り",
                
                aromaScores: {
                    fruit: 9,
                    floral: 3,
                    spice: 7,
                    herb: 2,
                    earth: 6,
                    wood: 8,
                    other: 1
                },
                
                detailedAromas: {
                    fruit: ["カシス", "ブラックベリー", "プラム"],
                    floral: ["バラ"],
                    spice: ["バニラ", "シナモン", "黒胡椒"],
                    herb: [],
                    earth: ["湿った土", "鉱物"],
                    wood: ["杉", "トースト"],
                    other: []
                },
                
                customOtherAromas: "タバコ、レザー、チョコレート",
                
                attackIntensity: "strong",
                attackNotes: "力強い第一印象",
                middleComplexity: "complex",
                middleNotes: "豊かなタンニンと果実味",
                finishLength: "very_long",
                finishSeconds: "45",
                finishNotes: "エレガントで長い余韻",
                
                acidityLevel: "medium_high",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "high",
                tanninTypes: ["ripe", "fine"],
                sweetnessLevel: "dry",
                bodyWeight: "full",
                
                recordTime: "after_opening",
                temperature: "18",
                decanted: "2時間",
                timeChangeNotes: "時間とともに複雑さが増す",
                
                ambientTemp: "20",
                humidity: "60",
                lighting: "キャンドルライト",
                mood: "特別な夜",
                companions: "パートナー",
                occasion: "記念日",
                location: "自宅",
                glassType: "ブルゴーニュグラス",
                
                saleUrl: "https://example.com/margaux",
                dlaboUrl: "https://example.com/margaux-dlabo",
                referenceUrl: "https://example.com/margaux-info",
                
                recordDate: "2024-01-05",
                daysFromOpening: 0,
                pairing: "牛フィレ肉のロースト",
                notes: "素晴らしいヴィンテージ。完璧なバランス。",
                wineRating: "5",
                pairingRating: "5",
                
                timestamp: "2024-01-05T19:00:00.000Z"
            },
            {
                id: "1704542400000",
                wineName: "シャトー・マルゴー",
                producer: "シャトー・マルゴー",
                country: "フランス",
                region: "ボルドー メドック",
                vintage: "2015",
                price: "80000",
                wineType: "red",
                grapes: "カベルネ・ソーヴィニヨン 85%, メルロー 15%",
                alcohol: "13.5",
                soil: "砂利質土壌",
                climate: "海洋性気候",
                history: "1855年格付け第1級",
                winemaker: "ポール・ポンタリエ",
                
                colorTone: "deep_red",
                colorIntensity: "intense",
                clarity: "clear",
                viscosity: "medium",
                
                firstImpressionIntensity: "very_intense",
                firstImpressionNotes: "開いた香り",
                swirlingIntensity: "very_intense",
                swirlingNotes: "さらに複雑に",
                
                aromaScores: {
                    fruit: 8,
                    floral: 4,
                    spice: 8,
                    herb: 3,
                    earth: 7,
                    wood: 7,
                    other: 2
                },
                
                detailedAromas: {
                    fruit: ["カシス", "ブラックベリー", "プラム"],
                    floral: ["バラ", "スミレ"],
                    spice: ["バニラ", "シナモン", "黒胡椒"],
                    herb: ["タイム"],
                    earth: ["湿った土", "鉱物"],
                    wood: ["杉", "トースト"],
                    other: ["レザー"]
                },
                
                customOtherAromas: "より開いた香り、タバコ、チョコレート",
                
                attackIntensity: "strong",
                attackNotes: "よりスムーズな第一印象",
                middleComplexity: "very_complex",
                middleNotes: "調和のとれた味わい",
                finishLength: "very_long",
                finishSeconds: "50",
                finishNotes: "さらに長い余韻",
                
                acidityLevel: "medium",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "medium_high",
                tanninTypes: ["ripe", "fine"],
                sweetnessLevel: "dry",
                bodyWeight: "full",
                
                recordTime: "after_opening",
                temperature: "18",
                decanted: "2時間",
                timeChangeNotes: "1日目よりも香りが開いている",
                
                ambientTemp: "20",
                humidity: "60",
                lighting: "自然光",
                mood: "リラックス",
                companions: "一人",
                occasion: "週末",
                location: "自宅",
                glassType: "ブルゴーニュグラス",
                
                saleUrl: "https://example.com/margaux",
                dlaboUrl: "https://example.com/margaux-dlabo",
                referenceUrl: "https://example.com/margaux-info",
                
                recordDate: "2024-01-06",
                daysFromOpening: 1,
                pairing: "チーズ",
                notes: "1日目よりもさらに良い。時間の経過で味わいが深まった。",
                wineRating: "5",
                pairingRating: "4",
                
                timestamp: "2024-01-06T15:30:00.000Z"
            },
            {
                id: "1704628800000",
                wineName: "ドン・ペリニヨン",
                producer: "モエ・エ・シャンドン",
                country: "フランス",
                region: "シャンパーニュ",
                vintage: "2012",
                price: "25000",
                wineType: "sparkling",
                grapes: "シャルドネ 60%, ピノ・ノワール 40%",
                alcohol: "12.5",
                soil: "白亜質土壌",
                climate: "大陸性気候",
                history: "1668年創設",
                winemaker: "リシャール・ジョフロワ",
                
                colorTone: "golden",
                colorIntensity: "medium",
                clarity: "brilliant",
                viscosity: "light",
                
                firstImpressionIntensity: "medium",
                firstImpressionNotes: "エレガントな泡立ち",
                swirlingIntensity: "intense",
                swirlingNotes: "フレッシュで複雑",
                
                aromaScores: {
                    fruit: 8,
                    floral: 7,
                    spice: 3,
                    herb: 1,
                    earth: 4,
                    wood: 2,
                    other: 5
                },
                
                detailedAromas: {
                    fruit: ["リンゴ", "洋梨", "柑橘"],
                    floral: ["白い花", "アカシア"],
                    spice: ["バニラ"],
                    herb: [],
                    earth: ["ミネラル"],
                    wood: [],
                    other: ["ブリオッシュ", "ナッツ"]
                },
                
                customOtherAromas: "ブリオッシュ、ナッツ、ハチミツ",
                
                attackIntensity: "elegant",
                attackNotes: "エレガントな第一印象",
                middleComplexity: "complex",
                middleNotes: "クリーミーで上品",
                finishLength: "long",
                finishSeconds: "30",
                finishNotes: "フレッシュで長い余韻",
                
                acidityLevel: "high",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "none",
                tanninTypes: [],
                sweetnessLevel: "dry",
                bodyWeight: "medium",
                
                recordTime: "right_after_opening",
                temperature: "8",
                decanted: "なし",
                timeChangeNotes: "泡の持続性が良い",
                
                ambientTemp: "18",
                humidity: "50",
                lighting: "間接照明",
                mood: "お祝い",
                companions: "友人",
                occasion: "新年会",
                location: "レストラン",
                glassType: "シャンパンフルート",
                
                saleUrl: "https://example.com/dom-perignon",
                dlaboUrl: "https://example.com/dom-perignon-dlabo",
                referenceUrl: "https://example.com/dom-perignon-info",
                
                recordDate: "2024-01-07",
                daysFromOpening: 0,
                pairing: "生牡蠣",
                notes: "完璧なシャンパーニュ。特別な日にふさわしい。",
                wineRating: "5",
                pairingRating: "5",
                
                timestamp: "2024-01-07T20:00:00.000Z"
            },
            {
                id: "1704715200000",
                wineName: "シャブリ グラン・クリュ レ・クロ",
                producer: "ドメーヌ・ルイ・ミシェル",
                country: "フランス",
                region: "ブルゴーニュ シャブリ",
                vintage: "2020",
                price: "8000",
                wineType: "white",
                grapes: "シャルドネ 100%",
                alcohol: "13.0",
                soil: "キンメリジャン土壌",
                climate: "半大陸性気候",
                history: "12世紀から続く歴史",
                winemaker: "ジャン・ルイ・ミシェル",
                
                colorTone: "pale_yellow",
                colorIntensity: "medium",
                clarity: "brilliant",
                viscosity: "light",
                
                firstImpressionIntensity: "elegant",
                firstImpressionNotes: "ミネラルとフレッシュさ",
                swirlingIntensity: "intense",
                swirlingNotes: "複雑なミネラル香",
                
                aromaScores: {
                    fruit: 6,
                    floral: 5,
                    spice: 2,
                    herb: 3,
                    earth: 8,
                    wood: 1,
                    other: 7
                },
                
                detailedAromas: {
                    fruit: ["青リンゴ", "レモン", "グレープフルーツ"],
                    floral: ["白い花", "アカシア"],
                    spice: [],
                    herb: ["ディル"],
                    earth: ["石灰", "ミネラル", "貝殻"],
                    wood: [],
                    other: ["塩", "海藻"]
                },
                
                customOtherAromas: "海のミネラル、塩、オイスター",
                
                attackIntensity: "sharp",
                attackNotes: "シャープで引き締まった第一印象",
                middleComplexity: "complex",
                middleNotes: "ミネラルと果実のバランス",
                finishLength: "long",
                finishSeconds: "25",
                finishNotes: "塩気を伴う長い余韻",
                
                acidityLevel: "high",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "none",
                tanninTypes: [],
                sweetnessLevel: "dry",
                bodyWeight: "medium",
                
                recordTime: "right_after_opening",
                temperature: "10",
                decanted: "なし",
                timeChangeNotes: "時間とともにミネラル感が増す",
                
                ambientTemp: "19",
                humidity: "55",
                lighting: "自然光",
                mood: "集中",
                companions: "一人",
                occasion: "ランチ",
                location: "自宅",
                glassType: "白ワイングラス",
                
                saleUrl: "https://example.com/chablis",
                dlaboUrl: "https://example.com/chablis-dlabo",
                referenceUrl: "https://example.com/chablis-info",
                
                recordDate: "2024-01-08",
                daysFromOpening: 0,
                pairing: "生牡蠣",
                notes: "典型的なシャブリ。ミネラル感が素晴らしい。",
                wineRating: "4",
                pairingRating: "5",
                
                timestamp: "2024-01-08T12:30:00.000Z"
            },
            {
                id: "1704801600000",
                wineName: "バローロ ブルナーテ",
                producer: "マリオ・マレンゴ",
                country: "イタリア",
                region: "ピエモンテ バローロ",
                vintage: "2018",
                price: "12000",
                wineType: "red",
                grapes: "ネッビオーロ 100%",
                alcohol: "14.5",
                soil: "石灰質土壌",
                climate: "大陸性気候",
                history: "1974年創設",
                winemaker: "マリオ・マレンゴ",
                
                colorTone: "ruby_red",
                colorIntensity: "medium",
                clarity: "clear",
                viscosity: "high",
                
                firstImpressionIntensity: "elegant",
                firstImpressionNotes: "エレガントで複雑",
                swirlingIntensity: "intense",
                swirlingNotes: "バラと土の香り",
                
                aromaScores: {
                    fruit: 7,
                    floral: 9,
                    spice: 5,
                    herb: 4,
                    earth: 8,
                    wood: 3,
                    other: 2
                },
                
                detailedAromas: {
                    fruit: ["チェリー", "ラズベリー", "プラム"],
                    floral: ["バラ", "スミレ"],
                    spice: ["アニス", "リコリス"],
                    herb: ["ローズマリー", "タイム"],
                    earth: ["トリュフ", "森の下草"],
                    wood: ["杉"],
                    other: ["レザー"]
                },
                
                customOtherAromas: "トリュフ、レザー、タール",
                
                attackIntensity: "elegant",
                attackNotes: "エレガントで上品",
                middleComplexity: "very_complex",
                middleNotes: "複雑で層のある味わい",
                finishLength: "very_long",
                finishSeconds: "40",
                finishNotes: "長く美しい余韻",
                
                acidityLevel: "high",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "high",
                tanninTypes: ["firm", "noble"],
                sweetnessLevel: "dry",
                bodyWeight: "full",
                
                recordTime: "2_hours_after",
                temperature: "18",
                decanted: "1時間",
                timeChangeNotes: "デカンタージュで香りが開く",
                
                ambientTemp: "20",
                humidity: "60",
                lighting: "温かい照明",
                mood: "瞑想的",
                companions: "一人",
                occasion: "静かな夜",
                location: "自宅",
                glassType: "ブルゴーニュグラス",
                
                saleUrl: "https://example.com/barolo",
                dlaboUrl: "https://example.com/barolo-dlabo",
                referenceUrl: "https://example.com/barolo-info",
                
                recordDate: "2024-01-09",
                daysFromOpening: 0,
                pairing: "牛肉のブラザート",
                notes: "美しいバローロ。ネッビオーロの典型的な特徴が良く表れている。",
                wineRating: "4",
                pairingRating: "5",
                
                timestamp: "2024-01-09T19:30:00.000Z"
            },
            {
                id: "1704888000000",
                wineName: "リースリング シュペトレーゼ",
                producer: "ドクター・ローゼン",
                country: "ドイツ",
                region: "モーゼル",
                vintage: "2019",
                price: "4500",
                wineType: "white",
                grapes: "リースリング 100%",
                alcohol: "8.5",
                soil: "スレート土壌",
                climate: "冷涼な大陸性気候",
                history: "1888年創設",
                winemaker: "エルンスト・ローゼン",
                
                colorTone: "pale_yellow",
                colorIntensity: "light",
                clarity: "brilliant",
                viscosity: "light",
                
                firstImpressionIntensity: "delicate",
                firstImpressionNotes: "繊細で上品",
                swirlingIntensity: "medium",
                swirlingNotes: "フローラルで果実的",
                
                aromaScores: {
                    fruit: 9,
                    floral: 8,
                    spice: 1,
                    herb: 2,
                    earth: 5,
                    wood: 0,
                    other: 3
                },
                
                detailedAromas: {
                    fruit: ["白桃", "アプリコット", "ライム"],
                    floral: ["白い花", "ジャスミン"],
                    spice: [],
                    herb: ["ミント"],
                    earth: ["スレート", "ミネラル"],
                    wood: [],
                    other: ["ハチミツ"]
                },
                
                customOtherAromas: "白桃、ハチミツ、ペトロール",
                
                attackIntensity: "delicate",
                attackNotes: "繊細で甘美",
                middleComplexity: "complex",
                middleNotes: "甘さと酸のバランス",
                finishLength: "medium",
                finishSeconds: "20",
                finishNotes: "フルーティーで上品な余韻",
                
                acidityLevel: "high",
                acidityTypes: ["citric", "malic"],
                tanninLevel: "none",
                tanninTypes: [],
                sweetnessLevel: "medium_sweet",
                bodyWeight: "light",
                
                recordTime: "right_after_opening",
                temperature: "8",
                decanted: "なし",
                timeChangeNotes: "冷たい状態が最適",
                
                ambientTemp: "18",
                humidity: "50",
                lighting: "午後の光",
                mood: "リラックス",
                companions: "パートナー",
                occasion: "午後のひととき",
                location: "テラス",
                glassType: "リースリンググラス",
                
                saleUrl: "https://example.com/riesling",
                dlaboUrl: "https://example.com/riesling-dlabo",
                referenceUrl: "https://example.com/riesling-info",
                
                recordDate: "2024-01-10",
                daysFromOpening: 0,
                pairing: "フルーツタルト",
                notes: "美しいリースリング。甘さと酸のバランスが完璧。",
                wineRating: "4",
                pairingRating: "4",
                
                timestamp: "2024-01-10T15:00:00.000Z"
            }
        ];
        
        // ローカルストレージに保存
        localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
        console.log('テストデータを初期化しました');
    }
}

// 選択肢の文字列マッピング
const optionMappings = {
    wineType: {
        "red": "赤ワイン",
        "white": "白ワイン", 
        "rose": "ロゼワイン",
        "sparkling": "スパークリングワイン",
        "dessert": "デザートワイン",
        "fortified": "酒精強化ワイン"
    },
    colorTone: {
        "purple": "紫がかった",
        "ruby": "ルビー色",
        "garnet": "ガーネット色",
        "brick": "レンガ色",
        "yellow": "黄色がかった",
        "golden": "金色"
    },
    colorIntensity: {
        "pale": "淡い",
        "medium": "中程度",
        "deep": "濃い",
        "opaque": "不透明"
    },
    clarity: {
        "brilliant": "澄み切った",
        "clear": "透明",
        "hazy": "やや濁った",
        "cloudy": "濁った"
    },
    viscosity: {
        "light": "軽い",
        "medium": "中程度",
        "heavy": "重い",
        "glyceric": "グリセリン様"
    },
    intensityLevels: {
        "1": "弱い",
        "2": "やや弱い",
        "3": "中程度",
        "4": "やや強い",
        "5": "強い"
    },
    complexityLevels: {
        "1": "シンプル",
        "2": "やや複雑",
        "3": "複雑",
        "4": "非常に複雑",
        "5": "極めて複雑"
    },
    lengthLevels: {
        "1": "短い",
        "2": "やや短い",
        "3": "中程度",
        "4": "やや長い",
        "5": "長い"
    },
    componentLevels: {
        "1": "低い",
        "2": "やや低い",
        "3": "中程度",
        "4": "やや高い",
        "5": "高い"
    },
    sweetnessLevel: {
        "1": "辛口",
        "2": "半辛口",
        "3": "半甘口",
        "4": "甘口",
        "5": "極甘口"
    },
    bodyWeight: {
        "1": "ライト",
        "2": "ライト+",
        "3": "ミディアム",
        "4": "ミディアム+",
        "5": "フル"
    },
    rating: {
        "1": "不満",
        "2": "普通",
        "3": "良い",
        "4": "非常に良い",
        "5": "最高"
    },
    recordTime: {
        "0": "開栓直後",
        "30": "30分後",
        "60": "1時間後",
        "120": "2時間後",
        "1440": "1日後",
        "2880": "2日後",
        "4320": "3日後"
    }
};

// 香りカテゴリ
const aromaCategories = {
    fruit: { name: '果実系', color: '#ff6b6b' },
    floral: { name: '花系', color: '#ff9ff3' },
    spice: { name: 'スパイス系', color: '#feca57' },
    herb: { name: 'ハーブ系', color: '#48ca47' },
    earth: { name: '土系', color: '#8b4513' },
    wood: { name: '木系', color: '#deb887' },
    other: { name: 'その他', color: '#9c88ff' }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 今日の日付を設定
    document.getElementById('recordDate').valueAsDate = new Date();
    
    // テーマ初期化
    initializeTheme();
    
    // テストデータ初期化
    initializeTestData();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // ペイントキャンバスの初期化
    initializePaintCanvas();
    
    // 初期データ読み込み
    loadRecentWines();
    loadWineRecords();
    initializeChart();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 基本的なイベントリスナー
    document.getElementById('newWineBtn').addEventListener('click', showNewWineForm);
    document.getElementById('cancelBtn').addEventListener('click', hideForm);
    document.getElementById('wineRecordForm').addEventListener('submit', handleFormSubmit);
    
    // 複数画像アップロード
    const multipleImageInputs = ['wineImages', 'pairingImages', 'friendImages', 'otherImages'];
    multipleImageInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', function() {
            showMultipleImagePreview(this, inputId + 'Preview');
        });
    });
    
    // 香りスコアスライダー
    const scoreSliders = document.querySelectorAll('input[type="range"]');
    scoreSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            updateScoreDisplay(this);
        });
    });
    
    // カスタム時間入力
    document.getElementById('recordTime').addEventListener('change', function() {
        const customTimeInput = document.getElementById('customTime');
        if (this.value === 'custom') {
            customTimeInput.disabled = false;
            customTimeInput.required = true;
        } else {
            customTimeInput.disabled = true;
            customTimeInput.required = false;
            customTimeInput.value = '';
        }
    });
    
    // ペイントコントロール
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    document.getElementById('saveDrawing').addEventListener('click', saveDrawing);
    document.getElementById('brushSize').addEventListener('input', updateBrushSize);
    document.getElementById('brushColor').addEventListener('input', updateBrushColor);
    
    // 検索・フィルタ・ページネーション
    document.getElementById('searchInput').addEventListener('input', filterRecords);
    document.getElementById('sortSelect').addEventListener('change', sortRecords);
    document.getElementById('itemsPerPage').addEventListener('change', changeItemsPerPage);
    document.getElementById('prevPage').addEventListener('click', prevPage);
    document.getElementById('nextPage').addEventListener('click', nextPage);
    
    // エクスポートボタン
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // テーマ切り替えボタン
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// ペイントキャンバスの初期化
function initializePaintCanvas() {
    paintCanvas = document.getElementById('paintCanvas');
    paintCtx = paintCanvas.getContext('2d');
    
    // レスポンシブ対応
    resizeCanvas();
    
    // 描画イベント
    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseout', stopDrawing);
    
    // タッチイベント（スマホ対応）
    paintCanvas.addEventListener('touchstart', handleTouch);
    paintCanvas.addEventListener('touchmove', handleTouch);
    paintCanvas.addEventListener('touchend', stopDrawing);
    
    // 初期設定
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = '#667eea';
    paintCtx.lineWidth = 3;
}

// キャンバスサイズ調整
function resizeCanvas() {
    const container = paintCanvas.parentElement;
    const containerWidth = container.offsetWidth - 40;
    const maxWidth = 800;
    const width = Math.min(containerWidth, maxWidth);
    const height = width * 0.5; // 2:1の比率
    
    paintCanvas.width = width;
    paintCanvas.height = height;
    paintCanvas.style.width = width + 'px';
    paintCanvas.style.height = height + 'px';
}

// 描画開始
function startDrawing(e) {
    isDrawing = true;
    const rect = paintCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
}

// 描画
function draw(e) {
    if (!isDrawing) return;
    
    const rect = paintCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
}

// 描画終了
function stopDrawing() {
    isDrawing = false;
}

// タッチイベント処理
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                      e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    paintCanvas.dispatchEvent(mouseEvent);
}

// キャンバスクリア
function clearCanvas() {
    paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
}

// 絵を保存
function saveDrawing() {
    const dataURL = paintCanvas.toDataURL();
    savedDrawings.push({
        id: Date.now(),
        dataURL: dataURL,
        timestamp: new Date().toISOString()
    });
    
    displaySavedDrawings();
    clearCanvas();
}

// 保存された絵を表示
function displaySavedDrawings() {
    const container = document.getElementById('savedDrawings');
    if (savedDrawings.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h5>保存された絵 (${savedDrawings.length}件)</h5>
        ${savedDrawings.map(drawing => `
            <div class="drawing-item">
                <img src="${drawing.dataURL}" alt="保存された絵">
                <button class="delete-drawing" onclick="deleteDrawing('${drawing.id}')">×</button>
            </div>
        `).join('')}
    `;
}

// 絵を削除
function deleteDrawing(id) {
    savedDrawings = savedDrawings.filter(drawing => drawing.id !== id);
    displaySavedDrawings();
}

// ブラシサイズ更新
function updateBrushSize() {
    const size = document.getElementById('brushSize').value;
    document.getElementById('brushSizeValue').textContent = size;
    paintCtx.lineWidth = size;
}

// ブラシカラー更新
function updateBrushColor() {
    const color = document.getElementById('brushColor').value;
    paintCtx.strokeStyle = color;
}

// 複数画像プレビュー
function showMultipleImagePreview(input, previewId) {
    const files = Array.from(input.files);
    const previewDiv = document.getElementById(previewId);
    
    if (files.length === 0) {
        previewDiv.innerHTML = '';
        previewDiv.classList.add('empty');
        return;
    }
    
    previewDiv.classList.remove('empty');
    previewDiv.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.innerHTML = `
                <img src="${e.target.result}" alt="プレビュー ${index + 1}">
                <button class="remove-image" onclick="removeImagePreview('${previewId}', ${index})">×</button>
            `;
            previewDiv.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    });
}

// 画像プレビュー削除
function removeImagePreview(previewId, index) {
    const input = document.getElementById(previewId.replace('Preview', ''));
    const files = Array.from(input.files);
    
    // ファイルリストから削除（直接的な削除は不可能なので再構築）
    const newFiles = files.filter((_, i) => i !== index);
    
    // 新しいFileListを作成
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    input.files = dt.files;
    
    // プレビュー再表示
    showMultipleImagePreview(input, previewId);
}

// 星評価の表示
function getRatingStars(rating) {
    if (!rating) return '未評価';
    const stars = '★'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));
    return `<span class="rating-stars">${stars}</span>`;
}

// 香りタグの生成
function createAromaTags(detailedAromas, customOtherAromas) {
    const tags = [];
    if (detailedAromas) {
        Object.entries(detailedAromas).forEach(([_, aromas]) => {
            if (aromas && aromas.length > 0) {
                aromas.forEach(aroma => {
                    tags.push(`<span class="aroma-tag">${aroma}</span>`);
                });
            }
        });
    }
    
    // カスタム香りの追加
    if (customOtherAromas && customOtherAromas.trim()) {
        const customAromas = customOtherAromas.split(',').map(aroma => aroma.trim()).filter(aroma => aroma);
        customAromas.forEach(aroma => {
            tags.push(`<span class="aroma-tag custom-aroma">${aroma}</span>`);
        });
    }
    
    return tags.join('');
}

// ワインをグループ化
function groupWinesByName() {
    const groups = {};
    
    wineRecords.forEach(record => {
        const key = `${record.wineName}-${record.producer}`;
        if (!groups[key]) {
            groups[key] = {
                wineName: record.wineName,
                producer: record.producer,
                country: record.country,
                region: record.region,
                wineType: record.wineType,
                vintage: record.vintage,
                records: []
            };
        }
        groups[key].records.push(record);
    });
    
    // 各グループの記録を日付順にソート
    Object.values(groups).forEach(group => {
        group.records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
        
        // 平均評価を計算
        const wineRatings = group.records.filter(r => r.wineRating).map(r => parseInt(r.wineRating));
        const pairingRatings = group.records.filter(r => r.pairingRating).map(r => parseInt(r.pairingRating));
        
        group.avgWineRating = wineRatings.length > 0 ? 
            (wineRatings.reduce((sum, rating) => sum + rating, 0) / wineRatings.length).toFixed(1) : null;
        group.avgPairingRating = pairingRatings.length > 0 ? 
            (pairingRatings.reduce((sum, rating) => sum + rating, 0) / pairingRatings.length).toFixed(1) : null;
    });
    
    return Object.values(groups);
}

// ワイン記録の表示
function loadWineRecords() {
    const recordsDiv = document.getElementById('wineRecords');
    
    if (wineRecords.length === 0) {
        recordsDiv.innerHTML = '<div class="no-records">まだワインの記録がありません</div>';
        return;
    }
    
    const wineGroups = groupWinesByName();
    const sortedGroups = sortWineGroups(wineGroups);
    
    // ページネーション計算
    totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(sortedGroups.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    
    const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === 'all' ? sortedGroups.length : startIndex + itemsPerPage;
    const currentGroups = sortedGroups.slice(startIndex, endIndex);
    
    recordsDiv.innerHTML = currentGroups.map(group => createWineGroupHTML(group)).join('');
    
    updatePaginationControls();
}

// ワイングループのソート
function sortWineGroups(groups) {
    let sortedGroups = [...groups];
    
    switch (currentSort) {
        case 'name':
            sortedGroups.sort((a, b) => a.wineName.localeCompare(b.wineName));
            break;
        case 'region':
            sortedGroups.sort((a, b) => (a.region || '').localeCompare(b.region || ''));
            break;
        case 'producer':
            sortedGroups.sort((a, b) => a.producer.localeCompare(b.producer));
            break;
        case 'random':
            sortedGroups.sort(() => Math.random() - 0.5);
            break;
        case 'wineRating':
            sortedGroups.sort((a, b) => (b.avgWineRating || 0) - (a.avgWineRating || 0));
            break;
        case 'pairingRating':
            sortedGroups.sort((a, b) => (b.avgPairingRating || 0) - (a.avgPairingRating || 0));
            break;
        case 'date':
            sortedGroups.sort((a, b) => new Date(b.records[0].recordDate) - new Date(a.records[0].recordDate));
            break;
    }
    
    return sortedGroups;
}

// ワイングループのHTML生成
function createWineGroupHTML(group) {
    const firstRecord = group.records[0];
    const wineImage = firstRecord.wineImages?.[0] || firstRecord.wineImageUrl || '';
    
    return `
        <div class="wine-group">
            <div class="wine-group-header" onclick="toggleWineGroup('${group.wineName}-${group.producer}')">
                <div class="wine-group-info">
                    ${wineImage ? `<img src="${wineImage}" alt="${group.wineName}" class="wine-group-image">` : ''}
                    <div class="wine-group-details">
                        <h3>${group.wineName}</h3>
                        <p><strong>生産者:</strong> ${group.producer}</p>
                        <p><strong>地域:</strong> ${group.region || 'N/A'}</p>
                        <p><strong>記録数:</strong> ${group.records.length}件</p>
                    </div>
                </div>
                <div class="wine-group-ratings">
                    <div class="rating-item">
                        <span>ワイン:</span>
                        ${getRatingStars(group.avgWineRating)}
                    </div>
                    <div class="rating-item">
                        <span>ペアリング:</span>
                        ${getRatingStars(group.avgPairingRating)}
                    </div>
                </div>
                <div class="wine-group-actions">
                    <button class="chart-btn" onclick="showComparisonChart(['${group.records.map(r => r.id).join("','")}']); event.stopPropagation();" title="香りプロファイル比較">
                        📊 比較
                    </button>
                    <button class="edit-wine-btn" onclick="editWineInfo('${group.wineName}-${group.producer}'); event.stopPropagation();">
                        ワイン編集
                    </button>
                    <button class="expand-toggle" id="toggle-${group.wineName}-${group.producer}">
                        ▼
                    </button>
                </div>
            </div>
            <div class="wine-group-content" id="content-${group.wineName}-${group.producer}">
                <div class="wine-records-timeline">
                    <div class="timeline-header">
                        <h4>記録履歴</h4>
                        <div class="timeline-sort">
                            <select onchange="sortTimelineRecords('${group.wineName}-${group.producer}', this.value)">
                                <option value="date-desc">新しい順</option>
                                <option value="date-asc">古い順</option>
                                <option value="rating-desc">評価高い順</option>
                                <option value="rating-asc">評価低い順</option>
                            </select>
                        </div>
                    </div>
                    <div id="timeline-${group.wineName}-${group.producer}">
                        ${group.records.map(record => createTimelineRecordHTML(record)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// タイムライン記録のHTML生成
function createTimelineRecordHTML(record) {
    const allImages = [];
    if (record.wineImages) allImages.push(...record.wineImages);
    if (record.pairingImages) allImages.push(...record.pairingImages);
    if (record.friendImages) allImages.push(...record.friendImages);
    if (record.otherImages) allImages.push(...record.otherImages);
    if (savedDrawings.length > 0) allImages.push(...savedDrawings.map(d => d.dataURL));
    
    return `
        <div class="timeline-record">
            <div class="timeline-record-header">
                <div class="timeline-record-date">
                    ${record.recordDate} (${record.daysFromOpening}日目)
                    ${record.recordTime ? ` - ${optionMappings.recordTime[record.recordTime] || record.recordTime + '分後'}` : ''}
                </div>
                <div class="timeline-record-actions">
                    <button class="chart-btn" onclick="showAromaChart('${record.id}')" title="香りチャートを表示">📊</button>
                    <button class="edit-record-btn" onclick="editRecord('${record.id}')">編集</button>
                    <button class="delete-record-btn" onclick="deleteRecord('${record.id}')">削除</button>
                </div>
            </div>
            <div class="timeline-record-content">
                <div class="timeline-record-item">
                    <strong>ワイン評価:</strong> ${getRatingStars(record.wineRating)}
                </div>
                <div class="timeline-record-item">
                    <strong>ペアリング評価:</strong> ${getRatingStars(record.pairingRating)}
                </div>
                ${record.colorTone ? `<div class="timeline-record-item"><strong>色調:</strong> ${optionMappings.colorTone[record.colorTone]}</div>` : ''}
                ${record.attackNotes ? `<div class="timeline-record-item"><strong>アタック:</strong> ${record.attackNotes}</div>` : ''}
                ${record.finishNotes ? `<div class="timeline-record-item"><strong>フィニッシュ:</strong> ${record.finishNotes}</div>` : ''}
                ${record.pairing ? `<div class="timeline-record-item"><strong>ペアリング:</strong> ${record.pairing}</div>` : ''}
                ${record.notes ? `<div class="timeline-record-item"><strong>メモ:</strong> ${record.notes}</div>` : ''}
                ${allImages.length > 0 ? `
                    <div class="timeline-record-images">
                        ${allImages.map(img => `<img src="${img}" alt="記録画像">`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ワイングループの展開/折りたたみ
function toggleWineGroup(groupId) {
    const content = document.getElementById(`content-${groupId}`);
    const toggle = document.getElementById(`toggle-${groupId}`);
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.classList.remove('expanded');
        toggle.textContent = '▼';
    } else {
        content.classList.add('expanded');
        toggle.classList.add('expanded');
        toggle.textContent = '▲';
    }
}

// ワイン基本情報の編集
function editWineInfo(groupId) {
    const wineGroups = groupWinesByName();
    const group = wineGroups.find(g => `${g.wineName}-${g.producer}` === groupId);
    
    if (!group) {
        alert('ワイン情報が見つかりません');
        return;
    }
    
    // 代表的な記録を使用して基本情報を取得
    const baseRecord = group.records[0];
    
    // フォームに基本情報を設定
    populateFormWithWine(baseRecord);
    
    // 編集モードを設定
    isEditingWine = true;
    currentWineId = groupId;
    
    // ワイン基本情報編集用にフォームを制限
    restrictFormToWineInfo();
    
    // フォームを表示
    showForm('ワイン基本情報を編集');
}

// 記録の編集
function editRecord(recordId) {
    const record = wineRecords.find(r => r.id === recordId);
    
    if (!record) {
        alert('記録が見つかりません');
        return;
    }
    
    // フォームに記録データを設定
    populateFormWithRecord(record);
    
    // 編集モードを設定
    isUpdateMode = true;
    currentRecordId = recordId;
    
    // 記録編集用にフォームを通常状態にする
    enableAllFormSections();
    
    // フォームを表示
    showForm('記録を編集');
}

// 記録の削除
function deleteRecord(recordId) {
    if (confirm('この記録を削除しますか？')) {
        wineRecords = wineRecords.filter(record => record.id !== recordId);
        localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
        loadWineRecords();
    }
}

// タイムライン記録のソート
function sortTimelineRecords(groupId, sortType) {
    // 実装予定
    console.log('Timeline sort:', groupId, sortType);
}

// ページネーション更新
function updatePaginationControls() {
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
}

// ページ変更
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadWineRecords();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadWineRecords();
    }
}

// 表示件数変更
function changeItemsPerPage() {
    const newItemsPerPage = document.getElementById('itemsPerPage').value;
    itemsPerPage = newItemsPerPage === 'all' ? 'all' : parseInt(newItemsPerPage);
    currentPage = 1;
    loadWineRecords();
}

// ソート変更
function sortRecords() {
    currentSort = document.getElementById('sortSelect').value;
    currentPage = 1;
    loadWineRecords();
}

// 検索・フィルタリング
function filterRecords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const groups = document.querySelectorAll('.wine-group');
    
    groups.forEach(group => {
        const text = group.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 編集モードの場合の処理
    if (isUpdateMode && currentRecordId) {
        // 既存記録の更新
        const recordIndex = wineRecords.findIndex(r => r.id === currentRecordId);
        if (recordIndex !== -1) {
            const updatedRecord = await buildRecordData(formData);
            updatedRecord.id = currentRecordId;
            wineRecords[recordIndex] = updatedRecord;
            
            localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
            loadRecentWines();
            loadWineRecords();
            hideForm();
            alert('記録が更新されました！');
            return;
        }
    }
    
    if (isEditingWine && currentWineId) {
        // ワイン基本情報の更新
        const groupId = currentWineId;
        const wineRecordsToUpdate = wineRecords.filter(r => `${r.wineName}-${r.producer}` === groupId);
        
        if (wineRecordsToUpdate.length > 0) {
            const updatedData = await buildRecordData(formData);
            
            // 基本情報のみを更新
            const basicFields = [
                'wineName', 'producer', 'country', 'region', 'vintage', 'price',
                'wineType', 'grapes', 'alcohol', 'soil', 'climate', 'history',
                'winemaker', 'saleUrl', 'dlaboUrl', 'referenceUrl'
            ];
            
            wineRecordsToUpdate.forEach(record => {
                basicFields.forEach(field => {
                    if (updatedData[field]) {
                        record[field] = updatedData[field];
                    }
                });
            });
            
            localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
            loadRecentWines();
            loadWineRecords();
            hideForm();
            alert('ワイン基本情報が更新されました！');
            return;
        }
    }
    
    // 新規記録の追加
    const newRecord = await buildRecordData(formData);
    wineRecords.push(newRecord);
    
    localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
    loadRecentWines();
    loadWineRecords();
    hideForm();
    alert('ワインの記録が追加されました！');
}

// 記録データの構築
async function buildRecordData(formData) {
    // 時間の処理
    let recordTime = formData.get('recordTime');
    if (recordTime === 'custom') {
        recordTime = formData.get('customTime');
    }
    
    // 基本情報
    const wineData = {
        id: currentRecordId || Date.now().toString(),
        wineName: formData.get('wineName') || '',
        producer: formData.get('producer') || '',
        country: formData.get('country') || '',
        region: formData.get('region') || '',
        vintage: formData.get('vintage') || '',
        price: formData.get('price') || '',
        wineType: formData.get('wineType') || '',
        grapes: formData.get('grapes') || '',
        alcohol: formData.get('alcohol') || '',
        soil: formData.get('soil') || '',
        climate: formData.get('climate') || '',
        history: formData.get('history') || '',
        winemaker: formData.get('winemaker') || '',
        
        // 外観分析
        colorTone: formData.get('colorTone') || '',
        colorIntensity: formData.get('colorIntensity') || '',
        clarity: formData.get('clarity') || '',
        viscosity: formData.get('viscosity') || '',
        
        // 香り分析
        firstImpressionIntensity: formData.get('firstImpressionIntensity') || '',
        firstImpressionNotes: formData.get('firstImpressionNotes') || '',
        swirlingIntensity: formData.get('swirlingIntensity') || '',
        swirlingNotes: formData.get('swirlingNotes') || '',
        
        // 香りスコア
        aromaScores: {
            fruit: parseInt(formData.get('fruitScore') || '0'),
            floral: parseInt(formData.get('floralScore') || '0'),
            spice: parseInt(formData.get('spiceScore') || '0'),
            herb: parseInt(formData.get('herbScore') || '0'),
            earth: parseInt(formData.get('earthScore') || '0'),
            wood: parseInt(formData.get('woodScore') || '0'),
            other: parseInt(formData.get('otherScore') || '0')
        },
        
        // 詳細香り
        detailedAromas: {
            fruit: Array.from(formData.getAll('fruitAromas')),
            floral: Array.from(formData.getAll('floralAromas')),
            spice: Array.from(formData.getAll('spiceAromas')),
            herb: Array.from(formData.getAll('herbAromas')),
            earth: Array.from(formData.getAll('earthAromas')),
            wood: Array.from(formData.getAll('woodAromas')),
            other: Array.from(formData.getAll('otherAromas'))
        },
        
        // カスタム香り
        customOtherAromas: formData.get('customOtherAromas') || '',
        
        // 味わい分析
        attackIntensity: formData.get('attackIntensity') || '',
        attackNotes: formData.get('attackNotes') || '',
        middleComplexity: formData.get('middleComplexity') || '',
        middleNotes: formData.get('middleNotes') || '',
        finishLength: formData.get('finishLength') || '',
        finishSeconds: formData.get('finishSeconds') || '',
        finishNotes: formData.get('finishNotes') || '',
        
        // 構成要素
        acidityLevel: formData.get('acidityLevel') || '',
        acidityTypes: Array.from(formData.getAll('acidityTypes')),
        tanninLevel: formData.get('tanninLevel') || '',
        tanninTypes: Array.from(formData.getAll('tanninTypes')),
        sweetnessLevel: formData.get('sweetnessLevel') || '',
        bodyWeight: formData.get('bodyWeight') || '',
        
        // 時間経過と環境
        recordTime: recordTime || '',
        temperature: formData.get('temperature') || '',
        decanted: formData.get('decanted') || '',
        timeChangeNotes: formData.get('timeChangeNotes') || '',
        
        // 環境情報
        ambientTemp: formData.get('ambientTemp') || '',
        humidity: formData.get('humidity') || '',
        lighting: formData.get('lighting') || '',
        mood: formData.get('mood') || '',
        companions: formData.get('companions') || '',
        occasion: formData.get('occasion') || '',
        location: formData.get('location') || '',
        glassType: formData.get('glassType') || '',
        
        // 参考情報
        saleUrl: formData.get('saleUrl') || '',
        dlaboUrl: formData.get('dlaboUrl') || '',
        referenceUrl: formData.get('referenceUrl') || '',
        
        // 記録情報
        recordDate: formData.get('recordDate') || new Date().toISOString().split('T')[0],
        daysFromOpening: parseInt(formData.get('daysFromOpening') || '0'),
        pairing: formData.get('pairing') || '',
        notes: formData.get('notes') || '',
        wineRating: formData.get('wineRating') || '',
        pairingRating: formData.get('pairingRating') || '',
        
        timestamp: new Date().toISOString()
    };
    
    try {
        // 複数画像処理
        const multipleImageTypes = ['wineImages', 'pairingImages', 'friendImages', 'otherImages'];
        
        for (const imageType of multipleImageTypes) {
            const fileInput = document.getElementById(imageType);
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const imageUrls = [];
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    const base64 = await fileToBase64(file);
                    imageUrls.push(base64);
                }
                wineData[imageType] = imageUrls;
            }
        }
        
        // 保存された絵を追加
        if (savedDrawings.length > 0) {
            wineData.drawings = savedDrawings.map(d => d.dataURL);
        }
        
    } catch (error) {
        console.error('画像処理エラー:', error);
    }
    
    return wineData;
}

// 画像をBase64に変換
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// スコア表示更新
function updateScoreDisplay(slider) {
    const scoreValue = slider.parentElement.querySelector('.score-value');
    if (scoreValue) {
        scoreValue.textContent = slider.value;
    }
}

// データエクスポート
function exportData() {
    const dataStr = JSON.stringify(wineRecords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wine_records_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 他の既存機能は元のファイルから継承
// 初期化時に既存の機能も読み込む
// フォームに記録データを設定
function populateFormWithRecord(record) {
    // 基本情報を設定
    populateFormWithWine(record);
    
    // 記録固有の情報を設定
    if (record.recordDate) {
        document.getElementById('recordDate').value = record.recordDate;
    }
    if (record.daysFromOpening) {
        document.getElementById('daysFromOpening').value = record.daysFromOpening;
    }
    if (record.pairing) {
        document.getElementById('pairing').value = record.pairing;
    }
    if (record.notes) {
        document.getElementById('notes').value = record.notes;
    }
    
    // 外観分析の設定
    if (record.colorTone) {
        const colorToneRadio = document.querySelector(`input[name="colorTone"][value="${record.colorTone}"]`);
        if (colorToneRadio) colorToneRadio.checked = true;
    }
    if (record.colorIntensity) {
        const colorIntensityRadio = document.querySelector(`input[name="colorIntensity"][value="${record.colorIntensity}"]`);
        if (colorIntensityRadio) colorIntensityRadio.checked = true;
    }
    if (record.clarity) {
        const clarityRadio = document.querySelector(`input[name="clarity"][value="${record.clarity}"]`);
        if (clarityRadio) clarityRadio.checked = true;
    }
    if (record.viscosity) {
        const viscosityRadio = document.querySelector(`input[name="viscosity"][value="${record.viscosity}"]`);
        if (viscosityRadio) viscosityRadio.checked = true;
    }
    
    // 香り分析の設定
    if (record.firstImpressionIntensity) {
        const firstImpressionRadio = document.querySelector(`input[name="firstImpressionIntensity"][value="${record.firstImpressionIntensity}"]`);
        if (firstImpressionRadio) firstImpressionRadio.checked = true;
    }
    if (record.swirlingIntensity) {
        const swirlingRadio = document.querySelector(`input[name="swirlingIntensity"][value="${record.swirlingIntensity}"]`);
        if (swirlingRadio) swirlingRadio.checked = true;
    }
    if (record.firstImpressionNotes) {
        document.getElementById('firstImpressionNotes').value = record.firstImpressionNotes;
    }
    if (record.swirlingNotes) {
        document.getElementById('swirlingNotes').value = record.swirlingNotes;
    }
    
    // 味わい分析の設定
    if (record.attackIntensity) {
        const attackRadio = document.querySelector(`input[name="attackIntensity"][value="${record.attackIntensity}"]`);
        if (attackRadio) attackRadio.checked = true;
    }
    if (record.middleComplexity) {
        const middleRadio = document.querySelector(`input[name="middleComplexity"][value="${record.middleComplexity}"]`);
        if (middleRadio) middleRadio.checked = true;
    }
    if (record.finishLength) {
        const finishRadio = document.querySelector(`input[name="finishLength"][value="${record.finishLength}"]`);
        if (finishRadio) finishRadio.checked = true;
    }
    if (record.attackNotes) {
        document.getElementById('attackNotes').value = record.attackNotes;
    }
    if (record.middleNotes) {
        document.getElementById('middleNotes').value = record.middleNotes;
    }
    if (record.finishNotes) {
        document.getElementById('finishNotes').value = record.finishNotes;
    }
    if (record.finishSeconds) {
        document.getElementById('finishSeconds').value = record.finishSeconds;
    }
    
    // 構成要素の設定
    if (record.acidityLevel) {
        const acidityRadio = document.querySelector(`input[name="acidityLevel"][value="${record.acidityLevel}"]`);
        if (acidityRadio) acidityRadio.checked = true;
    }
    if (record.tanninLevel) {
        const tanninRadio = document.querySelector(`input[name="tanninLevel"][value="${record.tanninLevel}"]`);
        if (tanninRadio) tanninRadio.checked = true;
    }
    if (record.sweetnessLevel) {
        const sweetnessRadio = document.querySelector(`input[name="sweetnessLevel"][value="${record.sweetnessLevel}"]`);
        if (sweetnessRadio) sweetnessRadio.checked = true;
    }
    if (record.bodyWeight) {
        const bodyRadio = document.querySelector(`input[name="bodyWeight"][value="${record.bodyWeight}"]`);
        if (bodyRadio) bodyRadio.checked = true;
    }
    
    // 香りスコアの設定
    if (record.aromaScores) {
        Object.entries(record.aromaScores).forEach(([category, score]) => {
            const slider = document.getElementById(`${category}Score`);
            if (slider) {
                slider.value = score;
                updateScoreDisplay(slider);
            }
        });
    }
    
    // 詳細香りの設定
    if (record.detailedAromas) {
        Object.entries(record.detailedAromas).forEach(([category, aromas]) => {
            if (aromas && aromas.length > 0) {
                aromas.forEach(aroma => {
                    const checkbox = document.querySelector(`input[name="${category}Aromas"][value="${aroma}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        });
    }
    
    // カスタム香りの設定
    if (record.customOtherAromas) {
        document.getElementById('customOtherAromas').value = record.customOtherAromas;
    }
    
    // 評価の設定
    if (record.wineRating) {
        const wineRatingRadio = document.querySelector(`input[name="wineRating"][value="${record.wineRating}"]`);
        if (wineRatingRadio) wineRatingRadio.checked = true;
    }
    if (record.pairingRating) {
        const pairingRatingRadio = document.querySelector(`input[name="pairingRating"][value="${record.pairingRating}"]`);
        if (pairingRatingRadio) pairingRatingRadio.checked = true;
    }
    
    // 時間・環境設定
    if (record.recordTime) {
        document.getElementById('recordTime').value = record.recordTime;
    }
    if (record.temperature) {
        document.getElementById('temperature').value = record.temperature;
    }
    if (record.ambientTemp) {
        document.getElementById('ambientTemp').value = record.ambientTemp;
    }
    if (record.humidity) {
        document.getElementById('humidity').value = record.humidity;
    }
    if (record.lighting) {
        document.getElementById('lighting').value = record.lighting;
    }
    if (record.mood) {
        document.getElementById('mood').value = record.mood;
    }
    if (record.companions) {
        document.getElementById('companions').value = record.companions;
    }
    if (record.occasion) {
        document.getElementById('occasion').value = record.occasion;
    }
    if (record.location) {
        document.getElementById('location').value = record.location;
    }
    if (record.glassType) {
        document.getElementById('glassType').value = record.glassType;
    }
}

// フォームリセット（編集モードを考慮）
function resetForm() {
    document.getElementById('wineRecordForm').reset();
    document.getElementById('recordDate').valueAsDate = new Date();
    
    // 画像プレビューをクリア
    ['wineImagesPreview', 'pairingImagesPreview', 'friendImagesPreview', 'otherImagesPreview'].forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.innerHTML = '';
            preview.classList.add('empty');
        }
    });
    
    // 香りスコアをリセット
    const scoreSliders = document.querySelectorAll('input[type="range"]');
    scoreSliders.forEach(slider => {
        slider.value = 0;
        updateScoreDisplay(slider);
    });
    
    // 詳細フィールドをリセット
    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    
    // カスタム時間入力を無効化
    const customTimeInput = document.getElementById('customTime');
    if (customTimeInput) {
        customTimeInput.disabled = true;
        customTimeInput.required = false;
    }
    
    // フォームの制限を解除
    enableAllFormSections();
    
    // 編集モードをリセット
    currentWineId = null;
    currentRecordId = null;
    isUpdateMode = false;
    isEditingWine = false;
}

// 新規ワインフォーム表示
function showNewWineForm() {
    resetForm();
    enableAllFormSections();
    showForm('新しいワインを記録');
}

// フォーム表示
function showForm(title) {
    document.getElementById('formTitle').textContent = title;
    document.getElementById('wineForm').classList.add('active');
    document.getElementById('wineForm').scrollIntoView({ behavior: 'smooth' });
}

// フォーム非表示
function hideForm() {
    document.getElementById('wineForm').classList.remove('active');
    resetForm();
}

// 直近ワインの読み込み
function loadRecentWines() {
    const recentWinesGrid = document.getElementById('recentWinesGrid');
    if (!recentWinesGrid) return;
    
    const wineGroups = {};
    wineRecords.forEach(record => {
        const key = `${record.wineName}-${record.producer}`;
        if (!wineGroups[key] || new Date(record.timestamp) > new Date(wineGroups[key].timestamp)) {
            wineGroups[key] = record;
        }
    });
    
    const recentWines = Object.values(wineGroups)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 4);
    
    if (recentWines.length === 0) {
        recentWinesGrid.innerHTML = '<p class="no-records">まだ記録がありません</p>';
        return;
    }
    
    recentWinesGrid.innerHTML = recentWines.map(wine => `
        <div class="recent-wine-card" data-wine-id="${wine.id}" onclick="selectRecentWine('${wine.id}')">
            <h4>${wine.wineName}</h4>
            <p>生産者: ${wine.producer}</p>
            <p>種類: ${optionMappings.wineType[wine.wineType] || wine.wineType}</p>
            <p>評価: ${getRatingStars(wine.wineRating)}</p>
            <p>最終記録: ${wine.recordDate}</p>
        </div>
    `).join('');
}

// 直近ワインの選択
function selectRecentWine(wineId) {
    const wine = wineRecords.find(r => r.id === wineId);
    if (!wine) return;
    
    // 既存の選択を解除
    document.querySelectorAll('.recent-wine-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 新しい選択を追加
    const card = document.querySelector(`[data-wine-id="${wineId}"]`);
    if (card) card.classList.add('selected');
    
    // ワイン情報でフォームを設定
    populateFormWithWine(wine);
    
    // 全てのフォームセクションを有効化
    enableAllFormSections();
    
    showForm('このワインを再記録');
    currentWineId = wineId;
    isUpdateMode = false;
}

// ワイン情報でフォームを設定
function populateFormWithWine(wine) {
    // 基本情報を設定
    const fields = [
        'wineName', 'producer', 'country', 'region', 'vintage', 'price',
        'grapes', 'alcohol', 'soil', 'climate', 'history', 'winemaker',
        'saleUrl', 'dlaboUrl', 'referenceUrl'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && wine[field]) {
            element.value = wine[field];
        }
    });
    
    // ワインタイプの設定
    if (wine.wineType) {
        const wineTypeRadio = document.querySelector(`input[name="wineType"][value="${wine.wineType}"]`);
        if (wineTypeRadio) wineTypeRadio.checked = true;
    }
    
    // 記録情報をリセット（新しい記録用）
    document.getElementById('recordDate').valueAsDate = new Date();
    document.getElementById('daysFromOpening').value = '';
    document.getElementById('pairing').value = '';
    document.getElementById('notes').value = '';
}

// チャートの初期化
function initializeChart() {
    const ctx = document.getElementById('aromaChart');
    if (!ctx) return;
    
    // Chart.jsの実装は後で追加
    console.log('Chart initialized');
}

// 香りレーダーチャートの表示
function showAromaChart(recordId) {
    const record = wineRecords.find(r => r.id === recordId);
    if (!record || !record.aromaScores) {
        alert('香りデータが見つかりません');
        return;
    }
    
    const ctx = document.getElementById('aromaChart');
    if (!ctx) return;
    
    // 既存のチャートを破棄
    if (aromaChart) {
        aromaChart.destroy();
    }
    
    // 香りスコアのデータを準備
    const aromaData = {
        labels: ['果実', '花', 'スパイス', 'ハーブ', '土・鉱物', '木', 'その他'],
        datasets: [{
            label: `${record.wineName} (${record.recordDate})`,
            data: [
                record.aromaScores.fruit || 0,
                record.aromaScores.floral || 0,
                record.aromaScores.spice || 0,
                record.aromaScores.herb || 0,
                record.aromaScores.earth || 0,
                record.aromaScores.wood || 0,
                record.aromaScores.other || 0
            ],
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
        }]
    };
    
    // チャートの設定
    const config = {
        type: 'radar',
        data: aromaData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '香りプロファイル',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333'
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: getCurrentTheme() === 'dark' ? '#b0b0b0' : '#666666'
                    },
                    grid: {
                        color: getCurrentTheme() === 'dark' ? '#404040' : '#e0e0e0'
                    },
                    pointLabels: {
                        color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    };
    
    // チャートを作成
    aromaChart = new Chart(ctx, config);
    
    // チャートセクションを表示
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.style.display = 'block';
        chartSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 複数の記録を比較するレーダーチャート
function showComparisonChart(recordIds) {
    const ctx = document.getElementById('aromaChart');
    if (!ctx) return;
    
    // 既存のチャートを破棄
    if (aromaChart) {
        aromaChart.destroy();
    }
    
    const datasets = [];
    const colors = [
        'rgba(102, 126, 234, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
    ];
    
    const borderColors = [
        'rgba(102, 126, 234, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
    ];
    
    recordIds.forEach((recordId, index) => {
        const record = wineRecords.find(r => r.id === recordId);
        if (record && record.aromaScores) {
            datasets.push({
                label: `${record.wineName} (${record.recordDate})`,
                data: [
                    record.aromaScores.fruit || 0,
                    record.aromaScores.floral || 0,
                    record.aromaScores.spice || 0,
                    record.aromaScores.herb || 0,
                    record.aromaScores.earth || 0,
                    record.aromaScores.wood || 0,
                    record.aromaScores.other || 0
                ],
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 2,
                pointBackgroundColor: borderColors[index % borderColors.length],
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            });
        }
    });
    
    const aromaData = {
        labels: ['果実', '花', 'スパイス', 'ハーブ', '土・鉱物', '木', 'その他'],
        datasets: datasets
    };
    
    const config = {
        type: 'radar',
        data: aromaData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '香りプロファイル比較',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333'
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: getCurrentTheme() === 'dark' ? '#b0b0b0' : '#666666'
                    },
                    grid: {
                        color: getCurrentTheme() === 'dark' ? '#404040' : '#e0e0e0'
                    },
                    pointLabels: {
                        color: getCurrentTheme() === 'dark' ? '#ffffff' : '#333333',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    };
    
    aromaChart = new Chart(ctx, config);
    
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.style.display = 'block';
        chartSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// チャートセクションを非表示
function hideChart() {
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.style.display = 'none';
    }
    
    if (aromaChart) {
        aromaChart.destroy();
        aromaChart = null;
    }
}

// テーマ管理機能
function initializeTheme() {
    const savedTheme = localStorage.getItem('wineAppTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // 保存されたテーマを使用
        setTheme(savedTheme);
    } else if (prefersDark) {
        // ブラウザがダークモードを推奨している場合
        setTheme('dark');
    } else {
        // デフォルトはライトモード
        setTheme('light');
    }
    
    // ブラウザのテーマ変更を監視
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('wineAppTheme')) {
            // ユーザーが手動でテーマを設定していない場合のみ変更
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    
    // テーマを保存
    localStorage.setItem('wineAppTheme', theme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

// フォームセクションの制御
function restrictFormToWineInfo() {
    // 基本情報セクション以外を無効化
    const basicInfoSection = document.querySelector('.form-section:first-of-type');
    const allSections = document.querySelectorAll('.form-section');
    
    allSections.forEach((section, index) => {
        if (index === 0) {
            // 基本情報セクション（最初のセクション）は表示
            section.style.display = 'block';
            section.style.opacity = '1';
        } else {
            // その他のセクションは非表示
            section.style.display = 'none';
        }
    });
    
    // 基本情報セクション内でも、記録日や記録に関する項目は無効化
    const recordSpecificFields = [
        'recordDate', 'daysFromOpening', 'pairing', 'notes',
        'wineRating', 'pairingRating', 'recordTime', 'customTime'
    ];
    
    recordSpecificFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = true;
            field.style.opacity = '0.5';
        }
    });
    
    // 画像関連の要素も無効化
    const imageInputs = document.querySelectorAll('input[type="file"]');
    imageInputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.5';
    });
    
    // ペイントゾーンも無効化
    const paintZone = document.querySelector('.paint-zone');
    if (paintZone) {
        paintZone.style.display = 'none';
    }
    
    // 香りチャートも無効化
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.style.display = 'none';
    }
    
    // 編集専用の説明文を表示
    showWineEditNotice();
}

function enableAllFormSections() {
    // 全てのセクションを表示
    const allSections = document.querySelectorAll('.form-section');
    allSections.forEach(section => {
        section.style.display = 'block';
        section.style.opacity = '1';
    });
    
    // 全てのフィールドを有効化
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
    });
    
    // ペイントゾーンを表示
    const paintZone = document.querySelector('.paint-zone');
    if (paintZone) {
        paintZone.style.display = 'block';
    }
    
    // 香りチャートを表示
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.style.display = 'block';
    }
    
    // 編集専用の説明文を非表示
    hideWineEditNotice();
}

function showWineEditNotice() {
    // 既存の説明文があれば削除
    const existingNotice = document.getElementById('wineEditNotice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    // 新しい説明文を作成
    const notice = document.createElement('div');
    notice.id = 'wineEditNotice';
    notice.className = 'wine-edit-notice';
    notice.innerHTML = `
        <div class="notice-content">
            <h4>ワイン基本情報の編集</h4>
            <p>このモードでは、ワインの基本情報（名前、生産者、地域、ブドウ品種など）のみを編集できます。</p>
            <p>テイスティング記録や香り・味わいの詳細情報は編集できません。</p>
        </div>
    `;
    
    // フォームの最初に挿入
    const form = document.getElementById('wineRecordForm');
    form.insertBefore(notice, form.firstChild);
}

function hideWineEditNotice() {
    const notice = document.getElementById('wineEditNotice');
    if (notice) {
        notice.remove();
    }
}