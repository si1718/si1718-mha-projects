
angular.module("ProjectManagerApp", ["ngRoute"])
    .config(function ($routeProvider){
        
        $routeProvider
            .when("/",{
                templateUrl: "list.html",
                controller : "ListCtrl"
            }).when("/project/:idProject",{
                templateUrl: "edit.html",
                controller : "EditCtrl"
            }).when("/create",{
                templateUrl: "create.html",
                controller : "CreateCtrl"
            });
        
        console.log("App Initialized");            
        
    });
