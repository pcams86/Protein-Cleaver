import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

type EmailProps = {
  emailAddress: string;
  onEnvelopeClick(): void;
};

const Email = (props: EmailProps) => {
  const { emailAddress, onEnvelopeClick } = props;
  return (
    <view style={{ flexDirection: "row", justifyContent: "end" }}>
      <FontAwesomeIcon icon={faEnvelope} onClick={onEnvelopeClick} />
      <text>{emailAddress}</text>
    </view>
  );
};

export default Email;
