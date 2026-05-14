import { useEffect, useState } from 'react';
import ModuleCard from '../components/ModuleCard';
import Navbar from '../components/Navbar';
import { completeModule, getModules } from '../services/api';

const DEFAULT_USER_ID = 1;

function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [modulesMessage, setModulesMessage] = useState('');
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  const [completionMessages, setCompletionMessages] = useState({});
  const [completingModuleId, setCompletingModuleId] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      setModulesMessage('');
      setIsModulesLoading(true);

      try {
        const modulesData = await getModules();
        setModules(modulesData);
      } catch {
        setModulesMessage('Unable to load modules. Please try again later.');
      } finally {
        setIsModulesLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleCompleteModule = async (moduleId) => {
    if (!moduleId) {
      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        unknown: 'Unable to complete this module because it is missing an id.',
      }));
      return;
    }

    setCompletingModuleId(moduleId);
    setCompletionMessages((currentMessages) => ({
      ...currentMessages,
      [moduleId]: '',
    }));

    try {
      await completeModule({
        userId: DEFAULT_USER_ID,
        moduleId,
        completed: true,
        completedAt: new Date().toISOString().slice(0, 19),
      });

      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        [moduleId]: 'Module completed successfully.',
      }));
    } catch {
      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        [moduleId]: 'Unable to complete module. Please try again.',
      }));
    } finally {
      setCompletingModuleId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Training Modules</h1>
            <p>Review disaster readiness modules built for campus safety teams.</p>
          </div>
        </section>

        {isModulesLoading && <p className="dashboard-status">Loading modules...</p>}
        {modulesMessage && <p className="dashboard-status error">{modulesMessage}</p>}

        {!isModulesLoading && !modulesMessage && modules.length === 0 && (
          <p className="dashboard-status">No modules are available yet.</p>
        )}

        <section className="modules-grid" aria-label="CampusReady modules">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id || module.title || index}
              module={module}
              isCompleting={completingModuleId === module.id}
              completionMessage={completionMessages[module.id]}
              onComplete={handleCompleteModule}
            />
          ))}
        </section>
      </main>
    </>
  );
}

export default ModulesPage;
