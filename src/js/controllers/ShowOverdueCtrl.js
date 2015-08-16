angular.module('KanboardCtrl')
.controller('ShowOverdueController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    var project_id = $routeParams.projectId;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var overdue;

    $scope.tasks = [];

    dataFactory.getOverdueTasks(api_id)
      .success(function(request) {
        overdue = request.result;
        for (var i = 0; i < overdue.length; i++) {
          if (overdue[i].project_id == project_id) {
            $scope.tasks.push(overdue[i]);
          }
        }
      })
      .error(function(error) {
        console.log(error);
      });

    dataFactory.getProjectById(api_id, project_id)
      .success(function(request) {
        $scope.project = request.result;
      })
      .error(function(error) {
        console.log(error);
      });

  });