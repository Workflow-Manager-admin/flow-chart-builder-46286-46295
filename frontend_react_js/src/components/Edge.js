import React from 'react';

// PUBLIC_INTERFACE
/**
 * Edge component that renders connections between nodes.
 * Creates SVG lines with arrow markers to show flow direction.
 */
const Edge = ({ edge, sourcePos, targetPos, selected, onSelect }) => {
  // Calculate the path between source and target
  const calculatePath = () => {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control points for bezier curve
    const controlOffset = Math.min(distance * 0.3, 100);
    const sourceControlX = sourcePos.x + (dx > 0 ? controlOffset : -controlOffset);
    const sourceControlY = sourcePos.y;
    const targetControlX = targetPos.x - (dx > 0 ? controlOffset : -controlOffset);
    const targetControlY = targetPos.y;
    
    return `M ${sourcePos.x},${sourcePos.y} C ${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetPos.x},${targetPos.y}`;
  };

  // Calculate arrow marker position
  const calculateArrowPosition = () => {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: targetPos.x, y: targetPos.y, angle: 0 };
    
    const unitX = dx / length;
    const unitY = dy / length;
    const arrowX = targetPos.x - unitX * 15;
    const arrowY = targetPos.y - unitY * 15;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    return { x: arrowX, y: arrowY, angle };
  };

  const path = calculatePath();
  const arrow = calculateArrowPosition();
  
  return (
    <svg 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: selected ? 500 : 50
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${edge.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={selected ? 'var(--accent-color)' : edge.data.color || 'var(--secondary-color)'}
          />
        </marker>
      </defs>
      
      {/* Invisible thicker line for easier selection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onClick={onSelect}
      />
      
      {/* Visible edge line */}
      <path
        d={path}
        stroke={selected ? 'var(--accent-color)' : edge.data.color || 'var(--secondary-color)'}
        strokeWidth={selected ? "3" : "2"}
        fill="none"
        markerEnd={`url(#arrowhead-${edge.id})`}
        style={{ 
          pointerEvents: 'none',
          filter: selected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
        }}
      />
      
      {/* Edge label if present */}
      {edge.data.label && (
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2}
          fill={selected ? 'var(--accent-color)' : 'var(--text-primary)'}
          fontSize="12"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ 
            pointerEvents: 'none',
            backgroundColor: 'var(--bg-primary)',
            padding: '2px 4px',
            borderRadius: '2px'
          }}
        >
          {edge.data.label}
        </text>
      )}
    </svg>
  );
};

export default Edge;
