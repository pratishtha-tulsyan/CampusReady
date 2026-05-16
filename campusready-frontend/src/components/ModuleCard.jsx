import { useNavigate } from 'react-router-dom';

function ModuleCard({
  module,
  disasterEmoji,
  isCompleted,
  isCompleting,
  completionMessage,
  onComplete,
}) {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/quiz/${module.id}`);
  };

  return (
    <article className={`module-card${isCompleted ? ' completed-card' : ''}`}>
      <div className="module-card-header">
        <div>
          <div className="module-card-title-row">
            <span className="module-emoji">{disasterEmoji}</span>
            <h2>{module.title || 'Untitled module'}</h2>
          </div>
          <span className="module-type">{module.disasterType || 'General'}</span>
        </div>
        {isCompleted && <span className="completed-badge">Quiz Passed ✅</span>}
      </div>

      <p>{module.description || 'No description provided.'}</p>

      <div className="module-card-actions">
        <button
          className="complete-button"
          type="button"
          disabled={isCompleting || isCompleted}
          onClick={() => onComplete(module.id)}
        >
          {isCompleting ? 'Completing...' : isCompleted ? 'Completed' : 'Complete Module'}
        </button>

        <button
          className="quiz-button"
          type="button"
          onClick={handleStartQuiz}
          disabled={isCompleted}
          title={isCompleted ? 'Quiz already passed' : 'Start quiz for this module'}
        >
          {isCompleted ? 'Quiz Passed ✅' : '📝 Start Quiz'}
        </button>
      </div>

      {completionMessage && <p className="completion-message">{completionMessage}</p>}
    </article>
  );
}

export default ModuleCard;
