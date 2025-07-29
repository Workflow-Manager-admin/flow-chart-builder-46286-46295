import React, { useRef, useState, useEffect } from 'react';
import Node from './Node';
import Edge from './Edge';

// PUBLIC_INTERFACE
/**
 * Main canvas component for the flow chart builder.
 * Handles node rendering, drag-and-drop operations, panning, zooming, and connections.
 */
const Canvas = ({
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  canvasTransform,
  draggedNodeType,
  isConnecting,
  connectionStart,
  onNodeSelect,
  onEdgeSelect,
  onNodeMove,
  onNodeAdd,
  onEdgeAdd,
  onTransformChange,
  onDragEnd,
  onConnectionStart,
  onConnectionEnd
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tempConnection, setTempConnection] = useState(null);

  // Handle canvas drag over for node dropping
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle node drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
        const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;
        
        onNodeAdd(data.type, { x, y });
      }
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
    
    onDragEnd();
  };

  // Handle canvas panning
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y });
      onNodeSelect(null);
      onEdgeSelect(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      onTransformChange({
        ...canvasTransform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    // Update temporary connection line
    if (isConnecting && connectionStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;
      setTempConnection({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isConnecting) {
      onConnectionEnd(null);
      setTempConnection(null);
    }
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * delta));
    
    // Zoom towards mouse position
    const scaleChange = newScale / canvasTransform.scale;
    const newX = mouseX - (mouseX - canvasTransform.x) * scaleChange;
    const newY = mouseY - (mouseY - canvasTransform.y) * scaleChange;
    
    onTransformChange({
      x: newX,
      y: newY,
      scale: newScale
    });
  };

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [canvasTransform]);

  // Get connection start position
  const getConnectionStartPos = () => {
    if (!connectionStart) return null;
    const node = nodes.find(n => n.id === connectionStart);
    if (!node) return null;
    return {
      x: node.position.x + 75, // Node width / 2
      y: node.position.y + 50  // Node height / 2
    };
  };

  const connectionStartPos = getConnectionStartPos();

  return (
    <div 
      className={`canvas-container ${draggedNodeType ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        ref={canvasRef}
        className={`canvas ${isDragging ? 'dragging' : ''} ${isConnecting ? 'connecting' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Canvas background */}
        <div className="canvas-background" style={{ width: '100%', height: '100%', position: 'absolute' }} />
        
        {/* Render edges */}
        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <Edge
              key={edge.id}
              edge={edge}
              sourcePos={{
                x: sourceNode.position.x + 75,
                y: sourceNode.position.y + 50
              }}
              targetPos={{
                x: targetNode.position.x + 75,
                y: targetNode.position.y + 50
              }}
              selected={selectedEdge?.id === edge.id}
              onSelect={() => onEdgeSelect(edge)}
            />
          );
        })}
        
        {/* Temporary connection line */}
        {isConnecting && connectionStartPos && tempConnection && (
          <svg 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <line
              x1={connectionStartPos.x}
              y1={connectionStartPos.y}
              x2={tempConnection.x}
              y2={tempConnection.y}
              stroke="var(--primary-color)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
        
        {/* Render nodes */}
        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            selected={selectedNode?.id === node.id}
            isConnecting={isConnecting}
            onSelect={() => onNodeSelect(node)}
            onMove={(position) => onNodeMove(node.id, { position })}
            onConnectionStart={() => onConnectionStart(node.id)}
            onConnectionEnd={() => onConnectionEnd(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
