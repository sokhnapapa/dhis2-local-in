	/** 
	
	This file has the controller and some other needed functions for handling the sync history
	
	Remember : 
		-- There are some global variables declared in app.js. eg : apiUrl
		-- Form validation functions are coded in validations.js
		-- Saving and fetching basic settings functionality is coded in saveAndFetch.js

	**/
	var notificationList = [];
	app.controller('notificationController', function($rootScope, $http) {
		$http.get( syncNotificationUrl ).then(function (response) {   
				if( response.data != "" )
				{
					console.log( response.data.data );
					$rootScope.notifications = response.data.data;				
					notificationList =  $rootScope.notifications;
				}
				printTable();
		});		
		
		$rootScope.clearNotification = function() {
			var r = confirm("Are you sure that you want to clear all the notifications?");
			
			if( r == true )
			{				
				$http.post( syncNotificationUrl, '' , {headers: {'Content-Type': 'text/plain;charset=utf-8'}})
				.then(function (response) {
					console.log(response);
					window.location.assign("notifications.html");
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
		
		notificationList.forEach(function(hs) {
			var isPreviousDataDeleted = hs.isPreviousDataDeleted ? "Deleted" : "Replaced";
			htmlStr = "<tr>";
				htmlStr += "<td>" + hs.msg + "</td>";
				htmlStr += "<td>" + hs.date + "</td>";
			htmlStr += "</tr>";
			
			index++;
			$("#hs").append(htmlStr);
		});
		
		$("#coverLoad").hide();
	}
	
