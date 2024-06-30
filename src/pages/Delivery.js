import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Delivery() {
  const [cycles, setCycles] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ text: '', name: '' });

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

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    const cycleIndex = cycles.findIndex(cycle => cycle.ideas.some(idea => idea.status === 'Delivery'));
    const updatedCycles = [...cycles];
    const [movedItem] = updatedCycles[cycleIndex].ideas.splice(source.index, 1);
    movedItem.column = destination.droppableId;
    updatedCycles[cycleIndex].ideas.splice(destination.index, 0, movedItem);
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
  };

  const openIdeaModal = (idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setIsIdeaModalOpen(false);
  };

  const addComment = () => {
    const updatedIdea = {
      ...selectedIdea,
      comments: [...selectedIdea.comments, newComment]
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
    setSelectedIdea(updatedIdea);
  };

  const saveIdeaDetails = () => {
    const updatedCycles = cycles.map(cycle =>
      cycle.name === selectedIdea.cycleName
        ? {
            ...cycle,
            ideas: cycle.ideas.map(idea =>
              idea.title === selectedIdea.title ? selectedIdea : idea
            ),
          }
        : cycle
    );
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    setIsIdeaModalOpen(false);
  };

  const columns = {
    'Planning': [],
    'Ready for Dev': [],
    'In Progress': []
  };

  cycles.forEach(cycle => {
    cycle.ideas.forEach(idea => {
      if (idea.status === 'Delivery') {
        columns[idea.column || 'Planning'].push(idea);
      }
    });
  });

  return (
    <div className="p-4">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Delivery Board</h1>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Object.keys(columns).map(columnId => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-800 p-4 rounded-lg shadow-md"
                >
                  <h2 className="text-lg font-semibold mb-2 text-gray-300">{columnId}</h2>
                  {columns[columnId].map((idea, index) => (
                    <Draggable key={idea.title} draggableId={idea.title} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gray-700 p-4 mb-4 rounded shadow cursor-pointer hover:bg-gray-600"
                          onClick={() => openIdeaModal(idea)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-semibold">{idea.title}</h5>
                              <p className="text-sm">{idea.description}</p>
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                idea.cycleName === 'Cycle 1' ? 'bg-blue-500' :
                                idea.cycleName === 'Cycle 2' ? 'bg-green-500' :
                                'bg-red-500'
                              }`}>
                                {idea.cycleName}
                              </span>
                            </div>
                            <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded">
                              <div className="text-lg font-bold">{idea.votes}</div>
                              <button
                                className="text-xl hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedCycles = [...cycles];
                                  const cycleIndex = updatedCycles.findIndex(cycle => cycle.name === idea.cycleName);
                                  const ideaIndex = updatedCycles[cycleIndex].ideas.findIndex(i => i.title === idea.title);
                                  updatedCycles[cycleIndex].ideas[ideaIndex].votes += 1;
                                  saveData({ cycles: updatedCycles });
                                  setCycles(updatedCycles);
                                }}
                              >
                                ▲
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {isIdeaModalOpen && selectedIdea && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeIdeaModal}>
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-4xl border border-gray-700 relative" onClick={(e) => e.stopPropagation()}>
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

export default Delivery;
