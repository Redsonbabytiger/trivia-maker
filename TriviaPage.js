function loadQuestion() {
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

function checkAnswer(selectedIndex, questionObj) {
  // buttons is an object that references all of the buttons in answerContainer
  // You can index into buttons like a regular list
  const buttons = answerContainer.querySelectorAll('.answer-btn');

  if (selectedIndex+1 === questionObj.correctIndex) {
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
  
  if (currentDifficulty === 'custom') {
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