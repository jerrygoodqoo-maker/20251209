// 遊戲狀態管理
let gameState = 'MOVING'; // MOVING, ASKING, ANSWERED

// 角色物件
let player;
let questioners = [];
let hintGiver;

// 圖片資源
let playerStandSprite;
let playerMoveSprite;
let playerRightSprite;
let playerWrongSprite;
let q1Sprite;
let q2Sprite;
let q3Sprite;
let hintGiverSprite;

// 角色縮放比例
const playerScale = 2.5;
const questionerScale = 4.0; // 將提問者放大

// 互動與問答相關變數
let activeQuestioner = null;
let currentQuestion = null;
let feedbackMessage = '';
let feedbackTimer = 0;
let hintTimer = 0; // 提示顯示計時器
let closeButton = {}; // 用於存放關閉按鈕的屬性
let hintButton = {}; // 用於存放提示按鈕的屬性
let unaskedQuestions = []; // 全域的未提問列表

// 提問者反應文字
const correctPhrases = ["答對了，好厲害！", "真聰明！", "恭喜你！", "表現得很好喔！"];
const wrongPhrases = ["差一點點，再加油！", "沒關係，再試一次吧。", "這個答案好像不對喔。", "別灰心，你可以的！"];

/**
 * p5.js 的 preload 函數，在 setup() 之前執行
 * 用於預先載入所有外部資源 (例如圖片、聲音、字體)
 * 確保資源在程式開始時就已準備就緒
 */
function preload() {
  // 載入玩家圖片
  playerStandSprite = loadImage('stand/00.png'); // 靜止 (79x39, 2幀)
  playerMoveSprite = loadImage('move/00.png');   // 移動 (163x39, 4幀)
  playerRightSprite = loadImage('right/00.png'); // 答對 (81x40, 2幀)
  playerWrongSprite = loadImage('roung/00.png'); // 答錯 (85x38, 2幀)

  // 載入提問者圖片
  q1Sprite = loadImage('Q1/00.png'); // 91x23, 4幀
  q2Sprite = loadImage('Q2/00.png'); // 83x20, 4幀
  q3Sprite = loadImage('Q3/00.png'); // 175x24, 6幀
  hintGiverSprite = loadImage('AN/00.png'); // 提示者 (291x31, 8幀)

}

/**
 * p5.js 的 setup 函數，只會在程式開始時執行一次
 * 用於初始化設定，例如畫布大小、物件初始狀態等
 */
function setup() {
  createCanvas(windowWidth, windowHeight); // 創建全螢幕畫布

  // 初始化玩家物件
  player = {
    x: width / 2,
    y: height / 2,
    speed: 3,
    isMoving: false,
    direction: -1, // -1 表示向左, 1 表示向右 (預設朝左)
    feedbackState: null, // 'correct' 或 'wrong'
    // 動畫相關屬性
    animation: {
      stand: {
        img: playerStandSprite,
        w: 79 / 2,  // 39.5
        h: 39,
        totalFrames: 2
      },
      move: {
        img: playerMoveSprite,
        w: 163 / 4, // 40.75
        h: 39,
        totalFrames: 4
      },
      right: {
        img: playerRightSprite,
        w: 81 / 2,
        h: 40,
        totalFrames: 2
      },
      wrong: {
        img: playerWrongSprite,
        w: 85 / 2,
        h: 38,
        totalFrames: 2
      },
      currentFrame: 0,
      frameDelay: 10 // 每 10 個繪圖幀更新一次動畫
    }
  };

  // 初始化全域的未提問列表
  unaskedQuestions = [...questionPool];

  // 初始化提示者物件
  hintGiver = {
    x: 150,
    y: height - 80,
    img: hintGiverSprite,
    w: 291 / 8,
    h: 31,
    totalFrames: 8,
    currentFrame: 0,
    frameDelay: 10,
    scale: 3.0
  };


  // 初始化提問者物件陣列
  questioners.push({
    id: 'q1', 
    x: width * 0.2, 
    y: height * 0.2, // 使用相對位置
    reaction: null, // 'correct' 或 'wrong'
    reactionText: '', // 儲存反應文字
    correctAnswersCount: 0, // 追蹤此提問者被答對的次數
    cooldownUntil: 0, // 互動冷卻計時器
    img: q1Sprite,
    w: 91 / 4,
    h: 23,
    totalFrames: 4,
    currentFrame: 0,
    frameDelay: 15
  });
  questioners.push({
    id: 'q2', 
    x: width * 0.8, 
    y: height * 0.2, // 使用相對位置
    reaction: null,
    reactionText: '',
    correctAnswersCount: 0,
    cooldownUntil: 0,
    img: q2Sprite,
    w: 83 / 4,
    h: 20,
    totalFrames: 4,
    currentFrame: 0,
    frameDelay: 15
  });
  questioners.push({
    id: 'q3', 
    x: width * 0.5, 
    y: height * 0.8, // 使用相對位置
    reaction: null,
    reactionText: '',
    correctAnswersCount: 0,
    cooldownUntil: 0,
    img: q3Sprite,
    w: 175 / 6,
    h: 24,
    totalFrames: 6,
    currentFrame: 0,
    frameDelay: 12
  });
}

