	var app = angular.module('dataSyncManager', []);


	/** -------------------------------------------- **/
	/** Other needed options as global variables	 **/
	/** -------------------------------------------- **/

	//basic url for data sync setting json
	var apiUrl = "../../systemSettings/dataSyncSettingJson";
	
	//basic url for data sync history json
	var syncHistoryUrl = "../../systemSettings/syncHistory";
	
	//basic url for data sync notifications json
	var syncNotificationUrl = "../../systemSettings/syncNotifications";
	
	//hold data about availability of servers
	var logins = [];