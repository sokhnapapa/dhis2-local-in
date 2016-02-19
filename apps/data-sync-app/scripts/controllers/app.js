	var app = angular.module('dataSyncManager', ['angularUtils.directives.dirPagination']);


//global variables to set the filter dates
	var lastDay = new Date(new Date().setDate(new Date().getDate() - 1));
	var lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
	var lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
	var noDuration=new Date(new Date().setMonth(new Date().getMonth() - 100));

	//variable jsons that has to used within all the controllers
	var category = "";
	var attributeJson;
	var dataElementJson;
	var DataElementUrl = "../../dataElements.json?fields=[name,type,code,created,lastUpdated,externalAccess,user,shortName,aggregationType,aggregationOperator,attributeValues,dataDimension,domainType,categoryCombo,url,optionSet,commentOptionSet,valueType,formName,publicAccess,zeroIsSignificant,id,optionSetValue]&paging=false";

	/** -------------------------------------------- **/
	/** Other needed options as global variables	 **/
	/** -------------------------------------------- **/
	var attributeUrl = "../../attributes.json?fields=:all";
	//basic url for data sync setting json
	var apiUrl = "../../systemSettings/dataSyncSettingJson";
	
	//basic url for data sync history json
	var syncHistoryUrl = "../../systemSettings/syncHistory";
	
	//basic url for data sync notifications json
	var syncNotificationUrl = "../../systemSettings/syncNotifications";
	
	//hold data about availability of servers
	var logins = [];
	//hold the data about sucsessful login instances
