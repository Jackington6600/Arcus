import { DependencyList, useEffect, useRef, useState } from "react";

export function usePrevState<S>(value: S): S | undefined {
  const ref = useRef<S>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useDependentState<S>(calculateState: () => S, deps?: DependencyList): S {
  const [state, setState] = useState<S>(calculateState());
  useEffect(() => setState(calculateState()), deps);
  return state;
}
