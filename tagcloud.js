const html = `
<style>
  body {
    max-width: 300px;
  }
  ul.tc {
    background: #fff;
    color: #a33;
    border-radius: 10px;
    padding: 5px;
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    line-height: 2.5rem;
  }
  ul.tc a {
    --size: attr(data-weight number, 2);
    font-size: calc(var(--size) * 1rem);
    color: #a33;
    display: block;
    padding: 0.125rem 0.25rem;
    text-decoration: none;
    position: relative;
    border-radius: 0.4rem;
    vertical-align: middle;
  }
  ul.tc li.active a {
    background: #a33;
    color: #fff;
  }
  ul.tc a::after {
    content: " (" attr(data-count) ")";
    font-size: 1rem;
    display: inline-block;
    vertical-align: middle;
  }
  ul.tc a[data-weight="1"] { --size: 1; }
  ul.tc a[data-weight="2"] { --size: 2; }
  ul.tc a[data-weight="3"] { --size: 3; }
  ul.tc a[data-weight="4"] { --size: 4; }
  ul.tc a[data-weight="5"] { --size: 5; }
  ul.tc a[data-weight="6"] { --size: 6; }
  ul.tc a[data-weight="7"] { --size: 7; }
  ul.tc a[data-weight="8"] { --size: 8; }
  ul.tc a[data-weight="9"] { --size: 9; }
</style>
<ul id="tc" class="tc"></ul>
<script>
  const tc = document.getElementById("tc");
  window.addEventListener("message", e => {
    if (e.source !== parent || !e.data.reearth) return;
    tc.innerHTML = "";

    e.data.tags.map(tag => {
      const li = document.createElement("li");
      li.setAttribute("data-tagid", tag.id);

      const a = document.createElement("a");
      a.textContent = tag.label;
      a.addEventListener("click", e => {
        e.preventDefault();
        li.classList.toggle("active");
        parent.postMessage({
          tags: Array.from(document.querySelectorAll("ul.tc li.active")).map(tag => tag.dataset.tagid)
        }, "*");
      });
      a.setAttribute("href", "#");
      a.setAttribute("data-count", tag.count.toString());
      a.setAttribute("data-weight", Math.min(tag.count + 1, 9));

      li.appendChild(a);
      return li;
    }).forEach(e => {
      tc.appendChild(e);
    });
  });
</script>
`;

let hidden = [];

reearth.on("message", data => {
  if (!data.tags) return;
  const displayed = reearth.layers.findByTags(...data.tags).map(l => l.id);
  const newHidden = data.tags.length ? reearth.layers.findAll(l => !displayed.includes(l.id)).map(l => l.id) : [];
  reearth.layers.show(...hidden);
  reearth.layers.hide(...newHidden);
  hidden = newHidden;
});

reearth.ui.show(html);
reearth.on("update", send);
send();

function tags() {
  return reearth.layers.tags.flatMap(tg => (tg.tags || [tg]).map(t => ({
    id: t.id,
    label: t.label ?? "",
    count: reearth.layers.findByTags(t.id).length,
  }))).filter(t => !!t);
}

function send() {
  reearth.ui.postMessage({
    // This is necessary to determine if the message is caused by a plugin,
    // since the browser may send a message to all iframes
    // depending on the browser and operating environment, such as Chrome on Android.
    reearth: true,
    tags: tags(),
  });
}
