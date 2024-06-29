import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

function App() {
  const [cycles, setCycles] = useState([]);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '', goal: '' });
  const [newIdea, setNewIdea] = useState({ title: '', description: '', cycleIndex: null });
  const [expandedCycleIndex, setExpandedCycleIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setCycles(data); // Set cycles directly from fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Save result:', result);
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data. Please try again.');
    }
  };

  const addCycle = () => {
    if (newCycle.name && newCycle.startDate && newCycle.endDate && newCycle.goal) {
      const updatedCycles = [...cycles, { ...newCycle, ideas: [] }];
      saveData({ cycles: updatedCycles });
      setCycles(updatedCycles);
      setNewCycle({ name: '', startDate: '', endDate: '', goal: '' });
      setIsModalOpen(false);
    }
  };

  const addIdea = (cycleIndex) => {
    if (newIdea.title && newIdea.description) {
      const updatedCycles = [...cycles];
      updatedCycles[cycleIndex].ideas.push({ ...newIdea, votes: 0, comments: [] });
      saveData({ cycles: updatedCycles });
      setCycles(updatedCycles);
      setNewIdea({ title: '', description: '', cycleIndex: null });
    }
  };

  const voteIdea = (cycleIndex, ideaIndex) => {
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex].ideas[ideaIndex].votes += 1;
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
  };

  const deleteCycle = (cycleIndex) => {
    const updatedCycles = cycles.filter((_, index) => index !== cycleIndex);
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
  };

  const deleteIdea = (cycleIndex, ideaIndex) => {
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex].ideas = updatedCycles[cycleIndex].ideas.filter((_, index) => index !== ideaIndex);
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
                <button onClick={() => deleteCycle(cycleIndex)} className={styles.deleteButton}>Delete</button>
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
                        <button onClick={() => deleteIdea(cycleIndex, ideaIndex)} className={styles.deleteButton}>Delete</button>
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
        <div className={styles.sidebar}>
          <h3>Suggest an idea</h3>
          <textarea
            className={styles.input}
            placeholder="Write your suggestion here..."
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Idea Title"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
          />
          <select
            className={styles.input}
            value={newIdea.cycleIndex}
            onChange={(e) => setNewIdea({ ...newIdea, cycleIndex: e.target.value })}
          >
            <option value={null}>Select Cycle</option>
            {cycles.map((cycle, index) => (
              <option key={cycle.name} value={index}>{cycle.name}</option>
            ))}
          </select>
          <button className={styles.submitButton} onClick={() => newIdea.cycleIndex !== null && addIdea(newIdea.cycleIndex)}>
            Submit
          </button>
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
