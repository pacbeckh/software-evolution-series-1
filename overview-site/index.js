angular
  .module('OverviewSite', [])
  .controller('IndexCtrl', function ($scope, $http) {
    $scope.targetFile = 'file:///Users/matstijl/development/repositories/github/stil4m/software-evolution-series-1/maintenance/export.json';
    $scope.analysis = null;
    $http.get('./data.json').success(function (d) {
      $scope.analysis = d;
    });
    $scope.lookupFile = function (data) {
      if (data == null) {
        $scope.error = "No target file";
      }

      reader.readAsArrayBuffer(data);

    }
  })
  .controller('OverviewCtrl', function ($scope) {
    $scope.tabs = [
      {id: 'overview', name: 'Overview', template: 'templates/overview.html'},
      {id: 'classes', name: 'Files', template: 'templates/classes.html'},
      {id: 'duplication', name: 'Duplication', template: 'templates/duplication.html'},
      {id: 'raw', name: 'Raw', template: 'templates/raw.html'}
    ];
    $scope.activeTab = $scope.tabs[0];

    $scope.clickTab = function (tab) {
      $scope.activeTab = tab;
    };

    $scope.linesOfNonTestCode = function (analysis) {
      return analysis.profile.volume.size - analysis.profile.unit_testing.unit_test_volume.test_volume;
    }
  })
  .directive('linesPercentage', function () {
    return {
      scope: {
        src: '=',
        total: '='
      },
      template: "<span>{{src || 0 }} Lines ({{(src||0)/total * 100 | number:2 }}%)</span>"
    }
  })
  .controller('ProfileCtrl', function ($scope) {
    var self = this;
    self.columns = [
      {id: 'volume', name: 'Volume'},
      {id: 'complexity_per_unit', name: 'Complexity per Unit'},
      {id: 'duplication', name: 'Duplication'},
      {id: 'unit_size', name: 'Unit Size'},
      {id: 'unit_testing', name: 'Unit Testing'}
    ];

    self.rows = [
      {name: 'Analysability', columns: ['volume', 'duplication', 'unit_size', 'unit_testing']},
      {name: 'Changability', columns: ['complexity_per_unit', 'duplication']},
      {name: 'Stability', columns: ['unit_testing']},
      {name: 'Testability', columns: ['complexity_per_unit', 'unit_size', 'unit_testing']}
    ];

    function findMedian(m) {
        var middle = Math.floor((m.length - 1) / 2);
        if (m.length % 2 == 1) {
            return m[middle];
        } else {
            return Math.round((m[middle] + m[middle + 1]) / 2.0);
        }
    }

    self.getAverage = function (row) {
      var results = row.columns.map(function (id) {
        if ($scope.analysis.profile[id]) {
          return $scope.analysis.profile[id].rating;
        }
      }).filter(function (i) {
        return i != null;
      });

      return findMedian(results);
    }
  })
  .controller('DuplicationCtrl', function ($scope) {
    function splitInBlocks(numbers) {
      var result = [];
      var target = [];
      var last = undefined;

      numbers.forEach(function (n) {
        if (last == null) {
          target.push(n);
        } else if (last + 1 == n) {
          target.push(n);
        } else {
          result.push(target);
          target = [n];
        }
        last = n;
      });
      result.push(target);
      return result;
    }

    this.getDuplicatedBlocks = function (file) {
      var target = $scope.analysis.project.files.filter(function (f) {
        return f.location == file.path;
      })[0];

      var blocks = splitInBlocks(file.lines);
      return blocks.map(function (block) {
        return block.map(function (line) {
          return target.lines[line];
        });
      });
    }
  })
  .filter('asCodeBlock', function () {
    return function (lines) {
      return lines.map(function (i) {
        return i.number + ":\t" + i.content;
      }).join('\n')
    }
  })
  .filter('fileName', function() {
    return function(file) {
      return file.substr(file.lastIndexOf("/") + 1);
    }
  })
  .filter('risk', function () {
    return function (i) {
      switch (i) {
        case 5:
          return '++';
        case 4:
          return '+';
        case 3:
          return 'o';
        case 2:
          return '-';
        case 1:
          return '--';
      }
    };
  });

