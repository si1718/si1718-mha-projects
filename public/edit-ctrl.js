angular.module("ProjectManagerApp")
    .controller("EditCtrl", ["$scope", "$http", "$routeParams", "$location",
        function($scope, $http, $routeParams, $location) {
            $scope.projectId = $routeParams.idProject;
            console.log("EditCtrl initialized for project "+$scope.projectId);
            $http
                .get("/api/v1/projects/"+$scope.projectId)
                .then(function(response) {
                    $scope.updatedProject = response.data;
                });
            
            $scope.updateProject = function (){
              
              delete $scope.updatedProject._id;
              
                if($scope.updatedProject.researchers.length > 0) {
                    $scope.updatedProject.researchers = $scope.updatedProject.researchers.split("\n");
                }
              $http
                .put("/api/v1/projects/"+$scope.projectId,$scope.updatedProject)
                .then(function(response) {
                    console.log("updated");
                    $location.path("/");
                });
            
            }
        
        }]);