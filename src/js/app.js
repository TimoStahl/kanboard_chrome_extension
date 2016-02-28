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
    .useSanitizeValueStrategy('escape')
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

    //check if settings are availiable
    var settings = dataFactory.getSettings();
    if (settings === null) {
      //create settings in local storage
      settings = new Object();
    }
    if (!("rememberLastPage" in settings)) {
      //rememberLastPage missing
      settings.rememberLastPage = false;
    }
    dataFactory.setSettings(settings);

    $rootScope.$watch(function() {
        return $location.path();
      },
      function(a) {
        // url changed
        if (a === '/lasturl' && settings.rememberLastPage) {
          navigation.back();
        }
      });

    //fix https://github.com/angular/angular.js/issues/1699  
    var original = $location.path;
    $location.path = function(path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function() {
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
        this.go_with_history('/projectlist');
        return;
      },
      settings: function() {
        console.log("Navigation: settings");
        this.go_with_history('/settings');
        return;
      },
      settings_endpoint: function(api_id) {
        console.log("Navigation: settings_endpoint");
        if (api_id >= 0) {
          this.go_with_history('/settings/endpoint/' + api_id);
        }
        else {
          this.go_with_history('/settings/endpoint');
        }
        return;
      },
      task: function(api_id, task_id) {
        console.log("Navigation: task");
        this.go_with_history('/' + api_id + '/task/show/' + task_id);
        return;
      },
      board: function(api_id, board_id, column_id, reload) {
        console.log("Navigation: board");
        if (!column_id) {
          column_id = 0;
        }
        this.go_with_history('/' + api_id + '/board/show/' + board_id + '/' + column_id, reload);
        return;
      },
      url: function(url) {
        console.log("Navigation: url => " + url);
        this.go_with_history(url);
        return;
      },
      extern_url: function(url) {
        console.log("Navigation: url => " + url);
        window.open(url, "_blank");
        return;
      },
      back: function() {
        var history = dataFactory.getHistory();
        var url = $location.path();
        while (url === $location.path()) {
          url = history.pop();
        }
        dataFactory.setHistory(history);
        $location.path(url).replace();
        return;
      },
      board_activity: function(api_id, board_id) {
        console.log("Navigation: board activity");
        this.go_with_history('/' + api_id + '/board/activity/' + board_id);
        return;
      },
      board_overdue: function(api_id, board_id) {
        console.log("Navigation: board overdue");
        this.go_with_history('/' + api_id + '/board/overdue/' + board_id);
        return;
      },
      go_with_history: function(url, reload) {
        var history = dataFactory.getHistory();
        history.push(url);
        dataFactory.setHistory(history);
        $location.path(url, reload).replace();
        return;
      }
    }
  }])

.factory('dataFactory', ['$http', '$base64', function($http, $base64) {

  var dataFactory = {};
  var request;

  dataFactory.getEndpoints = function() {
    var items = localStorage.getItem("endpoints");

    if (items === null) {
      var item = new Object();
      item.i = 0;
      item.name = "Kanboard.net Demopage";
      item.url = "http://demo.kanboard.net/jsonrpc.php";
      item.user = "jsonrpc";
      item.token = "da2776e2c7ca07b2b1169099550aa4a197024f2f7aac21212682240acc3f";
      item.auth = $base64.encode(item.user + ':' + item.token);
      items = new Array;
      items.push(item);
    }
    else {
      items = JSON.parse(items);
      for (var i = 0; i < items.length; i++) {
        items[i].id = i;
        if (items[i].user === undefined || items[i].user == "") {
          items[i].user = "jsonrpc";
        }
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

  dataFactory.getHistory = function() {
    var history = {};
    history = localStorage.getItem("history");
    if (history === null) {
      history = new Array();
    }
    else {
      history = JSON.parse(history);
    }
    if (history.length <= 1) {
      history.push("/projectlist");
    }
    return history;
  };

  dataFactory.setHistory = function(history) {
    while (history.length > 50) {
      history.shift();
    }
    return localStorage.setItem("history", JSON.stringify(history));
  };

  dataFactory.getBaseUrl = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    return api_config.url;
  };

  dataFactory.createConfig = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    var config = {
      headers: {
        'Authorization': 'Basic ' + api_config.auth
      }
    };
    return config;
  };

  dataFactory.getProjects = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    if (api_config.user == 'jsonrpc') {
      request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": ' + api_id + '}';
    }
    else {
      request = '{"jsonrpc": "2.0", "method": "getMyProjects", "id": ' + api_id + '}';
    }
    return $http.post(this.getBaseUrl(api_id) + '?getAllProjects', request, this.createConfig(api_id));
  };

  dataFactory.getBoard = function(api_id, projectid) {
    request = '{"jsonrpc": "2.0", "method": "getBoard", "id": ' + api_id + ',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getBoard', request, this.createConfig(api_id));
  };

  dataFactory.getProjectById = function(api_id, projectid) {
    request = '{"jsonrpc": "2.0", "method": "getProjectById", "id": ' + api_id + ',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectById', request, this.createConfig(api_id));
  };

  dataFactory.getTaskById = function(api_id, taskid) {
    request = '{"jsonrpc": "2.0", "method": "getTask", "id": ' + api_id + ',"params": { "task_id": ' + taskid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getTask', request, this.createConfig(api_id));
  };

  dataFactory.getOverdueTasks = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    if (api_config.user == 'jsonrpc') {
      request = '{"jsonrpc": "2.0", "method": "getOverdueTasks", "id": ' + api_id + '}';
    }
    else {
      request = '{"jsonrpc": "2.0", "method": "getMyOverdueTasks", "id": ' + api_id + '}';
    }
    return $http.post(this.getBaseUrl(api_id) + '?getOverdueTasks', request, this.createConfig(api_id));
  };

  dataFactory.getProjectActivity = function(api_id, project_id) {
    request = '{"jsonrpc": "2.0", "method": "getProjectActivity", "id": ' + api_id + ',"params": { "project_id": ' + project_id + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectActivity', request, this.createConfig(api_id));
  };

  return dataFactory;
}]);