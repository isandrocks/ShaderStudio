import { useRef, useEffect } from "react";

/**
 * Custom hook to keep a ref in sync with a state value
 * Useful for accessing current state values in callbacks or animation loops
 *
 * @param value - The value to sync to the ref
 * @returns A ref that always contains the current value
 *
 * @example
 * const [count, setCount] = useState(0);
 * const countRef = useSyncedRef(count);
 * // In requestAnimationFrame or other callback:
 * // countRef.current always has the latest count value
 */
export function useSyncedRef<T>(value: T): React.RefObject<T> {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
