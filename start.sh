echo 'starting sample ...'

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

node app.js
