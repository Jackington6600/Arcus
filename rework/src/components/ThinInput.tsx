import { EventHandler, PropsWithChildren } from "react";
import { fromPairs as lodashFromPairs } from "lodash";


type InputProps<T> =
  TextInputProps |
  TextAreaInputProps |
  NumberInputProps |
  SelectInputProps<T>;

type CommonInputProps<T> = {
  label?: string
  id: string
  className?: string
  value: T
  readOnly?: boolean
  disabled?: boolean,
  onChange?: (value: T) => void
}

type CommonTextInputProps = {
  // TODO
} & CommonInputProps<string>;

type TextInputProps = {
  type: 'text'
} & CommonTextInputProps;

type TextAreaInputProps = {
  type: 'textarea'
  rows: number
} & CommonTextInputProps;

type NumberInputProps = {
  type: 'number'
  min?: number
  max?: number
} & CommonInputProps<number | null>;

type SelectInputProps<T> = {
  type: 'select'
  values: readonly T[]
  getValue: (value: T) => string
  getDisplayName: (value: T) => string
} & CommonInputProps<T>;


export default function ThinInput<T>(props: InputProps<T>) {
  switch (props.type) {
    case 'text':
    case 'textarea':
    case 'number':
    case 'select':
      break;
    default:
      throw new Error(`Unknown type: '${props['type']}'`)
  }

  const valueMap = props.type === 'select' ? lodashFromPairs(props.values.map(v => [props.getValue(v), v])) : {};

  const onChange: EventHandler<React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>> = (event) => {
    if (props.onChange === undefined)
      return;

    if (props.type === 'text' || props.type === 'textarea') {
      props.onChange(event.target.value);
    } else if (props.type === 'number') {
      // TODO
      props.onChange(event.target.value === '' ? null : +event.target.value);
    } else if (props.type === 'select') {
      props.onChange(valueMap[event.target.value] ?? props.values[0])
    }
  }

  const labelExcluded = props.label === undefined;

  const inputProps = {
    className: `${props.type === 'select' ? 'form-select' : 'form-control'} ${labelExcluded ? props.className ?? '' : ''}`,
    id: props.id,
    placeholder: '', // Required to get CSS selectors to work
    onChange: onChange,
    readOnly: props.readOnly,
    disabled: props.disabled,
    min: props.type === 'number' ? props.min : undefined,
    max: props.type === 'number' ? props.max : undefined
  };

  const input = props.type === 'textarea'
    ? <textarea rows={props.rows} value={props.value} {...inputProps} />
    : props.type === 'select'
      ? <select value={props.value !== null ? props.getValue(props.value) : undefined} {...inputProps}>
        {props.values.map(v => <option key={props.getValue(v)} value={props.getValue(v)}>{props.getDisplayName(v)}</option>)}
      </select>
      : <input type={props.type} value={props.value ?? ''} {...inputProps} />;

  return (
    labelExcluded
      ? input
      : <div className={`form-floating thin ${props.className ?? ''}`}>
        {input}
        <label htmlFor={props.id}>{props.label}</label>
      </div>
  );
}
