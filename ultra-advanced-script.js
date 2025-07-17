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
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 初期データ読み込み
    loadRecentWines();
    loadWineRecords();
    initializeChart();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 新規ワイン記録ボタン
    document.getElementById('newWineBtn').addEventListener('click', showNewWineForm);
    
    // キャンセルボタン
    document.getElementById('cancelBtn').addEventListener('click', hideForm);
    
    // フォーム送信
    document.getElementById('wineRecordForm').addEventListener('submit', handleFormSubmit);
    
    // 画像プレビュー
    const imageInputs = ['wineImage', 'pairingImage', 'colorImage', 'labelImage'];
    imageInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', function() {
            showImagePreview(this, inputId + 'Preview');
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
    
    // 検索・フィルタ
    document.getElementById('searchInput').addEventListener('input', filterRecords);
    document.getElementById('sortSelect').addEventListener('change', sortRecords);
    
    // エクスポートボタン
    document.getElementById('exportBtn').addEventListener('click', exportData);
}

// 直近4本のワイン表示
function loadRecentWines() {
    const recentWinesGrid = document.getElementById('recentWinesGrid');
    
    // 直近4本を取得（ワイン名でグループ化）
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
            <p>評価: ${getRatingStars(wine.rating)}</p>
            <p>最終記録: ${wine.recordDate}</p>
        </div>
    `).join('');
}

// 直近ワインの選択
function selectRecentWine(wineId) {
    // 既存の選択を解除
    document.querySelectorAll('.recent-wine-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 新しい選択を追加
    document.querySelector(`[data-wine-id="${wineId}"]`).classList.add('selected');
    
    // ワイン情報を取得してフォームに設定
    const wine = wineRecords.find(r => r.id === wineId);
    if (wine) {
        populateFormWithWine(wine);
        showForm('このワインを再記録');
        currentWineId = wineId;
        isUpdateMode = false;
    }
}

// ワイン情報でフォームを埋める
function populateFormWithWine(wine) {
    // 基本情報
    document.getElementById('wineName').value = wine.wineName || '';
    document.getElementById('producer').value = wine.producer || '';
    document.getElementById('country').value = wine.country || '';
    document.getElementById('region').value = wine.region || '';
    document.getElementById('vintage').value = wine.vintage || '';
    document.getElementById('price').value = wine.price || '';
    document.getElementById('grapes').value = wine.grapes || '';
    document.getElementById('alcohol').value = wine.alcohol || '';
    document.getElementById('soil').value = wine.soil || '';
    document.getElementById('climate').value = wine.climate || '';
    document.getElementById('history').value = wine.history || '';
    document.getElementById('winemaker').value = wine.winemaker || '';
    
    // ワインタイプ
    if (wine.wineType) {
        const wineTypeRadio = document.querySelector(`input[name="wineType"][value="${wine.wineType}"]`);
        if (wineTypeRadio) wineTypeRadio.checked = true;
    }
    
    // 参考情報
    document.getElementById('saleUrl').value = wine.saleUrl || '';
    document.getElementById('dlaboUrl').value = wine.dlaboUrl || '';
    document.getElementById('referenceUrl').value = wine.referenceUrl || '';
    
    // その他の詳細情報はリセット（新しい記録用）
    resetDetailedFields();
    
    // 記録情報をリセット
    document.getElementById('recordDate').valueAsDate = new Date();
    document.getElementById('daysFromOpening').value = '';
    document.getElementById('pairing').value = '';
    document.getElementById('notes').value = '';
}

// 詳細フィールドのリセット
function resetDetailedFields() {
    // 外観分析
    document.querySelectorAll('input[name="colorTone"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="colorIntensity"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="clarity"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="viscosity"]').forEach(radio => radio.checked = false);
    
    // 香り分析
    document.querySelectorAll('input[name="firstImpressionIntensity"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="swirlingIntensity"]').forEach(radio => radio.checked = false);
    document.getElementById('firstImpressionNotes').value = '';
    document.getElementById('swirlingNotes').value = '';
    
    // 味わい分析
    document.querySelectorAll('input[name="attackIntensity"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="middleComplexity"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="finishLength"]').forEach(radio => radio.checked = false);
    document.getElementById('attackNotes').value = '';
    document.getElementById('middleNotes').value = '';
    document.getElementById('finishNotes').value = '';
    document.getElementById('finishSeconds').value = '';
    
    // 構成要素
    document.querySelectorAll('input[name="acidityLevel"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="tanninLevel"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="sweetnessLevel"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="bodyWeight"]').forEach(radio => radio.checked = false);
    
    // 香りスコアをリセット
    resetAromaScores();
    
    // 香りチェックボックスをリセット
    resetAromaCheckboxes();
    
    // 評価をリセット
    document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
}

// 新規ワインフォーム表示
function showNewWineForm() {
    resetForm();
    showForm('新しいワインを記録');
    currentWineId = null;
    isUpdateMode = false;
    
    // 選択を解除
    document.querySelectorAll('.recent-wine-card').forEach(card => {
        card.classList.remove('selected');
    });
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

// フォームリセット
function resetForm() {
    document.getElementById('wineRecordForm').reset();
    document.getElementById('recordDate').valueAsDate = new Date();
    
    // 画像プレビューをクリア
    ['wineImagePreview', 'pairingImagePreview', 'colorImagePreview', 'labelImagePreview'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
    
    resetAromaScores();
    resetAromaCheckboxes();
    resetDetailedFields();
    
    // カスタム時間入力を無効化
    document.getElementById('customTime').disabled = true;
    document.getElementById('customTime').required = false;
    
    currentWineId = null;
    isUpdateMode = false;
}

// 香りスコアリセット
function resetAromaScores() {
    const scoreSliders = document.querySelectorAll('input[type="range"]');
    scoreSliders.forEach(slider => {
        slider.value = 0;
        updateScoreDisplay(slider);
    });
}

// 香りチェックボックスリセット
function resetAromaCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// スコア表示更新
function updateScoreDisplay(slider) {
    const scoreValue = slider.parentElement.querySelector('.score-value');
    if (scoreValue) {
        scoreValue.textContent = slider.value;
    }
}

// 画像プレビュー表示
function showImagePreview(input, previewId) {
    const file = input.files[0];
    const previewDiv = document.getElementById(previewId);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewDiv.innerHTML = `<img src="${e.target.result}" class="image-preview" alt="プレビュー">`;
        };
        reader.readAsDataURL(file);
    } else {
        previewDiv.innerHTML = '';
    }
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

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 時間の処理
    let recordTime = formData.get('recordTime');
    if (recordTime === 'custom') {
        recordTime = formData.get('customTime');
    }
    
    // 基本情報
    const wineData = {
        id: currentWineId || Date.now().toString(),
        wineName: formData.get('wineName'),
        producer: formData.get('producer'),
        country: formData.get('country'),
        region: formData.get('region'),
        vintage: formData.get('vintage'),
        price: formData.get('price'),
        wineType: formData.get('wineType'),
        grapes: formData.get('grapes'),
        alcohol: formData.get('alcohol'),
        soil: formData.get('soil'),
        climate: formData.get('climate'),
        history: formData.get('history'),
        winemaker: formData.get('winemaker'),
        
        // 外観分析
        colorTone: formData.get('colorTone'),
        colorIntensity: formData.get('colorIntensity'),
        clarity: formData.get('clarity'),
        viscosity: formData.get('viscosity'),
        
        // 香り分析
        firstImpressionIntensity: formData.get('firstImpressionIntensity'),
        firstImpressionNotes: formData.get('firstImpressionNotes'),
        swirlingIntensity: formData.get('swirlingIntensity'),
        swirlingNotes: formData.get('swirlingNotes'),
        
        // 香りスコア
        aromaScores: {
            fruit: parseInt(formData.get('fruitScore')),
            floral: parseInt(formData.get('floralScore')),
            spice: parseInt(formData.get('spiceScore')),
            herb: parseInt(formData.get('herbScore')),
            earth: parseInt(formData.get('earthScore')),
            wood: parseInt(formData.get('woodScore')),
            other: parseInt(formData.get('otherScore'))
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
        customOtherAromas: formData.get('customOtherAromas'),
        
        // 味わい分析
        attackIntensity: formData.get('attackIntensity'),
        attackNotes: formData.get('attackNotes'),
        middleComplexity: formData.get('middleComplexity'),
        middleNotes: formData.get('middleNotes'),
        finishLength: formData.get('finishLength'),
        finishSeconds: formData.get('finishSeconds'),
        finishNotes: formData.get('finishNotes'),
        
        // 構成要素
        acidityLevel: formData.get('acidityLevel'),
        acidityTypes: Array.from(formData.getAll('acidityTypes')),
        tanninLevel: formData.get('tanninLevel'),
        tanninTypes: Array.from(formData.getAll('tanninTypes')),
        sweetnessLevel: formData.get('sweetnessLevel'),
        bodyWeight: formData.get('bodyWeight'),
        
        // 時間経過と環境
        recordTime: recordTime,
        temperature: formData.get('temperature'),
        decanted: formData.get('decanted'),
        timeChangeNotes: formData.get('timeChangeNotes'),
        
        // 環境情報
        ambientTemp: formData.get('ambientTemp'),
        humidity: formData.get('humidity'),
        lighting: formData.get('lighting'),
        mood: formData.get('mood'),
        companions: formData.get('companions'),
        occasion: formData.get('occasion'),
        location: formData.get('location'),
        glassType: formData.get('glassType'),
        
        // 参考情報
        saleUrl: formData.get('saleUrl'),
        dlaboUrl: formData.get('dlaboUrl'),
        referenceUrl: formData.get('referenceUrl'),
        
        // 記録情報
        recordDate: formData.get('recordDate'),
        daysFromOpening: parseInt(formData.get('daysFromOpening') || 0),
        pairing: formData.get('pairing'),
        notes: formData.get('notes'),
        wineRating: formData.get('wineRating'),
        pairingRating: formData.get('pairingRating'),
        
        timestamp: new Date().toISOString()
    };
    
    try {
        // 画像処理
        const imageFiles = ['wineImage', 'pairingImage', 'colorImage', 'labelImage'];
        const imageUrls = {};
        
        for (const imageType of imageFiles) {
            const file = document.getElementById(imageType).files[0];
            if (file) {
                imageUrls[imageType + 'Url'] = await fileToBase64(file);
            }
        }
        
        // 画像URLを追加
        Object.assign(wineData, imageUrls);
        
        // データ保存
        wineRecords.push(wineData);
        localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
        
        // UI更新
        loadRecentWines();
        loadWineRecords();
        hideForm();
        
        alert('ワインの記録が追加されました！');
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました');
    }
}

// 星評価の表示
function getRatingStars(rating) {
    const stars = '★'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));
    return `<span class="rating-stars">${stars}</span>`;
}

// 香りタグの生成
function createAromaTags(detailedAromas, customOtherAromas) {
    const tags = [];
    if (detailedAromas) {
        Object.entries(detailedAromas).forEach(([category, aromas]) => {
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

// レーダーチャートの初期化
function initializeChart() {
    const ctx = document.getElementById('aromaChart').getContext('2d');
    
    aromaChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.values(aromaCategories).map(cat => cat.name),
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// レーダーチャートの更新
function updateChart(wineId) {
    const wineData = wineRecords.filter(r => r.id === wineId);
    
    aromaChart.data.datasets = wineData.map((wine, index) => ({
        label: `${wine.recordDate} (${wine.daysFromOpening}日目)`,
        data: [
            wine.aromaScores?.fruit || 0,
            wine.aromaScores?.floral || 0,
            wine.aromaScores?.spice || 0,
            wine.aromaScores?.herb || 0,
            wine.aromaScores?.earth || 0,
            wine.aromaScores?.wood || 0,
            wine.aromaScores?.other || 0
        ],
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        borderWidth: 2
    }));
    
    aromaChart.update();
}

// 記録一覧の表示
function loadWineRecords() {
    const recordsDiv = document.getElementById('wineRecords');
    
    if (wineRecords.length === 0) {
        recordsDiv.innerHTML = '<div class="no-records">まだワインの記録がありません</div>';
        return;
    }
    
    const sortedRecords = [...wineRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    recordsDiv.innerHTML = sortedRecords.map((record, index) => `
        <div class="wine-record">
            <h3>${record.wineName}</h3>
            <div class="wine-info">
                <div class="wine-info-item">
                    <strong>生産者:</strong> ${record.producer || 'N/A'}
                </div>
                <div class="wine-info-item">
                    <strong>生産国:</strong> ${record.country || 'N/A'}
                </div>
                <div class="wine-info-item">
                    <strong>種類:</strong> ${optionMappings.wineType[record.wineType] || record.wineType || 'N/A'}
                </div>
                <div class="wine-info-item">
                    <strong>色調:</strong> ${optionMappings.colorTone[record.colorTone] || record.colorTone || 'N/A'}
                </div>
                <div class="wine-info-item">
                    <strong>透明度:</strong> ${optionMappings.clarity[record.clarity] || record.clarity || 'N/A'}
                </div>
                <div class="wine-info-item">
                    <strong>評価:</strong> ${getRatingStars(record.rating)}
                </div>
                ${record.price ? `<div class="wine-info-item"><strong>価格:</strong> ¥${record.price}</div>` : ''}
                ${record.vintage ? `<div class="wine-info-item"><strong>ヴィンテージ:</strong> ${record.vintage}</div>` : ''}
                ${record.alcohol ? `<div class="wine-info-item"><strong>アルコール度数:</strong> ${record.alcohol}%</div>` : ''}
                ${record.pairing ? `<div class="wine-info-item"><strong>ペアリング:</strong> ${record.pairing}</div>` : ''}
                <div class="wine-info-item">
                    <strong>記録日:</strong> ${record.recordDate}
                </div>
                <div class="wine-info-item">
                    <strong>開栓からの日数:</strong> ${record.daysFromOpening}日
                </div>
                ${record.recordTime ? `<div class="wine-info-item"><strong>記録時間:</strong> ${optionMappings.recordTime[record.recordTime] || record.recordTime + '分後'}</div>` : ''}
                ${record.temperature ? `<div class="wine-info-item"><strong>温度:</strong> ${record.temperature}℃</div>` : ''}
            </div>
            
            ${record.notes ? `<div style="margin-top: 15px;"><strong>メモ:</strong> ${record.notes}</div>` : ''}
            ${record.attackNotes ? `<div style="margin-top: 10px;"><strong>アタック:</strong> ${record.attackNotes}</div>` : ''}
            ${record.middleNotes ? `<div style="margin-top: 10px;"><strong>中盤:</strong> ${record.middleNotes}</div>` : ''}
            ${record.finishNotes ? `<div style="margin-top: 10px;"><strong>フィニッシュ:</strong> ${record.finishNotes}</div>` : ''}
            ${record.finishSeconds ? `<div style="margin-top: 10px;"><strong>余韻の長さ:</strong> ${record.finishSeconds}秒</div>` : ''}
            
            <div class="aroma-tags">
                ${createAromaTags(record.detailedAromas, record.customOtherAromas)}
            </div>
            
            <div class="wine-images">
                ${record.wineImageUrl ? `<img src="${record.wineImageUrl}" alt="ワイン画像">` : ''}
                ${record.pairingImageUrl ? `<img src="${record.pairingImageUrl}" alt="ペアリング画像">` : ''}
                ${record.colorImageUrl ? `<img src="${record.colorImageUrl}" alt="色の画像">` : ''}
                ${record.labelImageUrl ? `<img src="${record.labelImageUrl}" alt="ラベル画像">` : ''}
            </div>
            
            <div style="margin-top: 20px;">
                <button class="chart-btn" onclick="updateChart('${record.id}')">チャート表示</button>
                <button class="delete-btn" onclick="deleteWineRecord(${index})">削除</button>
            </div>
        </div>
    `).join('');
}

// 記録削除
function deleteWineRecord(index) {
    if (confirm('この記録を削除しますか？')) {
        wineRecords.splice(index, 1);
        localStorage.setItem('ultraAdvancedWineRecords', JSON.stringify(wineRecords));
        loadRecentWines();
        loadWineRecords();
    }
}

// 検索・フィルタリング
function filterRecords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const records = document.querySelectorAll('.wine-record');
    
    records.forEach(record => {
        const text = record.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            record.style.display = 'block';
        } else {
            record.style.display = 'none';
        }
    });
}

// 並び替え
function sortRecords() {
    const sortBy = document.getElementById('sortSelect').value;
    let sortedRecords = [...wineRecords];
    
    switch (sortBy) {
        case 'date':
            sortedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'rating':
            sortedRecords.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
            break;
        case 'name':
            sortedRecords.sort((a, b) => a.wineName.localeCompare(b.wineName));
            break;
    }
    
    wineRecords = sortedRecords;
    loadWineRecords();
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