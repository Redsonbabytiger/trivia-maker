/* ============================================================
    Trivia GAME 
   ============================================================ 
*/

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://jttqmvliuevibobxrsuq.supabase.co';
const supabaseKey = 'sb_publishable_u8uXsKx79GR-Qs4eH5c6jg_LdUIe7G8';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Fetch the base questions from supabase and store them in the questions array
async function fetchBaseQuestions() {
  const { data, error } = await supabaseClient
    .from('original_base_questions')
    .select('*')
    .limit(50); // Adjust the limit as needed

  if (error) {
    console.error('Error fetching questions:', error);
    alert('Error fetching questions from database. Please try again later.');
    return [];
  }

  if (!data || data.length === 0) {
    alert('No questions found in the database.');
    return [];
  }

  return data.map(row => {
    let answers = row.answers;
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch (e) { answers = [row.answers]; }
    }
    if (!Array.isArray(answers)) answers = [answers];

    return {
      question: row.question ?? row.question_text ?? '',
      answers: answers,
      correctIndex: Number.isInteger(row.correct_index) ? row.correct_index : (row.correctIndex ?? 0),
      points: row.points ?? 10,
      difficulty: row.difficulty ?? 'medium',
    };
  });
}

// Initialize the questions array with data from the database
let questions = [];
fetchBaseQuestions().then(fetchedQuestions => {
  questions = fetchedQuestions;
}).catch(err => {
  console.error('Error initializing questions:', err);
  alert('Error initializing questions from database. Please refresh the page to try again.');
});

// game state variables
let currentQuestionIndex;
let currentQuestionSet; // will hold the filtered questions based on difficulty
let currentDifficulty; // will hold the selected difficulty level
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
const difficultyScreen = document.querySelector('#difficulty-screen');
const easyBtn = document.querySelector('#easy-btn');
const mediumBtn = document.querySelector('#medium-btn');
const hardBtn = document.querySelector('#hard-btn');
const customBtn = document.querySelector('#custom-btn');
const customQuestionsScreen = document.querySelector('#custom-questions-screen');
const databaseBtn = document.querySelector('#database-btn');
const categoryButtonsContainer = document.querySelector('#category-buttons-container');

// Decide if an answer is correct and respond accordingly
// Parameters:  index of the button the user clicked and the current question object
//   - Compare answer clicked to the correct answer
//   - Update score if correct (don't forget to update the display!)
//   - Add 'correct' or 'incorrect' className to the clicked button
//   - Set feedbackText to a message ("Correct! ✅" or "Not quite! ❌")
//   - Use a for loop to disable ALL answer buttons so user can't click again 
//   - setTimeout(function() { ... }, 1500) will simulate a 1.5 second pause
function checkAnswer(selectedIndex, questionObj) {
  // buttons is an object that references all of the buttons in answerContainer
  // You can index into buttons like a regular list
  const buttons = answerContainer.querySelectorAll('.answer-btn');

  if (selectedIndex === questionObj.correctIndex) {
    score += questionObj.points;
    buttons[selectedIndex].className += ' correct';
    feedbackText.textContent = "Correct! ✅";
  }
  else {
    buttons[selectedIndex].className += ' incorrect';
    feedbackText.textContent = "Not quite! ❌";
    buttons[questionObj.correctIndex].className += ' correct';
  }
  // Loop through and disable all buttons (buttons[i].disabled = true;)
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
  // Pause before moving to the next question
  // It seems counterintuitive that loadQuestion() is called here, but it is how to guarantee one question displayed at a time
  setTimeout(function () {
    currentQuestionIndex++;
    loadQuestion();
    scoreDisplay.textContent = score;
  }, 1500);
}

