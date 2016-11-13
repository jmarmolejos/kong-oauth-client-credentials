/*
  Don't use the module's cache as your storage in production,
  this is just me being lazy to write an actual implementation
*/
var token = null;

function isValid(token) {
  var now = new Date();

  var result = now - token.createdDate;

  return (result/1000) <= (token.expiresIn - 60);
}

var tokenStorage = {
  getToken: function () {
    if (token === null) {
      return { accessToken: "", isValid: false };
    }

    return {
      accessToken: token.accessToken,
      isValid: isValid(token)
    };
  },

  setToken: function (accessToken) {
    accessToken.createdDate = new Date();
    token = {
      createdDate: new Date(),
      accessToken: accessToken.access_token,
      expiresIn: accessToken.expires_in
    };
  }
};

module.exports = tokenStorage;
