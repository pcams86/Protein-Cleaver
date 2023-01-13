import * as React from "react";
import InputForm from "./inputForm";
import Output from "./common/output";
import Email from "./common/email";
import {
  getNeo,
  getCTA,
  neoSequencer,
  AminoAcid,
  ctaSequencer,
} from "./geneRetriever";

export type Input = {
  name: string;
  tpm: string;
};

export type Gene = {
  name: string;
  ID: string[];
  proteinSequence: string;
};

type ProteinCleaverProps = {};

type ProteinCleaverState = {
  input: Input;
  aminoAcid: AminoAcid;
  geneList: Gene[];
  currentGene: Gene;
  inputLabel: "Gene & Mutation" | "Gene Name";
  output: string;
  selectedRadioBtn: "neoAntigen" | "cta";
  nameHelpText: string;
  tpmHelpText: string;
  errorMessage: string;
  nameDropdownColor: "secondary" | "primary" | "warning";
  nameDropdownDisabled: boolean;
  nameDropdownTitle: string;
  IDDropdownColor: "secondary" | "primary" | "warning";
  IDDropdownDisabled: boolean;
  IDDropdownTitle: string;
  emailAddress: " pcams1986@icloud.com" | " ";
};

class ProteinCleaver extends React.Component<
  ProteinCleaverProps,
  ProteinCleaverState
