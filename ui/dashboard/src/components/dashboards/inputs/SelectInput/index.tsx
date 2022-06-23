import Select, {
  components,
  OptionProps,
  SingleValueProps,
} from "react-select";
import usePrevious from "../../../../hooks/usePrevious";
import useSelectInputStyles from "./useSelectInputStyles";
import { ColorGenerator } from "../../../../utils/color";
import { DashboardActions } from "../../../../types/dashboard";
import { getColumn } from "../../../../utils/data";
import { InputProps } from "../index";
import { useDashboardNew } from "../../../../hooks/refactor/useDashboard";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface SelectOption {
  label: string;
  value: string;
}

type SelectInputProps = InputProps & {
  multi?: boolean;
  name: string;
};

const stringColorMap = {};
const colorGenerator = new ColorGenerator(24, 4);

const stringToColour = (str) => {
  if (stringColorMap[str]) {
    return stringColorMap[str];
  }
  const color = colorGenerator.nextColor().hex;
  stringColorMap[str] = color;
  return color;
};

const OptionTag = ({ tagKey, tagValue }) => (
  <span
    className="rounded-md text-xs"
    style={{ color: stringToColour(tagValue) }}
    title={`${tagKey} = ${tagValue}`}
  >
    {tagValue}
  </span>
);

const LabelTagWrapper = ({ label, tags }) => (
  <div className="space-x-2">
    {/*@ts-ignore*/}
    <span>{label}</span>
    {/*@ts-ignore*/}
    {Object.entries(tags || {}).map(([tagKey, tagValue]) => (
      <OptionTag key={tagKey} tagKey={tagKey} tagValue={tagValue} />
    ))}
  </div>
);

const OptionWithTags = (props: OptionProps) => (
  <components.Option {...props}>
    {/*@ts-ignore*/}
    <LabelTagWrapper label={props.data.label} tags={props.data.tags} />
  </components.Option>
);

const SingleValueWithTags = ({ children, ...props }: SingleValueProps) => {
  return (
    <components.SingleValue {...props}>
      {/*@ts-ignore*/}
      <LabelTagWrapper label={props.data.label} tags={props.data.tags} />
    </components.SingleValue>
  );
};

const MultiValueLabelWithTags = ({ children, ...props }: SingleValueProps) => {
  return (
    <components.MultiValueLabel {...props}>
      {/*@ts-ignore*/}
      <LabelTagWrapper label={props.data.label} tags={props.data.tags} />
    </components.MultiValueLabel>
  );
};

const getValueForState = (multi, option) => {
  if (multi) {
    // @ts-ignore
    return option.map((v) => v.value).join(",");
  } else {
    return option.value;
  }
};

const findOptions = (options, multi, value) => {
  return multi
    ? options.filter((option) =>
        option.value ? value.indexOf(option.value.toString()) >= 0 : false
      )
    : options.find((option) =>
        option.value ? option.value.toString() === value : false
      );
};

