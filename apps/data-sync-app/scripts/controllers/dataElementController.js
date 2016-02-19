app.controller('dataElementController', function ($scope, $rootScope, $filter, $http, $q) {
    lastDay = $filter('date')(lastDay, 'yyyy-MM-dd');
    lastWeek = $filter('date')(lastWeek, 'yyyy-MM-dd');
    lastMonth = $filter('date')(lastMonth, 'yyyy-MM-dd');
    noDuration = $filter('date')(noDuration, 'yyyy-MM-dd');

  //variables to hold date and check whether date select is selected and in there filter is set to no duration
    var date = "";
    var filDateSelected = false;
    var noDurationSelected = false;

    //url to data element groups
    var dataElementGroupUrl = "../../dataElementGroups.json?fields=[id,name]&paging=false";

    $http.get(apiUrl).then(function (response) {
        if (!response.data == "")
            $rootScope.setting = JSON.parse(response.data.value);


    });
    //fetching data element group data
    $http.get(dataElementGroupUrl).then(function (response) {
        if (!response.data == "")
            $scope.DEGroup = response.data.dataElementGroups;

    });

    //------------------------------------------valid the synchronization---------------------------------------------------------------//
   // var de = false;
    var deGroup;
    var coc = false;
    var co = false;
    var c = false;
    var os = false;
    var o = false;

    //set up the instance array //
    var insarray = [];
    $http.get(apiUrl).then(function (response) {
        if (!response.data == "") {
            insarray = JSON.parse(response.data.value);
        }
    });

    //function to sort the rows of the table
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };

    //initialize the ng-model arrays 1-D and 2-D
    
	//-------------------------------Declaration of $scope.checkbox objects For Multi select----------------------------------------------//
	$scope.select= {};
	$scope.selectcoc= {};
	$scope.selectc= {};
	$scope.selectco= {};
	$scope.selectos= {};
	$scope.selecto= {};	
    $scope.deid = {};
	$scope.cocid = {};
	$scope.cid = {};
	$scope.coid = {};
	$scope.osid = {};
	$scope.oid = {};
    $scope.sel = {};
	$scope.selcoc = {};
	$scope.selc = {};
	$scope.selco = {};
	$scope.selos = {};
	$scope.selo = {};



    //defining the URLs of DataElements and other dependencies like Category Combo, Categories etc.

    var categoryComboUrl = "../../categoryCombos.json?fields=[:all]&paging=false";
    var categoryUrl = "../../categories.json?fields=[:all]&paging=false";
    var categoryOptionUrl = "../../categoryOptions.json?fields=[:all]&paging=false";
    var optionSetsUrl = "../../optionSets.json?fields=[:all]&paging=false";
    var optionsUrl = "../../options.json?fields=[:all]&paging=false";


    //declaring variables to store the JSON data

    var categoryComboJson;
    var categoryJson;
    var categoryOptionJson;
    var optionSetsJson;
    var optionsJson;

    //variable to check whether JSON data have already loaded or not
    var check = 0;
    //retrieve JSON function

    $scope.json = function () {
        if (check == 0 && filDateSelected) {
            $scope.loading = true;
            var a ;
            if(dataElementJson==undefined){
                a= $http.get(DataElementUrl).then(function (response) {
                    if (!response.data == "")
                    //console.log(response.data);
                        dataElementJson = response.data;

                });
            }

            var b = $http.get(categoryComboUrl).then(function (response) {
                if (!response.data == "")

                categoryComboJson = response.data;

            });
            var c = $http.get(categoryOptionUrl).then(function (response) {
                if (!response.data == "")

                categoryOptionJson = response.data;

            });
            var d = $http.get(categoryUrl).then(function (response) {
                if (!response.data == "")

                categoryJson = response.data;

            });
            var e = $http.get(optionSetsUrl).then(function (response) {
                if (!response.data == "")
                //console.log(response.data);
                    optionSetsJson = response.data;


            });
            var f = $http.get(optionsUrl).then(function (response) {
                if (!response.data == "")
                //console.log(response.data);
                    optionsJson = response.data;

            });
            var g;
            // console.log(URL6);
            if (typeof attributeJson === 'undefined') {
                g = $http.get(attributeUrl).then(function (response) {
                    if (!response.data == "")

                    attributeJson = (response.data);

                });

            }
            $q.all([a, b, c, d, e, f, g]).then(function (result) {
                check++;
                $scope.loading = false;
                if (deGroup == undefined) {
                    $scope.getJson(dataElementJson);
                }
                else {
                    //var DEString = "";
                    var dataEleJson =
                    {
                        dataElements: []
                    };
                    $http.get("../../dataElementGroups/" + deGroup + ".json?fields=[dataElements]&paging=false").then(function (response) {
                        var dataElements = response.data.dataElements;

                        for (var a = 0; a < dataElements.length; a++) {
                            for (var b = 0; b < dataElementJson.dataElements.length; b++) {
                                if (dataElements[a].id == dataElementJson.dataElements[b].id) {
                                    //DEString += dataElements[a].id + ",";
                                    dataEleJson.dataElements.push(dataElementJson.dataElements[b]);
                                }
                            }

                        }
                        $scope.getJson(dataEleJson);

                    });
                }
            });
        }
        else if (filDateSelected) {
            if (deGroup == undefined) {
                $scope.getJson(dataElementJson);
            }
            else {
                var dataEleJson =
                {
                    dataElements: []
                };
                $http.get("../../dataElementGroups/" + deGroup + ".json?fields=[dataElements]&paging=false").then(function (response) {
                    var dataElements = response.data.dataElements;

                    for (var a = 0; a < dataElements.length; a++) {
                        for (var b = 0; b < dataElementJson.dataElements.length; b++) {
                            if (dataElements[a].id == dataElementJson.dataElements[b].id) {
                                //DEString += dataElements[a].id + ",";
                                dataEleJson.dataElements.push(dataElementJson.dataElements[b]);
                            }
                        }

                    }
                    $scope.getJson(dataEleJson);

                });
            }
        }
    };


    //declaring variables to store the relevant dependent dataElements
    var jsonCOCArr;
    var jsonCArr;
    var jsonCOArr;
    var metaData;
    var jsonOArr;
    var jsonOSArr;

    var filData = [];

    //function to cross checking added JSON objects and retrieve only updated ones and load them to the application
    $scope.getJson = function (dataElementJson) {
        metaData =
        {
            attributes: [],
            dataElements: [],
            categoryCombos: [],
            categories: [],
            categoryOptions: [],
            optionSets: [],
            options: []
        };

        if (noDurationSelected && deGroup===undefined) {

          if(dataElementJson==undefined){

              $scope.loading = true;
              var ab = $http.get(DataElementUrl).then(function (response) {
                  if (!response.data == "")

                  dataElementJson=response.data;
                  metaData.dataElements = (response.data.dataElements);
                  if (metaData.dataElements.length == 0) {
                      $("#dee").hide();
                  }
                  else {

                      $.each(metaData.dataElements, function (i, d) {
                          d.valueType = "NUMBER";
                      });

                      $scope.dataElements = response.data.dataElements;
                      $("#dee").show();

                  }


              });
              $q.all([ab]).then(function (result) {

                  $scope.loading = false;

              });
          }
            else{
              metaData.dataElements = (dataElementJson.dataElements);
              if (metaData.dataElements.length == 0) {
                  $("#dee").hide();
              }
              else {

                  $.each(metaData.dataElements, function (i, d) {
                      d.valueType = "NUMBER";
                  });

                  $scope.dataElements = metaData.dataElements;
                  $("#dee").show();

              }
          }

            $("#os").hide();
            $("#o").hide();
            $("#co").hide();
            $("#c").hide();
            $("#coc").hide();
        }

        else {
            //initializing
            jsonCOCArr = [];
            jsonCArr = [];
            jsonCOArr = [];
            jsonOSArr = [];
            jsonOArr = [];


            var dataE = [];
            var catOCE = [];
            var cat = [];
            var catOPT = [];
            var opSET = [];
            var opt = [];
            //variables to hold only Updated ID's as a string
            var dataEIDs = "";
            var catOCEIDs = "";
            var catIDs = "";
            var catOPTIDs = "";
            var opSETIDs = "";
            var optIDs = "";

            //loops to check the updations (dataElements.category combos,categories,category options)

            for (var i = 0; i < dataElementJson.dataElements.length; i++) {
                if (dataElementJson.dataElements[i].lastUpdated > date) {
                    dataE.push(dataElementJson.dataElements[i].id);
                    dataEIDs += dataElementJson.dataElements[i].id + ",";
                    metaData.dataElements.push(dataElementJson.dataElements[i]);
                }
                else if (dataElementJson.dataElements[i].categoryCombo.name == "default") {
                    continue;
                }

                else {
                    for (var j = 0; j < categoryComboJson.categoryCombos.length; j++) {
                        if (categoryComboJson.categoryCombos[j].name == "default") {
                            continue;
                        }
                        else if (dataElementJson.dataElements[i].categoryCombo.id == categoryComboJson.categoryCombos[j].id) {
                            if (categoryComboJson.categoryCombos[j].lastUpdated > date) {
                                jsonCOCArr.push({
                                    categoryCombo: categoryComboJson.categoryCombos[j].id,
                                    dataElement: dataElementJson.dataElements[i].id,
                                    name: dataElementJson.dataElements[i].name
                                });
                                if (catOCEIDs.search(categoryComboJson.categoryCombos[j].id) < 0) {
                                    catOCE.push(categoryComboJson.categoryCombos[j].id);
                                    catOCEIDs += categoryComboJson.categoryCombos[j].id + ",";
                                    metaData.categoryCombos.push(categoryComboJson.categoryCombos[j]);
                                }

                                for (var k = 0; k < categoryComboJson.categoryCombos[j].categories.length; k++) {
                                    for (var l = 0; l < categoryJson.categories.length; l++) {
                                        if (categoryJson.categories[l].name == "default") {
                                            continue;
                                        }
                                        else if (categoryComboJson.categoryCombos[j].categories[k].id == categoryJson.categories[l].id) {

                                            if (categoryJson.categories[l].lastUpdated > date) {

                                                jsonCArr.push({
                                                    category: categoryJson.categories[l].id,
                                                    dataElement: dataElementJson.dataElements[i].id,
                                                    name: dataElementJson.dataElements[i].name
                                                });
                                                if (catIDs.search(categoryJson.categories[l].id) < 0) {
                                                    cat.push(categoryJson.categories[l].id);
                                                    catIDs += categoryJson.categories[l].id + ",";
                                                    metaData.categories.push(categoryJson.categories[l]);
                                                }
                                                for (var m = 0; m < categoryJson.categories[l].categoryOptions.length; m++) {
                                                    for (var n = 0; n < categoryOptionJson.categoryOptions.length; n++) {
                                                        if (categoryOptionJson.categoryOptions[n].name == "default") {
                                                            continue;
                                                        }
                                                        if (categoryJson.categories[l].categoryOptions[m].id == categoryOptionJson.categoryOptions[n].id) {
                                                            if (categoryOptionJson.categoryOptions[n].lastUpdated > date) {

                                                                jsonCOArr.push({
                                                                    categoryOption: categoryOptionJson.categoryOptions[n].id,
                                                                    dataElement: dataElementJson.dataElements[i].id,
                                                                    name: dataElementJson.dataElements[i].name
                                                                });
                                                                if (catOPTIDs.search(categoryOptionJson.categoryOptions[n].id) < 0) {
                                                                    catOPT.push(categoryOptionJson.categoryOptions[n].id);
                                                                    catOPTIDs += categoryOptionJson.categoryOptions[n].id + ",";
                                                                    metaData.categoryOptions.push(categoryOptionJson.categoryOptions[n]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {

                                for (var k = 0; k < categoryComboJson.categoryCombos[j].categories.length; k++) {
                                    for (var l = 0; l < categoryJson.categories.length; l++) {
                                        if (categoryJson.categories[l].name == "default") {
                                            continue;
                                        }
                                        else if (categoryComboJson.categoryCombos[j].categories[k].id == categoryJson.categories[l].id) {

                                            if (categoryJson.categories[l].lastUpdated > date) {

                                                jsonCArr.push({
                                                    category: categoryJson.categories[l].id,
                                                    dataElement: dataElementJson.dataElements[i].id,
                                                    name: dataElementJson.dataElements[i].name
                                                });
                                                if (catIDs.search(categoryJson.categories[l].id) < 0) {
                                                    cat.push(categoryJson.categories[l].id);
                                                    catIDs += categoryJson.categories[l].id + ",";
                                                    metaData.categories.push(categoryJson.categories[l]);
                                                }
                                                for (var m = 0; m < categoryJson.categories[l].categoryOptions.length; m++) {
                                                    for (var n = 0; n < categoryOptionJson.categoryOptions.length; n++) {
                                                        if (categoryOptionJson.categoryOptions[n].name == "default") {
                                                            continue;
                                                        }
                                                        if (categoryJson.categories[l].categoryOptions[m].id == categoryOptionJson.categoryOptions[n].id) {
                                                            if (categoryOptionJson.categoryOptions[n].lastUpdated > date) {

                                                                jsonCOArr.push({
                                                                    categoryOption: categoryOptionJson.categoryOptions[n].id,
                                                                    dataElement: dataElementJson.dataElements[i].id,
                                                                    name: dataElementJson.dataElements[i].name
                                                                });
                                                                if (catOPTIDs.search(categoryOptionJson.categoryOptions[n].id) < 0) {
                                                                    catOPT.push(categoryOptionJson.categoryOptions[n].id);
                                                                    catOPTIDs += categoryOptionJson.categoryOptions[n].id + ",";
                                                                    metaData.categoryOptions.push( categoryOptionJson.categoryOptions[n]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                for (var m = 0; m < categoryJson.categories[l].categoryOptions.length; m++) {
                                                    for (var n = 0; n < categoryOptionJson.categoryOptions.length; n++) {
                                                        if (categoryOptionJson.categoryOptions[n].name == "default") {
                                                            continue;
                                                        }
                                                        if (categoryJson.categories[l].categoryOptions[m].id == categoryOptionJson.categoryOptions[n].id) {
                                                            if (categoryOptionJson.categoryOptions[n].lastUpdated > date) {

                                                                jsonCOArr.push({
                                                                    categoryOption: categoryOptionJson.categoryOptions[n].id,
                                                                    dataElement: dataElementJson.dataElements[i].id,
                                                                    name: dataElementJson.dataElements[i].name
                                                                });
                                                                if (catOPTIDs.search(categoryOptionJson.categoryOptions[n].id) < 0) {
                                                                    catOPT.push(categoryOptionJson.categoryOptions[n].id);
                                                                    catOPTIDs += categoryOptionJson.categoryOptions[n].id + ",";
                                                                    metaData.categoryOptions.push(categoryOptionJson.categoryOptions[n]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }

            }

            //check option sets and options
            for (var i = 0; i < dataElementJson.dataElements.length; i++) {
                if (dataElementJson.dataElements[i].optionSetValue != false) {
                    for (var p = 0; p < optionSetsJson.optionSets.length; p++) {
                        if (optionSetsJson.optionSets[p].name == "default") {
                            continue;
                        }
                        else if (optionSetsJson.optionSets[p].id == dataElementJson.dataElements[i].optionSet.id || optionSetsJson.optionSets[p].id == dataElementJson.dataElements[i].commentOptionSet.id) {
                            if (optionSetsJson.optionSets[p].lastUpdated > date) {
                                jsonOSArr.push({
                                    optionSet: optionSetsJson.optionSets[p].id,
                                    dataElement: dataElementJson.dataElements[i].id,
                                    name: dataElementJson.dataElements[i].name
                                });
                                if (opSETIDs.search(optionSetsJson.optionSets[p].id) < 0) {
                                    opSET.push(optionSetsJson.optionSets[p].id);
                                    opSETIDs += optionSetsJson.optionSets[p].id + ",";
                                    metaData.optionSets.push(optionSetsJson.optionSets[p]);
                                }
                                for (var q = 0; q < optionSetsJson.optionSets[p].options.length; q++) {
                                    for (var r = 0; r < optionsJson.options.length; r++) {
                                        if (optionsJson.options[r].name == "default") {
                                            continue;
                                        }
                                        if (optionSetsJson.optionSets[p].options[q].id == optionsJson.options[r].id) {
                                            if (optionsJson.options[r].lastUpdated > date) {
                                                jsonOArr.push({
                                                    options: optionsJson.options[r].id,
                                                    dataElement: dataElementJson.dataElements[i].id,
                                                    name: dataElementJson.dataElements[i].name
                                                });
                                                if (optIDs.search(optionsJson.options[r].id) < 0) {
                                                    opt.push(optionsJson.options[r].id);
                                                    optIDs += optionsJson.options[r].id + ",";
                                                    metaData.options.push(optionsJson.options[r]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                for (var q = 0; q < optionSetsJson.optionSets[p].options.length; q++) {
                                    for (var r = 0; r < optionsJson.options.length; r++) {
                                        if (optionsJson.options[r].name == "default") {
                                            continue;
                                        }
                                        if (optionSetsJson.optionSets[p].options[q].id == optionsJson.options[r].id) {
                                            if (optionsJson.options[r].lastUpdated > date) {
                                                jsonOArr.push({
                                                    options: optionsJson.options[r].id,
                                                    dataElement: dataElementJson.dataElements[i].id,
                                                    name: dataElementJson.dataElements[i].name
                                                });
                                                if (optIDs.search(optionsJson.options[r].id) < 0) {
                                                    opt.push(optionsJson.options[r].id);
                                                    optIDs += optionsJson.options[r].id + ",";
                                                    metaData.options.push(optionsJson.options[r]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }

                if (metaData.dataElements.length == 0) {
                    $("#dee").hide();
                }
                else {

                    $.each(metaData.dataElements, function (i, d) {
                        d.valueType = "NUMBER";
                    });

                    $scope.dataElements = metaData.dataElements;
                    $("#dee").show();
                    console.log(metaData);
                }

                if (metaData.categoryCombos.length == 0) {
                    $("#coc").hide();
                }
                else {
                    $("#coc").show();
                    $scope.categoryCombos = metaData.categoryCombos;

                }

                if (metaData.categories.length == 0) {
                    $("#c").hide();
                }
                else {
                    $("#c").show();
                    $scope.categories = metaData.categories;

                }

                if (metaData.categoryOptions.length == 0) {
                    $("#co").hide();
                }
                else {
                    $("#co").show();
                    $scope.categoryOptions = metaData.categoryOptions;

                }

                if (metaData.optionSets.length == 0) {
                    $("#os").hide();
                }
                else {
                    $("#os").show();
                    $scope.optionSets = metaData.optionSets;

                }


                if (metaData.options.length == 0) {
                    $("#o").hide();
                }
                else {
                    $("#o").show();
                    $scope.options = metaData.options;

                }
//-------------------------------Initalizing to False /All Check box Properities-----------------------------------------------//
	angular.forEach(metaData.dataElements, function (item, key) {
    $scope.select[item.id] = $scope.select[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.select[item.id][index.id] = false;
    });
});
				
	angular.forEach(metaData.categoryCombos, function (item, key) {
    $scope.selectcoc[item.id] = $scope.selectcoc[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.selectcoc[item.id][index.id] = false;
    });
});
				
angular.forEach(metaData.categories, function (item, key) {
    $scope.selectc[item.id] = $scope.selectc[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.selectc[item.id][index.id] = false;
    });
});

angular.forEach(metaData.categoryOptions, function (item, key) {
    $scope.selectco[item.id] = $scope.selectco[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.selectco[item.id][index.id] = false;
    });
});

angular.forEach(metaData.optionSets, function (item, key) {
    $scope.selectos[item.id] = $scope.selectos[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.selectos[item.id][index.id] = false;
    });
});


angular.forEach(metaData.options, function (item, key) {
    $scope.selecto[item.id] = $scope.selecto[item.id] || {};

    angular.forEach(insarray.instances, function (index, key) {
     $scope.selecto[item.id][index.id] = false;
    });
});
//-------------------------------------------End Initializing--------------------------------------------------------------------//

            angular.forEach(insarray.instances, function (item, key) {

                filData[key] = {
                    attributes: [],
                    dataElements: [],
                    categoryCombos: [],
                    categories: [],
                    categoryOptions: [],
                    optionSets: [],
                    options: []
                };

            });



        }

    };

    var indexes = [];
    var userUrl;
    var natUserUrl = "../../me.json";
    $scope.x = function () {
        window.location.reload();


    };
    //-------------------------//for Meta-Data selection//----------------------------------------------//
    $scope.checkAllDe= function () {

        angular.forEach(metaData.dataElements, function (item) {
            $scope.deid[item.id] = $scope.selectedAll1;
        });

    };
	$scope.checkAllCoc = function () {

        angular.forEach(metaData.categoryCombos, function (item) {
            $scope.cocid[item.id] = $scope.selectedAll2;
        });

    };
	$scope.checkAllC = function () {

        angular.forEach(metaData.categories, function (item) {
            $scope.cid[item.id] = $scope.selectedAll3;
        });

    };
	$scope.checkAllCo = function () {

        angular.forEach(metaData.categoryOptions, function (item) {
            $scope.coid[item.id] = $scope.selectedAll4;
        });

    };
	$scope.checkAllOs = function () {

        angular.forEach(metaData.optionSets, function (item) {
            $scope.osid[item.id] = $scope.selectedAll5;
        });

    };
	$scope.checkAllO = function () {

        angular.forEach(metaData.options, function (item) {
            $scope.oid[item.id] = $scope.selectedAll6;
        });

    };
	//-----------------------------For Selection of Instances----------------------------------------------------------------------//
	 $scope.checkAllInsDe=function(instance){
		
        angular.forEach(metaData.dataElements, function (index, key) {
            $scope.select[index.id][instance]=  $scope.sel[instance];

        });

    };
	$scope.checkAllInsCoc=function(instance){
	
        angular.forEach(metaData.categoryCombos, function (index, key) {
            $scope.selectcoc[index.id][instance]=  $scope.selcoc[instance];

        });

    };
	$scope.checkAllInsC=function(instance){
		
        angular.forEach(metaData.categories, function (index, key) {
            $scope.selectc[index.id][instance]=  $scope.selc[instance];

        });

    };
	$scope.checkAllInsCo=function(instance){
		
        angular.forEach(metaData.categoryOptions, function (index, key) {
            $scope.selectco[index.id][instance]=  $scope.selco[instance];

        });

    };
	$scope.checkAllInsOs=function(instance){
		
        angular.forEach(metaData.optionSets, function (index, key) {
            $scope.selectos[index.id][instance]=  $scope.selos[instance];

        });

    };
	$scope.checkAllInsO=function(instance){
		
        angular.forEach(metaData.options, function (index, key) {
            $scope.selecto[index.id][instance]=  $scope.selo[instance];

        });

    };



    //function to sync all selected instances with IDS
    $scope.syncall = function () {
        var x1 = false;
        var x2 = false;
        var x3 = false;
        var x4 = false;
        var x5 = false;
        var x6 = false;
        var x;
        var i;

        ///////////////////////////////////////////////////////////for data element//////////////////////////////////////////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;

            filData[key] = {
                attributes: [],
                dataElements: [],
                categoryCombos: [],
                categories: [],
                categoryOptions: [],
                optionSets: [],
                options: []
            };


        });

        x = 0;
        i = 0;
        angular.forEach(metaData.dataElements, function (item, key) {
            if ($scope.deid[item.id]) {


                var dataaa = metaData.dataElements[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ($scope.select[item.id][instance.id]) {

                        filData[key].dataElements[indexes[key]] = dataaa;


                        indexes[key]++;
                        i++;
                        x1 = true;

                    }

                });

            }

        });

        ////////////////////////////category combo////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;

        });

        x = 0;
        i = 0;
        angular.forEach(metaData.categoryCombos, function (item, key) {
            if ($scope.cocid[item.id]) {


                var dataaa = metaData.categoryCombos[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ($scope.selectcoc[item.id][instance.id]) {

                        filData[key].categoryCombos[indexes[key]] = dataaa;

                        indexes[key]++;
                        i++;
                        x2 = true;
                    }
                });



            }

        });


        ////////////////////////categories////////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;

        });

        x = 0;
        i = 0;
        angular.forEach(metaData.categories, function (item, key) {
            if ($scope.cid[item.id]) {

                var dataaa = metaData.categories[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ($scope.selectc[item.id][instance.id]) {

                        filData[key].categories[indexes[key]] = dataaa;


                        indexes[key]++;
                        i++;
                        x3 = true;
                    }
                });



            }

        });


        /////////////////////////////category options///////////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;

        });

        x = 0;
        i = 0;
        angular.forEach(metaData.categoryOptions, function (item, key) {
            if ($scope.coid[item.id]) {


                var dataaa = metaData.categoryOptions[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ( $scope.selectco[item.id][instance.id]) {

                        filData[key].categoryOptions[indexes[key]] = dataaa;


                        indexes[key]++;
                        i++;
                        x4 = true;
                    }
                });


            }

        });


        ///////////////////////////option sets///////////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;

        });

        x = 0;
        i = 0;
        angular.forEach(metaData.optionSets, function (item, key) {
            if ($scope.osid[item.id]) {


                var dataaa = metaData.optionSets[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ( $scope.selectos[item.id][instance.id]) {

                        filData[key].optionSets[indexes[key]] = dataaa;

                        indexes[key]++;
                        i++;
                        x5 = true;
                    }
                });



            }

        });


        ////////////////////////////////////options//////////////////////////////////////////////////////////////////////////////////////////
        angular.forEach(insarray.instances, function (item, key) {
            indexes[key] = 0;
        });

        x = 0;
        i = 0;
        angular.forEach(metaData.options, function (item, key) {
            if ($scope.oid[item.id]) {


                var dataaa = metaData.options[key];

                x++;

                angular.forEach(insarray.instances, function (instance, key) {

                    if ($scope.selecto[item.id][instance.id]) {

                        filData[key].options[indexes[key]] = dataaa;

                        indexes[key]++;
                        i++;
                        x6 = true;
                    }
                });



            }

        });


        if (x1 == false && x2 == false && x3 == false && x4 == false && x5 == false && x6 == false) {
            $('#share_list_popup').html(" ");
            $("#myModalLabel").html("Sorry Unable to Sync !!!");
            $('#share_list_popup').append('Please Check whether you have Mapped MetaData With Instance.');
            $("#alertModal").modal("show");
        }
        else if (x1 == true || x2 == true || x3 == true || x4 == true || x5 == true || x6 == true) {

            /////////////////////////////////////////////for Synchronize with particular instance///////////////////////////////////////////////////////////////////
            angular.forEach(insarray.instances, function (instance, key) {
                var index = 0;
                var instanceURL = instance.url + "/api/metaData";
                if (filData[key].dataElements.length > 0 || filData[key].categoryCombos.length > 0 || filData[key].categories.length > 0 || filData[key].categoryOptions.length > 0 || filData[key].optionSets.length > 0 || filData[key].options.length > 0) {
                    if (filData[key].dataElements.length > 0) {


                        for (var ind = 0; ind < filData[key].dataElements.length; ind++) {
                            if (filData[key].dataElements[ind].attributeValues) {
                                for (var ind2 = 0; ind2 < filData[key].dataElements[ind].attributeValues.length; ind2++) {


                                    for (var val = 0; val < attributeJson.attributes.length; val++) {
                                        if (attributeJson.attributes[val].id == filData[key].dataElements[ind].attributeValues[ind2].attribute.id) {
                                            var result = $.grep(filData[key].attributes, function (e) {
                                                return e.id === attributeJson.attributes[val].id;
                                            });
                                            if (result.length == 0) {
                                                filData[key].attributes.push(attributeJson.attributes[val]);
                                            }
                                        }

                                    }
                                }
                            }
                        }

                        for (var a = 0; a < filData[key].dataElements.length; a++) {
                            for (var b = 0; b < categoryComboJson.categoryCombos.length; b++) {
                                if (filData[key].dataElements[a].categoryCombo.id == categoryComboJson.categoryCombos[b].id && filData[key].dataElements[a].categoryCombo.name != "default") {

                                    var result = $.grep(filData[key].categoryCombos, function (e) {
                                        return e.id === categoryComboJson.categoryCombos[b].id;
                                    });
                                    if (result.length == 0) {
                                        filData[key].categoryCombos.push(categoryComboJson.categoryCombos[b]);
                                    }


                                    break;
                                }
                            }
                        }


                        for(var m=0;m<filData[key].categoryCombos.length;m++){
                            for(var n=0;n<filData[key].categoryCombos[m].categories.length;n++){
                                for(var p=0;p<categoryJson.categories.length;p++){
                                    if(filData[key].categoryCombos[m].categories[n].id==categoryJson.categories[p].id){
                                        var result = $.grep(filData[key].categories, function (e) {
                                            return e.id ===categoryJson.categories[p].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].categories.push(categoryJson.categories[p]);
                                        }
                                    }
                                }

                            }
                        }


                        for(var m=0;m<filData[key].categories.length;m++){
                            for(var n=0;n<filData[key].categories[m].categoryOptions.length;n++){
                                for(var p=0;p<categoryOptionJson.categoryOptions.length;p++){
                                    if(filData[key].categories[m].categoryOptions[n].id==categoryOptionJson.categoryOptions[p].id){
                                        var result = $.grep(filData[key].categoryOptions, function (e) {
                                            return e.id ===categoryOptionJson.categoryOptions[p].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].categoryOptions.push(categoryOptionJson.categoryOptions[p]);
                                        }
                                    }
                                }

                            }
                        }


                        for (var c = 0; c < filData[key].dataElements.length; c++) {
                            if (filData[key].dataElements[c].optionSet) {
                                for (var d = 0; d < optionSetsJson.optionSets.length; d++) {
                                    if (filData[key].dataElements[c].optionSet.id == optionSetsJson.optionSets[d].id && filData[key].dataElements[c].optionSet.name != "default") {
                                        var result = $.grep(filData[key].optionSets, function (e) {
                                            return e.id === optionSetsJson.optionSets[d].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].optionSets.push(optionSetsJson.optionSets[d]);
                                        }

                                    }
                                }
                            }
                        }

                        for(var m=0;m<filData[key].optionSets.length;m++){
                            for(var n=0;n<filData[key].optionSets[m].options.length;n++){
                                for(var p=0;p<optionsJson.options.length;p++){
                                    if(filData[key].optionSets[m].options[n].id==optionsJson.options[p].id){
                                        var result = $.grep(filData[key].options, function (e) {
                                            return e.id ===optionsJson.options[p].id;
                                        });
                                        if (result.length == 0) {
                                            filData[key].options.push(optionsJson.options[p]);
                                        }
                                    }
                                }

                            }
                        }

                    }

                    var k = filData[key];
                   // console.log(k);

                    $("#coverLoad").show();
                    var header = {

                        "Authorization": "Basic " + btoa(instance.uname + ':' + instance.pword),
                        "Content-Type": 'application/json'

                    };
                    var x = $http({
                        method: 'POST',
                        url: instanceURL,
                        data: k,
                        headers: header
                    })

                        .success(function (response) {
                            $().toastmessage('showSuccessToast', 'Objects Successfully Imported <br /> Instance : ' + instance.name + '<br /> Updated Count : ' + response.importCount.updated + ' <br />Imported Count : ' + response.importCount.imported);

                            userUrl = instance.url + "/api/me.json";

                            //alert("objects Successfully Imported");
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

    //functions to view related dataElements for a particular dependency
    $scope.viewCOCdataElements = function (id) {
        var index = 1;
        $('#share_list_popup').html(" ");
        $("#myModalLabel").html("Following DataElements Were affected by this");
        for (var i = 0; i < jsonCOCArr.length; i++) {
            if (id == jsonCOCArr[i].categoryCombo) {
                $('#share_list_popup').append('<span align="left">' + index + '. ' + jsonCOCArr[i].name + '</span><br>');
                index++;
            }
        }
        $("#alertModal").modal("show");
    };

    $scope.viewCAdataElements = function (id) {
        var index = 1;
        $('#share_list_popup').html(" ");
        $("#myModalLabel").html("Following DataElements Were affected by this");
        for (var i = 0; i < jsonCArr.length; i++) {
            if (id == jsonCArr[i].category) {
                $('#share_list_popup').append('<span align="center">' + index + '.  ' + jsonCArr[i].name + '</span><br>');
                index++;
            }
        }
        $("#alertModal").modal("show");
    };

    $scope.viewCOdataElements = function (id) {
        var index = 1;
        $('#share_list_popup').html(" ");
        $("#myModalLabel").html("Following DataElements Were affected by this");
        for (var i = 0; i < jsonCOArr.length; i++) {
            if (id == jsonCOArr[i].categoryOption) {
                $('#share_list_popup').append('<span align="left">' + index + '. ' + jsonCOArr[i].name + '</span><br>');
                index++;
            }
        }
        $("#alertModal").modal("show");
    };

    $scope.viewOSdataElements = function (id) {
        var index = 1;
        $('#share_list_popup').html(" ");
        $("#myModalLabel").html("Following DataElements Were affected by this");
        for (var i = 0; i < jsonOSArr.length; i++) {
            if (id == jsonOSArr[i].optionSet) {
                $('#share_list_popup').append('<span align="center">' + index + '.  ' + jsonOSArr[i].name + '</span><br>');
                index++;
            }
        }
        $("#alertModal").modal("show");
    };

    $scope.viewOdataElements = function (id) {
        var index = 1;
        $('#share_list_popup').html(" ");
        $("#myModalLabel").html("Following DataElements Were affected by this");
        for (var i = 0; i < jsonOArr.length; i++) {
            if (id == jsonOArr[i].options) {
                $('#share_list_popup').append('<span align="center">' + index + '.  ' + jsonOArr[i].name + '</span><br>');
                index++;
            }
        }
        $("#alertModal").modal("show");
    };


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

        deGroup = group;
        $scope.json();

    };

    var syncedDate;
    var t = 0;
    var proUserID;



    function saveSync(respo, filData, instance, res) {
        //var syncHistory=[];


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
                    // console.log(respo[k].status);
                    if (respo[k].status == "SUCCESS") {
                       // console.log("hh");
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
                // notifications.data = [];
            }
            else {
                notifications.data = [];
            }
            notifications.data.push(newNotification);
            notifyJSON = JSON.stringify(notifications);

            postNotification($http, $rootScope, notifyJSON);

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
            if (respo[j].status == "SUCCESS" && respo[j].type == "DataElement") {
                allSyncData += "\nData Elements-:\n";
                for (var k = 0; k < filData.dataElements.length; k++) {

                    allSyncData += filData.dataElements[k].name + "\n";
                }

            }


            if (respo[j].status == "SUCCESS" && respo[j].type == "DataElementCategoryCombo") {

                allSyncData += '\n Category Combos-:\n ';

                for (var k = 0; k < filData.categoryCombos.length; k++) {

                    allSyncData += filData.categoryCombos[k].name + "\n";

                }
            }

            if (respo[j].status == "SUCCESS" && respo[j].type == "DataElementCategory") {

                allSyncData += ' \nCategories-:\n ';

                for (var k = 0; k < filData.categories.length; k++) {

                    allSyncData += filData.categories[k].name + "\n";

                }
            }
            if (respo[j].status == "SUCCESS" && respo[j].type == "DataElementCategoryOption") {
                allSyncData += ' \nCategory Options-:\n ';

                for (var k = 0; k < filData.categoryOptions.length; k++) {

                    allSyncData += filData.categoryOptions[k].name + "\n";

                }
            }

            if (respo[j].status == "SUCCESS" && respo[j].type == "OptionSet") {
                allSyncData += '\nOption Sets-:\n ';

                for (var k = 0; k < filData.optionSets.length; k++) {

                    allSyncData += filData.optionSets[k].name + "\n";

                }
            }

            if (respo[j].status == "SUCCESS" && respo[j].type == "Option") {
                allSyncData += '\n Options-:\n ';

                for (var k = 0; k < filData.options.length; k++) {

                    allSyncData += filData.options[k].name + "\n";

                }
            }
            if (respo[j].status == "SUCCESS" && respo[j].type == "Attribute") {
                allSyncData += '\n Attributes-:\n ';

                for (var k = 0; k < filData.attributes.length; k++) {

                    allSyncData += filData.attributes[k].name + "\n";

                }
            }
        }

        msg += "\n Imported Count : " + im;
        msg += "\n Deleted Count : " + de;
        msg += "\n Updated Count : " + up;
        msg += "\n Ignored Count : " + ig;
        msg += "\n Updated Meta Data:" + allSyncData;


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


        $q.all([z, y]).then(function () {


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