// Create buttons for the answers and call checkAnswer() when the user clicks one of the buttons
// questionObj is current question (from the questions list)
// questionObj.answers.length is the number of answers for this question
function createAnswerButtons(questionObj) {
  //Use a for loop that runs while the counter is less than questionObj.answers.length 
  // Each time through the loop
  //     create a new button
  //     set its textContent to the current answer (questionObj.answers[i]), give it the className 'answer-btn',
  //     add an event listener to the button that calls checkAnswer(index) when clicked
  //     append the button to answerContainer.
  for (let i = 0; i < questionObj.answers.length; i++) {
    const btn = document.createElement('button');
    btn.textContent = questionObj.answers[i];
    btn.className = 'answer-btn';
    btn.addEventListener('click', function () {
      checkAnswer(i, questionObj);
    });
    answerContainer.appendChild(btn);
  }
}

// If there are still questions to display, use currentQuestionIndex to pick the right question from 
// the questions array, then display:
//  - The question text  (use .textContent)
//  - The question counter (e.g. "Question 1 of 5")
//  - The progress bar width (percentage of questions done)
//  - Call createAnswerButtons() passing the current question object
//  - clear the feedback text 
// Else, call endGame()
// Finish the game
function endGame() {
  let finalScore = score;
  if (currentDifficulty === 'easy') {
    finalScore = score / 10;
  }
  else if (currentDifficulty === 'medium') {
    finalScore = score / 15;
  }
  else if (currentDifficulty === 'hard') {
    finalScore = score / 20;
  }
  else if (currentDifficulty === 'custom') {
    finalScore = score / 10; // Assuming custom questions are worth 10 points each
  }
  else {
    finalScore = score / 10; // Default case, just in case
  }
  // Hide question screen, show end screen
  questionScreen.style.display = 'none';
  endScreen.style.display = 'block';

  // Show final score
  const finalScoreText = endScreen.querySelector('#final-score-text');
  finalScoreText.textContent = "You scored " + finalScore + " out of " + currentQuestionSet.length + "!";

  // Show a message depending on score
  const endMessage = endScreen.querySelector('#end-message');
  if (finalScore === currentQuestionSet.length) {
    endMessage.textContent = finalScore + "/" + currentQuestionSet.length + " Perfect score! You're a trivia wizard! 🧙";
  }
  else if (finalScore >= currentQuestionSet.length / 2) {
    endMessage.textContent = "Good job! You scored " + finalScore + " out of " + currentQuestionSet.length + ".";
  }
  else // add the score out of total questions to this message
    endMessage.textContent = "Better luck next time! You scored " + finalScore + " out of " + currentQuestionSet.length + ".";
}

function loadQuestion() {
  currentQuestionSet = questions.filter(q => q.difficulty === currentDifficulty);
  if (currentQuestionIndex < currentQuestionSet.length) {
    // assign qObj to be the current questions object
    const qObj = currentQuestionSet[currentQuestionIndex];  // index starts at 0

    // Display question text
    questionText.textContent = qObj.question;

    // Display question counter
    questionCounter.textContent = "Question " + (currentQuestionIndex + 1) + " of " + currentQuestionSet.length;

    // Update progress bar by updating style.width (hint: (currentQuestionIndex / questions.length * 100) + '%')
    progressBar.style.width = (currentQuestionIndex / currentQuestionSet.length * 100) + '%';

    // Clear old answer buttons 
    answerContainer.innerHTML = '';

    // create and evaluate answers
    createAnswerButtons(qObj);

    // Clear feedback text
    feedbackText.textContent = '';
  }
  else {
    endGame();
  }
}

