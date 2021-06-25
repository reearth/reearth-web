const html = `
<h1>Block</h1>
<script>
  addEventListener("message", e => {
    if (e.source !== parent) return;
    const p = document.createElement("p");
    p.textContent = JSON.stringify(e.data);
    document.body.appendChild(p);
    console.log("plugin block: plugin -> iframe", e.data);
    parent.postMessage(e.data, "*");
  });
</script>
`;

reearth.ui.show(html, { visible: true });
reearth.ui.onmessage = (message) => {
  console.log("plugin block: plugin <- iframe", message);
}

reearth.onupdate = () => {
  console.log("plugin block", reearth);
  reearth.ui.postMessage(reearth.block ?? null);
};
reearth.onupdate();
