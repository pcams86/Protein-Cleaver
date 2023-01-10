import * as React from "react";
import DropdownBtn from "./dropdownBtn";

interface InputProps {
  value: string;
  name: string;
  label: string;
  dropdownTitle: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onDropdownClick(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  helpText: string;
  dropdownColor: string;
  items: string[];
  dropdownDisabled: boolean;
}

const Input = ({
  value,
  name,
  label,
  dropdownTitle,
  onChange,
  helpText,
  dropdownColor,
  onDropdownClick,
  items,
  dropdownDisabled,
}: InputProps) => {
  return (
    <div className="form-group">
      <label className="clickable" htmlFor={name}>
        {label}
        <div className="row">
          <div className="col-7">
            <input
              value={value}
              onChange={onChange}
              autoFocus
              id={name}
              name={name}
              type="text"
              className="form-control"
              aria-describedby={name}
            />
          </div>
          <div className="col">
            <DropdownBtn
              title={dropdownTitle}
              color={dropdownColor}
              onClick={onDropdownClick}
              items={items}
              disabled={dropdownDisabled}
            />
          </div>
        </div>
      </label>
      <div id={name} className="form-text">
        {helpText}
      </div>
    </div>
  );
};

export default Input;
