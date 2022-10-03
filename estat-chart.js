
const html = `
<canvas id="chart" width="400" height="400"></canvas>
<script id="chartjs" src="https://cdn.jsdelivr.net/npm/chart.js@3.6.1/dist/chart.min.js"></script>
<script>
  let property, chart, estatdata;

  function fetchData() {
    if (estatdata) return Promise.resolve(estatdata);
    if (!property) return Promise.resolve();

    return fetch(
      "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?lang=J&statsDataId=0003410379&metaGetFlg=Y&cntGetFlg=N&explanationGetFlg=Y&annotationGetFlg=Y&sectionHeaderFlg=1&replaceSpChars=0&appId=" + property.appId
    ).then(r => {
      if (r.ok) return r.json();
    }).then(r => {
      if (!r) return;
      estatdata = r;
      return r;
    });
  }

  function calcData(data) {
    if (!property || !data) return;

    const data2 = data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE
      .filter(d => d["@area"] === property.area && d["@tab"] === "020");
    if (data2.length === 0) return;

    return {
      datasets: [
        { cat: "100", label: "人口", color: "rgb(255, 159, 64)" },
        { cat: "110", label: "人口（男）", color: "rgb(54, 162, 235)" },
        { cat: "120", label: "人口（女）", color: "rgb(255, 99, 132)" }
      ].map(cat => ({
        label: cat.label,
        borderColor: cat.color,
        data: data2.filter(d => d["@cat01"] === cat.cat).map(d => ({
          x: Math.floor(d["@time"] / 1000000) + "年",
          y: d.$
        })),
      }))
    };
  }

  function updateChart() {
    return fetchData().then(d => {
      if (!d || !chart) return;
      chart.data = calcData(d);
      chart.update();
    });
  }

  document.getElementById("chartjs").addEventListener("load", () => {
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    updateChart();
  });

  window.addEventListener("message", e => {
    if (e.source !== parent || !e.data.reearth) return;

    property = e.data;
    if (property.area) {
      property.area = ("0" + property.area).slice(-2) + "000";
    }

    updateChart();
  });
</script>
`;

reearth.ui.show(html);
reearth.on("update", send);
send();

function send() {
  if (reearth.block?.property?.default) {
    reearth.ui.postMessage({
      // This is necessary to determine if the message is caused by a plugin,
      // since the browser may send a message to all iframes
      // depending on the browser and operating environment, such as Chrome on Android.
      reearth: true,
      ...reearth.block.property.default
    });
  }
}
