	/** 
	
	This file has the controller and some other needed functions for handling the sync history
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	var historyList = [];
	app.controller('historyController', function($rootScope, $http) {
		$http.get( syncHistoryUrl ).then(function (response) {   
				if( response.data != "" )
				{
					console.log( response.data.data );
					$rootScope.history = response.data.data;				
					historyList =  $rootScope.history;
				}
				printTable();
		});		
		
		$rootScope.clearHistory = function() {
			var r = confirm("Are you sure that you want to clear all the history data?");
			
			if( r == true )
			{				
				$http.post( syncHistoryUrl, '' , {headers: {'Content-Type': 'text/plain;charset=utf-8'}})
				.then(function (response) {
					console.log(response);
					window.location.assign("history.html");
				});
			}
		};
	});
	
	// ***************************************************************************************************
	// ***************************************************************************************************
	// TO PRINT SYNC HISTORY IN TABLE
	// ***************************************************************************************************
	// ***************************************************************************************************
	
	function printTable()
	{
		var htmlStr = "";
		var index = 0;
		
		historyList.forEach(function(hs) {
			var isPreviousDataDeleted = hs.isPreviousDataDeleted ? "Deleted" : "Replaced";
			htmlStr = "<tr>";
				htmlStr += "<td>" + hs.instance.split("(")[0] + "</td>";				
				htmlStr += "<td>" + hs.syncedDate + "</td>";				
				htmlStr += "<td>" + hs.DEgroup + "</td>";				
				htmlStr += "<td>" + hs.oul + "</td>";				
				htmlStr += "<td>" + hs.startDate + "</td>";				
				htmlStr += "<td>" + hs.endDate + "</td>";
				htmlStr += "<td> <input type='button' class='btn btn-info btn-xs' value='View' onclick='viewStats("+ index +")' /> </td>"; 
			htmlStr += "</tr>";
			
			index++;
			$("#hs").append(htmlStr);
		});
		
		$("#coverLoad").hide();
	}
	
	function filterHistory()
	{
		var ssyd = $("#ssyd").val();
		var ssd = $("#ssd").val();
		var sed = $("#sed").val();
		
		var syDate = new Date(ssyd);
		syDate.setHours(0,0,0,0);
		var sDate = new Date(ssd);
		sDate.setHours(0,0,0,0);
		var eDate = new Date(sed);
		eDate.setHours(0,0,0,0);
		
		var hsIndexes = [];
		
		//-----------------------------------------------------------------------
		if( ssyd != "" && ssd != "" && sed != "" )
		{
			historyList.forEach(function(hs,index) {
				var syHs = new Date(hs.syncedDate.split("(")[0]);	syHs.setHours(0,0,0,0);
				var sdHs = new Date(hs.startDate);	sdHs.setHours(0,0,0,0);
				var edHs = new Date(hs.endDate); edHs.setHours(0,0,0,0);
				
				if( (syHs.getTime() - syDate.getTime()) == 0 && (sDate.getTime() - sdHs.getTime()) <= 0 && (eDate.getTime() - edHs.getTime()) >=  0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd == "" && ssd != "" && sed != "" )
		{
			historyList.forEach(function(hs,index) {
				var sdHs = new Date(hs.startDate);	sdHs.setHours(0,0,0,0);
				var edHs = new Date(hs.endDate); edHs.setHours(0,0,0,0);
				
				if( (sDate.getTime() - sdHs.getTime()) <= 0 && (eDate.getTime() - edHs.getTime()) >=  0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd != "" && ssd == "" && sed != "" )
		{
			historyList.forEach(function(hs,index) {
				var syHs = new Date(hs.syncedDate.split("(")[0]);	syHs.setHours(0,0,0,0);
				var edHs = new Date(hs.endDate); edHs.setHours(0,0,0,0);
				
				if( (syHs.getTime() - syDate.getTime()) == 0 &&  (eDate.getTime() - edHs.getTime()) ==  0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd != "" && ssd != "" && sed == "" )
		{
			historyList.forEach(function(hs,index) {
				var syHs = new Date(hs.syncedDate.split("(")[0]);	syHs.setHours(0,0,0,0);
				var sdHs = new Date(hs.startDate);	sdHs.setHours(0,0,0,0);
				
				if( (syHs.getTime() - syDate.getTime()) == 0 && (sDate.getTime() - sdHs.getTime()) == 0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd != "" && ssd == "" && sed == "" )
		{
			historyList.forEach(function(hs,index) {
				var syHs = new Date(hs.syncedDate.split("(")[0]);	syHs.setHours(0,0,0,0);
				
				if( (syHs.getTime() - syDate.getTime()) == 0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd == "" && ssd != "" && sed == "" )
		{
			historyList.forEach(function(hs,index) {
				var sdHs = new Date(hs.startDate);	sdHs.setHours(0,0,0,0);
				
				if( (sDate.getTime() - sdHs.getTime()) <= 0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else if( ssyd == "" && ssd == "" && sed != "" )
		{
			historyList.forEach(function(hs,index) {
				var edHs = new Date(hs.endDate); edHs.setHours(0,0,0,0);
				
				if( (eDate.getTime() - edHs.getTime()) >=  0 )
					hsIndexes.push(index);
			});
		}
		//-----------------------------------------------------------------------
		else
		{
			historyList.forEach(function(hs,index) {
				hsIndexes.push(index);
			});
		}
		
		//*******************************************************************************
		//REPRINTING ALL ROWS
		//*******************************************************************************
		$("#hs").html("");
		
		hsIndexes.forEach(function(ind) {
			var hs = historyList[ind];
			var isPreviousDataDeleted = hs.isPreviousDataDeleted ? "Deleted" : "Replaced";
			htmlStr = "<tr>";
				htmlStr += "<td>" + hs.instance.split("(")[0] + "</td>";				
				htmlStr += "<td>" + hs.syncedDate + "</td>";				
				htmlStr += "<td>" + hs.DEgroup + "</td>";				
				htmlStr += "<td>" + hs.oul + "</td>";				
				htmlStr += "<td>" + hs.startDate + "</td>";				
				htmlStr += "<td>" + hs.endDate + "</td>";
				htmlStr += "<td> <input type='button' class='btn btn-info btn-xs' value='View' onclick='viewStats("+ ind +")' /> </td>"; 
			htmlStr += "</tr>";

			$("#hs").append(htmlStr);
		});
		console.log(hsIndexes);
	}
	
	function viewStats( index )
	{
		var hs = historyList[index];
		console.log(hs);
		$("#ec").html(""+ hs.stats.errors+"");
		$("#ic").html(""+ hs.stats.imported+"");
		$("#uc").html(""+ hs.stats.updated+"");
		$("#dc").html(""+ hs.stats.deleted+"");
		$("#igc").html(""+ hs.stats.ignored+"");
		$("#statModal").modal('show');
	}