function ModuleCard({
  module,
  disasterEmoji,
  isCompleted,
  isCompleting,
  completionMessage,
  onComplete,
}) {
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
        {isCompleted && <span className="completed-badge">✅ Completed</span>}
      </div>

      <p>{module.description || 'No description provided.'}</p>

      <button
        className="complete-button"
        type="button"
        disabled={isCompleting || isCompleted}
        onClick={() => onComplete(module.id)}
      >
        {isCompleting ? 'Completing...' : isCompleted ? 'Completed' : 'Complete Module'}
      </button>

      {completionMessage && <p className="completion-message">{completionMessage}</p>}
    </article>
  );
}

export default ModuleCard;
