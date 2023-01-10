import * as React from "react";
import { DropdownButton } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

type dropdownBtnProps = {
  title: string;
  color: string;
  onClick(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  items: string[];
  disabled: boolean;
};

const DropdownBtn = (props: dropdownBtnProps) => {
  const { title, color, onClick, items, disabled } = props;
  return (
    <div>
      <DropdownButton
        title={title}
        variant={color}
        drop="end"
        id="dropdown-button-drop-end"
        disabled={disabled}
      >
        {items.map((item) => (
          <DropdownItem onClick={onClick} name={item} key={items.indexOf(item)}>
            {item}
          </DropdownItem>
        ))}
      </DropdownButton>
    </div>
  );
};

export default DropdownBtn;
