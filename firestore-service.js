// Firestore データアクセス層
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from './firebase-config.js';

// ユーザーIDを取得
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーがログインしていません');
  }
  return user.uid;
};

// =============================================
// ワイン基本情報の操作
// =============================================

/**
 * 新しいワインを作成
 */
export const createWine = async (wineData) => {
  const userId = getCurrentUserId();
  const winesCollection = collection(db, 'users', userId, 'wines');
  
  const wine = {
    ...wineData,
    recordCount: 0,
    avgRating: 0,
    lastRecordDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(winesCollection, wine);
  console.log('🍷 ワインが作成されました:', docRef.id);
  return docRef.id;
};

/**
 * ワイン情報を取得
 */
export const getWine = async (wineId) => {
  const userId = getCurrentUserId();
  const wineDoc = doc(db, 'users', userId, 'wines', wineId);
  const docSnap = await getDoc(wineDoc);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('ワインが見つかりません');
  }
};

/**
 * すべてのワインを取得
 */
export const getAllWines = async (options = {}) => {
  const userId = getCurrentUserId();
  const winesCollection = collection(db, 'users', userId, 'wines');
  
  let q = query(winesCollection);
  
  // ソート
  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
  } else {
    q = query(q, orderBy('updatedAt', 'desc'));
  }
  
  // 制限
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  // ページネーション
  if (options.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }
  
  const querySnapshot = await getDocs(q);
  const wines = [];
  querySnapshot.forEach((doc) => {
    wines.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`🍷 ${wines.length}本のワインを取得しました`);
  return wines;
};

/**
 * ワイン情報を更新
 */
