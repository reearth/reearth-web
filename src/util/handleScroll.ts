export function handleScroll(
  { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
  onLoadMore?: () => void,
) {
  if (
    Math.floor(currentTarget.scrollTop) + currentTarget.clientHeight >=
    currentTarget.scrollHeight
  ) {
    onLoadMore?.();
  }
}
