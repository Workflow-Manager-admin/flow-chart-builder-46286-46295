import React from 'react';

// PUBLIC_INTERFACE
/**
 * Right sidebar component for editing properties of selected nodes and edges.
 * Provides forms to modify node labels, descriptions, colors, and delete functionality.
 */
const RightSidebar = ({ 
  selectedNode, 
  selectedEdge, 
  onNodeUpdate, 
  onNodeDelete, 
  onEdgeDelete 
}) => {
  const handleNodeLabelChange = (e) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        data: { ...selectedNode.data, label: e.target.value }
      });
    }
  };

  const handleNodeDescriptionChange = (e) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        data: { ...selectedNode.data, description: e.target.value }
      });
    }
  };

  const handleNodeColorChange = (e) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        data: { ...selectedNode.data, color: e.target.value }
      });
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode && window.confirm('Are you sure you want to delete this node?')) {
      onNodeDelete(selectedNode.id);
    }
  };

  const handleDeleteEdge = () => {
    if (selectedEdge && window.confirm('Are you sure you want to delete this connection?')) {
      onEdgeDelete(selectedEdge.id);
    }
  };

  return (
    <aside className="sidebar right">
      <h2 className="sidebar-title">Properties</h2>
      
      {selectedNode && (
        <div className="properties-panel fade-in">
          <div className="property-group">
            <label className="property-label">Node Type</label>
            <div className="property-value">{selectedNode.type}</div>
          </div>
          
          <div className="property-group">
            <label className="property-label" htmlFor="node-label">Label</label>
            <input
              id="node-label"
              type="text"
              className="property-input"
              value={selectedNode.data.label}
              onChange={handleNodeLabelChange}
              placeholder="Enter node label"
            />
          </div>
          
          <div className="property-group">
            <label className="property-label" htmlFor="node-description">Description</label>
            <textarea
              id="node-description"
              className="property-input property-textarea"
              value={selectedNode.data.description}
              onChange={handleNodeDescriptionChange}
              placeholder="Enter node description"
            />
          </div>
          
          <div className="property-group">
            <label className="property-label" htmlFor="node-color">Color</label>
            <input
              id="node-color"
              type="color"
              className="property-input color-input"
              value={selectedNode.data.color}
              onChange={handleNodeColorChange}
            />
          </div>
          
          <button 
            className="delete-button"
            onClick={handleDeleteNode}
          >
            🗑️ Delete Node
          </button>
        </div>
      )}
      
      {selectedEdge && (
        <div className="properties-panel fade-in">
          <div className="property-group">
            <label className="property-label">Connection</label>
            <div className="property-value">
              Edge from node to node
            </div>
          </div>
          
          <button 
            className="delete-button"
            onClick={handleDeleteEdge}
          >
            🗑️ Delete Connection
          </button>
        </div>
      )}
      
      {!selectedNode && !selectedEdge && (
        <div className="properties-panel">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            Select a node or connection to edit its properties
          </p>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
