

    //var app = angular.module('sampleapp', ['angularUtils.directives.dirPagination', 'myDirectivesApplication'])





    /*app.controller('indicatorController', function ($scope, $rootScope, $filter, $http) {
     lastDay = $filter('date')(lastDay, 'yyyy-MM-dd');
     lastWeek = $filter('date')(lastWeek, 'yyyy-MM-dd');
     lastMonth = $filter('date')(lastMonth, 'yyyy-MM-dd');
     $scope.category = 1;

     $scope.sort = function (keyname) {
     $scope.sortKey = keyname;   //set the sortKey to the param passed
     $scope.reverse = !$scope.reverse; //if true make it false and vice versa
     };


     var IndicatorUrl = "../../indicators.json?paging=false";

     $http.get(IndicatorUrl).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Indicators = response.data.indicators;
     //console.log(OrgUnits.name);
     });

     var INgroupUrl = "../../indicatorGroups.json?paging=false";

     $http.get(INgroupUrl).then(function (response) {
     if (!response.data == "")
     $scope.INgroups = response.data.indicatorGroups;
     });

     $scope.loadAccordingToGroup = function (group) {
     console.log("fdfd");
     var URL = "../../indicatorGroups/" + group.id + ".json?filter=" + category + ":ge:" + date + "&paging=false";
     console.log(URL);
     $http.get(URL).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Indicators = response.data.indicators;
     //console.log(OrgUnits.name);
     });
     };

     $http.get(apiUrl).then(function (response) {
     if (!response.data == "")
     $rootScope.setting = JSON.parse(response.data.value);
     console.log(response.data);

     });

     $scope.filter = [{
     id: '1',
     name: 'Last Day'
     }, {
     id: '2',
     name: 'Last Week'
     }, {
     id: '3',
     name: 'Last Month'
     }];


     $scope.setCategory = function () {
     var val = $scope.category;

     if (val == "1") {
     category = "created";
     $scope.setFilter();
     }
     else {
     category = "lastUpdated";
     $scope.setFilter();
     }
     };


     $scope.getdate = function (filter) {
     console.log("dsfsfsfsfs");
     if (filter.id == 1) {
     console.log(lastDay);
     date = lastDay;
     $scope.setFilter();
     }
     if (filter.id == 2) {
     date = lastWeek;
     $scope.setFilter();
     }
     if (filter.id == 3) {
     console.log(lastMonth);
     date = lastMonth;
     $scope.setFilter();
     }
     };
     $scope.setFilter = function () {
     var filIndicatorUrl = "../../indicators.json?filter=" + category + ":ge:" + date + "&paging=false";
     console.log(filIndicatorUrl);
     $http.get(filIndicatorUrl).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Indicators = response.data.indicators;
     //console.log(OrgUnits.name);
     });
     }
     });*/

    /*app.controller('validationRuleController', function ($scope, $rootScope, $filter, $http) {
     lastDay = $filter('date')(lastDay, 'yyyy-MM-dd');
     lastWeek = $filter('date')(lastWeek, 'yyyy-MM-dd');
     lastMonth = $filter('date')(lastMonth, 'yyyy-MM-dd');
     $scope.category = 1;


     var ValidationUrl = "../../validationRules.json?paging=false";

     $http.get(ValidationUrl).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Validations = response.data.validationRules;
     //console.log(OrgUnits.name);
     });

     var VRgroupUrl = "../../validationRuleGroups.json?paging=false";

     $http.get(VRgroupUrl).then(function (response) {
     if (!response.data == "")
     $rootScope.VRgroups = response.data.validationRuleGroups;
     });

     $scope.loadAccordingToGroup = function (group) {
     console.log("fdfd");
     var URL = "../../validationRuleGroups/" + group.id + ".json?filter=" + category + ":ge:" + date + "&paging=false";
     $http.get(URL).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Validations = response.data.validationRules;
     //console.log(OrgUnits.name);
     });
     };

     $http.get(apiUrl).then(function (response) {
     if (!response.data == "")
     $rootScope.setting = JSON.parse(response.data.value);
     console.log(response.data);

     });

     $scope.filter = [{
     id: '1',
     name: 'Last Day'
     }, {
     id: '2',
     name: 'Last Week'
     }, {
     id: '3',
     name: 'Last Month'
     }];


     $scope.setCategory = function () {
     var val = $scope.category;

     if (val == "1") {
     category = "created";
     $scope.setFilter();
     }
     else {
     category = "lastUpdated";
     $scope.setFilter();
     }
     };


     $scope.getdate = function (filter) {
     if (filter.id == 1) {
     console.log(lastDay);
     date = lastDay;
     $scope.setFilter();
     }
     if (filter.id == 2) {
     date = lastWeek;
     $scope.setFilter();
     }
     if (filter.id == 3) {
     console.log(lastMonth);
     date = lastMonth;
     $scope.setFilter();
     }
     };
     $scope.setFilter = function () {
     var filValidationUrl = "../../validationRules.json?filter=" + category + ":ge:" + date + "&paging=false";
     console.log(filValidationUrl);
     $http.get(filValidationUrl).then(function (response) {
     if (!response.data == "")
     console.log(response.data);
     $scope.Validations = response.data.validationRules;
     //console.log(OrgUnits.name);
     });
     }
     });*/
