$(function () {
    $("#selectallde").click(function () {
		console.log("222222222222222222222222222222222222222222222222222222222222222222222222222222222");
        if ($("#selectallde").is(':checked')) {
			console.log("444444444444444444444");
            $(".deselect").prop("checked", true);
        } else {
			console.log("5555555555555555555555");
            $(".deselect").prop("checked", false);
        }
    });
});