/**
 * COOPテストを実行する関数
 * アクティブなタブにメッセージを送信してテストを開始
 */
async function executeCOOPTest(): Promise<void> {
  try {
    // アクティブなタブを取得
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.id) {
      console.error("タブIDが見つかりません");
      return;
    }

    // コンテンツスクリプトにCOOPテスト実行メッセージを送信
    await chrome.tabs.sendMessage(tab.id, {
      action: "EXECUTE_COOP_TEST",
    });

    // ポップアップを閉じる
    window.close();
  } catch (error) {
    console.error("COOPテスト実行中にエラーが発生:", error);
  }
}

/**
 * DOMが読み込まれた後にイベントリスナーを設定
 */
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("executeCOOPTest");
  if (button) {
    button.addEventListener("click", executeCOOPTest);
  } else {
    console.error("COOPテスト実行ボタンが見つかりません");
  }
});
