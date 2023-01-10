import * as React from "react";

interface RadioProps {
  isRadioSelected(value: string): boolean;
  onRadioClick(e: React.ChangeEvent<HTMLInputElement>): void;
}

const Radio = (props: RadioProps) => {
  const { onRadioClick, isRadioSelected } = props;

  return (
    <div>
      <div className="form-check form-check-inline clickable">
        <input
          className="form-check-input clickable"
          type="radio"
          name="sequenceType"
          checked={isRadioSelected("cta")}
          onChange={onRadioClick}
          value="cta"
        />
        <label htmlFor="cta" className="form-check-label">
          CTA
        </label>
      </div>
      <div className="form-check form-check-inline ">
        <input
          className="form-check-input clickable"
          type="radio"
          name="sequenceType"
          checked={isRadioSelected("neoAntigen")}
          onChange={onRadioClick}
          value="neoAntigen"
        />
        <label htmlFor="neoAntigen" className="form-check-label">
          neoAntigen
        </label>
      </div>
    </div>
  );
};

export default Radio;