/**
 * p5.js 的 draw 函數，會以每秒約 60 次的頻率不斷重複執行
 * 所有動畫、互動和繪圖都發生在這裡
 */
function draw() {
  // 設定背景為淺藍色
  background(210, 240, 255);

  // 繪製所有角色
  drawPlayer(); // 先繪製玩家
  drawQuestioners(); // 再繪製提問者，確保對話框在玩家之上
  drawHintGiver();

  // 根據遊戲狀態執行不同邏輯
  if (gameState === 'MOVING') {
    movePlayer();
    checkInteractions();
  } else if (gameState === 'ASKING') {
    displayQuestion();
    displayTimedHint(); // 在問答介面上繪製計時提示
  } else if (gameState === 'ANSWERED') {
    displayFeedback();
  }

}

/**
 * 繪製玩家角色
 */
function drawPlayer() {
  let anim;
  // 1. 優先檢查是否在答題回饋狀態
  if (gameState === 'ANSWERED') {
    if (player.feedbackState === 'correct') {
      anim = player.animation.right;
    } else {
      anim = player.animation.wrong;
    }
  // 2. 檢查是否在左右移動
  } else if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) {
    anim = player.animation.move;
  // 3. 最後才是靜止或上下移動
  } else { 
    anim = player.animation.stand;
  }

  // 更新動畫幀 (只有在移動或站立動畫有多幀時才有效果)
  if (frameCount % player.animation.frameDelay === 0) {
    player.animation.currentFrame = (player.animation.currentFrame + 1) % anim.totalFrames;
  }

  // 計算目前要顯示的影格在圖片中的 x 座標
  let frameX = player.animation.currentFrame * anim.w;

  // 使用 image() 的裁切功能來繪製單一影格
  imageMode(CENTER);
  
  push(); // 保存當前的繪圖狀態
  translate(player.x, player.y); // 將座標原點移動到玩家中心
  
  // 只有在使用側面行走動畫時，才需要根據方向翻轉圖片
  if (anim === player.animation.move) { 
    scale(-player.direction, 1); 
  }

  image(anim.img, 0, 0, anim.w * playerScale, anim.h * playerScale, frameX, 0, anim.w, anim.h);
  pop(); // 恢復繪圖狀態
}

/**
 * 繪製所有提問者
 */
