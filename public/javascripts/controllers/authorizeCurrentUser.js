rsvpBuddy.controllers.authorizeCurrentUser = function() {
var access_token = document.URL.match(/access_token=.+\b/g);
if (access_token) {
alert(access_token.toString().split('=')[1]);
} else {
// User not logged in, log them in
var client_id = '9vjs6vdesogbvnrv6uoal3ufh9';
if (document.URL.indexOf('localhost') !== -1) {
client_id = '5olqblvb85fcckedja4uv42cgt';
}
window.location = 'https://secure.meetup.com/oauth2/authorize?client_id=' + client_id + '&response_type=token&redirect_uri=' + encodeURIComponent(document.URL);
}
}