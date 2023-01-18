import { PluginProvider } from "./context";
import useHooks from "./hooks";
import { Props } from "./types";

export default function Plugins(props: Props) {
  const value = useHooks(props);
  return <PluginProvider value={value}>{props.children}</PluginProvider>;
}
