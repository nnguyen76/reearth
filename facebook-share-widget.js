reearth.ui.show(
  `<style>
      body { 
        margin: 0;
      }
  </style>
<!-- Facebook -->
<div id="fb-root"></div>
	<div class="fb-share-button" data-href="https://reearth.io/" data-layout="button" data-size="large" id="facebook-share">
		<a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Freearth.io%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">
		Share
		</a>
	</div>
</div>

<script async defer crossorigin="anonymous" src="https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v13.0" nonce="QhVE4Z3L"></script>

<script>
	// recieve message
   window.addEventListener("message", e => {
    if (e.source !== parent || !e.data || e.data.type !== "facebook") return;
    property = e.data.property;
    if (property) {
      let link = document.getElementById("facebook-share")
      link.setAttribute('data-href', property.url);
    }
  });
</script>

  `
  , { visible: true });

// post message
reearth.on("update", send);
send();

function send() {
  if (reearth.widget?.property?.default) {
    reearth.ui.postMessage({
      type: "facebook",
      property: reearth.widget.property.default
    });
  }
}