type Choice = {
  label: string;
  value: string;
  description?: string;
};

type ChoiceGroupProps = {
  legend: string;
  name: string;
  value: string;
  choices: Choice[];
  onChange: (value: string) => void;
};

export function ChoiceGroup({ legend, name, value, choices, onChange }: ChoiceGroupProps) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="choice-group__options">
        {choices.map((choice) => (
          <label className={`choice ${value === choice.value ? "choice--selected" : ""}`} key={choice.value}>
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <span>
              <strong>{choice.label}</strong>
              {choice.description ? <small>{choice.description}</small> : null}
            </span>
            <i aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
