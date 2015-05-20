(function(){
    'use strict';

    angular.module('login.crear', ['ngRoute', 'toastr'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/crear', {
                templateUrl: './crear-usuario/crear.html',
                controller: 'CrearCtrl'
            });
        }])
        .controller('CrearCtrl', CrearCtrl)
        .factory('CrearService', CrearService);

    CrearCtrl.$inject = ['CrearService', '$location', 'toastr'];
    CrearService.$inject = ['$http'];

    function CrearCtrl(CrearService, $location, toastr) {
        var vm = this;
        // Variables
        vm.nombre = '';
        vm.apellido = '';
        vm.username = '';
        vm.password = '';
        vm.password_repeat = '';

        // Function Declarations
        vm.create = create;
        vm.test = function(){
            CrearService.test();
        };

        //Implementation
        function create(){
            if(vm.nombre.trim().length > 0 && vm.apellido.trim().length > 0 && vm.username.trim().length > 0 && vm.password.trim().length > 0) {
                if((vm.password.trim().length >= 6 && vm.password.trim().length <= 25)
                    && (vm.password_repeat.trim().length >= 6 && vm.password_repeat.trim().length <= 25)) {
                    if(vm.password.trim() === vm.password_repeat.trim()) {
                        CrearService.existeUsuario(vm.username, function(data){
                            if(data == 'false') {
                                CrearService.Create(vm.nombre, vm.apellido, vm.username, vm.password, function(data){
                                    if(data){
                                        toastr.success('Usuario creado con éxito');
                                        $location.path('#');
                                    }
                                    else{
                                        toastr.error('Vuelva a intentar');
                                        console.log(data);
                                    }
                                });    
                            }
                            else {
                                toastr.warning('El usuario que trata de crear ya existe. Ingrese otro nombre de usuario');    
                            }
                        });                        
                    }
                    else {
                        toastr.error('Las contraseñas nuevas no son iguales. Por favor ingrese las mismas contraseñas');
                    }
                }
                else {
                    toastr.warning('Las contraseñas deben tener un mínimo de 6 caracteres y un máximo de 25');
                }
            }
            else {
                toastr.error('Por favor complete todos los campos');
            }
        }
    }

    function CrearService($http){
        var service = {};

        service.Create = Create;
        service.test = test;
        service.existeUsuario = existeUsuario;

        return service;

        function test(){
            return $http.post('./login-api/test.php',
                {'function': 'test'})
                .success(function(data){
                    console.log(data);
                })
                .error(function(data){
                    console.log(data);
                });
        }

        //Functions
        function Create(nombre, apellido, username, password, callback){
            var user = {
                'nombre': nombre,
                'apellido': apellido,
                'username': username,
                'password': password
            };
            return $http.post('./login-api/user.php',
                {
                    'function': 'create',
                    'user': JSON.stringify(user)
                })
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    console.log(data);
                });
        }
        
        function existeUsuario(username, callback) {
            return $http.post('./login-api/user.php',
                {
                    'function': 'existeUsuario',
                    'username': username
                })
                .success(function(data){
                    console.log(data);
                    callback(data);
                })
                .error(function(data){
                    console.log(data);
                });    
        }
    }
})();