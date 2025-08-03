const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getMessaging} = require("firebase-admin/messaging");

// Firebase Admin初期化
initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// 日次クイズ通知（毎日19時に実行）
exports.sendDailyQuizNotification = onSchedule({
  schedule: "0 19 * * *",
  timeZone: "Asia/Tokyo",
  region: "asia-northeast1",
}, async (event) => {
  console.log("Daily quiz notification started");

  try {
    // 通知が有効なユーザーを取得
    const usersQuery = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

    const notifications = [];

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // ユーザーの通知設定をチェック
      if (!shouldSendNotificationToday(userData)) {
        continue;
      }

      try {
        // ユーザーのワインデータからクイズ生成
        const quiz = await generateDailyQuizForUser(userId);

        if (quiz && userData.fcmToken) {
          const message = {
            token: userData.fcmToken,
            notification: {
              title: "🍷 今日のワインクイズ",
              body: quiz.message,
            },
            data: {
              type: "daily_quiz",
              quizId: quiz.id,
              wineName: quiz.wineName || "",
              url: `/quiz.html?id=${quiz.id}`,
            },
            android: {
              notification: {
                icon: "ic_wine",
                color: "#667eea",
                clickAction: "FLUTTER_NOTIFICATION_CLICK",
              },
            },
            apns: {
              payload: {
                aps: {
                  category: "wine_quiz",
                  sound: "default",
                },
              },
            },
            webpush: {
              fcmOptions: {
                link: `https://yourapp.com/quiz.html?id=${quiz.id}`,
              },
              notification: {
                icon: "/icons/icon-192.png",
                badge: "/icons/icon-72.png",
                vibrate: [200, 100, 200],
                actions: [
                  {
                    action: "open_quiz",
                    title: "クイズに挑戦",
                  },
                ],
              },
            },
          };

          notifications.push(messaging.send(message));

          // 通知履歴を保存
          await saveNotificationHistory(userId, quiz);
        }
      } catch (userError) {
        console.error(`Error for user ${userId}:`, userError);
      }
    }

    // 一括送信
    const results = await Promise.allSettled(notifications);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    console.log(`Daily notifications sent: ${successCount} success, ${failureCount} failed`);

    return {
      success: true,
      sent: successCount,
      failed: failureCount,
    };
  } catch (error) {
    console.error("Daily notification error:", error);
    throw error;
  }
});

// 新しいワイン記録時のフォローアップ通知
exports.sendFollowupNotification = onDocumentCreated({
  document: "wine_records/{wineId}",
  region: "asia-northeast1",
}, async (event) => {
  const wineData = event.data.data();
  const userId = wineData.userId;

  console.log(`New wine record created for user: ${userId}`);

  try {
    // 24時間後にフォローアップ通知をスケジュール
    await scheduleFollowupNotification(userId, wineData, 24);

    return {success: true};
  } catch (error) {
    console.error("Followup notification error:", error);
    throw error;
  }
});

// 週次振り返り通知（日曜日20時）
exports.sendWeeklyReviewNotification = onSchedule({
  schedule: "0 20 * * 0",
  timeZone: "Asia/Tokyo",
  region: "asia-northeast1",
}, async (event) => {
  console.log("Weekly review notification started");

  try {
    const usersQuery = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

    const notifications = [];

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // 今週のワイン記録数を取得
      const weeklyStats = await getWeeklyStats(userId);

      if (weeklyStats.count > 0 && userData.fcmToken) {
        const message = {
          token: userData.fcmToken,
          notification: {
            title: "📊 今週の振り返り",
            body: `今週は${weeklyStats.count}本のワインを記録しました。クイズで復習しませんか？`,
          },
          data: {
            type: "weekly_review",
            wineCount: weeklyStats.count.toString(),
            url: "/quiz.html?type=weekly_review",
          },
        };

        notifications.push(messaging.send(message));
      }
    }

    const results = await Promise.allSettled(notifications);
    const successCount = results.filter((r) => r.status === "fulfilled").length;

    console.log(`Weekly review notifications sent: ${successCount}`);

    return {success: true, sent: successCount};
  } catch (error) {
    console.error("Weekly review notification error:", error);
    throw error;
  }
});

