// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let gameStarted = false;
let wordList = ["apple", "banana", "orange", "grape", "peach"]; // 全民英檢中級單字庫
let currentWord = "";
let scrambledWord = "";
let correctLetters = [];
let score = 0;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Initialize HandPose model
  handPose = ml5.handPose(video, { flipped: true }, () => {
    console.log("Model loaded!");
  });

  // Listen for predictions
  handPose.on("predict", gotHands);

  // Set initial word
  currentWord = "START";
}

function gotHands(results) {
  hands = results;
}

function draw() {
  image(video, 0, 0);

  if (!gameStarted) {
    drawStartScreen();
  } else {
    drawGameScreen();
  }

  // Display score in the top-left corner
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10);
}

function drawStartScreen() {
  // Draw START button
  fill(255);
  rect(width / 2 - 100, height / 2 - 50, 200, 100);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(currentWord, width / 2, height / 2);
}

function drawGameScreen() {
  // Display scrambled word as draggable letters
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  let xOffset = width / 2 - scrambledWord.length * 20;
  for (let i = 0; i < scrambledWord.length; i++) {
    text(scrambledWord[i], xOffset + i * 40, height / 2);
  }

  // Display underscores for the correct word
  let underscoreXOffset = width / 2 - currentWord.length * 20;
  for (let i = 0; i < currentWord.length; i++) {
    fill(255);
    rect(underscoreXOffset + i * 40 - 10, height / 2 + 40, 20, 5);
    if (correctLetters[i]) {
      fill(0);
      text(correctLetters[i], underscoreXOffset + i * 40, height / 2 + 20);
    }
  }

  // Detect hand and drag letters
  if (hands.length > 0) {
    let hand = hands[0];
    for (let keypoint of hand.keypoints) {
      fill(255, 0, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);

      // Check if hand is near a letter
      for (let i = 0; i < scrambledWord.length; i++) {
        let letterX = xOffset + i * 40;
        let letterY = height / 2;
        if (dist(keypoint.x, keypoint.y, letterX, letterY) < 20 && !correctLetters[i]) {
          correctLetters[i] = scrambledWord[i];
          scrambledWord = scrambledWord.split("");
          scrambledWord.splice(i, 1);
          scrambledWord = scrambledWord.join("");
          break;
        }
      }
    }
  }

  // Check if the word is completed
  if (correctLetters.join("") === currentWord) {
    score++;
    if (wordList.length > 0) {
      generateScrambledWord();
    } else {
      gameStarted = false;
      currentWord = "Game Over!";
    }
  }
}

function mousePressed() {
  if (!gameStarted) {
    // Check if START button is clicked
    if (
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height / 2 - 50 &&
      mouseY < height / 2 + 50
    ) {
      gameStarted = true;
      generateScrambledWord();
    }
  }
}

function generateScrambledWord() {
  // Pick a random word from the word list
  currentWord = random(wordList);

  // Scramble the word
  scrambledWord = currentWord
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  // Reset correct letters
  correctLetters = Array(currentWord.length).fill(null);
}
