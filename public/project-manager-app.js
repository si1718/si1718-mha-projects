
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
            }).when("/search",{
                templateUrl: "search.html",
                controller: "SearchCtrl"
            });
        
        console.log("App Initialized");            
        
    });