function drawQuestioners() {
  imageMode(CENTER);
  for (let q of questioners) {
    // 更新每個提問者自己的動畫幀
    if (frameCount % q.frameDelay === 0) {
      q.currentFrame = (q.currentFrame + 1) % q.totalFrames;
    }

    let frameX = q.currentFrame * q.w;
    let drawX = q.x;
    let drawY = q.y;

    // --- 提問者反應動畫 ---
    // 只有在答題回饋階段，且是當前的提問者，才執行反應動畫
    if ((gameState === 'ANSWERED' || gameState === 'SHOWING_HINT') && q === activeQuestioner) {
      if (q.reaction === 'correct') {
        // 開心反應：上下跳動
        drawY += sin(frameCount * 0.5) * 5;
      } else if (q.reaction === 'wrong') {
        // 失望反應：左右搖晃
        drawX += sin(frameCount * 0.8) * 5;
      }
    }

    // 如果此提問者已被答對兩次，就將它變灰
    if (q.correctAnswersCount >= 2) {
      push();
      tint(150, 150); // 套用灰色濾鏡
      image(q.img, drawX, drawY, q.w * questionerScale, q.h * questionerScale, frameX, 0, q.w, q.h);
      pop();
    } else {
      image(q.img, drawX, drawY, q.w * questionerScale, q.h * questionerScale, frameX, 0, q.w, q.h);
    }

    // --- 繪製反應文字對話框 ---
    if (q.reactionText) {
      fill(255);
      stroke(0);
      strokeWeight(2);
      rectMode(CENTER);
      textSize(16);
      let textW = textWidth(q.reactionText) + 20;
      let bubbleX, bubbleY;

      // 根據提問者在畫布上的位置，以及是否會被提示者擋到，來決定對話框的相對位置
      if (q.x < width / 3 && q.y > height / 2) { // 左下方的提問者 (會被提示者擋到)
        bubbleX = q.x;
        bubbleY = q.y - (q.h * questionerScale / 2) - 30; // 改為放在頭頂
      } else if (q.x < width / 3) { // 左上方的提問者
        bubbleX = q.x + (q.w * questionerScale / 2) + (textW / 2) + 10;
        bubbleY = q.y;
      } else if (q.x > width * 2 / 3) { // 右上方的提問者
        bubbleX = q.x - (q.w * questionerScale / 2) - (textW / 2) - 10;
        bubbleY = q.y;
      } else { // 下方的提問者
        bubbleX = q.x;
        bubbleY = q.y - (q.h * questionerScale / 2) - 30; // 放在頭頂
      }

      rect(bubbleX, bubbleY, textW, 40, 10);
      
      noStroke();
      fill(0);
      text(q.reactionText, bubbleX, bubbleY);
    }
  }
}

/**
 * 繪製提示者
 */
function drawHintGiver() {
  imageMode(CENTER);
  // 更新動畫幀
  if (frameCount % hintGiver.frameDelay === 0) {
    hintGiver.currentFrame = (hintGiver.currentFrame + 1) % hintGiver.totalFrames;
  }

  let frameX = hintGiver.currentFrame * hintGiver.w;
  image(hintGiver.img, hintGiver.x, hintGiver.y, hintGiver.w * hintGiver.scale, hintGiver.h * hintGiver.scale, frameX, 0, hintGiver.w, hintGiver.h);
}


/**
 * 處理玩家的移動邏輯
 */
function movePlayer() {
  // 檢查是否有任何方向鍵被按下，並設定 isMoving 狀態
  player.isMoving = keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW) || keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW);

  if (player.isMoving) {
    if (keyIsDown(LEFT_ARROW)) {
      player.x -= player.speed;
      player.direction = -1; // 更新方向為向左
    }
    if (keyIsDown(RIGHT_ARROW)) {
      player.x += player.speed;
      player.direction = 1; // 更新方向為向右
    }
    if (keyIsDown(UP_ARROW)) { player.y -= player.speed; }
    if (keyIsDown(DOWN_ARROW)) { player.y += player.speed; }
  }

  // 根據當前動畫的寬高來限制玩家不出邊界
  let currentWidth = player.isMoving ? player.animation.move.w : player.animation.stand.w;
  let currentHeight = player.isMoving ? player.animation.move.h : player.animation.stand.h;

  player.x = constrain(player.x, (currentWidth * playerScale) / 2, width - (currentWidth * playerScale) / 2);
  player.y = constrain(player.y, (currentHeight * playerScale) / 2, height - (currentHeight * playerScale) / 2);
}

/**
 * 當瀏覽器視窗大小改變時，p5.js 會自動呼叫此函數
 */
function windowResized() {
  // 重新設定畫布大小
  resizeCanvas(windowWidth, windowHeight);

  // 根據新的畫布大小，重新計算提問者的位置
  questioners[0].x = width * 0.2;
  questioners[1].x = width * 0.8;
  questioners[2].x = width * 0.5;
  questioners[2].y = height * 0.8;
}

/**
 * 檢查玩家與提問者的互動
 */
