var app = angular.module("ProjectManagerApp");

app.controller("SearchCtrl",["$scope","$http","$window",function ($scope, $http,$window){
    
        function refresh(request){
            $http
            .get("/api/v1/projects/search"+request)
            .then(function(response){
                $scope.projects = response.data;
            });
                }
        
    $scope.deleteProject = function (idProject){
        $http
            .delete("/api/v1/projects/"+idProject)
            .then(function(response){
                $scope.searchProjects();
            });
        }
        
    $scope.updateProject = function (idProject){
        $window.location.href = "#!/projects/" +idProject;
    }
 
    $scope.searchProjects = function (){
        
        let request ="?";

        if($scope.search.researcher){
            request += "researcher=" + ($scope.search.researcher);
        }
        if($scope.search.name){
            request += "&name=" + $scope.search.name;
        }
        if($scope.search.type){
            request += "&type=" + $scope.search.type;
        }
        if($scope.search.startDate){
            request += "&startDate=" + $scope.search.startDate;
        }
        if($scope.search.endDate){
            request += "&endDate=" + $scope.search.endDate;
        }
        if($scope.search.researchers){
            request += "&researchers=" + $scope.search.researchers;
        }
        
        
        
/*        $http
            .get("/api/v1/departments/search"+request)
            .then(function(response){
                $scope.departments = response.data;
            });*/
            
         refresh(request);
    }
        

}]);