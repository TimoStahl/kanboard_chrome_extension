angular.module('KanboardCtrl')
.controller('ShowOverdueController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    var project_id = $routeParams.projectId;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var overdue;

    $scope.tasks = [];

    dataFactory.getOverdueTasks(api_id).then(
      function(request) {
        overdue = request.data.result;
        for (var i = 0; i < overdue.length; i++) {
          if (overdue[i].project_id == project_id) {
            $scope.tasks.push(overdue[i]);
          }
        }
      },
      function(error) {
        console.log(error);
      });

    dataFactory.getProjectById(api_id, project_id).then(
      function(request) {
        $scope.project = request.data.result;
      },
      function(error) {
        console.log(error);
      });

  });
