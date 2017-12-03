angular.module("ProjectManagerApp")
   .controller("ListCtrl", ["$scope", "$http", function($scope, $http) {
    

        function refresh(){
            $http
                .get("/api/v1/projects")
                .then(function(response) {
                    $scope.projects = response.data;
                   
                });
          
        }
    
    $scope.searchProjects = function(){
            $http({
                url: "/api/v1/projects",
                params: $scope.tosearch
            })
                .then(function(response) {
                    $scope.projects = response.data;
                    
                    if(String(response.status) == '200' && response.data.length == 0){
                    
                            $scope.error = "No projects found";
                        
            }

                });
            
        }

        $scope.deleteProject = function (idProject){
            
            $http
                .delete("/api/v1/projects/"+idProject)
                .then(function(response) {
                    refresh();
                });
            
        }
        

        refresh();
        
        

}]);