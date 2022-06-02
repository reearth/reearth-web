export function handleScroll(
  { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
  onLoadMore?: () => void,
) {
  if (
    Math.floor(currentTarget.scrollTop) + Math.floor(currentTarget.clientHeight) >=
    Math.floor(currentTarget.scrollHeight)
  ) {
    onLoadMore?.();
  }
}
