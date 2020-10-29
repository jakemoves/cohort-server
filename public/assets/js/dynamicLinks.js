//step 6 dynamic url

const insertDynamicLink = () => {
  const currentUrlHostname = window.location.hostname;
  const eventLandingPageURL = `/join/occasions/6/web/true" target="_blank`;
  const adminURL = '/admin';

  document.getElementById('step6').innerHTML += `<p class = "text-left mt-4">Alternatively, you can <a href="${eventLandingPageURL}"> click this link </a> to open a recipient browser tab on your current device.</p>`;
  document.getElementById('step1').innerHTML += `<p class="text-left">Open up a new tab for our admin panel at <a href="${adminURL}" target="_blank"> ${window.location.protocol}//${currentUrlHostname}/admin by clicking here</a></p>`
}
insertDynamicLink();