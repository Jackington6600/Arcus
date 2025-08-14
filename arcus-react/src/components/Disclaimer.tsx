import React, { useState } from 'react';

interface DisclaimerProps {
  text: string;
  onClose?: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ text, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match the CSS transition duration
  };

  return (
    <div className={`disclaimer ${isClosing ? 'closing' : ''}`}>
      <div className="disclaimer-icon"></div>
      <div className="disclaimer-text">{text}</div>
      <button 
        className="disclaimer-close" 
        onClick={handleClose}
        aria-label="Close disclaimer"
      ></button>
    </div>
  );
};

export default Disclaimer;
