// データ管理
let wineRecords = JSON.parse(localStorage.getItem('advancedWineRecords')) || [];
let currentWineId = null;
let isUpdateMode = false;
let aromaChart = null;

// 選択肢の文字列マッピング
const optionMappings = {
    wineType: {
        "1": "赤ワイン",
        "2": "白ワイン", 
        "3": "ロゼワイン",
        "4": "スパークリングワイン",
        "5": "デザートワイン"
    },
    color: {
        "1": "淡い",
        "2": "中程度",
        "3": "濃い"
    },
    taste: {
        "1": "辛口",
        "2": "半辛口",
        "3": "半甘口",
        "4": "甘口"
    },
    body: {
        "1": "ライト",
        "2": "ミディアム",
        "3": "フル"
    },
    complexity: {
        "1": "シンプル",
        "2": "やや複雑",
        "3": "複雑",
        "4": "非常に複雑",
        "5": "極めて複雑"
    },
    rating: {
        "1": "不満",
        "2": "普通",
        "3": "良い",
        "4": "非常に良い",
        "5": "最高"
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
    document.getElementById('wineImage').addEventListener('change', function() {
        showImagePreview(this, 'wineImagePreview');
    });
    
    document.getElementById('pairingImage').addEventListener('change', function() {
        showImagePreview(this, 'pairingImagePreview');
    });
    
    // 香りスコアスライダー
    const scoreSliders = document.querySelectorAll('input[type="range"]');
    scoreSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            updateScoreDisplay(this);
        });
    });
    
    // 検索・フィルタ
    document.getElementById('searchInput').addEventListener('input', filterRecords);
    document.getElementById('sortSelect').addEventListener('change', sortRecords);
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
            <p>種類: ${optionMappings.wineType[wine.wineType]}</p>
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
    document.getElementById('wineName').value = wine.wineName;
    document.getElementById('producer').value = wine.producer;
    document.getElementById('country').value = wine.country;
    document.getElementById('region').value = wine.region;
    document.getElementById('vintage').value = wine.vintage;
    document.getElementById('price').value = wine.price;
    document.getElementById('wineType').value = wine.wineType;
    document.getElementById('soil').value = wine.soil;
    document.getElementById('history').value = wine.history;
    
    // 参考情報
    document.getElementById('saleUrl').value = wine.saleUrl || '';
    document.getElementById('dlaboUrl').value = wine.dlaboUrl || '';
    document.getElementById('referenceUrl').value = wine.referenceUrl || '';
    
    // テイスティング情報はクリア（新しい記録用）
    document.getElementById('color').value = '';
    document.getElementById('taste').value = '';
    document.getElementById('body').value = '';
    document.getElementById('complexity').value = '';
    document.getElementById('rating').value = '';
    
    // 香りスコアをリセット
    resetAromaScores();
    
    // 香りチェックボックスをリセット
    resetAromaCheckboxes();
    
    // 記録情報をリセット
    document.getElementById('recordDate').valueAsDate = new Date();
    document.getElementById('daysFromOpening').value = '';
    document.getElementById('pairing').value = '';
    document.getElementById('notes').value = '';
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
    document.getElementById('wineImagePreview').innerHTML = '';
    document.getElementById('pairingImagePreview').innerHTML = '';
    resetAromaScores();
    resetAromaCheckboxes();
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
    scoreValue.textContent = slider.value;
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
        soil: formData.get('soil'),
        history: formData.get('history'),
        
        // テイスティング情報
        color: formData.get('color'),
        taste: formData.get('taste'),
        body: formData.get('body'),
        complexity: formData.get('complexity'),
        rating: formData.get('rating'),
        
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
        
        // 参考情報
        saleUrl: formData.get('saleUrl'),
        dlaboUrl: formData.get('dlaboUrl'),
        referenceUrl: formData.get('referenceUrl'),
        
        // 記録情報
        recordDate: formData.get('recordDate'),
        daysFromOpening: parseInt(formData.get('daysFromOpening') || 0),
        pairing: formData.get('pairing'),
        notes: formData.get('notes'),
        
        timestamp: new Date().toISOString()
    };
    
    try {
        // 画像処理
        const wineImageFile = document.getElementById('wineImage').files[0];
        const pairingImageFile = document.getElementById('pairingImage').files[0];
        
        if (wineImageFile) {
            wineData.wineImageUrl = await fileToBase64(wineImageFile);
        }
        
        if (pairingImageFile) {
            wineData.pairingImageUrl = await fileToBase64(pairingImageFile);
        }
        
        // データ保存
        wineRecords.push(wineData);
        localStorage.setItem('advancedWineRecords', JSON.stringify(wineRecords));
        
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
function createAromaTags(detailedAromas) {
    const tags = [];
    Object.entries(detailedAromas).forEach(([category, aromas]) => {
        aromas.forEach(aroma => {
            tags.push(`<span class="aroma-tag">${aroma}</span>`);
        });
    });
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
            wine.aromaScores.fruit,
            wine.aromaScores.floral,
            wine.aromaScores.spice,
            wine.aromaScores.herb,
            wine.aromaScores.earth,
            wine.aromaScores.wood,
            wine.aromaScores.other
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
                    <strong>生産者:</strong> ${record.producer}
                </div>
                <div class="wine-info-item">
                    <strong>生産国:</strong> ${record.country}
                </div>
                <div class="wine-info-item">
                    <strong>種類:</strong> ${optionMappings.wineType[record.wineType]}
                </div>
                <div class="wine-info-item">
                    <strong>色調:</strong> ${optionMappings.color[record.color]}
                </div>
                <div class="wine-info-item">
                    <strong>味わい:</strong> ${optionMappings.taste[record.taste]}
                </div>
                <div class="wine-info-item">
                    <strong>ボディ:</strong> ${optionMappings.body[record.body]}
                </div>
                <div class="wine-info-item">
                    <strong>複雑さ:</strong> ${optionMappings.complexity[record.complexity]}
                </div>
                <div class="wine-info-item">
                    <strong>評価:</strong> ${getRatingStars(record.rating)}
                </div>
                ${record.price ? `<div class="wine-info-item"><strong>価格:</strong> ¥${record.price}</div>` : ''}
                ${record.vintage ? `<div class="wine-info-item"><strong>ヴィンテージ:</strong> ${record.vintage}</div>` : ''}
                ${record.pairing ? `<div class="wine-info-item"><strong>ペアリング:</strong> ${record.pairing}</div>` : ''}
                <div class="wine-info-item">
                    <strong>記録日:</strong> ${record.recordDate}
                </div>
                <div class="wine-info-item">
                    <strong>開栓からの日数:</strong> ${record.daysFromOpening}日
                </div>
            </div>
            
            ${record.notes ? `<div style="margin-top: 15px;"><strong>メモ:</strong> ${record.notes}</div>` : ''}
            
            <div class="aroma-tags">
                ${createAromaTags(record.detailedAromas)}
            </div>
            
            <div class="wine-images">
                ${record.wineImageUrl ? `<img src="${record.wineImageUrl}" alt="ワイン画像">` : ''}
                ${record.pairingImageUrl ? `<img src="${record.pairingImageUrl}" alt="ペアリング画像">` : ''}
            </div>
            
            <div style="margin-top: 15px;">
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
        localStorage.setItem('advancedWineRecords', JSON.stringify(wineRecords));
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