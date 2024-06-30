import React, { useState, useEffect } from 'react';

function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '', goal: '' });
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState(null);
  const [isEditIdeaModalOpen, setIsEditIdeaModalOpen] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCycles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      updatedCycles[cycleIndex].ideas.push({ ...newIdea, votes: 0, comments: [], status: 'Idea' });
      saveData({ cycles: updatedCycles });
      setCycles(updatedCycles);
      setNewIdea({ title: '', description: '' });
      setShowCommentInput('');
    }
  };

  const voteIdea = (cycleIndex, ideaIndex) => {
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex].ideas[ideaIndex].votes += 1;
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
  };

  const editCycle = (cycleIndex) => {
    setCycleToEdit(cycles[cycleIndex]);
    setIsEditCycleModalOpen(true);
  };

  const saveEditedCycle = () => {
    const updatedCycles = cycles.map(cycle =>
      cycle.name === cycleToEdit.name ? cycleToEdit : cycle
    );
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setIsEditCycleModalOpen(false);
  };

  const editIdea = (cycleIndex, ideaIndex) => {
    setIdeaToEdit(cycles[cycleIndex].ideas[ideaIndex]);
    setIsEditIdeaModalOpen(true);
  };

  const saveEditedIdea = () => {
    const updatedCycles = cycles.map(cycle =>
      cycle.name === ideaToEdit.cycleName
        ? {
            ...cycle,
            ideas: cycle.ideas.map(idea =>
              idea.title === ideaToEdit.title ? ideaToEdit : idea
            ),
          }
        : cycle
    );
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setIsEditIdeaModalOpen(false);
  };

  const openIdeaModal = (idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setIsIdeaModalOpen(false);
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Hero PP</h1>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          onClick={() => setIsModalOpen(true)}
        >
          Create New Cycle
        </button>
      </header>
      <div className="mt-4 flex">
        <aside className="w-1/4 pr-4">
          <h2 className="text-xl font-semibold mb-4">Cycles</h2>
          <ul className="space-y-2">
            {cycles.map((cycle, index) => (
              <li key={index} className="bg-gray-800 p-2 rounded shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{cycle.name}</span>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => editCycle(index)}
                  >
                    ⋮
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <main className="w-3/4">
          {cycles.map((cycle, cycleIndex) => (
            <div key={cycleIndex} className="mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{cycle.name}</h2>
                <div>
                  <button
                    className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-500"
                    onClick={() => setShowCommentInput(cycleIndex)}
                  >
                    Add Idea
                  </button>
                  {showCommentInput === cycleIndex && (
                    <div className="bg-gray-800 p-4 rounded shadow-sm mt-2">
                      <input
                        className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
                        placeholder="Idea title"
                        value={newIdea.title}
                        onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                      />
                      <textarea
                        className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
                        placeholder="Idea description"
                        value={newIdea.description}
                        onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                      />
                      <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
                        onClick={() => addIdea(cycleIndex)}
                      >
                        Add Idea
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <ul className="space-y-2 mt-4">
                {cycle.ideas.map((idea, ideaIndex) => (
                  <li key={ideaIndex} className="bg-gray-800 p-4 rounded shadow-sm cursor-pointer" onClick={() => openIdeaModal(idea)}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded mr-4">
                          <button
                            className="text-xl hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              voteIdea(cycleIndex, ideaIndex);
                            }}
                          >
                            ▲
                          </button>
                          <div className="text-lg font-bold">{idea.votes}</div>
                        </div>
                        <div className="text-gray-300">
                          <h5 className="font-semibold">{idea.title}</h5>
                          <p className="text-sm">{idea.description}</p>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            cycle.name === 'Cycle 1' ? 'bg-blue-500' :
                            cycle.name === 'Cycle 2' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}>
                            {cycle.name}
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-white ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          editIdea(cycleIndex, ideaIndex);
                        }}
                      >
                        ⋮
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </main>
      </div>

      {/* Add Cycle Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md border border-gray-700 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Cycle</h2>
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Cycle name"
              value={newCycle.name}
              onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Start date"
              type="date"
              value={newCycle.startDate}
              onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="End date"
              type="date"
              value={newCycle.endDate}
              onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Goal"
              value={newCycle.goal}
              onChange={(e) => setNewCycle({ ...newCycle, goal: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
              onClick={addCycle}
            >
              Add Cycle
            </button>
          </div>
        </div>
      )}

      {/* Edit Cycle Modal */}
      {isEditCycleModalOpen && cycleToEdit && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md border border-gray-700 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsEditCycleModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Cycle</h2>
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Cycle name"
              value={cycleToEdit.name}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, name: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Start date"
              type="date"
              value={cycleToEdit.startDate}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, startDate: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="End date"
              type="date"
              value={cycleToEdit.endDate}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, endDate: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Goal"
              value={cycleToEdit.goal}
              onChange={(e) => setCycleToEdit({ ...cycleToEdit, goal: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
              onClick={saveEditedCycle}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Edit Idea Modal */}
      {isEditIdeaModalOpen && ideaToEdit && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md border border-gray-700 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsEditIdeaModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Idea</h2>
            <input
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Idea title"
              value={ideaToEdit.title}
              onChange={(e) => setIdeaToEdit({ ...ideaToEdit, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 mb-2 border border-gray-600 rounded bg-gray-700 text-white"
              placeholder="Idea description"
              value={ideaToEdit.description}
              onChange={(e) => setIdeaToEdit({ ...ideaToEdit, description: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
              onClick={saveEditedIdea}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Idea Modal */}
      {isIdeaModalOpen && selectedIdea && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-4xl border border-gray-700 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={closeIdeaModal}
            >
              &times;
            </button>
            <div className="flex">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">{selectedIdea.title}</h2>
                <p className="mb-4">{selectedIdea.description}</p>
                <div className="mb-4">
                  <label className="font-semibold">Cycle: </label>
                  <span className="ml-2">{selectedIdea.cycleName}</span>
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Details: </label>
                  <textarea
                    className="ml-2 p-2 border border-gray-600 rounded bg-gray-800 text-white w-full"
                    rows="4"
                    value={selectedIdea.details || ''}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, details: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <h6 className="font-semibold mb-2">Comments</h6>
                  <ul className="mb-4 space-y-2">
                    {selectedIdea.comments.map((comment, commentIndex) => (
                      <li key={commentIndex} className="bg-gray-600 border border-gray-700 rounded p-2">
                        <span className="font-semibold">{comment.name}:</span> {comment.text}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    {newComment.text || newComment.name ? (
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
                          <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={() => setNewComment({ text: '', name: '' })}>
                            Cancel
                          </button>
                          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={addComment}>
                            Add Comment
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
                        onClick={() => setNewComment({ text: '', name: '' })}
                      >
                        Add Comment
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-200" onClick={closeIdeaModal}>
                    Close
                  </button>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={saveIdeaDetails}>
                    Save
                  </button>
                </div>
              </div>
              <div className="w-64 ml-8">
                <div className="border border-gray-700 rounded p-4">
                  <h6 className="font-semibold mb-2">Votes</h6>
                  <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded mb-4">
                    <button 
                      className="text-xl hover:text-white" 
                      onClick={() => {
                        setSelectedIdea({
                          ...selectedIdea,
                          votes: selectedIdea.votes + 1,
                        });
                      }}
                    >
                      &#x25B2;
                    </button>
                    <div className="text-lg font-bold">{selectedIdea.votes}</div>
                  </div>
                  <h6 className="font-semibold mb-2">Status</h6>
                  <select
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={selectedIdea.status}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, status: e.target.value })}
                  >
                    <option value="Idea">Idea</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                  <h6 className="font-semibold mb-2">Estimated Time</h6>
                  <input
                    type="text"
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={selectedIdea.estimatedTime || ''}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, estimatedTime: e.target.value })}
                  />
                  <h6 className="font-semibold mb-2">Jira Ticket</h6>
                  <input
                    type="text"
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={selectedIdea.jiraTicket || ''}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, jiraTicket: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cycles;