export const updateWine = async (wineId, updateData) => {
  const userId = getCurrentUserId();
  const wineDoc = doc(db, 'users', userId, 'wines', wineId);
  
  const updatedData = {
    ...updateData,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(wineDoc, updatedData);
  console.log('🍷 ワイン情報が更新されました:', wineId);
};

/**
 * ワインを削除（記録も含む）
 */
export const deleteWine = async (wineId) => {
  const userId = getCurrentUserId();
  
  // トランザクションで削除
  await runTransaction(db, async (transaction) => {
    // まず記録をすべて削除
    const recordsCollection = collection(db, 'users', userId, 'wines', wineId, 'records');
    const recordsSnapshot = await getDocs(recordsCollection);
    
    recordsSnapshot.forEach((recordDoc) => {
      transaction.delete(recordDoc.ref);
    });
    
    // ワイン情報を削除
    const wineDoc = doc(db, 'users', userId, 'wines', wineId);
    transaction.delete(wineDoc);
  });
  
  console.log('🗑️ ワインと全ての記録が削除されました:', wineId);
};

// =============================================
// テイスティング記録の操作
// =============================================

/**
 * 新しいテイスティング記録を作成
 */
export const createRecord = async (wineId, recordData) => {
  const userId = getCurrentUserId();
  const recordsCollection = collection(db, 'users', userId, 'wines', wineId, 'records');
  
  const record = {
    ...recordData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timestamp: serverTimestamp() // 下位互換性用
  };
  
  // トランザクションで記録追加とワイン情報更新
  const result = await runTransaction(db, async (transaction) => {
    // 記録を追加
    const recordRef = doc(recordsCollection);
    transaction.set(recordRef, record);
    
    // ワインの統計情報を更新
    const wineDoc = doc(db, 'users', userId, 'wines', wineId);
    const wineSnap = await transaction.get(wineDoc);
    
    if (wineSnap.exists()) {
      const wineData = wineSnap.data();
      const newRecordCount = (wineData.recordCount || 0) + 1;
      
      // 平均評価を計算（wineRatingがある場合のみ）
      let newAvgRating = wineData.avgRating || 0;
      if (recordData.wineRating) {
        const currentTotal = (wineData.avgRating || 0) * (wineData.recordCount || 0);
        newAvgRating = (currentTotal + recordData.wineRating) / newRecordCount;
      }
      
      transaction.update(wineDoc, {
        recordCount: newRecordCount,
        avgRating: newAvgRating,
        lastRecordDate: record.recordDate || serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return recordRef.id;
  });
  
  console.log('📝 テイスティング記録が作成されました:', result);
  return result;
};

/**
 * 記録を取得
 */
export const getRecord = async (wineId, recordId) => {
  const userId = getCurrentUserId();
  const recordDoc = doc(db, 'users', userId, 'wines', wineId, 'records', recordId);
  const docSnap = await getDoc(recordDoc);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('記録が見つかりません');
  }
};

/**
 * ワインの全記録を取得
 */
export const getWineRecords = async (wineId, options = {}) => {
  const userId = getCurrentUserId();
  const recordsCollection = collection(db, 'users', userId, 'wines', wineId, 'records');
  
  let q = query(recordsCollection);
  
  // ソート
  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
  } else {
    q = query(q, orderBy('recordDate', 'desc'));
  }
  
  // 制限
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  const querySnapshot = await getDocs(q);
  const records = [];
  querySnapshot.forEach((doc) => {
    records.push({ id: doc.id, wineId, ...doc.data() });
  });
  
  console.log(`📝 ${records.length}件の記録を取得しました`);
  return records;
};

/**
 * 全ての記録を取得（全ワイン対象）
 */
export const getAllRecords = async (options = {}) => {
  const userId = getCurrentUserId();
  const wines = await getAllWines();
  const allRecords = [];
  
  // 各ワインの記録を取得
  for (const wine of wines) {
    const records = await getWineRecords(wine.id, options);
    allRecords.push(...records);
  }
  
  // 日付でソート
  allRecords.sort((a, b) => {
    const dateA = a.recordDate?.toDate?.() || new Date(a.recordDate);
    const dateB = b.recordDate?.toDate?.() || new Date(b.recordDate);
    return dateB - dateA;
  });
  
  return allRecords;
};

/**
 * 記録を更新
 */
export const updateRecord = async (wineId, recordId, updateData) => {
  const userId = getCurrentUserId();
  const recordDoc = doc(db, 'users', userId, 'wines', wineId, 'records', recordId);
  
  const updatedData = {
    ...updateData,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(recordDoc, updatedData);
  console.log('📝 記録が更新されました:', recordId);
  
  // 評価が変更された場合、ワインの平均評価を再計算
  if (updateData.wineRating !== undefined) {
    await recalculateWineStats(wineId);
  }
};

/**
 * 記録を削除
 */
export const deleteRecord = async (wineId, recordId) => {
  const userId = getCurrentUserId();
  
  await runTransaction(db, async (transaction) => {
    // 記録を削除
    const recordDoc = doc(db, 'users', userId, 'wines', wineId, 'records', recordId);
    transaction.delete(recordDoc);
    
    // ワインの統計情報を更新
    const wineDoc = doc(db, 'users', userId, 'wines', wineId);
    const wineSnap = await transaction.get(wineDoc);
    
    if (wineSnap.exists()) {
      const wineData = wineSnap.data();
      const newRecordCount = Math.max((wineData.recordCount || 0) - 1, 0);
      
      transaction.update(wineDoc, {
        recordCount: newRecordCount,
        updatedAt: serverTimestamp()
      });
    }
  });
  
  console.log('🗑️ 記録が削除されました:', recordId);
  
  // 平均評価を再計算
  await recalculateWineStats(wineId);
};

// =============================================
// ユーティリティ関数
// =============================================

/**
 * ワインの統計を再計算
 */
export const recalculateWineStats = async (wineId) => {
  const userId = getCurrentUserId();
  const records = await getWineRecords(wineId);
  
  const recordCount = records.length;
  const ratingsWithScore = records.filter(r => r.wineRating);
  const avgRating = ratingsWithScore.length > 0 
    ? ratingsWithScore.reduce((sum, r) => sum + r.wineRating, 0) / ratingsWithScore.length 
    : 0;
  
  const lastRecord = records.sort((a, b) => {
    const dateA = a.recordDate?.toDate?.() || new Date(a.recordDate);
    const dateB = b.recordDate?.toDate?.() || new Date(b.recordDate);
    return dateB - dateA;
  })[0];
  
  const wineDoc = doc(db, 'users', userId, 'wines', wineId);
  await updateDoc(wineDoc, {
    recordCount,
    avgRating,
    lastRecordDate: lastRecord?.recordDate || null,
    updatedAt: serverTimestamp()
  });
  
  console.log('📊 ワイン統計が再計算されました:', wineId);
};

/**
 * 検索機能
 */
export const searchWines = async (searchTerm) => {
  const wines = await getAllWines();
  
  const filtered = wines.filter(wine => 
    wine.wineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.producer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log(`🔍 "${searchTerm}" で ${filtered.length} 件見つかりました`);
  return filtered;
};

/**
 * リアルタイムリスナー設定
 */
export const onWinesChange = (callback) => {
  const userId = getCurrentUserId();
  const winesCollection = collection(db, 'users', userId, 'wines');
  const q = query(winesCollection, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const wines = [];
    snapshot.forEach((doc) => {
      wines.push({ id: doc.id, ...doc.data() });
    });
    callback(wines);
  });
};

/**
 * データのエクスポート
 */
export const exportUserData = async () => {
  const wines = await getAllWines();
  const exportData = {
    wines: [],
    exportDate: new Date().toISOString(),
    version: '2.0'
  };
  
  for (const wine of wines) {
    const records = await getWineRecords(wine.id);
    exportData.wines.push({
      ...wine,
      records
    });
  }
  
  console.log('📤 データエクスポート完了');
  return exportData;
};

/**
 * ワイン名と生産者で検索
 */
export const searchWinesByNameAndProducer = async (wineName, producer) => {
  const userId = getCurrentUserId();
  const winesCollection = collection(db, 'users', userId, 'wines');
  
  let q = query(winesCollection);
  
  if (wineName) {
    q = query(q, where('wineName', '==', wineName));
  }
  
  if (producer) {
    q = query(q, where('producer', '==', producer));
  }
  
  const querySnapshot = await getDocs(q);
  const wines = [];
  
  querySnapshot.forEach((doc) => {
    wines.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`🔍 検索結果: ${wines.length}件`, { wineName, producer });
  return wines;
};