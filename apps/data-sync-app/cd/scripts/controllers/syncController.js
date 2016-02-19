	/** 
	
	This file has the controller and some other needed functions for handling the 
	final sync
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	//sync summary --------------------------------------
		var syncSummary = {};
		syncSummary.stats = {};
		syncSummary.stats.errors = 0;
		syncSummary.stats.imported = 0;
		syncSummary.stats.deleted = 0;
		syncSummary.stats.updated = 0;
		syncSummary.stats.ignored = 0;
		syncSummary.instance = "";
		syncSummary.oul = "";
		syncSummary.DEgroup = "";
		syncSummary.isPreviousDataDeleted = false;
		syncSummary.startDate = "";
		syncSummary.endDate = "";
		syncSummary.syncedDate = "";
		
		var allSyncData = "*****";
	//---------------------------------------------------
	
	app.controller('syncController', function($rootScope, $http) {
		
		$rootScope.selectedInstance = getParameterByName("i");
  
		//getting server time
		$http.get( "../../system/info" ).then(function (response) {
			response = response.data;			
			syncSummary.syncedDate = response.serverDate.split("T")[0] + " (" + response.serverDate.split("T")[1].split(".")[0] +")";
		});
		
		
		$http.get( apiUrl ).then(function (response) {  
			$rootScope.setting = JSON.parse(response.data.value);
			validateLogin(  $http, basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/resources.jsonp?callback=JSON_CALLBACK");
			
			$rootScope.setting.instances.forEach(function(instance) {
				if( instance.id == $rootScope.selectedInstance )
				{
					$rootScope.selectedInstanceName = instance.name;
					syncSummary.instance = instance.name + " (" + instance.url + ")";
				}
			});	
			
			$rootScope.selectedDEG = $rootScope.setting.parentSetting.DEGname;
			syncSummary.DEgroup = $rootScope.setting.parentSetting.DEGname;
			
			$rootScope.setting.basicOptions.forEach(function(option) {			
				if( option.instance == $rootScope.selectedInstance )
				{
					$rootScope.selectedOULName = option.OrgUnitLevelName + " ( Level : " + option.OrgUnitLevel + " )";
					$rootScope.selectedOUL = option.OrgUnitLevel;
					$rootScope.natUserGroupForMsg = option.natUserGroupForMsg;
					$rootScope.insUserGroupForMsg = option.insUserGroupForMsg;
					syncSummary.oul = option.OrgUnitLevelName;
					
				}
			});	
			
			getOrgUnits( $rootScope, $http, $rootScope.setting.instances , $rootScope.selectedInstance );
		});
	
		
		
		$rootScope.sync = function() {
			if(validateDates())
			{				
				$rootScope.instanceMapData = {};
				
				$rootScope.setting.mappings.forEach(function(mapping) {
					if( mapping.instance==$rootScope.selectedInstance )
						$rootScope.instanceMapData = mapping.mapData;
				});
				
				$("#syncMsg").show();
				$("#coverLoad").show();
				
			
				if( !$("#pdata").prop('checked') )
				{
					$("#syncMsg").show();
					$("#progressbar").show();
					$("#syncProgress").show().css("width","0%");
					$("#syncProgressPer").html("0%");
					$("#deleteProgress").hide();
					syncSummary.isPreviousDataDeleted = false;
					startSync($rootScope, $http );					
				}					
				else
				{
					$("#syncMsg").show();
					$("#progressbar").show();
					$("#deleteProgress").show().css("width","0%");
					$("#deleteProgressPer").html("0%");
					$("#syncProgress").hide();
					syncSummary.isPreviousDataDeleted = true;
					calculateDeletables( $rootScope );
					deleteOldDataAndSync($rootScope, $http );
				}
				
			}
		};
	});
	
	
	function getOrgUnits( $rootScope, $http, instanceList , selectedInstance)
	{
		//getting orgunit json from instance
		$http.jsonp( basicInstanceUrl( instanceList , selectedInstance)+"api/organisationUnits.jsonp?fields=id,name,shortName,level&paging=false&callback=JSON_CALLBACK" ).then(function (response) {
			$rootScope.instanceOrgUnits = getOrgUnitString ( response.data.organisationUnits , $rootScope.selectedOUL);;
		});
	}
	
	function validateDates()
	{
		var sd = $("#sdate").val();
		var ed = $("#edate").val();

		
		if( sd == "" || ed == "" )
		{
			$("#alertMsg").html("Start Date and End Date must be specified");
			$("#alertModal").modal('show');
			return false;
		}
		else
		{
			var sDate = new Date(sd);
			var eDate = new Date(ed);
			
			if( sDate > eDate )
			{
				$("#alertMsg").html("Start Date cannot be a future date to the End Date");
				$("#alertBox").removeClass("alert-success").removeClass("alert-warning").addClass("alert-warning");
				$("#alertModal").modal('show');
				return false;
			}
			else
			return true;
		}
		
		
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET URL OF INSTANCE
	// ***************************************************************************************************
	// ***************************************************************************************************
	function basicInstanceUrl(instanceList, currentInstanceId) 
	{
		var ins = {};
		instanceList.forEach(function(instance) {
			if(instance.id == currentInstanceId)
			{
				ins.id = instance.id;
				ins.un = instance.uname;
				ins.pw = instance.pword;
				ins.url = instance.url;
			}
		});
		
		return ins.url+"/";
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO DELETE PREVIOUS DATA VALUE - will be done only if the user opts to go for it
	// ***************************************************************************************************
	// ***************************************************************************************************
	var deletablePeriods = [];
	var deletableDE = "";
	var deletableCOC = "";
	var deletableOrgUnits = [];
	var deletablePeriodsIndex = 0;
	var deletableOrgUnitsIndex = -1;
	var MapDataListindexForDeleting = -1;
	
	
	function deleteOldDataAndSync($rootScope, $http )
	{
		MapDataListindexForDeleting++;
		var mapData = $rootScope.instanceMapData;
		var syncStartDate = $("#sdate").val();
		var syncEndDate = $("#edate").val();
		var periodString = "";
		var orgUnits = $rootScope.instanceOrgUnits;
		
		
		if( mapData.length > MapDataListindexForDeleting )
		{
			//resetting all values
			deletablePeriodsIndex = 0;
			deletableOrgUnitsIndex = -1;
			deletablePeriods = [];
			deletableDE = "";
			deletableCOC = "";
			deletableOrgUnits = [];
			
			//giving new values
			deletableDE = mapData[MapDataListindexForDeleting].nationalDE;
			deletableCOC = mapData[MapDataListindexForDeleting].nationalCOC;
			var periodType = mapData[MapDataListindexForDeleting].periodicity;
			periodString = generatePeriods( periodType, syncStartDate , syncEndDate );
			deletablePeriods = periodString.split(";");
			deletableOrgUnits = orgUnits.split(";");

			doDelete( $rootScope, $http );
		}
		else
		{
			MapDataListindexForDeleting = -1;
			console.log("all deletions done");
			
			$("#syncMsg").show();
			$("#syncProgress").show().css("width","0%");
			$("#syncProgressPer").html("0%");
			$("#deleteProgress").hide();
					
			startSync($rootScope, $http );
		}
	}
	
	//for delete percentage display
	var totalDeletables = 0;
	var deletedValues = 0;
	
	function calculateDeletables( $rootScope )
	{
		var mapData = $rootScope.instanceMapData;
		var syncStartDate = $("#sdate").val();
		var syncEndDate = $("#edate").val();
		var periodCount = 0;
		var orgUnitCount = parseInt( $rootScope.instanceOrgUnits.split(";").length );		
		
		mapData.forEach(function(mData) {
			var periodType = mData.periodicity;
			periodCount += parseInt( generatePeriods( periodType, syncStartDate , syncEndDate ).split(";").length );
		});
		
		totalDeletables = periodCount * orgUnitCount;
	}
	//delete call structure
	/** 
		(periodRecursion)
		{ 
			(orgUnitRecursion)
			{
				deleteCall ( with current DE, COC, Period, OrgUnit );
			}
		}
		
	**/
	
	function doDelete( $rootScope, $http )
	{
		if( deletableOrgUnitsIndex < deletableOrgUnits.length - 1 )
		{
			deletableOrgUnitsIndex++;
		}
		else
		{
			deletableOrgUnitsIndex = 0;
			deletablePeriodsIndex++;
		}
		
		if( deletablePeriodsIndex < deletablePeriods.length && deletableOrgUnitsIndex < deletableOrgUnits.length )
		{
			var currentDeletablePeriod = deletablePeriods[deletablePeriodsIndex];
			var currentDeletableOrgUnit = deletableOrgUnits[deletableOrgUnitsIndex];
			
			var url = "../../dataValues?de="+ deletableDE +"&pe="+ currentDeletablePeriod +"&ou="+ currentDeletableOrgUnit +"&co="+ deletableCOC +"";
			//var url = "../../dataValues";
			
			var params = {};
			params.de = deletableDE;
			params.pe = currentDeletablePeriod;
			params.ou = currentDeletableOrgUnit;
			params.co = deletableCOC;
			var paramString = JSON.stringify(params);
			
			//updating progress
			deletedValues++;
			var deletedPer = parseInt( deletedValues / totalDeletables * 100 )+"%";
			$("#deleteProgress").css( "width",deletedPer );
			$("#deleteProgressPer").html( deletedPer );
			
			
			$http.delete( url ).success(function(data) {
				doDelete( $rootScope, $http );
			}).error(function(data) {
				doDelete( $rootScope, $http );
			});
		}
		else
		{
			console.log("individual deletion done");
			deleteOldDataAndSync($rootScope, $http);			
		}
	}
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET DATA VALUE FOR SYNC
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	var MapDataListindexForSync = -1;
	function startSync($rootScope, $http)
	{
		MapDataListindexForSync++;
		var mapData = $rootScope.instanceMapData;
		var syncStartDate = $("#sdate").val();
		var syncEndDate = $("#edate").val();
		
		syncSummary.startDate = $("#sdate").val();
		syncSummary.endDate = $("#edate").val();
		
		var dataElement = "";
		var coc = "";
		var periodType = "";
		var periods = "";
		var orgUnits = $rootScope.instanceOrgUnits;
		
		var completedPer = parseInt( ( MapDataListindexForSync + 1 ) / mapData.length * 100 ) + "%";
		$("#syncProgress").css("width",completedPer);
		$("#syncProgressPer").html( completedPer );		
		
		
		if( mapData.length > MapDataListindexForSync )
		{
			dataElement = mapData[MapDataListindexForSync].instanceDE;
			coc = mapData[MapDataListindexForSync].instanceCOC;
			periodType = mapData[MapDataListindexForSync].periodicity;
			periods = generatePeriods( periodType, syncStartDate , syncEndDate );
			
			if( coc != "none" )
				var url = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/analytics.jsonp?dimension=ou:"+orgUnits+"&dimension=pe:"+periods+"&dimension=dx:"+dataElement+"&dimension=co&callback=JSON_CALLBACK";
			else	
				var url = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance)+"api/analytics.jsonp?dimension=ou:"+orgUnits+"&dimension=pe:"+periods+"&dimension=dx:"+dataElement+"&callback=JSON_CALLBACK";
			
			$http.jsonp( url ).then(function (response) {
				if(response.data.rows.length > 0)
				{
					var dataJSON = makeDataValueJSON( $rootScope, response.data , coc );
					//console.log("----------------------------------------------------------------------------------");
					//console.log(dataJSON);
					//console.log("----------------------------------------------------------------------------------");
					saveSync( dataJSON, $http , $rootScope);
				}
				else
				{
					startSync( $rootScope, $http );
				}				
			});
		}
		else
		{
			console.log( syncSummary );
			saveSyncSummary($http , $rootScope);
			MapDataListindexForSync = -1;
			$("#syncMsg").hide();
			$("#progressbar").hide();
			$("#coverLoad").hide();
			$("#alertMsg").html("Synchronization completed. Check import log to view statistics.");
			$("#myModalLabel").html("Completion Message");
			$("#alertBox").removeClass("alert-warning").removeClass("alert-success").addClass("alert-success");
			$("#alertModal").modal('show');
		}
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO FETCH DATA FROM INSTANCE RESPONSE AND MAKE JSON PAYLOADS
	// ***************************************************************************************************
	// ***************************************************************************************************
	function makeDataValueJSON( $rootScope, data , coc )
	{
 		var dataValueSet = { };

    	var dataValues = [];
		data.rows.forEach(function(row) {
			
			if( row.length == 4 ) // indicator values or values of DE with 0 COC
			{
				var dataValue = {};

				dataValue ["orgUnit"] = row[0];
				dataValue ["period"] = row[1];
				
				var nationalProps = getMappedInstancePropsforNationalProps( $rootScope, row[2], "none" );
				dataValue ["dataElement"] = nationalProps.de;
				dataValue ["categoryOptionCombo"] = nationalProps.coc;
				
				dataValue ["value"] = row[3];

				dataValues.push( dataValue );
			}
			else if( coc == row[3] )
			{
				var dataValue = {};

				dataValue ["orgUnit"] = row[0];
				dataValue ["period"] = row[1];
				
				var nationalProps = getMappedInstancePropsforNationalProps( $rootScope, row[2], row[3] );
				dataValue ["dataElement"] = nationalProps.de;
				dataValue ["categoryOptionCombo"] = nationalProps.coc;
				
				dataValue ["value"] = row[4];

				dataValues.push( dataValue );
			}
		});

		dataValueSet.dataValues = dataValues;
		
		return (JSON.stringify(dataValueSet));	
	}
	
	//getting mapped DE and COC of national instance with instance DE and COC 
	function getMappedInstancePropsforNationalProps( $rootScope, cDE , cCOC)
	{
		var nProp = {};
		nProp.de = "null";
		nProp.coc = "null";
		
		$rootScope.setting.mappings.forEach(function(mapping) {
			if( mapping.instance==$rootScope.selectedInstance )
			{
				mapping.mapData.forEach(function(mData){
					if( mData.instanceDE == cDE && mData.instanceCOC == cCOC )
					{
						nProp.de = mData.nationalDE;
						nProp.coc = mData.nationalCOC;
					}
				});
			}
		});
		
		return nProp;
	}
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO SAVE JSON PAYLOADS
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function saveSync( dataJSON, $http, $rootScope )
	{	
		//console.log(dataJSON);
		var url = "../../dataValueSets";
		var header = {	'Accept': 'application/json','Content-Type': 'application/json'	};
		allSyncData += " ------ " + dataJSON; 
		
		$http({ method : 'post', url : url, headers: header, data : dataJSON })
		.success( function( response )
		{
			syncSummary.stats.imported += response.importCount.imported;
			syncSummary.stats.updated += response.importCount.updated;
			syncSummary.stats.deleted += response.importCount.deleted;
			syncSummary.stats.ignored += response.importCount.ignored;
			console.log( response );
			startSync( $rootScope, $http );
		})
		.error( function( response )
		{
			syncSummary.stats.errors = syncSummary.stats.errors + 1;
			console.log( "Internal Error : " + response.description);
			startSync( $rootScope, $http );
		});
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET DHIS COMPATIBLE PERIODS
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function generatePeriods( periodType, stDate, endDate )
	{
		var periods = "";
		
		if(periodType == "Daily")
			periods = daily( stDate , endDate );
		else if(periodType == "Weekly")
			periods = weekly( stDate , endDate );
		else if(periodType == "Monthly")
			periods = monthly( stDate , endDate );
		else if(periodType == "Yearly")
			periods = yearly( stDate , endDate );
		
		return periods;
	}
	
	//period type : daily
	function daily(sD , eD)
	{
		var sDate = new Date(sD);
		var eDate = new Date(eD);
		var dateString = "";
		
		while(sDate <= eDate)
		{
			var month = (sDate.getMonth()+1)>9 ? (sDate.getMonth()+1) : "0"+(sDate.getMonth()+1);
			var day = (sDate.getDate())>9 ? sDate.getDate() : "0"+sDate.getDate();
			var dhisDate = sDate.getFullYear()+""+month+""+day;
			dateString = (dateString == "") ? dhisDate : (dateString + ";" + dhisDate);
			sDate.setDate(sDate.getDate() + 1);			
		}
		return dateString;
	}
	
	//period type : weekly
	function weekly(sD , eD)
	{
		var unchangedStartDate = new Date(sD);
		var startDate = new Date(sD);
		var endDate = new Date(eD);
		
		//making start date's day to the prior Monday 
		if(startDate.getDay() == 0)
			startDate.setDate(startDate.getDate()-6);
		else if(startDate.getDay()>1)
			startDate.setDate(startDate.getDate()-startDate.getDay()+1);
		
		//making start date's day to the prior Sunday
		endDate.setDate(endDate.getDate()-endDate.getDay());

		// *****************************************************************************************
		
		// date for looping
		var sDate = new Date(sD);
		sDate.setDate(1);
		sDate.setMonth(0);
		var dateString = "";
		
		//making start date's day to the first Monday of the year or last Monday of the previous year
		if(sDate.getDay() == 0)
			sDate.setDate(sDate.getDate()-6);
		else if(sDate.getDay()>1)
			sDate.setDate(sDate.getDate()-sDate.getDay()+1);
		
		var week = 0;
		var year = "";
		
		var isFirstIteration = true;
		
		while(sDate <= endDate)
		{
			
			var dummyYear = sDate.getFullYear();

			if(isFirstIteration)
				year = unchangedStartDate.getFullYear();
			else
				year = sDate.getFullYear();
			
			week++;
				
			if( sDate.getDate() == startDate.getDate() && sDate.getMonth() == startDate.getMonth() && sDate.getFullYear() == startDate.getFullYear())
			{
					var dhisDate = ( week > 9 ) ? ( year + "W" + week ) : ( year + "W0" + week );
					startDate = sDate;
					dateString = ( dateString == "" ) ? dhisDate : ( dateString + ";" + dhisDate);
			}
			
			sDate.setDate(sDate.getDate()+7);
			if( dummyYear < sDate.getFullYear() && !isFirstIteration)
				week = 0;
			
			if(isFirstIteration)
				isFirstIteration = false;
		}
		
		return dateString;
	}
	
	//period type : monthly
	function monthly(sD , eD)
	{
		var sDate = new Date(sD);
		sDate.setDate(1);
		var eDate = new Date(eD);
		eDate.setDate(1);
		
		var dateString = "";
		
		while(sDate <= eDate)
		{
			var month = ( sDate.getMonth() + 1 ) > 9 ? ( sDate.getMonth() + 1 ) : "0"+( sDate.getMonth() + 1 );
			var dhisDate = sDate.getFullYear() + "" + month;
			dateString = ( dateString == "" ) ? dhisDate : ( dateString + ";" + dhisDate );
			sDate.setMonth( sDate.getMonth() + 1 );	
		}
		
		return dateString;
	}
	
	//period type : yearly
	function yearly(sD , eD)
	{
		var sDate = new Date(sD);
		sDate.setDate(1);
		sDate.setMonth(0);
		var eDate = new Date(eD);
		eDate.setDate(1);
		eDate.setMonth(0);
		
		var dateString = "";
		
		while(sDate <= eDate)
		{
			var dhisDate = sDate.getFullYear();
			dateString = ( dateString == "" ) ? dhisDate : ( dateString + ";" + dhisDate );
			sDate.setYear( sDate.getFullYear() + 1 );			
		}
		
		return dateString;
	}
	
	
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET ALL ORGUNITS OF SELECTED LEVEL
	// ***************************************************************************************************
	// ***************************************************************************************************
	function getOrgUnitString(OrgUnitList , level)
	{
		var orgUnitString = "";
		
		OrgUnitList.forEach(function(ou) {
			if(ou.level == level)
				orgUnitString = (orgUnitString=="") ? (ou.id) : ( orgUnitString + ";" + ou.id );
		});
		
		return orgUnitString;
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO SAVE SYNC HISTORY
	// ***************************************************************************************************
	// ***************************************************************************************************
	function saveSyncSummary($http , $rootScope )
	{
		var history = {};
		var dataJSON = {};
		
		$http.get( syncHistoryUrl ).then(function ( res ) {			
			if(res.data != "")
				history = res.data;
			else				
				history.data = [];
			
			history.data.push( syncSummary );	
			dataJSON = JSON.stringify(history);
			//console.log(dataJSON);
			postSummary( $http , $rootScope , dataJSON );
		});
	}
	
	function postSummary( $http , $rootScope , data )
	{
		$http.post( syncHistoryUrl, data, {headers: {'Content-Type': 'text/plain;charset=utf-8'}})
		.then(function (response) {
			console.log(response);
			msgSummaryToNatGrp( $http , $rootScope );
			msgSummaryToInsGrp( $http , $rootScope );
			saveNotification( $http , $rootScope );
		});
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO SAVE SYNC HISTORY
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function saveNotification($http , $rootScope )
	{
		var notifications = {};
		var newNotification = {};
		var notifyJSON = "";
		
		if( syncSummary.stats.imported == 0 && syncSummary.stats.updated == 0 )
			newNotification.msg = "Sync requested but there were no data to sync";
		else if( syncSummary.stats.errors > 0 )
			newNotification.msg = "There are some errors in Data Sync";
		else
			newNotification.msg = "Data Synced Successfully";
		
		newNotification.date = syncSummary.syncedDate;
		
		$http.get( syncNotificationUrl ).then(function ( res ) {			
			if(res.data != "")
				notifications = res.data;
			else				
				notifications.data = [];
			
			notifications.data.push( newNotification );	
			notifyJSON = JSON.stringify(notifications);
			//console.log(notifyJSON);
			postNotification( $http , $rootScope , notifyJSON );
		});
	}
	
	function postNotification( $http , $rootScope , notifyJSON)
	{			
		$http.post( syncNotificationUrl, notifyJSON, {headers: {'Content-Type': 'text/plain;charset=utf-8'}});
	}
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO SEND MESSAGES
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	//message to national user group
	function msgSummaryToNatGrp( $http , $rootScope )
	{
		var er = syncSummary.stats.errors;
		var im = syncSummary.stats.imported;
		var de = syncSummary.stats.deleted;
		var up = syncSummary.stats.updated;
		var ig = syncSummary.stats.ignored;
		var ins = syncSummary.instance;
		var oul = syncSummary.oul;
		var deg = syncSummary.DEgroup;
		var pd = syncSummary.isPreviousDataDeleted;
		var sd = syncSummary.startDate;
		var ed = syncSummary.endDate;
		var syd = syncSummary.syncedDate;
		var userGrp = $rootScope.natUserGroupForMsg;
		var pdt = pd ? "Previous corresponding data were deleted from the national instance and the new data were imported back." : "";		
		
		var subject = "DHIS Data Sync Summary";
		var msg = ins + " was synced with the National Instance on " + syd + ". Here are the statistics of the import. " + pdt + " .";
		msg += " Synced Data Element Group : " + deg;
		msg += ". Synced Organisation Unit Level : " + oul;
		msg += ". Sync Start Date : " + sd;
		msg += ". Sync End Date : " + ed;
		msg += ". Errors : " + er;
		msg += ". Imported Count : " + im;
		msg += ". Deleted Count : " + de;
		msg += ". Updated Count : " + up;
		msg += ". Ignored Count : " + ig;
		msg += ". Data value sets : " + allSyncData;
		
		var xmlData = 	'<message xmlns="http://dhis2.org/schema/dxf/2.0">' +
						  '<subject>' + subject + '</subject>' +
						  '<text>' + msg + '</text>'+
						  '<userGroups>'+
							'<userGroup id="'+ userGrp +'" />'+
						  '</userGroups>'+
						'</message>';
		
		//console.log(xmlData);
		
		$http({ 
			method: 'POST',
			url: '../../messageConversations',
			data: xmlData,
			headers: { "Content-Type": 'application/xml' }
		})
		.success(function (response) {
			console.log(response);
		})
		.error(function(response){
			console.log(response);
		});
	}
	
	//message to instance user group
	function msgSummaryToInsGrp( $http , $rootScope )
	{		
		var im = syncSummary.stats.imported;
		var de = syncSummary.stats.deleted;
		var up = syncSummary.stats.updated;
		var ig = syncSummary.stats.ignored;
		var sd = syncSummary.startDate;
		var ed = syncSummary.endDate;
		var syd = syncSummary.syncedDate;
		var userGrp = $rootScope.insUserGroupForMsg;
		
		var subject = "DHIS Data Sync Summary";
		var msg = (im+de+up+ig) + " sets of data were taken from the instance and imported to the national instance for the sync purpose on " + syd + ". ";
		msg += " Period from : " + sd;
		msg += " to : " + ed;
		
		var xmlData = 	'<message xmlns="http://dhis2.org/schema/dxf/2.0">' +
						  '<subject>' + subject + '</subject>' +
						  '<text>' + msg + '</text>'+
						  '<userGroups>'+
							'<userGroup id="'+ userGrp +'" />'+
						  '</userGroups>'+
						'</message>';
		
		console.log(xmlData);
		
		var iurl = basicInstanceUrl( $rootScope.setting.instances , $rootScope.selectedInstance) + "api/messageConversations";
		$http({ 
			method: 'POST',
			url: iurl,
			data: xmlData,
			headers: { "Content-Type": 'application/xml' }
		})
		.success(function (response) {
			console.log(response);
		})
		.error(function(response){
			console.log(response);
		});
	}
	
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO GET PARAMETER VALUES FROM URL
	// ***************************************************************************************************
	// ***************************************************************************************************
	function getParameterByName(name) 
	{
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}