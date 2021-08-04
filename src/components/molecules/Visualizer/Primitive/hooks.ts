import { useEffect, useState } from "react";

export default ({
  enableLayerDragging,
  disableLayerDragging,
}: {
  enableLayerDragging?: () => void;
  disableLayerDragging?: () => void;
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const TIME = 1000;
  const handleMouseDown = () => {
    setIsMouseDown(true);
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
    disableLayerDragging?.();
  };
  useEffect(() => {
    if (!isMouseDown) return;
    const timer = setTimeout(() => {
      enableLayerDragging?.();
    }, TIME);
    return () => clearTimeout(timer);
  }, [enableLayerDragging, isMouseDown]);

  return {
    handleMouseDown,
    handleMouseUp,
  };
};
