import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Delivery() {
  const [cycles, setCycles] = useState([]);
  const [tasks, setTasks] = useState({
    planning: [],
    readyForDev: [],
    inProgress: [],
  });
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ text: '', name: '' });
  const modalRef = useRef(null);

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
      const deliveryTasks = {
        planning: [],
        readyForDev: [],
        inProgress: [],
      };

      data.forEach((cycle) => {
        cycle.ideas.forEach((idea) => {
          if (idea.status === 'Delivery') {
            deliveryTasks.planning.push({ ...idea, cycleName: cycle.name });
          }
        });
      });

      setCycles(data);
      setTasks(deliveryTasks);
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
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const [movedTask] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    const updatedCycles = cycles.map((cycle) => {
      if (cycle.name === movedTask.cycleName) {
        return {
          ...cycle,
          ideas: cycle.ideas.map((idea) => {
            if (idea.title === movedTask.title) {
              return { ...idea, status: 'Delivery' };
            }
            return idea;
          }),
        };
      }
      return cycle;
    });

    saveData({ cycles: updatedCycles });
  };

  const openIdeaModal = (idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setIsIdeaModalOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeIdeaModal();
    }
  };

  useEffect(() => {
    if (isIdeaModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isIdeaModalOpen]);

  const addComment = () => {
    if (newComment.text) {
      const updatedCycles = [...cycles];
      const cycleIndex = cycles.findIndex(cycle => cycle.name === selectedIdea.cycleName);
      const ideaIndex = updatedCycles[cycleIndex].ideas.findIndex(idea => idea.title === selectedIdea.title);
      const comment = { text: newComment.text, name: newComment.name || 'Anonymous' };
      updatedCycles[cycleIndex].ideas[ideaIndex].comments.push(comment);
      saveData({ cycles: updatedCycles });
      setCycles(updatedCycles);
      setNewComment({ text: '', name: '' });
    }
  };

  const saveIdeaDetails = () => {
    const updatedCycles = [...cycles];
    const cycleIndex = cycles.findIndex(cycle => cycle.name === selectedIdea.cycleName);
    const ideaIndex = updatedCycles[cycleIndex].ideas.findIndex(idea => idea.title === selectedIdea.title);
    updatedCycles[cycleIndex].ideas[ideaIndex] = selectedIdea;
    saveData({ cycles: updatedCycles });
    setCycles(updatedCycles);
    closeIdeaModal();
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-semibold">Delivery</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {Object.keys(tasks).map((column) => (
            <div key={column} className="w-64">
              <h3 className="font-semibold mb-2">{column.replace(/([A-Z])/g, ' $1')}</h3>
              <Droppable droppableId={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-800 border border-gray-700 rounded shadow-sm p-4"
                  >
                    {tasks[column].map((task, index) => (
                      <Draggable key={task.title} draggableId={task.title} index={index}>
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="bg-gray-700 border border-gray-600 rounded shadow-sm p-4 mb-2 cursor-pointer"
                            onClick={() => openIdeaModal(task)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-gray-300">
                                <h5 className="font-semibold">{task.title}</h5>
                                <p className="text-sm">{task.description}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                  task.status === 'Planning' ? 'bg-blue-500' :
                                  task.status === 'ReadyForDev' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}>
                                  {task.status}
                                </span>
                              </div>
                              <div className="flex flex-col items-center text-gray-400 border border-gray-600 p-2 rounded">
                                <button className="text-xl hover:text-white">&#x25B2;</button>
                                <div className="text-lg font-bold">{task.votes}</div>
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
            </div>
          ))}
        </div>
      </DragDropContext>

      {isIdeaModalOpen && selectedIdea && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-4xl border border-gray-700 relative" ref={modalRef}>
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

export default Delivery;
