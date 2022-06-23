import { ClearIcon, SubmitIcon } from "../../../../constants/icons";
import { IInput, InputProps } from "../index";
import { useDashboardNew } from "../../../../hooks/refactor/useDashboard";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardActions } from "../../../../types/dashboard";

const TextInput = (props: InputProps) => {
  const { dataMode, dispatch, inputs } = useDashboardNew();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateValue = inputs[props.name];
  const [value, setValue] = useState<string>(() => {
    return stateValue || "";
  });
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const updateValue = (e) => {
    setValue(e.target.value);
    setIsDirty(true);
  };

  const submit = () => {
    setIsDirty(false);
    dispatch({
      type: DashboardActions.SET_LAST_CHANGED_INPUT,
      name: props.name,
    });
    if (value) {
      searchParams.set(props.name, value);
      setSearchParams(searchParams, { replace: !stateValue });
    } else {
      searchParams.delete(props.name);
      setSearchParams(searchParams, { replace: !stateValue });
    }
  };

  const clear = () => {
    setValue("");
    setIsDirty(false);
    searchParams.delete(props.name);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    setValue(stateValue || "");
    setIsDirty(false);
  }, [stateValue]);

  return (
    <div>
      {props.properties.label && (
        <label htmlFor={props.name} className="block mb-1">
          {props.properties.label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          name={props.name}
          id={props.name}
          className="flex-1 block w-full bg-background-panel rounded-md border border-black-scale-3 pr-8 overflow-x-auto text-sm md:text-base disabled:bg-black-scale-1 focus:ring-0"
          onChange={updateValue}
          onKeyPress={(e) => {
            if (e.key !== "Enter") {
              return;
            }
            submit();
          }}
          placeholder={props.properties.placeholder}
          readOnly={dataMode === "snapshot"}
          value={value}
        />
        {value && isDirty && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-foreground-light"
            onClick={submit}
            title="Submit"
          >
            <SubmitIcon className="h-4 w-4" />
          </div>
        )}
        {value && !isDirty && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-foreground-light"
            onClick={clear}
            title="Clear"
          >
            <ClearIcon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

const definition: IInput = {
  type: "text",
  component: TextInput,
};

export default definition;
