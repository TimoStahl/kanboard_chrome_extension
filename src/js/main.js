angular.module('project', ['ngRoute', 'ngMaterial', 'ngMdIcons', 'base64', 'pascalprecht.translate'])

.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
])
.config(function($translateProvider) {
   
    $translateProvider.registerAvailableLanguageKeys(['en','de'], {
        'en_US': 'en',
        'en_UK': 'en',
        'de_DE': 'de',
        'de_CH': 'de',
        'de_AT': 'de'
    })
    .determinePreferredLanguage()
    .fallbackLanguage('en')
    .useStaticFilesLoader({
        prefix: 'translation/',
        suffix: '.json'
    });
})
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'ProjectListController as projectList',
      templateUrl: 'view/project_list.html'
    })
    .when('/settings', {
      controller: 'SettingsController as settings',
      templateUrl: 'view/settings.html'
    })
    .when('/settings/endpoint', {
      controller: 'SettingsEndpointController as settings',
      templateUrl: 'view/settings_endpoint.html'
    })
    .when('/settings/endpoint/:api_id', {
      controller: 'SettingsEndpointController as settings',
      templateUrl: 'view/settings_endpoint.html'
    })
    .when('/:api_id/board/show/:projectId', {
      controller: 'ShowProjectController as showProject',
      templateUrl: 'view/board_show.html'
    })
    .when('/:api_id/task/show/:taskId', {
      controller: 'ShowTaskController as showTask',
      templateUrl: 'view/task_details.html'
    })
    .when('/:api_id/board/overdue/:projectId', {
      controller: 'ShowOverdueController as overdueBoard',
      templateUrl: 'view/board_overdue.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})

.factory('navigation', ['$location', '$rootScope', function($location, $rootScope) {
  return {
    home: function() {
      $location.path('/');
      $location.replace();
      console.log("navi home");
      return;
    },
    settings: function() {
      $location.path('/settings');
      $location.replace();
      console.log("navi settings");
      return;
    },
    settings_endpoint: function(api_id) {
      if (api_id >= 0) {
        $location.path('/settings/endpoint/' + api_id);
      }
      else {
        $location.path('/settings/endpoint');
      }
      $location.replace();
      console.log("navi settings endpoint");
      return;
    },
    task: function(api_id, task_id) {
      $location.path('/' + api_id + '/task/show/' + task_id);
      $location.replace();
      console.log("navi task");
      return;
    }
  }
}])

.factory('dataFactory', ['$base64', '$http', function($base64, $http) {

  var dataFactory = {};

  dataFactory.getEndpoints = function() {
    var items = localStorage.getItem("endpoints");

    if (items === null) {
      items = [{
        "i": "0",
        "name": "Kanboard.net Demopage",
        "token": "da2776e2c7ca07b2b1169099550aa4a197024f2f7aac21212682240acc3f",
        "url": "http://demo.kanboard.net/jsonrpc.php"
      }];
    }
    else {
      items = JSON.parse(items);
      for (var i = 0; i < items.length; i++) {
        items[i].id = i;
      }
    }

    return items;
  };

  dataFactory.setEndpoints = function(endpoints) {
    return localStorage.setItem("endpoints", JSON.stringify(endpoints));
  };

  dataFactory.getBaseUrl = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    return api_config.url;
  };

  dataFactory.createConfig = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    var auth = $base64.encode('jsonrpc' + ':' + api_config.token);
    var config = {
      headers: {
        'Authorization': 'Basic ' + auth
      }
    };
    return config;
  };

  dataFactory.getProjects = function(api_id) {
    var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": ' + api_id + '}';
    return $http.post(this.getBaseUrl(api_id) + '?getAllProjects', request, this.createConfig(api_id));
  };

  dataFactory.getBoard = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getBoard", "id": ' + api_id + ',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getBoard', request, this.createConfig(api_id));
  };

  dataFactory.getProjectById = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectById", "id": ' + api_id + ',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectById', request, this.createConfig(api_id));
  };

  dataFactory.getProjectActivity = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectActivity", "id": ' + api_id + ',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectActivity', request, this.createConfig(api_id));
  };

  dataFactory.getTaskById = function(api_id, taskid) {
    var request = '{"jsonrpc": "2.0", "method": "getTask", "id": ' + api_id + ',"params": { "task_id": ' + taskid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getTask', request, this.createConfig(api_id));
  };

  dataFactory.getOverdueTasks = function(api_id) {
    var request = '{"jsonrpc": "2.0", "method": "getOverdueTasks", "id": ' + api_id + '}';
    return $http.post(this.getBaseUrl(api_id) + '?getOverdueTasks', request, this.createConfig(api_id));
  };


  return dataFactory;
}])

