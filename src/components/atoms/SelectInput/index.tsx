import React, { useCallback, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

export type Item<Value extends string | number = string> = {
  value: Value;
  label: string;
  icon?: string;
};

export type Props<Value extends string | number> = {
  className?: string;
  items?: Item<Value>[];
  onFilter?: (filterText: string) => void;
  onSelect?: () => void;
};

export default function SelectInput<Value extends string | number>({
  // className,
  items,
  onFilter,
}: // onSelect,
Props<Value>): JSX.Element | null {
  // const [filterText, setFilterText] = useState("");
  // const [selectedOption, selectOption] = useState("");
  const handleTextChange = useCallback(
    (text: string) => {
      // setFilterText(e.currentTarget.value);
      onFilter?.(text);
    },
    [onFilter],
  );
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: "black",
      padding: 20,
    }),
  };
  return (
    <>
      <CreatableSelect
        styles={customStyles}
        isClearable
        isMulti={false}
        options={items}
        onInputChange={handleTextChange}
      />
    </>
  );
}

// export default function SelectInput<Value extends string | number>({
//   className,
//   items,
//   onFilter,
//   onSelect,
// }: Props<Value>): JSX.Element | null {
//   return <Select<Value>className={className}>
//     {items?.map((i) => {
//       return(

//       )
//     })}
//   </Select>;
// }
