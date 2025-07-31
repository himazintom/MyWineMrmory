// MyWineMemory - Firebase統合版メインスクリプト
import { auth, db } from './firebase-config.js';
import { 
    onAuthChange, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signOutUser,
    resetPassword,
    isLoggedIn,
    getCurrentUser
} from './auth-service.js';
import {
    createWine,
    getWine,
    getAllWines,
    updateWine,
    deleteWine,
    createRecord,
    getWineRecords,
    getAllRecords,
    updateRecord,
    deleteRecord,
    searchWines,
    onWinesChange,
    exportUserData
} from './firestore-service.js';

// =============================================
// グローバル変数
// =============================================
let currentUser = null;
let wineRecords = []; // Firestoreから取得したデータ
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
let unsubscribeWinesListener = null;

// 自動保存機能
const AutoSave = {
    key: 'wine_form_draft',
    save: function(formData) {
        try {
            localStorage.setItem(this.key, JSON.stringify({
                data: formData,
                timestamp: new Date().toISOString(),
                userId: currentUser?.uid || 'anonymous'
            }));
            console.log('📝 フォームデータを自動保存しました');
        } catch (error) {
            console.warn('⚠️ 自動保存に失敗:', error);
        }
    },
    load: function() {
        try {
            const saved = localStorage.getItem(this.key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // ユーザーが変わっていたら古いデータは使わない
                if (parsed.userId === (currentUser?.uid || 'anonymous')) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.warn('⚠️ 自動保存データの読み込みに失敗:', error);
        }
        return null;
    },
    clear: function() {
        localStorage.removeItem(this.key);
        console.log('🗑️ 自動保存データをクリアしました');
    },
    hasData: function() {
        return !!this.load();
    }
};

// =============================================
// 初期化
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MyWineMemory - Firebase版を初期化中...');
    
    // ページロード時から美しいワインアニメーションを表示
    showLoadingOverlay(true, 'アプリケーションを準備中...');
    
    // 最低3秒間はアニメーションを表示
    const minimumLoadTime = 3000;
    const startTime = Date.now();
    
    // 今日の日付を設定
    const recordDateInput = document.getElementById('recordDate');
    if (recordDateInput) {
        recordDateInput.valueAsDate = new Date();
    }
    
    // テーマ初期化
    initializeTheme();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 認証状態の監視（非同期で実行）
    setTimeout(async () => {
        await setupAuthListener();
        
        // 最低表示時間を確保
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minimumLoadTime - elapsedTime;
        
        if (remainingTime > 0) {
            setTimeout(() => {
                initializeOtherComponents();
            }, remainingTime);
        } else {
            initializeOtherComponents();
        }
    }, 100);
    
    console.log('✅ 初期化開始');
});

/**
 * その他のコンポーネント初期化
 */
function initializeOtherComponents() {
    // ペイントキャンバスの初期化
    initializePaintCanvas();
    
    // チャート初期化
    initializeChart();
    
    // 美しいフェードアウト効果でローディング終了
    updateLoadingMessage('準備完了！');
    setTimeout(() => {
        showLoadingOverlay(false);
    }, 800);
    
    // 必須項目のマーク表示
    addRequiredMarks();
    
    console.log('✅ 初期化完了');
}

// =============================================
// 認証機能
// =============================================

/**
 * 認証状態の監視設定
 */
async function setupAuthListener() {
    return new Promise((resolve) => {
        onAuthChange(async (user) => {
            currentUser = user;
            updateAuthUI(user);
            
            if (user) {
                console.log('👤 ユーザーログイン:', user.email);
                // メッセージを更新（ローディングは継続）
                updateLoadingMessage('ワインデータを読み込み中...');
                
                try {
                    // ユーザーデータを読み込み
                    await loadUserData();
                } catch (error) {
                    console.error('❌ ユーザーデータ読み込みエラー:', error);
                    showNotification('データの読み込みに失敗しました', 'error');
                } finally {
                    // 認証プロセス完了後もローディングは外部で制御
                    console.log('📊 データ読み込み完了');
                }
            } else {
                console.log('👤 未認証状態');
                updateLoadingMessage('アプリケーション準備完了');
                clearUserData();
                // 未認証でも最低表示時間は維持
            }
            
            resolve();
        });
    });
}

/**
 * 認証UIの更新
 */
