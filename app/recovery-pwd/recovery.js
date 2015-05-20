/**
 * Created by Matute on 26/04/2015.
 */
(function() {
  'use strict';

  angular.module('login.recovery', ['ngRoute', 'toastr'])

      .config(['$routeProvider', function ($routeProvider) {
          $routeProvider.when('/recovery', {
              templateUrl: './recovery-pwd/recovery.html',
              controller: 'RecoveryCtrl'
          });
      }])
      .controller('RecoveryCtrl', RecoveryCtrl)
      .factory('RecoveryService', RecoveryService);

    //Injects
    //RecoveryCtrl.$inject = ['RecoveryService', '$scope', '$location', 'toastr', '$http'];
    RecoveryCtrl.$inject = ['RecoveryService', '$scope', '$location', 'toastr'];
    RecoveryService.$inject = ['$http'];

    /**
     *
     * @param CrearService
     * @param $scope
     * @param $location
     * @param toastr
     * @constructor
     */
    //function RecoveryCtrl(RecoveryService, $scope, $location, toastr, $http) {
    function RecoveryCtrl(RecoveryService, $scope, $location, toastr) {
        var vm = this;
        // Variables
        vm.email= '';

        // Function Declarations
        //asigno la funcion a una variable
        vm.sendMail = sendMail;

        /**
         * Envia un mail para recuperar la Password o bien para tener una nueva
         */
        function sendMail(){

            if(vm.email.trim().length == 0) {
                toastr.error('Por favor ingrese una direcci&oacute;n de Mail');
            }
            else {
                if (ValidateEmail(vm.email.trim())) {
                    RecoveryService.getUser(vm.email.trim(), function(data){
                        if(data.user != "null") {
                            var new_password = GenerateRandomPassword();
                            //console.log(new_password);
                            RecoveryService.resetPassword(data.user, new_password, function(data2){
                                //console.log(data2);
                                if(data2.result) {
                                    //sendPassword($scope.signup.email, new_password);
                                    RecoveryService.sendPassword(vm.email.trim(), new_password, function(enviado) {
                                        //console.log(enviado);
                                        if(enviado == "true") {
                                            vm.email = '';
                                            toastr.success('Se envio la contrase&ntilde;a');
                                        }
                                        else {
                                            toastr.error('Se produjo un error al enviar el mail');
                                        }
                                    });
                                }
                                else {
                                    toastr.error('Se produjo un error al recuperar la contrase&ntilde;a');
                                }
                            });
                        }
                        else {
                            toastr.error('El correo ingresado no existe. Por favor ingrese un correo valido');
                        }
                    });
                }
                else {
                    toastr.error('Por favor ingrese una direccion de Mail valida');
                }
          
            }
        }

    }

    /**
     *
     * @param email
     * @returns {boolean}
     */
    function ValidateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email)
    }

    /**
     * Genera una contrase�0�9a aleatoria
     * @constructor
     */
    function GenerateRandomPassword()
    {
        return Math.random()            // Generate random number, eg: 0.123456
            .toString(36)       // Convert  to base-36 : "0.4fzyo82mvyr"
            .slice(-8);         // Cut off last 8 characters : "yo82mvyr"
    }

    /**
     *
     * @param $http
     * @returns {{}}
     * @constructor
     */
    function RecoveryService($http) {
        //Variables
        var service = {};

        //Function declarations
        service.getUser = getUser;
        service.resetPassword = resetPassword;
        service.sendPassword = sendPassword;

        return service;

        //Functions
        /**
         *
         * @param email
         * @param callback
         * @returns {*}
         */
        function getUser(email, callback) {
            return $http.post('./login-api/user.php',
                {
                    'function': 'getUserByEmail',
                    'email': email
                })
                .success(function (data) {
                    //console.log(data);
                    if (data) {
                        callback(data);
                    }
                })
                .error()
        }

        /**
         *
         * @param user
         * @param new_password
         * @param callback
         * @returns {*}
         */
        function resetPassword(user, new_password, callback) {
            return $http.post('./login-api/user.php',
                {
                    'function': 'resetPassword',
                    'user': user,
                    'new_password': new_password,
                    'changepwd': '1'
                })
                .success(function (data) {
                    //console.log(data);
                    if (data) {
                        callback(data);
                    }
                })
                .error()
        }

        /**
         *
         * @param email
         * @param new_password
         * @param callback
         * @returns {*}
         */
        function sendPassword(email, new_password, callback) {
            var mensaje = "Recibís este correo porque solicitaste recuperar tu contraseña.\n" +
                    "Te enviamos a continuación la siguiente contraseña.\n\n" +
                    "Nueva Contraseña: " + new_password + "\n\n" +
                    "Puedes cambiar tu contraseña haciendo click sobre el siguiente link \n\n" +
                    "http://192.185.67.199/~arielces/playground/login/#/changepwd \n\n" +
                    "La contraseña enviada es temporal y debera generar una nueva.  \n\n" +
                    "Saludos";

            //console.log(mensaje);
            return $http.post('./recovery-pwd/send-pwd.php',
                {
                    'email': email,
                    'nombre': 'Nueva contraseña temporal',
                    'mensaje': mensaje,
                    'asunto': 'Nueva contraseña para Playground'
                })
                .success(function (data) {
                    //console.log(data);
                    callback(data);
                })
                .error()
        }

    }

})();