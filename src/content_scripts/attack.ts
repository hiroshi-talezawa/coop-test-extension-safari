/**
 * COOP脆弱性テストモジュール（統合版）
 */

/**
 * COOP攻撃の結果をページ上部にバナー表示する
 * @param success - 攻撃が成功したかどうか
 * @param reason - 結果の理由（詳細メッセージ）
 */
function showAttackResult(success: boolean, reason: string): void {
  // 既存のバナーがあれば削除
  const existingBanner = document.querySelector("#coop-test-banner");
  if (existingBanner) {
    existingBanner.remove();
  }

  // 結果表示バナーを作成
  const banner = document.createElement("div");
  banner.id = "coop-test-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    padding: 15px;
    text-align: center;
    font-family: "Arial", sans-serif;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background: ${success ? "#d32f2f" : "#2e7d32"};
    border-bottom: 3px solid ${success ? "#b71c1c" : "#1b5e20"};
    cursor: pointer;
  `;

  // 攻撃結果に応じたメッセージを設定
  banner.textContent = success
    ? `攻撃成功: Cross-Origin-Opener-Policyが無効です (${reason})`
    : `攻撃ブロック: Cross-Origin-Opener-Policyが有効です (${reason})`;

  // ページの先頭に挿入
  if (document.body) {
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

// 攻撃実行中フラグ（重複実行防止）
let attackInProgress = false;

/**
 * COOP脆弱性テストのメイン関数
 * ポップアップウィンドウを開いてopener参照の切断をテスト
 */
function coopAttackTest(): void {
  // 既に実行中の場合は何もしない
  if (attackInProgress) {
    return;
  }

  attackInProgress = true;

  // テスト用ポップアップウィンドウを作成
  const popup = createPopup();
  if (!popup) {
    handlePopupBlocked();
    return;
  }

  // 1秒後にopener参照をチェック
  scheduleOpenerCheck(popup);
}

/**
 * テスト用ポップアップウィンドウを作成
 * @returns 作成されたウィンドウオブジェクト（失敗時はnull）
 */
function createPopup(): Window | null {
  try {
    return window.open(
      "https://google.com",
      "cooptest",
      "width=500,height=400",
    );
  } catch (error) {
    handleTestError(error);
    return null;
  }
}

/**
 * ポップアップがブロックされた場合の処理
 */
function handlePopupBlocked(): void {
  showAttackResult(false, "ポップアップブロック - テスト実行不可");
  attackInProgress = false;
}

/**
 * テスト実行時にエラーが発生した場合の処理
 * @param error - 発生したエラー
 */
function handleTestError(error: unknown): void {
  console.error("COOPテスト実行エラー:", error);
  showAttackResult(false, "テスト実行エラー");
  attackInProgress = false;
}

/**
 * opener参照チェックをスケジュール
 * @param popup - チェック対象のポップアップウィンドウ
 */
function scheduleOpenerCheck(popup: Window): void {
  setTimeout(() => checkOpenerAndCleanup(popup), 1000);
}

/**
 * opener参照の存在確認でCOOP脆弱性をテスト後、ポップアップを閉じてリセット
 * @param popup - テスト対象のポップアップウィンドウ
 */
function checkOpenerAndCleanup(popup: Window): void {
  try {
    checkOpenerReference(popup);
  } catch (err) {
    // SecurityErrorが発生した場合（COOP有効）
    showAttackResult(false, "SecurityError");
  } finally {
    cleanup(popup);
  }
}

/**
 * popup.openerの値でCOOPの有効性を判定
 * @param popup - テスト対象のポップアップウィンドウ
 * @see https://developer.mozilla.org/ja/docs/Web/API/Window/opener
 */
function checkOpenerReference(popup: Window): void {
  if (popup.opener !== null) {
    // opener参照が維持されている場合はCOOPが無効（脆弱）
    showAttackResult(true, "opener参照が維持");
  } else {
    // opener参照が切断されている場合はCOOPが有効（安全）
    showAttackResult(false, "opener参照が切断");
  }
}

/**
 * テスト後のクリーンアップ処理
 * @param popup - クリーンアップ対象のポップアップウィンドウ
 */
function cleanup(popup: Window): void {
  try {
    popup.close();
  } catch (e) {
    // ポップアップ閉じ処理でエラーが発生してもログ出力のみ
    console.warn("ポップアップクローズエラー:", e);
  }
  attackInProgress = false;
}

/**
 * COOPテスト開始メッセージを受信するリスナー
 * content.jsからのpostMessageを受信してCOOPテストを開始
 */
window.addEventListener("message", (event) => {
  if (
    event.data.type === "COOP_TEST_START" &&
    event.data.source === "content_script"
  ) {
    coopAttackTest();
  }
});
