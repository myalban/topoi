angular.module("Application", ["Application.Constants", "Application.Controllers", "Application.Directives", "Application.Filters", "Application.Resources", "Application.Services", "ngResource", "ui.bootstrap"])

    .config(["$httpProvider", function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }])

    .config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {
        $routeProvider
            .when("/home", {controller: "HomeController", templateUrl: "html/home.html"})
            .when("/login", {controller: "LogInController", templateUrl: "html/login.html"})
            .when("/logout", {controller: "LogOutController", templateUrl: "html/logout.html"})
            .when("/resetpassword", {controller: "ResetPasswordController", templateUrl: "html/resetpassword.html"})
            .when("/signup", {controller: "SignUpController", templateUrl: "html/signup.html"})
            .otherwise({redirectTo: "/home"});
    }]);

angular.module("Application.Constants", [])

    .constant("KinveyAppKey", "kid_ePnnV73luf")

    .constant("KinveyAppSecret", "a2lkX2VQbm5WNzNsdWY6MGY3YTFmNDliZDQzNDA3N2JhYzE4YjU2NDA2MTMzYWE=")

    .constant("KinveyBaseUrl", "https://baas.kinvey.com");

angular.module("Application.Controllers", [])

    .controller("HomeController", ["$scope", function($scope) {
    }])

    .controller("LogInController", ["$scope", "UserService", function($scope, UserService) {
        $scope.logIn = function() {
            console.log("LogInController login");
            UserService.logIn($scope.password, $scope.username);
        }
    }])

    .controller("LogOutController", ["$scope", "UserService", function($scope, UserService) {
        $scope.logOut = function() {
            console.log("LogOutController logOut");
            UserService.logOut();
        }
    }])

    .controller("NavController", ["$scope", function($scope) {
    }])

    .controller("ResetPasswordController", ["$scope", "ResetPasswordService", function($scope, ResetPasswordService) {
        $scope.resetPassword = function() {
            console.log("ResetPasswordController resetPassword");
            ResetPasswordService.resetPassword($scope.username);
        }
    }])

    .controller("SignUpController", ["$scope", "UserService", function($scope, UserService) {
        $scope.signUp = function() {
            console.log("SignUpController signUp");
            UserService.signUp($scope.email, $scope.password, $scope.username);
        }
    }]);

angular.module("Application.Directives", []);

angular.module("Application.Filters", []);

angular.module("Application.Resources", [])

    .factory("ResetPasswordResource", ["$resource", "KinveyAppKey", "KinveyBaseUrl", function($resource, KinveyAppKey, KinveyBaseUrl) {
        return $resource(KinveyBaseUrl + "/rpc/" + KinveyAppKey + "/:username/user-password-reset-initiate", {}, {
            resetPassword: {method: "POST", params: {username: "@username"}}
        });
    }])

    .factory("UserResource", ["$resource", "KinveyAppKey", "KinveyBaseUrl", function($resource, KinveyAppKey, KinveyBaseUrl) {
        return $resource(KinveyBaseUrl + "/user/" + KinveyAppKey + "/:verb", {}, {
            logIn: {method: "POST", params: {verb: "login"}},
            logOut: {method: "POST", params: {verb: "_logout"}},
            signUp: {method: "POST", params: {verb: ""}}
        });
    }]);

angular.module("Application.Services", [])

    .run(["AuthorizationHeaderService", function(AuthorizationHeaderService) {
        AuthorizationHeaderService.initialise();
    }])

    .factory("AuthorizationHeaderService", ["$http", "KinveyAppSecret", function($http, KinveyAppSecret) {
        var setAuthorizationHeader = function(authorizationHeader) {
            $http.defaults.headers.common.Authorization = authorizationHeader;
        }
        var setBasicAuthorizationHeader = function() {
            setAuthorizationHeader("Basic " + KinveyAppSecret);
        }
        return {
            initialise: function() {
                setBasicAuthorizationHeader();
            }
        }
    }])

    .factory("ResetPasswordService", ["$rootScope", "ResetPasswordResource", function($rootScope, ResetPasswordResource) {
        return {
            resetPassword: function(username) {
                console.log("ResetPasswordService resetPassword");
                var resetPasswordResource = ResetPasswordResource.resetPassword({}, {username: username}, function() {
                    console.log("ResetPasswordService resetPassword success");
                    $rootScope.$emit("ResetPasswordService.resetPasswordSuccess", {alertMessage: "An email has been sent to " + username + "!"});
                }, function(data) {
                    console.log("ResetPasswordService resetPassword error");
                    $rootScope.$emit("ResetPasswordService.resetPasswordError", {alertMessage: data.data.description});
                });
            }
        }
    }])

    .factory("UserService", ["$rootScope", "UserResource", function($rootScope, UserResource) {
        return {
            logIn: function(password, username) {
                console.log("UserService logIn");
                var userResource = UserResource.logIn({}, {password: password, username: username}, function() {
                    console.log("UserService logIn success");
                    $rootScope.$emit("UserService.logInSuccess", {alertMessage: "Welcome back to Topoi!", authorization: userResource._kmd.authtoken});
                }, function(data) {
                    console.log("UserService logIn error");
                    $rootScope.$emit("UserService.logInError", {alertMessage: (data.status === 401) ? "Please choose a different username and/or password" : data.data.description});
                });
            },
            logOut: function() {
                console.log("UserService logOut");
                var userResource = UserResource.logOut({}, {}, function() {
                    console.log("UserService logOut success");
                    $rootScope.$emit("UserService.logOutSuccess", {alertMessage: "Thanks for visiting Topoi!"});
                }, function(data) {
                    console.log("UserService logOut error");
                    $rootScope.$emit("UserService.logOutError", {alertMessage: data.data.description});
                });
            },
            signUp: function(email, password, username) {
                console.log("UserService signUp");
                var userResource = UserResource.signUp({}, {email: email, password: password, username: username}, function() {
                    console.log("UserService signUp success");
                    $rootScope.$emit("UserService.signUpSuccess", {alertMessage: "Welcome to Topoi!", authorization: userResource._kmd.authtoken});
                }, function(data) {
                    console.log("UserService signUp error");
                    $rootScope.$emit("UserService.signUpError", {alertMessage: (data.status === 409) ? "Please choose a different username" : data.data.description});
                });
            }
        }
    }]);