function checkInteractions() {
  for (let q of questioners) {
    // 計算碰撞距離
    let playerSize = (player.animation.stand.w * playerScale) / 2;
    let questionerSize = (q.w * questionerScale) / 2;
    let d = dist(player.x, player.y, q.x, q.y);

    // 如果靠近、此提問者不在冷卻中、還沒被滿足(答對<2次)、且題庫還有題目，則觸發提問
    if (d < playerSize + questionerSize && millis() > q.cooldownUntil && q.correctAnswersCount < 2 && unaskedQuestions.length > 0) {
      gameState = 'ASKING';
      activeQuestioner = q;
      
      // 從尚未提問的問題中隨機選取一題
      let randomIndex = floor(random(unaskedQuestions.length));
      currentQuestion = unaskedQuestions[randomIndex];
      return; // 觸發一個後就停止檢查
    }
  }
}

/**
 * 顯示問題介面
 */
function displayQuestion() {
  // 繪製半透明背景
  fill(0, 0, 0, 150);
  rectMode(CENTER);
  rect(width / 2, height / 2, width * 0.8, height * 0.5, 20);

  // 繪製問題和選項文字
  fill(255);
  noStroke(); // 確保文字沒有邊框，看起來會比較細
  textAlign(CENTER, CENTER);
  textSize(24);
  text(currentQuestion.question, width / 2, height * 0.4);
  
  textSize(20);
  textAlign(LEFT, CENTER);
  for (let i = 0; i < currentQuestion.options.length; i++) {
    text(currentQuestion.options[i], width * 0.2, height * 0.5 + i * 40);
  }
  
  textSize(16);
  textAlign(CENTER, CENTER);
  text("按下數字鍵 1, 2, 3 回答", width / 2, height * 0.65);

  // --- 繪製提示按鈕 ---
  const dialogW = width * 0.8;
  const dialogH = height * 0.5;
  hintButton = {
    isCircle: false, // 標記為矩形按鈕
    w: 100,
    h: 40,
    x: (width / 2) + (dialogW / 2) - 120, // 計算按鈕 x 位置
    y: (height / 2) + (dialogH / 2) - 60,  // 計算按鈕 y 位置
  };

  // 檢查滑鼠是否懸停在按鈕上
  const onHint = mouseX > hintButton.x && mouseX < hintButton.x + hintButton.w &&
                 mouseY > hintButton.y && mouseY < hintButton.y + hintButton.h;

  // --- 繪製關閉按鈕 (X) ---
  closeButton = {
    isCircle: true, // 標記為圓形按鈕
    size: 30,
    x: (width / 2) + (dialogW / 2) - 25,
    y: (height / 2) - (dialogH / 2) + 25,
  };
  const onClose = dist(mouseX, mouseY, closeButton.x, closeButton.y) < closeButton.size / 2;

  // --- 統一處理滑鼠指標 ---
  if (onHint || onClose) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }

  // --- 繪製提示按鈕 ---
  if (onHint) {
    fill(255, 200, 0); // 懸停時變色
  } else {
    fill(255, 165, 0); // 預設顏色
  }
  
  rectMode(CORNER);
  noStroke();
  rect(hintButton.x, hintButton.y, hintButton.w, hintButton.h, 10);
  
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("提示", hintButton.x + hintButton.w / 2, hintButton.y + hintButton.h / 2);

  // --- 繪製關閉按鈕 ---
  if (onClose) {
    fill(255, 100, 100); // 懸停時變色
  } else {
    fill(255, 0, 0); // 預設顏色
  }
  noStroke();
  circle(closeButton.x, closeButton.y, closeButton.size);

  fill(255);
  stroke(255);
  strokeWeight(3);
  textSize(20);
  text("X", closeButton.x, closeButton.y - 1);

}

/**
 * 顯示提示介面
 */
function displayTimedHint() {
  if (millis() < hintTimer) {
    // 繪製對話框
    let boxX = hintGiver.x + 120;
    let boxY = hintGiver.y - 100;
    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(boxX, boxY, 250, 80, 10);

    // 繪製提示文字
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("提示：\n" + currentQuestion.hint, boxX, boxY);
  }
}

/**
 * 顯示答題回饋
 */
