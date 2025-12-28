import { Link } from "react-router-dom";
import type { NameData } from "./api_types";

interface NameResultProps {
  name: NameData;
}

function NameResult({ name }: NameResultProps) {
  return <Link to={`/${name.name}`}>{name.name}</Link>;
}

export default NameResult;
