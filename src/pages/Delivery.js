import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Delivery() {
  const [cycles, setCycles] = useState([]);
  const [tasks, setTasks] = useState({
    planning: [],
    readyForDev: [],
    inProgress: [],
  });

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

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-semibold">Delivery</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {Object.keys(tasks).map((column) => (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-64 bg-gray-800 border border-gray-700 rounded shadow-sm p-4"
                >
                  <h3 className="font-semibold mb-2">{column.replace(/([A-Z])/g, ' $1')}</h3>
                  {tasks[column].map((task, index) => (
                    <Draggable key={task.title} draggableId={task.title} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="bg-gray-700 border border-gray-600 rounded shadow-sm p-4 mb-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-gray-300">
                              <h5 className="font-semibold">{task.title}</h5>
                              <p className="text-sm">{task.description}</p>
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-500">
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
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Delivery;
