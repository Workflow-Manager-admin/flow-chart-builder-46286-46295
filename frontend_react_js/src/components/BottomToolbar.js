import React from 'react';

// PUBLIC_INTERFACE
/**
 * Bottom toolbar component with action buttons for undo/redo, zoom controls, and canvas operations.
 * Provides quick access to common flow chart editing operations.
 */
const BottomToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onClear,
  zoomLevel
}) => {
  const formatZoomLevel = (level) => {
    return `${Math.round(level * 100)}%`;
  };

  return (
    <div className="bottom-toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button 
          className="toolbar-button" 
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={onZoomOut}
          title="Zoom Out"
        >
          🔍−
        </button>
        <div className="zoom-info" title="Current Zoom Level">
          {formatZoomLevel(zoomLevel)}
        </div>
        <button 
          className="toolbar-button" 
          onClick={onZoomIn}
          title="Zoom In"
        >
          🔍+
        </button>
        <button 
          className="toolbar-button" 
          onClick={onResetZoom}
          title="Reset Zoom (100%)"
        >
          ⌂ Fit
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button danger" 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
              onClear();
            }
          }}
          title="Clear Canvas"
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
};

export default BottomToolbar;
