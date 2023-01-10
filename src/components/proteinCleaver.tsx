import * as React from "react";
import InputForm from "./inputForm";
import Output from "./common/output";
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
  inputLabel: string;
  output: string;
  selectedRadioBtn: string;
  nameHelpText: string;
  tpmHelpText: string;
  errorMessage: string;
  nameDropdownColor: string;
  nameDropdownDisabled: boolean;
  nameDropdownTitle: string;
  IDDropdownColor: string;
  IDDropdownDisabled: boolean;
  IDDropdownTitle: string;
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
  };

  isRadioSelected = (value: string): boolean => {
    return this.state.selectedRadioBtn === value;
  };

  handleRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedRadioBtn = e.currentTarget.value;
    let nameHelpText = "";
    let inputLabel = "";
    if (selectedRadioBtn === "neoAntigen") {
      inputLabel = "Gene & Mutation";
      nameHelpText = "example: MAGEA4_A60D";
    } else {
      inputLabel = "Gene Name";
      nameHelpText = "example: MAGEA4";
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
      if (this.state.selectedRadioBtn === "cta") {
        ({ geneList } = await getCTA(this.state.input));
        currentGene = geneList[0];
        let proteinSequence = currentGene.proteinSequence;
        let geneID = currentGene.ID[0];
        let { tpm } = this.state.input;
        output = ctaSequencer(proteinSequence, geneID, tpm);
      } else {
        ({ aminoAcid, geneList } = await getNeo(this.state.input));
        currentGene = geneList[0];
        let geneID = geneList[0].ID[0];
        let { tpm } = this.state.input;
        output = neoSequencer(currentGene, geneID, tpm, aminoAcid);
      }
    } catch (e: any) {
      errorMessage = e.message;
      this.setState({ errorMessage });
    }

    let nameDropdownTitle = `names: ${geneList.length}`;
    let nameColor: string;
    let nameDisabled: boolean;
    let IDDropdownTitle = `IDs: ${geneList[0].ID.length}`;
    let IDColor: string;
    let IDDisabled: boolean;

    if (geneList.length === 1) {
      nameColor = "primary";
      nameDisabled = false;
    } else if (geneList.length > 1) {
      nameColor = "warning";
      nameDisabled = false;
    } else {
      nameColor = "secondary";
      nameDisabled = true;
    }

    if (geneList[0].ID.length === 1) {
      IDColor = "primary";
      IDDisabled = false;
    } else if (geneList[0].ID.length > 1) {
      IDColor = "warning";
      IDDisabled = false;
    } else {
      IDColor = "secondary";
      IDDisabled = true;
    }

    this.setState({
      output,
      geneList,
      aminoAcid,
      nameDropdownColor: nameColor,
      nameDropdownTitle,
      nameDropdownDisabled: nameDisabled,
      IDDropdownColor: IDColor,
      IDDropdownTitle,
      IDDropdownDisabled: IDDisabled,
      currentGene,
    });
  };

  handleNameDropdownClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const geneName = e.currentTarget.name;
    const { geneList } = { ...this.state };
    const currentGene = geneList.find((x) => x.name === geneName) as Gene;

    let color: string;

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
    let { currentGene, input, aminoAcid } = this.state;
    const geneID = e.currentTarget.name;
    let output: string;

    if (this.state.selectedRadioBtn === "cta") {
      output = ctaSequencer(currentGene.proteinSequence, geneID, input.tpm);
    } else {
      output = neoSequencer(currentGene, geneID, input.tpm, aminoAcid);
    }
    this.setState({ output });
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
    } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <InputForm
              onSubmit={this.handleSubmit}
              onRunClick={this.handleRunBtnClick}
              onCopyClick={() => {
                navigator.clipboard.writeText(this.state.output);
              }}
              onInputChange={this.handleInputChange}
              onRadioClick={this.handleRadioClick}
              isRadioSelected={this.isRadioSelected}
              runDisabled={false}
              copyDisabled={output ? false : true}
              input={input}
              inputLabel={inputLabel}
              tpmHelpText={tpmHelpText}
              errorMessage={errorMessage}
              nameHelpText={nameHelpText}
              onNameDropdownClick={this.handleNameDropdownClick}
              nameDropdownTitle={nameDropdownTitle}
              nameDropdownColor={nameDropdownColor}
              names={geneList.map((gene) => gene.name)}
              nameDropdownDisabled={nameDropdownDisabled}
              onIDDropdownClick={this.handleIDDropdownClick}
              IDDropdownTitle={IDDropdownTitle}
              IDDropdownColor={IDDropdownColor}
              IDs={currentGene.ID}
              IDDropdownDisabled={IDDropdownDisabled}
            />
          </div>
        </div>
        <div className="gap">
          <Output output={this.state.output} />
        </div>
      </div>
    );
  }
}

export default ProteinCleaver;
