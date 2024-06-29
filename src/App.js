import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

function App() {
  const [cycles, setCycles] = useState([]);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '', goal: '' });
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });
  const [expandedCycleIndex, setExpandedCycleIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [cycles]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setCycles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cycles }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Save result:', result);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };


  const addCycle = () => {
    if (newCycle.name && newCycle.startDate && newCycle.endDate && newCycle.goal) {
      setCycles([...cycles, { ...newCycle, ideas: [] }]);
      setNewCycle({ name: '', startDate: '', endDate: '', goal: '' });
      setIsModalOpen(false);
    }
  };

  const addIdea = (cycleIndex) => {
    if (newIdea.title && newIdea.description) {
      const updatedCycles = [...cycles];
      updatedCycles[cycleIndex].ideas.push({ ...newIdea, votes: 0, comments: [] });
      setCycles(updatedCycles);
      setNewIdea({ title: '', description: '' });
    }
  };

  const voteIdea = (cycleIndex, ideaIndex) => {
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex].ideas[ideaIndex].votes += 1;
    setCycles(updatedCycles);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <span className={styles.logo}>Cycle Management App</span>
          <button className={styles.newCycleButton} onClick={() => setIsModalOpen(true)}>Create New Cycle</button>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.cycleList}>
          {cycles.map((cycle, cycleIndex) => (
            <div key={cycle.name} className={styles.cycleCard}>
              <div 
                className={styles.cycleHeader} 
                onClick={() => setExpandedCycleIndex(expandedCycleIndex === cycleIndex ? null : cycleIndex)}
              >
                <h3>{cycle.name}</h3>
                <span>{cycle.startDate} - {cycle.endDate}</span>
                <span>Goal: {cycle.goal}</span>
                <button className={styles.expandButton}>
                  {expandedCycleIndex === cycleIndex ? '▲' : '▼'}
                </button>
              </div>
              {expandedCycleIndex === cycleIndex && (
                <div className={styles.cycleContent}>
                  <h4>Ideas</h4>
                  <div className={styles.ideaList}>
                    {cycle.ideas.sort((a, b) => b.votes - a.votes).map((idea, ideaIndex) => (
                      <div key={idea.title} className={styles.ideaCard}>
                        <div className={styles.voteCount}>{idea.votes}</div>
                        <div className={styles.ideaContent}>
                          <h5>{idea.title}</h5>
                          <p>{idea.description}</p>
                        </div>
                        <button className={styles.voteButton} onClick={() => voteIdea(cycleIndex, ideaIndex)}>
                          Vote
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.newIdeaForm}>
                    <input
                      className={styles.input}
                      placeholder="Idea Title"
                      value={newIdea.title}
                      onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    />
                    <textarea
                      className={styles.textarea}
                      placeholder="Idea Description"
                      value={newIdea.description}
                      onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    />
                    <button className={styles.submitButton} onClick={() => addIdea(cycleIndex)}>Add Idea</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create New Cycle</h2>
            <input
              className={styles.input}
              placeholder="Cycle Name"
              value={newCycle.name}
              onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
            />
            <input
              className={styles.input}
              type="date"
              placeholder="Start Date"
              value={newCycle.startDate}
              onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
            />
            <input
              className={styles.input}
              type="date"
              placeholder="End Date"
              value={newCycle.endDate}
              onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder="Cycle Goal"
              value={newCycle.goal}
              onChange={(e) => setNewCycle({ ...newCycle, goal: e.target.value })}
            />
            <div className={styles.modalButtons}>
              <button className={styles.submitButton} onClick={addCycle}>Add Cycle</button>
              <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;