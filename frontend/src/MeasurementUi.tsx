import { useState } from "react";
import { Select } from "antd";
import type { Measurement } from "./api_types/Measurement";
import type { GenderSelection } from "./api_types/GenderSelection";
import GenderSelectionUi from "./GenderSelectionUi";

interface MeasurementUiProps {
  value: Measurement | undefined;
  onChange: (measurement: Measurement | undefined) => void;
}

function MeasurementUi({ value, onChange }: MeasurementUiProps) {
  const getMeasurementType = (m: Measurement | undefined): string => {
    if (!m) return "";
    if (m.type === "popularity") return "Popularity";
    if (m.type === "denseRank") return "DenseRank";
    if (m.type === "count") return "Count";
    if (m.type === "masculinity") return "Masculinity";
    if (m.type === "femininity") return "Femininity";
    if (m.type === "genderNeutrality") return "GenderNeutrality";
    return "";
  };

  const getGenderSelection = (m: Measurement | undefined): GenderSelection => {
    if (!m) return "both";
    if (m.type === "popularity") return m.genderSelection;
    if (m.type === "denseRank") return m.genderSelection;
    if (m.type === "count") return m.genderSelection;
    return "both";
  };

  const [measurementType, setMeasurementType] = useState<string>(
    getMeasurementType(value),
  );

  const needsGenderSelection =
    measurementType === "Popularity" ||
    measurementType === "DenseRank" ||
    measurementType === "Count";

  const handleMeasurementTypeChange = (newMeasurementType: string) => {
    if (!newMeasurementType) {
      onChange(undefined);
      return;
    }

    let measurement: Measurement;
    if (newMeasurementType === "Popularity") {
      measurement = {
        type: "popularity",
        genderSelection: getGenderSelection(value),
      };
    } else if (newMeasurementType === "DenseRank") {
      measurement = {
        type: "denseRank",
        genderSelection: getGenderSelection(value),
      };
    } else if (newMeasurementType === "Count") {
      measurement = {
        type: "count",
        genderSelection: getGenderSelection(value),
      };
    } else if (newMeasurementType === "Masculinity") {
      measurement = { type: "masculinity" };
    } else if (newMeasurementType === "Femininity") {
      measurement = { type: "femininity" };
    } else {
      measurement = { type: "genderNeutrality" };
    }

    onChange(measurement);
  };

  const handleGenderSelectionChange = (newGenderSelection: GenderSelection) => {
    if (!measurementType) return;

    let measurement: Measurement;
    if (measurementType === "Popularity") {
      measurement = { type: "popularity", genderSelection: newGenderSelection };
    } else if (measurementType === "DenseRank") {
      measurement = { type: "denseRank", genderSelection: newGenderSelection };
    } else if (measurementType === "Count") {
      measurement = { type: "count", genderSelection: newGenderSelection };
    } else {
      // Should not happen, but handle gracefully
      return;
    }

    onChange(measurement);
  };

  return (
    <>
      <Select
        value={measurementType || undefined}
        placeholder="Select Measurement"
        onChange={(newType) => {
          setMeasurementType(newType);
          handleMeasurementTypeChange(newType);
        }}
        popupMatchSelectWidth={false}
      >
        <Select.Option value="Popularity">Popularity</Select.Option>
        <Select.Option value="DenseRank">DenseRank</Select.Option>
        <Select.Option value="Count">Count</Select.Option>
        <Select.Option value="Masculinity">Masculinity</Select.Option>
        <Select.Option value="Femininity">Femininity</Select.Option>
        <Select.Option value="GenderNeutrality">GenderNeutrality</Select.Option>
      </Select>

      {needsGenderSelection && (
        <GenderSelectionUi
          value={getGenderSelection(value)}
          onChange={handleGenderSelectionChange}
        />
      )}
    </>
  );
}

export default MeasurementUi;
