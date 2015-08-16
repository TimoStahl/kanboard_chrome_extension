angular.module('Kanboard')

.config(function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|chrome-extension):/);
})

.config(function($translateProvider) {

  $translateProvider.registerAvailableLanguageKeys(['en', 'de'], {
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
      .when('/projectlist', {
        controller: 'ProjectListController',
        templateUrl: 'view/project_list.html'
      })
      .when('/settings', {
        controller: 'SettingsController',
        templateUrl: 'view/settings.html'
      })
      .when('/settings/endpoint', {
        controller: 'SettingsEndpointController',
        templateUrl: 'view/settings_endpoint.html'
      })
      .when('/settings/endpoint/:api_id', {
        controller: 'SettingsEndpointController',
        templateUrl: 'view/settings_endpoint.html'
      })
      .when('/:api_id/board/show/:projectId', {
        controller: 'ShowBoardController',
        templateUrl: 'view/board_show.html'
      })
      .when('/:api_id/board/show/:projectId/:columnId', {
        controller: 'ShowBoardController',
        templateUrl: 'view/board_show.html'
      })
      .when('/:api_id/task/show/:taskId', {
        controller: 'ShowTaskController',
        templateUrl: 'view/task_details.html'
      })
      .when('/:api_id/board/overdue/:projectId', {
        controller: 'ShowOverdueController',
        templateUrl: 'view/board_overdue.html'
      })
      .when('/:api_id/board/activity/:projectId', {
        controller: 'ShowActivityController',
        templateUrl: 'view/board_activity.html'
      })
      .otherwise({
        redirectTo: '/projectlist'
      });
  })
  .run(function($rootScope, $location, $route, dataFactory, navigation) {
    $rootScope.$watch(function() {
        return $location.path();
      },
      function(a) {
        // url changed
        var settings = dataFactory.getSettings();
        if (a != '/lasturl') {
            settings.lastVisitedUrl = settings.currentUrl;
            settings.currentUrl = a;
            dataFactory.setSettings(settings);
        } else {
            if (settings.rememberLastPage) {
                navigation.url(settings.currentUrl);
            }          
        }
      });
    //fix https://github.com/angular/angular.js/issues/1699  
    var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }

            return original.apply($location, [path]);
        };  
  })
  .factory('navigation', ['$location', 'dataFactory', function($location, dataFactory) {
    return {
      home: function() {
        console.log("Navigation: home/projectlist");
        $location.path('/projectlist').replace();        
        return;
      },
      settings: function() {
        console.log("Navigation: settings");
        $location.path('/settings').replace();
        return;
      },
      settings_endpoint: function(api_id) {
        console.log("Navigation: settings_endpoint");
        if (api_id >= 0) {
          $location.path('/settings/endpoint/' + api_id);
        }
        else {
          $location.path('/settings/endpoint');
        }
        $location.replace();        
        return;
      },
      task: function(api_id, task_id) {
        console.log("Navigation: task");
        $location.path('/' + api_id + '/task/show/' + task_id).replace();       
        return;
      },
      board: function(api_id, board_id, column_id, reload) {
        console.log("Navigation: board");
        if(!column_id){
            column_id = 0;
        }
        $location.path('/' + api_id + '/board/show/' + board_id + '/' + column_id, reload).replace();        
        return;
      },
      url: function(url) {
        console.log("Navigation: url => " + url);
        $location.path(url).replace();        
        return;
      },
      extern_url: function(url) {        
        console.log("Navigation: url => " + url);
        window.open(url,"_blank")
        return;
      },
      back: function(){
          var settings = dataFactory.getSettings();       
          this.url(settings.lastVisitedUrl);
          //window.history.back();
      },
      board_activity: function(api_id, board_id) {
        console.log("Navigation: board activity");
        $location.path('/' + api_id + '/board/activity/' + board_id).replace();
        return;
      },
      board_overdue: function(api_id, board_id) {
        console.log("Navigation: board overdue");
        $location.path('/' + api_id + '/board/overdue/' + board_id).replace();        
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

  dataFactory.getSettings = function() {
    var settings = {};
    settings = localStorage.getItem("settings");
    settings = JSON.parse(settings);
    return settings;
  };

  dataFactory.setSettings = function(settings) {
    return localStorage.setItem("settings", JSON.stringify(settings));
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
  
  dataFactory.getProjectActivity = function(api_id, project_id) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectActivity", "id": ' + api_id + ',"params": { "project_id": ' + project_id + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectActivity', request, this.createConfig(api_id));
  };

  return dataFactory;
}]);