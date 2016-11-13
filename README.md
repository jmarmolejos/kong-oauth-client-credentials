# OAuth 2.0 Client Credentials Flow Hello World for Kong

This is a simple node.js + express.js + jade application that demonstrates a simple implementation of the OAuth 2.0 authorization with the Client Credentials flow. It is based on the official Hello World from this repo: https://github.com/Mashape/kong-oauth2-hello-world

# Files

This project is made of one main file:

* `app.js`, which handles the server and contains two routes:
  * `GET /proxy_request`, that gets an access token and proxies the request to the target api.

# Installing dependencies

Execute

```shell
npm install
```

# Setting up the environment

To run this project, execute the following operations.

* Make sure you have Kong >= 0.4.0 running. We assume Kong is running at `127.0.0.1` with the default ports.

* Let's add a simple test API:

```shell
curl -d "request_host=test.com" \
     -d "upstream_url=http://mockbin.org/" \
     http://127.0.0.1:8001/apis/
```

* Let's add the OAuth 2.0 plugin, with three available scopes:

```shell
curl -d "name=oauth2" \
     -d "config.scopes=email, phone, address" \
     -d "config.mandatory_scope=true" \
     -d "config.enable_authorization_code=true" \
     -d "config.enable_client_credentials=true" \
     http://127.0.0.1:8001/apis/test.com/plugins/
```

This will output a response including an auto-generated `provision_key` that we need to use later:

```json
{
    "api_id": "2c0c8c84-cd7c-40b7-c0b8-41202e5ee50b",
    "value": {
        "scopes": [
            "email",
            "phone",
            "address"
        ],
        "mandatory_scope": true,
        "provision_key": "2ef290c575cc46eec61947aa9f1e67d3",
        "hide_credentials": false,
        "enable_implicit_grant": false,
        "token_expiration": 7200
    },
    "created_at": 1435783325000,
    "enabled": true,
    "name": "oauth2",
    "id": "656954bd-2130-428f-c25c-8ec47227dafa"
}
```

* Let's create a Kong consumer (called `thefosk`):

```shell
curl -d "username=thefosk" \
     http://127.0.0.1:8001/consumers/
```

* And the first OAuth 2.0 client application called `Hello World App`:

```shell
curl -d "name=Hello World App" \
     -d "redirect_uri=http://getkong.org/" \
     http://127.0.0.1:8001/consumers/thefosk/oauth2/
```

That outputs the following response, including the `client_id` and `client_secret` that we will use later:

```json
{
    "consumer_id": "a0977612-bd8c-4c6f-ccea-24743112847f",
    "client_id": "c217bb9feb274bc6843770a630ef426e",
    "id": "7ce2f90c-3ec5-4d93-cd62-3d42eb6f9b64",
    "name": "Hello World App",
    "created_at": 1435783376000,
    "redirect_uri": "http://getkong.org/",
    "client_secret": "47c12793d54a49bd8237ddfc95587d62"
}
```

# Running the web application

Now that Kong has all the data configured, we can start our application using the `client_id` and `client_secret` keys that have been returned when we added the plugin (you can edit and run the start.sh included in the repo so you don't have to set these variables all the time):

```shell
# Exporting some environment variables used by the Node.js application
export KONG_ADMIN="http://127.0.0.1:8001"
export KONG_API="https://127.0.0.1:8443"
export API_PUBLIC_DNS="requestb.in"
export CLIENT_ID="c217bb9feb274bc6843770a630ef426e"
export CLIENT_SECRET="47c12793d54a49bd8237ddfc95587d62"
export SCOPES="{ \
  \"email\": \"Grant permissions to read your email address\", \
  \"address\": \"Grant permissions to read your address information\", \
  \"phone\": \"Grant permissions to read your mobile phone number\" \
}"

# Starting the node.js application
node app.js
```

# Testing the Authorization Flow

For this authorization flow we don't have to create the authorization screens for the users, we're first getting the actual access token and then using it to authenticate the requests we're proxying through Kong.

With your browser, go to `http://127.0.0.1:3000/proxy_request` and a few things will happen on the server's side:

* Using the client id and secret keys, the node app will request an access token from Kong.
* After getting the access token a request will be proxied to the api you created in the earlier configuration steps.

# Conclusions

Done! Now the client application can exchange the `client_id` and `client_secret` keys for an access token.

To proxy a request to your api after you have the `access_token` you can now execute the following request:

```shell
curl -i -X GET \
  --url https://127.0.0.1:8443/qfdtdzqf \
  --header 'Host: requestb.in' \
  --header "apikey: Rm9vYmFy" \
  --header "Authorization: Bearer 56d2b2b5eef6468b85e82bdb69dc68d2" --insecure
```
