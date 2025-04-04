// quiz.js

// Select DOM elements
const timerElem = document.getElementById('time');
const questionNumElem = document.getElementById('question-number');
const questionTextElem = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const resultContainer = document.getElementById('result-container');
const scoreTextElem = document.getElementById('score-text');
const quizContainer = document.getElementById('quiz-container');

let questions = []; // Array to hold the 10 selected questions
let currentQuestionIndex = 0;
let currentQuestion = null;
let score = 0;
let timerInterval = null;
let quizEnded = false;

// Start the countdown timer for given duration (in seconds)
function startTimer(duration) {
  let timeRemaining = duration;
  timerElem.textContent = timeRemaining;
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerElem.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      // Time is up: end the quiz immediately
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
}

// Display a question by index
function showQuestion(index) {
  currentQuestion = questions[index];
  // Update question number text (第X题 共Y题)
  questionNumElem.innerText = `第${index + 1}题 共${questions.length}题`;
  // Update question text
  questionTextElem.innerText = `（单选）${currentQuestion.question}`;
  // Clear any existing options
  optionsContainer.innerHTML = '';
  // Create option elements
  currentQuestion.options.forEach((optionText, i) => {
    const optionElem = document.createElement('div');
    optionElem.className = 'option';
    // Option inner HTML with text and icon span
    optionElem.innerHTML = `
      <span class="option-text">${optionText}</span>
      <span class="option-icon"></span>
    `;
    // Click event for this option
    optionElem.addEventListener('click', (e) => {
      // Prevent double clicking
      if (quizEnded) return;
      handleOptionSelect(optionElem, i);
    });
    // Add option to container
    optionsContainer.appendChild(optionElem);
  });
}

// Handle user selecting an option// Handle user selecting an option
// Handle user selecting an option
// Handle user selecting an option
// Handle user selecting an option
function handleOptionSelect(optionElem, selectedIndex) {
  const correctOption = currentQuestion.correct; // Correct answer for single-choice questions
  const selectedOptionText = currentQuestion.options[selectedIndex];

  // Check if selected option is correct
  if (selectedIndex !== null && selectedOptionText.startsWith( correctOption)) {
    // Correct answer: mark this option as correct and increase score
    optionElem.classList.add('correct');
    score += 10; // add 10 points
    // Disable clicking and move to next question after 1 second
    disableOptions();
    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  } else {
    // Wrong answer: mark this option as wrong and highlight correct answer
    optionElem.classList.add('wrong');
    
    // Find and highlight the correct option
    // Search through options to find the one that contains the correct answer
    let correctOptionFound = false;
    const options = Array.from(optionsContainer.children);
    
    for (let i = 0; i < options.length; i++) {
      // Check if this option matches the correct answer
      if (currentQuestion.options[i] === correctOption) {
        options[i].classList.add('correct');
        correctOptionFound = true;
        break;
      }
    }
    
    // If we couldn't find the exact match, try a more flexible approach
    if (!correctOptionFound) {
      console.log("Correct option not found, trying alternative method");
      for (let i = 0; i < options.length; i++) {
        // Check if the correct answer is contained within this option
        if (currentQuestion.options[i].includes(correctOption)) {
          options[i].classList.add('correct');
          break;
        }
      }
    }

    // Disable clicking and move to next question after 2 seconds
    // Give more time to see the correct answer
    disableOptions();
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  }
} 
// Disable all options (for preventing further clicks after answering)
function disableOptions() {
  Array.from(optionsContainer.children).forEach(opt => {
    opt.style.pointerEvents = 'none';
  });
}

// Move to the next question (reset the question state and show next question)
function moveToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length && !quizEnded) {
    showQuestion(currentQuestionIndex);
  } else {
    endQuiz();
  }
}


// End the quiz and show the result screen
// End the quiz and show the result screen
function endQuiz() {
  if (quizEnded) return; // prevent multiple calls
  quizEnded = true;
  // Stop the timer if still running
  clearInterval(timerInterval);
  // Hide quiz content and show result within the same container
  questionNumElem.style.display = 'none';
  questionTextElem.style.display = 'none';
  optionsContainer.style.display = 'none';
  // Show result container in the same position
  resultContainer.style.display = 'block';
  // Calculate score and display it
  scoreTextElem.innerText = `您的得分：${score} 分（共${questions.length}题，每题10分，满分100分）`;
} 

// Fetch questions from questions.json and start the quiz
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Randomly shuffle and select 10 questions
    data.sort(() => 0.5 - Math.random());
    questions = data.slice(0, 10);
    // Initialize quiz state
    currentQuestionIndex = 0;
    score = 0;
    quizEnded = false;
    // Show the first question and start the timer
    showQuestion(currentQuestionIndex);
    startTimer(100);
  })
  .catch(error => {
    console.error('Error loading questions:', error);
    // In case of error, display a message
    questionTextElem.innerText = "无法加载题目数据。";
  });