function customQuestionsSetup() {
  const addQuestionBtn = document.querySelector('#custom-question-btn');
  const startCustomBtn = document.querySelector('#start-custom-btn');
  const databaseQuestionBtn = document.querySelector('#database-question-btn');
  const customIndexInput = document.querySelector('#custom-index-input');
  const customQuestionInput = document.querySelector('#custom-question-input');
  const customCategoryInput = document.querySelector('#custom-category-input');
  const customAnswerInputs = [
    document.querySelector('#custom-answer-one'),
    document.querySelector('#custom-answer-two'),
    document.querySelector('#custom-answer-three'),
    document.querySelector('#custom-answer-four')
  ];

  // Add event listener to the start custom quiz button
  startCustomBtn.addEventListener('click', function () {
    currentDifficulty = 'custom';
    playGame();
  });

  // Add event listener to the database question button
  databaseQuestionBtn.addEventListener('click', function () {
    const question = customQuestionInput.value;
    const answers = customAnswerInputs.map(input => input.value);
    const customCorrectIndex = parseInt(customIndexInput.value);
    const category = customCategoryInput.value;
    submitQuestion(question, answers, customCorrectIndex, category); // Store in database
    // Clear input fields
    customQuestionInput.value = '';
    customAnswerInputs.forEach(input => input.value = '');
    customIndexInput.value = '';
    customCategoryInput.value = '';
  });

  // Add event listener to the add question button
  addQuestionBtn.addEventListener('click', function () {
    const question = customQuestionInput.value;
    const answers = customAnswerInputs.map(input => input.value);
    const customCorrectIndex = parseInt(customIndexInput.value);
    const category = customCategoryInput.value;

    // Validate inputs
    //if (question && answers.every(a => a) && !isNaN(customCorrectIndex) && customCorrectIndex >= 0 && customCorrectIndex < 4) {
    questions.push({
      question: question,
      answers: answers,
      correctIndex: customCorrectIndex,
      points: 10, // You can choose to make custom questions worth different points if you want
      difficulty: 'custom',
      category: category
    });
    // Clear input fields
    customQuestionInput.value = '';
    customAnswerInputs.forEach(input => input.value = '');
    customIndexInput.value = '';
    customCategoryInput.value = '';
    //}
  });
}

// Function to store a new trivia question in the Supabase database
async function submitQuestion(questionText, answerText, correctIndex, category) {
  const { data, error } = await supabaseClient
    .from('trivia_questions')
    .insert([{
      question: questionText,
      answers: answerText,
      correct_index: correctIndex,
      category: category
    }]);

  if (error) {
    console.error('Error saving question:', error.message);
  } else {
    alert('Question submitted successfully!');
  }
}



// The pre-game setup before the user starts playing.
function preGame() {
  // set the state variables
  currentQuestionIndex = 0;
  score = 0;
  currentDifficulty = 'easy'; // default difficulty
  // hide the start screen
  startScreen.style.display = 'none';
  // show the difficulty screen and ask the user to choose a difficulty
  difficultyScreen.style.display = 'block';
}

// Hide diffictulty screen, show question screen and call loadQuestion() to start the Trivia game
function playGame() {
  // hide difficulty screen
  difficultyScreen.style.display = 'none';
  // hide the custom questions screen in case user is coming from there
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
  const startBtn = document.querySelector('#start-btn');
  const restartBtn = document.querySelector('#restart-btn');

  //Add an event listener to startBtn.
  //When clicked, it should call playGame()
  startBtn.addEventListener('click', function () {
    preGame();
  });

  // Add an event listener to restartBtn
  // When clicked, it should call resetGame()
  restartBtn.addEventListener('click', function () {
    resetGame();
  });

  // Add event listeners to difficulty buttons
  easyBtn.addEventListener('click', function () {
    currentDifficulty = 'easy';
    playGame(); // Start the game immediately after selecting difficulty
  });
  mediumBtn.addEventListener('click', function () {
    currentDifficulty = 'medium';
    playGame(); // Start the game immediately after selecting difficulty
  });
  hardBtn.addEventListener('click', function () {
    currentDifficulty = 'hard';
    playGame(); // Start the game immediately after selecting difficulty
  });
  customBtn.addEventListener('click', function () {
    currentDifficulty = 'custom';
    difficultyScreen.style.display = 'none';
    customQuestionsScreen.style.display = 'block';
    customQuestionsSetup();
  });
  databaseBtn.addEventListener('click', function () {
    currentDifficulty = 'database';
    difficultyScreen.style.display = 'none';
    categoryScreen.style.display = 'block';
  });
}
//-----------------------------------------------------------------------------------------
// ****** main block *******
initialize();