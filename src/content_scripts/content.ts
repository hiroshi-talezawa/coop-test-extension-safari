/**
 * コンテンツスクリプトのメイン処理
 * attack.jsをページに注入し、ポップアップからのメッセージを処理
 */

/**
 * attack.jsとresult.jsをページに注入する
 */
function injectScripts(): void {
  const INJECTED_FLAG = "data-coop-attack-injected";  // 関数内に移動
  try {
    // 既に注入済みかチェック
    const existing = document.documentElement.getAttribute(INJECTED_FLAG);
    if (existing === "true") {
      return;
    }

    // attack.jsを注入
    const attackScript = document.createElement("script");
    attackScript.src = chrome.runtime.getURL("content_scripts/attack.js");
    attackScript.async = false;

    // 注入完了時の処理
    attackScript.onload = () => {
      document.documentElement.setAttribute(INJECTED_FLAG, "true");
    };

    // 注入エラー時の処理
    attackScript.onerror = (err) => {
      console.error("スクリプト注入エラー:", err);
    };

    (document.head || document.documentElement).appendChild(attackScript);
    console.log("スクリプト注入完了 実行方法: ポップアップのボタンをクリック");
  } catch (e) {
    console.error("スクリプト注入失敗:", e);
  }
}

/**
 * 初期化処理
 * DOMの読み込み状態に応じてスクリプト注入を実行
 */
function initialize(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectScripts);
  } else {
    injectScripts();
  }
}

/**
 * ポップアップからのメッセージリスナー
 * COOPテスト実行要求を受信してattack.jsに通知
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content.js: メッセージを受信:", request);

  if (request.action === "EXECUTE_COOP_TEST") {
    // attack.jsにCOOPテスト開始を通知
    window.postMessage(
      { type: "COOP_TEST_START", source: "content_script" },
      "*",
    );
    sendResponse({
      status: "success",
      message: "COOPテスト開始メッセージを送信しました",
    });
  } else {
    sendResponse({
      status: "unknown",
      message: "不明なアクション",
    });
  }

  // 非同期レスポンスを有効にする
  return true;
});

// 初期化実行
initialize();
