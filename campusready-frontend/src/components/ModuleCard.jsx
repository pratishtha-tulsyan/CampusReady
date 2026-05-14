function ModuleCard({
  module,
  isCompleting,
  completionMessage,
  onComplete,
}) {
  return (
    <article className="module-card">
      <span className="module-type">{module.disasterType || 'General'}</span>
      <h2>{module.title || 'Untitled module'}</h2>
      <p>{module.description || 'No description provided.'}</p>
      <button
        className="complete-button"
        type="button"
        disabled={isCompleting}
        onClick={() => onComplete(module.id)}
      >
        {isCompleting ? 'Completing...' : 'Complete Module'}
      </button>
      {completionMessage && <p className="completion-message">{completionMessage}</p>}
    </article>
  );
}

export default ModuleCard;
