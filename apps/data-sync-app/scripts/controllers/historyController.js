/**

 This file has the controller and some other needed functions for handling the sync history

 Remember :
 -- There are some global variables declared in app.js. eg : apiUrl
 -- Form validation functions are coded in validations.js
 -- Saving and fetching basic settings functionality is coded in saveAndFetch.js

 **/
var historyList = [];
app.controller('historyController', function ($rootScope, $http) {
    $http.get(syncHistoryUrl).then(function (response) {
        if (response.data != "\"x\"" && response.data != "") {

            $rootScope.history = response.data.data;
            historyList = $rootScope.history;

            printTable();
        }

        $("#coverLoad").hide();
    });


    $rootScope.clearHistory = function () {
        var r = confirm("Are you sure that you want to clear all the history data?");

        if (r == true) {
            var historyJSON = "x";
            var history = JSON.stringify(historyJSON);
            $http.post(syncHistoryUrl, history, {headers: {'Content-Type': 'text/plain;charset=utf-8'}});

            window.location.assign("history.html");

        }
    };
});

// ***************************************************************************************************
// ***************************************************************************************************
// TO PRINT SYNC HISTORY IN TABLE
// ***************************************************************************************************
// ***************************************************************************************************

function printTable() {
    var htmlStr = "";
    //var index = 0;

    historyList.forEach(function (hs) {
        var j = JSON.stringify(hs);
        // var isPreviousDataDeleted = hs.isPreviousDataDeleted ? "Deleted" : "Replaced";
        htmlStr = "<tr align='center'>";

        htmlStr += "<td>" + hs.date + "</td>";
        htmlStr += "<td>" + hs.instance + "</td>";
        htmlStr += "<td>" + hs.notification + "</td>";
        htmlStr += "<td  > <input style='align-self: center' type='button' align='center' class='btn btn-primary' onclick='stat(" + j + ")' value='Info' > </input> </td>";


        htmlStr += "</tr>";
        //index++;
        $("#hs").append(htmlStr);
    });

    $("#coverLoad").hide();
}

function filterHistory() {
    var ssyd = $("#ssyd").val();

    var htmlStr = "";
    var syDate = new Date(ssyd);
    syDate.setHours(0, 0, 0, 0);


    var hsIndexes = [];

    //-----------------------------------------------------------------------
    if (ssyd != "") {
        historyList.forEach(function (hs, index) {
            var syHs = new Date(hs.date.split("(")[0]);
            syHs.setHours(0, 0, 0, 0);
            /* var sdHs = new Date(hs.startDate);
             sdHs.setHours(0, 0, 0, 0);
             var edHs = new Date(hs.endDate);
             edHs.setHours(0, 0, 0, 0);*/

            if ((syHs.getTime() - syDate.getTime()) == 0)
                hsIndexes.push(index);
        });
    }
    
    $("#hs").html("");

    hsIndexes.forEach(function (ind) {
        var hs = historyList[ind];
        var j = JSON.stringify(hs);
        // var isPreviousDataDeleted = hs.isPreviousDataDeleted ? "Deleted" : "Replaced";
        htmlStr = "<tr align='center'>";

        htmlStr += "<td>" + hs.date + "</td>";
        htmlStr += "<td>" + hs.instance + "</td>";
        htmlStr += "<td>" + hs.notification + "</td>";
        htmlStr += "<td  > <input style='align-self: center' type='button' align='center' class='btn btn-primary' onclick='stat(" + j + ")' value='Info' > </input> </td>";


        htmlStr += "</tr>";
        //index++;
        $("#hs").append(htmlStr);
    });

}
//function for printing notifications

function stat(instance) {

    var index = 0;
    //var instance=JSON.parse(ins);

    $("#myModalLabel").html("Following Metadata Were affected by this");
    $('#share_list_popup').html(" ");
    for (var j = 0; j < instance.response.length; j++) {
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "DataElement") {


            $('#share_list_popup').append('<span align="left"><strong>' + 'DataElements' + '</strong></span><br>');


            for (var k = 0; k < instance.metaDataFilterd.dataElements.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.dataElements[k].name + '<br></span>');
                index++;
            }
            //$("#alertModal").modal("show");
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "DataElementCategoryOptionCombo") {

            $('#share_list_popup').append('<span align="left"><strong>' + ' Category Combos ' + '</strong></span><br> ');

            for (var k = 0; k < instance.metaDataFilterd.categoryOptionCombos.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.categoryOptionCombos[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "DataElementCategory") {

            $('#share_list_popup').append('<span align="left"><strong>' + ' Categories ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.categories.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.categories[k].name + '</span><br>');
                index++;
            }
        }
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "DataElementCategoryOption") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Category Options ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.categoryOptions.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.categoryOptions[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "OptionSet") {
            $('#share_list_popup').append('<span align="left"><strong>' + 'Option Sets ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.optionSets.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.optionSets[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "Option") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Options ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.options.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.options[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "Attribute") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Attributes ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.attributes.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.attributes[k].name + '</span><br>');
                index++;
            }
        }
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "OrganisationUnit") {

            $('#share_list_popup').append('<span align="left"><strong>' + ' Organisation Units ' + '</strong></span><br> ');

            for (var k = 0; k < instance.metaDataFilterd.organisationUnits.length; k++) {
                var count = 0;
                for (var x = 0; x < instance.selectedMetaData.organisationUnits.length; x++) {

                    if (instance.selectedMetaData.organisationUnits[x].id == instance.metaDataFilterd.organisationUnits[k].id) {
                        $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.organisationUnits[k].name + '(Selected)' + '</span><br>');
                        count++;
                        break;
                    }
                }
                if (count == 0) {
                    $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.organisationUnits[k].name + ' (Parent)' + '</span><br>');
                }
                index++;
            }
        }
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "OrganisationUnitGroup") {

            $('#share_list_popup').append('<span align="left"><strong>' + ' Organisation Unit Groups ' + '</strong></span><br> ');

            for (var k = 0; k < instance.metaDataFilterd.organisationUnitGroups.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.organisationUnits[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "Indicator") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Indicators ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.indicators.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.indicators[k].name + '</span><br>');
                index++;
            }
        }
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "ValidationRule") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Validation Rules ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.validationRules.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.validationRules[k].name + '</span><br>');
                index++;
            }
        }

        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "IndicatorType") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Indicator Types ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.indicatorTypes.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.indicatorTypes[k].name + '</span><br>');
                index++;
            }
        }
        if (instance.response[j].status == "SUCCESS" && instance.response[j].type == "IndicatorGroup") {
            $('#share_list_popup').append('<span align="left"><strong>' + ' Indicator Groups ' + '</strong></span><br>');

            for (var k = 0; k < instance.metaDataFilterd.indicatorGroups.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.indicatorGroups[k].name + '</span><br>');
                index++;
            }
        }

    }



    if (index == 0) {
        $('#share_list_popup').append('<span align="left"><strong>' + 'There were no Updations in Meta Data ' + '</strong></span><br>');

    }
    $("#alertModal").modal("show");

}

