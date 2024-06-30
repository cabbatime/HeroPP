import React, { useState, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';

function App() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(null);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '', goal: '' });
  const [newIdea, setNewIdea] = useState({ title: '', description: '', cycleIndex: null });
  const [newComment, setNewComment] = useState({ text: '', name: '' });
  const [expandedIdeaIndex, setExpandedIdeaIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = useState(false);
  const [isEditIdeaModalOpen, setIsEditIdeaModalOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState(null);
  const [ideaToEdit, setIdeaToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCycleMenuIndex, setOpenCycleMenuIndex] = useState(null);
  const [openIdeaMenuIndex, setOpenIdeaMenuIndex] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(null);
  const cycleMenuRef = useRef(null);
  const ideaMenuRef = useRef(null);

  useClickAway(cycleMenuRef, () => {
    setOpenCycleMenuIndex(null);
  });

  useClickAway(ideaMenuRef, () => {
    setOpenIdeaMenuIndex(null);
  });

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
      setIsIdeaModalOpen(false);
    }
  };

  const addComment = (cycleIndex, ideaIndex) => {
    if (newComment.text) {
      const updatedCycles = [...cycles];
      const comment = { text: newComment.text, name: newComment.name || 'Anonymous' };
      updatedCycles[cycleIndex].ideas[ideaIndex].comments.push(comment);
      saveData({ cycles: updatedCycles });
      setCycles(updatedCycles);
      setNewComment({ text: '', name: '' });
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

  const openEditCycleModal = (cycleIndex) => {
    setCycleToEdit({ ...cycles[cycleIndex], index: cycleIndex });
    setIsEditCycleModalOpen(true);
  };

  const openEditIdeaModal = (cycleIndex, ideaIndex) => {
    setIdeaToEdit({ ...cycles[cycleIndex].ideas[ideaIndex], cycleIndex, index: ideaIndex });
    setIsEditIdeaModalOpen(true);
  };

  const saveEditedCycle = () => {
    const updatedCycles = [...cycles];
    updatedCycles[cycleToEdit.index] = { ...cycleToEdit };
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setIsEditCycleModalOpen(false);
  };

  const saveEditedIdea = () => {
    const updatedCycles = [...cycles];
    updatedCycles[ideaToEdit.cycleIndex].ideas[ideaToEdit.index] = { ...ideaToEdit };
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setIsEditIdeaModalOpen(false);
  };

  const toggleCycleMenu = (index) => {
    setOpenCycleMenuIndex(openCycleMenuIndex === index ? null : index);
  };

  const toggleIdeaMenu = (index) => {
    setOpenIdeaMenuIndex(openIdeaMenuIndex === index ? null : index);
  };

  const handleCycleSelect = (index) => {
    setSelectedCycleIndex(index);
    setExpandedIdeaIndex(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
  }

  const selectedCycle = selectedCycleIndex !== null ? cycles[selectedCycleIndex] : null;

  return (
    <div className="font-sans text-gray-900 min-h-screen flex flex-col bg-gray-800 text-white">
      <header className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-blue-400 text-lg">Your App</span>
      </header>

      <main className="flex-1 p-6 flex space-x-6">
        <div className="w-1/4 bg-gray-900 border border-gray-700 rounded shadow-sm p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-4">Cycles</h3>
            <ul className="space-y-2">
              {cycles.map((cycle, index) => (
                <li
                  key={cycle.name}
                  className={`cursor-pointer p-2 rounded ${selectedCycleIndex === index ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                  onClick={() => handleCycleSelect(index)}
                >
                  {cycle.name}
                </li>
              ))}
            </ul>
          </div>
          <button className="bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:bg-blue-500" onClick={() => setIsModalOpen(true)}>
            Create New Cycle
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-gray-900 border border-gray-700 rounded shadow-sm p-4">
            <h3 className="font-semibold mb-2">Share your idea</h3>
            <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-500" onClick={() => setIsIdeaModalOpen(true)}>
              Add Idea
            </button>
          </div>

          {selectedCycle && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{selectedCycle.name}</h3>
                  <span>{selectedCycle.startDate} - {selectedCycle.endDate}</span>
                  <span>Goal: {selectedCycle.goal}</span>
                  <div className="relative" ref={cycleMenuRef}>
                    <button className="text-xl" onClick={(e) => { e.stopPropagation(); toggleCycleMenu(selectedCycleIndex); }}>
                      &#x22EE;
                    </button>
                    {openCycleMenuIndex === selectedCycleIndex && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg">
                        <button 
                          onClick={() => { openEditCycleModal(selectedCycleIndex); setOpenCycleMenuIndex(null); }} 
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { deleteCycle(selectedCycleIndex); setOpenCycleMenuIndex(null); }} 
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded shadow-sm p-4">
                <h4 className="font-semibold mb-2">Ideas</h4>
                <div className="space-y-2">
                  {selectedCycle.ideas.sort((a, b) => b.votes - a.votes).map((idea, ideaIndex) => (
                    <div key={idea.title} className="bg-gray-800 border border-gray-700 rounded shadow-sm p-4 relative group">
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setExpandedIdeaIndex(expandedIdeaIndex === ideaIndex ? null : ideaIndex)}
                      >
                        <div className="flex items-center">
                          <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded mr-4">
                            <button 
                              className="text-xl hover:text-white" 
                              onClick={(e) => { e.stopPropagation(); voteIdea(selectedCycleIndex, ideaIndex); }}
                            >
                              &#x25B2;
                            </button>
                            <div className="text-lg font-bold">{idea.votes}</div>
                          </div>
                          <div className="text-gray-300">
                            <h5 className="font-semibold">{idea.title}</h5>
                            <p className="text-sm">{idea.description}</p>
                          </div>
                        </div>
                        <div className="relative" ref={ideaMenuRef}>
                          <button className="text-xl ml-2" onClick={(e) => { e.stopPropagation(); toggleIdeaMenu(`${selectedCycleIndex}-${ideaIndex}`); }}>
                            &#x22EE;
                          </button>
                          {openIdeaMenuIndex === `${selectedCycleIndex}-${ideaIndex}` && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg">
                              <button 
                                onClick={() => { openEditIdeaModal(selectedCycleIndex, ideaIndex); setOpenIdeaMenuIndex(null); }} 
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => { deleteIdea(selectedCycleIndex, ideaIndex); setOpenIdeaMenuIndex(null); }} 
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent group-hover:bg-white transition-all duration-300"></div>
                      {expandedIdeaIndex === ideaIndex && (
                        <div className="p-4 border-t border-gray-700 bg-gray-700 mt-2 rounded">
                          <h5 className="font-semibold mb-2">{idea.title}</h5>
                          <p>{idea.description}</p>
                          <div className="mt-4">
                            <h6 className="font-semibold mb-2">Comments</h6>
                            <ul className="mb-4 space-y-2">
                              {idea.comments.map((comment, commentIndex) => (
                                <li key={commentIndex} className="bg-gray-600 border border-gray-700 rounded p-2">
                                  <span className="font-semibold">{comment.name}:</span> {comment.text}
                                </li>
                              ))}
                            </ul>
                            {showCommentInput === `${selectedCycleIndex}-${ideaIndex}` ? (
                              <div className="space-y-2">
                                <textarea
                                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
                                  placeholder="Your comment"
                                  value={newComment.text}
                                  onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                                />
                                <input
                                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
                                  placeholder="Your name (optional)"
                                  value={newComment.name}
                                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                                />
                                <div className="flex justify-end space-x-2">
                                  <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setShowCommentInput(null)}>
                                    Cancel
                                  </button>
                                  <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={() => addComment(selectedCycleIndex, ideaIndex)}>
                                    Add Comment
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={() => setShowCommentInput(`${selectedCycleIndex}-${ideaIndex}`)}>
                                Add Comment
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-96 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Create New Cycle</h2>
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Cycle Name"
              value={newCycle.name}
              onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              type="date"
              placeholder="Start Date"
              value={newCycle.startDate}
              onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              type="date"
              placeholder="End Date"
              value={newCycle.endDate}
              onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
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

      {isIdeaModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-96 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Add Idea</h2>
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Idea Title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Write your suggestion here..."
              value={newIdea.description}
              onChange={handleDescriptionChange}
            />
            <select
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              value={newIdea.cycleIndex}
              onChange={(e) => setNewIdea({ ...newIdea, cycleIndex: e.target.value })}
            >
              <option value={null}>Select Cycle</option>
              {cycles.map((cycle, index) => (
                <option key={cycle.name} value={index}>{cycle.name}</option>
              ))}
            </select>
            <div className="flex justify-between">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={() => newIdea.cycleIndex !== null && addIdea(newIdea.cycleIndex)}>
                Submit
              </button>
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setIsIdeaModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isEditCycleModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-96 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Edit Cycle</h2>
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Cycle Name"
              value={cycleToEdit.name}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, name: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              type="date"
              placeholder="Start Date"
              value={cycleToEdit.startDate}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, startDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              type="date"
              placeholder="End Date"
              value={cycleToEdit.endDate}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, endDate: e.target.value })}
            />
            <input
              className="w-full p-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
              placeholder="Cycle Goal"
              value={cycleToEdit.goal}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, goal: e.target.value })}
            />
            <div className="flex justify-between">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={saveEditedCycle}>Save Changes</button>
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setIsEditCycleModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isEditIdeaModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-96 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Edit Idea</h2>
            <input
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Idea Title"
              value={ideaToEdit.title}
              onChange={(e) => setIdeaToEdit({ ...ideaToEdit, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-800 text-white"
              placeholder="Idea Description"
              value={ideaToEdit.description}
              onChange={(e) => setIdeaToEdit({ ...ideaToEdit, description: e.target.value })}
            />
            <div className="flex justify-between">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={saveEditedIdea}>Save Changes</button>
              <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setIsEditIdeaModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
