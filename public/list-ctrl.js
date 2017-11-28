angular.module("ProjectManagerApp")
   .controller("ListCtrl", ["$scope", "$http", function($scope, $http) {
    

        function refresh(){
            $http
                .get("/api/v1/projects")
                .then(function(response) {
                    $scope.projects = response.data;
                });
            
            // $scope.newProject={
            //     idProject : "AAAAA",
            //     researcher : "PEPE",
            //     name : "i+d",
            //     type : "123456",
            //     startDate : "17/08/2017",
            //     endDate : "17/08/2018"
            // }
        }
    

        $scope.deleteProject = function (idProject){
            
            $http
                .delete("/api/v1/projects/"+idProject)
                .then(function(response) {
                    refresh();
                });
            
        }
        
        // $scope.searchProjects = function(){
        //     $http({
        //         url: "/api/v1/projects",
        //         params: $scope.tosearch
        //     })
        //         .then(function(response) {
        //             $scope.projects = response.data;
        //         });
            
        // }
        

        refresh();
        
        

}]);