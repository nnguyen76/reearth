reearth.ui.show(
  `<style>
      body { 
        margin: 0;
      }
  </style>

  <!-- Twitter -->

  <a class="twitter-share-button"
    href="https://twitter.com/intent/tweet"
    data-size="large"
    data-text="Default text"
    data-url="https://reearth.io/"
    data-hashtags="reearth"
    data-lang="ja"
    data-dnt="true"
    id="twitter-button">
  Tweet
  </a>
  <script>

  // recieve message
   window.addEventListener("message", e => {
    if (e.source !== parent || !e.data || e.data.type !== "twitter") return;
    property = e.data.property;
    if (property.url) {
      let link = document.getElementById("twitter-button")
      link.setAttribute('data-url', property.url);
      link.setAttribute('data-hashtags', property.hashtags);
      link.setAttribute('data-text', property.text);
    }
  });

  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
  </script>


  `

  , { visible: true });


// post message
reearth.on("update", send);
send();

function send() {
  if (reearth.widget?.property?.default) {
    reearth.ui.postMessage({
      type: "twitter",
      property: reearth.widget.property.default
    });
  }
}

