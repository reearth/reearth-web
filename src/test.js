export default function Hoge() {
  const [s, ss] = React.useState(0);
  return React.createElement("h1", { onClick: () => ss(s => s + 1)}, `Hello, ${s}`);
}