function updateAuthUI(user) {
    const loginButton = document.getElementById('loginButton');
    const userInfo = document.getElementById('userInfo');
    const userDisplayName = document.getElementById('userDisplayName');
    
    if (user) {
        // ログイン状態
        loginButton.style.display = 'none';
        userInfo.style.display = 'flex';
        userDisplayName.textContent = user.displayName || user.email;
    } else {
        // ログアウト状態
        loginButton.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

/**
 * ユーザーデータを読み込み
 */
async function loadUserData() {
    try {
        // リアルタイムリスナーを設定
        if (unsubscribeWinesListener) {
            unsubscribeWinesListener();
        }
        
        unsubscribeWinesListener = onWinesChange((wines) => {
            console.log(`📊 リアルタイム更新: ${wines.length}本のワイン`);
            loadRecentWines();
            loadWineRecords();
        });
        
        // 初回データ読み込み
        await loadRecentWines();
        await loadWineRecords();
        
    } catch (error) {
        console.error('❌ ユーザーデータ読み込みエラー:', error);
        throw error;
    }
}

/**
 * ユーザーデータをクリア
 */
function clearUserData() {
    wineRecords = [];
    
    // リスナーを解除
    if (unsubscribeWinesListener) {
        unsubscribeWinesListener();
        unsubscribeWinesListener = null;
    }
    
    // UIをクリア
    const recentWinesGrid = document.getElementById('recentWinesGrid');
    const wineRecordsDiv = document.getElementById('wineRecords');
    
    if (recentWinesGrid) {
        recentWinesGrid.innerHTML = '<p class="no-records">ログインしてワインを記録しましょう</p>';
    }
    
    if (wineRecordsDiv) {
        wineRecordsDiv.innerHTML = '<div class="no-records">ログインしてワインを記録しましょう</div>';
    }
    
    // フォームを非表示
    hideForm();
}

// =============================================
// イベントリスナー設定
// =============================================
function setupEventListeners() {
    // 認証関連
    setupAuthEventListeners();
    
    // 基本的なイベントリスナー
    const newWineBtn = document.getElementById('newWineBtn');
    if (newWineBtn) {
        newWineBtn.addEventListener('click', showNewWineForm);
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideForm);
    }
    
    const wineRecordForm = document.getElementById('wineRecordForm');
    if (wineRecordForm) {
        wineRecordForm.addEventListener('submit', handleFormSubmit);
        
        // 自動保存のためのイベントリスナー
        setupAutoSaveListeners(wineRecordForm);
    }
    
    // 複数画像アップロード
    const multipleImageInputs = ['wineImages', 'pairingImages', 'friendImages', 'otherImages'];
    multipleImageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', function() {
                showMultipleImagePreview(this, inputId + 'Preview');
            });
        }
    });
    
    // 香りスコアスライダー
    const scoreSliders = document.querySelectorAll('input[type="range"]');
    scoreSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            updateScoreDisplay(this);
        });
    });
    
    // カスタム時間入力
    const recordTimeSelect = document.getElementById('recordTime');
    if (recordTimeSelect) {
        recordTimeSelect.addEventListener('change', function() {
            const customTimeInput = document.getElementById('customTime');
            if (customTimeInput) {
                if (this.value === 'custom') {
                    customTimeInput.disabled = false;
                    customTimeInput.required = true;
                } else {
                    customTimeInput.disabled = true;
                    customTimeInput.required = false;
                    customTimeInput.value = '';
                }
            }
        });
    }
    
    // ペイントコントロール
    const clearCanvasBtn = document.getElementById('clearCanvas');
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', clearCanvas);
    }
    
    const saveDrawingBtn = document.getElementById('saveDrawing');
    if (saveDrawingBtn) {
        saveDrawingBtn.addEventListener('click', saveDrawing);
    }
    
    const brushSize = document.getElementById('brushSize');
    if (brushSize) {
        brushSize.addEventListener('input', updateBrushSize);
    }
    
    const brushColor = document.getElementById('brushColor');
    if (brushColor) {
        brushColor.addEventListener('input', updateBrushColor);
    }
    
    // 検索・フィルタ・ページネーション
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterRecords);
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortRecords);
    }
    
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', changeItemsPerPage);
    }
    
    const prevPageBtn = document.getElementById('prevPage');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', prevPage);
    }
    
    const nextPageBtn = document.getElementById('nextPage');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', nextPage);
    }
    
    // エクスポートボタン
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // テーマ切り替えボタン
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // ワインタイプ別の選択肢変更
    setupWineTypeHandlers();
}

/**
 * 認証関連のイベントリスナー設定
 */