// ストリーク維持通知（21時）
exports.sendStreakReminderNotification = onSchedule({
  schedule: "0 21 * * *",
  timeZone: "Asia/Tokyo",
  region: "asia-northeast1",
}, async (event) => {
  console.log("Streak reminder notification started");

  try {
    const usersQuery = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .where("fcmToken", "!=", null)
        .get();

    const notifications = [];

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // 今日まだクイズをしていないユーザーを特定
      const hasQuizToday = await checkTodayQuizActivity(userId);

      if (!hasQuizToday && userData.fcmToken) {
        const currentStreak = await getCurrentStreak(userId);

        if (currentStreak > 0) {
          const message = {
            token: userData.fcmToken,
            notification: {
              title: "🔥 ストリーク維持",
              body: `${currentStreak}日連続記録中！今日もクイズで継続しましょう`,
            },
            data: {
              type: "streak_reminder",
              streak: currentStreak.toString(),
              url: "/quiz.html?type=streak",
            },
          };

          notifications.push(messaging.send(message));
        }
      }
    }

    const results = await Promise.allSettled(notifications);
    const successCount = results.filter((r) => r.status === "fulfilled").length;

    console.log(`Streak reminder notifications sent: ${successCount}`);

    return {success: true, sent: successCount};
  } catch (error) {
    console.error("Streak reminder notification error:", error);
    throw error;
  }
});

// ユーザーのワインデータからクイズを生成
async function generateDailyQuizForUser(userId) {
  try {
    // ユーザーのワイン記録を取得（最新10件）
    const wineRecords = await db.collection("wine_records")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

    if (wineRecords.empty) {
      return null;
    }

    // ランダムに1つ選択
    const wines = wineRecords.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const selectedWine = wines[Math.floor(Math.random() * wines.length)];

    // クイズタイプをランダム選択
    const quizTypes = [
      {
        type: "wine_identification",
        message: `${selectedWine.producer}の${selectedWine.vintage}年、どのワインか覚えてる？`,
      },
      {
        type: "tasting_recall",
        message: `${selectedWine.wineName}のテイスティングノート、まだ覚えてる？`,
      },
      {
        type: "price_guess",
        message: `${selectedWine.wineName}、いくらで買ったか覚えてる？`,
      },
      {
        type: "rating_reason",
        message: `${selectedWine.wineName}に${selectedWine.wineRating}/5をつけた理由は？`,
      },
    ];

    const selectedQuizType = quizTypes[Math.floor(Math.random() * quizTypes.length)];

    // クイズデータを保存
    const quizRef = await db.collection("daily_quiz").add({
      userId: userId,
      wineId: selectedWine.id,
      type: selectedQuizType.type,
      wineName: selectedWine.wineName,
      createdAt: new Date(),
      isCompleted: false,
    });

    return {
      id: quizRef.id,
      wineName: selectedWine.wineName,
      message: selectedQuizType.message,
      type: selectedQuizType.type,
    };
  } catch (error) {
    console.error("Quiz generation error:", error);
    return null;
  }
}

// 通知を送信すべきかチェック
function shouldSendNotificationToday(userData) {
  const frequency = userData.notificationFrequency || "daily";
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

  switch (frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "three_times_week":
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
    default:
      return true;
  }
}

// 通知履歴を保存
async function saveNotificationHistory(userId, quiz) {
  await db.collection("notification_history").add({
    userId: userId,
    quizId: quiz.id,
    type: "daily_quiz",
    sentAt: new Date(),
    wineName: quiz.wineName,
  });
}

// フォローアップ通知のスケジュール
async function scheduleFollowupNotification(userId, wineData, hoursDelay) {
  const scheduledTime = new Date();
  scheduledTime.setHours(scheduledTime.getHours() + hoursDelay);

  await db.collection("scheduled_notifications").add({
    userId: userId,
    wineId: wineData.id || "",
    wineName: wineData.wineName || "",
    type: "followup",
    scheduledFor: scheduledTime,
    isProcessed: false,
    createdAt: new Date(),
  });
}

// 週次統計取得
async function getWeeklyStats(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const query = await db.collection("wine_records")
      .where("userId", "==", userId)
      .where("createdAt", ">=", oneWeekAgo)
      .get();

  return {
    count: query.size,
  };
}

// 今日のクイズ活動をチェック
async function checkTodayQuizActivity(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = await db.collection("quiz_history")
      .where("userId", "==", userId)
      .where("completedAt", ">=", today)
      .limit(1)
      .get();

  return !query.empty;
}

// 現在のストリーク取得
async function getCurrentStreak(userId) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    return userData?.currentStreak || 0;
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
}

console.log("Cloud Functions loaded successfully");