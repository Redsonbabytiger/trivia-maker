// Initialize the questions array with data from the database
let questions = [];

// game state variables
let currentQuestionIndex;
let currentQuestionSet; // will hold the filtered questions based on difficulty
let currentDifficulty; // will hold the selected difficulty level
let currentCategory; // will hold the selected category for database questions
let score;

// HTML elements
// Use document.querySelector() to hook the const variables to the corresponding HTML elements.
// The first one is done for you. 
const startScreen = document.querySelector('#start-screen');
const questionScreen = document.querySelector('#question-screen');
const endScreen = document.querySelector('#end-screen');
const categoryScreen = document.querySelector('#category-screen');
const questionText = document.querySelector('#question-text');
const answerContainer = document.querySelector('#answer-container');
const scoreDisplay = document.querySelector('#score');
const questionCounter = document.querySelector('#question-counter');
const progressBar = document.querySelector('#progress-bar');
const feedbackText = document.querySelector('#feedback-text');
const timerDisplay = document.querySelector('#timer-display');
const customBtn = document.querySelector('#custom-btn');
const customQuestionsScreen = document.querySelector('#custom-questions-screen');
const databaseBtn = document.querySelector('#database-btn');
const categoryButtonsContainer = document.querySelector('#category-buttons-container');

// The pre-game setup before the user starts playing.
function playGame() {
  // set the state variables
  currentQuestionIndex = 0;
  score = 0;
  // hide the start screen
  startScreen.style.display = 'none';
  categoryScreen.style.display = 'none';
  customQuestionsScreen.style.display = 'none';
  // Display the question screen
  questionScreen.style.display = 'block';
  // ask a question
  loadQuestion();
}

// Replace end screen with the start screen again.
function resetGame() {
  endScreen.style.display = 'none';
  startScreen.style.display = 'block';
}

// Execution starts here: Set up the start end restart buttons that will, when clicked, get the game rolling
function initialize() {
  // Use document.querySelector() to grab attach the button HTML elements.
  const restartBtn = document.querySelector('#restart-btn');
  // Add an event listener to restartBtn
  // When clicked, it should call resetGame()
  restartBtn.addEventListener('click', function () {
    resetGame();
  });

  customBtn.addEventListener('click', function () {
    currentDifficulty = 'custom';
    startScreen.style.display = 'none';
    customQuestionsScreen.style.display = 'block';
    customQuestionsSetup();
  });

  databaseBtn.addEventListener('click', function () {
    currentDifficulty = 'database';
    startScreen.style.display = 'none';
    categoryScreen.style.display = 'block';
    loadCategories();
  });
  
}
//-----------------------------------------------------------------------------------------
// ****** main block *******
initialize();