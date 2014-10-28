'use strict';
(function () {

  var loopbackAuth = {};

  loopbackAuth.storage = angular.module('loopbackAuth.storage', []);

  loopbackAuth.storage.factory('LoopBackAuthStorage', function() {
    var props = ['accessTokenId', 'currentUserId'];

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      var key = '$LoopBack$' + name;
      if (value === null) value = '';
      storage[key] = value;
    }

    function load(name) {
      var key = '$LoopBack$' + name;
      return localStorage[key] || sessionStorage[key] || null;
    }

    function LoopBackAuthStorage() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.rememberMe = undefined;
      this.currentUserData = null;
    }

    LoopBackAuthStorage.prototype.save = function() {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function(name) {
        console.log(name, self[name]);
        save(storage, name, self[name]);
      });
    };

    LoopBackAuthStorage.prototype.setUser = function(accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    };

    LoopBackAuthStorage.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    };

    return new LoopBackAuthStorage();
  });


  loopbackAuth.restangular = angular.module('loopbackAuth.restangular', ['restangular', loopbackAuth.storage.name]);

  loopbackAuth.restangular.factory('LoopBackAuthApi', ['Restangular', 'LoopBackAuthStorage', function(Restangular, LoopBackAuthStorage) {


    function LoopBackAuthApi() {
      this.currentUser = null;

      // Create a separate restangular with it's own config (still uses global defaults).
      this.restangular = Restangular.withConfig(function(Configurer) {
        // The base Url is set to /api/ by default, but can be overriden.
        Configurer.setBaseUrl('/api');
      });

      this.storage = LoopBackAuthStorage;
      console.log(this.storage);

      this.login = function(creds){
        var self = this;
        return this.restangular
          .all("Users")
          .customPOST(creds,'login')
          .then(
            function(login) {
              // success - store the access token (id) and userId info
              self.storage.setUser(login.id, login.userId);
              self.storage.save();
            }
          );
      };

      this.logout = function(){

        // Delete the user data cached locally.
        this.currentUser = null;
        this.storage.clearUser();
        this.storage.save();

        return this.restangular.customPOST(null, 'Users/logout');
      };

      this.register = function(regDetails){
        return this.restangular
          .all("Users")
          .customPOST(regDetails)
          .then(function(user) {
            // success - user was created, just return the object.
            // if we wanted to register + sign the user in, do that
            // in your own custom then since we passback the password as well.
            if(user.password) {
              user.password = regDetails.password;
            }
            return user;
          });
      };

      this.confirm = function(){
        return this.restangular.customGET(null, 'Users/confirm');
      };

      this.resetPassword = function(){
        return this.restangular.customPOST(null, 'Users/reset');
      };

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      this.ensureCurrentUser = function() {
        if (this.currentUser) {
          console.log('Using cached user');
          return this.currentUser;
        }
        if(!this.isLoggedIn()) {
          console.log('User not logged in.');
          this.currentUser = null;
          return this.currentUser;
        }
        else {
          // Fetch the actual user data.
          this.currentUser = this.getCurrentUser(function(userData) {
            console.log("Current User Fetch Success:", userData);
          },
          function(err) {
            console.log("Current User Fetch Failed:", err);
          });
        }
        return this.currentUser;
      };

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      this.isLoggedIn = function() {
        if(this.storage.currentUserId && this.storage.accessTokenId) {
          return true;
        }
        return false;
      };

      this.getCurrentUser = function() {
        if (this.isLoggedIn) {
          return this.restangular
            .one('Users', this.storage.currentUserId)
            .get();
        }
        return null;
      };

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      this.isLoggedInAsync = function(cb) {
        if(this.currentUser.hasOwnProperty('$promise')) {
          this.currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        }
      };

      this.addAuthHeader = function(restangular) {
        // so that the callback uses the correct 'this';
        self = this;
        restangular.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
          headers = headers || {};
          if (self.storage.accessTokenId) {
            headers.authorization = this.storage.accessTokenId;
            return {headers: headers};
          }
        });
      };
    }

  var Auth = new LoopBackAuthApi();

  // Set the header for itself as well.
  Auth.addAuthHeader(Auth.restangular);

  return Auth;

  }]);

loopbackAuth.restangular.factory('User', ['LoopBackAuthApi', function(LoopBackAuthApi) {

  console.log(LoopBackAuthApi);
  var User = LoopBackAuthApi.restangular.all('Users');

  return User;

}]);

  // A stub for using non-restangular version of the API (using $resource).
  loopbackAuth.resource = angular.module('loopbackAuth.resource', ['$resource', loopbackAuth.storage.name]);
}());
