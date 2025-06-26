import React from "react";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
  ariaLabel: string;
  onClick: () => void;
  icon: React.ReactNode;
  type: "download" | "whatsapp";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  ariaLabel,
  onClick,
  icon,
  type,
}) => {
  const buttonClassName =
    type === "download" ? styles.downloadButton : styles.whatsappButton;

  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className={buttonClassName}
    >
      {icon}
    </button>
  );
};

export default ActionButton;
