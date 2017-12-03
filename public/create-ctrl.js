angular.module("ProjectManagerApp")
    .controller("CreateCtrl", ["$scope", "$http", "$routeParams", "$location",
        function($scope, $http, $routeParams, $location) {
           
           function clearProject(){
          
            $scope.newProject={
            }
        }
           function backToListProjects(){
          
            $location.path("/");
        }
           
            
            $scope.createProject = function (){
              
            
             $http
                .post("/api/v1/projects",$scope.newProject)
                .then(function(response) {
                    backToListProjects();
                }, function(error){
                    console.log(error.status);
                    
                    if(String(error.status) != '200'){
                        switch (String(error.status)) {
                            case '422':
                                $scope.error = "Please review the information entered in the fields";
                                break;
                            case '409':
                                $scope.error = "There is another patent with same name and date";
                                break;
                            default:
                                $scope.error = "Error, please contact administrator";
                        }
                    
                    } 
                });
            
            }
            clearProject();
        
        }]);