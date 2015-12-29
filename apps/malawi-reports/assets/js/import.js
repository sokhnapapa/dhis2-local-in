/**
 * Created by gaurav on 18/9/14.
 */

if (!jQuery) {
    throw new Error("Bootstrap requires jQuery");
}

var baseURL = new String();
var homeURL = new String();

var orgUnitCodeList = new Array();
var orgUnitNameToIdMapping = [];
var unMappedOrgUnitList = [];

var orgUnitIDList = new Array();

var commCareFacilityList = new Array();

var numOfFormsImported = 0;

var dataFormName = 'Complete a data collection';

var addOrgUnitToDHIS = function (orgUnitCode) {
    var jsonOrgUnitObject = '{'
        + '"name":"' + orgUnitCode + '",'
        + '"code": "' + orgUnitCode + '",'
        + '"shortName": "' + orgUnitCode + '",'
        + '"openingDate": "' + moment().format('YYYYMMDD') + '"'
        + '}';

    var dataElementURL = baseURL + "/organisationUnits";

    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        async: false,
        data: jsonOrgUnitObject,
        url: dataElementURL,
        success: function (response) {
            console.log('OrgUnit Import response: ' + response.status)
        },
        error: function (request, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};


var syncOrgUnits = function (formData) {

    $('#getFormAlertDiv').hide();

    //$('#loaderAlertDiv').show();

    //alert( "start");
    //document.getElementById("loaderAlertDiv").style.display = "block";

    //$('#loaderAlertContent').append('Please wait while the system is processing ......');

    //$('#loaderAlertContent').show();

    //document.getElementById("loaderAlertContent").style.display="block";

    //lockScreen();

    $('#waitAlertDiv').show();

    var orgUnitUpdateCount = 0;

    var totalFormCount = 0;

    fetchDHISOrgUnitList();

    // console.log('Pre-OU Code List: '+orgUnitCodeList);
    // console.log('Pre-OU ID List: '+orgUnitIDList);

    for (var item in formData.objects) {
        /** @namespace formData.objects */
        if (formData.objects[item].form['@name'] == dataFormName) {

            ++totalFormCount;
            var facility_name = formData.objects[item].form.name;
            if (_.indexOf(commCareFacilityList, facility_name, false) == -1) {
                commCareFacilityList.push(facility_name);
            }
        }
    }

    console.log('No. of total forms: ' + totalFormCount);

    for (var orgUnit in commCareFacilityList) {
        if (_.indexOf(orgUnitCodeList, commCareFacilityList[orgUnit], false) == -1) {
            ++orgUnitUpdateCount;
            addOrgUnitToDHIS(commCareFacilityList[orgUnit]);
        }
    }

    if (orgUnitUpdateCount > 0) {
        $('#alertContent').append(orgUnitUpdateCount + " new facilities found, please review after import.");
    }
    else {
        $('#alertContent').append("No new facilities updates found.");
    }

    $('#alertDiv').show();

    fetchDHISOrgUnitList();

    // console.log('Post-OU Code List: '+orgUnitCodeList);
    //  console.log('Post-OU ID List: '+orgUnitIDList);

    //$('#importAlertContent').append('Data import started. Please wait, this might take a while.');
    //$('#importAlertContent').show();


    readCommCareForm(formData);

    //unLockScreen();
    //document.getElementById("loaderAlertDiv").style.display = "none";

    //$('#loaderAlertContent').hide();

    //$('#loaderAlertDiv').hide();

    //alert( "end");

};


var readCommCareForm = function (formData) {

    //------CommCare form parsing code---------//

    console.log('No. of Facilities: ' + commCareFacilityList.length + "[" + commCareFacilityList + "]");


    for (var item in formData.objects) {
        var commCareValueMap = new Map();
        var received_on = new String();
        var orgUnitID = new String();

        /** @namespace formData.objects */
        if (formData.objects[item].form['@name'] == dataFormName) {

            var facility_name = formData.objects[item].form.name.toUpperCase();

            /** @namespace formData.objects[item].received_on */
            received_on = formData.objects[item].received_on;

            var periodString = moment(received_on).format('YYYY') + 'Q' + moment(received_on).format('Q');

            console.log('TEST[' + item + ']:' + periodString + "(" + facility_name + ")");



            // Importing filter for dimension orgunit
            if (orgUnitNameToIdMapping[facility_name] != undefined){
                orgUnitID = orgUnitNameToIdMapping[facility_name];
            }else {
                unMappedOrgUnitList.push(facility_name);
            }

            //-----------------Data-Element Maps-----------------//
            //-------------- /A_Outcomes/ ----------------//

            commCareValueMap.set('a0wRahNArQy', formData.objects[item].form.A_Outcomes.A1);
            commCareValueMap.set('NRl58Gu8FKc', formData.objects[item].form.A_Outcomes.A2a);
            commCareValueMap.set('NrbsE6ZQmwz', formData.objects[item].form.A_Outcomes.A2b);
            commCareValueMap.set('SVXPjmRgJpc', formData.objects[item].form.A_Outcomes.A3);
            commCareValueMap.set('gJENzcMLDCZ', formData.objects[item].form.A_Outcomes.A4);
            commCareValueMap.set('x7qbJmf6Rqk', formData.objects[item].form.A_Outcomes.A8);
            commCareValueMap.set('hY5fr0TqrP0', formData.objects[item].form.A_Outcomes.A8why);

            //-------------- .SOR_Ref. ----------------//
            commCareValueMap.set('mRq9TM0Nn74', formData.objects[item].form.SOR_Ref.R1_Ef_ref);
            commCareValueMap.set('knsKg8X6rgy', formData.objects[item].form.SOR_Ref.R2_Amb_avail);
            commCareValueMap.set('aDnjmkpVmv6', formData.objects[item].form.SOR_Ref.R3_why_no_amb);
            commCareValueMap.set('DGEr15OI2pK', formData.objects[item].form.SOR_Ref.R4_HowLongMC);
            commCareValueMap.set('iKrEXCEoUIg', formData.objects[item].form.SOR_Ref.HowLongOver2);


            //-------------- .SOR_Staff. ----------------//
            commCareValueMap.set('HKIxXBURg3y', formData.objects[item].form.SOR_Staff24.S3_routine_del);
            commCareValueMap.set('nIf71LESecw', formData.objects[item].form.SOR_Staff24.S4_man_VE);
            commCareValueMap.set('jqAcCNmnhfn', formData.objects[item].form.SOR_Staff24.S5_MVA);
            commCareValueMap.set('efv8cCcCuuR', formData.objects[item].form.SOR_Staff24.S6_placenta);
            commCareValueMap.set('JGttEVKdggX', formData.objects[item].form.SOR_Staff24.S8_C_sect_CEM);
            commCareValueMap.set('dV7r6o0lWRV', formData.objects[item].form.SOR_Staff24.S7_lab_tech_BEMLAB);
            commCareValueMap.set('njZxdZ7aoNP', formData.objects[item].form.SOR_Staff24.S9_cortico_CEM);
            commCareValueMap.set('njZxdZ7aoNP', formData.objects[item].form.SOR_Staff24.S10_anaesth_CEM);


            //-------------- .SOR_Facilites. ----------------//
            commCareValueMap.set('m3MRqg6HSts', formData.objects[item].form.SOR_Facilites.F10_electric);
            commCareValueMap.set('e9mcUnYE0eD', formData.objects[item].form.SOR_Facilites.F11_water);
            commCareValueMap.set('co8vlSqcfQn', formData.objects[item].form.SOR_Facilites.F11_No);
            commCareValueMap.set('dBv0UaXGMPk', formData.objects[item].form.SOR_Facilites.F12_autocl);
            commCareValueMap.set('cWDqpqnXW2u', formData.objects[item].form.SOR_Facilites.F12_No);
            commCareValueMap.set('YY9NQ4H5BZK', formData.objects[item].form.SOR_Facilites.F13_3Bucket);
            commCareValueMap.set('dZkUz5nr2qt', formData.objects[item].form.SOR_Facilites.F13_No);
            commCareValueMap.set('isRQVZDVzUK', formData.objects[item].form.SOR_Facilites.F14_pow_bb_CEM);
            commCareValueMap.set('kIRsYGUw3iu', formData.objects[item].form.SOR_Facilites.F14_No);


            //-------------- .Gp_SOR_Equip. ----------------//
            commCareValueMap.set('SorHSmURwEt', formData.objects[item].form.Gp_SOR_Equip.SF12);
            commCareValueMap.set('WWlcmvWpCd5', formData.objects[item].form.Gp_SOR_Equip.SFW12);
            commCareValueMap.set('xAsCbuz0coj', formData.objects[item].form.Gp_SOR_Equip.E1_soap);
            commCareValueMap.set('CfCZl5ZIUZl', formData.objects[item].form.Gp_SOR_Equip.E1_No);
            commCareValueMap.set('I6CZv5ABoag', formData.objects[item].form.Gp_SOR_Equip.E2_Syr_needle);
            commCareValueMap.set('i3Kj7OITPqh', formData.objects[item].form.Gp_SOR_Equip.E2_No);
            commCareValueMap.set('VAEQhxAgLNG', formData.objects[item].form.Gp_SOR_Equip.E2_Y);
            commCareValueMap.set('gDApCIlqtTL', formData.objects[item].form.Gp_SOR_Equip.E3_IV_Cann);
            commCareValueMap.set('x0iOM236zzK', formData.objects[item].form.Gp_SOR_Equip.E3_No);
            commCareValueMap.set('dEV5Zg0vDEW', formData.objects[item].form.Gp_SOR_Equip.E3_Yo);
            commCareValueMap.set('EsRglyZiGvv', formData.objects[item].form.Gp_SOR_Equip.E4_Sutures);
            commCareValueMap.set('Y9WP5HO5TXk', formData.objects[item].form.Gp_SOR_Equip.E4_No);
            commCareValueMap.set('UOBJrc5ywdJ', formData.objects[item].form.Gp_SOR_Equip.E4_Y);
            commCareValueMap.set('RQOwidR9d8S', formData.objects[item].form.Gp_SOR_Equip.E5_glove);
            commCareValueMap.set('c9rRsOBoazF', formData.objects[item].form.Gp_SOR_Equip.E5_No);
            commCareValueMap.set('EBoi9gDWrDl', formData.objects[item].form.Gp_SOR_Equip.E5_Y);
            commCareValueMap.set('IjUasPJ8wez', formData.objects[item].form.Gp_SOR_Equip.E6_dressing);
            commCareValueMap.set('OI7DzLkXK8k', formData.objects[item].form.Gp_SOR_Equip.E6_No);
            commCareValueMap.set('fL9duxTh5dA', formData.objects[item].form.Gp_SOR_Equip.E6_Y);
            commCareValueMap.set('nmBqm5bbfMV', formData.objects[item].form.Gp_SOR_Equip.E7_Del_kits);
            commCareValueMap.set('AwM9ex6Iij7', formData.objects[item].form.Gp_SOR_Equip.E7_No);
            commCareValueMap.set('T4iXombKry4', formData.objects[item].form.Gp_SOR_Equip.E7_Y);
            commCareValueMap.set('mih2AVAcBBo', formData.objects[item].form.Gp_SOR_Equip.E8_MVA);
            commCareValueMap.set('CJFs6RvFSJF', formData.objects[item].form.Gp_SOR_Equip.E8_No);
            commCareValueMap.set('i1ZMnHfFdQA', formData.objects[item].form.Gp_SOR_Equip.E8_Y);
            commCareValueMap.set('WtqpkziFS1D', formData.objects[item].form.Gp_SOR_Equip.E10_MV_extract);
            commCareValueMap.set('iHVMcashXSV', formData.objects[item].form.Gp_SOR_Equip.E10_No);
            commCareValueMap.set('zOUcMux6GSD', formData.objects[item].form.Gp_SOR_Equip.E10_Y);
            commCareValueMap.set('s54iuyLn3vf', formData.objects[item].form.Gp_SOR_Equip.E11_Chlorh);
            commCareValueMap.set('VSntLL8LRdc', formData.objects[item].form.Gp_SOR_Equip.E11_No);
            commCareValueMap.set('fzAAH9EXvAi', formData.objects[item].form.Gp_SOR_Equip.E11_Y);
            commCareValueMap.set('oZvAhbVf2dU', formData.objects[item].form.Gp_SOR_Equip.E12_Chlorine);
            commCareValueMap.set('y3n5ozjm1Z1', formData.objects[item].form.Gp_SOR_Equip.E12_No);
            commCareValueMap.set('l0hNLzU82wZ', formData.objects[item].form.Gp_SOR_Equip.E12_Y);
            commCareValueMap.set('x5VUI1DRBSq', formData.objects[item].form.Gp_SOR_Equip.E13_Ambu_bag);
            commCareValueMap.set('fEqgr9voj97', formData.objects[item].form.Gp_SOR_Equip.E13_No);
            commCareValueMap.set('S95ozuqQGNW', formData.objects[item].form.Gp_SOR_Equip.E13_Y);


            //-------------- .Gp_SOR_Drug. ----------------//
            commCareValueMap.set('QuZXwUBPUOA', formData.objects[item].form.Gp_SOR_Drugs.D14_AmpiOrBen);
            commCareValueMap.set('XXMysY7Frq2', formData.objects[item].form.Gp_SOR_Drugs.D14_no);
            commCareValueMap.set('Q8Tm5LUqDHE', formData.objects[item].form.Gp_SOR_Drugs.D14_y);
            commCareValueMap.set('QGc475YZ804', formData.objects[item].form.Gp_SOR_Drugs.D15_Genatmy);
            commCareValueMap.set('lk45d2KxGiZ', formData.objects[item].form.Gp_SOR_Drugs.D15_no);
            commCareValueMap.set('WSplPaKCG39', formData.objects[item].form.Gp_SOR_Drugs.D15_y);
            commCareValueMap.set('N2fu8j6DlRC', formData.objects[item].form.Gp_SOR_Drugs.D16_MagSul);
            commCareValueMap.set('mfNMPekV0tH', formData.objects[item].form.Gp_SOR_Drugs.D16_no);
            commCareValueMap.set('FiKzD6CxdxK', formData.objects[item].form.Gp_SOR_Drugs.D16_y);
            commCareValueMap.set('Xhq5Zh7DYsM', formData.objects[item].form.Gp_SOR_Drugs.D17_CalClu_CEMONC);
            commCareValueMap.set('fzYsZPCoaNR', formData.objects[item].form.Gp_SOR_Drugs.D17_No);
            commCareValueMap.set('AGEPgwftQMN', formData.objects[item].form.Gp_SOR_Drugs.D17_y);
            commCareValueMap.set('Nq4o0lZkrwP', formData.objects[item].form.Gp_SOR_Drugs.D18_Oxyto);
            commCareValueMap.set('Mv5lhpYjpSc', formData.objects[item].form.Gp_SOR_Drugs.D18_No);
            commCareValueMap.set('xrpHR7LnKIq', formData.objects[item].form.Gp_SOR_Drugs.D18_y);
            commCareValueMap.set('qEpBEp7mpiV', formData.objects[item].form.Gp_SOR_Drugs.D19_Dex_CEMONC);
            commCareValueMap.set('Md6mj2zPiDE', formData.objects[item].form.Gp_SOR_Drugs.D19_No);
            commCareValueMap.set('JvSvs3JZZt5', formData.objects[item].form.Gp_SOR_Drugs.D19_y);


            //-------------- .Core_SFs. ----------------//
            commCareValueMap.set('xTDwbcoeemr', formData.objects[item].form.CORE_SFs.SF1);
            commCareValueMap.set('U3nmloHrLXp', formData.objects[item].form.CORE_SFs.SF2);
            commCareValueMap.set('HdpZrZS64c7', formData.objects[item].form.CORE_SFs.SFW1and2);
            commCareValueMap.set('JqRCm16AAKC', formData.objects[item].form.CORE_SFs.SF3);
            commCareValueMap.set('m61hWKXhsXi', formData.objects[item].form.CORE_SFs.SFW3);
            commCareValueMap.set('cuJbRN7LewZ', formData.objects[item].form.CORE_SFs.SF4);
            commCareValueMap.set('QnlEVvrWnyE', formData.objects[item].form.CORE_SFs.SFW4);
            commCareValueMap.set('y15oRHbyuY2', formData.objects[item].form.CORE_SFs.SF5);
            commCareValueMap.set('yWT4LsHxr7F', formData.objects[item].form.CORE_SFs.SFW5);
            commCareValueMap.set('MRvsch0EqS2', formData.objects[item].form.CORE_SFs.SF6);
            commCareValueMap.set('rFLaE052uXf', formData.objects[item].form.CORE_SFs.SFW6);
            commCareValueMap.set('TXVjebHOF4S', formData.objects[item].form.CORE_SFs.SF7);
            commCareValueMap.set('CCOsX17nGwh', formData.objects[item].form.CORE_SFs.SFW7);
            commCareValueMap.set('Tt0grulSXx8', formData.objects[item].form.CORE_SFs.SF8);
            commCareValueMap.set('Pnt4wvyyD5t', formData.objects[item].form.CORE_SFs.SFW8);


            //-------------- .Cemoc_SFs. ----------------//
            //commCareValueMap.set('UtZkebBeoxE', formData.objects[item].form.CEMONC_SFs.SF9);
            //commCareValueMap.set('ebGuSMzsgps', formData.objects[item].form.CEMONC_SFs.SFW9);
            //commCareValueMap.set('LNFBlNBlwzU', formData.objects[item].form.CEMONC_SFs.SF10);
            //commCareValueMap.set('rsRjZlKvGjN', formData.objects[item].form.CEMONC_SFs.SFW10);
            //commCareValueMap.set('z7fXWfwbdPz', formData.objects[item].form.CEMONC_SFs.SF11);
            //commCareValueMap.set('DzgWB4CmHWs', formData.objects[item].form.CEMONC_SFs.SFW11);
            //commCareValueMap.set('pkEUn6t09TD', formData.objects[item].form.OtherIssues);


            //-------------- .Gp_Admin. ----------------//
            commCareValueMap.set('fINVcjaLyU6', formData.objects[item].form.Gp_Admin.IntID);
            commCareValueMap.set('gcVIQoP2w5C', formData.objects[item].form.Gp_Admin.RoundNo);
            commCareValueMap.set('u7KcJeM2UkG', formData.objects[item].form.SOR_Facilites.F10_No);
            commCareValueMap.set('z65azng8GwE', formData.objects[item].form.Gp_SOR_Equip.E1_Y);


            //-------------enablers-------------------------------------//

            commCareValueMap.set('cCNfEZIsCVZ',formData.objects[item].form["watsan-RAYG"]);
            commCareValueMap.set('VUtYttuzQnR',formData.objects[item].form["elec-RAYG"]);
            commCareValueMap.set('RhLi2Guvkos',formData.objects[item].form["ref-RAYG"]);
            commCareValueMap.set('Hyx6wOvzg2K',formData.objects[item].form["equip-RAYG"]);
            commCareValueMap.set('zloEIVyK9Te',formData.objects[item].form["lab-RAYG"]);
            commCareValueMap.set('mL8f4p965DC',formData.objects[item].form["staff-RAYG"]);
            commCareValueMap.set('bFQ0H0rbzT6',formData.objects[item].form["drugs-RAYG"]);

            /*
            commCareValueMap.set('TU7YJCglJj4',formData.objects[item].form["watsan-RAYG"]);
            commCareValueMap.set('Z5reqVtbpLE',formData.objects[item].form["elec-RAYG"]);
            commCareValueMap.set('ANK88sqN1lp',formData.objects[item].form["ref-RAYG"]);
            commCareValueMap.set('hZlgAu2zTuJ',formData.objects[item].form["equip-RAYG"]);
            commCareValueMap.set('qRxRC6G8KXa',formData.objects[item].form["lab-RAYG"]);
            commCareValueMap.set('mZEdXsMl3Qz',formData.objects[item].form["staff-RAYG"]);
            commCareValueMap.set('POX0wNKk1sS',formData.objects[item].form["drugs-RAYG"]);
            */
            //---------------------------------------------------------//

            var dataValueList = "{"
                + '"dataValues": [';

            var count = 0;

            commCareValueMap.forEach(function (value, key) {
                ++count;
                if( value != undefined){
                    if (key != undefined) {

                        if (key.indexOf('.') != -1) {
                            var deCateComboId = key.split('.');
                            var deId = deCateComboId[0];
                            var categoryComboId = deCateComboId[1];
                            dataValueList = dataValueList.concat('{"dataElement": "' + deId + '", "categoryOptionCombo": "' + categoryComboId + '", "period": "' + periodString + '", ' + '"orgUnit": "' + orgUnitID + '" ,"value": "' + value + '"}');
                        }
                        else {
                            dataValueList = dataValueList.concat('{"dataElement": "' + key + '", "period": "' + periodString + '", ' + '"orgUnit": "' + orgUnitID + '" ,"value": "' + value + '"}');
                        }
                        console.log('c:s = '+count+":"+commCareValueMap.size);
                        if (count < commCareValueMap.size) {
                            dataValueList = dataValueList.concat(",");
                        }
                    }
                }

            }, commCareValueMap);

            dataValueList = dataValueList.concat("]"
                + "}"
            );

            console.log("DVS: " + dataValueList);

            var dataValueURL = baseURL + "/dataValueSets";

            $.ajax({
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                async: false,
                data: dataValueList,
                url: dataValueURL,
                success: function (response) {
                    console.log('Data-value Import response: ' + response.status);
                    ++numOfFormsImported;
                },
                error: function (request, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }
    }

    if (unMappedOrgUnitList.length > 0) {
        console.log("Following unmapped facilities found:");
        for (var i=0; i < unMappedOrgUnitList.length; i++){
        console.log(unMappedOrgUnitList[i]);
        }
    }


    $('#importAlertDiv').hide();
    $('#importAlertContent').empty();
    $('#importAlertContent').append('Data import complete, total ' + numOfFormsImported + ' forms imported. Thanks for your patience.');
    $('#importAlertDiv').show();

    //$('#testLoader').hide();

    HideProgress();

    //------------------------------------------------------------------//

};


var fetchDHISOrgUnitList = function () {

    var dhisOrgUnitURL = baseURL + "/organisationUnits.jsonp?paging=false&fields=code,id,name";

    $.ajax({
        type: "GET",
        dataType: "jsonp",
        contentType: "application/json",
        async: false,
        url: dhisOrgUnitURL,
        success: function (data) {

            console.log(data);

            var orgUnitList = data["organisationUnits"];

            for (var item in orgUnitList) {

                orgUnitNameToIdMapping[orgUnitList[item].name.toUpperCase()] = orgUnitList[item].id;

                if (orgUnitList[item].name != null) {
                    orgUnitCodeList.push(String(orgUnitList[item].name));
                }
                else {
                    orgUnitCodeList.push("NULL");
                }
              //  orgUnitIDList.push(String(orgUnitList[item].id));
            }
        }
    });

};

var getCommCareFormData = function (commCareFormURL, commCareUserID, commCarePassword, startDate, endDate) {

    $('#importAlertDiv').hide();
    $('#importAlertContent').empty();
    $('#waitAlertDiv').hide();
    $('#alertDiv').hide();

    //$('#testLoader').show();

    //ShowProgress();

    commCareFormURL = commCareFormURL + "&" + 'received_on_start=' + startDate + "&" + 'received_on_end=' + endDate;

    $.ajax({
        type: "GET",
        url: commCareFormURL,
        async: false,
        dataType: "json",
        contentType: "application/json",
        crossDomain: true,
        headers: {
            "Authorization": "Basic " + btoa(commCareUserID + ":" + commCarePassword)
        },
        success: function (jsonData) {

            console.log(jsonData);

            syncOrgUnits(jsonData);

        },
        error: function (request, textStatus, errorThrown) {
            console.log(request.responseText);
            console.log(textStatus);
            console.log(errorThrown);
        }

    });
};

$(document).ready(function () {

    var startDate = '';
    var endDate = '';
	
	//var commCareFormTanzaniaURL = https://www.commcarehq.org/a/tanzania/api/v0.4/form/?limit=1000
	
    var commCareFormURL = "https://www.commcarehq.org/a/malawi/api/v0.4/form/?limit=1000"; //?received_on_start="+startDate+"received_on_end="+endDate;
    var commCareUserID = "harsh.atal@gmail.com";
    var commCarePassword = "Hisp123";


    $('#startDate').datepicker({
        autoclose: true,
        todayHighlight: true
    });

    $('#endDate').datepicker({
        autoclose: true,
        todayHighlight: true
    });

    $("#endDate").datepicker("setDate", new Date());

    /*
    $.ajaxSetup({
        async: false
    });
    */

    jQuery.getJSON("manifest.webapp", function (json) {

        homeURL = json.activities.dhis.href;

        baseURL = json.activities.dhis.href + "/api";
        console.log('base API URL ' + baseURL);
        console.log('base Home URL ' + homeURL);
    });

    /*
    $.ajaxSetup({
        async: true
    });
    */

    $('#startDate').datepicker();
    $('#endDate').datepicker();

    $('#btn-import').click(function () {

        if ($('#startDate').val() != "" && $('#endDate').val() != "") {

            var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
            var todayDate = new Date(moment(new Date()).format('YYYY-MM-DD'));
            var selStartDate = new Date(moment($('#startDate').val()).format('YYYY-MM-DD'));
            var selEndDate = new Date(moment($('#endDate').val()).format('YYYY-MM-DD'));

            //alert(firstDate.getTime() + " -- " + secondDate.getTime() );

            //alert(firstDate.getTime() - secondDate.getTime() );

            var firstDiffDays = Math.abs((selStartDate.getTime() - todayDate.getTime())/(oneDay));
            var secondDiffDays = Math.abs((selEndDate.getTime() - todayDate.getTime())/(oneDay));

            //alert("date diff -- " + diffDays );

            if( selStartDate > todayDate )
            {
                //alert(" start date greater than today date" );
                $('#selectPeriodAlert').hide();
                $('#selectEndDateAlert').show();
            }

            else if( selEndDate > todayDate )
            {
                //alert(" end date greater than today date" );
                $('#selectPeriodAlert').hide();
                $('#selectEndDateAlert').show();
            }

            else
            {
                console.log('SD: ' + moment($('#startDate').val()).format('YYYY-MM-DD') + " to " + 'ED: ' + moment($('#endDate').val()).format('YYYY-MM-DD'));
                $('#selectEndDateAlert').hide();
                $('#selectPeriodAlert').hide();

                //$('#loaderAlertDiv').show();

                //lockScreen();
                ShowProgress();
                getCommCareFormData(commCareFormURL, commCareUserID, commCarePassword, moment($('#startDate').val()).format('YYYY-MM-DD'), moment($('#endDate').val()).format('YYYY-MM-DD'));
                //unLockScreen();

                //$('#loaderAlertDiv').hide();
            }

        }
        else {
            $('#selectPeriodAlert').show();
            $('#selectEndDateAlert').hide();
        }
    });

});


/**
 * Lock screen by mask *
 */
/*
 function lockScreen()
 {
 jQuery.blockUI({ message: "Please wait while the system is processing ......" , css: {
 border: 'none',
 padding: '15px',
 backgroundColor: '#000',
 '-webkit-border-radius': '10px',
 '-moz-border-radius': '10px',
 opacity: .5,
 color: '#fff'
 } });
 }
 */

/**
 * unClock screen *
 */
/*
 function unLockScreen()
 {
 //alert( "inside Un lock");
 jQuery.unblockUI();
 }
 */


//
function showLoaderDiv()
{
    document.getElementById("loaderAlertDiv").style.display = "block";
}

function hideLoaderDiv()
{
    document.getElementById("loaderAlertDiv").style.display = "none";
}


function HideProgress() {
    $("#testLoader").css({ display: "none" });
    //$("#testLoader").css({ display: "inline" });
}

function ShowProgress() {
    if($('#testLoader').css('display') == "none"){
        //$("#testLoader").show();
        $("#testLoader").css({ display: "inline" });
    }
}


