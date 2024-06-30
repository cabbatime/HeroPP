import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Delivery = () => {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('All');
  const [modalIdea, setModalIdea] = useState(null);
  const [newComment, setNewComment] = useState({ text: '', name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setCycles(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const updatedCycles = [...cycles];

    const sourceColumn = updatedCycles.find(cycle => cycle.name === source.droppableId);
    const destColumn = updatedCycles.find(cycle => cycle.name === destination.droppableId);

    const [movedIdea] = sourceColumn.ideas.splice(source.index, 1);
    destColumn.ideas.splice(destination.index, 0, movedIdea);

    setCycles(updatedCycles);
    saveData({ cycles: updatedCycles });
  };

  const openIdeaModal = (idea) => {
    setModalIdea(idea);
  };

  const closeIdeaModal = () => {
    setModalIdea(null);
  };

  const addComment = () => {
    const updatedIdea = {
      ...modalIdea,
      comments: [...modalIdea.comments, newComment]
    };
    const updatedCycles = cycles.map(cycle =>
      cycle.name === updatedIdea.cycleName
        ? {
            ...cycle,
            ideas: cycle.ideas.map(idea =>
              idea.title === updatedIdea.title ? updatedIdea : idea
            ),
          }
        : cycle
    );
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setNewComment({ text: '', name: '' });
    setModalIdea(updatedIdea);
  };

  const saveData = async (data) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const getColumnClassName = (status) => {
    switch (status) {
      case 'Planning':
        return 'bg-gray-800';
      case 'Ready for Dev':
        return 'bg-blue-800';
      case 'In Progress':
        return 'bg-green-800';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Delivery Board</h1>
        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
        >
          <option value="All">All Cycles</option>
          {cycles.map(cycle => (
            <option key={cycle.name} value={cycle.name}>{cycle.name}</option>
          ))}
        </select>
      </header>
      <div className="mt-4">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          {['Planning', 'Ready for Dev', 'In Progress'].map(status => (
            <div key={status} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{status}</h2>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    className={`p-4 rounded ${getColumnClassName(status)}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {cycles
                      .filter(cycle => selectedCycle === 'All' || cycle.name === selectedCycle)
                      .flatMap(cycle =>
                        cycle.ideas
                          .filter(idea => idea.status === status)
                          .map((idea, index) => (
                            <Draggable key={idea.title} draggableId={idea.title} index={index}>
                              {(provided) => (
                                <div
                                  className="bg-gray-900 p-4 mb-4 rounded shadow-sm"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openIdeaModal(idea)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h5 className="font-semibold">{idea.title}</h5>
                                      <p className="text-sm text-gray-400">{idea.description}</p>
                                    </div>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                      cycle.name === 'Cycle 1' ? 'bg-blue-500' :
                                      cycle.name === 'Cycle 2' ? 'bg-green-500' :
                                      'bg-red-500'
                                    }`}>
                                      {cycle.name}
                                    </span>
                                    <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded ml-4">
                                      <button className="text-xl hover:text-white">&#x25B2;</button>
                                      <div className="text-lg font-bold">{idea.votes}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                      )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {/* Idea Modal */}
      {modalIdea && (
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
                <h2 className="text-xl font-semibold mb-4">{modalIdea.title}</h2>
                <p className="mb-4">{modalIdea.description}</p>
                <div className="mb-4">
                  <label className="font-semibold">Cycle: </label>
                  <span className="ml-2">{modalIdea.cycleName}</span>
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Details: </label>
                  <textarea
                    className="ml-2 p-2 border border-gray-600 rounded bg-gray-800 text-white w-full"
                    rows="4"
                    value={modalIdea.details || ''}
                    onChange={(e) => setModalIdea({ ...modalIdea, details: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <h6 className="font-semibold mb-2">Comments</h6>
                  <ul className="mb-4 space-y-2">
                    {modalIdea.comments.map((comment, commentIndex) => (
                      <li key={commentIndex} className="bg-gray-600 border border-gray-700 rounded p-2">
                        <span className="font-semibold">{comment.name || 'Anonymous'}:</span> {comment.text}
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
                  <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500" onClick={() => saveData({ cycles })}>
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
                        setModalIdea({
                          ...modalIdea,
                          votes: modalIdea.votes + 1,
                        });
                      }}
                    >
                      &#x25B2;
                    </button>
                    <div className="text-lg font-bold">{modalIdea.votes}</div>
                  </div>
                  <h6 className="font-semibold mb-2">Status</h6>
                  <select
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={modalIdea.status}
                    onChange={(e) => setModalIdea({ ...modalIdea, status: e.target.value })}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Ready for Dev">Ready for Dev</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                  <h6 className="font-semibold mb-2">Estimated Time</h6>
                  <input
                    type="text"
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={modalIdea.estimatedTime || ''}
                    onChange={(e) => setModalIdea({ ...modalIdea, estimatedTime: e.target.value })}
                  />
                  <h6 className="font-semibold mb-2">Jira Ticket</h6>
                  <input
                    type="text"
                    className="p-2 border border-gray-600 rounded bg-gray-800 text-white mb-4"
                    value={modalIdea.jiraTicket || ''}
                    onChange={(e) => setModalIdea({ ...modalIdea, jiraTicket: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
