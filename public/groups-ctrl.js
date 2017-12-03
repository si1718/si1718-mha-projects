angular.module("ProjectManagerApp")
   .controller("GroupsCtrl", ["$scope", "$http", function($scope, $http) {
    

        function refresh(){
           $http
                .get("https://si1718-rgg-groups.herokuapp.com/api/v1/groups")
                .then(function(response) {
                    $scope.groups = response.data;
                //      if($scope.researchers.length>0){
                //     $scope.researcher = $scope.researchers[0]; 
                //     $scope.researcherName =  $scope.researchers[0].name;
                // }
                    
            });
    
        }
        

        refresh();
        
        

}]);