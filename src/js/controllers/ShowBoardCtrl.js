angular.module('KanboardCtrl')
.controller('ShowBoardController', function($routeParams, $scope, navigation, dataFactory) {
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
        $scope.project = project;
        console.log("Before " + $scope.selectedIndex);
        if($routeParams.columnId > 0){
            $scope.selectedIndex = $routeParams.columnId;
            console.log("In " + $scope.selectedIndex);
        }
      })
      .error(function(error) {
        console.log(error);
      });

    dataFactory.getBoard(api_id, $routeParams.projectId)
      .success(function(request) {
        $scope.board = request.result;
        board = request.result;
        numberOfColumns = board[0].columns.length;
        $scope.columns = new Array();
        
        //loop columns and put into scope
        for(var icol = 0; icol < board[0].columns.length; icol++){
          
          var column = new Object;
          column.title = board[0].columns[icol].title;
          column.swimlanes = new Array();
          
          //loop at swimlanes
          for(var iswim = 0; iswim < board.length; iswim++){
            
            var swimlane = new Object;
            swimlane.name = board[iswim].name;
            swimlane.tasks = new Array();
            
            //loop at tasks
            for(var itask = 0; itask < board[iswim].columns[icol].tasks.length; itask++){
                  swimlane.tasks.push(board[iswim].columns[icol].tasks[itask]);
            }
            
            column.swimlanes.push(swimlane);
          }
          $scope.columns.push(column);
        }
        
        //console.log($scope.columns);
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
           navigation.board($routeParams.api_id,$routeParams.projectId,current,false);
        }
    });

  });