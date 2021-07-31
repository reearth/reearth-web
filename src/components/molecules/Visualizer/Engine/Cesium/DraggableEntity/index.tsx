import React, { useEffect, useState } from "react";

export type Props = {
  className?: string;
  children: React.ReactNode;
};

const DraggableEntity: React.FC<Props> = ({ className, children }) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const TIME = 1000;
  const handleMouseDown = () => {
    setIsMouseDown(true);
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDraggable(false);
  };
  useEffect(() => {
    if (!isMouseDown) return;
    const timer = setTimeout(() => {
      setIsDraggable(true);
    }, TIME);
    return () => clearTimeout(timer);
  }, [isMouseDown]);
  isDraggable && console.log("dragging----");
  return (
    <div className={className} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      {children}
      <div style={{ background: isDraggable ? "red" : "white" }}>hello</div>
    </div>
  );
};

export default DraggableEntity;
