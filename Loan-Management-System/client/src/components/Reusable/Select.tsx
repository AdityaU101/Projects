import React from "react";

interface Props {
  label: string;
  type: string;
  data: [] | undefined;
  dataNotFoundMessage: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const Select = ({ label, type, data, dataNotFoundMessage, setSelected }: Props) => {
  return (
    <div className="flex items-center">
      <label className="form-label" htmlFor={"bank"}>
        {label}
      </label>
      {data ? (
        <select className="form-input-box" onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelected(event.target.value)}>
          <option value={""}>Select a {type} code</option>
          {data.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      ) : (
        <p className="">{dataNotFoundMessage}</p>
      )}
    </div>
  );
};

export default Select;
