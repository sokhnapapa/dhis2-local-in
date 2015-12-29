/**
 * Created by gaurav on 18/9/14.
 */

if (!jQuery) {
    throw new Error("Bootstrap requires jQuery");
}

var baseURL = new String();
var homeURL = new String();

var orgUnitCodeList = new Array();

var orgUnitIDList = new Array();
var orgUnitNameToIdMapping = []
var unMappedOrgUnitList = [];

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

            var facility_name = formData.objects[item].form.name;

            /** @namespace formData.objects[item].received_on */
            received_on = formData.objects[item].received_on;

            var periodString = moment(received_on).format('YYYY') + 'Q' + moment(received_on).format('Q');

            console.log('TEST[' + item + ']:' + periodString + "(" + facility_name + ")");


            if (_.indexOf(orgUnitCodeList, facility_name, false) != -1) {
                orgUnitID = orgUnitIDList[_.indexOf(orgUnitCodeList, facility_name, false)];
            }
            // Importing filter for dimension orgunit
            if (orgUnitNameToIdMapping[facility_name] != undefined){
                orgUnitID = orgUnitNameToIdMapping[facility_name];
            }else {
                unMappedOrgUnitList.push(facility_name);
            }

            //-----------------Data-Element Maps-----------------//

            //-------------- /A_Outcomes/ ----------------//
            commCareValueMap.set('biKxW8WA1D3', formData.objects[item].form.A_Outcomes.A1);
            commCareValueMap.set('jTmd9jzFyW5', formData.objects[item].form.A_Outcomes.A2a);
            commCareValueMap.set('NIQT5QcBzqn', formData.objects[item].form.A_Outcomes.A2b);
            commCareValueMap.set('TDDHinL6mZR', formData.objects[item].form.A_Outcomes.A3);
            commCareValueMap.set('y6VmF33P1nm', formData.objects[item].form.A_Outcomes.A4a);
            commCareValueMap.set('EQYHUK5OJDg', formData.objects[item].form.A_Outcomes.A4b);
            commCareValueMap.set('aDAY6bmXgDJ', formData.objects[item].form.A_Outcomes.A4c);
            commCareValueMap.set('Vm7IhtFM65k', formData.objects[item].form.A_Outcomes.A4d);
            commCareValueMap.set('dqEAOjPM3eb', formData.objects[item].form.A_Outcomes.A4e);
            commCareValueMap.set('onbtuMgGhWg', formData.objects[item].form.A_Outcomes.A4f);
            commCareValueMap.set('j41dDsreSCj', formData.objects[item].form.A_Outcomes.A4g);
            commCareValueMap.set('ZLZLi7VldUs', formData.objects[item].form.A_Outcomes.A4h);
            commCareValueMap.set('IG1W8rfbkXU', formData.objects[item].form.A_Outcomes.A5);
            commCareValueMap.set('OFgpNriUfWd', formData.objects[item].form.A_Outcomes.A5a);
            commCareValueMap.set('cZEqaENxfXM', formData.objects[item].form.A_Outcomes.A5b);
            commCareValueMap.set('hkRXXeMod1i', formData.objects[item].form.A_Outcomes.A5c);
            commCareValueMap.set('lurVmm6Nml7', formData.objects[item].form.A_Outcomes.A5d);
            commCareValueMap.set('pFgBNmvZHaf', formData.objects[item].form.A_Outcomes.A5e);
            commCareValueMap.set('e0GKdjL1yoS', formData.objects[item].form.A_Outcomes.A5f);
            commCareValueMap.set('KJtRfwcXCX4', formData.objects[item].form.A_Outcomes.A5g);
            commCareValueMap.set('VXEOt62lFYu', formData.objects[item].form.A_Outcomes.A5h);
            commCareValueMap.set('LrOiOctOsj3', formData.objects[item].form.A_Outcomes.A5i);
            commCareValueMap.set('VyloijhlERe', formData.objects[item].form.A_Outcomes["A5i-why"]);
            commCareValueMap.set('TmkRWjDcpen', formData.objects[item].form.A_Outcomes.A8);


            //-------------- /SOR_Ref/ ----------------//
            commCareValueMap.set('stLohFkjmCd', formData.objects[item].form.SOR_Ref.R1_Amb_avail);
            commCareValueMap.set('TX9lyRBcl5H', formData.objects[item].form.SOR_Ref.R3_why_no_amb);
            commCareValueMap.set('UcwXPKb183v', formData.objects[item].form.SOR_Ref.R4_HowLongMC);

            //-------------- /SOR_Staff/ ----------------//
            commCareValueMap.set('leqZ1m2ViDS', formData.objects[item].form.SOR_Staff24.S3_routine_del);
            commCareValueMap.set('EJrcGszzaEf', formData.objects[item].form.SOR_Staff24.S4_asst_del);
            commCareValueMap.set('UacNegc1IXv', formData.objects[item].form.SOR_Staff24.S5_MVA);
            commCareValueMap.set('qQIEkYvwoFm', formData.objects[item].form.SOR_Staff24.S6_placenta);
            commCareValueMap.set('i46U8rtMO5N', formData.objects[item].form.SOR_Staff24.S7_C_sect_CEM);
            commCareValueMap.set('aRXLPhd8RN5', formData.objects[item].form.SOR_Staff24.S8_anaesth_CEM);
            commCareValueMap.set('blTyxYoBPxD', formData.objects[item].form.SOR_Staff24.S9_lab_tech);
            commCareValueMap.set('uoSRDTT3Lqr', formData.objects[item].form.SOR_Staff24.S10_haem_test_BEM);

            //-------------- /SOR_Facilites/ ----------------//
            commCareValueMap.set('yDSkxJtIqq0', formData.objects[item].form.SOR_Facilites.F11_electric);
            commCareValueMap.set('XKCmz14bo9i', formData.objects[item].form.SOR_Facilites.F10_No);
            commCareValueMap.set('einE24QmGiY', formData.objects[item].form.SOR_Facilites.F12_water);
            commCareValueMap.set('kxnDioSd7J7', formData.objects[item].form.SOR_Facilites["F12a_V - bucket"]);
            commCareValueMap.set('YGAo3CEj7Kr', formData.objects[item].form.SOR_Facilites.F12b_why_no_VB);
            commCareValueMap.set('jWCsCi6rp2f', formData.objects[item].form.SOR_Facilites.F13_autocl);
            commCareValueMap.set('f69vAPxXI2l', formData.objects[item].form.SOR_Facilites.F13_No);
            commCareValueMap.set('ggWbzseGIzW', formData.objects[item].form.SOR_Facilites.F14_4Bucket);
            commCareValueMap.set('a5tWpBOhi4e', formData.objects[item].form.SOR_Facilites.F14_No);
            commCareValueMap.set('gtPuEMTsU5u', formData.objects[item].form.SOR_Facilites.BB1_blood_CEM);
            commCareValueMap.set('mPUOxp0xrop', formData.objects[item].form.SOR_Facilites.BB2_power_CEM);

            //-------------- /Gp_SOR_Equip/ ----------------//
            commCareValueMap.set('ZUiXDWcIXVt', formData.objects[item].form.Gp_SOR_Equip.E1_soap);
            commCareValueMap.set('RcYLOHLqRmy', formData.objects[item].form.Gp_SOR_Equip.E1_soap_en);
            commCareValueMap.set('tMupfzEkpth', formData.objects[item].form.Gp_SOR_Equip.E2_Syr_needle);
            commCareValueMap.set('IX214RrZW0r', formData.objects[item].form.Gp_SOR_Equip.E2_Syr_needle_en);
            commCareValueMap.set('QYZgRt0cvgq', formData.objects[item].form.Gp_SOR_Equip.E3_IV_Cann_en);
            commCareValueMap.set('tn4Tb0xNWAL', formData.objects[item].form.Gp_SOR_Equip.E4_Sutures);
            commCareValueMap.set('slVEpwZnVhW', formData.objects[item].form.Gp_SOR_Equip.E4_Sutures_en);
            commCareValueMap.set('bXLfxEJe6rF', formData.objects[item].form.Gp_SOR_Equip.E5_glove);
            commCareValueMap.set('ftLkk8uVyhf', formData.objects[item].form.Gp_SOR_Equip.E5_glove_en);

            commCareValueMap.set('OJ9sBSKoAZz', formData.objects[item].form.Gp_SOR_Equip.E6_el_glove);
            commCareValueMap.set('Bge78OFEuun', formData.objects[item].form.Gp_SOR_Equip.E6_el_glove_en);
            commCareValueMap.set('Q1NCGx9X9Yo', formData.objects[item].form.Gp_SOR_Equip.E7_dressing);
            commCareValueMap.set('PJi6RyE7K4X', formData.objects[item].form.Gp_SOR_Equip.E7_dressing_en);
            commCareValueMap.set('eAej2dovMsU', formData.objects[item].form.Gp_SOR_Equip.E8_Del_kits);
            commCareValueMap.set('gkkiWZ6yKI5', formData.objects[item].form.Gp_SOR_Equip.E9_MVA);
            commCareValueMap.set('rZt5LK2v53g', formData.objects[item].form.Gp_SOR_Equip.E10_MV_extract);
            commCareValueMap.set('IfO4rRvy2TW', formData.objects[item].form.Gp_SOR_Equip.E11_Chlorh);
            commCareValueMap.set('H2nIqyYDyN0', formData.objects[item].form.Gp_SOR_Equip.E11_Chlorh_en);

            commCareValueMap.set('cP7fr5pWIFS', formData.objects[item].form.Gp_SOR_Equip.E3_IV_Cann);
            commCareValueMap.set('pX4XBcBSfU2', formData.objects[item].form.Gp_SOR_Equip.E12_Chlorine);
            commCareValueMap.set('HkAdLohwpX7', formData.objects[item].form.Gp_SOR_Equip.E12_Chlorine_en);
            commCareValueMap.set('Gkr0qySoKF0', formData.objects[item].form.Gp_SOR_Equip.E13_Ambu_bag);
            commCareValueMap.set('HKEeFwbVYmh', formData.objects[item].form.Gp_SOR_Equip.SupplyComments);


            //-------------- /Gp_SOR_Drug/ ----------------//
            commCareValueMap.set('LxMmoqvqebp', formData.objects[item].form.Gp_SOR_Drugs.D14_Ampi);
            commCareValueMap.set('OvsHYKNifTK', formData.objects[item].form.Gp_SOR_Drugs.D14_Ampi_en);
            commCareValueMap.set('kR12FeXEu2n', formData.objects[item].form.Gp_SOR_Drugs.D15_Genatmy);
            commCareValueMap.set('P3fu24rTDqV', formData.objects[item].form.Gp_SOR_Drugs.D15_Genatmy_en);
            commCareValueMap.set('s3KbXjISLoN', formData.objects[item].form.Gp_SOR_Drugs.D16_MagSul);
            commCareValueMap.set('IwpQMdYBCEJ', formData.objects[item].form.Gp_SOR_Drugs.D16_MagSul_en);
            commCareValueMap.set('gcO8OWTCScW', formData.objects[item].form.Gp_SOR_Drugs.D17_CalClu);
            commCareValueMap.set('R30GaDwrg0j', formData.objects[item].form.Gp_SOR_Drugs.D17_CalClu_en);
            commCareValueMap.set('ArojSutoKCI', formData.objects[item].form.Gp_SOR_Drugs.D19_Oxyto);

            commCareValueMap.set('pB03Ol8c8PE', formData.objects[item].form.Gp_SOR_Drugs.D19_Oxyto_en);
            commCareValueMap.set('vssAhOiqOow', formData.objects[item].form.Gp_SOR_Drugs.D20_Misop_CEMONC);
            commCareValueMap.set('z31Xbj23A9k', formData.objects[item].form.Gp_SOR_Drugs.D20_Misop_CEMONC_en);
            commCareValueMap.set('V3LGkIxqgUk', formData.objects[item].form.Gp_SOR_Drugs.DrugsComments);
            commCareValueMap.set('eAej2dovMsU', formData.objects[item].form.Gp_SOR_Equip.E8_Del_kits);


            //-------------- /Core_SFs/ ----------------//
            commCareValueMap.set('WnNauOrut2Z', formData.objects[item].form.CORE_SFs.SF1);
            commCareValueMap.set('tijzd3cGV0V', formData.objects[item].form.CORE_SFs.SF2);
            commCareValueMap.set('CbHVHToA8oM', formData.objects[item].form.CORE_SFs.SFW1and2);
            commCareValueMap.set('HHdMebQ6kb7', formData.objects[item].form.CORE_SFs.SF3);
            commCareValueMap.set('OhbiX4Kw975', formData.objects[item].form.CORE_SFs.SFW3);
            commCareValueMap.set('Ud52cFxjq2f', formData.objects[item].form.CORE_SFs.SF4);
            commCareValueMap.set('lbTGekn354w', formData.objects[item].form.CORE_SFs.SF5);

            commCareValueMap.set('fHI85AvrLxU', formData.objects[item].form.CORE_SFs.SFW5);
            commCareValueMap.set('nCULAvZxL2I', formData.objects[item].form.CORE_SFs.SFW6);
            commCareValueMap.set('pACGZ5vnCiw', formData.objects[item].form.CORE_SFs.SF7);
            commCareValueMap.set('pyOkIw7Gpbb', formData.objects[item].form.CORE_SFs.SFW7);
            commCareValueMap.set('MzR5d7ELTb0', formData.objects[item].form.CORE_SFs.SF8);
            commCareValueMap.set('MKXSJL3bMaZ', formData.objects[item].form.CORE_SFs.SFW8);

            commCareValueMap.set('FuxRnRYx3Fj', formData.objects[item].form.CORE_SFs.SF6);


            //-------------- /Cemoc_SFs/ ----------------//
            if (formData.objects[item].form.CEMONC_SFs != undefined)
            {
                commCareValueMap.set('ycurw4VCRCs', formData.objects[item].form.CEMONC_SFs.SF9);
                commCareValueMap.set('qpn4WKcqAph', formData.objects[item].form.CEMONC_SFs.SFW9);
                commCareValueMap.set('ayIafCEj8Ed', formData.objects[item].form.CEMONC_SFs.SF10);
                commCareValueMap.set('jGhFmt0Pg99', formData.objects[item].form.CEMONC_SFs.SFW10);
                commCareValueMap.set('klMhgnsfdNW', formData.objects[item].form.OtherIssues);
            }

            //-------------- /Gp_Admin/ ----------------//
            commCareValueMap.set('mSI1Mb2ZQS2', formData.objects[item].form.Gp_Admin.IntID);
            commCareValueMap.set('hxkDLuqFS3p', formData.objects[item].form.Gp_Admin.IntType);
            commCareValueMap.set('C7QfhNpEk9F', formData.objects[item].form.Gp_Admin.RoundNo);

            //---------------------------------------------------//

            //-------------enablers-------------------------------------//

            commCareValueMap.set('TU7YJCglJj4',formData.objects[item].form["watsan-RAYG"]);
            commCareValueMap.set('Z5reqVtbpLE',formData.objects[item].form["elec-RAYG"]);
            commCareValueMap.set('ANK88sqN1lp',formData.objects[item].form["ref-RAYG"]);
            commCareValueMap.set('hZlgAu2zTuJ',formData.objects[item].form["equip-RAYG"]);
            commCareValueMap.set('qRxRC6G8KXa',formData.objects[item].form["lab-RAYG"]);
            commCareValueMap.set('mZEdXsMl3Qz',formData.objects[item].form["staff-RAYG"]);
            commCareValueMap.set('POX0wNKk1sS',formData.objects[item].form["drugs-RAYG"]);


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

    $('#importAlertDiv').hide();
    $('#importAlertContent').empty();
    $('#importAlertContent').append('Data import complete, total ' + numOfFormsImported + ' forms imported. Thanks for your patience.');
    $('#importAlertDiv').show();

    $('#testLoader').hide();
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

                if (orgUnitList[item].code != null) {
                    orgUnitCodeList.push(String(orgUnitList[item].code));
                }
                else {
                    orgUnitCodeList.push("NULL");
                }
                orgUnitIDList.push(String(orgUnitList[item].id));
            }
        }
    });

};

