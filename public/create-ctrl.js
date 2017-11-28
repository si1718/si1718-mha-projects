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
              
            if($scope.newProject.researchers.length > 0) {
                    $scope.newProject.researchers = $scope.newProject.researchers.split(",");
                }
             $http
                .post("/api/v1/projects",$scope.newProject)
                .then(function(response) {
                    backToListProjects();
                }, function(error){
                    console.log(error.status);
                    
                    if(error.status == '422'){
                        $scope.error = "Please review the information entered in the fields";
                    }
                    if(error.status == '409'){
                        $scope.error = "There is another project with same name and date";
                    }
                    //alert(error.data);
                });
            
            }
            clearProject();
        
        }]);