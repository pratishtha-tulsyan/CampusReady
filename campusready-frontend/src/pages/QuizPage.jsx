import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getQuizByModule, getQuizQuestions, submitQuiz, checkIfQuizPassed } from '../services/api';
import './QuizPage.css';

function QuizPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await getQuizByModule(moduleId);
        setQuiz(quizData);

        // Check if user already passed this quiz
        const passedData = await checkIfQuizPassed(quizData.id);
        if (passedData.passed) {
          setAlreadyPassed(true);
        }

        const questionsData = await getQuizQuestions(quizData.id);
        setQuestions(questionsData);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [moduleId]);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion?.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allAnswered = questions.every((q) => answers[q.id]);
    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setLoading(true);
      const resultData = await submitQuiz(quiz.id, answers);
      setResult(resultData);
      setQuizSubmitted(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizSubmitted(false);
    setResult(null);
  };

  const handleGoBack = () => {
    navigate(`/modules/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <Navbar />
        <div className="quiz-container">
          <div className="loading">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (error && !quizSubmitted) {
    return (
      <div className="quiz-page">
        <Navbar />
        <div className="quiz-container">
          <div className="error-message">{error}</div>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back to Module
          </button>
        </div>
      </div>
    );
  }

  if (quizSubmitted && result) {
    return (
      <div className="quiz-page">
        <Navbar />
        <div className="quiz-container quiz-result">
          <div className="result-card">
            <div className={`result-header ${result.passed ? 'passed' : 'failed'}`}>
              <div className="result-icon">
                {result.passed ? '✅' : '❌'}
              </div>
              <h2>{result.message}</h2>
            </div>

            <div className="result-details">
              <div className="result-stat">
                <span className="label">Score</span>
                <span className="value">{result.score}%</span>
              </div>
              <div className="result-stat">
                <span className="label">Correct Answers</span>
                <span className="value">{result.correctAnswers}/{result.totalQuestions}</span>
              </div>
              <div className="result-stat">
                <span className="label">Passing Score</span>
                <span className="value">{quiz.passingScore}%</span>
              </div>
            </div>

            <div className="result-actions">
              {!result.passed && (
                <button className="btn btn-primary" onClick={handleRetry}>
                  Retry Quiz
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleGoBack}>
                Back to Module
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyPassed && !quizSubmitted) {
    return (
      <div className="quiz-page">
        <Navbar />
        <div className="quiz-container">
          <div className="passed-message">
            <h2>Quiz Already Passed ✅</h2>
            <p>You have already successfully completed this quiz.</p>
            <button className="btn btn-secondary" onClick={handleGoBack}>
              Back to Module
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-page">
        <Navbar />
        <div className="quiz-container">
          <div className="error-message">No questions available</div>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Back to Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <Navbar />
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>{quiz.title}</h1>
          <p className="quiz-description">{quiz.description}</p>
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        <div className="question-section">
          <div className="question-number">Question {currentQuestionIndex + 1}</div>
          <h2 className="question-text">{currentQuestion.questionText}</h2>

          <div className="options-container">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = currentQuestion[`option${option}`];
              const isSelected = answers[currentQuestion.id] === option;

              return (
                <button
                  key={option}
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <span className="option-letter">{option}</span>
                  <span className="option-text">{optionText}</span>
                </button>
              );
            })}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="quiz-controls">
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            <div className="button-group">
              {!isLastQuestion && (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!isAnswered}
                >
                  Next →
                </button>
              )}
              {isLastQuestion && (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={!isAnswered || loading}
                >
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>

          <div className="quiz-footer">
            <p>
              {Object.keys(answers).length}/{questions.length} answered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
