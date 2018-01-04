
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
            }).when("/groups",{
                templateUrl: "groups.html",
                controller : "GroupsCtrl"
            }).when("/graph",{
                templateUrl: "graph.html",
                controller : "GraphCtrl"
            }).when("/graph_tweets",{
                templateUrl: "graph_tweets.html",
                controller : "GraphTweetsCtrl"
            });
        
        console.log("App Initialized");            
        
    });
