import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import BottomToolbar from './components/BottomToolbar';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // History management
  const saveToHistory = useCallback(() => {
    const state = { nodes: [...nodes], edges: [...edges] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // PUBLIC_INTERFACE
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(historyIndex - 1);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [history, historyIndex]);

  // PUBLIC_INTERFACE
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [history, historyIndex]);

  // Node management
  // PUBLIC_INTERFACE
  const addNode = useCallback((type, position) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: '',
        color: '#1976d2'
      }
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // PUBLIC_INTERFACE
  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prevNodes => prevNodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // PUBLIC_INTERFACE
  const deleteNode = useCallback((nodeId) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    setEdges(prevEdges => prevEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(prevSelected => prevSelected?.id === nodeId ? null : prevSelected);
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // Edge management
  // PUBLIC_INTERFACE
  const addEdge = useCallback((sourceId, targetId) => {
    const newEdge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: sourceId,
      target: targetId,
      type: 'default',
      data: {
        label: '',
        color: '#424242'
      }
    };
    setEdges(prevEdges => [...prevEdges, newEdge]);
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // PUBLIC_INTERFACE
  const deleteEdge = useCallback((edgeId) => {
    setEdges(prevEdges => prevEdges.filter(edge => edge.id !== edgeId));
    setSelectedEdge(prevSelected => prevSelected?.id === edgeId ? null : prevSelected);
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // Canvas operations
  // PUBLIC_INTERFACE
  const zoomIn = useCallback(() => {
    setCanvasTransform(transform => ({
      ...transform,
      scale: Math.min(transform.scale * 1.2, 3)
    }));
  }, []);

  // PUBLIC_INTERFACE
  const zoomOut = useCallback(() => {
    setCanvasTransform(transform => ({
      ...transform,
      scale: Math.max(transform.scale / 1.2, 0.1)
    }));
  }, []);

  // PUBLIC_INTERFACE
  const resetZoom = useCallback(() => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // PUBLIC_INTERFACE
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

  // Initialize history with empty state
  useEffect(() => {
    saveToHistory();
  }, [saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
          default:
            break;
        }
      }

      // Delete key for selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNode) {
          deleteNode(selectedNode.id);
        } else if (selectedEdge) {
          deleteEdge(selectedEdge.id);
        }
      }

      // Escape key to deselect
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
        if (isConnecting) {
          setIsConnecting(false);
          setConnectionStart(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, isConnecting, undo, redo, zoomIn, zoomOut, resetZoom, deleteNode, deleteEdge]);

  return (
    <div className="App">
      <Header 
        title="Flow Chart Builder" 
        theme={theme} 
        onToggleTheme={toggleTheme}
      />
      
      <div className="app-layout">
        <LeftSidebar 
          onDragStart={setDraggedNodeType}
        />
        
        <div className="main-content">
          <Canvas 
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            canvasTransform={canvasTransform}
            draggedNodeType={draggedNodeType}
            isConnecting={isConnecting}
            connectionStart={connectionStart}
            onNodeSelect={setSelectedNode}
            onEdgeSelect={setSelectedEdge}
            onNodeMove={updateNode}
            onNodeAdd={addNode}
            onEdgeAdd={addEdge}
            onTransformChange={setCanvasTransform}
            onDragEnd={() => setDraggedNodeType(null)}
            onConnectionStart={(nodeId) => {
              setIsConnecting(true);
              setConnectionStart(nodeId);
            }}
            onConnectionEnd={(nodeId) => {
              if (connectionStart && nodeId && connectionStart !== nodeId) {
                addEdge(connectionStart, nodeId);
              }
              setIsConnecting(false);
              setConnectionStart(null);
            }}
          />
        </div>
        
        <RightSidebar 
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onNodeUpdate={updateNode}
          onNodeDelete={deleteNode}
          onEdgeDelete={deleteEdge}
        />
      </div>
      
      <BottomToolbar 
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onClear={clearCanvas}
        zoomLevel={canvasTransform.scale}
      />
    </div>
  );
}

export default App;
