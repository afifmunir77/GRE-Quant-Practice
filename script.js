// Load questions from JSON
let questions = [];
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        startQuiz();
    })
    .catch(error => console.error('Error loading questions:', error));

// Quiz state
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let timeTaken = 0;
let stopwatchInterval;
let incorrectQuestions = [];

// DOM elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const resultsContainer = document.getElementById('results-container');
const reviewContainer = document.getElementById('review-container');
const reviewQuestions = document.getElementById('review-questions');
const scoreText = document.getElementById('score-text');
const timeText = document.getElementById('time-text');
const stopwatch = document.getElementById('stopwatch');
const progressBar = document.getElementById('progress-bar');
const reviewBtn = document.getElementById('review-btn');
const backBtn = document.getElementById('back-btn');

// Start the quiz
function startQuiz() {
    showQuestion();
    startStopwatch();
    updateProgressBar();
}

// Show current question
function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.innerHTML = question.question;

    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(option, question.correctAnswer, question.explanation);
        optionsContainer.appendChild(button);
    });

    feedback.textContent = '';
    nextBtn.style.display = 'none';
}

// Select an answer
function selectAnswer(selectedOption, correctAnswer, explanation) {
    clearInterval(stopwatchInterval);

    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        if (button.textContent === selectedOption) {
            button.className = selectedOption === correctAnswer ? 'option-btn correct' : 'option-btn incorrect';
        }
        if (button.textContent === correctAnswer) {
            button.className = 'option-btn correct';
        }
        button.disabled = true;
    });

    if (selectedOption === correctAnswer) {
        correctAnswers++;
        setTimeout(nextQuestion, 1000);
    } else {
        incorrectAnswers++;
        incorrectQuestions.push({
            question: questions[currentQuestionIndex].question,
            correctAnswer,
            explanation
        });
        feedback.innerHTML = `<strong>Correct Answer:</strong> ${correctAnswer}<br><strong>Explanation:</strong> ${explanation}`;
        nextBtn.style.display = 'block';
    }
}

// Move to the next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        startStopwatch();
        updateProgressBar();
    } else {
        showResults();
    }
}

// Start the stopwatch
function startStopwatch() {
    let seconds = 0;
    stopwatchInterval = setInterval(() => {
        seconds++;
        timeTaken++;
        stopwatch.textContent = formatTime(seconds);
    }, 1000);
}

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Show results
function showResults() {
    clearInterval(stopwatchInterval);
    document.querySelector('.question-container').style.display = 'none';
    resultsContainer.style.display = 'block';
    scoreText.textContent = `Score: ${correctAnswers} correct, ${incorrectAnswers} incorrect`;
    timeText.textContent = `Total Time: ${formatTime(timeTaken)}`;
}

// Show review screen
function showReview() {
    resultsContainer.style.display = 'none';
    reviewContainer.style.display = 'block';

    reviewQuestions.innerHTML = '';
    incorrectQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
            <p><strong>Explanation:</strong> ${q.explanation}</p>
            <hr>
        `;
        reviewQuestions.appendChild(questionDiv);
    });
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);
reviewBtn.addEventListener('click', showReview);
backBtn.addEventListener('click', () => {
    reviewContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
});
