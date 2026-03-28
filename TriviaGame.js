/* ============================================================
    Trivia GAME 
   ============================================================ 
*/

// Initialize Supabase client
const supabaseUrl = 'https://jttqmvliuevibobxrsuq.supabase.co';
const supabaseKey = 'sb_publishable_u8uXsKx79GR-Qs4eH5c6jg_LdUIe7G8';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Loads the questions set based on selected category
function loadQuestionSet() {
  currentQuestionIndex = 0;

  if (currentDifficulty === 'database') {
    // Sync local set (may be empty), but we will replace/append when DB returns
    currentQuestionSet = questions.filter(q => q.difficulty === currentDifficulty);

    return supabaseClient
      .from('trivia_questions')
      .select('*')
      .eq('category', currentCategory)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching questions:', error);
          alert('Error fetching questions from database. Please try again later.');
          return;
        }
        if (!data || data.length === 0) {
          alert('No questions found for this category in the database.');
          return;
        }

        const mappedQuestions = data.map(row => {
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
            difficulty: 'database',
            category: row.category
          };
        });

        currentQuestionSet = [...currentQuestionSet, ...mappedQuestions];
      });
  }

  // Non-database difficulty: filter local questions
  currentQuestionSet = questions.filter(q => q.difficulty === currentDifficulty);
  return Promise.resolve();
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

function loadCategories() {
  // Clear existing category buttons first
  if (categoryButtonsContainer) {
    categoryButtonsContainer.innerHTML = '';
  }
  // Fetch distinct categories from the database and create buttons for each category
  supabaseClient
    .from('trivia_questions')
    .select('category')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories from database. Please try again later.');
        return;
      }
      if (!data || data.length === 0) {
        alert('No categories found in the database.');
        return;
      }
      // Deduplicate categories using Set
      const uniqueCategories = [...new Set(data.map(row => row.category))];
      
      uniqueCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.className = 'category-buttons-scrollable';
        btn.addEventListener('click', function () {
          currentDifficulty = 'database';
          currentCategory = category;
          loadQuestionSet().then(() => {
            playGame();
          });
        });
        categoryButtonsContainer.appendChild(btn);
      });
    });
  }
