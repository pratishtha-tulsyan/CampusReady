import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getModules, createQuiz, getQuizByModule, addQuestionToQuiz, getQuizQuestions, deleteQuestion, deleteQuiz } from '../services/api';
import './AdminQuizPage.css';

function AdminQuizPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('create-quiz');

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    questionNumber: 1,
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const data = await getModules();
        setModules(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleModuleSelect = async (moduleId) => {
    try {
      setLoading(true);
      const selectedMod = modules.find((m) => m.id === moduleId);
      setSelectedModule(selectedMod);

      try {
        const quizData = await getQuizByModule(moduleId);
        setQuiz(quizData);
        const questionsData = await getQuizQuestions(quizData.id);
        setQuestions(questionsData);
        setActiveTab('manage-questions');
      } catch {
        setQuiz(null);
        setQuestions([]);
        setActiveTab('create-quiz');
        setQuizForm({
          title: `${selectedMod.title} Quiz`,
          description: `Assessment for ${selectedMod.title} module`,
          passingScore: 70,
        });
      }

      setError('');
    } catch (err) {
      setError(err.message || 'Failed to select module');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedModule) {
      setError('Please select a module first');
      return;
    }

    try {
      setLoading(true);
      const newQuiz = await createQuiz({
        moduleId: selectedModule.id,
        ...quizForm,
      });
      setQuiz(newQuiz);
      setQuestions([]);
      setSuccessMessage('Quiz created successfully!');
      setActiveTab('manage-questions');
      setError('');
      setQuestionForm({ ...questionForm, questionNumber: 1 });
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!quiz) {
      setError('Quiz must be created first');
      return;
    }

    try {
      setLoading(true);
      await addQuestionToQuiz(quiz.id, questionForm);
      const updatedQuestions = await getQuizQuestions(quiz.id);
      setQuestions(updatedQuestions);
      setSuccessMessage('Question added successfully!');
      setQuestionForm({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        questionNumber: updatedQuestions.length + 1,
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoading(true);
      await deleteQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
      setSuccessMessage('Question deleted successfully!');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;

    try {
      setLoading(true);
      await deleteQuiz(quiz.id);
      setQuiz(null);
      setQuestions([]);
      setSelectedModule(null);
      setSuccessMessage('Quiz deleted successfully!');
      setError('');
      setActiveTab('create-quiz');
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-quiz-page">
      <Navbar />
      <div className="page-container">
        <div className="admin-quiz-container">
          <div className="admin-quiz-header">
          <h1>Quiz Management</h1>
          <p>Create and manage quizzes for training modules</p>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/modules')}>
            ← Back to Admin Dashboard
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            <button onClick={() => setSuccessMessage('')}>✕</button>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="quiz-management-layout">
          <aside className="module-selector">
            <h3>Select Module</h3>
            <div className="module-list">
              {modules.length === 0 ? (
                <p>No modules available</p>
              ) : (
                modules.map((mod) => (
                  <button
                    key={mod.id}
                    className={`module-option ${selectedModule?.id === mod.id ? 'active' : ''}`}
                    onClick={() => handleModuleSelect(mod.id)}
                  >
                    <span className="module-title">{mod.title}</span>
                    <span className="module-type">{mod.disasterType}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className="quiz-management-main">
            {!selectedModule ? (
              <div className="empty-state">
                <p>Select a module to manage its quiz</p>
              </div>
            ) : (
              <>
                <div className="tab-navigation">
                  <button
                    className={`tab-button ${activeTab === 'create-quiz' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create-quiz')}
                  >
                    {quiz ? 'Quiz Details' : 'Create Quiz'}
                  </button>
                  {quiz && (
                    <button
                      className={`tab-button ${activeTab === 'manage-questions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('manage-questions')}
                    >
                      Questions ({questions.length})
                    </button>
                  )}
                </div>

                {activeTab === 'create-quiz' && (
                  <div className="quiz-form-section">
                    {!quiz ? (
                      <form onSubmit={handleCreateQuiz} className="quiz-form">
                        <h2>Create Quiz for {selectedModule.title}</h2>

                        <div className="form-group">
                          <label htmlFor="title">Quiz Title</label>
                          <input
                            id="title"
                            type="text"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                            placeholder="Quiz title"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="description">Description</label>
                          <textarea
                            id="description"
                            value={quizForm.description}
                            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                            placeholder="Quiz description"
                            rows={3}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="passingScore">Passing Score (%)</label>
                          <input
                            id="passingScore"
                            type="number"
                            min="0"
                            max="100"
                            value={quizForm.passingScore}
                            onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Quiz'}
                        </button>
                      </form>
                    ) : (
                      <div className="quiz-details">
                        <h2>{quiz.title}</h2>
                        <p>{quiz.description}</p>
                        <div className="quiz-metadata">
                          <div className="meta-item">
                            <span className="label">Passing Score:</span>
                            <span className="value">{quiz.passingScore}%</span>
                          </div>
                          <div className="meta-item">
                            <span className="label">Total Questions:</span>
                            <span className="value">{questions.length}</span>
                          </div>
                          <div className="meta-item">
                            <span className="label">Status:</span>
                            <span className="value">{quiz.active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-danger"
                          onClick={handleDeleteQuiz}
                          disabled={loading}
                        >
                          Delete Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'manage-questions' && quiz && (
                  <div className="questions-section">
                    <div className="add-question-form">
                      <h2>Add Question</h2>
                      <form onSubmit={handleAddQuestion}>
                        <div className="form-group">
                          <label htmlFor="questionText">Question Text</label>
                          <textarea
                            id="questionText"
                            value={questionForm.questionText}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, questionText: e.target.value })
                            }
                            placeholder="Enter the question"
                            rows={3}
                            required
                          />
                        </div>

                        <div className="options-grid">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option} className="form-group">
                              <label htmlFor={`option${option}`}>Option {option}</label>
                              <input
                                id={`option${option}`}
                                type="text"
                                value={questionForm[`option${option}`]}
                                onChange={(e) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    [`option${option}`]: e.target.value,
                                  })
                                }
                                placeholder={`Option ${option}`}
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="form-group">
                          <label htmlFor="correctAnswer">Correct Answer</label>
                          <select
                            id="correctAnswer"
                            value={questionForm.correctAnswer}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, correctAnswer: e.target.value })
                            }
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Question'}
                        </button>
                      </form>
                    </div>

                    <div className="questions-list">
                      <h2>Questions ({questions.length})</h2>
                      {questions.length === 0 ? (
                        <p className="empty-message">No questions added yet. Add your first question above.</p>
                      ) : (
                        <div className="questions">
                          {questions.map((question) => (
                            <div key={question.id} className="question-item">
                              <div className="question-content">
                                <div className="question-number">Q{question.questionNumber}</div>
                                <div className="question-details">
                                  <p className="question-text">{question.questionText}</p>
                                  <div className="question-options">
                                    {['A', 'B', 'C', 'D'].map((option) => (
                                      <div
                                        key={option}
                                        className={`option ${question.correctAnswer === option ? 'correct' : ''}`}
                                      >
                                        <span className="option-letter">{option}</span>
                                        <span className="option-content">
                                          {question[`option${option}`]}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDeleteQuestion(question.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  </div>
  );
}

export default AdminQuizPage;
