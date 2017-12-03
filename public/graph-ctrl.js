angular.module("ProjectManagerApp")
   .controller("GraphCtrl", ["$scope", "$http", function($scope, $http) {
    

        function refresh(){
            $http
                .get("/api/v1/projects")
                .then(function(response) {
                    $scope.projects = response.data;
                    var researchersProjects = [];
                    var arrayProjectsName = [];
                     for(var i in $scope.projects) {
                    
                        var researchersSize = $scope.projects[i].researchers.length;
                        var researchersSizeNumber = Number(researchersSize);
                        researchersProjects.push(researchersSizeNumber);
                        
                        var projectsName = $scope.projects[i].name;
                        arrayProjectsName.push(projectsName);
                       
                }
                    Highcharts.chart('container', {
                        chart: {
                            type: 'area',
                            spacingBottom: 30
                        },
                        title: {
                            text: 'Researchers By Projects'
                        },
                    
                        legend: {
                            layout: 'vertical',
                            align: 'left',
                            verticalAlign: 'top',
                            x: 150,
                            y: 100,
                            floating: true,
                            borderWidth: 1,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                        },
                        xAxis: {
                            categories: arrayProjectsName
                        },
                        yAxis: {
                            title: {
                                text: 'Number of Researchers'
                            },
                            labels: {
                                formatter: function () {
                                    return this.value;
                                }
                            }
                        },
                        tooltip: {
                            formatter: function () {
                                return '<b>' + this.series.name + '</b><br/>' +
                                    this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            area: {
                                fillOpacity: 0.5
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            name: 'Researchers',
                            data: researchersProjects
                        }]
                    });
                });
          
        }
    
     

        refresh();
        
        

}]);