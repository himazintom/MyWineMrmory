// Firebase Authentication サービス
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from './firebase-config.js';

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();

// =============================================
// 認証状態の管理
// =============================================

/**
 * 認証状態の監視
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ユーザー情報をFirestoreに保存/更新
      await saveUserToFirestore(user);
      console.log('👤 ユーザーがログインしました:', user.email);
    } else {
      console.log('👤 ユーザーがログアウトしました');
    }
    callback(user);
  });
};

/**
 * 現在のユーザーを取得
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * ログイン状態を確認
 */
export const isLoggedIn = () => {
  return !!auth.currentUser;
};

// =============================================
// ユーザー登録・ログイン
// =============================================

/**
 * メールアドレスとパスワードでユーザー登録
 */
export const signUpWithEmail = async (email, password, displayName = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // プロフィールを更新
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // メール確認を送信
    await sendEmailVerification(user);
    
    console.log('✅ ユーザー登録成功:', user.email);
    return user;
  } catch (error) {
    console.error('❌ ユーザー登録エラー:', error);
    throw handleAuthError(error);
  }
};

/**
 * メールアドレスとパスワードでログイン
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ ログイン成功:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ ログインエラー:', error);
    throw handleAuthError(error);
  }
};

/**
 * Googleでログイン
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log('✅ Googleログイン成功:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Googleログインエラー:', error);
    throw handleAuthError(error);
  }
};

/**
 * ログアウト
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ ログアウト成功');
  } catch (error) {
    console.error('❌ ログアウトエラー:', error);
    throw handleAuthError(error);
  }
};

// =============================================
// パスワード管理
// =============================================

/**
 * パスワードリセットメールを送信
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ パスワードリセットメール送信:', email);
  } catch (error) {
    console.error('❌ パスワードリセットエラー:', error);
    throw handleAuthError(error);
  }
};

// =============================================
// プロフィール管理
// =============================================

/**
 * プロフィールを更新
 */
export const updateUserProfile = async (profileData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('ユーザーがログインしていません');
  
  try {
    // Firebase Authのプロフィールを更新
    await updateProfile(user, profileData);
    
    // Firestoreのユーザー情報も更新
    await saveUserToFirestore(user, profileData);
    
    console.log('✅ プロフィール更新成功');
    return user;
  } catch (error) {
    console.error('❌ プロフィール更新エラー:', error);
    throw handleAuthError(error);
  }
};

/**
 * ユーザーアカウントを削除
 */
export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('ユーザーがログインしていません');
  
  try {
    // Firestoreのユーザーデータを削除
    // 注意: この処理は本番環境では慎重に実装する必要があります
    const userDoc = doc(db, 'users', user.uid);
    await deleteDoc(userDoc);
    
    // Firebase Authからユーザーを削除
    await deleteUser(user);
    
    console.log('✅ アカウント削除成功');
  } catch (error) {
    console.error('❌ アカウント削除エラー:', error);
    throw handleAuthError(error);
  }
};

// =============================================
// Firestore連携
// =============================================

/**
 * ユーザー情報をFirestoreに保存
 */
const saveUserToFirestore = async (user, additionalData = {}) => {
  const userDoc = doc(db, 'users', user.uid);
  
  try {
    // 既存のユーザー情報を取得
    const existingUser = await getDoc(userDoc);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      ...additionalData,
      updatedAt: serverTimestamp()
    };
    
    // 新規ユーザーの場合はcreatedAtを追加
    if (!existingUser.exists()) {
      userData.createdAt = serverTimestamp();
      userData.preferences = {
        theme: 'light',
        language: 'ja',
        defaultGlassType: 'universal',
        units: 'metric'
      };
    }
    
    await setDoc(userDoc, userData, { merge: true });
    console.log('💾 ユーザー情報をFirestoreに保存しました');
  } catch (error) {
    console.error('❌ Firestore保存エラー:', error);
  }
};

/**
 * Firestoreからユーザー情報を取得
 */
export const getUserFromFirestore = async (userId = null) => {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) throw new Error('ユーザーIDが指定されていません');
  
  try {
    const userDoc = doc(db, 'users', uid);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('ユーザー情報が見つかりません');
    }
  } catch (error) {
    console.error('❌ ユーザー情報取得エラー:', error);
    throw error;
  }
};

// =============================================
// エラーハンドリング
// =============================================

/**
 * Firebase Authエラーを日本語メッセージに変換
 */
const handleAuthError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'このメールアドレスのユーザーは見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードは6文字以上で入力してください',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/too-many-requests': '試行回数が多すぎます。しばらく時間をおいてから再試行してください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました',
    'auth/popup-closed-by-user': 'ログインがキャンセルされました',
    'auth/cancelled-popup-request': 'ログインがキャンセルされました'
  };
  
  const message = errorMessages[error.code] || error.message || '不明なエラーが発生しました';
  
  return {
    code: error.code,
    message: message,
    originalError: error
  };
};

// =============================================
// ユーティリティ関数
// =============================================

/**
 * メールアドレス確認状態をチェック
 */
export const checkEmailVerification = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

/**
 * メール確認を再送信
 */
export const resendEmailVerification = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('ユーザーがログインしていません');
  
  try {
    await sendEmailVerification(user);
    console.log('✅ 確認メール再送信成功');
  } catch (error) {
    console.error('❌ 確認メール再送信エラー:', error);
    throw handleAuthError(error);
  }
};