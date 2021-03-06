(function () {
    'use strict';

    var destinationWebsite = "http://localhost/test-login/app/#/verify-login/";
    //var destinationWebsite = "http://192.185.67.199/~arielces/playground/redirect/#/verify-login/";

    angular.module('login.login', ['ngRoute', 'ngCookies', 'toastr'])
    //angular.module('login.login', ['ngRoute', 'ngCookies'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/login/:action', {
                templateUrl: './login/login.html',
                controller: 'LoginCtrl'
            });
            $routeProvider.when('/login', {
                templateUrl: './login/login.html',
                controller: 'LoginCtrl'
            });
        }])
        .controller('LoginCtrl', LoginCtrl)
        .factory('LoginService', LoginService);

    //Injects
    LoginCtrl.$inject = ['LoginService', '$cookieStore', '$window', '$routeParams', 'toastr', '$location'];
    //LoginCtrl.$inject = ['LoginService', '$cookieStore', '$window', '$routeParams'];
    LoginService.$inject = ['$http', '$cookieStore', '$window'];


    //Implementations
    //function LoginCtrl(LoginService, $cookieStore, $window, $routeParams) {
    function LoginCtrl(LoginService, $cookieStore, $window, $routeParams, toastr, $location) {
        // Functions
        var vm = this;

        // Variables
	vm.username = '';
        vm.password = '';
        vm.changePwd = 0;
        
        // Functions declaration
        vm.login = login;
        vm.createUser = createUser;
        vm.recoveryPwd = recoveryPwd;
        vm.changePwd = changePwd;

        //Init
        checkLogged();

        //Implementations
        function login() {
            if(vm.username.trim().length > 0 && vm.password.trim().length > 0) {
                if(vm.password.trim().length >= 6 && vm.password.trim().length <= 25) {
                    LoginService.login(vm.username, vm.password, function (data){
                        console.log(data);
                        if(data.response) {                            
                            var user = JSON.parse(data.user);
                            vm.changePwd = user.change_pwd;
                            if(user.change_pwd === 0) {
                                //$window.location.href = destinationWebsite;
                                LoginService.setLogged(user.user_name, user.usuario_id, user.rol_id, user.token);
                            }                                
                            else {
                                toastr.warning('Por favor cambie la contraseña temporal');
                            }                        	
                        }
                        else {
                            toastr.error('Usuario o contraseña invalido');
                        }
                    });
                }
                else {
                    toastr.warning('La Password deben tener un mínimo de 6 caracteres y un maximo de 25');
                }
            }
            else {
                toastr.error('Por favor ingrese un usuario y Password');
            }
        }

        function createUser() {
            $location.path("/crear");
        }

        function recoveryPwd() {
            $location.path("/recovery");
        }

        function changePwd() {
            $location.path("/changepwd");
        }

        function checkLogged() {
            if($routeParams !== undefined){
                if($routeParams.action == 'clear'){
                    $cookieStore.remove('appname.login.userLogged');
                }
            }
            var globals = $cookieStore.get('appname.login.userLogged');
            //console.log(globals);
            if (globals !== undefined &&
                globals.userid !== undefined &&
                globals.userid !== '') {
                LoginService.checkLastLogin(globals.userid, function (data) {
                    if (data) {
                        // Redirecciona a la aplicaci��n verdadera
                        //console.log('true');
                        $window.location.href = destinationWebsite + globals.verification + '/' + globals.userid;
                    }
                });
            }
        }
    }


    function LoginService($http, $cookieStore, $window) {
        //Variables
        var service = {};

        //Function declarations
        service.login = login;
        service.checkLogged = checkLogged;
        service.checkLastLogin = checkLastLogin;
        service.setLogged = setLogged;

        return service;

         //Functions
        function login(username, password, callback) {
            return $http.post('./login-api/user.php',
                {'function': 'login', 'username': username, 'password': password})
                .success(function (data) {
                    if (data.response) {                        
                        var user = JSON.parse(data.user);
                        //setLogged(user.user_name, user.usuario_id, user.rol_id, user.token);
                    }                    
                    //console.log(data);
                    callback(data);
                })
                .error()
        }

        function checkLastLogin(userid, callback) {
            return $http.post('./login-api/user.php',
                {function: 'checkLastLogin', 'userid': userid})
                .success(function (data) {
                    //console.log(data);
                    if(data !=='false'){

                        callback(data);
                    }
                })
                .error()
        }

        function setLogged(username, userid, rol, verification) {
            var datos = {
                'username': username || '',
                'userid': userid || '',
                'rol': rol || '',
                'verification': verification || ''
            }
            $cookieStore.put('appname.login.userLogged', datos);
            //console.log(verification);
            $window.location.href = destinationWebsite + verification + '/' + userid;
        }

        function checkLogged() {

        }
    }

})();