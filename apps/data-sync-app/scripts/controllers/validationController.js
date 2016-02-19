/**
 * Created by Heshan on 1/4/2016.
 */
app.controller('validationController', function ($scope, $rootScope, $filter, $http, $q) {

    lastDay = $filter('date')(lastDay, 'yyyy-MM-dd');
    lastWeek = $filter('date')(lastWeek, 'yyyy-MM-dd');
    lastMonth = $filter('date')(lastMonth, 'yyyy-MM-dd');

//url to get validation Groups
    var validationGroups = "../../validationRuleGroups.json?fields=[id,name]&paging=false";
    var valGroup;
    var date = "";
    $http.get(apiUrl).then(function (response) {
        if (!response.data == "")
            $rootScope.setting = JSON.parse(response.data.value);

    });

    //load validation groups to combo box
    $http.get(validationGroups).then(function (response) {
        if (!response.data == "")
            $scope.VALGroup = response.data.validationRuleGroups;

    });

    var insarray = [];
    $http.get(apiUrl).then(function (response) {
        if (!response.data == "") {
            insarray = JSON.parse(response.data.value);
        }
    });


    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };
    $scope.select = {};
    $scope.valid = {};
    $scope.sel = {};


    var validationUrl = "../../validationRules.json?fields=[id,code,name,created,lastUpdated,externalAccess,description,importance,ruleType,periodType,operator,leftSide,rightSide,url]&paging=false";
    var categoryOptionComboUrl = "../../categoryOptionCombos.json?fields=[:all]&paging=false";
    var validationJson;
    var categoryOptionComboJson;

    var check = 0;
    var filData = [];

    var filDateSelected = false;
    var noDurationSelected = false;

    // var selData = [];
    $scope.json = function () {
        if (check == 0 && filDateSelected) {
            $scope.loading = true;
            var a = $http.get(validationUrl).then(function (response) {
                if (!response.data == "")

                validationJson = response.data;

            });
            var b;
            if (dataElementJson == undefined) {
                b = $http.get(DataElementUrl).then(function (response) {
                    if (!response.data == "")

                    dataElementJson = response.data;

                });
            }

            var c = $http.get(categoryOptionComboUrl).then(function (response) {
                if (!response.data == "")

                categoryOptionComboJson = response.data;

            });

            $q.all([a, b,c]).then(function (result) {
				
                check++;
                $scope.loading = false;
                if (valGroup == undefined) {
                    $scope.getJson(validationJson);
                }
                else {
                    var valJson =
                    {
                        validationRules: []
                    };
                    $http.get("../../validationRuleGroups/" + valGroup + ".json?fields=[validationRules]&paging=false").then(function (response) {
                        var valRules = response.data.validationRules;

                        for (var a = 0; a < valRules.length; a++) {
                            for (var b = 0; b < validationJson.validationRules.length; b++) {
                                if (valRules[a].id == validationJson.validationRules[b].id) {
                                    //DEString += indicatrs[a].id + ",";
                                    valJson.validationRules.push(validationJson.validationRules[b]);
                                }
                            }

                        }
                        $scope.getJson(valJson);

                    });
					
                }
            });
        }
        else {
            if (valGroup == undefined) {
                $scope.getJson(validationJson);
            }
            else {
                var valJson =
                {
                    validationRules: []
                };
                $http.get("../../validationRuleGroups/" + valGroup + ".json?fields=[validationRules]&paging=false").then(function (response) {
                    var valRules = response.data.validationRules;

                    for (var a = 0; a < valRules.length; a++) {
                        for (var b = 0; b < validationJson.validationRules.length; b++) {
                            if (valRules[a].id == validationJson.validationRules[b].id) {
                                //DEString += indicatrs[a].id + ",";
                                valJson.validationRules.push(validationJson.validationRules[b]);
                            }
                        }

                    }
                    $scope.getJson(valJson);

                });
            }
        }
    };


    var metaData;
    $scope.getJson = function (validationJson) {
        var validationIDs = "";
        metaData =
        {
            validationRules: [],
            dataElements: [],
            categoryOptionCombos:[]
        };


        if (noDurationSelected && valGroup === undefined) {

            metaData.validationRules = (validationJson.validationRules);
            $scope.validationRules = metaData.validationRules;
        }


        else {
            for (var i = 0; i < validationJson.validationRules.length; i++) {
                if (validationJson.validationRules[i].lastUpdated > date) {

                    validationIDs += validationJson.validationRules[i].id + ",";
                    metaData.validationRules.push(validationJson.validationRules[i]);
                }
            }
            $scope.validationRules = metaData.validationRules;
        }
		//
				angular.forEach(metaData.validationRules, function (item, key) {
    $scope.select[item.id] = $scope.select[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
        $scope.select[item.id][index.id] = false;
    });
});
				//

        angular.forEach(insarray.instances, function (item, key) {

            filData[key] = {
                validationRules: [],
                dataElements: [],
                categoryOptionCombos:[]

            };


        });
    };


    $scope.filter = [{
        id: '1',
        name: 'Last Day'
    }, {
        id: '2',
        name: 'Last Week'
    }, {
        id: '3',
        name: 'Last Month'

    },
        {
            id: '4',
            name: 'No-Specific Duration'
        }
    ];


    $scope.getdate = function (filter) {

        if (filter.id == 1) {
            filDateSelected = true;
            noDurationSelected = false;

            date = lastDay;
            $scope.json();
        }
        if (filter.id == 2) {
            filDateSelected = true;
            noDurationSelected = false;
            date = lastWeek;
            $scope.json();
        }
        if (filter.id == 3) {
            filDateSelected = true;
            noDurationSelected = false;

            date = lastMonth;
            $scope.json();
        }

        if (filter.id == 4) {
            filDateSelected = true;
            noDurationSelected = true;

            date = noDuration;

            $scope.json();
        }
    };

    $scope.getGroup = function (group) {

        valGroup = group;
        $scope.json();

    };
    var userUrl;
    var natUserUrl = "../../me.json";
    var indexes = [];
    $scope.x = function () {
        window.location.reload();


    };
    $scope.checkAll2 = function () {
        angular.forEach(metaData.validationRules, function (item) {
            $scope.valid[item.id] = $scope.selectedAll;
        });

    };

    $scope.checkAll=function(instance){
		//
	
//
        angular.forEach(metaData.validationRules, function (index, key) {
            $scope.select[index.id][instance]=  $scope.sel[instance];

        });

    };

    $scope.checkIns = function () {


    };

    $scope.syncAll = function () {
        var x1 = false;
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;
            filData[key] = {
                validationRules: [],
                dataElements: [],
                categoryOptionCombos:[]
            };

        });
        var x = 0;
        var i = 0;
        angular.forEach(metaData.validationRules, function (item, key) {
            if ($scope.valid[item.id]) {


                var dataaa = metaData.validationRules[key];
                x++;
                angular.forEach(insarray.instances, function (instance, key) {
                    if ( $scope.select[item.id][instance.id]) {
                        filData[key].validationRules[indexes[key]] = dataaa;

                        indexes[key]++;
                        i++;
                        x1 = true;
                    }
                });





            }

        });

        if (x1 == false) {
            $('#share_list_popup').html(" ");
            $("#myModalLabel").html("Sorry Unable to Sync !!!");
            $('#share_list_popup').append('Please Check whether you have Mapped MetaData With Instance.');
            $("#alertModal").modal("show");
        }
        else if (x1 == true) {

            angular.forEach(insarray.instances, function (instance, key) {

                var instanceURL = instance.url + "/api/metaData";
                if (filData[key].validationRules.length > 0) {

                    var str;
                    var str1;
                    var str2;
                    var de;
                    var coc;
                    for (var a = 0; a < filData[key].validationRules.length; a++) {

                        if (filData[key].validationRules[a].leftSide.expression) {
                            str1 = filData[key].validationRules[a].leftSide.expression;
                            var found1 = [],          // an array to collect the strings that are found
                                rxp1 = /{([^}]+)}/g,
                                str1,
                                curMatch1;

                            while (curMatch1 = rxp1.exec(str1)) {
                                found1.push(curMatch1[1]);
                            }


                            for (var k = 0; k < found1.length; k++) {
                                str = found1[k];
                                de = str.split(".")[0];
                                coc = str.split(".")[1];

                                for (var c = 0; c < dataElementJson.dataElements.length; c++) {
                                    if (de == dataElementJson.dataElements[c].id) {
                                        var result = $.grep(filData[key].dataElements, function (e) {
                                            return e.id === dataElementJson.dataElements[c].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].dataElements.push(dataElementJson.dataElements[c]);
                                        }
                                    }
                                }

                                for (var c = 0; c < categoryOptionComboJson.categoryOptionCombos.length; c++) {
                                    if (coc == categoryOptionComboJson.categoryOptionCombos[c].id) {
                                        var result = $.grep(filData[key].categoryOptionCombos, function (e) {
                                            return e.id === categoryOptionComboJson.categoryOptionCombos[c].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].categoryOptionCombos.push(categoryOptionComboJson.categoryOptionCombos[c]);
                                        }
                                    }
                                }

                            }
                        }

                        //use of regular expression to get IDs of dataelements and category opton combinations
                        if (filData[key].validationRules[a].rightSide.expression) {
                            str2 = filData[key].validationRules[a].rightSide.expression;
                            var found2 = [],          // an array to collect the strings that are found
                                rxp2 = /{([^}]+)}/g,
                                str2,
                                curMatch2;

                            while (curMatch2 = rxp2.exec(str2)) {
                                found2.push(curMatch2[1]);
                            }

                            for (var k = 0; k < found2.length; k++) {
                                str = found2[k];
                                de = str.split(".")[0];
                                coc = str.split(".")[1];

                                for (var c = 0; c < dataElementJson.dataElements.length; c++) {
                                    if (de == dataElementJson.dataElements[c].id) {
                                        var result = $.grep(filData[key].dataElements, function (e) {
                                            return e.id === dataElementJson.dataElements[c].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].dataElements.push(dataElementJson.dataElements[c]);
                                        }
                                    }
                                }

                                for (var c = 0; c < categoryOptionComboJson.categoryOptionCombos.length; c++) {
                                    if (coc == categoryOptionComboJson.categoryOptionCombos[c].id) {
                                        var result = $.grep(filData[key].categoryOptionCombos, function (e) {
                                            return e.id === categoryOptionComboJson.categoryOptionCombos[c].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].categoryOptionCombos.push(categoryOptionComboJson.categoryOptionCombos[c]);
                                        }
                                    }
                                }

                            }
                        }
                    }


                    var v = (filData[key]);
                    //    console.log(k);
                    $("#coverLoad").show();
                    var header = {

                        "Authorization": "Basic " + btoa(instance.uname + ':' + instance.pword),
                        "Content-Type": 'application/json'

                    };
                    var x = $http({
                        method: 'POST',
                        url: instanceURL,
                        data: v,
                        headers: header
                    })

                        .success(function (response) {
                            $().toastmessage('showSuccessToast', 'Objects Successfully Imported <br /> Instance : ' + instance.name + '<br /> Updated Count : ' + response.importCount.updated + ' <br />Imported Count : ' + response.importCount.imported);
                            userUrl = instance.url + "/api/me.json";
                            saveSync(response.importTypeSummaries, filData[key], instance, response);

                        })
                        .error(function (response) {
                            $().toastmessage('showErrorToast', 'Make Sure Whether the Instance <br/>' + instance.name + ' is Connected . ');
                            saveSync("error", filData[key], instance, "error");
                            $("#coverLoad").hide();
                        });

                    $q.all([x]).then(function (result) {
                        $("#coverLoad").hide();

                    });


                }
            });
        }
        else {
            $('#share_list_popup').html(" ");
            $("#myModalLabel").html("Error");
            $('#share_list_popup').append('Complete Mapping and then Synchronize');
            $("#alertModal").modal("show");

        }


    };
    var syncedDate;
    var t = 0;
    var proUserID;

    function saveSync(respo, filData, instance, res) {


        var m = 0;


        var k = $http.get("../../system/info").then(function (response) {
            response = response.data;
            syncedDate = response.serverDate.split("T")[0] + " (" + response.serverDate.split("T")[1].split(".")[0] + ")";

        });
        $q.all([k]).then(function () {

            if (respo == "error") {
                t = 2;
            }
            else {
                for (var k = 0; k < respo.length; k++) {

                    if (respo[k].status == "SUCCESS") {

                        t = 0;
                    }
                    else {
                        m++;
                    }

                }
                if (m != 0) {
                    t = 1;
                }
            }
            saveNotification($http, $rootScope, t, instance, filData, respo);
            saveHistory($http, $rootScope, t, instance, filData, respo);
            if (res != "error") {
                msgSummary($http, $rootScope, filData, res, instance, respo);
            }
        });

    }

    function saveNotification($http, $rootScope, t, instance, fildata, respo) {
        var notifications = {};
        var newNotification = {};

        if (t == 0) {
            newNotification.notification = "All the MetaData Updations Were Successfull";
            newNotification.instance = instance.name;
            newNotification.metaDataFilterd = fildata;
            newNotification.response = respo;
        }
        if (t == 1) {
            newNotification.notification = "Some of the MetaData fields Updations Were Successfull";
            newNotification.instance = instance.name;
            newNotification.metaDataFilterd = fildata;
            newNotification.response = respo;
        }

        if (t == 2) {
            newNotification.notification = "Error In Network";
            newNotification.instance = instance.name;
            newNotification.metaDataFilterd = fildata;
            newNotification.response = respo;
        }

        var notifyJSON = "";


        newNotification.date = syncedDate;

        $http.get(syncNotificationUrl).then(function (res) {

            if (res.data == "\"x\"") {
                notifications.data = [];
            }
            else if (res.data != "") {
                notifications = res.data;

            }
            else {
                notifications.data = [];
            }
            notifications.data.push(newNotification);
            notifyJSON = JSON.stringify(notifications);

            postNotification($http, $rootScope, notifyJSON);

        });
    }

    function saveHistory($http, $rootScope, t, instance, fildata, respo) {
        var history = {};
        var newHistory = {};
        if (t == 0) {
            newHistory.notification = "All the MetaData Updations Were Successfull";
            newHistory.instance = instance.name;
            newHistory.metaDataFilterd = fildata;
            newHistory.response = respo;

        }
        if (t == 1) {
            newHistory.notification = "Some of the MetaData fields Updations Were Successfull";
            newHistory.instance = instance.name;
            newHistory.metaDataFilterd = fildata;
            newHistory.response = respo;

        }

        if (t == 2) {
            newHistory.notification = "Error In Network";
            newHistory.instance = instance.name;
            newHistory.metaDataFilterd = fildata;
            newHistory.response = respo;

        }

        var historyJSON = "";
        newHistory.date = syncedDate;

        $http.get(syncHistoryUrl).then(function (res) {

            if (res.data == "\"x\"") {
                history.data = [];
            }
            else if (res.data != "") {
                history = res.data;

            }
            else {
                history.data = [];
            }
            history.data.push(newHistory);
            historyJSON = JSON.stringify(history);

            postHistory($http, $rootScope, historyJSON);
        });
    }


    function postHistory($http, $rootScope, historyJSON) {
        $http.post(syncHistoryUrl, historyJSON, {headers: {'Content-Type': 'text/plain;charset=utf-8'}});
    }

    function postNotification($http, $rootScope, notifyJSON) {
        $http.post(syncNotificationUrl, notifyJSON, {headers: {'Content-Type': 'text/plain;charset=utf-8'}});

    }

    var natUserID;

    function msgSummary($http, $rootScope, filData, response, instance, respo) {
        //var er = syncSummary.stats.errors;

        var im = response.importCount.imported;
        var de = response.importCount.deleted;
        var up = response.importCount.updated;
        var ig = response.importCount.ignored;
        var ins = instance.name;

        var syd = syncedDate;

        var allSyncData = "";
        var subject = "DHIS MetaData Sync Summary";

        var msg = ins + " was synced with the National Instance on " + syd + ". Here are the statistics of the import. \n";

        for (var j = 0; j < respo.length; j++) {
            if (respo[j].status == "SUCCESS" && respo[j].type == "ValidationRule") {

                allSyncData += '\n Validation Rules\n ';

                for (var k = 0; k < filData.validationRules.length; k++) {
                    allSyncData += filData.validationRules[k].name + '\n';

                }
            }
            if (respo[j].status == "SUCCESS" && respo[j].type == "DataElement") {
                allSyncData += "\n Data Elements\n ";
                for (var k = 0; k < filData.dataElements.length; k++) {

                    allSyncData += filData.dataElements[k].name + "\n";
                }

            }

        }


        msg += "\n Imported Count : " + im;
        msg += "\n Deleted Count : " + de;
        msg += "\n Updated Count : " + up;
        msg += "\n Ignored Count : " + ig;
        msg += "\n Updated Meta Data are as Follows-:" + allSyncData;


        var header = {

            "Authorization": "Basic " + btoa(instance.uname + ':' + instance.pword)

        };

        var z = $http({method: 'get', url: instance.url + "/api/me.json", headers: header})
            .success(function (data) {

                proUserID = data.id;
            })
            .error(function (data) {

            });


        var y = $http.get(natUserUrl).then(function (resp) {
            if (!resp.data == "")

            natUserID = resp.data.id;
        });

        $q.all([y, z]).then(function () {


            var jsonData1 = {
                "subject": subject,
                "text": msg,
                "users": [{id: natUserID}]
            };
            var jsonData2 = {
                "subject": subject,
                "text": msg,
                "users": [{id: proUserID}]
            };

            $http({
                method: 'POST',
                url: '../../messageConversations',
                data: jsonData1,
                headers: {"Content-Type": 'application/json'}
            })
                .success(function (response) {

                })
                .error(function (response) {

                });

            var header = {

                "Authorization": "Basic " + btoa(instance.uname + ':' + instance.pword),
                "Content-Type": 'application/json'

            };
            $http({
                method: 'POST',
                url: instance.url + '/api/messageConversations',
                data: jsonData2,
                headers: header
            })
                .success(function (response) {

                })
                .error(function (response) {

                });
        });

    }


});