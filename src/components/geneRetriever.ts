import axios from "axios";
import { Input, Gene } from "./proteinCleaver";

export type AminoAcid = {
  original: string;
  position: number;
  mutation: string;
};

type Property = {
  key: string;
  value: string;
};

type UniProtKBCrossReferences = {
  database: string;
  properties: Property[];
  key: string;
  value: string;
};

type Results = {
  organism: string[];
  uniProtKBCrossReferences: UniProtKBCrossReferences[];
  genes: {
    geneName: {
      value: string;
    };
  }[];
  sequence: {
    value: string;
  };
};

export async function getNeo(
  input: Input
): Promise<{ aminoAcid: AminoAcid; geneList: Gene[] }> {
  const { geneName, aminoAcid } = convertInput(input);
  const { geneList } = await getGeneList(geneName);
  return { aminoAcid, geneList };
}

export async function getCTA(input: Input): Promise<{
  geneList: Gene[];
}> {
  const { name } = input;
  const geneName = name.toUpperCase();

  const { geneList } = await getGeneList(geneName);
  // let gene = geneList[0];
  // let output = ctaSequencer(gene, tpm);
  //TODO: Make ctaSequencer run in proteinCleaver in handleRunBtnClick
  return { geneList };
}

function convertInput(input: Input) {
  let { name } = input;
  name = input.name.toUpperCase();

  if (name.length === 0) {
    throw new Error("Input field is required");
  }

  let tpm = parseInt(input.tpm);

  if (Number.isNaN(tpm)) tpm = 10;
  if (!name.includes("_"))
    throw new Error(
      'Did you  mean to run as CTA? Please include "_" between gene name and mutation details for neoAntigen'
    );

  let [geneName, rest] = name.split("_");

  if (geneName.length === 0)
    throw new Error('Input format should be "MAGEA4_A60D"');

  if (!/^\d+$/.test(rest.substring(1, rest.length - 1)))
    throw new Error("Amino acid position should be a number value");

  let originalAminoAcid = rest[0];
  let aminoAcidMutation = rest[rest.length - 1];

  //TODO: add error handling for these two ^^ being string values

  let aminoAcidPosition = parseInt(rest.substring(1, rest.length - 1));

  const aminoAcid = {
    original: originalAminoAcid,
    position: aminoAcidPosition,
    mutation: aminoAcidMutation,
  };

  return { input, geneName, aminoAcid };
}

async function getGeneList(geneName: string) {
  if (geneName.length === 0) throw new Error("Gene name is reqiured");

  const { data: promise } = await axios.get(
    `https://rest.uniprot.org/uniprotkb/stream?format=json&query=%28%28gene%3A${geneName}%29%20AND%20%28reviewed%3Atrue%29%20AND%20%28organism_id%3A9606%29%29`
  );

  const results: Results[] = promise.results;

  if (results.length === 0) {
    throw new Error("Gene name not found");
  }

  /*TODO: Need to error check how many gene items are returned.
    0. dropdown is grey and inactive
    1. dropdown turns  blue
    2+. dropdown turns yellow*/

  let geneList: Gene[] = [];
  let gene: Gene;
  geneName = "";
  let proteinSequence = "";

  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].genes.length; j++) {
      geneName = getGeneName(j, results[i]);
      //eslint-disable-next-line
      if (!geneList.find((gene) => gene.name === geneName)) {
        proteinSequence = getProteinSequence(results[i]);
        let crossReferences = results[i].uniProtKBCrossReferences;
        let geneIDs = getGeneIDs(crossReferences);
        gene = { name: geneName, ID: geneIDs, proteinSequence };
        if (!geneList.includes(gene)) {
          geneList.push(gene);
        }
      }
    }
  }
  return { geneList };
}

function getGeneName(j: number, results: Results): string {
  return results.genes[j].geneName.value.toUpperCase();
}

function getGeneIDs(crossReferences: UniProtKBCrossReferences[]): string[] {
  let geneIDs: string[] = [];
  for (let i = 0; i < crossReferences.length; i++) {
    if (crossReferences[i].database === "Ensembl") {
      for (let property of crossReferences[i].properties) {
        if (property.key === "GeneId") {
          let geneID = property.value.split(".")[0];
          if (!geneIDs.includes(geneID)) {
            geneIDs.push(geneID);
          }
        }
      }
    }
  }
  return geneIDs;
}

