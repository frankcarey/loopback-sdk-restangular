'use strict';

angular.module('myApp')
  .factory('Auth', function($LoopBackAuthApi) {

  var apiBaseUrl = 'http://mysite.com/api';

  // Inherit from LoopBackAuth so you don't need to modifying it.
  var Auth = LoopBackAuthApi;

  // Override the base url for the API.
  Auth.restangular.setBaseUrl(apiBaseUrl);

  // Your custom methods here ..
  return Auth;
});

