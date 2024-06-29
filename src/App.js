import React, { useState, useEffect } from 'react';

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

  const handleDescriptionChange = (e) => {
    const wordCount = e.target.value.split(' ').filter(Boolean).length;
    if (wordCount <= 250) {
      setNewIdea({ ...newIdea, description: e.target.value });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="font-sans text-gray-900 min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-300 p-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-blue-600 text-lg">Cycle Management App</span>
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={() => setIsModalOpen(true)}>Create New Cycle</button>
      </header>

      <main className="flex-1 p-6 bg-gray-100 flex">
        <div className="flex-1 space-y-4">
          {cycles.map((cycle, cycleIndex) => (
            <div key={cycle.name} className="bg-white border border-gray-300 rounded shadow-sm">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedCycleIndex(expandedCycleIndex === cycleIndex ? null : cycleIndex)}
              >
                <h3 className="font-semibold">{cycle.name}</h3>
                <span>{cycle.startDate} - {cycle.endDate}</span>
                <span>Goal: {cycle.goal}</span>
                <button className="text-xl">&#x25BC;</button>
                <button onClick={() => deleteCycle(cycleIndex)} className="text-red-600 hover:text-red-400">Delete</button>
              </div>
              {expandedCycleIndex === cycleIndex && (
                <div className="p-4 border-t border-gray-300">
                  <h4 className="font-semibold mb-2">Ideas</h4>
                  <div className="space-y-2">
                    {cycle.ideas.sort((a, b) => b.votes - a.votes).map((idea, ideaIndex) => (
                      <div key={idea.title} className="flex items-center bg-gray-100 border border-gray-300 rounded p-2 hover:shadow-md">
                        <div className="text-lg font-bold text-gray-700 mr-4">{idea.votes}</div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{idea.title}</h5>
                          <p>{idea.description}</p>
                        </div>
                        <button className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-500" onClick={() => voteIdea(cycleIndex, ideaIndex)}>
                          Vote
                        </button>
                        <button onClick={() => deleteIdea(cycleIndex, ideaIndex)} className="text-red-600 hover:text-red-400 ml-2">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="w-64 bg-white border border-gray-300 rounded shadow-sm p-4 ml-4">
          <h3 className="font-semibold mb-2">Suggest an idea</h3>
          <input
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Idea Title"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
          />
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Write your suggestion here..."
            value={newIdea.description}
            onChange={handleDescriptionChange}
          />
          <select
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={newIdea.cycleIndex}
            onChange={(e) => setNewIdea({ ...newIdea, cycleIndex: e.target.value })}
          >
            <option value={null}>Select Cycle</option>
            {cycles.map((cycle, index) => (
              <option key={cycle.name} value={index}>{cycle.name}</option>
            ))}
          </select>
          <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-500" onClick={() => newIdea.cycleIndex !== null && addIdea(newIdea.cycleIndex)}>
            Submit
          </button>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Cycle</h2>
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Cycle Name"
              value={newCycle.name}
              onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              type="date"
              placeholder="Start Date"
              value={newCycle.startDate}
              onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              type="date"
              placeholder="End Date"
              value={newCycle.endDate}
              onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Cycle Goal"
              value={newCycle.goal}
              onChange={(e) => setNewCycle({ ...newCycle, goal: e.target.value })}
            />
            <div className="flex justify-between">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={addCycle}>Add Cycle</button>
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
