import * as React from "react";

interface ButtonProps {
  label: string;
  onClick(): void;
  disabled: boolean;
}

const Button = (props: ButtonProps) => {
  const { label, onClick, disabled } = props;
  return (
    <button onClick={onClick} className="btn btn-primary" disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
