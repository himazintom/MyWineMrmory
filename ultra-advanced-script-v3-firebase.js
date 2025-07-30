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

// =============================================
// 初期化
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MyWineMemory - Firebase版を初期化中...');
    
    // 今日の日付を設定
    const recordDateInput = document.getElementById('recordDate');
    if (recordDateInput) {
        recordDateInput.valueAsDate = new Date();
    }
    
    // テーマ初期化
    initializeTheme();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 認証状態の監視
    setupAuthListener();
    
    // ペイントキャンバスの初期化
    initializePaintCanvas();
    
    // チャート初期化
    initializeChart();
    
    console.log('✅ 初期化完了');
});

// =============================================
// 認証機能
// =============================================

/**
 * 認証状態の監視設定
 */
function setupAuthListener() {
    onAuthChange(async (user) => {
        currentUser = user;
        updateAuthUI(user);
        
        if (user) {
            console.log('👤 ユーザーログイン:', user.email);
            showLoadingOverlay(true);
            
            try {
                // ユーザーデータを読み込み
                await loadUserData();
            } catch (error) {
                console.error('❌ ユーザーデータ読み込みエラー:', error);
                showNotification('データの読み込みに失敗しました', 'error');
            } finally {
                showLoadingOverlay(false);
            }
        } else {
            console.log('👤 ユーザーログアウト');
            clearUserData();
        }
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
function showLoadingOverlay(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
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
    
    try {
        showLoadingOverlay(true);
        
        const formData = new FormData(e.target);
        
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
    // TODO: 実装
}

function hideForm() {
    console.log('❌ フォーム非表示');
    // TODO: 実装
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
    // TODO: 実装
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
    console.log('📊 スコア表示更新');
    // TODO: 実装
}

function clearCanvas() {
    console.log('🎨 キャンバスクリア');
    // TODO: 実装
}

function saveDrawing() {
    console.log('🎨 絵を保存');
    // TODO: 実装
}

function updateBrushSize() {
    console.log('🖌️ ブラシサイズ更新');
    // TODO: 実装
}

function updateBrushColor() {
    console.log('🎨 ブラシカラー更新');
    // TODO: 実装
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