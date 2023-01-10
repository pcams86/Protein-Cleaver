import * as React from "react";
import Radio from "./common/radio";
import Input from "./common/input";
import Button from "./common/button";

interface InputFormProps {
  input: {
    name: string;
    tpm: string;
  };
  inputLabel: string;
  onInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  onRunClick(): void;
  onCopyClick(): void;
  onRadioClick(e: React.ChangeEvent<HTMLInputElement>): void;
  onNameDropdownClick(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  onIDDropdownClick(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
  isRadioSelected(value: string): boolean;
  runDisabled: boolean;
  copyDisabled: boolean;
  errorMessage: string;
  nameHelpText: string;
  tpmHelpText: string;
  nameDropdownColor: string;
  IDDropdownColor: string;
  names: string[];
  IDs: string[];
  nameDropdownDisabled: boolean;
  nameDropdownTitle: string;
  IDDropdownDisabled: boolean;
  IDDropdownTitle: string;
}

const InputForm = ({
  input,
  inputLabel,
  onInputChange,
  onSubmit,
  onRunClick,
  onCopyClick,
  onRadioClick,
  isRadioSelected,
  runDisabled,
  copyDisabled,
  nameHelpText,
  tpmHelpText,
  errorMessage,
  nameDropdownColor,
  IDDropdownColor,
  onNameDropdownClick,
  onIDDropdownClick,
  names,
  IDs,
  nameDropdownDisabled,
  nameDropdownTitle,
  IDDropdownDisabled,
  IDDropdownTitle,
}: InputFormProps) => {
  return (
    <div>
      <div className="row">
        <div className="col-5">
          <form onSubmit={onSubmit}>
            <div className="gap">
              <Input
                name="geneName"
                label={inputLabel}
                value={input.name}
                dropdownTitle={nameDropdownTitle}
                onChange={onInputChange}
                onDropdownClick={onNameDropdownClick}
                helpText={nameHelpText}
                dropdownColor={nameDropdownColor}
                items={names}
                dropdownDisabled={nameDropdownDisabled}
              />
              <Input
                name="tpm"
                label="TPM"
                value={input.tpm}
                dropdownTitle={IDDropdownTitle}
                onChange={onInputChange}
                onDropdownClick={onIDDropdownClick}
                helpText={tpmHelpText}
                dropdownColor={IDDropdownColor}
                items={IDs}
                dropdownDisabled={IDDropdownDisabled}
              />
            </div>
          </form>
        </div>
      </div>
      <div className="gap">
        <div className="row">
          <div className="col-1">
            <Button onClick={onRunClick} label="Run" disabled={runDisabled} />
          </div>
          <div className="col-3">
            <div className="gap">
              <Radio
                isRadioSelected={isRadioSelected}
                onRadioClick={onRadioClick}
              />
            </div>
          </div>
          <div className="col-1">
            <Button
              onClick={onCopyClick}
              label="Copy"
              disabled={copyDisabled}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-5">
            <div className="gap">
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
