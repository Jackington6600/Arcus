import { EventHandler } from "react";


type InputProps =
  TextInputProps |
  TextAreaInputProps |
  NumberInputProps;

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

export default function ThinInput(props: InputProps) {
  switch (props.type) {
    case 'text':
      break;
    case 'textarea':
      break;
    case 'number':
      break;
    default:
      throw new Error(`Unknown type: '${props['type']}'`)
  }
  const onChange: EventHandler<React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>> = (event) => {
    if (props.onChange === undefined)
      return;

    if (props.type === 'text' || props.type === 'textarea') {
      props.onChange(event.target.value);
    } else if (props.type === 'number') {
      // TODO
      props.onChange(event.target.value === '' ? null : +event.target.value);
    }
  }

  const labelExcluded = props.label === undefined;

  const inputProps = {
    className: `form-control ${labelExcluded ? props.className ?? '' : ''}`,
    id: props.id,
    placeholder: '', // Required to get CSS selectors to work
    onChange: onChange,
    value: props.value ?? '',
    readOnly: props.readOnly,
    disabled: props.disabled,
    min: props.type === 'number' ? props.min : undefined,
    max: props.type === 'number' ? props.max : undefined
  };

  const input = props.type === 'textarea'
    ? <textarea rows={props.rows} {...inputProps} />
    : <input type={props.type} {...inputProps} />;

  return (
    labelExcluded
      ? input
      : <div className={`form-floating thin ${props.className ?? ''}`}>
        {input}
        <label htmlFor={props.id}>{props.label}</label>
      </div>
  );
}
