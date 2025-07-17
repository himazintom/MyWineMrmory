// Firebase設定（実際の設定はFirebaseプロジェクトから取得）
const firebaseConfig = {
    // TODO: 実際のFirebase設定を入力してください
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Firebase初期化（実際の使用時にはFirebase SDKを読み込んでください）
let db = null;
let storage = null;

// 一時的にローカルストレージを使用（Firebase設定前）
const useLocalStorage = true;

const wineRecords = JSON.parse(localStorage.getItem('wineRecords')) || [];

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
    aroma: {
        "1": "フルーティー",
        "2": "フローラル",
        "3": "スパイシー",
        "4": "ハーブ",
        "5": "オーク",
        "6": "ミネラル"
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
    rating: {
        "1": "不満",
        "2": "普通",
        "3": "良い",
        "4": "非常に良い",
        "5": "最高"
    }
};

// Firebase初期化関数（実際の使用時）
function initializeFirebase() {
    if (!useLocalStorage) {
        // Firebase SDK初期化
        // firebase.initializeApp(firebaseConfig);
        // db = firebase.firestore();
        // storage = firebase.storage();
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

// ワインデータの保存
async function saveWineRecord(wineData) {
    if (useLocalStorage) {
        // ローカルストレージに保存
        const records = JSON.parse(localStorage.getItem('wineRecords')) || [];
        records.push(wineData);
        localStorage.setItem('wineRecords', JSON.stringify(records));
    } else {
        // Firebase Firestoreに保存
        try {
            await db.collection('wineRecords').add(wineData);
        } catch (error) {
            console.error('Firebase保存エラー:', error);
            throw error;
        }
    }
}

// ワインデータの取得
async function getWineRecords() {
    if (useLocalStorage) {
        // ローカルストレージから取得
        return JSON.parse(localStorage.getItem('wineRecords')) || [];
    } else {
        // Firebase Firestoreから取得
        try {
            const snapshot = await db.collection('wineRecords').orderBy('date', 'desc').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Firebase取得エラー:', error);
            return [];
        }
    }
}

// 画像アップロード
async function uploadImage(file, fileName) {
    if (useLocalStorage) {
        // ローカルストレージ用：Base64に変換
        return await fileToBase64(file);
    } else {
        // Firebase Storage用
        try {
            const storageRef = storage.ref(`wine-images/${fileName}`);
            await storageRef.put(file);
            return await storageRef.getDownloadURL();
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            throw error;
        }
    }
}

// 星の評価表示
function getRatingStars(rating) {
    const stars = '★'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));
    return `<span class="rating-stars">${stars}</span>`;
}

// ワイン記録の表示
function displayWineRecords(records) {
    const recordsDiv = document.getElementById('wineRecords');
    
    if (records.length === 0) {
        recordsDiv.innerHTML = '<div class="no-records">まだワインの記録がありません</div>';
        return;
    }
    
    recordsDiv.innerHTML = records.map((record, index) => `
        <div class="wine-record">
            <h3>${record.wineName}</h3>
            <div class="wine-info">
                <div class="wine-info-item">
                    <strong>種類:</strong> ${optionMappings.wineType[record.wineType]}
                </div>
                <div class="wine-info-item">
                    <strong>色調:</strong> ${optionMappings.color[record.color]}
                </div>
                <div class="wine-info-item">
                    <strong>香り:</strong> ${optionMappings.aroma[record.aroma]}
                </div>
                <div class="wine-info-item">
                    <strong>味わい:</strong> ${optionMappings.taste[record.taste]}
                </div>
                <div class="wine-info-item">
                    <strong>ボディ:</strong> ${optionMappings.body[record.body]}
                </div>
                <div class="wine-info-item">
                    <strong>評価:</strong> ${getRatingStars(record.rating)}
                </div>
                ${record.price ? `<div class="wine-info-item"><strong>価格:</strong> ¥${record.price}</div>` : ''}
                ${record.vintage ? `<div class="wine-info-item"><strong>ヴィンテージ:</strong> ${record.vintage}</div>` : ''}
                ${record.pairing ? `<div class="wine-info-item"><strong>ペアリング:</strong> ${record.pairing}</div>` : ''}
                <div class="wine-info-item">
                    <strong>記録日:</strong> ${record.date}
                </div>
            </div>
            
            ${record.notes ? `<div style="margin-top: 15px;"><strong>メモ:</strong> ${record.notes}</div>` : ''}
            
            <div class="wine-images">
                ${record.wineImageUrl ? `<img src="${record.wineImageUrl}" alt="ワイン画像">` : ''}
                ${record.pairingImageUrl ? `<img src="${record.pairingImageUrl}" alt="ペアリング画像">` : ''}
            </div>
            
            <button class="delete-btn" onclick="deleteWineRecord(${index})">削除</button>
        </div>
    `).join('');
}

// ワイン記録の削除
async function deleteWineRecord(index) {
    if (confirm('この記録を削除しますか？')) {
        if (useLocalStorage) {
            const records = JSON.parse(localStorage.getItem('wineRecords')) || [];
            records.splice(index, 1);
            localStorage.setItem('wineRecords', JSON.stringify(records));
            loadWineRecords();
        } else {
            // Firebase削除処理
            try {
                const records = await getWineRecords();
                await db.collection('wineRecords').doc(records[index].id).delete();
                loadWineRecords();
            } catch (error) {
                console.error('削除エラー:', error);
                alert('削除に失敗しました');
            }
        }
    }
}

// ワイン記録の読み込み
async function loadWineRecords() {
    try {
        const records = await getWineRecords();
        displayWineRecords(records);
    } catch (error) {
        console.error('記録読み込みエラー:', error);
    }
}

// フォーム送信処理
document.getElementById('wineForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const wineData = {
        wineName: formData.get('wineName'),
        wineType: formData.get('wineType'),
        color: formData.get('color'),
        aroma: formData.get('aroma'),
        taste: formData.get('taste'),
        body: formData.get('body'),
        rating: formData.get('rating'),
        price: formData.get('price'),
        vintage: formData.get('vintage'),
        pairing: formData.get('pairing'),
        notes: formData.get('notes'),
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };
    
    try {
        // 画像アップロード処理
        const wineImageFile = document.getElementById('wineImage').files[0];
        const pairingImageFile = document.getElementById('pairingImage').files[0];
        
        if (wineImageFile) {
            wineData.wineImageUrl = await uploadImage(wineImageFile, `wine_${Date.now()}_${wineImageFile.name}`);
        }
        
        if (pairingImageFile) {
            wineData.pairingImageUrl = await uploadImage(pairingImageFile, `pairing_${Date.now()}_${pairingImageFile.name}`);
        }
        
        await saveWineRecord(wineData);
        
        // フォームリセット
        this.reset();
        document.getElementById('wineImagePreview').innerHTML = '';
        document.getElementById('pairingImagePreview').innerHTML = '';
        
        // 記録を再読み込み
        loadWineRecords();
        
        alert('ワインの記録が追加されました！');
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました');
    }
});

// 画像プレビューのイベントリスナー
document.getElementById('wineImage').addEventListener('change', function() {
    showImagePreview(this, 'wineImagePreview');
});

document.getElementById('pairingImage').addEventListener('change', function() {
    showImagePreview(this, 'pairingImagePreview');
});

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 今日の日付を設定
    document.getElementById('date').valueAsDate = new Date();
    
    // Firebase初期化
    initializeFirebase();
    
    // 記録を読み込み
    loadWineRecords();
});

// Firebase設定用の関数（実際の使用時に呼び出し）
function setupFirebase(config) {
    Object.assign(firebaseConfig, config);
    useLocalStorage = false;
    initializeFirebase();
}