function setupAuthEventListeners() {
    // ログインボタン
    const loginButton = document.querySelector('.login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', showAuthModal);
    }
    
    // ログアウトボタン
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // モーダル関連
    const closeAuthModal = document.getElementById('closeAuthModal');
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', hideAuthModal);
    }
    
    // 認証タブ
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    
    // フォーム送信
    const emailLoginForm = document.getElementById('emailLoginForm');
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', handleEmailLogin);
    }
    
    const emailRegisterForm = document.getElementById('emailRegisterForm');
    if (emailRegisterForm) {
        emailRegisterForm.addEventListener('submit', handleEmailRegister);
    }
    
    // Googleログイン
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // パスワードリセット
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // モーダル外クリックで閉じる
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
}

// =============================================
// 認証ハンドラー
// =============================================

/**
 * 認証モーダルを表示
 */
function showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'block';
    }
}

/**
 * 認証モーダルを非表示
 */
function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

/**
 * 認証タブの切り替え
 */
function switchAuthTab(tabName) {
    // タブボタンの状態更新
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // フォームの表示切り替え
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tabName}Form`).classList.add('active');
}

/**
 * メールログインハンドラー
 */
async function handleEmailLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoadingOverlay(true);
        await signInWithEmail(email, password);
        hideAuthModal();
        showNotification('ログインしました', 'success');
    } catch (error) {
        console.error('❌ ログインエラー:', error);
        showNotification(error.message, 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

/**
 * メール登録ハンドラー
 */
async function handleEmailRegister(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('パスワードが一致しません', 'error');
        return;
    }
    
    try {
        showLoadingOverlay(true);
        await signUpWithEmail(email, password, displayName);
        hideAuthModal();
        showNotification('アカウントを作成しました。確認メールをお送りしました。', 'success');
    } catch (error) {
        console.error('❌ 登録エラー:', error);
        showNotification(error.message, 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

/**
 * Googleログインハンドラー
 */
async function handleGoogleLogin() {
    try {
        showLoadingOverlay(true);
        await signInWithGoogle();
        hideAuthModal();
        showNotification('Googleでログインしました', 'success');
    } catch (error) {
        console.error('❌ Googleログインエラー:', error);
        showNotification(error.message, 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

/**
 * ログアウトハンドラー
 */
async function handleLogout() {
    try {
        await signOutUser();
        showNotification('ログアウトしました', 'success');
    } catch (error) {
        console.error('❌ ログアウトエラー:', error);
        showNotification('ログアウトに失敗しました', 'error');
    }
}

/**
 * パスワードリセットハンドラー
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        showNotification('メールアドレスを入力してください', 'error');
        return;
    }
    
    try {
        await resetPassword(email);
        showNotification('パスワードリセットメールを送信しました', 'success');
    } catch (error) {
        console.error('❌ パスワードリセットエラー:', error);
        showNotification(error.message, 'error');
    }
}

// =============================================
// UI機能
// =============================================

/**
 * ローディングオーバーレイの表示/非表示
 */
function showLoadingOverlay(show, message = 'ワインのデータを準備中...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
        
        if (show && message) {
            updateLoadingMessage(message);
        }
    }
}

/**
 * ローディングメッセージを更新
 */
function updateLoadingMessage(message) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        const messageElement = loadingOverlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

/**
 * 通知メッセージを表示
 */
function showNotification(message, type = 'info') {
    // 既存の通知があれば削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // ページに追加
    document.body.appendChild(notification);
    
    // 自動で削除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// =============================================
// データ読み込み機能（Firebase版）
// =============================================

/**
 * 直近のワインを読み込み
 */
async function loadRecentWines() {
    if (!isLoggedIn()) return;
    
    try {
        const wines = await getAllWines({ limit: 4, orderBy: 'updatedAt' });
        displayRecentWines(wines);
    } catch (error) {
        console.error('❌ 直近ワイン読み込みエラー:', error);
    }
}

/**
 * 直近ワインの表示
 */
function displayRecentWines(wines) {
    const recentWinesGrid = document.getElementById('recentWinesGrid');
    if (!recentWinesGrid) return;
    
    if (wines.length === 0) {
        recentWinesGrid.innerHTML = '<p class="no-records">まだワインの記録がありません</p>';
        return;
    }
    
    recentWinesGrid.innerHTML = wines.map(wine => `
        <div class="recent-wine-card" data-wine-id="${wine.id}" onclick="selectRecentWine('${wine.id}')">
            <h4>${wine.wineName}</h4>
            <p>生産者: ${wine.producer}</p>
            <p>種類: ${getWineTypeLabel(wine.wineType)}</p>
            <p>評価: ${getRatingStars(wine.avgRating)}</p>
            <p>記録数: ${wine.recordCount || 0}件</p>
        </div>
    `).join('');
}

/**
 * すべてのワイン記録を読み込み
 */
async function loadWineRecords() {
    if (!isLoggedIn()) return;
    
    try {
        const wines = await getAllWines();
        wineRecords = []; // 既存データをクリア
        
        // 各ワインの記録を取得してマージ
        for (const wine of wines) {
            const records = await getWineRecords(wine.id);
            const recordsWithWineInfo = records.map(record => ({
                ...record,
                wineName: wine.wineName,
                producer: wine.producer,
                country: wine.country,
                region: wine.region,
                wineType: wine.wineType
            }));
            wineRecords.push(...recordsWithWineInfo);
        }
        
        displayWineRecords();
    } catch (error) {
        console.error('❌ ワイン記録読み込みエラー:', error);
        showNotification('データの読み込みに失敗しました', 'error');
    }
}

/**
 * ワイン記録の表示
 */
function displayWineRecords() {
    const recordsDiv = document.getElementById('wineRecords');
    if (!recordsDiv) return;
    
    if (wineRecords.length === 0) {
        recordsDiv.innerHTML = '<div class="no-records">まだワインの記録がありません</div>';
        return;
    }
    
    // ここに記録表示のロジックを実装
    // 既存のコードを適用するか、新しい表示形式を作成
    recordsDiv.innerHTML = `<p>記録数: ${wineRecords.length}件</p>`;
}

/**
 * 必須項目にマーク表示
 */
function addRequiredMarks() {
    const requiredFields = ['wineName', 'recordDate'];
    
    requiredFields.forEach(fieldId => {
        const label = document.querySelector(`label[for="${fieldId}"]`);
        if (label && !label.querySelector('.required-mark')) {
            const mark = document.createElement('span');
            mark.className = 'required-mark';
            mark.textContent = ' *';
            mark.style.color = '#e91e63';
            mark.style.fontWeight = 'bold';
            label.appendChild(mark);
        }
    });
}

/**
 * ワインタイプ別の選択肢データ
 */
const wineTypeOptions = {
    '赤ワイン': {
        colors: [
            { value: 'deep-purple', label: '深い紫', color: '#4a148c' },
            { value: 'ruby-red', label: 'ルビー色', color: '#c62828' },
            { value: 'garnet-red', label: 'ガーネット色', color: '#8d2635' },
            { value: 'brick-red', label: 'レンガ色', color: '#a0522d' },
            { value: 'brown-red', label: '茶褐色', color: '#8b4513' }
        ],
        aromas: ['blackberry', 'cherry', 'plum', 'vanilla', 'oak', 'tobacco', 'leather', 'earth']
    },
    '白ワイン': {
        colors: [
            { value: 'light-yellow', label: '淡い黄色', color: '#fffacd' },
            { value: 'straw-yellow', label: '麦藁色', color: '#f0e68c' },
            { value: 'golden-yellow', label: '黄金色', color: '#ffd700' },
            { value: 'amber-yellow', label: '琥珀色', color: '#ffbf00' },
            { value: 'bronze-yellow', label: 'ブロンズ色', color: '#cd7f32' }
        ],
        aromas: ['citrus', 'apple', 'pear', 'peach', 'mineral', 'honey', 'butter', 'oak']
    },
    'ロゼワイン': {
        colors: [
            { value: 'pale-pink', label: '淡いピンク', color: '#ffc0cb' },
            { value: 'salmon-pink', label: 'サーモンピンク', color: '#fa8072' },
            { value: 'rose-pink', label: 'ローズピンク', color: '#ff69b4' },
            { value: 'coral-pink', label: 'コーラルピンク', color: '#ff7f50' },
            { value: 'deep-pink', label: '濃いピンク', color: '#ff1493' }
        ],
        aromas: ['strawberry', 'raspberry', 'rose', 'citrus', 'mineral', 'herbs']
    },
    'スパークリングワイン': {
        colors: [
            { value: 'pale-yellow', label: '淡い黄色', color: '#fffacd' },
            { value: 'golden-yellow', label: '黄金色', color: '#ffd700' },
            { value: 'rose-spark', label: 'ロゼ', color: '#ffc0cb' },
            { value: 'white-spark', label: '白', color: '#f8f8ff' }
        ],
        aromas: ['apple', 'pear', 'citrus', 'bread', 'yeast', 'mineral', 'flowers']
    }
};

/**
 * ワインタイプ変更時の処理
 */
function setupWineTypeHandlers() {
    const wineTypeInputs = document.querySelectorAll('input[name="wineType"]');
    wineTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked) {
                updateOptionsForWineType(this.value);
            }
        });
    });
}

/**
 * ワインタイプに応じて選択肢を更新
 */
function updateOptionsForWineType(wineType) {
    console.log('🍷 ワインタイプ変更:', wineType);
    
    const options = wineTypeOptions[wineType];
    if (!options) return;
    
    // 色の選択肢を更新
    updateColorOptions(options.colors);
    
    // 香りの選択肢を更新（将来的な拡張用）
    // updateAromaOptions(options.aromas);
}

/**
 * 色選択肢を更新
 */
function updateColorOptions(colors) {
    const colorCheckboxes = document.querySelector('.checkbox-grid');
    if (!colorCheckboxes) return;
    
    // 既存の色オプションを削除
    const existingColors = colorCheckboxes.querySelectorAll('.checkbox-item[data-type="color"]');
    existingColors.forEach(item => item.remove());
    
    // 新しい色オプションを追加
    colors.forEach(color => {
        const colorItem = document.createElement('div');
        colorItem.className = 'checkbox-item';
        colorItem.setAttribute('data-type', 'color');
        colorItem.style.backgroundColor = color.color;
        colorItem.style.color = isLightColor(color.color) ? '#333' : '#fff';
        
        colorItem.innerHTML = `
            <input type="checkbox" id="color_${color.value}" name="appearance" value="${color.label}">
            <span>${color.label}</span>
        `;
        
        colorCheckboxes.appendChild(colorItem);
    });
}

/**
 * 色が明るいかどうかを判定
 */
function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
}

// =============================================
// 自動保存とバリデーション機能
// =============================================

/**
 * 自動保存のイベントリスナー設定
 */
function setupAutoSaveListeners(form) {
    let autoSaveTimer;
    
    // フォームの全ての入力要素に対してイベントリスナーを設定
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        ['input', 'change', 'blur'].forEach(eventType => {
            input.addEventListener(eventType, () => {
                // デバウンス処理（1秒後に保存）
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(() => {
                    saveFormData();
                }, 1000);
            });
        });
    });
}

/**
 * フォームデータを自動保存
 */
function saveFormData() {
    const form = document.getElementById('wineRecordForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = {};
    
    // FormDataをオブジェクトに変換
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            // 同じキーが複数ある場合は配列にする
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    AutoSave.save(data);
}

/**
 * 保存されたフォームデータを復元
 */
function restoreFormData() {
    const savedData = AutoSave.load();
    if (!savedData) return false;
    
    const form = document.getElementById('wineRecordForm');
    if (!form) return false;
    
    try {
        Object.entries(savedData).forEach(([key, value]) => {
            const elements = form.querySelectorAll(`[name="${key}"]`);
            elements.forEach(element => {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    if (Array.isArray(value)) {
                        element.checked = value.includes(element.value);
                    } else {
                        element.checked = element.value === value;
                    }
                } else {
                    element.value = Array.isArray(value) ? value[0] : value;
                }
            });
        });
        
        console.log('📋 フォームデータを復元しました');
        showNotification('前回の入力内容を復元しました', 'info');
        return true;
    } catch (error) {
        console.warn('⚠️ フォームデータの復元に失敗:', error);
        return false;
    }
}

/**
 * 緩いバリデーション（必須項目 + 内容が全く空でない確認）
 */
function validateForm(formData) {
    const errors = [];
    
    // 必須項目チェック
    const wineName = formData.get('wineName')?.trim();
    const recordDate = formData.get('recordDate');
    
    if (!wineName) {
        errors.push('ワイン名は必須です');
    }
    
    if (!recordDate) {
        errors.push('記録日は必須です');
    }
    
    // 最低限の内容チェック（何かしらの情報があるか）
    const contentFields = [
        'producer', 'country', 'region', 'wineType', 'grapes',
        'notes', 'pairing', 'wineRating', 'pairingRating'
    ];
    
    const hasContent = contentFields.some(field => {
        const value = formData.get(field);
        return value && value.toString().trim() !== '' && value !== '0';
    });
    
    if (!hasContent) {
        errors.push('生産者、産地、ワインタイプ、ノート、評価のいずれかは入力してください');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * バリデーションエラーを表示
 */
function showValidationErrors(errors) {
    errors.forEach(error => {
        showNotification(error, 'error');
    });
}

// =============================================
// フォーム処理（Firebase版）
// =============================================

/**
 * フォーム送信処理
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!isLoggedIn()) {
        showNotification('ログインが必要です', 'error');
        showAuthModal();
        return;
    }
    
    const formData = new FormData(e.target);
    
    // バリデーション実行
    const validation = validateForm(formData);
    if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    try {
        showLoadingOverlay(true);
        
        if (isUpdateMode && currentRecordId) {
            // 既存記録の更新
            await updateExistingRecord(formData);
        } else if (isEditingWine && currentWineId) {
            // ワイン基本情報の更新
            await updateWineInfo(formData);
        } else {
            // 新規記録の追加
            await createNewRecord(formData);
        }
        
        // 成功時は自動保存データをクリア
        AutoSave.clear();
        hideForm();
        showNotification('記録が保存されました', 'success');
        
    } catch (error) {
        console.error('❌ フォーム送信エラー:', error);
        showNotification('保存に失敗しました', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

/**
 * 新規記録の作成
 */
async function createNewRecord(formData) {
    const recordData = await buildRecordDataFromForm(formData);
    
    // ワインが存在するかチェック
    let wineId = currentWineId;
    
    if (!wineId) {
        // 新しいワインを作成
        const wineData = extractWineDataFromForm(formData);
        wineId = await createWine(wineData);
    }
    
    // 記録を作成
    await createRecord(wineId, recordData);
}

/**
 * 既存記録の更新
 */
async function updateExistingRecord(formData) {
    const recordData = await buildRecordDataFromForm(formData);
    await updateRecord(currentWineId, currentRecordId, recordData);
}

/**
 * ワイン基本情報の更新
 */
async function updateWineInfo(formData) {
    const wineData = extractWineDataFromForm(formData);
    await updateWine(currentWineId, wineData);
}

// =============================================
// ユーティリティ関数
// =============================================

/**
 * ワインタイプのラベルを取得
 */
function getWineTypeLabel(wineType) {
    const typeLabels = {
        'red': '赤ワイン',
        'white': '白ワイン',
        'rose': 'ロゼワイン',
        'sparkling': 'スパークリングワイン',
        'dessert': 'デザートワイン',
        'fortified': '酒精強化ワイン'
    };
    return typeLabels[wineType] || wineType;
}

/**
 * 評価を星で表示
 */
function getRatingStars(rating) {
    if (!rating) return '未評価';
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `<span class="rating-stars">${stars}</span>`;
}

/**
 * フォームからワインデータを抽出
 */
function extractWineDataFromForm(formData) {
    return {
        wineName: formData.get('wineName') || '',
        producer: formData.get('producer') || '',
        country: formData.get('country') || '',
        region: formData.get('region') || '',
        vintage: parseInt(formData.get('vintage')) || null,
        price: parseFloat(formData.get('price')) || null,
        wineType: formData.get('wineType') || '',
        grapes: formData.get('grapes') || '',
        alcohol: parseFloat(formData.get('alcohol')) || null,
        soil: formData.get('soil') || '',
        climate: formData.get('climate') || '',
        history: formData.get('history') || '',
        winemaker: formData.get('winemaker') || '',
        saleUrl: formData.get('saleUrl') || '',
        dlaboUrl: formData.get('dlaboUrl') || '',
        referenceUrl: formData.get('referenceUrl') || ''
    };
}

/**
 * フォームから記録データを構築
 */
async function buildRecordDataFromForm(formData) {
    // 時間の処理
    let recordTime = formData.get('recordTime');
    if (recordTime === 'custom') {
        recordTime = formData.get('customTime');
    }
    
    return {
        recordDate: formData.get('recordDate') || new Date().toISOString().split('T')[0],
        daysFromOpening: parseInt(formData.get('daysFromOpening') || '0'),
        pairing: formData.get('pairing') || '',
        notes: formData.get('notes') || '',
        wineRating: parseInt(formData.get('wineRating')) || null,
        pairingRating: parseInt(formData.get('pairingRating')) || null,
        
        // 外観分析
        appearance: {
            colorTone: formData.get('colorTone') || '',
            colorIntensity: formData.get('colorIntensity') || '',
            clarity: formData.get('clarity') || '',
            viscosity: formData.get('viscosity') || ''
        },
        
        // 香り分析
        aroma: {
            firstImpression: {
                intensity: formData.get('firstImpressionIntensity') || '',
                notes: formData.get('firstImpressionNotes') || ''
            },
            afterSwirling: {
                intensity: formData.get('swirlingIntensity') || '',
                notes: formData.get('swirlingNotes') || ''
            },
            scores: {
                fruit: parseInt(formData.get('fruitScore') || '0'),
                floral: parseInt(formData.get('floralScore') || '0'),
                spice: parseInt(formData.get('spiceScore') || '0'),
                herb: parseInt(formData.get('herbScore') || '0'),
                earth: parseInt(formData.get('earthScore') || '0'),
                wood: parseInt(formData.get('woodScore') || '0'),
                other: parseInt(formData.get('otherScore') || '0')
            },
            detailed: {
                fruit: Array.from(formData.getAll('fruitAromas')),
                floral: Array.from(formData.getAll('floralAromas')),
                spice: Array.from(formData.getAll('spiceAromas')),
                herb: Array.from(formData.getAll('herbAromas')),
                earth: Array.from(formData.getAll('earthAromas')),
                wood: Array.from(formData.getAll('woodAromas')),
                other: Array.from(formData.getAll('otherAromas'))
            },
            customNotes: formData.get('customOtherAromas') || ''
        },
        
        // 味わい分析
        taste: {
            attack: {
                intensity: formData.get('attackIntensity') || '',
                notes: formData.get('attackNotes') || ''
            },
            middle: {
                complexity: formData.get('middleComplexity') || '',
                notes: formData.get('middleNotes') || ''
            },
            finish: {
                length: formData.get('finishLength') || '',
                seconds: parseInt(formData.get('finishSeconds') || '0'),
                notes: formData.get('finishNotes') || ''
            }
        },
        
        // 構成要素
        components: {
            acidity: {
                level: formData.get('acidityLevel') || '',
                types: Array.from(formData.getAll('acidityTypes'))
            },
            tannin: {
                level: formData.get('tanninLevel') || '',
                types: Array.from(formData.getAll('tanninTypes'))
            },
            sweetness: formData.get('sweetnessLevel') || '',
            body: formData.get('bodyWeight') || ''
        },
        
        // 時間・環境
        conditions: {
            recordTime: recordTime || '',
            customTimeMinutes: recordTime === 'custom' ? parseInt(formData.get('customTime') || '0') : null,
            temperature: parseFloat(formData.get('temperature')) || null,
            decanted: formData.get('decanted') || '',
            timeChangeNotes: formData.get('timeChangeNotes') || '',
            environment: {
                ambientTemp: parseFloat(formData.get('ambientTemp')) || null,
                humidity: parseFloat(formData.get('humidity')) || null,
                lighting: formData.get('lighting') || '',
                mood: formData.get('mood') || '',
                companions: formData.get('companions') || '',
                occasion: formData.get('occasion') || '',
                location: formData.get('location') || '',
                glassType: formData.get('glassType') || ''
            }
        }
    };
}

// =============================================
// 既存機能の継承（スタブ）
// =============================================

// 以下の関数は既存のコードから移植する必要があります
// ここではスタブとして定義

function selectRecentWine(wineId) {
    console.log('🍷 直近ワイン選択:', wineId);
    // TODO: 実装
}

function showNewWineForm() {
    console.log('📝 新規ワインフォーム表示');
    
    if (!isLoggedIn()) {
        showNotification('ログインが必要です', 'error');
        showAuthModal();
        return;
    }
    
    resetForm();
    enableAllFormSections();
    showForm('新しいワインを記録');
    currentWineId = null;
    isUpdateMode = false;
    isEditingWine = false;
    
    // 選択を解除
    document.querySelectorAll('.recent-wine-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 自動保存データがあるかチェックして復元
    if (AutoSave.hasData()) {
        setTimeout(() => {
            if (confirm('前回の入力途中のデータがあります。復元しますか？')) {
                restoreFormData();
            } else {
                AutoSave.clear();
            }
        }, 500);
    }
}

function hideForm() {
    console.log('❌ フォーム非表示');
    const wineForm = document.getElementById('wineForm');
    if (wineForm) {
        wineForm.classList.remove('active');
    }
    resetForm();
}

function showForm(title) {
    const formTitle = document.getElementById('formTitle');
    const wineForm = document.getElementById('wineForm');
    
    if (formTitle) {
        formTitle.textContent = title;
    }
    
    if (wineForm) {
        wineForm.classList.add('active');
        wineForm.scrollIntoView({ behavior: 'smooth' });
    }
}

function resetForm() {
    const wineRecordForm = document.getElementById('wineRecordForm');
    if (wineRecordForm) {
        wineRecordForm.reset();
    }
    
    // 今日の日付を設定
    const recordDateInput = document.getElementById('recordDate');
    if (recordDateInput) {
        recordDateInput.valueAsDate = new Date();
    }
    
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
        customTimeInput.value = '';
    }
    
    // 編集モードをリセット
    currentWineId = null;
    currentRecordId = null;
    isUpdateMode = false;
    isEditingWine = false;
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
}

function initializeTheme() {
    console.log('🎨 テーマ初期化');
    // TODO: 実装
}

function toggleTheme() {
    console.log('🎨 テーマ切り替え');
    // TODO: 実装
}

function initializePaintCanvas() {
    console.log('🎨 ペイントキャンバス初期化');
    
    paintCanvas = document.getElementById('paintCanvas');
    if (!paintCanvas) return;
    
    paintCtx = paintCanvas.getContext('2d');
    
    // キャンバスサイズ設定
    paintCanvas.width = 400;
    paintCanvas.height = 300;
    
    // 背景を白に設定
    paintCtx.fillStyle = 'white';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    
    // 描画設定
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    
    // マウスイベント
    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseout', stopDrawing);
    
    // タッチイベント（スマホ対応）
    paintCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    paintCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    paintCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // ペイントコントロールのイベントリスナー
    const clearBtn = document.getElementById('clearCanvas');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCanvas);
    }
    
    const saveBtn = document.getElementById('saveDrawing');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDrawing);
    }
}

function startDrawing(e) {
    isDrawing = true;
    const rect = paintCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
    updateDrawingSettings();
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = paintCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    paintCtx.beginPath();
}

// タッチイベントハンドラー（スマホ対応）
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    paintCanvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    paintCanvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    paintCanvas.dispatchEvent(mouseEvent);
}

function updateDrawingSettings() {
    const brushSize = document.getElementById('brushSize');
    const brushColor = document.getElementById('brushColor');
    
    if (brushSize) {
        paintCtx.lineWidth = brushSize.value;
    }
    
    if (brushColor) {
        paintCtx.strokeStyle = brushColor.value;
    }
}

function displaySavedDrawings() {
    // 保存された絵の表示処理（将来の実装用）
    console.log('💾 保存された絵を表示:', savedDrawings.length, '件');
}

function initializeChart() {
    console.log('📊 チャート初期化');
    // TODO: 実装
}

function showMultipleImagePreview(input, previewId) {
    console.log('🖼️ 画像プレビュー:', previewId);
    // TODO: 実装
}

function updateScoreDisplay(slider) {
    console.log('📊 スコア表示更新:', slider.id, slider.value);
    
    // スライダーに対応する数値表示要素を探す
    const scoreValueId = slider.id.replace('Score', 'Value');
    const scoreValueElement = document.getElementById(scoreValueId);
    
    if (scoreValueElement) {
        scoreValueElement.textContent = slider.value;
    } else {
        // IDが見つからない場合、隣接する.score-value要素を探す
        const parentElement = slider.closest('.aroma-score-item');
        if (parentElement) {
            const scoreValue = parentElement.querySelector('.score-value');
            if (scoreValue) {
                scoreValue.textContent = slider.value;
            }
        }
    }
}

function clearCanvas() {
    console.log('🎨 キャンバスクリア');
    if (paintCanvas && paintCtx) {
        paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    }
}

function saveDrawing() {
    console.log('🎨 絵を保存');
    if (paintCanvas) {
        const imageData = paintCanvas.toDataURL('image/png');
        const timestamp = new Date().toISOString();
        const drawingData = {
            data: imageData,
            timestamp: timestamp
        };
        
        savedDrawings.push(drawingData);
        displaySavedDrawings();
        showNotification('絵を保存しました', 'success');
    }
}

function updateBrushSize() {
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    
    if (brushSizeSlider && brushSizeValue) {
        brushSizeValue.textContent = brushSizeSlider.value;
    }
}

function updateBrushColor() {
    console.log('🎨 ブラシカラー更新');
    // 色は描画時に取得するため、特別な処理は不要
}

function filterRecords() {
    console.log('🔍 記録フィルタリング');
    // TODO: 実装
}

function sortRecords() {
    console.log('📊 記録ソート');
    // TODO: 実装
}

function changeItemsPerPage() {
    console.log('📄 表示件数変更');
    // TODO: 実装
}

function prevPage() {
    console.log('⬅️ 前のページ');
    // TODO: 実装
}

function nextPage() {
    console.log('➡️ 次のページ');
    // TODO: 実装
}

async function exportData() {
    if (!isLoggedIn()) {
        showNotification('ログインが必要です', 'error');
        return;
    }
    
    try {
        showLoadingOverlay(true);
        const exportData = await exportUserData();
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `mywinememory_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('データをエクスポートしました', 'success');
    } catch (error) {
        console.error('❌ エクスポートエラー:', error);
        showNotification('エクスポートに失敗しました', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

console.log('🚀 MyWineMemory - Firebase版ロード完了');