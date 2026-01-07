import { useState } from "react";
import { Select } from "antd";
import type { Measurement } from "./api_types/Measurement";
import type { GenderSelection } from "./api_types/GenderSelection";

interface MeasurementUiProps {
  value: Measurement | undefined;
  onChange: (measurement: Measurement | undefined) => void;
}

function MeasurementUi({ value, onChange }: MeasurementUiProps) {
  const getMeasurementType = (m: Measurement | undefined): string => {
    if (!m) return "";
    if (typeof m === "string") {
      return m.charAt(0).toUpperCase() + m.slice(1);
    }
    if ("popularity" in m) return "Popularity";
    if ("denseRank" in m) return "DenseRank";
    if ("count" in m) return "Count";
    return "";
  };

  const getGenderSelection = (m: Measurement | undefined): GenderSelection => {
    if (!m || typeof m === "string") return "both";
    if ("popularity" in m) return m.popularity;
    if ("denseRank" in m) return m.denseRank;
    if ("count" in m) return m.count;
    return "both";
  };

  const [measurementType, setMeasurementType] = useState<string>(
    getMeasurementType(value),
  );

  const [genderSelection, setGenderSelection] = useState<GenderSelection>(
    getGenderSelection(value),
  );

  const needsGenderSelection =
    measurementType === "Popularity" ||
    measurementType === "DenseRank" ||
    measurementType === "Count";

  const updateMeasurement = (
    newMeasurementType: string,
    newGenderSelection: GenderSelection,
  ) => {
    if (!newMeasurementType) {
      onChange(undefined);
      return;
    }

    let measurement: Measurement;
    if (newMeasurementType === "Popularity") {
      measurement = { popularity: newGenderSelection };
    } else if (newMeasurementType === "DenseRank") {
      measurement = { denseRank: newGenderSelection };
    } else if (newMeasurementType === "Count") {
      measurement = { count: newGenderSelection };
    } else if (newMeasurementType === "Masculinity") {
      measurement = "masculinity";
    } else if (newMeasurementType === "Femininity") {
      measurement = "femininity";
    } else {
      measurement = "genderNeutrality";
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
          if (!newType) {
            onChange(undefined);
            return;
          }
          updateMeasurement(newType, genderSelection);
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
        <Select
          value={genderSelection}
          onChange={(newGender) => {
            setGenderSelection(newGender as GenderSelection);
            updateMeasurement(measurementType, newGender as GenderSelection);
          }}
          popupMatchSelectWidth={false}
        >
          <Select.Option value="f">F</Select.Option>
          <Select.Option value="m">M</Select.Option>
          <Select.Option value="both">Both</Select.Option>
        </Select>
      )}
    </>
  );
}

export default MeasurementUi;