function getProteinSequence(results: Results): string {
  return results.sequence.value.toUpperCase();
}

function mutateSequence(sequence: string, aminoAcid: AminoAcid): string {
  let {
    original: originalAminoAcid,
    position: aminoAcidPosition,
    mutation: aminoAcidMutation,
  } = aminoAcid;

  const actualAminoAcid = sequence.substring(
    aminoAcidPosition - 1,
    aminoAcidPosition
  );

  if (originalAminoAcid !== actualAminoAcid)
    throw new Error(
      `Amino acid at position ${aminoAcidPosition} is ${actualAminoAcid}`
    );

  aminoAcidPosition -= 1;
  let peptideFirstHalf = sequence.substring(0, aminoAcidPosition);
  let peptideSecondHalf = sequence.substring(
    aminoAcidPosition + 1,
    sequence.length
  );

  return peptideFirstHalf + aminoAcidMutation + peptideSecondHalf;
}

function verifyTPM(tpm: string): number {
  let result: number;
  if (tpm === "") result = 10;
  else if (!/^\d+$/.test(tpm)) throw new Error("TPM should be a number value");
  else result = parseInt(tpm);

  return result;
}

export function ctaSequencer(
  proteinSequence: string,
  geneID: string,
  tpm: string
): string {
  const flank = "ZZZZZ";
  const flankLength = 5;
  const flankedSequence = flank + proteinSequence + flank;

  let output = "";
  for (let i = 11; i >= 8; i--) {
    let peptideLength = i;
    for (
      let i = 0;
      i <= flankedSequence.length - (peptideLength + flankLength * 2);
      i++
    ) {
      let nTermEnd = i + flankLength;
      let merStart = i + flankLength;
      let merEnd = i + peptideLength + flankLength;
      let cTermStart = i + peptideLength + flankLength;
      let cTermEnd = i + peptideLength + flankLength * 2;

      let nTerm = flankedSequence.substring(i, nTermEnd);
      let mer = flankedSequence.substring(merStart, merEnd);
      let cTerm = flankedSequence.substring(cTermStart, cTermEnd);

      output += `,${geneID},${nTerm},${mer},${cTerm},${tpm}\n`;
    }
  }
  return output;
}

export function neoSequencer(
  gene: Gene,
  geneID: string,
  TPM: string,
  aminoAcid: AminoAcid
): string {
  const flankLength = 5;
  const maxPeptideLength = 11;
  const minPeptideLength = 8;
  const { name, proteinSequence } = gene;
  const flank = "ZZZZZ";
  let output = "";
  let { position: aminoAcidPosition } = aminoAcid;
  let mutatedSequence = mutateSequence(proteinSequence, aminoAcid);
  const adjustedPosition = aminoAcidPosition + flankLength;
  mutatedSequence = flank + mutatedSequence + flank;

  let tpm = verifyTPM(TPM);

  for (let i = maxPeptideLength; i >= minPeptideLength; i--) {
    let peptideLength = i;
    let offset: number;
    let cycles: number;
    if (aminoAcidPosition < peptideLength) {
      offset = peptideLength - aminoAcidPosition;
      cycles = peptideLength;
    } else if (
      mutatedSequence.length - peptideLength - flankLength <
      adjustedPosition
    ) {
      cycles = mutatedSequence.length + 1 - adjustedPosition - flankLength;
      offset = 0;
    } else {
      offset = 0;
      cycles = peptideLength;
    }

    for (let j = offset; j < cycles; j++) {
      let nTermStart = adjustedPosition + j - (peptideLength + flankLength);
      let nTermEnd = adjustedPosition + j - peptideLength;
      let peptideStart = adjustedPosition + j - peptideLength;
      let peptideEnd = adjustedPosition + j;
      let cTermStart = adjustedPosition + j;
      let cTermEnd = adjustedPosition + j + flankLength;

      let nTerm = mutatedSequence.substring(nTermStart, nTermEnd);
      let peptide = mutatedSequence.substring(peptideStart, peptideEnd);
      let cTerm = mutatedSequence.substring(cTermStart, cTermEnd);
      output += `${name},${geneID},${nTerm},${peptide},${cTerm},${tpm}\n`;
    }
  }

  return output;
}
