var request       = require('request');
var bodyParser    = require('body-parser');
var express       = require("express");
var app           = express();
var tokenStorage  = require('./tokenStorage');

app.set('view engine', 'jade');
app.use(bodyParser());

// Accept every SSL certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function load_env_variable(name) {
  var value = process.env[name];
  if (value) {
    console.log(name + " is " + value);
    return value;
  } else {
    console.error("You need to specify a value for the environment variable: " + name);
    process.exit(1);
  }
}

/*
  URLs to Kong
*/
var KONG_ADMIN = load_env_variable("KONG_ADMIN");
var KONG_API = load_env_variable("KONG_API");

/*
  The API Public DNS, required later when making a request
  to authorize the OAuth 2.0 client application
*/
var API_PUBLIC_DNS = load_env_variable("API_PUBLIC_DNS");

/*
  The scopes that we support, with their extended
  description for a nicer frontend user experience
*/
var SCOPE_DESCRIPTIONS = JSON.parse(load_env_variable("SCOPES")); //The scopes that we support, with their extended


/*
  Client Id and secret used for the client credentials grant
*/

var CLIENT_ID = load_env_variable("CLIENT_ID");
var CLIENT_SECRET = load_env_variable("CLIENT_SECRET");

/*
  This route gets a an access token from kong

  GetToken:

  curl -X POST https://localhost:8443/oauth2/token
    --data "grant_type=client_credentials"
    --data "client_id=c217bb9feb274bc6843770a630ef426e"
    --data "client_secret=47c12793d54a49bd8237ddfc95587d62"
    --data "scope=email phone address"
    --header 'Host: requestb.in' --insecure

  Proxy Request:

  curl -i -X GET \
  --url http://localhost:8000/173so3t1 \
  --header 'Host: requestb.in' \
  --header "apikey: Rm9vYmFy" \
  --header "Authorization: Bearer 8ceadf2140494f23a7ce268d1f1a76a2"

*/

function proxyRequest(accessToken, res) {
  request({
    method: 'GET',
    url: KONG_API + '/qfdtdzqf', // TODO param right side
    headers: {
      host: API_PUBLIC_DNS,
      apikey: "Rm9vYmFy", // TODO param apikey
      authorization: 'Bearer ' + accessToken,
      'x-custom-id': 'fooId' // Just because we can ...
    }
  }, function(error, proxiedResponse, body) {
    res.send('request proxied, got response: ' + body);
  });
}

app.get('/proxy_request', function (req, res) {

  var token = tokenStorage.getToken();

  if (token.isValid) {
    proxyRequest(token.accessToken, res);
  } else {
    request({
      method: "POST",
      url: KONG_API + "/oauth2/token",
      headers: { host: API_PUBLIC_DNS },
      form: {
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        scope: "email phone address", // TODO set as params
        client_secret: CLIENT_SECRET
      }
    }, function(error, response, body) {
      var authData = JSON.parse(body);
      tokenStorage.setToken(authData);
      proxyRequest(authData.access_token, res);
    });
  }
});

/*
  Index page
*/

app.get("/", function(req, res) {
  res.render('index');
});

app.listen(3000);

console.log("Running at Port 3000");