> {
  state: ProteinCleaverState = {
    input: {
      name: "",
      tpm: "",
    },
    aminoAcid: {
      original: "",
      position: 0,
      mutation: "",
    },
    geneList: [],
    currentGene: {
      name: "",
      ID: [],
      proteinSequence: "",
    },
    inputLabel: "Gene & Mutation",
    output: "",
    selectedRadioBtn: "neoAntigen",
    nameHelpText: "example: MAGEA4_A60D",
    tpmHelpText: "please enter a number value",
    errorMessage: "",
    nameDropdownColor: "secondary",
    nameDropdownDisabled: true,
    nameDropdownTitle: "gene names",
    IDDropdownColor: "secondary",
    IDDropdownDisabled: true,
    IDDropdownTitle: "gene IDs",
    emailAddress: " ",
  };

  isRadioSelected = (value: string): boolean => {
    return this.state.selectedRadioBtn === value;
  };

  handleRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedRadioBtn = e.currentTarget.value as "cta" | "neoAntigen";
    let nameHelpText: string;
    let inputLabel: "Gene & Mutation" | "Gene Name";

    switch (selectedRadioBtn) {
      case "cta":
        inputLabel = "Gene & Mutation";
        nameHelpText = "example: MAGEA4_A60D";
        break;
      default:
        inputLabel = "Gene Name";
        nameHelpText = "example: MAGEA4";
        break;
    }

    this.setState({
      selectedRadioBtn,
      nameHelpText,
      inputLabel,
    });
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = { ...this.state.input };
    if (e.currentTarget.name === "geneName") {
      input.name = e.currentTarget.value;
    } else {
      input.tpm = e.currentTarget.value;
    }
    this.setState({ input });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  runCTA = async () => {
    const { geneList } = await getCTA(this.state.input);
    const currentGene = geneList[0];
    const proteinSequence = currentGene.proteinSequence;
    const geneID = currentGene.ID[0];
    const { tpm } = this.state.input;
    const output = ctaSequencer(proteinSequence, geneID, tpm);
    return { geneList, output, currentGene };
  };

  runNeo = async () => {
    const { aminoAcid, geneList } = await getNeo(this.state.input);
    const currentGene = geneList[0];
    const geneID = geneList[0].ID[0];
    const { tpm } = this.state.input;
    const output = neoSequencer(currentGene, geneID, tpm, aminoAcid);
    return { aminoAcid, geneList, currentGene, output };
  };

  handleRunBtnClick = async () => {
    let errorMessage = "";
    let output = "";
    let geneList: Gene[] = [];
    let aminoAcid: AminoAcid = {
      original: "",
      position: 0,
      mutation: "",
    };
    let currentGene: Gene = {
      name: "",
      ID: [],
      proteinSequence: "",
    };

    this.setState({ errorMessage, output, geneList });

    try {
      switch (this.state.selectedRadioBtn) {
        case "cta":
          ({ geneList, output, currentGene } = await this.runCTA());
          break;
        default:
          ({ aminoAcid, geneList, currentGene, output } = await this.runNeo());
          break;
      }
    } catch (e: any) {
      errorMessage = e.message;
      this.setState({ errorMessage });
    }

    const nameDropdownTitle = `names: ${geneList.length}`;
    const IDDropdownTitle = `IDs: ${geneList[0].ID.length}`;
    const {
      dropdownColor: nameDropdownColor,
      dropdownDisabled: nameDropdownDisabled,
    } = this.handleDropdownAttributes(geneList.length);
    const {
      dropdownColor: IDDropdownColor,
      dropdownDisabled: IDDropdownDisabled,
    } = this.handleDropdownAttributes(geneList[0].ID.length);

    this.setState({
      output,
      geneList,
      aminoAcid,
      nameDropdownTitle,
      nameDropdownColor,
      nameDropdownDisabled,
      IDDropdownTitle,
      IDDropdownColor,
      IDDropdownDisabled,
      currentGene,
    });
  };

  handleDropdownAttributes = (value: number) => {
    let dropdownColor: "secondary" | "primary" | "warning";
    let dropdownDisabled: boolean;
    switch (value) {
      case 0: {
        dropdownColor = "secondary";
        dropdownDisabled = true;
        break;
      }
      case 1: {
        dropdownColor = "primary";
        dropdownDisabled = false;
        break;
      }
      default: {
        dropdownColor = "warning";
        dropdownDisabled = false;
        break;
      }
    }

    return { dropdownColor, dropdownDisabled };
  };

  handleCopyBtnClick = () => {
    if (!navigator.clipboard) {
      console.log("navigator does not work :-(");
    } else {
      navigator.clipboard.writeText(this.state.output);
    }
  };

  handleNameDropdownClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const geneName = e.currentTarget.name;
    const { geneList } = { ...this.state };
    const currentGene = geneList.find((x) => x.name === geneName) as Gene;

    let color: "secondary" | "primary" | "warning";

    if (currentGene.ID.length === 1) {
      color = "primary";
    } else if (currentGene.ID.length > 1) {
      color = "warning";
    } else {
      color = "secondary";
    }

    this.setState({
      currentGene,
      IDDropdownColor: color,
    });
  };

  handleIDDropdownClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const { currentGene, input, aminoAcid } = this.state;
    const geneID = e.currentTarget.name;
    let output: string;

    switch (this.state.selectedRadioBtn) {
      case "cta":
        output = ctaSequencer(currentGene.proteinSequence, geneID, input.tpm);
        break;
      default:
        output = neoSequencer(currentGene, geneID, input.tpm, aminoAcid);
        break;
    }

    this.setState({ output });
  };

  onEnvelopeClick = () => {
    let { emailAddress } = this.state;
    emailAddress = emailAddress === " " ? " pcams1986@icloud.com" : " ";
    this.setState({ emailAddress: emailAddress });
  };

  render() {
    const {
      input,
      geneList,
      currentGene,
      inputLabel,
      nameHelpText,
      tpmHelpText,
      errorMessage,
      output,
      nameDropdownColor,
      nameDropdownTitle,
      nameDropdownDisabled,
      IDDropdownColor,
      IDDropdownTitle,
      IDDropdownDisabled,
      emailAddress,
    } = this.state;
    return (
      <div className="container">
        <div className="row">
          <Email
            onEnvelopeClick={this.onEnvelopeClick}
            emailAddress={emailAddress}
          />
        </div>
        <div className="row">
          <div className="col">
            <InputForm
              onSubmit={this.handleSubmit}
              onRunClick={this.handleRunBtnClick}
              onCopyClick={this.handleCopyBtnClick}
              onRadioClick={this.handleRadioClick}
              onNameDropdownClick={this.handleNameDropdownClick}
              onIDDropdownClick={this.handleIDDropdownClick}
              onInputChange={this.handleInputChange}
              isRadioSelected={this.isRadioSelected}
              runDisabled={input.name ? false : true}
              copyDisabled={output ? false : true}
              input={input}
              inputLabel={inputLabel}
              tpmHelpText={tpmHelpText}
              errorMessage={errorMessage}
              nameHelpText={nameHelpText}
              nameDropdownTitle={nameDropdownTitle}
              nameDropdownColor={nameDropdownColor}
              names={geneList.map((gene) => gene.name)}
              nameDropdownDisabled={nameDropdownDisabled}
              IDDropdownTitle={IDDropdownTitle}
              IDDropdownColor={IDDropdownColor}
              IDDropdownDisabled={IDDropdownDisabled}
              IDs={currentGene.ID}
            />
          </div>
        </div>
        <div className="gap">
          <Output output={output} />
        </div>
      </div>
    );
  }
}

export default ProteinCleaver;
