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
let userSelections = [];

// DOM elements
const questionText = document.getElementById('question-text');
const answerContainer = document.getElementById('answer-container');
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
    answerContainer.innerHTML = '';
    feedback.textContent = '';
    nextBtn.style.display = 'none';

    if (question.type === 'open-ended') {
        renderOpenEndedQuestion(question);
    } else if (question.type === 'multiple-choice') {
        renderMultipleChoiceQuestion(question);
    } else if (question.type === 'quantitative-comparison') {
        renderQuantitativeComparisonQuestion(question);
    } else if (question.type === 'select-multiple') {
        renderSelectMultipleQuestion(question);
    }
}

// Render open-ended question
function renderOpenEndedQuestion(question) {
    if (question.fraction) {
        answerContainer.innerHTML = `
            <div class="fraction-box">
                <input type="text" id="numerator" placeholder="Numerator">
                <div class="fraction-line"></div>
                <input type="text" id="denominator" placeholder="Denominator">
            </div>
            <button class="submit-btn" id="submit-btn">Submit</button>
        `;
    } else {
        answerContainer.innerHTML = `
            <input type="text" id="answer-input" placeholder="Your Answer">
            <button class="submit-btn" id="submit-btn">Submit</button>
        `;
    }

    document.getElementById('submit-btn').addEventListener('click', () => {
        submitOpenEndedAnswer(question);
    });
}

// Submit open-ended answer
function submitOpenEndedAnswer(question) {
    clearInterval(stopwatchInterval);
    let userAnswer;

    if (question.fraction) {
        const numerator = document.getElementById('numerator').value.trim();
        const denominator = document.getElementById('denominator').value.trim();
        userAnswer = `${numerator}/${denominator}`;
    } else {
        userAnswer = document.getElementById('answer-input').value.trim();
    }

    if (userAnswer === question.correctAnswer) {
        document.getElementById(question.fraction ? 'numerator' : 'answer-input').className = 'correct-input';
        correctAnswers++;
        setTimeout(nextQuestion, 1000);
    } else {
        document.getElementById(question.fraction ? 'numerator' : 'answer-input').className = 'incorrect-input';
        incorrectAnswers++;
        incorrectQuestions.push({
            question: question.question,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
        feedback.innerHTML = `<strong>Correct Answer:</strong> ${question.correctAnswer}<br><strong>Explanation:</strong> ${question.explanation}`;
        nextBtn.style.display = 'block';
    }
}

// Render multiple-choice question
function renderMultipleChoiceQuestion(question) {
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(option, question.correctAnswer, question.explanation);
        answerContainer.appendChild(button);
    });
}

// Render quantitative comparison question
function renderQuantitativeComparisonQuestion(question) {
    const options = [
        'A. Quantity A is greater',
        'B. Quantity B is greater',
        'C. The two quantities are equal',
        'D. The relationship cannot be determined from the information given'
    ];

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(option[0], question.correctAnswer, question.explanation);
        answerContainer.appendChild(button);
    });
}

// Render select multiple question
function renderSelectMultipleQuestion(question) {
    question.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'checkbox-option';
        div.innerHTML = `
            <input type="checkbox" id="option-${index}" value="${option[0]}">
            <label for="option-${index}">${option}</label>
        `;
        answerContainer.appendChild(div);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'submit-btn';
    submitBtn.textContent = 'Submit';
    submitBtn.onclick = () => submitMultipleAnswers(question);
    answerContainer.appendChild(submitBtn);
}

// Submit multiple answers
function submitMultipleAnswers(question) {
    clearInterval(stopwatchInterval);
    const selectedOptions = [];
    question.options.forEach((_, index) => {
        const checkbox = document.getElementById(`option-${index}`);
        if (checkbox.checked) {
            selectedOptions.push(checkbox.value);
        }
    });

    const isCorrect = JSON.stringify(selectedOptions.sort()) === JSON.stringify(question.correctAnswer.sort());

    if (isCorrect) {
        correctAnswers++;
        setTimeout(nextQuestion, 1000);
    } else {
        incorrectAnswers++;
        incorrectQuestions.push({
            question: question.question,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
        feedback.innerHTML = `<strong>Correct Answer:</strong> ${question.correctAnswer.join(', ')}<br><strong>Explanation:</strong> ${question.explanation}`;
        nextBtn.style.display = 'block';
    }
}

// Select an answer for multiple-choice or quantitative comparison
function selectAnswer(selectedOption, correctAnswer, explanation) {
    clearInterval(stopwatchInterval);
    const buttons = answerContainer.querySelectorAll('.option-btn');

    buttons.forEach(button => {
        if (button.textContent[0] === selectedOption) {
            button.className = selectedOption === correctAnswer ? 'option-btn correct' : 'option-btn incorrect';
        }
        if (button.textContent[0] === correctAnswer) {
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
            question: questionText.textContent,
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
