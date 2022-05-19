export function handleScroll(
  { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
  onLoadMore?: () => void,
) {
  if (currentTarget.scrollTop + currentTarget.clientHeight >= currentTarget.scrollHeight) {
    onLoadMore?.();
  }
}