const SelectInput = ({ data, multi, name, properties }: SelectInputProps) => {
  const { dataMode, dispatch, inputs } = useDashboardNew();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [initialisedFromState, setInitialisedFromState] = useState(false);
  // const [recordLastChange, setRecordLastChange] = useState(false);
  const [value, setValue] = useState<SelectOption | SelectOption[] | null>(
    null
  );

  // Get the options for the select
  const options: SelectOption[] = useMemo(() => {
    // If no options defined at all
    if (
      (!properties?.options || properties?.options.length === 0) &&
      (!data || !data.columns || !data.rows)
    ) {
      return [];
    }

    if (data) {
      const labelCol = getColumn(data.columns, "label");
      const valueCol = getColumn(data.columns, "value");
      const tagsCol = getColumn(data.columns, "tags");

      if (!labelCol || !valueCol) {
        return [];
      }

      return data.rows.map((row) => ({
        label: row[labelCol.name],
        value: row[valueCol.name],
        tags: tagsCol ? row[tagsCol.name] : {},
      }));
    } else if (properties.options) {
      return properties.options.map((option) => ({
        label: option.label || option.name,
        value: option.name,
        tags: {},
      }));
    } else {
      return [];
    }
  }, [properties.options, data]);

  const stateValue = inputs[name];

  useEffect(() => {
    console.log({
      name,
      multi,
      options,
      placeholder: properties.placeholder,
      stateValue,
    });

    if (!stateValue && !properties.placeholder && options.length) {
      console.log("Need to choose first", name);
      setValue(multi ? [options[0]] : options[0]);
      dispatch({
        type: DashboardActions.SET_LAST_CHANGED_INPUT,
        name,
      });
      searchParams.set(
        name,
        getValueForState(multi, multi ? [options[0]] : options[0])
      );
      setSearchParams(searchParams, { replace: true });
    } else if (stateValue && options.length) {
      console.log("Setting from state", name);
      const parsedUrlValue = multi ? stateValue.split(",") : stateValue;
      const foundOptions = findOptions(options, multi, parsedUrlValue);
      setValue(foundOptions || null);
    }
  }, [
    dispatch,
    name,
    multi,
    options,
    properties.placeholder,
    searchParams,
    setValue,
    stateValue,
  ]);

  // const previousInputStates = usePrevious({
  //   stateValue,
  //   value,
  // });
  //
  // // Bind the selected option to the reducer state
  // useEffect(() => {
  //   // If we haven't got the data we need yet...
  //   if (!options || options.length === 0 || initialisedFromState) {
  //     return;
  //   }
  //
  //   // If this is first load and we have a value from state, initialise it
  //   if (stateValue) {
  //     const parsedUrlValue = multi ? stateValue.split(",") : stateValue;
  //     const foundOptions = findOptions(options, multi, parsedUrlValue);
  //     setValue(foundOptions || null);
  //     setInitialisedFromState(true);
  //   } else if (!stateValue && properties.placeholder) {
  //     setInitialisedFromState(true);
  //   } else if (!stateValue && !properties.placeholder) {
  //     console.log("Initialising with first value");
  //     setValue(multi ? [options[0]] : options[0]);
  //     dispatch({
  //       type: DashboardActions.SET_LAST_CHANGED_INPUT,
  //       name,
  //     });
  //     searchParams.set(
  //       name,
  //       getValueForState(multi, multi ? [options[0]] : options[0])
  //     );
  //     setSearchParams(searchParams, { replace: true });
  //     setInitialisedFromState(true);
  //   }
  // }, [
  //   dispatch,
  //   initialisedFromState,
  //   multi,
  //   name,
  //   options,
  //   properties.placeholder,
  //   searchParams,
  //   stateValue,
  //   setSearchParams,
  // ]);
  //
  // useEffect(() => {
  //   if (!initialisedFromState || !previousInputStates) {
  //     return;
  //   }
  //
  //   if (
  //     previousInputStates &&
  //     // @ts-ignore
  //     previousInputStates.stateValue &&
  //     // @ts-ignore
  //     previousInputStates.stateValue !== stateValue &&
  //     value
  //   ) {
  //     console.log("Updating with value from state");
  //     const parsedUrlValue = multi ? stateValue.split(",") : stateValue;
  //     const foundOptions = findOptions(options, multi, parsedUrlValue);
  //     setValue(foundOptions || null);
  //     setRecordLastChange(false);
  //     return;
  //   }
  //
  //   if (
  //     previousInputStates &&
  //     // @ts-ignore
  //     previousInputStates.stateValue &&
  //     !stateValue &&
  //     value
  //   ) {
  //     console.log("Clearing as value from state cleared");
  //     setValue(null);
  //     setRecordLastChange(false);
  //   }
  // }, [
  //   dispatch,
  //   initialisedFromState,
  //   options,
  //   multi,
  //   previousInputStates,
  //   searchParams,
  //   setSearchParams,
  //   stateValue,
  //   value,
  // ]);
  //
  // useEffect(() => {
  //   if (!initialisedFromState) {
  //     return;
  //   }
  //
  //   if (
  //     !value ||
  //     // @ts-ignore
  //     value.length === 0
  //   ) {
  //     if (recordLastChange) {
  //       console.log("Recording history for state");
  //     }
  //     dispatch({
  //       type: DashboardActions.SET_LAST_CHANGED_INPUT,
  //       name,
  //     });
  //     searchParams.delete(name);
  //     setSearchParams(searchParams, { replace: !recordLastChange });
  //     setRecordLastChange(false);
  //     return;
  //   }
  //
  //   if (recordLastChange) {
  //     console.log("Recording history for state", {
  //       previousInputStates,
  //       stateValue,
  //       value,
  //     });
  //     dispatch({
  //       type: DashboardActions.SET_LAST_CHANGED_INPUT,
  //       name,
  //     });
  //     searchParams.set(name, getValueForState(multi, value));
  //     setSearchParams(searchParams);
  //     setRecordLastChange(false);
  //   }
  // }, [
  //   dispatch,
  //   initialisedFromState,
  //   multi,
  //   name,
  //   previousInputStates,
  //   searchParams,
  //   setSearchParams,
  //   value,
  // ]);

  const styles = useSelectInputStyles();

  if (!styles) {
    return null;
  }

  return (
    <form>
      {properties && properties.label && (
        <label
          className="block mb-1 text-sm"
          id={`${name}.label`}
          htmlFor={`${name}.input`}
        >
          {properties.label}
        </label>
      )}
      <Select
        aria-labelledby={`${name}.input`}
        className="basic-single"
        classNamePrefix="select"
        components={{
          // @ts-ignore
          MultiValueLabel: MultiValueLabelWithTags,
          // @ts-ignore
          Option: OptionWithTags,
          // @ts-ignore
          SingleValue: SingleValueWithTags,
        }}
        menuPortalTarget={document.body}
        inputId={`${name}.input`}
        isDisabled={(!properties.options && !data) || dataMode === "snapshot"}
        isLoading={!properties.options && !data}
        isClearable={!!properties.placeholder}
        isRtl={false}
        isSearchable
        isMulti={multi}
        // menuIsOpen
        name={name}
        onChange={(value) => {
          dispatch({
            type: DashboardActions.SET_LAST_CHANGED_INPUT,
            name,
          });
          searchParams.set(name, getValueForState(multi, value));
          setSearchParams(searchParams);
          // setRecordLastChange(true);
          // @ts-ignore
          setValue(value);
        }}
        options={options}
        placeholder={
          properties && properties.placeholder ? properties.placeholder : null
        }
        styles={styles}
        value={value}
      />
    </form>
  );
};

export default SelectInput;
