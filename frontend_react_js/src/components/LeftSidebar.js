import React from 'react';

const nodeTypes = [
  { type: 'start', label: 'Start', icon: 'S', description: 'Starting point of the flow' },
  { type: 'process', label: 'Process', icon: 'P', description: 'Process or action step' },
  { type: 'decision', label: 'Decision', icon: 'D', description: 'Decision or condition' },
  { type: 'end', label: 'End', icon: 'E', description: 'End point of the flow' }
];

// PUBLIC_INTERFACE
/**
 * Left sidebar component containing draggable node types.
 * Users can drag node types from here to the canvas to create new nodes.
 */
const LeftSidebar = ({ onDragStart }) => {
  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(nodeType);
  };

  const handleDragEnd = () => {
    onDragStart(null);
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Node Types</h2>
      <div className="node-palette">
        {nodeTypes.map(({ type, label, icon, description }) => (
          <div
            key={type}
            className="node-type"
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onDragEnd={handleDragEnd}
            title={description}
          >
            <div className={`node-icon ${type}`}>
              {icon}
            </div>
            <span className="node-label">{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default LeftSidebar;