var getCommCareFormData = function (commCareFormURL, commCareUserID, commCarePassword, startDate, endDate) {

    $('#importAlertDiv').hide();
    $('#importAlertContent').empty();
    $('#waitAlertDiv').hide();
    $('#alertDiv').hide();

    $('#testLoader').show();

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

    var commCareFormURL = "https://www.commcarehq.org/a/sierraleonereal/api/v0.4/form/?limit=1000"; //?received_on_start="+startDate+"received_on_end="+endDate;
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

    $.ajaxSetup({
        async: false
    });

    jQuery.getJSON("manifest.webapp", function (json) {

        homeURL = json.activities.dhis.href;

        baseURL = json.activities.dhis.href + "/api";
        console.log('base API URL ' + baseURL);
        console.log('base Home URL ' + homeURL);
    });

    $.ajaxSetup({
        async: true
    });

    $('#startDate').datepicker();
    $('#endDate').datepicker();

    $('#btn-import').click(function () {
        if ($('#startDate').val() != "" && $('#endDate').val() != "") {

            var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
            var todayDate = new Date(moment(new Date()).format('YYYY-MM-DD'));
            var selStartDate = new Date(moment($('#startDate').val()).format('YYYY-MM-DD'));
            var selEndDate = new Date(moment($('#endDate').val()).format('YYYY-MM-DD'));

            var firstDiffDays = Math.abs((selStartDate.getTime() - todayDate.getTime())/(oneDay));
            var secondDiffDays = Math.abs((selEndDate.getTime() - todayDate.getTime())/(oneDay));

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





