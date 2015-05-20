'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'login.login',
  'login.crear',
  'login.recovery',
  'login.changepwd',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'})
  ;
}]);