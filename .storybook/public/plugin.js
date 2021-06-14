const html = `
<h1>IFrame works</h1>
<script>
  addEventListener("message", e => {
    if (e.source !== parent) return;
    const p = document.createElement("p");
    p.textContent = JSON.stringify(e.data);
    document.body.appendChild(p);
    console.log("plugin -> iframe", e.data);
    parent.postMessage(e.data, "*");
  });
</script>
`;

reearth.ui.show(html, { visible: true, autoResize: true });
reearth.ui.onmessage = (message) => {
  console.log("plugin <- iframe", message);
};
reearth.ui.postMessage("foo!");
