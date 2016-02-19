/**

 This file has the controller and some other needed functions for handling the sync history

 Remember :
 -- There are some global variables declared in app.js. eg : apiUrl
 -- Form validation functions are coded in validations.js
 -- Saving and fetching basic settings functionality is coded in saveAndFetch.js

 **/
var notificationList = [];
app.controller('notificationController', function ($rootScope, $http) {
    $http.get(syncNotificationUrl).then(function (response) {
        if (response.data != "\"x\"" && response.data != "") {
            console.log(response.data.data);
            $rootScope.notifications = response.data.data;
            notificationList = $rootScope.notifications;

            printTable();
        }

        $("#coverLoad").hide();
    });

    $rootScope.clearNotification = function () {
        var r = confirm("Are you sure that you want to clear all the notifications?");

        if (r == true) {
            var notifyJSON = "x";
            var notify = JSON.stringify(notifyJSON);
            $http.post(syncNotificationUrl, notify, {headers: {'Content-Type': 'text/plain;charset=utf-8'}});

            window.location.assign("notifications.html");

        }
    };
});

// ***************************************************************************************************
// ***************************************************************************************************
// TO PRINT SYNC HISTORY IN TABLE
// ***************************************************************************************************
// ***************************************************************************************************
function stat(instance) {
    //console.log(instance);
    var index = 1;
    //var instance=JSON.parse(ins);
   // console.log(instance.response.length);
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

            $('#share_list_popup').append('<span align="left"><strong>' + ' Organisation Unit Groups Included in Selected Organisation Unit ' + '</strong></span><br> ');

            for (var k = 0; k < instance.metaDataFilterd.organisationUnitGroups.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.organisationUnitGroups[k].name + '</span><br>');
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

            for (var k = 0; k < instance.metaDataFilterd.indicatorTypes.length; k++) {

                $('#share_list_popup').append('<span align="left">' + instance.metaDataFilterd.indicatorGroups[k].name + '</span><br>');
                index++;
            }
        }
    }
    if (index == 1) {
        $('#share_list_popup').append('<span align="left"><strong>' + 'There were no Updations in Meta Data ' + '</strong></span><br>');

    }
    $("#alertModal").modal("show");
}

function printTable() {
    var htmlStr = "";
    var index = 0;

    notificationList.forEach(function (hs) {
        var j = JSON.stringify(hs);
        //console.log(j);
        htmlStr = "<tr align='center'>";
        htmlStr += "<td>" + hs.notification + "</td>";
        htmlStr += "<td>" + hs.date + "</td>";
        htmlStr += "<td>" + hs.instance + "</td>";

        htmlStr += "<td> <input style='align-self: center' type='button' align='center' class='btn btn-primary' onclick='stat(" + j + ")' value='Info' > </input> </td>";


        htmlStr += "</tr>";
        index++;
        $("#hs").append(htmlStr);

    });

    $("#coverLoad").hide();
}

