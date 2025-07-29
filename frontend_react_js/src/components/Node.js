import React, { useState, useRef } from 'react';

// PUBLIC_INTERFACE
/**
 * Individual node component that can be dragged, selected, and connected.
 * Represents different types of flow chart elements (start, process, decision, end).
 */
const Node = ({ 
  node, 
  selected, 
  isConnecting, 
  onSelect, 
  onMove, 
  onConnectionStart, 
  onConnectionEnd 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    
    if (isConnecting) {
      onConnectionEnd();
      return;
    }
    
    const rect = nodeRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    onSelect();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const canvas = nodeRef.current.closest('.canvas');
      const canvasRect = canvas.getBoundingClientRect();
      const canvasTransform = canvas.style.transform;
      
      // Parse transform values
      const transformMatch = canvasTransform.match(/translate\(([^,]+),\s*([^)]+)\).*scale\(([^)]+)\)/);
      const translateX = transformMatch ? parseFloat(transformMatch[1]) : 0;
      const translateY = transformMatch ? parseFloat(transformMatch[2]) : 0;
      const scale = transformMatch ? parseFloat(transformMatch[3]) : 1;
      
      const x = (e.clientX - canvasRect.left - translateX - dragOffset.x) / scale;
      const y = (e.clientY - canvasRect.top - translateY - dragOffset.y) / scale;
      
      onMove({ x: Math.max(0, x), y: Math.max(0, y) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConnectionStart = (e) => {
    e.stopPropagation();
    onConnectionStart();
  };

  // Get node shape based on type
  const getNodeShape = () => {
    const { type, data } = node;
    const style = {
      backgroundColor: data.color || 'var(--primary-color)',
      borderColor: selected ? 'var(--accent-color)' : 'transparent',
      borderWidth: selected ? '3px' : '1px',
      borderStyle: 'solid'
    };

    switch (type) {
      case 'start':
      case 'end':
        return {
          ...style,
          borderRadius: '50%',
          width: '80px',
          height: '80px'
        };
      case 'decision':
        return {
          ...style,
          transform: 'rotate(45deg)',
          width: '80px',
          height: '80px'
        };
      default: // process
        return {
          ...style,
          borderRadius: '8px',
          width: '150px',
          height: '100px'
        };
    }
  };

  const nodeStyle = getNodeShape();

  return (
    <div
      ref={nodeRef}
      className={`node ${node.type} ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: selected ? 1000 : 100
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="node-shape"
        style={{
          ...nodeStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'center',
          padding: '8px',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s ease'
        }}
      >
        <div
          style={{
            transform: node.type === 'decision' ? 'rotate(-45deg)' : 'none',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: node.type === 'decision' ? 'nowrap' : 'normal',
            lineHeight: node.type === 'decision' ? '1' : '1.2'
          }}
        >
          {node.data.label}
        </div>
      </div>
      
      {/* Connection points */}
      {!isDragging && (
        <>
          <div
            className="connection-point top"
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              cursor: 'crosshair',
              opacity: isConnecting ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}
            onMouseDown={handleConnectionStart}
          />
          <div
            className="connection-point bottom"
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              cursor: 'crosshair',
              opacity: isConnecting ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}
            onMouseDown={handleConnectionStart}
          />
          <div
            className="connection-point left"
            style={{
              position: 'absolute',
              left: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              cursor: 'crosshair',
              opacity: isConnecting ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}
            onMouseDown={handleConnectionStart}
          />
          <div
            className="connection-point right"
            style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '50%',
              cursor: 'crosshair',
              opacity: isConnecting ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}
            onMouseDown={handleConnectionStart}
          />
        </>
      )}
    </div>
  );
};

export default Node;
