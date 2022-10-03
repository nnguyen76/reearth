const html = `
<style>
  body { margin: 0; }
  .extendedh { width: 100%; }
  .extendedv { height: 100%; }
  #wrapper {
    border: 2px solid;
    border-radius: 2px;
    background-color: white;
    box-sizing: border-box;
  }

  .button {
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 12px 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
    }

  .extendedh body, .extendedh #wrapper { width: 100%; }
  .extendedv body, .extendedv #wrapper { height: 100%; }
  ::-webkit-scrollbar { width: 8px; background: gray; }
  ::-webkit-scrollbar-thumb { border-radius: 4px; background: red; }
</style>
<div id="wrapper">
  <h1 style="font-style: italic; margin-left: 20px;">Vietnam</h1>
  <p>Latitude: <span id="lat">-</span></p>
  <p>Longitude: <span id="lon">-</span></p>
  <p>Altitude: <span id="alt">-</span>km</p>
  <p>
    <button id="update" class="button">Update</button>
    <button id="jump" class="button">Jump</button>
    <button id="follow" class="button">Follow</button>
    <button id="resize" class="button">Resize</button>
  </p>
</div>
<script>
  let lat, lng, alt;

  const update = () => {
    return fetch("https://api.wheretheiss.at/v1/satellites/25544").then(r => r.json()).then(data => {
      lat = 16.06260728770949;
      lng = 108.2280758390567;
      alt = data.altitude * 1000; // km -> m
      document.getElementById("lat").textContent = data.latitude;
      document.getElementById("lon").textContent = data.longitude;
      document.getElementById("alt").textContent = data.altitude;
    });
  };

  const send = () => {
    parent.postMessage({ type: "fly", lat, lng, alt }, "*");
  };

  // document.getElementById("update").addEventListener("click", update);
  document.getElementById("jump").addEventListener("click", send);

  const updateExtended = e => {
    if (e && e.horizontally) {
      document.documentElement.classList.add("extendedh");
    } else {
      document.documentElement.classList.remove("extendedh");
    }
    if (e && e.vertically) {
      document.documentElement.classList.add("extendedv");
    } else {
      document.documentElement.classList.remove("extendedv");
    }
  };

  addEventListener("message", e => {
    if (e.source !== parent || !e.data.extended) return;
    updateExtended(e.data.extended);
  });

  updateExtended(${JSON.stringify(reearth.widget.extended || null)});
  update();

  let timer;
  document.getElementById("follow").addEventListener("click", (e) => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
      e.currentTarget.textContent = "Follow";
      return;
    }
    const cb = () => update().then(() => {
      send();
      if (timer) timer = setTimeout(cb, 3000);
    });
    timer = 1;
    cb();
    e.currentTarget.textContent = "Unfollow";
  });

  let folded = true;
  document.getElementById("resize").addEventListener("click", (e) => {
    folded = !folded;
    parent.postMessage({ type: "resize", folded }, "*");
  });
</script>
`;

reearth.ui.show(html, { width: 300 });

reearth.on("update", () => {
  reearth.ui.postMessage({
    extended: reearth.widget.extended
  });
});

reearth.on("message", msg => {
  if (msg.type === "fly") {
    reearth.visualizer.camera.flyTo({
      lat: msg.lat,
      lng: msg.lng,
      height: msg.alt + 1000,
      heading: 0,
      pitch: -Math.PI/2,
      roll: 0,
    }, {
      duration: 2
    });
    const layer = reearth.layers.find(l => l.type === "model" && l.title === "ISS");
    if (layer) {
      reearth.layers.overrideProperty(layer.id, {
        default: {
          location: { lat: msg.lat, lng: msg.lng },
          height: msg.alt
        }
      });
    }
  } else if (msg.type === "resize") {
    reearth.ui.resize?.(msg.folded ? 300 : 500, undefined, msg.folded ? undefined : true);
  }
});
