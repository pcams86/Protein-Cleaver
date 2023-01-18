import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

type MailtoProps = {
  email: string;
  subject?: string;
  body?: string;
};

const Mailto = ({ email, subject, body }: MailtoProps) => {
  return (
    <FontAwesomeIcon
      icon={faEnvelope}
      onClick={() =>
        (window.location.href = `mailto:${email}?subject=${
          subject || ""
        }&body=${body || ""}`)
      }
    />
  );
};

export default Mailto;