function displayFeedback() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text(feedbackMessage, width / 2, height / 2);

  // 倒數計時後返回移動狀態
  if (millis() > feedbackTimer) {
    // 如果是按 'X' 離開 (此時玩家沒有回饋狀態)，才設定冷卻時間
    if (player.feedbackState === null && activeQuestioner) {
      activeQuestioner.cooldownUntil = millis() + 3000;
    }

    if (player.feedbackState === 'correct') {
      // 如果玩家答對了，但還沒滿足兩題的條件
      if (activeQuestioner.correctAnswersCount < 2) {
        // 立刻進入下一個問題
        gameState = 'ASKING';
        let randomIndex = floor(random(unaskedQuestions.length));
        currentQuestion = unaskedQuestions[randomIndex];
        // 清除反應，準備下一題
        activeQuestioner.reaction = null;
        activeQuestioner.reactionText = '';
      } else { // 如果已經答對兩題，則結束對話
        gameState = 'MOVING';
        if (activeQuestioner) {
          activeQuestioner.reaction = null;
          activeQuestioner.reactionText = '';
        }
        activeQuestioner = null;
        currentQuestion = null;
      }
    } else if (player.feedbackState === null) { // 按 'X' 離開
      gameState = 'MOVING';
      if (activeQuestioner) {
        activeQuestioner.reaction = null; // 清除反應狀態
        activeQuestioner.reactionText = ''; // 清除反應文字
      }
      activeQuestioner = null;
      currentQuestion = null;
    } else { // 如果答錯了，就返回問題介面並顯示提示
      hintTimer = millis() + 2000; // 答錯時，自動顯示提示 2 秒
      gameState = 'ASKING'; // 返回問題介面
      // 清除反應，讓玩家和提問者恢復正常狀態
      if (activeQuestioner) {
        activeQuestioner.reaction = null;
        activeQuestioner.reactionText = '';
      }
      player.feedbackState = null;
    }
  }
}

/**
 * 處理按鍵事件 (答題)
 */
function keyPressed() {
  if (gameState === 'ASKING') {
    let choice = parseInt(key);
    if (choice >= 1 && choice <= 3) {
      gameState = 'ANSWERED';
      feedbackTimer = millis() + 1500; // 顯示回饋 1.5 秒
      if (choice === currentQuestion.answer) {
        feedbackMessage = "答對了！";
        activeQuestioner.correctAnswersCount++; // 為當前的提問者增加答對次數
        activeQuestioner.reaction = 'correct';
        activeQuestioner.reactionText = random(correctPhrases); // 隨機選取一句稱讚的話
        player.feedbackState = 'correct';
        // 從未問問題列表中移除剛剛答對的問題
        const index = unaskedQuestions.indexOf(currentQuestion);
        if (index > -1) {
          unaskedQuestions.splice(index, 1);
        }
      } else {
        feedbackMessage = "答錯了！";
        activeQuestioner.reaction = 'wrong';
        activeQuestioner.reactionText = random(wrongPhrases); // 隨機選取一句嘲諷/鼓勵的話
        player.feedbackState = 'wrong';
        // 答錯時，將回饋時間延長，讓玩家有時間看提示
        feedbackTimer = millis() + 3000; 
      }
    }
  }
}

/**
 * 處理滑鼠點擊事件
 */
function mousePressed() {
  // 只有在提問狀態下才檢查按鈕點擊
  if (gameState === 'ASKING') {
    const onHint = mouseX > hintButton.x && mouseX < hintButton.x + hintButton.w &&
                   mouseY > hintButton.y && mouseY < hintButton.y + hintButton.h;
    const onClose = dist(mouseX, mouseY, closeButton.x, closeButton.y) < closeButton.size / 2;

    if (onClose) {
      if (activeQuestioner) {
        // --- 讓提問者說出嘲諷的話 ---
        activeQuestioner.reaction = 'wrong'; // 觸發搖晃動畫
        activeQuestioner.reactionText = "不敢回答嗎？真沒用！";
        player.feedbackState = null; // 玩家不需做出反應
        feedbackMessage = ''; // 不顯示中央的大回饋文字
        feedbackTimer = millis() + 2000; // 讓嘲諷顯示 2 秒
        gameState = 'ANSWERED'; // 切換到回饋狀態來顯示嘲諷
      }
    } else if (onHint) {
      hintTimer = millis() + 2000; // 點擊提示按鈕時，設定提示計時器為 2 秒
    }
  }
}