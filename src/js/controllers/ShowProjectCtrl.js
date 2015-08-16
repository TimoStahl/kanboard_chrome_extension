angular.module('KanboardCtrl')
.controller('ShowProjectController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    $scope.project_id = $routeParams.projectId;
    $scope.selectedIndex = 0;
    var numberOfColumns;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var project;
    var board;
    $scope.tasks = [];

    dataFactory.getProjectById(api_id, $routeParams.projectId)
      .success(function(request) {
        project = request.result;
        $scope.project_name = project.name;
        if($routeParams.columnId > 0){
            $scope.selectedIndex = $routeParams.columnId;
        }
      })
      .error(function(error) {
        console.log(error);
      });

    dataFactory.getBoard(api_id, $routeParams.projectId)
      .success(function(request) {
        $scope.board = request.result;
        board = request.result;
        $scope.columns = board[0].columns;
        numberOfColumns = board[0].columns.length;
      })
      .error(function(error) {
        console.log(error);
      });

    $scope.nextColumn = function() {
      if ((numberOfColumns - 1) > $scope.selectedIndex) {
        $scope.selectedIndex++;
      }
    }

    $scope.previousColumn = function() {
      if ($scope.selectedIndex > 0) {
        $scope.selectedIndex--;
      }
    }
    
    $scope.$watch('selectedIndex', function(current, old) {
        if(current != old){
            navigation.board($routeParams.api_id,$routeParams.projectId,current);
        }
    });

  });