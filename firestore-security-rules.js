// Firestore セキュリティルール
// Firebase Console → Firestore Database → ルール で設定

// ===============================================
// 開発・テスト用ルール（緩い設定）
// ===============================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証されたユーザーのみアクセス可能
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// ===============================================
// 本番用ルール（厳密な設定）
// ===============================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ワイン情報
      match /wines/{wineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // テイスティング記録
        match /records/{recordId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      
      // 統計データ
      match /stats/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // 共有データ（将来的な機能用）
    match /public/{document} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ
    }
  }
}
*/

// ===============================================
// フィールド検証ルール（高度な設定）
// ===============================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /wines/{wineId} {
        allow read, write: if request.auth != null && 
                           request.auth.uid == userId &&
                           validateWineData(request.resource.data);
        
        match /records/{recordId} {
          allow read, write: if request.auth != null && 
                             request.auth.uid == userId &&
                             validateRecordData(request.resource.data);
        }
      }
    }
  }
  
  // ワインデータ検証関数
  function validateWineData(data) {
    return data.keys().hasAll(['wineName', 'producer']) &&
           data.wineName is string &&
           data.producer is string &&
           data.wineName.size() > 0 &&
           data.producer.size() > 0;
  }
  
  // 記録データ検証関数
  function validateRecordData(data) {
    return data.keys().hasAll(['recordDate']) &&
           data.recordDate is timestamp &&
           (data.wineRating == null || (data.wineRating is number && data.wineRating >= 1 && data.wineRating <= 5));
  }
}
*/