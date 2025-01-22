import React, { useState, useEffect } from "react";
import "./App.css";

const initialColumns = {
  todo: [],
  "in-progress": [],
  done: [],
};

const App = () => {
  const [columns, setColumns] = useState(() => {
    // Load tasks from localStorage
    const savedColumns = JSON.parse(localStorage.getItem("kanbanColumns"));
    return savedColumns || initialColumns;
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    task: null,
    columnId: null,
  });

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem("kanbanColumns", JSON.stringify(columns));
  }, [columns]);

  const addTask = (columnId, taskText) => {
    if (!taskText.trim()) return;
    setColumns((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], taskText],
    }));
  };

  const deleteTask = () => {
    if (contextMenu.task && contextMenu.columnId) {
      setColumns((prev) => ({
        ...prev,
        [contextMenu.columnId]: prev[contextMenu.columnId].filter(
          (t) => t !== contextMenu.task
        ),
      }));
      setContextMenu({ visible: false, x: 0, y: 0, task: null, columnId: null });
    }
  };

  const editTask = () => {
    if (contextMenu.task && contextMenu.columnId) {
      const newTaskText = prompt("Edit task:", contextMenu.task);
      if (newTaskText && newTaskText.trim()) {
        setColumns((prev) => ({
          ...prev,
          [contextMenu.columnId]: prev[contextMenu.columnId].map((t) =>
            t === contextMenu.task ? newTaskText : t
          ),
        }));
      }
      setContextMenu({ visible: false, x: 0, y: 0, task: null, columnId: null });
    }
  };

  const handleDragStart = (task, columnId) => {
    setDraggedTask({ task, columnId });
  };

  const handleDrop = (columnId) => {
    if (!draggedTask) return;

    const { task, columnId: sourceColumnId } = draggedTask;

    if (sourceColumnId !== columnId) {
      setColumns((prev) => ({
        ...prev,
        [sourceColumnId]: prev[sourceColumnId].filter((t) => t !== task),
        [columnId]: [...prev[columnId], task],
      }));
    }

    setDraggedTask(null);
  };

  const handleContextMenu = (e, task, columnId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      task,
      columnId,
    });
  };

  return (
    <div className="board">
      {Object.entries(columns).map(([columnId, tasks]) => (
        <div
          key={columnId}
          className="column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(columnId)}
        >
          <h2>{columnId.replace("-", " ").toUpperCase()}</h2>
          <div className="tasks">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="card"
                draggable
                onDragStart={() => handleDragStart(task, columnId)}
                onContextMenu={(e) => handleContextMenu(e, task, columnId)}
              >
                {task}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a task"
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask(columnId, e.target.value);
            }}
          />
        </div>
      ))}

      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <ul>
            <li onClick={editTask}>Edit</li>
            <li onClick={deleteTask}>Delete</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