.controller('ProjectListController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  var projectList = this;

  $scope.endpoints = dataFactory.getEndpoints();

  for (var i = 0; i < $scope.endpoints.length; i++) {
    $scope.endpoints[i].id = i;
    var id = i + 1;
    var result;
    dataFactory.getProjects(id)
      .success(function(request) {
        result = request.result;
        $scope.endpoints[request.id - 1].projects = result;
      })
      .error(function(error) {
        console.log(error);
      });
  }
})

.controller('ShowProjectController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    $scope.project_id = $routeParams.projectId;
    $scope.selectedIndex = 1;
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
      if (numberOfColumns > $scope.selectedIndex) {
        $scope.selectedIndex++;
      }
    }

    $scope.previousColumn = function() {
      if ($scope.selectedIndex > 1) {
        $scope.selectedIndex--;
      }
    }

  })
  .controller('ShowOverdueController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
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
        var project = request.result;
        $scope.project_name = project.name;
      })
      .error(function(error) {
        console.log(error);
      });

  })
  .controller('ShowTaskController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var id = $routeParams.taskId;
    $scope.task;

    dataFactory.getTaskById(api_id, id)
      .success(function(request) {
        $scope.task = request.result;
      })
      .error(function(error) {
        console.log(error);
      });

  })
  .controller('SettingsController', function($location, $routeParams, $route, $scope, navigation, dataFactory, $mdDialog, $mdToast) {
    $scope.$navigation = navigation;

    var items = dataFactory.getEndpoints();
    $scope.endpoints = items;

    $scope.showDeleteConfirm = function(ev, endpoint) {
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Would you like to delete your endpoint?')
        .content('Name: ' + endpoint.name)
        .ariaLabel('Delete')
        .ok('Yes')
        .cancel('No')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {

        //delete from storage
        var items_new = new Array();
        for (var i = 0; i < items.length; i++) {
          if (i == endpoint.id) {
            //nothing
          }
          else {
            items_new.push(items[i]);
          }
        }
        dataFactory.setEndpoints(items_new);

        //refresh list
        $scope.endpoints = dataFactory.getEndpoints();

        $mdToast.show(
          $mdToast.simple()
          .content('Deleted!')
          .hideDelay(3000)
        );
      }, function() {
        //$scope.alert = 'Nothing changed.';
      });
    };

  })
  .controller('SettingsEndpointController', function($location, $routeParams, $route, $scope, navigation, dataFactory, $mdDialog, $mdToast) {
    $scope.$navigation = navigation;
    var items;

    if ($routeParams.api_id >= 0) {
      var api_id = parseInt($routeParams.api_id);
      items = dataFactory.getEndpoints();
      $scope.endpoint = items[api_id];
      $scope.edit = true;
    } else {
      $scope.edit = false;
    }

    

    $scope.save = function() {
      if ($scope.endpoint.id >= 0) {
        items = dataFactory.getEndpoints();
        items[$scope.endpoint.id] = $scope.endpoint;
        dataFactory.setEndpoints(items);
      }
      else {
        items = dataFactory.getEndpoints();
        items.push($scope.endpoint);
        dataFactory.setEndpoints(items);
      }
      navigation.settings();
    };

  });