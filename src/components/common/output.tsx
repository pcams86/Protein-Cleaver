import * as React from "react";
interface OutputProps {
  output: any;
}

const Output = (props: OutputProps) => {
  const { output } = props;
  return (
    <div className="gap">
      <pre>{output}</pre>
    </div>
  );
};

export default Output;
