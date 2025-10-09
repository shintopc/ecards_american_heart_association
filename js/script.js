/* Minification failed. Returning unminified contents.
(8511,62-63): run-time error JS1195: Expected expression: .
(8511,116-117): run-time error JS1003: Expected ':': ;
(9283,62-63): run-time error JS1195: Expected expression: .
(9283,116-117): run-time error JS1003: Expected ':': ;
(11146,70-71): run-time error JS1195: Expected expression: .
(11146,124-125): run-time error JS1003: Expected ':': ;
 */
var AppApiKeyManager = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    return {

        init: function () {
            var self = this;
            $(document).ready(function () {
                self.getApiKeys();
			});
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
		},

        hideAlert: function () {
			$("#divKeyAlert .close").off("click");
			$("#divKeyAlert .close").on("click", function () {
		        $(this).parent().toggleClass("hide", true);
	        });
        },

        getApiKeys: function () {
            var self = this;

			$("#divSearchError, #divKeyAlert").toggleClass("hide", true);

            var url = $("#hdnKeysUrl").val();
            self.callAPI("get", url, null, self.onLoadResult, self.onFailure);
        },

        generateKey: function (e) {
            e.preventDefault();
			var self = this;
			var $el = $(e.target);

			self.firedElem = $el.prop("id");
	        if (self.firedElem === "btnRegen") {
		        self.hideAlert();
	        }

			$("#divSearchError, #divKeyAlert").toggleClass("hide", true);
            
            var url = $(e.target).data("url");
            self.callAPI("post", url, null, $.proxy(self.onLoadResult, self), self.onFailure);
        },
        
        confirmDeletion: function (e) {
            e.preventDefault();

			$("#divSearchError, #divKeyAlert").toggleClass("hide", true);

            $("#confirmDeleteModal").modal("show");
		},

        confirmRegen: function (e) {
	        e.preventDefault();

			$("#divSearchError, #divKeyAlert").toggleClass("hide", true);

			$("#confirmRegenModal").modal("show");
        },

        removeKey: function (e) {
            e.preventDefault();
            var self = this;

            $("#divSearchError").toggleClass("hide", true);

            var url = $(e.target).data("url");
            var feed = { Id: $("#hdnKeyId").val() };
            self.callAPI("post", url, feed, self.onLoadResult, self.onFailure);
		},

		copyKey: function (e) {
			e.preventDefault();

	        /* Select the text field */
			$("#inpKey").select();

	        /* Copy the text inside the text field */
	        document.execCommand("Copy");
		},

        onLoadResult: function (data) {
	        var self = this;
			$("#divSearchError, #divKeyAlert").toggleClass("hide", true);
			$("#confirmDeleteModal").modal("hide");
			$("#confirmRegenModal").modal("hide");
			
			if (data && data.length > 0) {
				if (self.firedElem === "btnRegen") {
					$("#divKeyAlert").toggleClass("hide", false);
				}

			   $("#divKeyResult").html(data);
           }
        },

        onFailure: function (err) {
			$("#confirmDeleteModal").modal("hide");
	        $("#confirmRegenModal").modal("hide");
            appCommon.showResponseError("divKeyError", "errlist", err);
        }
    }
};
var AppApproveECards = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    return {

        init: function () {
            var self = this;
           
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        onSuccess: function (data) {
            if (data) {
                $("#resendEmailModal").modal("hide");
                $("#resendSMSModal").modal("hide");
                $("#divAlert").toggleClass("hide", false);
                $("#btnSearchCards").trigger({ type: "click", canShowMsg: true });
            }
        },

        onFail: function (err) {
            appCommon.showResponseError("resendError", "emailErr", err);
        },

        editECard: function (e) {
            e.preventDefault();
            $("#divEditError").toggleClass("hide", true);
            $("#divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                eCardGuid: $el.data("eid"),
                isInstructorCard: $el.data("isinstsrc")
            }

            self.callAPI("post", url, inputs, $.proxy(self.onLoadingEditCard, self), self.onFailSearch);
        },

        onLoadingEditCard: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divEditCard").toggleClass("hide", false).html(data);
                appCommon.initDatePicker(true);
                appCommon.focusMessage();

                if ($("#blockeCard").length > 0) {
                    $("#blockeCard").off("change");
                    $("#blockeCard").on("change", self.changeStatus);
                    $("#notes").prop("disabled", !$("#blockeCard").is(":checked"));
                }
            }
        },

        getPendingRequest: function () {
            var url = $("#hdnUrl").val();
            var self = this;
            var feed = {};
            self.callAPI("get",  url,"", self.onLoad, self.onLoadFailed);
        },

        onLoad: function (data) {
            if (data) {
                $("#pendingList").html(data);
                $("#tblPendingRequest").dataTable({
                    "columnDefs": [{
                        "targets": 'no-sort',
                        "orderable": false,
                    }]
                });
                $("#chkSelectAll").focus();
            }
        },
        onApproveSuccess: function (data) {
            if (data) {
                $("#pendingList").html(data);
                $("#tblPendingRequest").DataTable();
                $("#divAlert").toggleClass("hide", false);
                $("#divMessage").text(window.resources["TextApprovedRequest"]);
            }
        },
        onDenySuccess: function (data) {
            if (data) {
                $("#pendingList").html(data);
                $("#tblPendingRequest").DataTable();
                $("#divAlert").toggleClass("hide", false);
                $("#divMessage").text(window.resources["TextDenyRequest"]);
            }
        },
        onLoadFailed: function (err) {
            appCommon.showResponseError("divError", "emailErr", err);
        },

        selectAll: function (obj) {

            $("#tblPendingRequest")
				.find("input:checkbox")
				.each(function () {
				    this.checked = obj.checked;
				});
        },
        approveRequest: function (e) {
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var status = $el.data("status");
           
            var selectedRequest = [];
            $("#tblPendingRequest")
               .find("tr")
               .each(function (item) {
                   if (item != 0) {
                       var objInput = $(this).find("input");
                       if (objInput.is(":checked")) {
                           selectedRequest.push(objInput.val());
                       }
                   }
               }
            );

            if (selectedRequest.length == 0) {
                appCommon.showResponseError("divError", "emailErr", window.resources["TextPleaseSelectOneOrMoreRecords"]);
                return;
            }
            if (status == 1) {
                self.callAPI("post", url, { ids: selectedRequest, status: status }, self.onApproveSuccess, self.onLoadFailed);
            } else {
                self.callAPI("post", url, { ids: selectedRequest, status: status }, self.onDenySuccess, self.onLoadFailed);
            }
        },

        open_lookup: function () {
            var self = this;
            $("#tcError").html("").addClass("hide");

            var url = $("#tcModal").data("url");

            self.callAPI("get",
                url,
                null,
                function (result) {
                    $(".modal-body").html(result);
                    $("#tcModal").modal("show");
                    $("#countryCode").off("click");
                    $("#search").off("click");
                    $("#countryCode").on("change", self.toggleState);
                    $("#search").on("click", $.proxy(self.searchTC, self));
                },
                self.onEditCardFailed);

        }

       
    }
}
;
var AppBlockECard = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function () {
        $("#blockError").html("").addClass("hide");
        var file = $("#uploadFile")[0].files;
        var errorMsg = [];

        if (file.length == 0) {
            errorMsg.push(window.resources["TextFileNameRequired"]);
        }
        else {
            var extension = file[0].name.substr(file[0].name.lastIndexOf('.') + 1).toLowerCase();
            if (extension != "xls" && extension != "xlsx") {
                errorMsg.push(window.resources["TextFileShouldBeExcel"]);
            }
        }

        if ($("#Comments").val() == '' && $("input[name=bType]:checked").val()==2) {
            errorMsg.push(window.resources["TextCommentsRequiredPleaseReview"]);
        }

        if (errorMsg.length > 0) {
            return appCommon.showResponseError("blockError", "errlist", errorMsg);
        }

        return true;
    }

    return {
        /*Start of Block Ecard Flow*/
        init: function () {
            $("#divComment").hide();
            $("input[name=bType]:radio").on("change", function (e) {
                var $el = $(e.target);
                $("#EcardsActionId").val($el.val());
                if ($el.val() == "2") {
                    $("#divComment").show();

                } else {
                    $("#divComment").hide();
                }

            });
        },
        moveNext: function () {
            if (!validateRequest()) return false;

            var data = new FormData();
            data.append("Comments", $("#Comments").val());
            data.append("IsReturnEcard", $("#IsReturnEcard:checked").val());
            data.append("EcardsActionId", $("input[name=bType]:checked").val());
            var files = $("#uploadFile")[0].files;
            for (var i = 0; i < files.length; i++) {
                data.append("uploadFile", files[i]);
            }

            var url = $("#btnMoveNext").data("url");
            var view = $("#btnMoveNext").data("view");
            jQuery.ajax({
                url: url,
                type: "POST",
                contentType: false,
                processData: false,
                data: data,
                dataType: "html",
                success: function (result) {
                    $("#confirmBlockEcards").html(result);
                    $("#confirmBlockEcards").removeClass("hide");
                    $("#index").addClass("hide");
                    if ($('#assignErrorstep2').html().length > 1) {
                        var errMsg = [];                        
                        errMsg = $('#assignErrorstep2').html().split('\n').filter(function (i) { return i.length != 0 });
                        $("#btnConfirm").prop('disabled', true);
                        return appCommon.showResponseError("assignErrorstep2", "errlist", errMsg);
                    }
                },
                error: function (errMsg) {
                    $("#success").html("");
                    appCommon.showResponseError("blockError", "errlist", errMsg);
                    $("#uploadFile").val("");
                    appCommon.focusMessage();
                }
            });

            return false;
        },
        movePrevious: function (view) {            
            $(view).toggleClass("hide", false);
            $("#index").toggleClass("hide", false);
            $("#confirmBlockEcards").toggleClass("hide", true);

            return false;
        },
        validateStudentSelection: function () {
            var errorMsg = [];
            var n = $("input:checked").length;
            if (n < 1) {
                errorMsg.push(window.resources["TextPleaseSelectAtLeastOneUnblocked"]);
            }

            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);

            if (errorMsg.length === 0) {
                return true;
            }

            return false;
        },
        Submit: function (btn) {
            var self = this;
            if (self.validateStudentSelection()) {

                    var errDiv = "assignErrorstep2";
                    $("#btnConfirm").submit();
                    var url = $("#btnConfirm").data("url");
                    var url1 = $(btn).data("url");
                    var data = $("#frmConfirm").serializeArray();


                    jQuery.post(url,
                        data,
                        function (result) {
                            $("#completeBlockEcards").html(result);
                            $("#completeBlockEcards").removeClass("hide");
                            $("#confirmBlockEcards").addClass("hide");
                            $("#index").addClass("hide");

                        })
                        .fail(function (errMsg) {
                            appCommon.showResponseError(errDiv, "errlist", errMsg);
                        })
                        .always(function () {
                            // if (divView === "#completeAssignCards") {
                            //    $("#btnFinish").prop("disabled", false);
                            // }
                        });

                return false;
            }


        },
        /*End of Block Ecard Flow*/
    }
}
;
var AppEcardClosureReport = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validate = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];
        var trainingCeneterId = $("#ddlTC option:selected").val();
        var tcId = $("#TcId").val();
        var reportType = $("#ddlReportType option:selected").val();

        if (trainingCeneterId <= 0 && !tcId) {
            errorMsg[errorMsg.length] = window.resources["TextAtleastOneValue"];
        }

        if (trainingCeneterId > 0 && tcId != "") {
            errorMsg[errorMsg.length] = window.resources["TextTcORTcId"];
        }

        if (reportType == 0) {
            errorMsg[errorMsg.length] = window.resources["TextReportTypeRequired"];
        }

        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }

   /* var validatePurchaseInventory = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];
        var tcId = $("#TcId").val();
        if (tcId == "") {
            errorMsg[errorMsg.length] = window.resources["TextTc"];
        }
        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }*/

    return {

        init: function () {
            var self = this;

            $('input[type=radio][name=rdbTcStatus]').on('change', function (e) {
                var $el = $(e.target);
                filterBy = $el.val();
                self.getTrainingcenters(filterBy);
            });
        },

        getTrainingcenters: function (filterBy) {
            var tcurl = $("#activeTCUrl").data("url");           
            var inputs = { isTcActive: filterBy == "1" };

            jQuery.get(tcurl, inputs,
                function (data) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                    if (data && data.length > 0) {     
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlTC").empty().append(subItems);
                        $('#ddlTC').val('');
                    }
                    else {                                                
                        $("#ddlTC").empty().append(subItems);
                    }
                })
                .error(function (err) {
                    $("#ddlTC").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        btnClick_search_inventory: function () {

            if (!validate()) return false;

            var trainingCeneterId = $("#ddlTC option:selected").val();
            var tcId = $("#TcId").val();
            var reportType = $("#ddlReportType option:selected").val();

            var self = this;
            var url = $("#inventoryUrl").data("url");
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { TrainingCeneterId: trainingCeneterId, TcId: tcId, reportType: reportType },
                success: function (result) {
                    $("#partial").html(result);


                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[1, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                            {
                                buttons: [
                                    {
                                        extend: 'excelHtml5',
                                        title: reportType == "1" ? appCommon.getFileName("Purchase-Report") : appCommon.getFileName("Closure Inventory Report")
                                    }
                                ]
                            });
                        $("#expotbutton").prepend(buttons.container())
                            .find("a.dt-button").addClass("btn btn-primary")
                            .text(window.resources["TextDownload"]);
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);

                }
            });

            return false;
        },

       /* getPurcahsedDateReport: function () {
            if (!validatePurchaseInventory()) return false;

            var trainingCeneterId = $("#ddlTC option:selected").val();
            var tcId = $("#TcId").val();

            var self = this;
            var url = $("#eCardPurchaseUrl").data("url");
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { TrainingCeneterId: trainingCeneterId, TcId: tcId },
                success: function (result) {
                    $("#partial").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[1, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                            {
                                buttons: [
                                    {
                                        extend: 'excelHtml5',
                                        title: appCommon.getFileName("Closure Inventory Report")
                                    }
                                ]
                            });
                        $("#expotbutton").prepend(buttons.container())
                            .find("a.dt-button").addClass("btn btn-primary")
                            .text(window.resources["TextDownload"]);
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);

                }
            });

            return false;
        },*/

        btnClick_reset_inventory: function () {

            $("#ddlTC").val('');
            $("#TcId").val('');
            $("#partial").html("");
        }
    }
};
var AppCommon = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    var HelpLinks = {

        "1": {
            "video": "https://player.vimeo.com/video/237119980",
            "title": "",
            "description": "Assign eCards to an Instructor or eCard Location (TCC/TC Admin)"
        },

        "2": {
            "video": "https://player.vimeo.com/video/237120024",
            "title": "",
            "description": "Assign eCards Directly to Students (TCC/TC Admin)"
        },
        "3": {
            "video": "https://player.vimeo.com/video/237120061",
            "title": "",
            "description": "Assign eCards to Students (Instructor and eCard Location Admin) "
        },
        "4": {
            "video": "https://player.vimeo.com/video/237659367",
            "title": "eCard Status",
            "description": "eCard Status (TCC/TC Admin) "
        },
        "5": {
            "video": "https://player.vimeo.com/video/237659296",
            "title": "eCard Status",
            "description": "eCard Status (Instructor)"
        },
        "6": {
            "video": "https://player.vimeo.com/video/237659325",
            "title": "eCard Status",
            "description": "eCard Status (eCard Admin for an eCard Location)"
        },
        "7": {
            "video": "https://player.vimeo.com/video/237659340",
            "title": "Reports",
            "description": "Reports (TCC/TC Admin, eCard Location Admin and Instructor roles)"
        }

    };

    return {
        showResponseError: function (container, elemId, jqXHR) {
            if (!jqXHR || jqXHR.length <= 0) {
                return true;
            }

            var errorDiv = $("#" + container);
            errorDiv.html("");

            var msg = this.ExtractError(jqXHR);

            var errContainer =
                '<button type="button" class="close" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span></button>' +
                '<div class="alert-notification"><p>' +
                window.resources["TextError"] +
                '</p><div>' +
                '<ul id="' +
                elemId +
                '"></ul></div></div>';

            errorDiv.append(errContainer);
            errorDiv.on("click", ".close", this.hideError);

            $.each(msg,
                function (idx, item) {
                    if (item) {
                        $("#" + elemId).append("<li>" + item + "</li>");
                    }
                });

            errorDiv.toggleClass("hide", false);
            errorDiv.removeClass("alert-warning");
            errorDiv.toggleClass("alert-danger", true);

            this.focusMessage();

            return false;
        },

        ExtractError: function (jqXHR) {
            if (!jqXHR) return "";
            var msg;
            if (typeof jqXHR == "string") {
                msg = jqXHR.split("\r\n");
            } else if ($.isArray(jqXHR)) {
                msg = jqXHR;
            } else {
                var errObj;
                msg = "";
                try {
                    errObj = msg = jQuery.parseJSON(jqXHR.responseText);
                    if (errObj && errObj.errorMessage) {
                        msg = errObj.errorMessage.split("\r\n");
                    } else if (errObj && errObj.Message) {
                        msg = errObj.Message.split("\r\n");
                    }
                } catch (e) {
                    console.log(e);
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(jqXHR.responseText, "text/html");
                    if (doc) {
                        msg = $(doc.getElementsByTagName("h2")).text();
                    }
                    if (!msg || msg.indexOf("502") > -1) {
                        msg = window.resources["TextGeneralErrorMsg"];
                    }

                    msg = msg.split("\r\n");
                }
            }

            return msg;
        },

        showWarning: function (container, elemId, msg) {
            if (!msg || msg.length <= 0) {
                return true;
            }

            var errorDiv = $("#" + container);
            errorDiv.html("");

            var errContainer =
                '<button type="button" class="close" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span></button>' +
                '<div class="alert-notification"><p>' +
                window.resources["TextWarning"] +
                '</p><div>' +
                '<P id="' +
                elemId +
                '" ></p></div></div>';

            errorDiv.append(errContainer);
            errorDiv.on("click", ".close", this.hideError);

            $("#" + elemId).html(msg);


            errorDiv.toggleClass("hide", false);
            errorDiv.removeClass("alert-danger");
            errorDiv.toggleClass("alert-warning", true);

            this.focusMessage();

            return false;
        },

        hideError: function (e) {
            $(this).parent().toggleClass("hide", true);
        },

        focusArea: function (id) {
            $("html, body").animate({
                scrollTop: $(id).offset().top
            },
                1000);
        },

        focusMessage: function () {
            $("html, body").animate({
                scrollTop: $("#top-header").offset().top
            },
                1000);
        },

        getCurrentDate: function () {
            var currentDate = new Date();
            return currentDate;
        },

        getMonthOldDate: function () {
            var nowDate = new Date();
            var currentDate = new Date(nowDate.setMonth(nowDate.getMonth() - 1));
            return currentDate;
        },

        getFiveDaysOldDate: function () {
            var nowDate = new Date();
            var currentDate = new Date(nowDate.setDate(nowDate.getDate() - 5));
            return currentDate;
        },

        getDateOnDays: function (days) {
            if (!days) {
                days = 5;
            }

            var nowDate = new Date();
            var currentDate = new Date(nowDate.setDate(nowDate.getDate() - days));
            return currentDate;
        },

        getFileName: function (fileName) {
            if (!fileName) {
                fileName = "eCards";
            }

            var d = new Date();
            return "{0}_{1}-{2}-{3}-{4}{5}-{6}-{7}".format(fileName,
                d.getFullYear(),
                d.getMonth() + 1,
                d.getDate(),
                d.getHours(),
                d.getMinutes(),
                d.getSeconds(),
                d.getMilliseconds());
        },

        getDateFormatError: function (fieldName) {
            /*var selectedLanguage = window.GetCookie('_eCardsculture');
            if (selectedLanguage == null) {
                selectedLanguage = "";//"en-US"
            }

            var format;

            switch (selectedLanguage) {

                case 'en':
                case 'es':
                case 'fr':
                case 'it':
                case 'pt':
                case 'de':
                case 'ja':
                case 'ko':
                case 'zh-Hans':
                case 'zh-Hant':
                    format = "DD/MM/YYYY";
                    break;
                default:
                    format = "MM/DD/YYYY";
            }*/

            var format = "MM/DD/YYYY";            

            return window.resources["TextErrorInvalidDate"].replace("{0}", format).replace("{1}", fieldName);
        },

        isValidDate: function () {
            var args = Array.prototype.slice.call(arguments);
            // var args = Array.from(arguments);

            if (!args) return false;


            if ($.type(args) === "array") {
                if (!window.gdateformat) {
                    window.gdateformat = "mm/dd/yy";
                }

                for (var i = 0; i < args.length; i++) {
                    try {
                        $.datepicker.parseDate(window.gdateformat, args[i]);
                    } catch (e) {
                        return false;
                    }
                }

                return true;
            }

            return false;
        },

        initDatePicker: function (isPartial) {

            if ($.datepicker) {

                if ($('.datepicker').length) {
                                        
                  /*  var selectedLanguage = window.GetCookie('_eCardsculture');
                    if (selectedLanguage == null || selectedLanguage == "en-US") {
                        selectedLanguage = "";//"en-US"
                    }

                    switch (selectedLanguage) {
                        case 'en':
                        case 'es':
                        case 'fr':
                        case 'it':
                        case 'pt':
                        case 'de':
                        case 'ja':
                        case 'ko':
                        case 'zh-Hans':
                        case 'zh-Hant':
                            window.gdateformat = "dd/mm/yy";
                            break;
                        default:
                            window.gdateformat = "mm/dd/yy";
                    }*/

                    var selectedLanguage = "en-US";
                    window.gdateformat = "mm/dd/yy";

                    $.datepicker.regional[selectedLanguage].closeText = window.resources["Close"];

                    $.datepicker.setDefaults($.datepicker.regional[selectedLanguage]);

                    $(".datepicker").each(function () {
                        var $this = $(this);
                        var picker = $('#' + $this.attr('id'));
                        var dFormat = $this.data('date-format');
                        var minDate = $this.data("mindate");

                        picker.datepicker($.extend({
                            minDate: minDate ? minDate : null,
                            buttonText: window.resources['TextCalendarView'],
                            dateFormat: dFormat ? dFormat : window.gdateformat
                        }));

                        if (isPartial) {

                            picker.datepicker("option",
                                {
                                    showOn: 'button',
                                    buttonImage: '//static.heart.org/ahaecc/images/calendar.png',
                                    // File (and file path) for the calendar image
                                    buttonImageOnly: false,
                                    closeText: $.datepicker.regional[selectedLanguage].closeText,
                                    dayNamesShort: $.datepicker.regional[selectedLanguage].dayNamesShort,
                                    showButtonPanel: true,
                                    onClose: removeAria
                                }
                            );
                            // Add aria-describedby to the button referring to the label
                            //  $('.ui-datepicker-trigger').attr('aria-describedby', 'datepickerLabel');

                            dayTripper();
                        }
                    });
                }
            }
        },

        getHelpLinks: function (videoId) {

            return HelpLinks[videoId];
        }
    }
};
var AppDisteCardStatus = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var courseId = $("#eCardStatusForm").find('select[id="CourseId"]').val();
        var startDate = $("#eCardStatusForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardStatusForm").find('input[id="EndDate"]').val();
        var errorMsg = [];
        if (isValidate) {
            if (!courseId || courseId.length <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextTransactionsDatesRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["TransactionDate"]);
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("assignError", "errlist", errorMsg);
            return false;
        }

        return true;
    }

    return {
        init: function () {
            var self = this;
            $("#CourseId").on("change",
                function (e) {
                    var courseId = $("#CourseId").find(':selected')
                        .map(function(a, item) { return item.value; }).get().join(",");
                    self.btnClick_reset_ecardRequests(true);
                    $("#divDistributorTC").toggleClass("hide", true);
                    if (courseId) {
                        var transBy = $('input[name=transactionBy]:checked').val();
                        if (transBy === "tc") {
                            $("#divDistributorTC").toggleClass("hide", false);
                            self.getTCList({
                                courseIds: courseId
                            });
                        }
                    } else {
                        $("#divDistributorTC").toggleClass("hide", true);
                    }

                    $("#ddlTC").val("");
                });

            $("input[type=radio][name=transactionBy]").on("change", function (e) {
                self.toggleOptions(e);
            });

            self.initMultiSelect();
        },

        initMultiSelect: function () {
            $("#CourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

        },

        toggleOptions: function(e) {

            var self = this;
            var $el = $(e.target);
            $("#CourseId").multiselect("deselectAll", false).multiselect("refresh");
            $("#ddlTC").val("");
            $("#divDistributorTC").toggleClass("hide", true);
        },

        getTCList: function (inputs) {
            var tcUrl = $("#tc").data("url");
            jQuery.get(tcUrl, inputs,
                        function (data) {
                            if (data && data.length > 0) {
                                var subItems = [];
                                subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));

                                $.each(data,
                                    function (index, item) {
                                        subItems.push($("<option/>", {
                                            value: item.TrainingCenterId, text: item.Name
                                        }));
                                    });

                                $("#ddlTC").empty().append(subItems);
                                $('#ddlTC').val('');

                            }
                        })
                    .error(function (err) {
                        $("#ddlTC").empty();
                        appCommon.showResponseError("assignError", "errlist", err);
                    });
        },

       
        btnClick_search_ecardRequests: function (isValidate) {

            var self = this;
            if (!validateRequest(isValidate)) return false;
            var url = $("#fetchReq").data("url");
            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: $("#eCardStatusForm").serialize(),
                success: function (result) {
                    $("#partial").html(result);

                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": window.area.toLowerCase() === "distributor" ? [[6, "desc"]] : [[5, "desc"]],
                        columnDefs: [{
                            "targets": [0],
                            "visible": false
                        }]
                    });
                    if (!isValidate) {
                        $("#spdaysView").toggleClass("hide", false);
                    } else {
                        $("#spdaysView").toggleClass("hide", true);
                    }
                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon
                                        .getFileName("Distributor eCard Status"),
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        if (isValidate) {
                            appCommon.focusArea("#partial");
                        }
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlst", errMsg);
                }
            });

            return false;
        },

        btnClick_reset_ecardRequests: function (limitedClear) {
            var self = this;
            appCommon.showResponseError("assignError", "errlist", "");

            $("#ddlTC").val("");
           
            $("#divDistributorTC").toggleClass("hide", true);

            if (!limitedClear) {
                $("#CourseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getMonthOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());

                self.btnClick_search_ecardRequests(false);
            }

            if (!limitedClear) {
                appCommon.focusMessage();
            }

        }
    }
}
;
var AppECardAction = function (eCardStatus) {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    return {

        init: function () {
            $("#resendModal").on("shown.bs.modal", focusResend);
        },

        focusResend: function (e) {
            var modal = $(this);
            modal.find("#studentemail").focus();
            modal.find("#btnResendSMS").focus();
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        validateMobilePhone: function (mobilePhone) {
            var pattern =
				/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return $.trim(mobilePhone).match(pattern) ? true : false;
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        action_Click: function (e) {
            try{
                e.preventDefault();
                var self = this;
                $("#resendModal").on("shown.bs.modal", self.focusResend);
                $("#resendSMSModal").on("shown.bs.modal", self.focusResend);
                $("#resendModal").modal("hide");
                $("#resendSMSModal").modal("hide");
                $("#resendError").toggleClass("hide", true);
                $("#resendSMSError").toggleClass("hide", true);
                $("#divAlert").toggleClass("hide", true);

                var $el = $(e.target);

                var inputs = {
                    ECardUId: $el.data("eid"),
                    StudentId: $el.data("stuid"),
                    EmailAddress: $el.data("email"),
                    MobilePhone: $el.data("mobilephone"),
                    FirstName: $el.data("firstname"),
                    LastName: $el.data("lastname"),
                    Url: $el.data("url"),
                    Status: $el.data("status"),
                    CourseType: $el.data("coursetype")
                };

                if ($el.data("action") == "email") {
                    $("#resendModal").modal("show");
                    $("#studentemail").val(inputs.EmailAddress);
                    $("#btnResend").off("click");
                    $("#lnkSaveResend").off("click");
                    $("#btnResend").on("click", inputs, $.proxy(self.reSend, self));
                }
                else if ($el.data("action") == "sms") {
                    $("#resendSMSModal").modal("show");
                    $("#btnResendSMS").off("click");
                    $("#btnResendSMS").on("click", inputs, $.proxy(self.validateReSendSMS, self));
                    $("#studentphone").val(inputs.MobilePhone);
                }

                var saveData = {
                    ECardUId: $el.data("eid"),
                    StudentId: $el.data("stuid"),
                    EmailAddress: $el.data("email"),
                    CanSaveEmail: true,
                    Url: $el.data("url")
                };
                $("#lnkSaveResend").on("click", saveData, $.proxy(self.reSend, self));
                if (inputs.CourseType == 4) {
                    $("#lnkSaveResend").remove();
                }

            } catch (ex) {
                
            }
        },
        validateReSendSMS: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);


            $("#resendSMSError").toggleClass("hide", true);

            var err = [];
            if (!inputs.MobilePhone) {
                err[err.length] = window.resources["TextMobileNumberRequired"];
            }


            if (err.length > 0) {
                return appCommon.showResponseError("resendSMSError", "emailErr", err);
            }

            var url = inputs.Url;


            self.callAPI("post", url, inputs, self.onSuccessResend, self.onFailResend);
        },

        reSend: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            inputs.EmailAddress = $("#studentemail").val();
            $("#resendError").toggleClass("hide", true);

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("resendError", "emailErr", err);
            }

            var url = inputs.Url;

            self.callAPI("post", url, inputs, self.onSuccessResend, self.onFailResend);
        },

        onSuccessResend: function (data) {
            if (data) {
                $("#resendModal").modal("hide");
                var transId = $("#hdnTransId").val();
                eCardStatus.getECards(transId, true);
            }
        },

        onFailResend: function (err) {
            appCommon.showResponseError("resendError", "emailErr", err);
        },

        editECard: function (e) {
            e.preventDefault();
            $("#divEditError").toggleClass("hide", true);
            $("#divEditAlert, #divAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                eCardGuid: $el.data("eid"),
                profileId: $("#profileId option:selected").val()
            }

            self.callAPI("post", url, inputs, $.proxy(self.onLoadingEditCard, self), self.onFailLoadingEditECard);
        },

        onLoadingEditCard: function (data) {
            if (data && data.length > 0) {
                $("#divStudentECards").toggleClass("hide", true);
                $("#divEditCard").toggleClass("hide", false).html(data);
                appCommon.initDatePicker(true);
                appCommon.focusMessage();
            }
        },

        onFailLoadingEditECard: function (err) {
            appCommon.showResponseError("divStuTransError", "stuErr", err);
        },


        validateEdit: function () {
            var self = this;

            var err = [];
            var fName = window.searchCardModel.FirstName = $("#fname").val();
            var lName = window.searchCardModel.LastName = $("#lname").val();
            var email = window.searchCardModel.Email = $("#emailaddress").val();
            window.searchCardModel.Phone = $("#phone").val();
            window.searchCardModel.ECardUId = $("#hdnEUId").val();
            var courseDate = window.searchCardModel.CourseDate = $("#courseDate").val();

            window.searchCardModel.HasModules = $("input[id^=courseModule]").length > 0;

            window.searchCardModel.ModuleIds = $("input[id^=courseModule]:checked").map(function () {
                return this.value;
            }).get().join(",");


            var instructorId = window.searchCardModel.InstructorId = $("#newInstructor option:selected").val();

            window.searchCardModel.StartDate = "";
            window.searchCardModel.EndDate = "";
            window.searchCardModel.IssueDate = "";

            if (!fName) {
                err[err.length] = window.resources["TextFirstNameRequired"];
            }

            if (!lName) {
                err[err.length] = window.resources["TextLastNameRequired"];
            }

            if (!email) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (!courseDate) {
                err[err.length] = window.resources["TextCourseDateRequired"];
            }
            if (email != $('#hdnPreviuosEmail').val()) {
                if (email.toLowerCase() == $('#hdnLoggedInUserEmail').val().toLowerCase())
                    err[err.length] = window.resources["TextInvalidStudentEmailLoggedInMsg"];
                if (email.toLowerCase() == $('#newInstructor option:selected').data('instremail').toLowerCase())
                    err[err.length] = window.resources["TextInvalidStudentEmailMsg"];
            }

            if (!instructorId) {
                err[err.length] = window.resources["TextInstructorRequired"];
            }

            return appCommon.showResponseError("divEditError", "editErr", err);
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");

            if (!self.validateEdit()) return false;

            self.callAPI("post", url, window.searchCardModel, self.onSuccessSave, self.onEditCardFailed);
        },

        onSuccessSave: function (data) {
            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "editErr", err);
        },

        loadStudents: function (e) {
            e.preventDefault();
            $("#divStudentECards").toggleClass("hide", false);
            $("#divEditCard").html("").toggleClass("hide", true);
            var transId = $("#hdnTransId").val();
            eCardStatus.getECards(transId);
        }
    }
};
var AppReclaim = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    var validateRequest = function () {

        $("#reClaimErr").html("");
        $("#reClaimErr").addClass("hide");
        var errorMsg = [];

        var courseId = $("#courseId option:selected").val();
        var fromSource = $("#fromSource option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var siteId = $("#ddlSite option:selected").val();
        var roleId = $("#RoleId option:selected").val();
        var qty = $("#qty").val();
        var availQty = parseInt($("#divAvailQty").text());

        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && (!siteId || siteId <= 0)) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
        }

        if (!fromSource || fromSource <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
        }

        if (availQty <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInstructorLowInventory"];
        }

        if (fromSource > 0) {
            if (!qty || qty == "0")
                errorMsg[errorMsg.length] = window.resources["TextReclaimQuantityRequired"];
            else if (!jQuery.isNumeric(qty) || Math.floor(qty) != qty || parseInt(qty) <= 0)
                errorMsg[errorMsg.length] = window.resources["TextReclaimQtyPositive"];
        }

        if (availQty > 0 && parseInt(qty) > availQty) {
            errorMsg[errorMsg.length] = window.resources["TextReclaimExceedsQty"];
        }

        return appCommon.showResponseError("reClaimErr", "errlist", errorMsg);
    }

    var initializeReclaim = function () {
        $("#confirmReclaim").hide();
        $("#fromType").toggleClass("hide", true);
        $("#ddlSource").toggleClass("hide", true);
        $("#divBox").toggleClass("hide", true);
        $("#lnkConfirm").toggleClass("hide", true);
      //  $("#ddlTC").toggleClass("hide", true);
        $("#ddlEcardLocation").toggleClass("hide", true);
    }

    return {
        init: function () {
            var self = this;
            initializeReclaim();
            $("#RoleId")
                .on("change",
                    function (e) {
                        var roleId = $(e.target).val();
                        if (roleId > 0) {
                            $("#divTC").toggleClass("hide", false);
                            $("#assignError, #divBox, #divTC,#divSite, #divLoc, #divAssignTo, #divSubmit").toggleClass("hide", true);
                            //load tc list
                            var url = $(e.target).data("url");
                            self.getReclaimTargets(url, { selectedRoleId: roleId }, self.loadTrainingcenters);
                        } else {
                            $("#divTC").toggleClass("hide", true);
                            $("#divSite").toggleClass("hide", true);
                            $("#divCourse").toggleClass("hide", true);
                            $("#ddlSource").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#lnkConfirm").toggleClass("hide", true);
                        }
                    });
            if ($("#ddlTC").length) {
                $("#ddlTC").on("change", function (e) {
                    var url = $(e.target).data("courseurl");
                    var siteurl = $(e.target).data("siteurl");
                    var tcId = $(e.target).val();
                    var selectedRole = $('#RoleId').val();
                    var orgType = 'tc';
                   // orgType = (selectedRole == RoleType.TSC.value || selectedRole == RoleType.TSAdmin.value) ? 'ts' : 'tc';
                    if (tcId > 0) {
                        if (selectedRole == RoleType.TSC.value || selectedRole == RoleType.TSAdmin.value) {
                            self.getReclaimTargets(siteurl, { tcId: tcId, roleId: selectedRole  }, self.loadSites);
                        }
                        else
                        self.getReclaimTargets(url, { orgId: tcId, orgType: orgType }, self.loadCourses);
                    } else {
                        $("#divCourse").toggleClass("hide", true);
                        $("#ddlSource").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                        $("#lnkConfirm").toggleClass("hide", true);
                    }
                });
            }
            $("#ddlSite").on("change", function (e) {
                var url = $(e.target).data("courseurl");
                var tsId = $(e.target).val();
                var orgType = 'ts';
                if (tsId > 0) {
                    self.getReclaimTargets(url, { orgId: tsId, orgType: orgType }, self.loadCourses);
                } else {
                    $("#divCourse").toggleClass("hide", true);
                    $("#ddlSource").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#lnkConfirm").toggleClass("hide", true);
                }
            });
            $("#courseId").on("change", function (e) {
                initializeReclaim();
                self.clearErrorMsg();
                var courseId = $(e.target).val();

                if (courseId > 0) {

                   /* if ($("#fromType").length) {
                        $("#fromType").toggleClass("hide", false);
                        $('input[type=radio][name=reclaimType]').prop("checked", false);
                    
                    if ($("#ddlTC").length) {
                        var url = $(e.target).data("url");
                        self.getReclaimTargets(url, { courseId: courseId }, self.loadTrainingcenters);
                    }*/
                    var url = $(e.target).data("url");
                    var roleId = $("#RoleId option:selected").val();
                    var tcId,tsId;

                    if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) {
                        tcId = $("#ddlTC option:selected").val();
                    }
                    else {
                        tcId = $("#ddlTC option:selected").val();
                        tsId = $("#ddlSite option:selected").val();
                    }
                   // var tcId = $("#ddlTC option:selected").val();
                    var roleId = $("#RoleId option:selected").val();
                    self.loadTargets(url, { courseId: $("#courseId option:selected").val(), tcId: tcId, roleId: roleId,tsId:tsId }, window.resources["TextSelectInstructor"]);
                } else {
                    $("#ddlSource").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#lnkConfirm").toggleClass("hide", true);

                }

            });
            if ($("#fromType").length) {
                function changeLabel(txt) {
                    var $lbl = $("#lblFromSource");
                    var $span = $lbl.find("span");
                    $lbl.html(txt);
                    $lbl.append($span);
                }


                $('input[type=radio][name=reclaimType]').on('change', function (e) {
                    self.clearErrorMsg();
                    initializeReclaim();
                    $("#fromType").toggleClass("hide", false);
                    var $el = $(e.target);
                    var url = $el.data("url");
                    var inp = null;
                    var textDefaultOption;
                    //  var cb = self.loadTargets;
                    if ($el.val() === "fromIns") {
                        inp = { courseId: $("#courseId option:selected").val() }
                        changeLabel(window.resources["TextInstructor"]);
                        textDefaultOption = window.resources["TextSelectInstructor"];

                    } else {
                        changeLabel(window.resources["TexteCardLocation"]);
                        textDefaultOption = window.resources["TextSelecteCardLocation"];
                    }

                    $("#ddlSource").toggleClass("hide", false);

                    self.loadTargets(url, inp, textDefaultOption);
                });
            }

            if ($("#ddlEcardLocation").length) {
                $("#locationList").on("change",
                    function (e) {
                        var url = $(e.target).data("url");
                        var locationId = $(e.target).val();
                        var tcId = $("#ddlTC option:selected").val();

                        if (locationId > 0) {
                            self.loadTargets(url, { courseId: $("#courseId option:selected").val(), tcId: tcId }, window.resources["TextSelectInstructor"]);
                        } else {
                            $("#ddlSource").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#lnkConfirm").toggleClass("hide", true);

                        }

                    });
            }

            $("#fromSource").on("change", function (e) {
                var url = $(e.target).data("url");
                if ($(e.target).val() > 0) {
                    self.getAvailableQuantity(url, $(e.target).val());
                    $("#qty").val(0);
                } else {
                    $("#divBox").toggleClass("hide", true);
                }
            });

        },

        loadLocations: function (data) {
            if (data && data.length > 0) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                    });
                $("#ddlSource").toggleClass("hide", true);
                $("#ddlEcardLocation").toggleClass("hide", false);
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);

                $("#locationList").empty().append(subItems);
                $("#locationList").val('');
            }
        },

        loadTrainingcenters: function (data) {
            if (data && data.length > 0) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", { value: item.TrainingCenterId, text: item.Name }));
                    });
                $("#ddlSource").toggleClass("hide", true);
                $("#divCourse").toggleClass("hide", true);
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
                $("#divTC").toggleClass("hide", false);

                $("#ddlTC").empty().append(subItems);
                $("#ddlTC").val('');
            }
        },
        loadSites: function (data) {
           if (data && data.length > 0) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                    $.each(data,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                        });
                    $("#ddlSource").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#lnkConfirm").toggleClass("hide", true);
                    $("#divSite").toggleClass("hide", false);
                    $("#ddlSite").empty().append(subItems).val('');
                }
        },
        loadCourses: function (data) {
            if (data && data.length > 0) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", { value: item.CourseId, text: item.Name }));
                    });
                $("#ddlSource").toggleClass("hide", true);
                $("#ddlEcardLocation").toggleClass("hide", true);
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
                $("#divCourse").toggleClass("hide", false);

                $("#courseId").empty().append(subItems);
                $("#courseId").val('');
            }
        },
        getReclaimTargets: function (url, inp, cb) {
            jQuery.get(url, inp ? inp : null, cb)
            .error(function (errMsg) {
                appCommon.showResponseError("reClaimErr", "errlist", errMsg);
                $("#ddlSource").toggleClass("hide", false);
                $("#fromSource").empty();
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
            });

        },

        loadTargets: function (url, inputs, textDefaultOption) {

            var subItems = [];
            subItems.push($("<option/>",
            {
                value: '',
                text: textDefaultOption
            }));


            jQuery.get(url, inputs,
                    function (data) {
                        if (data && data.length > 0) {
                            $.each(data,
                                function (index, item) {
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                                });
                        } else {
                            var error = [];
                            error[error.length] = window.resources["TextNoInstructorsFound"];
                            appCommon.showResponseError("reClaimErr", "errlist", error);
                        }


                        $("#ddlSource").toggleClass("hide", false);
                        $("#divBox").toggleClass("hide", true);
                        $("#lnkConfirm").toggleClass("hide", true);
                        $("#fromSource").empty().append(subItems);
                        $("#fromSource").val('');
                    })

             .error(function (err) {
                 appCommon.showResponseError("reClaimErr", "errlist", err);
                 $("#ddlSource").toggleClass("hide", false);
                 $("#fromSource").empty().append(subItems);
                 $("#divBox").toggleClass("hide", true);
                 $("#lnkConfirm").toggleClass("hide", true);
             });

        },

        getAvailableQuantity: function (url, sourceId) {

            $("#divBox").toggleClass("hide", true);
            var courseId = $("#courseId option:selected").val();
            var roleId = $("#RoleId option:selected").val();
            var orgId;
            if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) {
                orgId = $("#ddlTC option:selected").val();
            }
            else {
                orgId = $("#ddlSite option:selected").val();
            }

            var inp = { courseId: courseId, sourceId: sourceId, orgId: orgId }

           /* if ($("#ddlEcardLocation").length) {
                var locationId = $("#locationList option:selected").val();
                inp = { courseId: courseId, sourceId: sourceId, fromSource: locationId }
            } else {
                inp = { courseId: courseId, sourceId: sourceId }
            } */

            jQuery.get(url, inp,
                    function (data) {
                        if (data) {
                            $("#divBox").toggleClass("hide", false);
                            $("#divAvailQty").text(data);
                            $("#lnkConfirm").toggleClass("hide", false);
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimErr", "errlist", err);
                });
        },

        clearErrorMsg: function () {
            $("#reClaimErr").html("");
            $("#reClaimErr").toggleClass("hide", true);
        },

        buildRequest: function () {
            window.eLocAssignmentViewModel.LocationId = $("#locationList option:selected").val();
           // $("#hdnLocName").val($("#locationList option:selected").text());
            $("#hdnInstrName").val($("#fromSource option:selected").text());
            window.eLocAssignmentViewModel.RoleId = $("#RoleId option:selected").val();
            window.eLocAssignmentViewModel.InstructorId = $("#fromSource option:selected").val();
            window.eLocAssignmentViewModel.InstructorName = $("#fromSource option:selected").text();
            window.eLocAssignmentViewModel.TCId = $("#ddlTC option:selected").val();
            window.eLocAssignmentViewModel.TCName = $("#ddlTC option:selected").text();
            window.eLocAssignmentViewModel.TSId = $("#ddlSite option:selected").val();
            window.eLocAssignmentViewModel.TSName = $("#ddlSite option:selected").val();
            window.eLocAssignmentViewModel.CourseName = $("#courseId option:selected").text();
            window.eLocAssignmentViewModel.CourseId = $("#courseId option:selected").val();
            window.eLocAssignmentViewModel.AssignedQty = $("#qty").val();
            window.eLocAssignmentViewModel.AvailableQty = $("#divAvailQty").text();
            window.eLocAssignmentViewModel.IsInstructorReclaim = true;
            window.eLocAssignmentViewModel.ReclaimSourceId = $("#fromSource option:selected").val();
        },

        loadReclaimMain: function () {
            $("#confirmReclaim").hide();
            $("#reclaimMain").show();
            $("#confirmReclaim").html("");
            return false;
        },

        loadConfirmReclaim: function () {
            var isValid = false;
            if ($("#ddlTC").length) {
                isValid = validateRequest();
                if (isValid) this.buildRequest();
            }

            if (!isValid) return false;

            var url = $("#lnkConfirm").data("url");
            jQuery.post(url,
                    $("#ddlTC").length > 0 ? window.eLocAssignmentViewModel : window.tcAssignmentViewModel,
                    function (data) {
                        if (data) {
                           // var isLoc = $("#ddlTC").length;
                            $("#confirmReclaim").show();
                            $("#reclaimMain").hide();
                            $("#confirmReclaim").html(data);
                            $("#divSourceName").html($("#hdnInstrName").val());
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimErr", "errlist", err);
                });

            return false;
        },

        loadCompleteReclaim: function () {

            $("#lnkComplete").prop("disabled", true);
            var isValid = false;
            if ($("#ddlTC").length) {
                isValid = validateRequest();
                if (isValid) this.buildRequest();
            }

            if (!isValid) {
                $("#lnkComplete").prop("disabled", false);
                return false;
            }

            var url = $("#lnkComplete").data("url");
            var self = this;
            $("#hdnAvailQty").val($("#divConfirmAvailQty").text());

            jQuery.post(url,
                    $("#ddlTC").length > 0 ? window.eLocAssignmentViewModel : window.tcAssignmentViewModel,
                    function (data) {
                        if (data) {
                           // var isLoc = $("#ddlTC").length;
                            $("#confirmReclaim").show();
                            $("#reclaimMain").hide();
                            $("#confirmReclaim").html(data);
                            $("#divSourceName").html($("#hdnInstrName").val());
                            $("#counter").text($("#hdnAvailQty").val());
                            self.fnCounter();
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimConfirmErr", "errlist1", err);
                })
                .always(function () {
                    $("#lnkComplete").prop("disabled", false);
                });

            return false;
        },

        fnCounter: function () {
            $({ countNum: $("#hdnAvailQty").val() }).delay(1000).animate({ countNum: $("#divCompAvailQty").text() }, {
                duration: 1500,
                easing: 'linear',
                step: function () {
                    $('#counter').text(Math.floor(this.countNum));
                },
                complete: function () {
                    $('#counter').text(this.countNum);
                    $('#counter').addClass("animated fadeOut");
                    $('#counter').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $('#counter').delay(100).animate({ height: 0 }, 500);
                    });
                }
            });
        }
    }
};
var AppEcardRequest = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    var validateRequest = function () {
        $("#search_error").html("");
        $("#search_error").addClass("hide");
        var courseId = $("#eCardRequestsForm").find('select[id="SelectedCourseId"]').val();
        var startDate = $("#eCardRequestsForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardRequestsForm").find('input[id="EndDate"]').val();
        var errorMsg = [];
        if ("" === courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextAssignmentDateRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateOfAssignment"]);
        }

        if (errorMsg.length > 0) {
            return appCommon.showResponseError("search_error", "errlist", errorMsg);
        }

        return true;
    }

    var validateAssignRequest = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];

        var courseId = $("#CourseId option:selected").val();
        var distbId = $("#DistributorId option:selected").val();
        var tcIdNum = $("#tcIdNum").val().trim();
        var qty = $("#qty").val();
        var availQty = $("#availQty").val();

        if (!courseId || courseId.length <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!distbId || distbId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextDistributorRequired"];
        }

        if ($("input[name=EntityId]").val() == "1") {
            if (!tcIdNum) {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
            if (distbId || distbId > 0) {
                if ("" === availQty || availQty <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextDistributorLowInventory"];
                }

                if (availQty > 0 && parseInt(qty) > availQty) {
                    errorMsg[errorMsg.length] = window.resources["TextRequestQtyExceeded"];
                }
            }
        }

        if (!jQuery.isNumeric(qty) || Math.floor(qty) != qty || parseInt(qty) <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextAssignQtyRequired"];
        }

        //if (distbId > 0) {
        //    //errorMsg[errorMsg.length] = window.resources["TextDistributorRequired"];
        //    if (courseId == 58 || courseId == 59 || courseId == 60 || courseId == 61) {
        //        if ($("#dist").is(':checked')) {
        //            errorMsg[errorMsg.length] = window.resources["TextCannotAssignRQI"];
        //        }
        //    }
        //}


        if (errorMsg.length <= 0 && $("input[name=EntityId]").val() == "1") {
            $.ajaxSetup({
                async: false,
                cache: false
            });
            var url = $("#btnValidate").data("url");
            jQuery.get(url,
                { courseId: courseId, tcIdNumber: tcIdNum },
                function (data) {
                    if (!data || !data.Name)
                        errorMsg[errorMsg.length] = window.resources["TextTCCourseNotAligned"];
                    else {
                        $("#chosenTCId").val(data.TrainingCenterId);
                        $("#hdnTCName").val(data.Name);
                    }
                })
                .error(function (err) {
                    var msg = appCommon.ExtractError(err);
                    $.each(msg,
                        function (idx, item) {
                            if (item) {
                                errorMsg[errorMsg.length] = item;
                            }
                        });
                })
                .always(function () {
                    $.ajaxSetup({
                        async: true,
                        cache: false
                    });
                });
        }

        if (errorMsg.length > 0) {
            return appCommon.showResponseError("assignError", "errlist", errorMsg);
        }

        return true;
    }

    var getDistQty = function (distbId, cb) {
        if ($("input[name=EntityId]").val() == "1") {
            var url = $("#DistributorId").data("url");
            jQuery.get(url,
                { courseId: $("#CourseId option:selected").val(), distbId: distbId }, cb)
                .error(function (err) {
                    if ($("#confirmError").is(':visible'))
                        appCommon.showResponseError("confirmError", "err1", err);
                    else {
                        appCommon.showResponseError("assignError", "err1", err);
                    }
                });
        }
    }

    var getDistByType = function (isIntl, cb) {
        var url = $("#CourseId").data("url");
        jQuery.get(url,
            { courseId: $("#CourseId option:selected").val(), isInternational: isIntl }, cb)
            .error(function (err) {
                if ($("#confirmError").is(':visible'))
                    appCommon.showResponseError("confirmError", "err1", err);
                else {
                    appCommon.showResponseError("assignError", "err1", err);
                }
            });

    }

    var buildRequest = function () {
        window.assignViewModel.EntityId = $("input[name=EntityId]").val();
        window.assignViewModel.DistributorId = $("#DistributorId option:selected").val();
        window.assignViewModel.CourseId = $("#CourseId option:selected").val();
        window.assignViewModel.TCId = null;
        if (window.assignViewModel.EntityId == "1") {
            window.assignViewModel.TCId = $("#chosenTCId").val();
        }
        window.assignViewModel.AssignedQuantity = $("#qty").val();
        window.assignViewModel.AvailableQuantity = $("#availQty").val();
    }

    return {
        init: function () {

            var self = this;
            $(document)
                .ready(function () {
                    $("#assignModel").on("shown.bs.modal", self.focusResend);
                });
            var courseId = $("#CourseId option:selected").val();
            if ("" === courseId || courseId == "0") {
                $("#DistributorId").prop("disabled", true);
            }

            if ($("input[name=EntityId]").val() == "2") {
                $("#tcLookup").hide();
                $("#distQty").hide();
                $("#boxContent").toggleClass("boxed-content", false);
            }

            $("#CourseId").on("change", function (e) {
                var $el = $(e.target);
                if ($("input[name=EntityId]").val() == "1") {
                    $("#DistributorId").val("");
                }
                $("#DistributorId").prop("disabled", !$el.val());
                $("#availQty").val(0);
                $("#txtAvailQty").text(0);
                var isIntl = $('#CourseId :selected').data('coursetype');
                 
                getDistByType(isIntl,
                    function (data) {
                        var select = $("#DistributorId");
                        select.empty();
                        select.append($('<option/>', {
                            value: 0,
                            text: "Select a Distributor"
                        }));
                        $.each(data, function (index, itemData) {
                            select.append($('<option/>', {
                                value: itemData.UserId,
                                text: itemData.DisplayName
                            }));
                        });
                    });
            });

            $("#DistributorId").on("change", function (e) {
                if ($("input[name=EntityId]").val() == "1") {
                    var distbId = $(e.target).val();
                    if (!distbId) {
                        $("#txtAvailQty").text(0);
                        $("#availQty").val(0);
                    } else {
                        getDistQty(distbId,
                            function (data) {
                                if (data) {
                                    $("#txtAvailQty").text(data);
                                    $("#availQty").val(data);
                                }
                            });
                    }
                }
            });

            $("#assignType input[name=aType]:radio").on("change", function (e) {
                var $el = $(e.target);
                
                $("#EntityId").val($el.val());
                
                if ($el.val() == "1") {
                    $("#tcLookup").show();
                    $("#distQty").show();
                    $("#boxContent").toggleClass("boxed-content", true);
                    $("#DistributorId").val("");
                    $("#availQty").val(0);
                    $("#txtAvailQty").text(0);
                    
                } else {
                    $("#tcLookup").hide();
                    $("#chosenTCId").val(0);
                    $("#tcIdNum").val("");
                    $("#distQty").hide();
                    $("#boxContent").toggleClass("boxed-content", false);
                }
                $("#DistributorId").prop('selectedIndex', 0);
            });
        },
        focusResend: function (e) {
            var modal = $(this);
            modal.find("#btnClose").focus();
        },
        initMultiSelect: function () {
            $("#SelectedCourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            // $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

        },

        btnClick_search_ecardRequests: function () {

            if (!validateRequest()) return false;
            var courseId = $("#eCardRequestsForm").find('select[id="SelectedCourseId"]').find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");
            var startDate = $("#eCardRequestsForm").find('input[id="StartDate"]').val();
            var endDate = $("#eCardRequestsForm").find('input[id="EndDate"]').val();
            var model = {
                CourseIds: courseId,
                StartDate: startDate,
                EndDate: endDate
            };
            var url = $("#fetchReq").data("url");
            $.post(url, model, function (result) {
                $("#partial").html(result);
                $("#example").DataTable({
                    "pageLength": 25,
                    "order": [[4, "desc"]]
                });
                appCommon.focusArea("#partial");
            })
                .error(function (err) {
                    appCommon.showResponseError("search_error", "err", err);
                });

            return false;
        },

        confirmAssignment: function () {
            if (!validateAssignRequest()) return false;

            $("#assignCards").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", false);
            $("#confirmLogo").toggleClass("hide", false);
            $("#completeLogo").toggleClass("hide", true);
            $("#confirmButtons").toggleClass("hide", false);
            $("#completeButton").toggleClass("hide", true);
            $("#boxTitle").html(window.resources["TextAssignECardsConfirmTitle"]);

            this.loadAssertion();

            return false;
        },

        goBackToAssignment: function () {
            $("#assignCards").toggleClass("hide", false);
            $("#confirmAssignCards").toggleClass("hide", true);

            return false;
        },

        loadAssertion: function () {
            $("#tdCourse").html($("#CourseId option:selected").text());
            $("#tdTC").html($("#hdnTCName").val());
            $("#tdDistb").html($("#DistributorId option:selected").text());
            $("#tdAvailQty").html($("#availQty").val());
            $("#tdQty").html($("#qty").val());

            if ($("#EntityId").val() == "1") {
                $("#trDistb").show();
                $("#trTC").show();
            } else {
                $("#trDistb").hide();
                $("#trTC").hide();
            }
        },

        completeAssignment: function () {

            var self = this;
            buildRequest();
            var url = $("#btnComplete").data("url");

            $.post(url, assignViewModel,
                function (res) {
                    $("#assignCards").toggleClass("hide", true);
                    $("#confirmLogo").toggleClass("hide", true);
                    $("#completeLogo").toggleClass("hide", false);
                    $("#confirmButtons").toggleClass("hide", true);
                    $("#completeButton").toggleClass("hide", false);
                    $("#boxTitle").html(window.resources["TextAssignECardsCompleteTitle"]);

                    self.loadAssertion();

                    getDistQty($("#DistributorId option:selected").val(), function (data) {
                        if (data) {
                            $("#tdAvailQty").html(data);
                            $("#trDistb").find("td:first").text(window.resources["TextNewAvailableQuantity"]);
                            $("#tdQty").html($("#qty").val());
                        }
                    });
                })
                .error(function (err) {
                    appCommon.showResponseError("confirmError", "err1", err);
                });

            return false;
        },

        toggleState: function (e) {
            var countryCode = $(e.target).val();
            if (!(countryCode == "USA" || countryCode == "CAN")) {
                $("#stateDiv").hide();
            } else {
                $("#stateDiv").show();
            }
        },

        open_lookup: function () {
            var self = this;
            $("#tcError").html("").addClass("hide");

            var url = $("#assignModel").data("url");
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                success: function (result) {
                    $("#assignModelBody").html(result);
                    $("#assignModel").modal("show");
                    $("#countryCode").off("click");
                    $("#search").off("click");
                    $("#countryCode").on("change", self.toggleState);
                    $("#search").on("click",
                        $.proxy(self.searchTC, self));
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "err", errMsg);
                }
            });
        },

        searchTC: function (e) {
            e.preventDefault();

            var self = this;

            $("#tcError").html("").addClass("hide");

            var countryCode = $("#countryCode").val();

            if (!countryCode) {
                $("#tcError").html(window.resources["TextCountryRequired"]).removeClass("hide");
                return false;
            }

            var stateCode = $("#stateCode").val();

            if ((countryCode == "USA" || countryCode == "CAN") && !stateCode) {
                $("#tcError").html(window.resources["TextStateRequired"]).removeClass("hide");
                return false;
            }

            var city = $("#city").val();
            var tcNum = $("#tcId").val();

            var url = $("#hdnLookUpUrl").val();

            $.get(url,
                {
                    countryCode: countryCode,
                    stateCode: stateCode,
                    city: city,
                    tcNumber: tcNum
                },
                function (result) {
                    $("#tcNamesTableContainer").html(result);
                    $("a[id^=lnkPick]").off("click");
                    $("a[id^=lnkPick]").on("click", self.pickTC);

                }).error(function (err) {
                    $("#tcError").html(err).removeClass("hide");
                });

            return false;
        },

        pickTC: function (e) {
            e.preventDefault();
            var $el = $(e.target);
            var tcId = $el.data("tcid");
            var tcName = $el.data("tcname");
            var tcNum = $el.data("tc-number");

            $("#chosenTCId").val(tcId);
            $("#tcIdNum").val(tcNum);
            $("#chosenTCName, #hdnTCName").val(tcName);
            $("#assignModel").modal("hide");
        }
    }
};
var AppEcardTransStatus = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var hideAdvancedOpt = true;
    var clearDaysView = false;
    var appCommon = new AppCommon();

    var validateSearchOptions = function () {
        $("#statusErr").html("");
        $("#statusErr").toggleClass("hide", true);
        var errorMsg = [];
        var roleId = $("#profileId option:selected").val();
        var courseId = $("#courseId option:selected").val();
        var fromSource = $("#ddlSource option:selected").val();
        var transBy = $('input[name=transBy]:checked').val();
        var startDate = $("#eCardStatusForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardStatusForm").find('input[id="EndDate"]').val();
        var tcid = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS").val();

        if (!tcid || tcid <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextTransactionsDatesRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["TransactionDate"]);
        }

        if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && !tsId) {
            errorMsg[errorMsg.length] = window.resources["TextSelectTrainingSite"];
        }

        if (transBy === "fromTs" || transBy === "fromDist" || transBy === "fromIns" ) {
            if (!courseId || courseId.length <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }

            if (!fromSource || fromSource <= 0) {

                if (transBy === "fromIns") {
                    errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
                }
                if (transBy === "fromTs") {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
                }

                if (transBy === "fromDist") {
                    errorMsg[errorMsg.length] = window.resources["TextDistributorRequired"];
                }
            }
        }

        return appCommon.showResponseError("statusErr", "errlist", errorMsg);
    }

    return {
        init: function () {
            var self = this;
            $("#divOptions").toggleClass("hide", true);
            $("#lnkAdvanced").toggleClass("hide", true);

            $("input[type=radio][name=transBy]").on("change", function (e) {
                self.toggleOptions(e);
            });

            $('input[type=radio][name=instType]').on('change', function (e) {
                self.toggleInstrStatus(e);
            });

            $("#lnkAdvanced").on("click", self.showHideOptions);

            $("#profileId")
                .on("change",
                    function (e) {
                        var tcList = JSON.parse($('#algnTCWithRole').val());
                        var roleId = $("#profileId option:selected").val();

                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                        $.each(tcList,
                            function (index, item) {
                                if (item.RoleId == roleId) {
                                    subItems.push($("<option/>", { value: item.EntityId, text: item.EntityName, "data-isprintonly": item.IsPrintOnly }));
                                }

                            });

                        $("#ddlTC").empty().append(subItems).val("");
                        $('#collapseSearch').toggleClass("hide", true);
                        $('#collapseExample').toggleClass("hide", true);
                        $("#divResults").toggleClass("hide", true);
                        $("#divSite").toggleClass("hide", true);
                    });
            $("#ddlTC")
                .on("change",
                    function (e) {
                        var url = $('#ddlTC').data("url");
                        var inp = {};
                        var tcId = $("#ddlTC option:selected").val();
                        var roleId = $("#profileId option:selected").val();
                        if (roleId == '' || tcId == '') {
                            $("#collapseExample").toggleClass("hide", true);
                            $("#collapseSearch").toggleClass("hide", true);
                            $("#divResults").toggleClass("hide", true);
                            $("#divSite").toggleClass("hide", true);
                            return;
                        }

                        $("#spanTsAstrkRequire").toggleClass("hide", true);

                        if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {

                            $("#spanTsAstrkRequire").toggleClass("hide", false);
                            //load ts list
                            if (tcId > 0) {
                                var inp = { tcId: tcId, roleId: roleId };
                                var url = $("#ddlTC").data("tsurl");
                                var textDefaultOption = window.resources["TextSelectTrainingSite"];
                                self.renderSource(url, inp, "#ddlTS", textDefaultOption, self);
                                $("#divSite").toggleClass("hide", false);
                            }
                            return;
                        }
                        else {
                            $("#divSite").toggleClass("hide", true);
                        }
                        //load ts for instructor
                        if (roleId == RoleType.Instructor.value) {
                            if (tcId > 0) {
                                self.renderSource($("#ddlTC").data("tsurl"), { tcId: tcId, roleId: roleId }, "#ddlTS", window.resources["TextSelectTrainingSite"], self);
                                $("#divSite").toggleClass("hide", false);
                            }
                        }
                        // hiding print only radio button div
                        $('#radPrintDiv').toggleClass("hide", !$("#ddlTC").find(':selected').data("isprintonly"));

                        $('#radeCard').prop("checked", true);

                        $('#collapseSearch').toggleClass("hide", false);
                        $('#collapseExample').toggleClass("hide", false);

                        inp = { orgId: tcId, orgType: "tc", roleId: roleId };
                        $("#courseId").empty().val("");
                        self.renderSource(url, inp, "#courseId", window.resources["SelectCourse"], self);
                        $("#divChildCourse").toggleClass("hide", true);
                        $("#divOptions").toggleClass("hide", true);
                        $("#divResults").toggleClass("hide", true);
                        $("#lnkAdvanced").toggleClass("hide", true);
                    });
            $("#ddlTS")
                .on("change",
                    function (e) {
                        var url = $('#ddlTS').data("url");
                        var inp = {};
                        var tsId = $("#ddlTS option:selected").val();
                        var roleId = $("#profileId option:selected").val();
                        if (roleId == '' || tsId == '') {
                            var courseUrl = $('#ddlTC').data("url");
                            var tcId = $("#ddlTC option:selected").val();
                            self.renderSource(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#courseId", window.resources["SelectCourse"], self);
                            return;
                        }

                        $('#collapseSearch').toggleClass("hide", false);
                        $('#collapseExample').toggleClass("hide", false);

                        inp = { orgId: tsId, orgType: "ts", roleId: roleId };
                        $("#courseId").empty().val("");
                        self.renderSource(url, inp, "#courseId", "Select Course", self);

                        // hiding print only radio button div
                        if ($("#ddlTC").find(':selected').data("isprintonly"))
                            $('#radPrintDiv').toggleClass("hide", false);
                        else
                            $('#radPrintDiv').toggleClass("hide", true);

                        $("#divChildCourse").toggleClass("hide", true);
                        $("#divOptions").toggleClass("hide", true);
                        $("#divResults").toggleClass("hide", true);
                        $("#divSource, #divTransactionType").toggleClass("hide", false);
                        $("#lnkAdvanced").toggleClass("hide", true);
                        $("input:radio").attr("checked", false);
                        $('#radeCard').prop("checked", true);
                    });
            /*$("#divECardStatus").on("change", "#ddlSource", $.proxy(self.changeTC, self));*/

            $("#radioSite, #radioDist", "#radioSite").toggleClass("hide", true);

            $("#courseId").on("change", $.proxy(self.changeCourse, self));

            $(".datepicker").on("change",
                function (e) {
                    clearDaysView = true;
                });

            $(document).ready(function () {
                //$('#profileId').trigger('change');
                setTimeout(function () { $('#profileId').trigger('change'); }, 500);
                });
            self.initMultiSelect();
        },

        initMultiSelect: function () {
            $("#courseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            // $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

            $("#ddlChildCourse").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            //  $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse1");

        },
        toggleInstrStatus: function (e) {

            var self = this;
            var $el = $(e.target);

            self.clearErrorMsg();
            var instType = $el.val();
            var courseIds = $("#courseId").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");

            var textDefaultOption = window.resources["TextSelectInstructor"];
            var url = $("input[id=inst]:radio").data("url");
            var inp = { courseIds: courseIds, isActive: instType === "act" ? true : false };

            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            $("#ddlSource").empty().append(subItems).val('');

            self.renderSource(url, inp, "#ddlSource", textDefaultOption);
        },

        toggleOptions: function (e) {

            var self = this;
            self.clearErrorMsg();
            var $el = $(e.target);

            var courseId = $("#courseId").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");
            var profileId = $("#profileId option:selected").val();
            if (!courseId || courseId === "0") {
                $el.prop("checked", false);
                return appCommon.showResponseError("statusErr", "errlist", window.resources["TextCourseRequired"]);
            }

            var url = $el.data("url");
            var inp;
            var lblText;
            var textDefaultOption;

            $("#divInstType").toggleClass("hide", $el.val() !== "fromIns");
            $("input[id=radActive]:radio").prop("checked", $el.val() === "fromIns");
            var tcId = $('#ddlTC option:selected').val();
            var tsId = $('#ddlTS option:selected').val();
            var roleId = $('#profileId option:selected').val();
            if ($el.val() === "fromTs") {

                lblText = window.resources["TextTrainingSite"];
                inp = { tcId: tcId, roleId: roleId };
                textDefaultOption = window.resources["TextSelectTrainingSite"]
            }
            else if ($el.val() === "fromDist") {
                lblText = window.resources["TextDistributor"];
                textDefaultOption = window.resources["TextSelectDistributor"];
            }
            else if ($el.val() === "fromIns") {

                lblText = window.resources["TextInstructor"];
                textDefaultOption = window.resources["TextSelectInstructor"];

                var instrType = $("input[name=instType]:checked").val();
                inp = { courseIds: courseId, isActive: instrType === "act" ? true : false, tcId: tcId, tsId: tsId, roleId: roleId  };
            }

            $("#lblSource").text(lblText).append("<span class='required'> * </span>");
            $("#divSource, #divTransactionType").toggleClass("hide", false);
            $("#ddlTransType").val("");
            $("#ddlSource").empty().val("");

            self.renderSource(url, inp, "#ddlSource", textDefaultOption);
        },

        renderSource: function (url, inp, src, placeHolder, self) {
            var subItems = [];
            if (src != '#courseId') {
                subItems.push($("<option/>", { value: "", text: placeHolder }));
            }

            jQuery.get(url, inp ? inp : null,
                function (data) {
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, "data-isparent": item.HasChild, text: item.Name }));
                            });
                    }

                    if (src == '#courseId') {
                        $("#courseId").empty().append(subItems).multiselect('rebuild').val("");
                    }
                    else {
                        $(src).empty().append(subItems).val("");
                    }
                })
                .error(function (err) {
                    $(src).empty().append(subItems).val("");
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        showHideOptions: function (e) {

            hideAdvancedOpt = !hideAdvancedOpt;

            var $caret = $(e.target).find("span.caret");
            setTimeout(function () {

                $("#divOptions").toggleClass("hide", hideAdvancedOpt);
                var isUserIntlAlgn = $('#hdnIsUserIntlAlgn').val();
                var roleId = $("#profileId option:selected").val();
                if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && isUserIntlAlgn==1) {
                    $("#radSource").hide();
                    $("#divTransactionType").toggleClass("hide", false);
                    $("#divSource").toggleClass("hide", true);
                }
                if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                    $("#radSource").toggleClass("hide", false);
                    $("#radioInst").show();
                    $("#radioSite").hide();
                    $("#radioDist").hide();
                    $("#divTransactionType").toggleClass("hide", false);
                    $("#divSource").toggleClass("hide", true);
                }
                else if (roleId == RoleType.Instructor.value) {
                    $("#radSource").toggleClass("hide", true);
                    $("#divTransactionType").toggleClass("hide", false);
                }
                else {
                    $("#radSource").toggleClass("hide", false);
                    $("#divTransactionType").toggleClass("hide", false);
                    $("#radioInst").show();
                    $("#radioSite").show();
                    $("#radioDist").show();
                }
            }, 100);
            $caret.toggleClass("rotate", !hideAdvancedOpt);

            return false;
        },

        changeCourse: function (e) {

            var self = this;
            var courseId = $("#courseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
            var url = $(e.target).data("url");
            var vamurl = $(e.target).data("vamurl");
            var isInstructor = $("#profileId option:selected").val() == window.RoleType.Instructor.value;

            var hasChild = $("#courseId").find(':selected').map(function (a, item) {
                return $(item).data("isparent");
            }).get().join(",");

            var isUserIntlAlgn = $('#hdnIsUserIntlAlgn').val();

            if (hasChild == "true") {
                $("#divChildCourse").toggleClass("hide", false);

                if (isUserIntlAlgn == 1) {
                    jQuery.get(url, { courseId: courseId }, $.proxy(self.loadChildCourse, self))
                        .error(function (err) {
                            appCommon.showResponseError("statusErr", "errlist", err);
                        });
                }
                else {
                    jQuery.get(vamurl, { courseId: courseId, isInstructor: isInstructor }, $.proxy(self.loadVAMCourse, self))
                        .error(function (err) {
                            appCommon.showResponseError("statusErr", "errlist", err);
                        });
                }
            }
            else {
                $("#divChildCourse").toggleClass("hide", true);
            }


            clearDaysView = true;
            self.clearErrorMsg();
            self.clearSearchOptions(true);
            //showing advance option filter
            if (courseId) {
                $("#lnkAdvanced").toggleClass("hide", false);
                var roleId = $("#profileId option:selected").val();
                if ((roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) && isUserIntlAlgn==1) {
                    $("#radioSite, #radioDist").toggleClass("hide", false);
                }
                if ((roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) && isUserIntlAlgn == 0) {
                    $("#radioInst,#radioSite, #radioDist").toggleClass("hide", false);
                }
                if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && isUserIntlAlgn == 1) {
                    $("#radioInst").toggleClass("hide", true);
                }
                if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && isUserIntlAlgn == 0) {
                    $("#radioInst").toggleClass("hide", false);
                }
                
            }
        },

        //changeTC: function (e) {            
        //    var profileId = $("#profileId option:selected").val();            
        //    if (!profileId || profileId != window.RoleType.Instructor.value) {
        //        return;
        //    } 
        //},

        clearErrorMsg: function () {
            $("#statusErr").html("");
            $("#statusErr").toggleClass("hide", true);
        },

        clearSearchOptions: function (limitedClear) {
            this.clearErrorMsg();

            $("#ddlSource").empty().val("");

            hideAdvancedOpt = true;
            $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);
            $("#lnkAdvanced").toggleClass("hide", true);

            $("#ddlTransType").val("");
            $("#divOptions").toggleClass("hide", true);

            $("input[type=radio][name=transBy]").prop("checked", false);
            $("input[type=radio][name=instType]").prop("checked", false);

            $("#divTransactionType").toggleClass("hide", true);
            $("#divSource").toggleClass("hide", true);
            $("#divInstType").toggleClass("hide", true);

            if (!limitedClear) {
                $("#courseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getMonthOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());
                clearDaysView = false;
                this.searchTransactions(true);
            }

            if (!limitedClear) {
                appCommon.focusMessage();
            }

            return false;
        },

        buildSearchRequest: function () {
            window.eCardStatusViewModel = {};
            window.eCardStatusViewModel.InstructorId = undefined;
            window.eCardStatusViewModel.TrainingSiteId = undefined
            window.eCardStatusViewModel.DistributorId = undefined
            window.eCardStatusViewModel.TrainingCenterId = undefined
            window.eCardStatusViewModel.VAMCourseId = undefined
            window.eCardStatusViewModel.TransactionType = undefined;
            window.eCardStatusViewModel.IsPrintOnly = false;
            var startDate = $("#StartDate").val();
            var endDate = $("#EndDate").val();

            var radioPrint = $('input[name=printOnly]:checked').val();
            if (radioPrint == 'fromPrintOnly')
                window.eCardStatusViewModel.IsPrintOnly = true;

            window.eCardStatusViewModel.CourseId = $("#courseId").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");
            window.eCardStatusViewModel.StartDate = startDate;
            window.eCardStatusViewModel.EndDate = endDate;

            var transBy = $('input[name=transBy]:checked').val();
            var filterBy = $("#ddlSource option:selected").val();
            var profileId = $("#profileId option:selected").val();

            window.eCardStatusViewModel.ProfileId = profileId;
            window.eCardStatusViewModel.VAMCourseId = $("#ddlChildCourse").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");

            var tcId = $("#ddlTC option:selected").val();
            if (tcId != '')
                window.eCardStatusViewModel.TrainingCenterId = tcId;

            var trantype = $("#ddlTransType option:selected").val();
            if (trantype != '' && trantype != undefined)
                window.eCardStatusViewModel.TransactionType = trantype;

            if (profileId == RoleType.TSC.value || profileId == RoleType.TSAdmin.value || profileId == RoleType.Instructor.value) {

                var tsId = $("#ddlTS option:selected").val();
                if (tsId != '' && tsId != undefined)
                    window.eCardStatusViewModel.TrainingSiteId = tsId;
            }

            if (transBy === "fromTs" || transBy === "fromDist" || transBy === "fromIns") {
                if (transBy === "fromIns") {
                    window.eCardStatusViewModel.InstructorId = filterBy;
                }

                if (transBy === "fromTs") {
                    window.eCardStatusViewModel.TrainingSiteId = filterBy;
                }

                if (transBy === "fromDist") {
                    window.eCardStatusViewModel.DistributorId = filterBy;
                }

                window.eCardStatusViewModel.TransactionType = $("#ddlTransType option:selected").val();
            }
        },

        searchTransactions: function (isPageLoad) {
            if (!validateSearchOptions()) return false;
            this.buildSearchRequest();
            
          //  var isTCprofile = window.eCardStatusViewModel.profileId == RoleType.TCC.value || window.eCardStatusViewModel.profileId == RoleType.TCAdmin.value;
            var fileName = "Training Center eCard Status";
            if (window.eCardStatusViewModel.profileId == RoleType.TCAdmin.value)
                fileName = "Training Site eCard Status";
            if (window.eCardStatusViewModel.profileId == RoleType.TCAdmin.value)
                fileName = "Instructor eCard Status";

            var url = $("#btnSearch").data("url");
            var transBy = $('input[name=transBy]:checked').val();
            var self = this;
            jQuery.post(url,
                window.eCardStatusViewModel,
                function (data) {
                    if (data) {
                        $("#divResults").toggleClass("hide", false);
                        $("#divResults").html(data);
                        var tbl = $("#example").DataTable({
                            "columnDefs": [
                                {
                                    "targets": [7],
                                    "visible": window.eCardStatusViewModel.CourseId.indexOf(",") < 0 && !!window.eCardStatusViewModel.CourseId && !transBy && window.eCardStatusViewModel.VAMCourseId == 0
                                }
                            ]
                        });

                        if (tbl.context.length > 0) {
                            var buttons = new $.fn.dataTable.Buttons(tbl,
                                {
                                    buttons: [
                                        {
                                            extend: 'excelHtml5',
                                            title: appCommon.getFileName(fileName),
                                            exportOptions: {
                                                columns: ':visible'
                                            }
                                        }
                                    ]
                                });
                            $("#exportbutton").prepend(buttons.container())
                                .find("a.dt-button").addClass("btn btn-primary")
                                .text(window.resources["TextDownload"]);
                        }

                        $("#spdaysView").toggleClass("hide", clearDaysView);
                        $("#example").on("click", ".lnkecard", $.proxy(self.loadECards, self));
                        if (!isPageLoad) {
                            appCommon.focusArea("#divResults");
                        }
                    }
                    $('[data-toggle="popover"]').popover();
                })
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });

            return false;
        },       

        loadChildCourse: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                // subItems.push($("<option/>", { value: "", text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.CourseId, text: item.Name + ' (' + item.Language + ')'
                        }));
                    });
                $("#ddlChildCourse").empty().append(subItems);
                $("#ddlChildCourse").val('');
                $("#ddlChildCourse").empty().append(subItems).multiselect('rebuild');
            }
        },

        loadVAMCourse: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                // subItems.push($("<option/>", { value: "", text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.CourseId, text: item.Name
                        }));
                    });
                $("#ddlChildCourse").empty().append(subItems);
                $("#ddlChildCourse").val('');
                $("#ddlChildCourse").empty().append(subItems).multiselect('rebuild');
            }
        },

        loadECards: function (e) {
            e.preventDefault();
            var self = this;
            var transId = $(e.target).data("transactionid");
            self.getECards(transId);
        },

        getECards: function (transId, canShowMsg) {
            var self = this;
            var profileId = $("#profileId option:selected").val();
            var url = $("#hdnUrl").val();
            var isRadioPrintBtnSelected = false;
            var radioPrint = $('input[name=printOnly]:checked').val();
            if (radioPrint == 'fromPrintOnly')
                isRadioPrintBtnSelected = true;
            self.isSuccess = !!canShowMsg;
            jQuery.get(url, { transactionId: transId, profileId: profileId, isRadioPrintBtnSelected: isRadioPrintBtnSelected }, $.proxy(self.populateECards, self))
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        populateECards: function (data) {
            var self = this;
            if (data) {
                $("#divStudentECards").toggleClass("hide", false);
                $("#divECardStatus").toggleClass("hide", true);
                $("#divStudentECards").html(data);
                if (self.isSuccess) {
                    $("#divAlert").toggleClass("hide", false);
                }
                var tbl = $("#tblECards").DataTable();

                if (tbl.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(tbl,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Student eCards")
                                }
                            ]
                        });

                    $("[data-blocked]").closest("tr").addClass("blockedInRed");

                    $("#exportECard").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $("#lnkGoResults").click(self.NavigateToResults);
                    appCommon.focusMessage();
                }
            }

        },

        NavigateToResults: function (e) {
            e.preventDefault();
            $("#divStudentECards, #divEditCard").html("");
            $("#divStudentECards, #divEditCard").toggleClass("hide", true);
            $("#divECardStatus").toggleClass("hide", false);
            if ($("#divResults").is(":visible")) {
                appCommon.focusArea("#divResults");
            }
            else {
                appCommon.focusArea("#partial");
            }
        }
    }
}
;
var AppEcardUpload = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    var validateRequest = function () {
        $("#error").html("");
        $("#error").addClass("hide");
        var file = $("#dataFile")[0].files;
        var errorMsg = [];
        if (file.length == 0) {
            errorMsg[errorMsg.length] = window.resources["TextFileNameRequired"];
        }

        // if (file.length == 1 && file[0].type != "application/vnd.ms-excel") {
        var extension = file[0].name.substr(file[0].name.lastIndexOf('.') + 1).toLowerCase();

        if (extension != "xls" && extension != "xlsx" ) {
       
            errorMsg[errorMsg.length] = window.resources["TextFileShouldBeExcel"];
        }
        
        if (errorMsg.length > 0) {
            return appCommon.showResponseError("error", "errlist", errorMsg);
        }

        return true;
    }

    return {
        init: function () {

        },

        btnClick_upload_ecardupload: function () {

            if (!validateRequest()) return false;
           

            var data = new FormData();

            var files = $("#dataFile")[0].files;
            for (var i = 0; i < files.length; i++) {
                data.append("file", files[i]);
            }
            var url = $("#upload").data("url");
            jQuery.ajax({
                url: url,
                type: "POST",
                contentType: false,
                processData: false,
				data: data,
                dataType: "html",
                success: function (result) {
                    $("#partial").html(result);
                    $("#error").addClass("hide");
                    $("#success").addClass("hide");
                    if (result == "") {
                        $("#error").html("");
                        $("#success").html("");
                        $("#success").append(window.resources["TextSuccessFileProcess"]);
                        $("#dataFile").val("");
                        $("#success").removeClass("hide");
                    } else {
                        $("#success").html("");
                        appCommon.showResponseError("error", "errlist", window.resources["TextFailedFileProcess"]);
                        $("#dataFile").val("");
                    }

                    appCommon.focusMessage();

                    $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]],
                        "columnDefs": [{
                            "targets": [7],
                            "render": function (data, type, full, meta) {

                                var errors = data.split('|');
                                var result = '<span><ul>';
                                for (var i = 0; i < errors.length - 1; i++) {
                                    result += "<li style='margin-left: -1.5em'>" + errors[i] + "</li>";
                                }
                                result += "</ul>";
                                return result;
                            }

                        }]
                    });
                 
                },
                error: function (errMsg) {
                    $("#success").html("");
                    appCommon.showResponseError("error", "errlist", errMsg.responseJSON["errorMessage"]);
                    $("#dataFile").val("");
               
                    appCommon.focusMessage();
                }
            });

            return false;
        }
    }
}
;
var AppLocationEcardStatus = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var hideAdvancedOpt = true;
    var filterBy = "";
    var clearDaysView = false;
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var courseId = $("#eCardStatusForm").find('select[id="CourseId"]').val();
        var startDate = $("#eCardStatusForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardStatusForm").find('input[id="EndDate"]').val();
        var trainingCenter = $("#eCardStatusForm").find('select[id="ddlTC"]').val();
        var instructor = $("#eCardStatusForm").find('select[id="ddlInstructor"]').val();
        var location = $("#eCardStatusForm").find('select[id="ddlLocation"]').val();
        var errorMsg = [];
        if (isValidate) {
            if (!courseId || courseId.length <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }

            if (filterBy !== "") {
                if ("" === trainingCenter || trainingCenter <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                } else if (filterBy === "location") {
                    if ("" === location || location <= 0) {
                        errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                    }
                } else if (filterBy === "instructor") {
                    if ("" === location || location <= 0) {
                        errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                    }
                    else if ("" === instructor || instructor <= 0) {
                        errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
                    }
                }
            }

        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextTransactionsDatesRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["TransactionDate"]);
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("assignError", "errlist", errorMsg);
            return false;
        }

        return true;
    }

    return {
        init: function () {
            var self = this;
            $("#divOptions").toggleClass("hide", true);
            $("#lnkAdvanced").on("click", self.showHideOptions);
            $("#lnkAdvanced").toggleClass("hide", true);
            var profileId = $("#profileId option:selected").val();
            if (profileId && profileId == window.RoleType.Instructor.value) {
                $("#radioTc").toggleClass("hide", false);
            }

            self.initMultiSelect();

            $("#divECardStatus").on("change", "#profileId", $.proxy(self.changeProfile, self));

            $("#VAMCourseId").on("change", $.proxy(self.changeVAMCourse, self));
            $("#CourseId").on("change",
                function (e) {
                    //var courseId = $(e.target).val();
                    var isInstructor = $("#profileId option:selected").val() == window.RoleType.Instructor.value;
                    var courseId = $("#CourseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
                    var url = $(e.target).data("url");
                    var hasChild = $("#CourseId").find(':selected').map(function (a, item) {
                        return $(item).data("isparent");
                    }).get().join(",");
                    if (hasChild == "True") { //VAM Course                    
                        $("#divVAMCourse").toggleClass("hide", false);

                        jQuery.get(url, { courseId: courseId, isInstructor: isInstructor }, $.proxy(self.loadVAMCourse, self))
                       .error(function (err) {
                           appCommon.showResponseError("statusErr", "errlist", err);
                       });
                    } else {
                        $("#divVAMCourse").toggleClass("hide", true);
                        $("#VAMCourseId").multiselect("deselectAll", false).multiselect("refresh");
                    }
                    self.btnClick_reset_ecardRequests(true);
                    var profileId = $("#profileId option:selected").val();
                    if (courseId) {
                        $("#lnkAdvanced").toggleClass("hide", false);
                        self.getTCList({
                            courseIds: $("#CourseId").find(':selected')
                                .map(function (a, item) { return item.value; }).get().join(","),
                            profileId: profileId
                        });
                    } else {
                        $("#lnkAdvanced").toggleClass("hide", true);
                    }

                    $("#ddlLocation").val("");
                    $("#ddlTC").val("");
                });

            $("#ddlTC")
              .on("change",
                    function (e) {
                        var profileId = $("#profileId option:selected").val();
                        if (profileId && profileId == window.RoleType.Instructor.value && filterBy === "tc") {

                            return false;
                        }

                        var trainingCenterId = $(e.target).val();

                        $("#divInstructor").toggleClass("hide", true);
                        if (trainingCenterId) {
                            self.getLocation({ TcId: trainingCenterId, profileId: profileId });
                            $("#divLocation").toggleClass("hide", false);

                        } else {
                            $("#divLocation").toggleClass("hide", true);
                        }

                        $("#ddlLocation").val("");

                    });

            $("#ddlLocation")
              .on("change",
                    function (e) {
                        if (filterBy === "location") return;

                        var locationId = $(e.target).val();

                        if (locationId) {
                            $("input[id=radActive]:radio").prop("checked", true);

                            var courseIds = $("#VAMCourseId").find(':selected')
                  .map(function (a, item) { return item.value; }).get().join(",");

                            if (courseIds == "") {
                                courseIds = $("#CourseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
                            }

                            self.getInstructor({
                                courseIds: courseIds,
                                tcId: $("#eCardStatusForm").find('select[id="ddlTC"]').val(),
                                isActive: true
                            });
                            $("#divInstructor").toggleClass("hide", false);
                        } else {
                            $("#divInstructor").toggleClass("hide", true);
                        }
                    });

            $("input[type=radio][name=fromType]").on("change", function (e) {
                $("#assignError").html("").addClass("hide");
                var $el = $(e.target);
                filterBy = $el.val();
                $("#ddlTC").val("");
                $("#ddlInstructor").val("");
                $("#ddlLocation").val("");
                $("#divTC").toggleClass("hide", false);
                $("#divType").toggleClass("hide", false);
                $("#divInstructor").toggleClass("hide", true);
                $("#divLocation").toggleClass("hide", true);
            });

            $('input[type=radio][name=instType]').on('change', function (e) {
                self.toggleInstrStatus(e);
            });
        },

        initMultiSelect: function () {
            $("#CourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

            $("#VAMCourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

          //  $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiInst");


        },

        toggleInstrStatus: function (e) {

            var self = this;
            var $el = $(e.target);
            $("#assignError").html("").addClass("hide");

            var instType = $el.val();

            var courseIds = $("#VAMCourseId").find(':selected')
  .map(function (a, item) { return item.value; }).get().join(",");

            if (courseIds == "") {
                courseIds = $("#CourseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
            }

            self.getInstructor({
                courseIds: courseIds,
                tcId: $("#eCardStatusForm").find('select[id="ddlTC"]').val(),
                isActive: instType === "act" ? true : false
            });
        },

        changeProfile: function (e) {
            var profileId = $(e.target).val();
            window.location.href = $("#hdnProfileUrl").val() + '?profileId=' + profileId;
        },

        getTCList: function (inputs) {
            // if (!validateRequest(true)) return false;
            var tcUrl = $("#eLoc").data("url");
            jQuery.get(tcUrl, inputs,
                        function (data) {
                            var subItems = [];
                            subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                            if (data && data.length > 0) {
                                $.each(data,
                                    function (index, item) {
                                        subItems.push($("<option/>", {
                                            value: item.TrainingCenterId, text: item.Name
                                        }));
                                    });
                            }

                            $("#ddlTC").empty().append(subItems);
                            $('#ddlTC').val('');
                        })
                    .error(function (err) {
                        $("#ddlTC").empty();
                        appCommon.showResponseError("assignError", "errlist", err);
                    });
        },

        getInstructor: function (inputs) {
            //if (!validateRequest(true)) return false;
            var url = $("#inst").data("url");
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: window.resources["SelectInstructors"] }));
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", {
                                    value: item.Id, text: item.Name
                                }));
                            });
                    }

                    $("#ddlInstructor").empty().append(subItems).val('');
                })
                .error(function (err) {
                    $("#ddlInstructor").empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getLocation: function (inputs) {
            // if (!validateRequest(true)) return false;
            var url = $("#ddlLocation").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", {
                                    value: item.Id, text: item.Name
                                }));
                            });
                    }

                    $("#ddlLocation").empty().append(subItems);
                    $('#ddlLocation').val('');
                })
                .error(function (err) {
                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        showHideOptions: function (e) {

            hideAdvancedOpt = !hideAdvancedOpt;

            var $caret = $(e.target).find("span.caret");
            setTimeout(function () {
                var profileId = $("#profileId option:selected").val();
                if (profileId && profileId == window.RoleType.Instructor.value && !hideAdvancedOpt) {
                    $("#radioTc").toggleClass("hide", false);
                    $("#radioInst").toggleClass("hide", true);
                }

                $("#divOptions").toggleClass("hide", hideAdvancedOpt);
            }, 100);
            $caret.toggleClass("rotate", !hideAdvancedOpt);

            return false;
        },

        loadVAMCourse: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                // subItems.push($("<option/>", { value: "", text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.CourseId, text: item.Name
                        }));
                    });
                $("#VAMCourseId").empty().append(subItems);
                $("#VAMCourseId").val('');
                $("#VAMCourseId").empty().append(subItems).multiselect('rebuild');
            }
        },

        changeVAMCourse: function (e) {
            var self = this;
            var instType = "act";
            var tcId = $("#eCardStatusForm").find('select[id="ddlTC"]').val()
            var courseIds = $("#VAMCourseId").find(':selected')
					.map(function (a, item) { return item.value; }).get().join(",");

            if (courseIds == "") {
                courseIds = $("#CourseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
            }

            if (tcId != "") {
                self.getInstructor({
                    courseIds: courseIds,
                    tcId: tcId,
                    isActive: true
                });
            }
        },

        btnClick_search_ecardRequests: function (isValidate) {

            var self = this;
            if (!validateRequest(isValidate)) return false;
            var isLocationProfile = $("#profileId option:selected").val() != window.RoleType.Instructor.value;
            var url = $("#fetchReq").data("url");
            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: $("#eCardStatusForm").serialize(),
                success: function (result) {
                    $("#partial").html(result);

                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": window.area.toLowerCase() === "distributor" ? [[6, "desc"]] : [[6, "desc"]],
                        columnDefs: [{
                            "targets": [0],
                            "visible": false

                        }]
                    });
                    if (!isValidate) {
                        $("#spdaysView").toggleClass("hide", false);
                    } else {
                        $("#spdaysView").toggleClass("hide", true);
                    }
                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                               {
                                   extend: 'excelHtml5',
                                   title: appCommon
                                        .getFileName(isLocationProfile ? "eCard Location eCard Status" : "Instructor eCard Status"),
                                   exportOptions: {
                                       columns: ':visible'
                                   }
                               }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);

                        $(".lnkecard").click($.proxy(self.loadECards, self));
                        if (isValidate) {
                            appCommon.focusArea("#partial");
                        }
                    }
                    $('[data-toggle="popover"]').popover();
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlst", errMsg);
                }
            });

            return false;
        },

        btnClick_reset_ecardRequests: function (limitedClear) {
            var self = this;
            $("#assignError").html("").addClass("hide");

            hideAdvancedOpt = true;
            $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);
            $("#lnkAdvanced").toggleClass("hide", true);


            $("#ddlTC").empty().val("");
            $("#ddlInstructor").empty().val("");
            $("#ddlLocation").empty().val("");
            $("#ddlType").val("");
            $("input[type=radio][name=fromType]").prop("checked", false);

            filterBy = "";
            $("#divOptions").toggleClass("hide", true);
            $("#divTC").toggleClass("hide", true);
            $("#divType").toggleClass("hide", true);
            $("#divLocation").toggleClass("hide", true);
            $("#divInstructor").toggleClass("hide", true);

            if (!limitedClear) {
                $("#CourseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getMonthOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());

                clearDaysView = false;

                self.btnClick_search_ecardRequests(false);
            }

            if (!limitedClear) {
                appCommon.focusMessage();
            }

        },

        loadECards: function (e) {
            e.preventDefault();
            var self = this;
            var transId = $(e.target).data("transactionid");
            self.getECards(transId);
        },

        getECards: function (transId, canShowMsg) {
            var self = this;
            var profileId = $("#profileId option:selected").val();
            var url = $("#hdnUrl").val();
            self.isSuccess = !!canShowMsg;
            jQuery.get(url, { transactionId: transId, profileId: profileId }, $.proxy(self.populateECards, self))
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        populateECards: function (data) {
            var self = this;
            if (data) {
                $("#divStudentECards").toggleClass("hide", false);
                $("#divECardStatus").toggleClass("hide", true);
                $("#divStudentECards").html(data);
                if (self.isSuccess) {
                    $("#divAlert").toggleClass("hide", false);
                }
                var tbl = $("#tblECards").DataTable();

                if (tbl.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(tbl,
                    {
                        buttons: [
                             {
                                 extend: 'excelHtml5',
                                 title: appCommon.getFileName("Student eCards")
                             }
                        ]
                    });

                    $("[data-blocked]").closest("tr").addClass("blockedInRed");

                    $("#exportECard").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $("#lnkGoResults").click(self.NavigateToResults);
                    appCommon.focusMessage();
                }
            }

        },

        NavigateToResults: function (e) {
            e.preventDefault();
            $("#divStudentECards, #divEditCard").html("");
            $("#divStudentECards, #divEditCard").toggleClass("hide", true);
            $("#divECardStatus").toggleClass("hide", false);
            if ($("#divResults").is(":visible")) {
                appCommon.focusArea("#divResults");
            }
            else {
                appCommon.focusArea("#partial");
            }
        }
    }
}
;
var AppEmailedEcards = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var hideAdvancedOpt = true;
    var clearDaysView = false;
    var filterBy = null;
    var appCommon = new AppCommon();

    var courseId;
    var tcId;
    var roleId;
    var validateSearchOptions = function () {
        $("#statusErr").html("");
        $("#statusErr").toggleClass("hide", true);
        var errorMsg = [];
        var roleId = $("#ddlInventoryPool option:selected").val();
        var cId = $("#courseId option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();
      //var locationId = $("#ddlLocation option:selected").val();
        var instructorId = $("#ddlInstructor option:selected").val();
        var startDate = $("#emailEcardsForm").find('input[id="StartDate"]').val();
        var endDate = $("#emailEcardsForm").find('input[id="EndDate"]').val();

        if (!cId || cId.length <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextAssignmentDateRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateOfAssignment"]);
        }

       // if (filterBy) {

            if (!tcId || tcId <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
       // }
        if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
            if (!tsId || tsId <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
            }
        }
       /* if (filterBy == "fromLoc") {
            if (tcId && !locationId || locationId <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
            }
        }*/

        if (filterBy == "fromIns") {
            if (tcId && !instructorId || instructorId <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
            }
        }

        return appCommon.showResponseError("statusErr", "errlist", errorMsg);
    }

    return {

        init: function () {
            var self = this;
            $("#divOptions").toggleClass("hide", true);
            $('input[type=radio][name=transBy]').on('change', function (e) {
                //self.toggleOptions(e);

                $("#divInstType").toggleClass("hide", roleId == window.RoleType.Instructor.value);
                $("input[id=radActive]:radio").prop("checked", roleId != window.RoleType.Instructor.value);
                instrType = $("input[name=instType]:checked").val();
                var tcId = $("#ddlTC option:selected").val();
                var tsId = $("#ddlTS option:selected").val();
                var roleId = $("#ddlInventoryPool option:selected").val();
                if ($("input[name=transBy]:checked").val() == 'fromTs') {
                    //bind Traing Site
                    var inp = { tcId: tcId, roleId: roleId };
                    var url = $("#ddlTC").data("tsurl");
                    self.getData(url, inp, "#ddlAsoTS", window.resources["TextSelectTrainingSite"]);
                    $("#divAsoTS").toggleClass("hide", false);
                    $("#divInstructor").toggleClass("hide", true);
                }
                else {
                 $("#divAsoTS").toggleClass("hide", true);
                var url = $("#divUrl").data("instructorurl");
                 $("#divInstructor").toggleClass("hide", false);
                    self.getData(url,
                    { courseIds: courseId, tcId: tcId, tsId: tsId, roleId: roleId, isActive: roleId == window.RoleType.Instructor.value ? true : instrType === "act" ? true : false },
                    "#ddlInstructor",
                    window.resources["TextSelectInstructor"]);
                }
            });

            $("#lnkAdvanced").on("click", self.showHideOptions);
            $("#lnkAdvanced").toggleClass("hide", true);

            $(".datepicker").on("change",
                function (e) {
                    clearDaysView = true;
                });

            $("#courseId")
                .on("change",
                    function (e) {
                        courseId = $("#courseId").find(':selected')
                            .map(function (a, item) { return item.value; }).get().join(",");
                        self.resetAll();
                        self.showOptions();
                        hideAdvancedOpt = clearDaysView = true;
                        $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);
                        $("#lnkAdvanced, #divOptions").toggleClass("hide", true);
                        if (courseId) {
                            self.clearErrorMsg();
                            $("#lnkAdvanced").toggleClass("hide", roleId == RoleType.Instructor.value);
                        }
                    });

            /*  $("#ddlInventoryPool")
                  .on("change",
                      function (e) {
                          var $el = $(e.target);
                          roleId = $el.val();
                          self.resetAll();
                          self.showOptions();
                      }); */
            $("#ddlInventoryPool")
                .on("change",
                    function (e) {
                        var tcList = JSON.parse($('#algnTCWithRole').val());
                         roleId = $("#ddlInventoryPool option:selected").val();

                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                        $.each(tcList,
                            function (index, item) {
                                if (item.RoleId == roleId) {
                                    subItems.push($("<option/>", { value: item.EntityId, text: item.EntityName, "data-isprintonly": item.IsPrintOnly }));
                                }
                            });

                        $("#ddlTC").empty().append(subItems).val("");
                        $("#divResults").toggleClass("hide", true);
                        $("#divSite").toggleClass("hide", true);
                        $("#divSearchBox").toggleClass("hide", true);

                    });

            $("#ddlTC")
                .on("change",
                    function (e) {
                        self.resetSearchBox();
                       // self.showOptions();
                       // $("#divOptions").toggleClass("hide", true);
                        var courseUrl = $('#ddlTC').data("url");
                        var instrUrl = $('#ddlTC').data("instrurl");
                        var inp = {};
                        var tcId = $("#ddlTC option:selected").val();
                         roleId = $("#ddlInventoryPool option:selected").val();
                        if (roleId == '' || tcId == '') {
                             $("#divSearchBox").toggleClass("hide", true);
                            $("#divSite").toggleClass("hide", true);
                            return;
                        }
                        if (roleId == RoleType.Instructor.value) {
                            $('#divInst').addClass('hide');
                        }
                        else {
                            $('#divInst').removeClass('hide');
                        }
                        $("#statusErr").toggleClass("hide", true);
                        $("#divSearchResult").toggleClass("hide", true);
                        $("#ddlTS").val("");
                        if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value || roleId == RoleType.Instructor.value) {
                            //load ts list
                            if (tcId > 0) {
                               // var isInstrDomestic = (roleId == RoleType.Instructor.value && $('#hdnIsIntlAlignment').val() == 0)

                                self.getData(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#courseId", window.resources["TextSelectAll"]);
                                var inp = { tcId: tcId, roleId: roleId };
                                var url = $("#ddlTC").data("tsurl");
                                $("#divSite").toggleClass("hide", false);
                                self.getData(url, inp, "#ddlTS", window.resources["TextSelectTrainingSite"]);
                                $("#divSite").toggleClass("hide", false);
                                $("#spanTsAstrkRequire").toggleClass("hide", (roleId == RoleType.Instructor.value ));

                                if (roleId == RoleType.Instructor.value) 
                                    $("#divSearchBox").toggleClass("hide", false);
                                else 
                                    $("#divSearchBox").toggleClass("hide", true);
                            }
                            return;
                        }
                        else {
                            $("#divSite").toggleClass("hide", true);
                        }

                        $("#divSearchBox").toggleClass("hide", false);

                    });

            $("#ddlTS")
                .on("change",
                    function (e) {
                        self.resetSearchBox();
                        var $el = $(e.target);
                        var tsId = $el.val();
                        var courseUrl = $('#ddlTS').data("url");
                        
                        if ((tsId == '' || tsId.length < 0) && (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value)) {
                            var courseUrl = $('#ddlTC').data("url");
                            var tcId = $("#ddlTC option:selected").val();
                            self.getData(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#courseId", window.resources["TextSelectAll"]);
                            $("#divSearchBox").toggleClass("hide", true);
                        } else if (tsId == '' || tsId.length < 0)  // This is for instructor role
                        {
                            var courseUrl = $('#ddlTC').data("url");
                            var tcId = $("#ddlTC option:selected").val();
                            self.getData(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#courseId", window.resources["TextSelectAll"]);
                            $("#divSearchBox").toggleClass("hide", false);
                        } else {
                            self.getData(courseUrl, { orgId: tsId, orgType: 'ts', roleId: roleId }, "#courseId", window.resources["TextSelectAll"]);
                            $("#divSearchBox").toggleClass("hide", false);
                              }                   
                    });

            $('input[type=radio][name=instType]').on('change', function (e) {

                self.clearErrorMsg();
                var $el = $(e.target);
                var instType = $el.val();
                var tcId = $("#ddlTC option:selected").val();
                var tsId = $("#ddlTS option:selected").val();
                var roleId = $("#ddlInventoryPool option:selected").val();
                var courseIds = $("#courseId").find(':selected')
                    .map(function (a, item) { return item.value; }).get().join(",");

                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
                $("#ddlInstructor").empty().append(subItems).val('');

                $("#divInstructor").toggleClass("hide", false);
                self.getData($("#divUrl").data("instructorurl"),
                    { courseIds: courseIds, tcId: tcId, tsId: tsId, roleId: roleId, isActive: instType === "act" },
                    "#ddlInstructor",
                    window.resources["TextSelectInstructor"]);
            });

            $(document)
                .ready(function () {
                   // self.searchTransactions(false);
                    setTimeout(function () { $('#ddlInventoryPool').trigger('change'); }, 500);
                });

            self.initMultiSelect();
        },

        initMultiSelect: function () {
            $("#courseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

            $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

        },

        toggleOptions: function (e) {

            var self = this;
            self.clearErrorMsg();
            var $el = $(e.target);
            filterBy = $el.val();
            //var courseId = $("#courseId option:selected").val();
            if (!courseId) {
                $el.closest(".checked").removeClass("checked");
                $el.removeAttr("checked");
                return appCommon.showResponseError("statusErr", "errlist", window.resources["TextCourseRequired"]);
            }

            $("#divTC").toggleClass("hide", false);
            $("#divInstructor, #divLocation").toggleClass("hide", true);

            $("#ddlTC, #ddlLocation, #ddlInstructor").val('');

            roleId = $("#ddlInventoryPool option:selected").val();
            var url = $("#divUrl").data("tcurl");
            self.getData(url, { courseIds: courseId, roleId: roleId }, "#ddlTC", window.resources["SelectTrainingCenter"]);

            $("#divTC").toggleClass("hide", false);
            $("#ddlTC").val('');
        },
        resetSearchBox: function () {
            var self = this;
            $("#courseId").multiselect("deselectAll", false).multiselect("refresh");
         
            $('#divResults').html('')
           /* hideAdvancedOpt = !hideAdvancedOpt;
            var $caret = $("#lnkAdvanced").find("span.caret");
            setTimeout(function () {$("#divOptions").toggleClass("hide", hideAdvancedOpt);},100);
            $caret.toggleClass("rotate", !hideAdvancedOpt); */
            $("#lnkAdvanced, #divOptions").toggleClass("hide", true);
        },
        resetAll: function () {
            $('input[type=radio][name=transBy]').prop("checked", false);
            $('input[type=radio][name=instType]').prop("checked", false);

            filterBy = "";


            $("#divAsoTS").toggleClass("hide", true);
            $("#ddlAsoTS").val('');


            $("#divInstructor").toggleClass("hide", true);
            $("#ddlInstructor").val('');

        },

        getData: function (url, inputs, objDropdown, textDefaultOption) {
            var subItems = [];
            if (objDropdown != '#courseId') {
                subItems.push($("<option/>", {
                    value: '', text: textDefaultOption
                }));
            }

            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }

                    if (objDropdown == '#courseId') {
                        $("#courseId").empty().append(subItems).multiselect('rebuild').val('');
                    }
                    else {
                        $(objDropdown).empty().append(subItems).val('');
                    }
                })
                .error(function (err) {
                    $(objDropdown).empty().append(subItems).val('');
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        showOptions: function () {

            roleId = $("#ddlInventoryPool option:selected").val();

            $("#rdoTc").toggleClass("hide", true);
            $("#rdoLocation").toggleClass("hide", true);
            $("#rdoInstructor").toggleClass("hide", true);

          /*  if (roleId != RoleType.Instructor.value) {
                $("#divInstType").toggleClass("hide", roleId == window.RoleType.Instructor.value);
                $("input[id=radActive]:radio").prop("checked", roleId != window.RoleType.Instructor.value);
                instrType = $("input[name=instType]:checked").val();

                var roleId = $("#ddlInventoryPool option:selected").val();
                var tcId = $("ddlTC option:selected").val();
                var tsId = $("#ddlTS option:selected").val();
                self.getData(url,
                    { courseIds: courseId, tcId: tcId, tsId: tsId, roleId: roleId, isActive: roleId == window.RoleType.Instructor.value ? true : instrType === "act" ? true : false },
                    "#ddlInstructor",
                    window.resources["TextSelectInstructor"]);

                $("#rdoInstructor").toggleClass("hide", false);
            } */
          /*  if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value || roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                $("#rdoInstructor").toggleClass("hide", false);
            }
            else {
                $("#divOptions").toggleClass("hide", true);
            }*/
            if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value ) {
                $("#rdoTs").toggleClass("hide", false);
                $("#rdoInstructor").toggleClass("hide", false);
            }

            if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                $("#rdoInstructor").toggleClass("hide", false);
            }

            if (roleId == RoleType.Instructor.value) {
               // $("#rdoTc").toggleClass("hide", false);
                $("#divOptions").toggleClass("hide", true);
            } 

        },

        showHideOptions: function (e) {

            if (!courseId) {
                return appCommon.showResponseError("statusErr", "errlist", window.resources["TextCourseRequired"]);
            }

            hideAdvancedOpt = !hideAdvancedOpt;
            var $caret = $(e.target).find("span.caret");
            setTimeout(function () {
                $("#divOptions").toggleClass("hide", hideAdvancedOpt);
            },
                100);
            $caret.toggleClass("rotate", !hideAdvancedOpt);

            return false;
        },

        clearErrorMsg: function () {
            $("#statusErr").html("");
            $("#statusErr").toggleClass("hide", true);
        },

        clearSearchOptions: function (limitedClear) {
            this.clearErrorMsg();

            filterBy = null;

            $("#ddlTC,#ddlTS, #ddlAsoTS, #ddlInstructor").val('');

            $("#divOptions, #divAsoTS, #divInstructor, #lnkAdvanced").toggleClass("hide", true);

            $('input[type=radio][name=transBy]').prop("checked", false);
            $('input[type=radio][name=instType]').prop("checked", false);

            hideAdvancedOpt = true;
            $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);

            if (!limitedClear) {
                $("#courseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getFiveDaysOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());
                clearDaysView = false;
                this.searchTransactions(false);
            }

            appCommon.focusMessage();

            return false;
        },

        buildSearchRequest: function () {

            window.emailedEcards.LocationId =
                window.emailedEcards.InstructorId =
                window.emailedEcards.TrainingCenterId = null;

            window.emailedEcards.CourseId = $("#courseId").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");
            window.emailedEcards.StartDate = $("#emailEcardsForm").find('input[id="StartDate"]').val();
            window.emailedEcards.EndDate = $("#emailEcardsForm").find('input[id="EndDate"]').val();
            window.emailedEcards.TrainingCenterId = $("#ddlTC option:selected").val();
            
            if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) {
                window.emailedEcards.TSId = $("#ddlAsoTS option:selected").val();
            }
            else {
                window.emailedEcards.TSId = $("#ddlTS option:selected").val();
            }
            window.emailedEcards.SelectedInventoryPool = $("#ddlInventoryPool option:selected").val();

            //   if (filterBy === "fromIns") {
            window.emailedEcards.InstructorId = $("#ddlInstructor option:selected").val();
            //  }

            //   if (filterBy === "fromLoc") {
           // window.emailedEcards.LocationId = $("#ddlLocation option:selected").val();
            //  }
        },

        searchTransactions: function (isValidate) {
            if (isValidate) {
                if (!validateSearchOptions()) return false;
            }
            this.buildSearchRequest();

            var url = $("#btnSearch").data("url");

            var self = this;

            jQuery.post(url,
                window.emailedEcards,
                function (data) {
                    if (data) {
                        $("#divResults").toggleClass("hide", false);
                        $("#divResults").html(data);
                        var tbl = $("#example").DataTable({
                            columnDefs: roleId == window.RoleType.Instructor.value ? [
                                {
                                    targets: [3],
                                    visible: false
                                }
                            ] : []
                        });

                        if (tbl.context.length > 0) {
                            var buttons = new $.fn.dataTable.Buttons(tbl,
                                {
                                    buttons: [
                                        {
                                            extend: 'excelHtml5',
                                            title: appCommon.getFileName("Issued eCards"),
                                            exportOptions: {
                                                columns: roleId == window.RoleType.Instructor.value ? [0, 1, 2, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6]
                                            }
                                        }
                                    ]
                                });
                            $("#exportbutton").prepend(buttons.container())
                                .find("a.dt-button").addClass("btn btn-primary")
                                .text(window.resources["TextDownload"]);
                        }

                        $("#spdaysView").toggleClass("hide", clearDaysView);
                        $("#example").on("click", ".lnkecard", $.proxy(self.loadECards, self));
                        $('[data-toggle="popover"]').popover();

                        if (isValidate) {
                            appCommon.focusArea("#divResults");
                        }
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });

            return false;
        },

        loadECards: function (e) {
            e.preventDefault();
            var self = this;
            var transId = $(e.target).data("transactionid");
            var url = $("#divUrl").data("studentlist");
            //studentlist
            jQuery.get(url, { transactionId: transId }, $.proxy(self.populateECards, self))
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        populateECards: function (data) {
            var self = this;
            if (data) {
                $("#divStudentECards").toggleClass("hide", false);
                $("#divECardStatus").toggleClass("hide", true);
                $("#divStudentECards").html(data);
                var tbl = $("#tblECards").DataTable();

                if (tbl.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(tbl,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Student eCards")
                                }
                            ]
                        });

                    $("#exportECard").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $("#lnkGoResults").click(self.NavigateToResults);
                    appCommon.focusArea("#divStudentECards");
                }
            }

        },

        NavigateToResults: function (e) {
            e.preventDefault();
            $("#divStudentECards").html("");
            $("#divStudentECards").toggleClass("hide", true);
            $("#divECardStatus").toggleClass("hide", false);
            appCommon.focusArea("#divResults");
        }
    }
}
;
var AppExpiringEcards = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();
    var reportType;
    var userRole;

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlLocation option:selected").val();
        var tsId = $("#ddlTS option:selected").val();
        var errorMsg = [];

        if (tcId === "" )
        {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }
        //if (userRole == RoleType.EcardAdmin.value) {
        //    if (locationId === "") {
        //        errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
        //    }
        //}
        if (userRole == RoleType.TSC.value || userRole == RoleType.TSAdmin.value) {
            if (tsId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
            }
        }
        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }

        return true;
    }

    return {

        init: function () {
            var self = this;
            $("#divReport input[name=reportType]:radio").on("change",
                function (e) {
                    var $el = $(e.target);
                    var url = $el.data("url");
                    reportType = $el.val();
                    userRole = $("#hdnUserRole").val();
                    self.hideAll();




                    if (reportType == "summary") {

                        if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value || userRole == RoleType.TSC.value  || userRole == RoleType.TSAdmin.value)
                        {
                            $("#divTrainingCenter").toggleClass("hide", false);
                            //$("#divLocation").toggleClass("hide", false);
                            // $("#divTrainingSite").toggleClass("hide", false);
                             $("#divSubmit").toggleClass("hide", false);
                        }
                        else {
                             $("#partial").toggleClass("hide", false);
                            self.getReport(url, reportType);
                         }
                    }



                    if (reportType == "detail") {
                        if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value || userRole == RoleType.TSC.value || userRole == RoleType.TSAdmin.value) {
                              $("#divTrainingCenter").toggleClass("hide", false);
                              //$("#divLocation").toggleClass("hide", false);
                             // $("#divTrainingSite").toggleClass("hide", false);
                              $("#divSubmit").toggleClass("hide", false);
                          }
  
                          if (userRole == RoleType.SuperUser.value || userRole == RoleType.ECCAdmin.value || userRole == RoleType.CSR.value) {
  
                              $("#divTrainingCenter").toggleClass("hide", false);
                              $("#divSubmit").toggleClass("hide", false);
                          }
                    }
                    $("#ddlTC").val("");
                    $("#ddlTS").val("");
                });

            $("input[id=summary]:radio").prop("checked", true);
            //  $("input[id=summary]:radio").trigger("change");

            $("#ddlTC")
                .on("change",
                    function (e) {

                        var $el = $(e.target);
                        var tcId = $el.val();
                        if (tcId > 0) {
                            if (userRole == RoleType.TSC.value || userRole == RoleType.TSAdmin.value) {
                                //   self.getLocation({ TcId: tcId });
                                var role = $("#hdnUserRole").val()
                                // var roleId = self.getRoleId(role);
                                self.getSites({ TcId: tcId, roleId: role });
                                $("#divTrainingSite").toggleClass("hide", false);
                            }
                            else {
                                $("#divTrainingSite").toggleClass("hide", true);
                            }
                        }
                    });

            //$("#ddlReports")
            //   .on("change",
            //       function (e) {
            //           var url = $(this).val();
            //           if (url != null && url != '') {
            //               window.location.href = url;
            //           }
            //       });

            $(document)
                .ready(function () {
                    var url = $("#divUrl").data("summary");
                    $("input[id=summary]:radio").trigger("change");
                    //$("#ddlReports").prop('selectedIndex', 1);
                    $("#ddlReports option:contains(Students with Expiring eCards)").attr('selected', true);
                   // if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                      //  $("#divTCNumber").toggleClass("hide", false);
                   // }
                });
        },

        hideAll: function () {
            $("#divTrainingCenter").toggleClass("hide", true);
            $("#divLocation").toggleClass("hide", true);
            $("#divTrainingSite").toggleClass("hide", true);
            $("#partial").toggleClass("hide", true);
            $("#divSubmit").toggleClass("hide", true);
        },

        getReport: function (url, reportType, inputs) {
            var self = this;

            jQuery.ajax({
                url: url,
                type: "GET",
                data: inputs,
                dataType: "html",
                success: function (result) {
                    $("#partial").html(result);

                    $("#partial").toggleClass("hide", false);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": reportType == "summary" ? [[0, "desc"]] : [[5, "desc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                            {
                                buttons: [
                                    {
                                        extend: 'excelHtml5',
                                        title: appCommon.getFileName("Expiring eCards")
                                    }
                                ]
                            });

                        if (reportType == "detail") {
                            $("#expotbutton").prepend(buttons.container())
                                .find("a.dt-button").addClass("btn btn-primary")
                                .text(window.resources["TextDownload"]);
                        }
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("search_error", "errlst", errMsg);
                }
            });

            return false;
        },
        getSites: function (inputs) {
            var url = $("#ddlTC").data("tsurl");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlTS").empty().append(subItems);
                        $('#ddlTS').val('');
                    }
                })

                .error(function (err) {
                    $("#ddlTS").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getLocation: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {
                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        btnSubmit_Click: function () {
            var self = this;
            var url;
            var tcId = $("#ddlTC option:selected").val();
            var locationId = $("#ddlLocation option:selected").val();
            var tsId = $("#ddlTS option:selected").val();
            var data = { TcId: tcId, LocationId: locationId, TsId: tsId };
            if (reportType == "summary") {
                url = $("#divUrl").data("summary");
            }
            if (reportType == "detail") {
                url = $("#divUrl").data("detail");
            }

            if (validateRequest()) {

                self.getReport(url, reportType, data);

            }
        }


    }
};
var AppInstrCandidateAssignment = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var toggleShowHide = {
        init: function () {
            var $el = $('a[data-toggle="collapse"]');
            $el.on('click', function (e) {
                ($el.delay(1000).hasClass('collapsed')) ? toggleShowHide.hide($el) : toggleShowHide.show($el);
            });
        },
        hide: function (obj) {
            obj.children('.text').text('Hide Info');
            (obj.children('.fa').hasClass('fa-caret-up')) ? obj.children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down') : '';
        },
        show: function (obj) {
            obj.children('.text').text('Show Info');
            (obj.children('.fa').hasClass('fa-caret-down')) ? obj.children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up') : '';
        }
    };

    var aslsInstrIntlProdNum = $("#hdnAslsInstrIntlProdNum").val();
    var aslsInstrDomsticProdNum = $("#hdnAslsInstrDomsticProdNum").val();
    var tcUrl = $("#divServiceUrl").data("tc_url");
    var tsUrl = $("#divServiceUrl").data("ts_url");
    var courseUrl = $("#divServiceUrl").data("course_url");
    var instructorUrl = $("#divServiceUrl").data("instructor_url");
    var quantityUrl = $("#divServiceUrl").data("quantity_url");
    var courseId = $("#CourseId option:selected").val();
    var isUpload;

    var validateAssignment = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];

        var courseId = $("#CourseId option:selected").val();
        var inventoryPool = $("#RoleId option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();
        var instructorId = $("#ddlInstructor option:selected").val();
        var availableQuantity = parseInt($("#availQty").text());
        isUpload = $('#radBulkUpload').is(':checked');
        var dataFile = $("#dataFile")[0].files;
        var roleId = $("#RoleId option:selected").val();
        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!inventoryPool || inventoryPool <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInventoryPoolRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && (!tsId || tsId <= 0)) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
        }

        if (!instructorId || instructorId <= 0) {
            if (!isUpload) {
                errorMsg[errorMsg.length] = window.resources["TextInstrCandidateRequired"];
            }
        }

        if (!availableQuantity || availableQuantity <= 0) {
            if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value)
                errorMsg[errorMsg.length] = window.resources["TextNoInventoryForTC"];
            if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value)
                errorMsg[errorMsg.length] = window.resources["TextNoInventoryForTS"];
        }

        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }

    return {

        init: function () {
            var self = this;

            if (courseId > 0) {
                $("#divInventoryPool").toggleClass("hide", false);
                $("#divAssignType").toggleClass("hide", false);
            } else {
                $("#divInventoryPool").toggleClass("hide", true);
                $("#divAssignType").toggleClass("hide", true);
            }

            $("#RoleId")
                .on("change",
                    function (e) {
                        var roleId = $(e.target).val();
                        if (roleId > 0) {
                            self.resetAll();
                            $("#divTC").toggleClass("hide", true);
                            $("#divTS").toggleClass("hide", true);
                            $("#divCourse").toggleClass("hide", true);
                            $("#divAssignType").toggleClass("hide", true);
                            $("#divFrom").toggleClass("hide", true);
                            //   $('input[type=radio][name=fromType]').prop("checked", false);

                            $("#divTC").toggleClass("hide", false);
                            //load tc
                            var url = $(e.target).data("url");
                            self.getData(url, { selectedRoleId: roleId }, '#ddlTC', '#divTC1', window.resources["SelectTrainingCenter"]);

                        }
                        else {
                            $("#assignError").toggleClass("hide", true);
                            $("#divTC").toggleClass("hide", true);
                            $("#divTS").toggleClass("hide", true);
                            $("#divFrom").toggleClass("hide", true);
                            $("#divAssignType").toggleClass("hide", true);
                            //   $("#divCourse").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#divSubmit").toggleClass("hide", true);

                        }
                    });

            /* $("#ddlInventoryPool")
                 .on("change",
                     function (e) {
                         var $el = $(e.target);
                         var inventorySource = $el.val();
 
                         if (courseId > 0) {
                             self.resetAll();
                             if (inventorySource == 2300009 || inventorySource == 2300010) {
                                 self.getData(tcUrl, { courseId: courseId, roleId: inventorySource }, '#ddlTC', '#divTC', window.resources["SelectTrainingCenter"]);
                             }
                         }
                     }); */

            $("#radRegular").on("change", function (e) {
                var $el = $(e.target);
                $("#divInstType").toggleClass("hide", false);
                $("#divInstructor").toggleClass("hide", false);
                $("#divUpload").toggleClass("hide", true);
                $("#divSubmit").toggleClass("hide", false);
                $('#dataFile').val('');
                $("#divInstType").toggleClass("hide", false);
                $("#radActive").trigger("click");
            });
            $("#radBulkUpload").on("change", function (e) {
                var $el = $(e.target);
                $("#divInstType").toggleClass("hide", true);
                $("#divInstructor").toggleClass("hide", true);
                $("#divUpload").toggleClass("hide", false);
                $("#divSubmit").toggleClass("hide", false);
                $("#divInstType").toggleClass("hide", true);
            });

            $("#CourseId")
                .on("change",
                    function (e) {
                        $("#assignError").toggleClass("hide", true);
                        var courseId = $(e.target).val();
                        var tcId = $('#ddlTC').val();
                        var tsId = 0;
                        var roleId = $('#RoleId').val();
                        if (roleId == 12500027 || roleId == 12500026) {
                            tsId = $("#ddlTS option:selected").val();
                        }
                        var hasIntlAlignment = $('#hdnHasIntlAlignment').val();
                        var productNumber = $('#CourseId option:selected').data('productnumber');

                        if (tcId > 0) {

                            if (productNumber == aslsInstrIntlProdNum && hasIntlAlignment == 1) {
                                $("#divAssignType").toggleClass("hide", true);
                                $("#divInstType").toggleClass("hide", true);
                            }
                            else if (productNumber == aslsInstrDomsticProdNum && hasIntlAlignment == 0) {
                                $("#divAssignType").toggleClass("hide", true);
                                $("#divInstType").toggleClass("hide", false);
                                $("#divUpload").toggleClass("hide", true);
                            }
                            else {
                                $("#divAssignType").toggleClass("hide", false);
                                $("#divInstType").toggleClass("hide", false);
                            }

                            $("#divInstructor").toggleClass("hide", false);
                            $("input[id=radRegular]:radio").prop("checked", true);
                            $("#radRegular").trigger("click");

                            $("input[id=radActive]:radio").prop("checked", true);
                            $("#radActive").trigger("click");

                            //  if (roleId == 2300009 || roleId == 2300010 || roleId == 12500027 || roleId == 12500026) {
                            $("input[id=radActive]:radio").prop("checked", true);
                            var instrType = $("input[name=instType]:checked").val();
                            self.getAvailableQty(courseId, roleId, tcId, tsId);
                            self.getData(instructorUrl,
                                {
                                    tcId: tcId,
                                    tsId: tsId,
                                    courseId: courseId,
                                    productNumber: productNumber,
                                    roleId: roleId,
                                    isActive: instrType === "act" ? true : false
                                },
                                '#ddlInstructor',
                                '#divInstructor',
                                window.resources["SelectInstructor"]);
                            //  }
                        } else {
                            $("#divInstructor").toggleClass("hide", true);
                            $("#divInstType").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#divSubmit").toggleClass("hide", true);
                            $("#divAssignType").toggleClass("hide", true);
                            $('#dataFile').val('');
                            $("#divUpload").toggleClass("hide", true);
                        }
                    });
            $("#ddlTC")
                .on("change",
                    function (e) {
                        $("#assignError").toggleClass("hide", true);
                        var roleId = $("#RoleId option:selected").val();
                        var tcId = $(e.target).val();
                        $('#ddlSite').val('');
                        if (tcId > 0) {
                            self.resetAll();
                            $("#divTC").toggleClass("hide", false);
                            $("#divTS").toggleClass("hide", true);
                            $("#divCourse").toggleClass("hide", true);
                            if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value) {
                                //load course
                                self.getData(courseUrl, { orgId: tcId, orgType: 'tc' }, "#CourseId", "#divCourse", window.resources["SelectCourse"]);
                            } else if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                                $("#divInstructor").toggleClass("hide", true);
                                $("#divBox").toggleClass("hide", true);
                                $("#divSubmit").toggleClass("hide", true);
                                // load training site
                                self.getData(tsUrl, { tcId: tcId, roleId: roleId }, "#ddlTS", "#divTS", window.resources["TextSelectTrainingSite"]);
                            }
                        } else {
                            $("#divTS").toggleClass("hide", true);
                            $("#divFrom").toggleClass("hide", true);
                            $("#divCourse").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#divSubmit").toggleClass("hide", true);
                            $("#divInstructor").toggleClass("hide", true);
                            $("#divAssignType").toggleClass("hide", true);
                            $("#divInstType").toggleClass("hide", true);
                        }

                    });
            $("#ddlTS")
                .on("change",
                    function (e) {

                        var tsId = $(e.target).val();
                        $("#assignError").toggleClass("hide", true);
                        var tcId = $("#ddlTC option:selected").val();
                        if (tsId > 0) {
                            self.resetAll();
                            $("#divCourse").toggleClass("hide", true);
                            self.getData(courseUrl, { orgId: tsId, orgType: 'ts' }, "#CourseId", "#divCourse", window.resources["SelectCourse"]);

                        } else {
                            $("#divInstructor").toggleClass("hide", true);
                            $("#divBox").toggleClass("hide", true);
                            $("#divSubmit").toggleClass("hide", true);
                            $("#divCourse").toggleClass("hide", true);
                            $("#divAssignType").toggleClass("hide", true);
                            $("#divInstType").toggleClass("hide", true);
                        }
                    });

            $('input[type=radio][name=instType]').on('change', function (e) {

                $("#assignError").toggleClass("hide", true);
                var $el = $(e.target);
                var instType = $el.val();
                var tcId = $("#ddlTC option:selected").val();
                var tsId = 0;//$("#ddlTS option:selected").val();
                var courseId = $("#CourseId option:selected").val();
                var roleId = $("#RoleId option:selected").val();
                if (roleId == 12500027 || roleId == 12500026) {
                    tsId = $("#ddlTS option:selected").val();
                }
                var productNumber = $('#CourseId option:selected').data('productnumber');
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["SelectInstructor"] }));
                $("#ddlInstructor").empty().append(subItems).val('');

                self.getData(instructorUrl,
                    { tcId: tcId, tsId: tsId, courseId: courseId, productNumber: productNumber, roleId: roleId, isActive: instType === "act" },
                    '#ddlInstructor',
                    '#divInstructor',
                    window.resources["SelectInstructor"]);
            });

            $("#ddlInstructor")
                .on("change",
                    function (e) {
                        $("#divSubmit").toggleClass("hide", false);
                    });

            $("#ddlInventoryPool").change();
        },

        hideAlert: function () {
            $("#divk12 .close").off("click");
            $("#divk12 .close").on("click", function () {
                $(this).parent().toggleClass("hide", true);
            });
        },

        initMultiSelect: function () {
            $('.bootstrapmultiselect').multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectInstructors"],
                nSelectedText: ' ' + window.resources["TextSelectedInstructors"]
            });
        },

        resetAll: function () {
            $("#assignError").toggleClass("hide", true);
            $("#divBox").toggleClass("hide", true);
            // $("#divTC").toggleClass("hide", true);
            $("#divInstructor").toggleClass("hide", true);
            $("#divSubmit").toggleClass("hide", true);
            $("#divInstType").toggleClass("hide", true);
            $('#dataFile').val('');
            $("#divUpload").toggleClass("hide", true);
        },

        getData: function (url, inputs, objDropdown, objDiv, textDefaultOption) {
            jQuery.get(url, inputs,
                function (data) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                if (url.toLocaleLowerCase().indexOf("getcourse") != -1)
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name, "data-productnumber": item.ProductNumber, "data-module": item.HasModule, "data-subcourse": item.HasSubCourse }));
                                else if (url.toLocaleLowerCase().indexOf("getinstructors") != -1)
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name, "data-instremail": item.email }));
                                else
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }
                    $(objDropdown).empty().append(subItems).val('');
                    $(objDropdown).toggleClass("hide", false);


                    $(objDiv).toggleClass("hide", false);
                    courseId = $("#CourseId option:selected").val();
                })
                .error(function (err) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                    $(objDropdown).empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getAvailableQty: function (courseId, selectedRoleId, tcId, tsId) {
            $("#divBox").toggleClass("hide", true);
            jQuery.get(quantityUrl,
                {
                    courseId: courseId,
                    fromRole: selectedRoleId,
                    tcId: tcId,
                    tsId: tsId
                },
                function (data) {
                    if (data) {
                        $("#divBox").toggleClass("hide", false);
                        $("#availQty").text(data);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        validateEmail: function (email) {

            var pattern =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return $.trim(email).match(pattern) ? true : false;
        },

        validateMobilePhone: function (mobilePhone) {
            var pattern =
                /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
            return $.trim(mobilePhone).match(pattern) ? true : false;
        },

        validateStudent: function () {
            var self = this;
            var errorTeachingInstructorID;
            var errorInstructorStudentID;
            var errorCourseDate;
            var errorFirstName;
            var errorLastName;
            var errorEmail;
            var errorInvalidEmail;
            var errorLoggedInEmail;
            var errorInvalidMobilePhone;
            var errorInvalidCourseDate;
            var errorCourseModule;
            var errorSubCourse;
            var errorMsg = [];
            isMobileNumberExist = false;
            $("#tblStudent")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        var objSelect = $(this).find("select");
                        $(objInput[1]).toggleClass("errorhighlight", false);
                        $(objInput[2]).toggleClass("errorhighlight", false);
                        $(objInput[3]).toggleClass("errorhighlight", false);
                        $(objInput[4]).toggleClass("errorhighlight", false);
                       // $(objInput[5]).toggleClass("errorhighlight", false);
                        $(objInput[5]).toggleClass("errorhighlight", false);
                        $(objInput[6]).toggleClass("errorhighlight", false);
                        $(objSelect[0]).toggleClass("errorhighlight", false);
                        if (!objInput[1].value.trim()) {
                            $(objInput[1]).toggleClass("errorhighlight", true);
                            errorTeachingInstructorID = window.resources["TextFacultyInstructorIdRequired"];
                        }
                        if (objInput[2].value == "") {
                            $(objInput[2]).toggleClass("errorhighlight", true);
                            errorCourseDate = window.resources["TextIssueDateRequired"];
                        } else {
                            var now = new Date();
                            var myDate = new Date(objInput[2].value);
                            var lastSixMonthDate = new Date();
                            lastSixMonthDate = new Date(lastSixMonthDate.setMonth(lastSixMonthDate.getMonth() - 6));

                            if (myDate > now || myDate < lastSixMonthDate) {
                                $(objInput[2]).toggleClass("errorhighlight", true);
                                errorInvalidCourseDate = myDate > now ? window.resources["TextIssueDateRange"] : window.resources["TextLast6MonthCourseDateRange"];
                            }
                        }
                        if (!objInput[3].value.trim()) {
                            $(objInput[3]).toggleClass("errorhighlight", true);
                            errorFirstName = window.resources["TextFirstNameRequired"];
                        }
                        if (!objInput[4].value.trim()) {
                            $(objInput[4]).toggleClass("errorhighlight", true);
                            errorLastName = window.resources["TextLastNameRequired"];
                        }
                       /* if (!objInput[5].value.trim()) {
                            $(objInput[5]).toggleClass("errorhighlight", true);
                            errorEmail = window.resources["TextEmailRequired"];                            
                        }
                        else {
                            if (!self.validateEmail((objInput[5].value))) {
                                $(objInput[5]).toggleClass("errorhighlight", true);
                                errorInvalidEmail = window.resources["TextInvalidEmail"];
                            }
                        } */
                        if (!objInput[5].value.trim()) {
                            $(objInput[5]).toggleClass("errorhighlight", true);
                            errorInstructorStudentID = window.resources["TextInstructorStudentIdRequired"];
                        }

                        if (objInput[6].value.length > 0) {
                            if (!self.validateMobilePhone((objInput[6].value))) {
                                errorInvalidMobilePhone = window.resources["TextInvalidMobileNumber"];
                                $(objInput[6]).toggleClass("errorhighlight", true);
                            }
                        }
                        var ddlSubCourse = $(objSelect[1]);
                        if (window.studentAssignmentViewModel.HasSubCourse == 1 && ddlSubCourse.length > 0 && (!ddlSubCourse.val()
                            || ddlSubCourse.val().length === 0)) {
                            ddlSubCourse.toggleClass("errorhighlight", true);
                            errorSubCourse = window.resources["TextCourseTypeRequired"];
                        }
                    }

                });


            if (errorTeachingInstructorID) errorMsg[errorMsg.length] = errorTeachingInstructorID;
            if (errorCourseDate) errorMsg[errorMsg.length] = errorCourseDate;
            if (errorFirstName) errorMsg[errorMsg.length] = errorFirstName;
            if (errorLastName) errorMsg[errorMsg.length] = errorLastName;
            if (errorEmail) errorMsg[errorMsg.length] = errorEmail;         
            if (errorInvalidCourseDate) errorMsg[errorMsg.length] = errorInvalidCourseDate;
            if (errorInvalidEmail) errorMsg[errorMsg.length] = errorInvalidEmail;
            if (errorLoggedInEmail) errorMsg[errorMsg.length] = errorLoggedInEmail;
            if (errorInstructorStudentID) errorMsg[errorMsg.length] = errorInstructorStudentID;
            if (errorInvalidMobilePhone) errorMsg[errorMsg.length] = errorInvalidMobilePhone;
            if (errorCourseModule) errorMsg[errorMsg.length] = errorCourseModule;
            if (errorSubCourse) errorMsg[errorMsg.length] = errorSubCourse;

            if (!$('#radBulkUpload').is(':checked')) {

                var courseDate = $('input[id="CourseDate"]').val();
                if (!courseDate) {
                    errorMsg.push(window.resources["TextCourseMonitoredDateRequired"]);
                }
                else {
                    var now = new Date();
                    var myDate = new Date(courseDate);
                    var lastSixMonthDate = new Date();
                    lastSixMonthDate = new Date(lastSixMonthDate.setMonth(lastSixMonthDate.getMonth() - 6));
                    
                    if (myDate > now || myDate < lastSixMonthDate) {
                        myDate > now ? errorMsg.push(window.resources["TextIssueDateRange"]) : errorMsg.push(window.resources["TextLast6MonthCourseDateRange"]);
                    }
                }
                var chosenInst = $("#assignTo").find(":selected");

                if (!chosenInst || chosenInst.length === 0) {
                    errorMsg.push(window.resources["TextInstrCandidateRequired"]);
                }
                var courseType = $("#ddlSubCourse option:selected").val();
                if (courseType != undefined && (courseType == '' || courseType <= 0) && window.studentAssignmentViewModel.HasSubCourse == 1 && !$('#radBulkUpload').is(':checked')) {
                    errorMsg[errorMsg.length] = window.resources["TextCourseTypeRequired"];
                }
            }

            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);

            if (errorMsg.length === 0) {
                return true;
            }

            return false;
        },
        validateInstrStudent: function () {
            var self = this;
            var errorCourseDate;
            var errorFirstName;
            var errorLastName;
            var errorEmail;
            var errorInvalidEmail;
            var errorLoggedInEmail;
            var errorInstrFacltyEmail;
            var errorInvalidMobilePhone;
            var errorInvalidCourseDate;
            var errorSubCourse;
            var errorMsg = [];
            isMobileNumberExist = false;

            if ($("#tblInstrStudent").find("tr").length <= 1)
                errorMsg.push(window.resources["TextAtLeastOneCandidateRequired"]);

            var courseDate = $('input[id="CourseDate"]');
            $(courseDate).toggleClass("errorhighlight", false);
            if (courseDate.val() == "") {
                $(courseDate).toggleClass("errorhighlight", true);
                errorCourseDate = window.resources["TextIssueDateRequired"];
            } else {
                var now = new Date();
                var myDate = new Date(courseDate.val());
                var lastSixMonthDate = new Date();
                lastSixMonthDate = new Date(lastSixMonthDate.setMonth(lastSixMonthDate.getMonth() - 6));
                
                if (myDate > now || myDate < lastSixMonthDate) {
                    $(courseDate).toggleClass("errorhighlight", true);
                    errorInvalidCourseDate = myDate > now ? window.resources["TextIssueDateRange"] : window.resources["TextLast6MonthCourseDateRange"];
                }
            }
            var ddlSubCourse = $("#ddlSubCourse");
            ddlSubCourse.toggleClass("errorhighlight", false);
            if (window.studentAssignmentViewModel.HasSubCourse == 1 && ddlSubCourse.length > 0 && (!ddlSubCourse.val()
                || ddlSubCourse.val().length === 0)) {
                ddlSubCourse.toggleClass("errorhighlight", true);
                errorSubCourse = window.resources["TextCourseTypeRequired"];
            }

            $("#tblInstrStudent")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");

                        $(objInput[1]).toggleClass("errorhighlight", false);
                        $(objInput[2]).toggleClass("errorhighlight", false);
                        $(objInput[3]).toggleClass("errorhighlight", false);
                        $(objInput[4]).toggleClass("errorhighlight", false);
                        //  $(objSelect).toggleClass("errorhighlight", false);
                        //var courseDate = $('input[id="CourseDate"]');
                        //  $(courseDate).toggleClass("errorhighlight", false);

                        //if (courseDate.val() == "") {
                        //    $(courseDate).toggleClass("errorhighlight", true);
                        //    errorCourseDate = window.resources["TextIssueDateRequired"];
                        //} else {
                        //    var now = new Date();
                        //    var myDate = new Date(courseDate.val());
                        //    if (myDate > now) {
                        //        $(courseDate).toggleClass("errorhighlight", true);
                        //        errorInvalidCourseDate = window.resources["TextIssueDateRange"];
                        //    }
                        //}
                        if (!objInput[1].value.trim()) {
                            $(objInput[1]).toggleClass("errorhighlight", true);
                            errorFirstName = window.resources["TextFirstNameRequired"];
                        }
                        if (!objInput[2].value.trim()) {
                            $(objInput[2]).toggleClass("errorhighlight", true);
                            errorLastName = window.resources["TextLastNameRequired"];
                        }
                        if (!objInput[3].value.trim()) {
                            $(objInput[3]).toggleClass("errorhighlight", true);
                            errorEmail = window.resources["TextEmailRequired"];
                        }
                        else {
                            if (!self.validateEmail((objInput[3].value))) {
                                $(objInput[3]).toggleClass("errorhighlight", true);
                                errorInvalidEmail = window.resources["TextInvalidEmail"];
                            }
                            //Validation for logged in user cannot use his/her own email address
                            if (objInput[3].value.trim() == $('#hdnLoggedInUserEmail').val()) {
                                errorLoggedInEmail = window.resources["TextInvalidStudentEmailLoggedInMsg"];
                            }
                            //Validation for selected instructor's email cannot be used for student email
                            if (objInput[3].value.trim() == $('#ddlInstructor option:selected').data('instremail')) {
                                errorInstrFacltyEmail = window.resources["TextInvalidStudentEmailMsg"];
                            }
                        }

                        if (objInput[4].value.length > 0) {
                            if (!self.validateMobilePhone((objInput[4].value))) {
                                errorInvalidMobilePhone = window.resources["TextInvalidMobileNumber"];
                                $(objInput[4]).toggleClass("errorhighlight", true);
                            }
                        }
                        //var ddlSubCourse = $("#ddlSubCourse");
                        //if (window.studentAssignmentViewModel.HasSubCourse == 1 && ddlSubCourse.length > 0 && (!ddlSubCourse.val()
                        //    || ddlSubCourse.val().length === 0)) {
                        //    ddlSubCourse.toggleClass("errorhighlight", true);
                        //    errorSubCourse = window.resources["TextCourseTypeRequired"];
                        //}
                    }

                });
            if (errorCourseDate) errorMsg[errorMsg.length] = errorCourseDate;
            if (errorFirstName) errorMsg[errorMsg.length] = errorFirstName;
            if (errorLastName) errorMsg[errorMsg.length] = errorLastName;
            if (errorEmail) errorMsg[errorMsg.length] = errorEmail;
            if (errorLoggedInEmail) errorMsg[errorMsg.length] = errorLoggedInEmail;
            if (errorInstrFacltyEmail) errorMsg[errorMsg.length] = errorInstrFacltyEmail;
            if (errorInvalidCourseDate) errorMsg[errorMsg.length] = errorInvalidCourseDate;
            if (errorInvalidEmail) errorMsg[errorMsg.length] = errorInvalidEmail;
            if (errorInvalidMobilePhone) errorMsg[errorMsg.length] = errorInvalidMobilePhone;
            if (errorSubCourse) errorMsg[errorMsg.length] = errorSubCourse;
            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);
            if (errorMsg.length === 0) {
                return true;
            }
            return false;
        },

        highlightDuplicateRows: function () {
            isDuplicate = false;
            var index = {},
                getText = function () {
                    return $.trim($(this).text());
                };
            $('#tblConfirm').find("tr").each(function (tr) {
                var rowKey = $(this).find(".duplicate-student").map(getText).toArray().join("|");
                if (index.hasOwnProperty(rowKey)) {
                    index[rowKey].push(this);
                } else {
                    index[rowKey] = [this];
                }
            });
            $.each(index, function (rowKey, rows) {
                if (rows.length > 1) {

                    $.each(rows,
                        function (id, row) {
                            if (id > 0) {
                                row.style.backgroundColor = "#ebccd1";
                                isDuplicate = true;
                            }
                        });

                }
            });

            if (isDuplicate) {
                $("#assignErrorstep3").toggleClass("hide", false);
                appCommon.showWarning("assignErrorstep3", "errlist1", window.resources["TextDuplicateStudents"]);
            }
        },

        assignModel: function (button) {

            window.studentAssignmentViewModel.CourseName = "";
            window.studentAssignmentViewModel.TCName = $("#ddlTC option:selected").text();
            window.studentAssignmentViewModel.TrainingSiteName = $("#ddlTS option:selected").text();
            window.studentAssignmentViewModel.InstructorName = $("#ddlInstructor option:selected").text();

            window.studentAssignmentViewModel.CourseId = $("#CourseId option:selected").val();
            if (window.studentAssignmentViewModel.CourseId) {
                window.studentAssignmentViewModel.CourseName = $("#CourseId option:selected").text();
                window.studentAssignmentViewModel.ProductNumber = $('#CourseId option:selected').data('productnumber');
            }

            window.studentAssignmentViewModel.HasSubCourse = $("#CourseId")[0].options[$("#CourseId")[0].selectedIndex]
                .getAttribute("data-subcourse");
            window.studentAssignmentViewModel.TCId = $("#ddlTC option:selected").val();

            window.studentAssignmentViewModel.TrainingSiteId = 0
            if ($('#RoleId').val() == RoleType.TSC.value || $('#RoleId').val() == RoleType.TSAdmin.value) {
                window.studentAssignmentViewModel.TrainingSiteId = $("#ddlTS option:selected").val();
            }
            window.studentAssignmentViewModel.InstructorId = $("#ddlInstructor option:selected").val();
            if (window.studentAssignmentViewModel.InstructorId) {
                $("#hdnInstrName").val($("#ddlInstructor option:selected").text());
            }

            window.studentAssignmentViewModel.AvailableQty = parseInt($("#availQty").text());

            window.studentAssignmentViewModel.FromRoleId = $("#RoleId option:selected").val();

            window.studentAssignmentViewModel.IsUpload = $('#radBulkUpload').is(':checked');

            var courseDate = $('input[id="CourseDate"]').val();
            if ($('#ddlSubCourse').val() != undefined && !studentAssignmentViewModel.IsUpload) {
                window.studentAssignmentViewModel.SubCourseId = $("#ddlSubCourse option:selected").val();
                window.studentAssignmentViewModel.SubCourseName = $("#ddlSubCourse option:selected").text();
            }


            if (button !== "btnMoveNext") {
                var prodNum = $('#CourseId option:selected').data('productnumber');
                var student = [];
                if ($('#radBulkUpload').is(':checked') && (button == "btnConfirm")) {
                    student = [];
                    $("#tblStudent")
                        .find("tr")
                        .each(function (item) {

                            if (item != 0) {
                                var objInput = $(this).find("input");
                                var objModule = $(this).find("select");

                                student.push({
                                    InstructorId: objInput[1].value.trim(),
                                    CourseDate: objInput[2].value.trim(),
                                    FirstName: objInput[3].value.trim(),
                                    LastName: objInput[4].value.trim(),
                                   // Email: objInput[5].value.trim(),
                                    InstructorStudentId: objInput[5].value.trim(),
                                    Phone: objInput[6].value.trim(),
                                    //CourseModuleName: objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(", "),
                                    //CourseModuleId: objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",")
                                    CourseModuleName: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(", ") : "",
                                    CourseModuleId: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",") : "",
                                    SubCourseId: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",") : null,
                                    SubCourse: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(",") : ""
                                });

                            }

                        });
                }
                else if (!$('#radBulkUpload').is(':checked') && (button == "btnConfirm") && (prodNum == aslsInstrDomsticProdNum || prodNum == aslsInstrIntlProdNum)) {
                    student = [];
                    $("#tblInstrStudent")
                        .find("tr")
                        .each(function (item) {

                            if (item != 0) {
                                var objInput = $(this).find("input");
                                var objModule = $(this).find("select");
                                student.push({
                                    InstructorId: $("#ddlInstructor option:selected").val(),
                                    CourseDate: courseDate,
                                    FirstName: objInput[1].value.trim(),
                                    LastName: objInput[2].value.trim(),
                                    Email: objInput[3].value.trim(),
                                    Phone: objInput[4].value.trim(),
                                    SubCourseId: $("#ddlSubCourse option:selected").val(),
                                    SubCourse: $("#ddlSubCourse option:selected").text()
                                });

                            }

                        });
                }
                else if (!$('#radBulkUpload').is(':checked') && (button == "btnFinish") && (prodNum == aslsInstrDomsticProdNum || prodNum == aslsInstrIntlProdNum)) {
                    student = [];
                    $('#tblConfirm').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {

                        var instrProfileId = $(this.node()).data("instrprofileid");
                        var subcourseId = $(this.node()).data("subcourseid");
                        item = this.data();
                        student.push({
                            CourseDate: item[0],
                            FirstName: item[1],
                            LastName: item[2],
                            Email: item[3],
                            InstructorStudentId: item[4],
                            Phone: item[5],
                            SubCourseId: subcourseId,
                            InstructorProfileId: instrProfileId
                        });
                    });
                }
                else if ($('#radBulkUpload').is(':checked') && (button == "btnFinish")) {
                    student = [];

                    $('#tblConfirm').DataTable().rows().every(function (rowIdx, tableLoop, rowLoop) {

                        var instrProfileId = $(this.node()).data("instrprofileid");
                        var subcourseId = $(this.node()).data("subcourseid");
                        item = this.data();
                        student.push({
                            InstructorId: item[0],
                            InstructorName: item[1],
                            CourseDate: item[2],
                            FirstName: item[3],
                            LastName: item[4],
                            Email: item[5],
                            InstructorStudentId: item[6],
                            Phone: item[7],
                            SubCourseId: subcourseId,
                            InstructorProfileId: instrProfileId
                        });
                    });
                }
                else {
                    var chosenInst = $("#assignTo").find(":selected");
                    student = [];
                    $.each(chosenInst,
                        function (idx, item) {
                            var $elm = $(item);
                            student.push({
                                InstructorId: $elm.val(),
                                CourseDate: courseDate,
                                FirstName: $elm.data('fname'),
                                LastName: $elm.data('lname'),
                                Email: $elm.data('email'),
                                SsoId: $elm.data('ssoid'),
                                InstructorStudentId: $elm.data('instrid'),
                                Phone: $elm.data('phone'),
                                SubCourseId: $elm.data('subCourse')
                            });
                        });
                }
                window.studentAssignmentViewModel.AssignedQty = student.length;

                window.studentAssignmentViewModel.StudentList = student;

            }
            if (button === "btnMoveNext" && $('#radBulkUpload').is(':checked')) {
                if ($('#radBulkUpload').is(':checked')) {
                    var data = new FormData();
                    var files = $("#dataFile")[0].files;
                    for (var i = 0; i < files.length; i++) {
                        data.append("file", files[i]);
                    }
                    window.studentAssignmentViewModel.InstructorId = 0;
                    data.append("model", JSON.stringify(window.studentAssignmentViewModel));
                    return data;
                }
            }
            return window.studentAssignmentViewModel;
        },
        checkDuplicateEmail: function () {
            var isFileUploadStudent = $("#tblStudent").find("tr").length > 0;
            var errorMsg = [];
            var studentemails =[]
                $("#tblInstrStudent").find("tr").each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        studentemails.push(objInput[3].value.trim());
                    }
                });
            var studentsortedemails = studentemails.sort();
            var duplicateEmails = [];
            for (var i = 0; i < studentsortedemails.length - 1; i++) {
                if (studentsortedemails[i + 1] == studentsortedemails[i]) {
                    duplicateEmails.push(studentsortedemails[i]);
                }
            }
            //highlight duplicate email row
            for (var i = 0; i < duplicateEmails.length; i++) {
                $("#tblInstrStudent").find("tr").each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        if (objInput[3].value.trim() == duplicateEmails[i]) {
                            $(objInput[3]).toggleClass("errorhighlight", true);
                        }
                    }
                });
            }
            if (duplicateEmails.length > 0) errorMsg[errorMsg.length] = window.resources["TextSameEmailMSg"];
            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);
            if (duplicateEmails.length > 0) {
                return true;
            }
            return false;
        },
        checkDuplicateStudentInstrId: function () {
            var errorMsg = [];
            var studentInstrIds = []
            $("#tblStudent").find("tr").each(function (item) {
                if (item != 0) {
                    var objInput = $(this).find("input");
                    studentInstrIds.push(objInput[5].value.trim());
                }
            });
            var studentsortedInstrIds = studentInstrIds.sort();
            var duplicateInstrIds = [];
            for (var i = 0; i < studentsortedInstrIds.length - 1; i++) {
                if (studentsortedInstrIds[i + 1] == studentsortedInstrIds[i]) {
                    duplicateInstrIds.push(studentsortedInstrIds[i]);
                }
            }
            //highlight duplicate instructor id row
            for (var i = 0; i < duplicateInstrIds.length; i++) {
                $("#tblStudent").find("tr").each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        if (objInput[5].value.trim() == duplicateInstrIds[i]) {
                            $(objInput[5]).toggleClass("errorhighlight", true);
                        }
                    }
                });
            }
            if (duplicateInstrIds.length > 0) errorMsg[errorMsg.length] = window.resources["TextSameInstrIdMSg"];
            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);
            if (duplicateInstrIds.length > 0) {
                return true;
            }
            return false;
        },
        moveNext: function (btn) {

            var pView = $(btn).data("view");

            if (pView === "#candidateAssignment" && $('#radBulkUpload').is(':checked') && $("#dataFile")[0].files.length == 0) {
                appCommon.showResponseError("assignError", "errlist", window.resources["TextUploadFileRequired"]);
                return false;
            }
            if (pView === "#completeAssignCards") {
                $(btn).prop("disabled", true);
            }

            var data = this.assignModel(btn.id);
            if (!validateAssignment()) {
                if (pView === "#completeAssignCards") {
                    $(btn).prop("disabled", false);
                }
                return false;
            }

            var url = $(btn).data("url");

            this.submit(url, data, this.render, "", pView);
            return false;
        },

        movePrevious: function (view) {
            this.hideAll();
            $(view).toggleClass("hide", false);
            $("#assignErrorstep2").toggleClass("hide", true);
            $("#assignErrorstep3").toggleClass("hide", true);
        },

        submit: function (url, data, cb, msg, divView) {
            var self = this;
            if (divView !== "#candidateAssignment") {
                if ((window.studentAssignmentViewModel.ProductNumber == aslsInstrDomsticProdNum ||
                    window.studentAssignmentViewModel.ProductNumber == aslsInstrIntlProdNum) ? !self.validateInstrStudent() : !self.validateStudent()
                ) {
                    if (divView == "#completeAssignCards") {
                        $("#btnFinish").prop("disabled", false);
                    }
                    return false;
                }
            }
            var isErrorOccured = false;

            var errDiv = "assignError";
            if (divView === "#confirmAssignCards") {
                errDiv = "assignErrorstep2";
                if ($('#radBulkUpload').is(':checked') ? self.checkDuplicateStudentInstrId():self.checkDuplicateEmail())
                    return false;
            }

            if (divView === "#completeAssignCards") {
                errDiv = "assignErrorstep3";
            }
            if ($('#radBulkUpload').is(':checked') && divView === "#candidateAssignment") {
                try {
                    $("#divAssignInstructor").toggleClass("hide", true);
                    $("#divStudentTbl").toggleClass("hide", false);
                    jQuery.ajax({
                        url: url,
                        type: "POST",
                        contentType: false,
                        processData: false,
                        data: data,
                        dataType: "html",
                        success: function (result) {
                            self.render(result, divView);
                        },
                        error: function (errMsg) {
                            appCommon.showResponseError(errDiv, "errlist", errMsg);
                        }
                    });
                } catch (e) {
                    var x = 100;
                }
            } else {
                try {
                    $("#divStudentTbl").toggleClass("hide", false);
                    if ($('#radBulkUpload').is(':checked')) {
                        $("#divAssignInstructor").toggleClass("hide", true);
                    }
                    else {
                        $("#divAssignInstructor").toggleClass("hide", false);
                    }
                    jQuery.post(url,
                        data,
                        function (result) {
                            self.render(result, divView);
                        })
                        .fail(function (errMsg) {
                            isErrorOccured = true;
                            if (divView == "#confirmAssignCards") {
                                var errormsg = appCommon.ExtractError(errMsg);
                                var input1 = "Teaching Instructor Id and Student Instructor";
                                var input2 = "Instructor ID is not aligned with the TC";
                                var input1Match = errormsg[0].indexOf(input1) != -1;
                                var input2Match = errormsg[0].indexOf(input2) != -1;
                                var finalmatch = input1Match | input2Match;
                                if (finalmatch > 0) {
                                    var idsList = errormsg[0].split(':')[0].split(",");
                                    for (var i = 0; i < idsList.length; i++) {
                                        $('input').filter(function () { return this.value == idsList[i] }).addClass('errorhighlight');
                                    }
                                    appCommon.showResponseError(errDiv, "errlist", errormsg[0].split(':')[1]);
                                } else {
                                    appCommon.showResponseError(errDiv, "errlist", errMsg);
                                }
                            } else {
                                appCommon.showResponseError(errDiv, "errlist", errMsg);
                            }
                        })
                        .always(function () {
                            if (divView === "#completeAssignCards" && !isErrorOccured) {
                                $("#btnFinish").prop("disabled", false);
                            }                           
                        });
                } catch (e) {

                    console.log(e);
                }
            }
        },

        render: function (data, view) {

            var self = this;

            if (data) {
                $(view).html(data);
                appCommon.initDatePicker(true);
                if (view == "#candidateAssignment") {
                    self.initMultiSelect();
                    $("#moduleHelp").toggleClass("hide", window.studentAssignmentViewModel.HasModule != 1);
                    $("#tdAssignTCName").html($("#ddlTC option:selected").text());
                    $("#tdAssignLocName").html($("#ddlLocation option:selected").text());
                }

                $("[id*='tdInstrNameP']").html($("#hdnInstrName").val());
                $('[data-toggle="popover"]').popover();
            }
            if (view === "#confirmAssignCards") {
                if ($('#radBulkUpload').is(':checked')) {
                    self.highlightDuplicateRows();
                }

                $("#tblConfirm").DataTable({
                    "pageLength": 25
                });

                self.assignModel();
            }

            self.hideAll();
            $(view).toggleClass("hide", false);
            toggleShowHide.init();

            if (view === "#completeAssignCards") {

                var table = $("#tblEcard").DataTable({
                    "pageLength": 25
                });

                if (table.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Assigned eCards")
                                }
                            ]
                        });
                    $("#exportStudent").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                }
            }

            appCommon.focusMessage();
        },

        hideAll: function (data) {
            $("#index").toggleClass("hide", true);
            $("#candidateAssignment").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", true);
        },

        remove: function (lnk) {

            if ($('#tblStudent').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var table = $('#tblConfirm').DataTable();

                table.row(row).remove().draw(false);
                var count = $('#tblStudent').find("tr").length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#divAssignQty").text(count);
                $("#assignQty").val(count);
            } else {

                appCommon.showResponseError("assignErrorstep2", "errlist2", window.resources["TextAtLeastOneStudentRequired"]);
            }

            return false;
        },

        updateDate: function (e) {

            var courseDate = $(e).val();

            $("#tblStudent")
                .find("tr")
                .each(function (item) {

                    if (item != 0) {
                        var objInput = $(this).find("input");
                        $(objInput[2]).datepicker("setDate", courseDate);
                    }

                });
        },
        updateSubCourse: function (e) {

            var subCourseId = $(e).val();
            $("#tblStudent")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("select");
                        objInput.val(subCourseId);
                    }
                });
        },

        removeConfirm: function (lnk) {

            if ($('#tblConfirm').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                var candidateId = row.data("instrprofileid");
                row.remove();
                var table = $('#tblConfirm').DataTable();

                table.row(row).remove().draw(false);
                var trs = $('#tblConfirm').find("tr");
                var count = trs.length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;

                $("#assignTo").multiselect('deselect', [candidateId]);

                $("#tdAssignQty").html(count);
            } else {
                appCommon.showResponseError("assignErrorstep3", "errlist3", window.resources["TextAtLeastOneCandidateRequired"]);
            }

            return false;
        },
        addNewInstructor: function (lnk) {

            $('#divInstrStudentTbl').toggleClass("hide", false);
            var table = $('#tblInstrStudent');
            var i = $('#tblInstrStudent').find("tr").length;

            var row = `<tr data-instid="item.Email">
                                    <td class="hide">
                                        <label for="chkAll`+ i + `")" class="sr-only">name</label>
                                        <input type="checkbox" id="chkAll`+ i + `")" />
                                    </td>
                                    <td>
                                        <label for="firstname`+ i + `" class="sr-only">name</label>
                                        <input class="form-control"  name="firstName" id="firstname`+ i + `" type="text" placeholder="` + window.resources["FirstName"] + `" />
                                    </td>
                                    <td>
                                        <label for="lastname`+ i + `" class="sr-only">last</label>
                                        <input class="form-control"  name="lastName" id="lastname`+ i + `" type="text" placeholder="` + window.resources["LastName"] + `" />
                                    </td>
                                    <td>
                                        <label for="email`+ i + `" class="sr-only">email</label>
                                        <input class="form-control"  name="email" type="text" id="email`+ i + `" placeholder="` + window.resources["Email"] + `" />
                                    </td>
                                    <td>
                                        <label for="phone`+ i + `" class="sr-only">phone</label>
                                        <input class="form-control"  name="phone" type="text" id="phone`+ i + `" placeholder="xxx-xxx-xxxx">
                                    </td>
                                    <td class="hide">
                                        <div class="multiselect-bin">
                                            <label for="subCourse`+ i + `" class="sr-only">SubCourses</label>
                                            <select class="form-control" id="subCourse`+ i + `" title="SubCourse" name="subCourse">
                                                <option value="" selected disabled>`+ window.resources["SelectCourseType"] + `</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <a href="#" onclick="appInstrCandidateAssignment.removeInstructor(this);return false;">
                                            <i class="fa fa-trash-o fa-2x" aria-hidden="true"></i>
                                            <span class="sr-only">`+ window.resources["Delete"] + `</span>
                                        </a>
                                    </td>
                                </tr>`;
            //console.log(row);
            table.append(row);
            return false;
        },
        removeInstructor: function (lnk) {

            if ($('#tblInstrStudent').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var count = $('#tblInstrStudent').find("tr").length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#divAssignQty").text(count);
                $("#assignQty").val(count);
            } else {

                appCommon.showResponseError("assignErrorstep2", "errlist2", window.resources["TextAtLeastOneStudentRequired"]);
            }

            return false;
        },
    }
};
var AppInstructorEcardStatus = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();
    
    var filterBy = "";
    var hideAdvancedOpt = true;
    var clearDaysView = false;
    var validateRequest = function (isValidate) {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var courseId = $("#eCardStatusForm").find('select[id="CourseId"]').val();
        var startDate = $("#eCardStatusForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardStatusForm").find('input[id="EndDate"]').val();
        var trainingCenter = $("#eCardStatusForm").find('select[id="ddlTC"]').val();
        var location = $("#eCardStatusForm").find('select[id="ddlLocation"]').val();
        var errorMsg = [];
        if (isValidate) {
            if (!courseId || courseId.length <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
                //return false;
            }
            if (courseId && filterBy) {
                if ("" === trainingCenter || trainingCenter <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                }

                if (filterBy === "location" && !location && trainingCenter) {
                    errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                }
            }
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextTransactionsDatesRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["TransactionDate"]);
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("assignError", "errlist", errorMsg);
            return false;
        }

        return true;
    }


    return {

        init: function () {
            var self = this;
            $("#lnkAdvanced").toggleClass("hide", true);
            $("#CourseId").on("change", $.proxy(self.changeCourse, self));
            $(".datepicker").on("change",
                   function (e) {
                       clearDaysView = true;
                   });

            self.initMultiSelect();

            $("#ddlTC")
              .on("change",
                  function (e) {
                      var trainingCenterId = $(e.target).val();
                      if (trainingCenterId) {
                          if (filterBy === "location") {
                              $("#divLocation").toggleClass("hide", false);
                              self.getLocation({ TcId: trainingCenterId });
                          }
                      } else {
                          $("#divLocation").toggleClass("hide", true);
                      }

                  });

            $('input[type=radio][name=fromType]').on('change', function (e) {
                $("#assignError").html("").addClass("hide");

                var $el = $(e.target);
                filterBy = $el.val();

                $("#ddlTC").val("");
                $("#ddlLocation").val("");

                $("#divType").toggleClass("hide", false);
                $("#divTC").toggleClass("hide", false);
                if (filterBy === "tc") {
                    $("#divLocation").toggleClass("hide", true);
                }
            });
        },


        initMultiSelect: function () {
            $("#CourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

           // $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

            $("#VAMCourseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

           // $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

        },

        changeCourse: function (e) {
            var self = this;
            var $el = $(e.target);
            var courseId = $("#CourseId").find(':selected').map(function(a, item) { return item.value; }).get().join(",");
            clearDaysView = true;
            self.btnClick_reset_ecardRequests(true);

            var url = $(e.target).data("url");
            var hasChild = $("#CourseId").find(':selected').map(function (a, item) {
                return $(item).data("isparent");
            }).get().join(",");
            if (hasChild == "True") { //VAM Course   
                $("#divVAMCourse").toggleClass("hide", false);
            
                jQuery.get(url, { courseId: courseId }, $.proxy(self.loadVAMCourse, self))
               .error(function (err) {
                   appCommon.showResponseError("assignError", "errlist", err);
               });
            } else {
                $("#divVAMCourse").toggleClass("hide", true);
                $("#VAMCourseId").multiselect("deselectAll", false).multiselect("refresh");
            }


            if (!courseId) {
                return false;
            }

            self.getTCList({
                courseIds: courseId
            });

            $("#lnkAdvanced").toggleClass("hide", false);
            $("#lnkAdvanced").off("click");
            $("#lnkAdvanced").on("click", self.showHideOptions);
        },

        getTCList: function (inputs) {
            var tcUrl = $("#tc").data("url");
            jQuery.get(tcUrl, inputs,
                        function (data) {
                            if (data && data.length > 0) {
                                var subItems = [];
                                subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                                $.each(data,
                                    function (index, item) {
                                        subItems.push($("<option/>", { value: item.TrainingCenterId, text: item.Name }));
                                    });

                                $("#ddlTC").empty().append(subItems);
                                $('#ddlTC').val('');

                            }
                        })
                    .error(function (err) {

                        $("#ddlTC").empty();
                        appCommon.showResponseError("assignError", "errlist", err);
                    });
        },

        getLocation: function (inputs) {
            var url = $("#ddlLocation").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        showHideOptions: function (e) {

            hideAdvancedOpt = !hideAdvancedOpt;

            var $caret = $(e.target).find("span.caret");
            setTimeout(function () {
                $("#divOptions").toggleClass("hide", hideAdvancedOpt);
            },
                100);
            $caret.toggleClass("rotate", !hideAdvancedOpt);

            return false;
        },

        btnClick_search_ecardRequests: function (isValidate) {
          
            var self = this;
            if (!validateRequest(isValidate)) return false;
            var url = $("#fetchReq").data("url");
            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: $("#eCardStatusForm").serialize(),
                success: function (result) {
                    $("#partial").html(result);

                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[5, "desc"]],
                        columnDefs: [{
                            targets: 0,
                            visible: false
                        }]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                             {
                                 extend: 'excelHtml5',
                                 title: appCommon.getFileName("Instructor eCard Status"),
                                 exportOptions: {
                                     columns: ':visible'
                                 }
                             }
                            ]
                        });

                        $("#expotbutton").prepend(buttons.container())
                      .find("a.dt-button").addClass("btn btn-primary")
                      .text(window.resources["TextDownload"]);
                    }

                    $("#example").on("click", ".lnkecard", $.proxy(self.loadECards, self));
                    if (isValidate) {
                        appCommon.focusArea("#partial");
                    }
                    $("#spdaysView").toggleClass("hide", clearDaysView);
                    $('[data-toggle="popover"]').popover();
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlst", errMsg);
                }
            });

            return false;
        },

        btnClick_reset_ecardRequests: function (isLimitedClear) {
            var self = this;
            $("#assignError").html("").addClass("hide");

            $("#ddlTC").empty().val("");
            $("#divTC").toggleClass("hide", true);

            $("#ddlLocation").empty().val("");
            $("#divLocation").toggleClass("hide", true);

            $("#ddlType").val("");
            $("#divType").toggleClass("hide", true);

            $("#divOptions").toggleClass("hide", true);

            $("input[type=radio][name=fromType]").prop("checked", false);

            hideAdvancedOpt = true;

            $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);

            $("#lnkAdvanced").toggleClass("hide", true);

            if (!isLimitedClear) {
                filterBy = "";
                $("#CourseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getMonthOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());
                clearDaysView = false;
                self.btnClick_search_ecardRequests(false);
            }

            if (!isLimitedClear) {
                appCommon.focusMessage();
            }
        },

        loadVAMCourse: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                //subItems.push($("<option/>", { value: "", text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.CourseId, text: item.Name
                        }));
                    });
                $("#VAMCourseId").empty().append(subItems);
                $("#VAMCourseId").val('');
                $("#VAMCourseId").empty().append(subItems).multiselect('rebuild');
            }
        },

        loadECards: function (e) {
            e.preventDefault();
            var self = this;
            var transId = $(e.target).data("transactionid");
            self.getECards(transId);
        },

        getECards: function (transId, canShowMsg) {
            var self = this;
            var profileId = $("#profileId option:selected").val();
            var url = $("#hdnUrl").val();
            self.isSuccess = !!canShowMsg;
            jQuery.get(url, { transactionId: transId, profileId: profileId }, $.proxy(self.populateECards, self))
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        populateECards: function (data) {
            var self = this;
            if (data) {
                $("#divStudentECards").toggleClass("hide", false);
                $("#divECardStatus").toggleClass("hide", true);
                $("#divStudentECards").html(data);
                if (self.isSuccess) {
                    $("#divAlert").toggleClass("hide", false);
                }
                var tbl = $("#tblECards").DataTable();

                if (tbl.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(tbl,
                    {
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                title: appCommon.getFileName("Student eCards")
                            }
                        ]
                    });

                    $("[data-blocked]").closest("tr").addClass("blockedInRed");

                    $("#exportECard").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $("#lnkGoResults").click(self.NavigateToResults);
                    appCommon.focusMessage();
                }
            }

        },

        NavigateToResults: function (e) {
            e.preventDefault();
            $("#divStudentECards, #divEditCard").html("");
            $("#divStudentECards, #divEditCard").toggleClass("hide", true);
            $("#divECardStatus").toggleClass("hide", false);
            appCommon.focusArea("#partial");
        }
    }
}
;
var AppInventory = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    function format(d, role, inventoryPool, showButton, hasintlalignment) {
        // `d` is the original data object for the row
        var inventory = $("#inventoryPool option:selected").index();
        var detailhtml;
        var selectedSourceId = $("#inventoryPool option:selected").val();
        if (selectedSourceId == 4) {
            var result = JSON.parse(d[5]);

            detailhtml = ' <div class="text-center tableChildWrapper"> ' +
                '<table class="table table-bordered">' +
                '<thead>' +
                // '<th>' + window.resources["TextTrainingCenter"] + '</th>' +
                '<th>' + window.resources["TextTrainingSite"] + '</th>' +
                '<th>' + window.resources["TextAvailableQuantity"] + '</th>' +
                '</thead>' +
                '<tbody>';

            for (var i = 0; i < result.length; i++) {
                detailhtml += '<tr>' +
                    //     '<td>';
                    //   detailhtml += $("#tcId option:selected").text();
                    //  detailhtml += '</td>' +
                    '<td>';
                if (result[i].SourceType == "2") {
                    detailhtml += result[i].SourceName;
                }
                detailhtml += '</td>' +
                    '<td>' + result[i].AvailableBalance + '</td>' +
                    '</tr>';

            }
            detailhtml += '</tbody>' +
                '</table>' +
                //    '<a href="TrainingSiteAssignment?courseId=' + d[1] + '"' + ' aria-label="Assign To Training Site" class="btn btn-sm btn-primary">Assign to Training Site</a>' +
                '</div>';
        }
        if ((role == "tcc" || role == "tcadmin") && inventory != 2) {
            var result = JSON.parse(d[5]);
            var courseType = result[0].CourseType;
            if (courseType == 4 && !hasintlalignment) {
                detailhtml = '<div class="text-center"><br/>\
                 <a href="' + 'TrainingCenter/AssignInstructorCandidate?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign to Instructor Candidates/Renewals"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToInstructorCandidate"] + '</a>\
                <a href="' + 'TrainingCenter/TrainingSiteAssignment?courseId=' + d[1] + '"' + ' aria-label="Assign To Training Site" class="btn btn-sm btn-primary">' + window.resources["TextAssignToTrainingSite"] + '</a>\
                </div>\
                ';

            } else {


                detailhtml = (hasintlalignment) ? '<div class="text-center"><br/>\
                                                    <a href="' + 'TrainingCenter/TrainingSiteAssignment' + '"' + ' aria-label="Assign To Training Site" class="btn btn-sm btn-primary">' + window.resources["TextAssignToTrainingSite"] + '</a>\
                                                   </div>\
                                                   ' : '<div class="text-center"><br/>\
                                                   <a href="' + 'InstructorAssignment?courseId=' + d[1] + '"' + 'class="btn btn-sm btn-primary" > ' + window.resources["TextAssignToInstructor"] + ' </a>\
                                                   <a href="' + 'TrainingCenter/TrainingSiteAssignment?courseId=' + d[1] + '"' + ' aria-label="Assign To Training Site" class="btn btn-sm btn-primary">' + window.resources["TextAssignToTrainingSite"] + '</a>\
                                                   <a href="' + 'Student/StudentAssignment?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign To Students"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToStudents"] + ' </a>\
                                                   </div>\
                                                   ';
                }
        }
        if ((role == "tsc" || role == "tsadmin") && inventory != 2) {
            var result = JSON.parse(d[5]);

            detailhtml = ' <div class="text-center tableChildWrapper"> ' +
                '<table class="table table-bordered">' +
                '<thead>' +
                '<th>' + window.resources["TextTrainingSite"] + '</th>' +
                '<th>' + window.resources["TextAvailableQuantity"] + '</th>' +
                '</thead>' +
                '<tbody>';

            for (var i = 0; i < result.length; i++) {
                detailhtml += '<tr>' +
                    '<td>';
                detailhtml += result[i].SourceName + '(' + result[i].SourceCode + ')';
                detailhtml += '</td>' +
                    '<td>' + result[i].AvailableBalance + '</td>' +
                    '</tr>';
            }
            detailhtml += '</tbody>' +
                '</table></div>';
            //detailhtml += '<div class="text-center"><br/>\
            //    <a href="' + 'InstructorAssignment?courseId=' + d[1] + '"' + 'class="btn btn-sm btn-primary" >' + window.resources["TextAssignToInstructor"] + ' </a>\
            //    <a href="' + 'Student/StudentAssignment?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToStudents"] + ' </a>\
            //    </div>\
            //    ';
            detailhtml = (hasintlalignment) ? detailhtml : detailhtml + '<div class="text-center"><br/>\
                    <a href="' + 'InstructorAssignment?courseId=' + d[1] + '"' + 'class="btn btn-sm btn-primary" >' + window.resources["TextAssignToInstructor"] + ' </a>\
                    <a href="' + 'Student/StudentAssignment?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToStudents"] + ' </a>\
                    </div>\
                    ';
        }
        if (role == "ecardadmin" && inventory != 2) {


            var result = JSON.parse(d[5]);

            detailhtml = ' <div class="text-center tableChildWrapper"> ' +
                '<table class="table table-bordered">' +
                '<thead>' +
                '<th>' + window.resources["TexteCardLocation"] + '</th>' +
                '<th>' + window.resources["TextAvailableQuantity"] + '</th>' +
                '</thead>' +
                '<tbody>';

            for (var i = 0; i < result.length; i++) {
                detailhtml += '<tr>' +
                    '<td>';
                detailhtml += result[i].SourceName;
                detailhtml += '</td>' +
                    '<td>' + result[i].AvailableBalance + '</td>' +
                    '</tr>';
            }
            detailhtml += '</tbody>' +
                '</table>';
            detailhtml += '<div class="text-center"><br/>\
                <a href="' + 'InstructorAssignment?courseId=' + d[1] + '"' + 'class="btn btn-sm btn-primary" >' + window.resources["TextAssignToInstructor"] + ' </a>\
                <a href="' + 'Student/StudentAssignment?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToStudents"] + ' </a>\
                </div>\
                ';
        }

        if (role == "instructor" && JSON.parse(d[5])[0].CourseType == 4) {
            var result = JSON.parse(d[5]);
            var courseType = result[0].CourseType;
            if (courseType == 4) {
                detailhtml = ' <div class="text-center tableChildWrapper"> ' +
                    '<table class="table table-bordered">' +
                    '<thead>' +
                    '<th>' + window.resources["TextTrainingCenter"] + '</th>' +
                    '<th>' + window.resources["TextTrainingSite"] + '</th>' +
                    '<th>' + window.resources["TextAvailableQuantity"] + '</th>' +
                    '</thead>' +
                    '<tbody>';

                for (var i = 0; i < result.length; i++) {
                    detailhtml += '<tr>' +
                        '<td>';
                    /* if (result[i].SourceType == 1) {
                         detailhtml += result[i].SourceName;
                     } */
                    detailhtml += result[i].SourceType == 1 ? result[i].SourceName : $("#tcId option:selected").text();

                    detailhtml += '</td>' +
                        '<td>';
                    if (result[i].SourceType == "2") {
                        detailhtml += result[i].SourceName;
                    }
                    detailhtml += '</td>' +
                        '<td>' + result[i].AvailableBalance + '</td>' +
                        '</tr>';

                }

                detailhtml += '</tbody></table>\
                 <a href="' + 'TrainingCenter/AssignInstructorCandidate?courseId=' + d[1] + '&inventoryPool=' + inventoryPool + '"' + ' aria-label="Assign to Instructor Candidates/Renewals"  class="btn btn-sm btn-primary">' + window.resources["TextAssignToInstructorCandidate"] + '</a>\
                </div>\
                ';
            }
        }

        else if ((role == "instructor" || inventory == 2) && selectedSourceId != 4) {
            var result = JSON.parse(d[5]);

            detailhtml = ' <div class="text-center tableChildWrapper"> ' +
                '<table class="table table-bordered">' +
                '<thead>' +
                '<th>' + window.resources["TextTrainingCenter"] + '</th>' +
                '<th>' + window.resources["TextTrainingSite"] + '</th>' +
                '<th>' + window.resources["TextAvailableQuantity"] + '</th>' +
                '</thead>' +
                '<tbody>';

            for (var i = 0; i < result.length; i++) {
                detailhtml += '<tr>' +
                    '<td>';
               /* if (result[i].SourceType == 1) {
                    detailhtml += result[i].SourceName;
                } */
                detailhtml += result[i].SourceType == 1 ? result[i].SourceName : $("#tcId option:selected").text();

                detailhtml += '</td>' +
                    '<td>';
                if (result[i].SourceType == "2") {
                    detailhtml += result[i].SourceName;
                }
                detailhtml += '</td>' +
                    '<td>' + result[i].AvailableBalance + '</td>' +
                    '</tr>';

            }
            if (showButton) {
                detailhtml += '</tbody>' +
                    '</table>' +
                    '<a href="Student/StudentAssignment?courseId=' + result[0].CourseId + '&inventoryPool=' + inventoryPool + '" aria-label="Assign" class="btn btn-primary btn-sm">' + window.resources["TextAssignToStudents"] + '</a>' +
                    '</div>';
            }
        }

        return detailhtml;
    }

    return {

        init: function () {
            var self = this;
            $(document)
                .ready(function () {
                    setTimeout(function () { $('#inventoryPool').trigger('change'); }, 600);
                });

            $("#inventoryPool")
                .on("change",
                    function (e) {
                        var tcList = JSON.parse($('#algnTCWithRole').val());
                        var roleId = $("#inventoryPool option:selected").val();
                        if (roleId == 3 || roleId == undefined) {
                            $('#divTC').toggleClass("hide", true);
                            $('#divSite').toggleClass("hide", true);
                        } else {
                            $('#divTC').toggleClass("hide", false);
                        }
                        if (roleId == RoleType.Instructor.value) {
                            $('#divInstructor').toggleClass("hide", true);
                            $('#divSite').toggleClass("hide", true);
                        } 
                        var subItems = [];
                        $.each(tcList,
                            function (index, item) {

                                var isExistingItem = false;
                                $.each(subItems, function (inx, subitem) {
                                    if (subitem.val() == item.ParentEntityId) {
                                        isExistingItem = true;
                                    }
                                });
                                if (!isExistingItem) { 
                                    if ((roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value || roleId == '4') && (item.RoleId == RoleType.TCC.value || item.RoleId == RoleType.TCAdmin.value)) {
                                        subItems.push($("<option/>", { value: item.ParentEntityId, text: item.ParentEntityName }));
                                    }
                                    if (roleId == RoleType.Instructor.value && item.RoleId == RoleType.Instructor.value) {
                                        subItems.push($("<option/>", { value: item.ParentEntityId, text: item.ParentEntityName }));
                                    }
                                    if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && (item.RoleId == RoleType.TSC.value || item.RoleId == RoleType.TSAdmin.value)) {
                                        subItems.push($("<option/>", { value: item.ParentEntityId, text: item.ParentEntityName }));
                                    }
                                }
                            });

                        $("#tcId").empty().append(subItems);
                        $("#tcId").val($("#tcId option:first").val());
                        self.getInventory();
                    });
            $("#tcId")
                .on("change",
                    function (e) {
                        $("#tsid option:selected").val('');
                        self.getInventory();
                    });
            $("#tsid")
                .on("change",
                    function (e) {
                       // self.getInventory();
                        var tsid = $("#tsid option:selected").val();
                        var url = $("#inventoryPool").data("url");
                        var tcId = $("#tcId option:selected").val()
                        var inventory = $("#inventoryPool option:selected").val();
                        // deciding inventory pool in case if user is having tsc and tsa role simultaneously
                        if (inventory == RoleType.TSC.value) {
                            var tcList = JSON.parse($('#algnTCWithRole').val());
                            $.each(tcList, function (index, item) {
                                if ((item.EntityId == tsid)) {
                                    inventory = item.RoleId;
                                }
                            });
                        }


                        var input = {};
                        var showButton = true;

                        input = { roleId: inventory, tcIdInCaseDualRole: tcId, tsId: tsid };
                        self.loadInventory(url, input, showButton, self);
                    });
            $("#instructor")
                .on("change",
                    function (e) {
                        self.getInventory();
                    });
            $("#btnDownload")
                .on("click",
                    function (e) {
                        self.downloadInventory();
                    });
            $("#btnSiteDownload")
                .on("click",
                    function (e) {
                        self.downloadSiteInventory();
                    });
            $("input[name=radCourseType]:radio").on("change", function (e) {
                var $el = $(e.target);
                self.getInventory($el.val() == "1");
            });
        },

        expand: function (e, table, showButton) {


            if (e.which == 13 || e.type == 'click') {
                var $caret = $(e.target.parentElement).find('span.caret');

                var tr = e.target.parentElement;

                var row = table.row(tr);
                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    //row.child();

                    setTimeout(function () {
                        $(tr).removeClass('shown');
                    }, 100);
                    $caret.removeClass('rotate');
                }
                else {
                    var userrole = $('.dataTable').data("userrole");
                    var inventorySource = $('.dataTable').data("inventorysource");
                    var hasIntlAlignment = $('.dataTable').data("hasintlalignment");
                    // Open this row
                    //row.child( format(row.data()),'active' ).show();
                    //row.data()[4] is the index column you want to render as a child
                    row.child(format(row.data(), userrole.toLowerCase(), inventorySource, showButton, hasIntlAlignment), 'active').show();
                    //  row.child(row.data()[4], 'active').show();

                    setTimeout(function () {

                        $(tr).addClass('shown');
                    }, 100);
                    $caret.addClass('rotate');
                }
            }
        },

        getInventory: function (isInternational) {
            var self = this;
            var data = "";
            var showButton = true;
            $("#inventoryError").html("");
            $("#inventoryError").addClass("hide");
            $("#divInstructor").toggleClass("hide", true);

            var inventory = $("#inventoryPool option:selected").val();
            if (inventory == "3") {
                $("#divInstructor").toggleClass("hide", false);
                inventory = "2660004";
                data = { userId: $("#instructor option:selected").val(), roleId: inventory };
                showButton = false;
                if ($("#instructor option:selected").val() == "") {
                    return;
                }

            }
            else if (inventory == RoleType.Instructor.value || inventory == "4" || inventory == RoleType.TSC.value || inventory == RoleType.TSAdmin.value) {
                $("#divSite").toggleClass("hide", false);
                var tcId = $("#tcId option:selected").val();
                var roleId = $("#inventoryPool option:selected").val();
                // deciding inventory pool in case if user is having tsc and tsa role simultaneously
                if (roleId == RoleType.TSC.value) {
                    var tcList = JSON.parse($('#algnTCWithRole').val());
                    $.each(tcList, function (index, item) {
                        if ((item.ParentEntityId == tcId)) {
                            roleId = item.RoleId;
                        }
                    });
                }
                //load ts list
                if (tcId > 0) {
                    var url = $('#tsid').data("url");
                   // self.loadTrainingsites(url, { tcId: tcId, roleId: roleId }, window.resources["TextSelectTrainingSite"], self);
                    setTimeout(function () {
                        self.loadTrainingsites(url, { tcId: tcId, roleId: roleId }, window.resources["TextSelectTrainingSite"], self);
                    }, 100);
                }
                return;
            }
            else {
              //  $("#divInstructor").toggleClass("hide", true);
                $("#divSite").toggleClass("hide", true);

                var tcIdInCaseDualRole = '';
                var isCourseInternational = isInternational == undefined || isInternational == null || isInternational == '' ? false: isInternational;
                if ($('#DistributorTypeId').val() == 2)
                    isCourseInternational = true;
                // if ($('#isIntlAlgn').val() == 'true')
               
                tcIdInCaseDualRole = $("#tcId option:selected").val();
                var tcList = JSON.parse($('#algnTCWithRole').val());
                $.each(tcList,
                    function (index, item) {
                        if (item.ParentEntityId == tcIdInCaseDualRole && item.RoleId == RoleType.TCAdmin.value) {
                            inventory = item.RoleId;
                        }
                    });

                data = { roleId: inventory, tcIdInCaseDualRole: tcIdInCaseDualRole, isInternational: isCourseInternational };
                $("#instructor").val("");
            }

            var url = $("#inventoryPool").data("url");

            this.loadInventory(url, data, showButton, self);

        },

        downloadInventory: function () {
            var url = $("#DownloadUrl").val();
            var inputs = {};
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        window.location.href = "Inventory/GetInstructorInventory";
                    } else {
                        appCommon.showResponseError("inventoryError", "errlist", window.resources["TextNoRecords"]);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("inventoryError", "errlist", "error");
                });
        },

        downloadSiteInventory: function () {
            var url = $("#SiteInvDownloadUrl").val();
            var invSourceId = $("#inventoryPool option:selected").val();
            var inputs = { tcId: $("#tcId option:selected").val(), roleId: invSourceId };

            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        window.location.href = "Inventory/GetSiteInventory" + "?tcId=" + inputs.tcId + "&roleId=" + inputs.roleId;
                    } else {
                        appCommon.showResponseError("inventoryError", "errlist", window.resources["TextNoRecords"]);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("inventoryError", "errlist", "error");
                });
        },

        loadTrainingsites: function (url, inputs, textDefaultOption, self) {
            var subItems = [];
            var roleId = $("#inventoryPool option:selected").val();
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));

             jQuery.get(url,
                inputs,
                function (data) {
                    var tsiteId = $("#tsid option:selected").val()
                    var tsid = '';
                    if (tsiteId != undefined && tsiteId != '') {
                        tsid = tsiteId;
                    }

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                       }

                    $("#tsid").empty().append(subItems);
                    tsid = $("#tsid option:selected").val();
                    //hinding site inventory button except roleId 4
                    if (roleId == 4) {
                        $('#divSiteDownload').toggleClass("hide", false);
                    }
                    else {
                        $('#divSiteDownload').toggleClass("hide", true);
                    }
                    //load all inventory
                    var url = $("#inventoryPool").data("url");
                    var tcId = $("#tcId option:selected").val()
                    var inventory = $("#inventoryPool option:selected").val();
                    var input = {};
                    var showButton = true;

                    input = { roleId: inventory, tcIdInCaseDualRole: tcId, tsId: tsid };
                    self.loadInventory(url, input, showButton, self);

                })
                .error(function (err) {
                    appCommon.showResponseError("inventoryError", "errlist", window.resources["TextNoTrainingSitesFound"]);
                });
        },

        loadInventory: function (url, data, showButton, self) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: data,
                success: function (result) {
                    $("#partial").html(result);
                    var roleId = $('.dataTable').data("inventorysource");
                    $("#divResultsTitle").toggleClass("hide", true);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": roleId == window.RoleType.Distributor.value ? [[1, "asc"]] : [[2, "asc"]],
                        columnDefs: [
                            {
                                targets: roleId == window.RoleType.Distributor.value ? [0] : [1],
                                visible: false
                            },
                            {
                                "targets": [-1],
                                "visible": false
                            }
                        ]
                    });
                    $('.dataTable tbody').on('click keypress', 'td.details-control', function (e) {
                        self.expand(e, table, showButton);
                    });

                    //Expand Inner Child
                    $(".expandInnerData").on("click", function () {
                        $(this).prev("td").trigger("click");
                    });

                },
                error: function (errMsg) {
                    appCommon.showResponseError("inventoryError", "errlst", errMsg);
                }
            });

            return false;
        }
    }
};
var AppIssueECard = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var toggleShowHide = {
        init: function () {
            var $el = $('a[data-toggle="collapse"]');
            $el.on('click', function (e) {
                ($el.delay(1000).hasClass('collapsed')) ? toggleShowHide.hide($el) : toggleShowHide.show($el);
            });
        },
        hide: function (obj) {
            obj.children('.text').text('Hide Info');
            (obj.children('.fa').hasClass('fa-caret-up')) ? obj.children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down') : '';
        },
        show: function (obj) {
            obj.children('.text').text('Show Info');
            (obj.children('.fa').hasClass('fa-caret-down')) ? obj.children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up') : '';
        }
    };
    var isDuplicate;    
    var inventorySource;
    var isUpload;

    var tcUrl = $("#divServiceUrl").data("tc_url");
    var instructorUrl = $("#divServiceUrl").data("instructor_url");
    var tsUrl = $("#divServiceUrl").data("ts_url");
    var quantityUrl = $("#divServiceUrl").data("quantity_url");
    var courseUrl = $("#divServiceUrl").data("course_url");
    var productNumber = $('#ddlCourse option:selected').data('productnumber');
    var validateAssignment = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];

        var courseId = $("#ddlCourse option:selected").val();
        var inventoryPool = $("#ddlInventoryPool option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();
        var instructorId = $("#ddlInstructor option:selected").val();
        var assignQuantity = $("#assignQty").val();
        var availableQuantity = parseInt($("#availQty").text());
        isUpload = $("#chkUpload")[0].checked;
        var dataFile = $("#dataFile")[0].files;
        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!(inventoryPool == 'tc' || inventoryPool == 'ts' || inventoryPool == 'tcts')) {
            errorMsg[errorMsg.length] = window.resources["TextInventoryPoolRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if (inventoryPool == 'ts' && (!tsId || tsId <= 0)) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
        }

        if (availableQuantity <= 0) {
            // errorMsg[errorMsg.length] = "Training center does not have sufficiant inventory.";
            //  errorMsg[errorMsg.length] = window.resources["TextAssigneCardstoStudents"];
        }

        if (!instructorId || instructorId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
        }
        if (assignQuantity > availableQuantity) {
            errorMsg[errorMsg.length] = window.resources["TextExceedsInventory"];
        }


        if (isUpload) {
            if (dataFile.length == 0) {

                errorMsg[errorMsg.length] = window.resources["TextUploadFileRequired"];
            } else {
                var file = $("#dataFile")[0].files;

                var extension = file[0].name.substr(file[0].name.lastIndexOf('.') + 1).toLowerCase();

                if (extension != "xls" && extension != "xlsx" && extension != "csv") {

                    errorMsg[errorMsg.length] = window.resources["TextFileShouldBeExcelOrCSV"];
                }
            }
        } else {
            //if (!jQuery.isNumeric(assignQuantity) || Math.floor(assignQuantity) != assignQuantity || parseInt(assignQuantity) <= 0) {
            //    errorMsg[errorMsg.length] = window.resources["TextAssignQtyRequired"];
            //}

            if (!assignQuantity || assignQuantity == "0")
                errorMsg[errorMsg.length] = window.resources["TextAssignQtyRequired"];
            else if (!jQuery.isNumeric(assignQuantity) || Math.floor(assignQuantity) != assignQuantity || parseInt(assignQuantity) <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextAssignQtyPositiveInteger"];
            }
        }

        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }

    return {

        init: function () {
            var self = this;            

            $("#ddlInventoryPool")
                .on("change",
                    function (e) {
                        var $el = $(e.target);
                        inventorySource = $el.val();
                        self.resetAll();
                        $('#ddlTS, #ddlCourse, #ddlTS, #ddlInstructor').val('');
                        if (inventorySource == "tc" || inventorySource == "ts" || inventorySource == "tcts") {
                            self.getData(tcUrl, { inventorySrc: inventorySource }, '#ddlTC', '#divTC', window.resources["SelectTrainingCenter"]);
                        }
                    });

            $("#ddlTC")
                .on("change",
                    function (e) {                        
                        var tcId = $(e.target).val();

                        $("#assignError").toggleClass("hide", true);
                        $('#ddlCourse, #ddlTS, #ddlInstructor').val('');
                        $("#divCourse").toggleClass("hide", true);
                        $("#divInstructor").toggleClass("hide", true);
                        $("#divTS").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", true);

                        if (tcId > 0) {
                            var inventorySource = $("#ddlInventoryPool option:selected").val();
                            if (inventorySource == "tc") {
                                self.getData(courseUrl,
                                    {
                                        orgId: tcId,
                                        inventorySrc: inventorySource
                                    },
                                    '#ddlCourse',
                                    '#divCourse',
                                    window.resources["SelectCourse"]);
                            } else if (inventorySource == "ts" || inventorySource == "tcts") {
                                self.getData(tsUrl, { tcId: tcId, inventorySrc: inventorySource }, "#ddlTS", "#divTS", window.resources["TextSelectTrainingSite"]);
                            }                            
                        }
                    });

            $("#ddlTS")
                .on("change",
                    function (e) {
                        var tsId = $(e.target).val();
                        $("#assignError").toggleClass("hide", true);
                        $('#ddlCourse, #ddlInstructor').val('');
                        $("#divCourse").toggleClass("hide", true);
                        $("#divInstructor").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", true);

                        if (tsId > 0) {
                            var inventorySource = $("#ddlInventoryPool option:selected").val();
                            self.getData(courseUrl,
                                {
                                    orgId: tsId,
                                    inventorySrc: inventorySource
                                },
                                '#ddlCourse',
                                '#divCourse',
                                window.resources["SelectCourse"]);
                        }
                    });

            $("#ddlCourse")
                .on("change",
                    function (e) {
                        var selectedOpt = $("#ddlCourse option:selected");
                        courseId = $("#ddlCourse option:selected").val();

                        $("#assignError").toggleClass("hide", true);
                        $('#ddlInstructor').val('');
                        $("#divInstructor").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", true);

                        if (courseId > 0) {
                            var tcId = $("#ddlTC option:selected").val();
                            //start pals plus course
                            productNumber = $('#ddlCourse option:selected').data('productnumber');
                            var isTccinv = ($('#ddlInventoryPool').val() == 'tc')
                            if (productNumber == '20-2819-12' && isTccinv == 1) {
                                $("#divCardType").toggleClass("hide", false);
                                if ($('#ddlCardType').val() != 'new')
                                    return;
                            } else {
                                $("#ddlCardType").val('');
                                $("#divCardType").toggleClass("hide", true);
                                $("#divReplace").toggleClass("hide", true);
                            }
                            //end
                            var parentCourseId = selectedOpt.data("parentid");
                            if (parentCourseId == "0" || parentCourseId == "") {
                                parentCourseId = courseId;
                            }
                            var inventorySource = $("#ddlInventoryPool option:selected").val();

                            if (inventorySource == "tc") {
                                self.getAvailableQty(parentCourseId, inventorySource, tcId, 0);
                                self.getData(instructorUrl,
                                    {
                                        tcId: tcId,
                                        courseId: courseId
                                    },
                                    '#ddlInstructor',
                                    '#divInstructor',
                                    window.resources["SelectInstructor"]);
                            } else if (inventorySource == "ts" || inventorySource == "tcts") {
                                var tsId = $("#ddlTS option:selected").val();
                                self.getAvailableQty(parentCourseId, inventorySource, tcId, tsId);
                                self.getData(instructorUrl,
                                    {
                                        tcId: tcId,
                                        tsId: tsId,
                                        courseId: courseId
                                    },
                                    '#ddlInstructor',
                                    '#divInstructor',
                                    window.resources["SelectInstructor"]);
                            }
                        }
                    });
            $("#ddlCardType").on("change",
                function (e) {
                   // self.resetAll();
                    var cardType = $("#ddlCardType option:selected").val();
                    $("#divInventoryPool").toggleClass("hide", true);
                    var cardType = $("#ddlCardType option:selected").val();
                    if (cardType == 'new') {
                        $("#divReplace").toggleClass("hide", true);
                        $("#ddlCourse").trigger("change");
                    }
                    if (cardType == 'replacement') {
                        $("#divReplace").toggleClass("hide", false);
                        $("#divInstructor").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                    }
                });
            $("#btnSearchReplace").on("click",
                function (e) {
                    var cardType = $("#ddlCardType option:selected").val();
                    // $("#ddlInventoryPool").val('');
                    if (!cardType) {
                        var errorMsg = [];
                        errorMsg[errorMsg.length] = window.resources["SelectCardType"];
                        appCommon.showResponseError("assignError", "errlist", errorMsg);

                    }
                    if (cardType == 'replacement') {
                        var pView = $("#ddlCardType").data("view");
                        // var data = this.assignModel(btn.id);
                        var url = $("#ddlCardType").data("replaceurl");
                        var courseId = $("#ddlCourse option:selected").val();
                        self.submit(url, { courseID: courseId }, this.render, "", pView);
                        return false;
                    }

                });
            $("#ddlInstructor")
                .on("change",
                    function (e) {
                        $("#assignError").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", false);
                    });

            $("#chkUpload")
                .on("change",
                    function (e) {
                        isUpload = $(e.target)[0].checked;
                        if (isUpload) {
                            $("#divUpload").toggleClass("hide", false);
                            $("#assignQty").val("");
                            window.studentAssignmentViewModel.AssignedQty = "";
                            $("#assignQty").attr("disabled", "disabled");
                        } else {
                            $("#divUpload").toggleClass("hide", true);
                            $("#assignQty").removeAttr("disabled");
                        }
                    });
        },


        initMultiSelect: function () {
            $('.bootstrapmultiselect').multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourseModules"],
                nSelectedText: ' ' + window.resources["TextSelectedModules"]
            });
        },

        resetAll: function () {
            $("#assignError").toggleClass("hide", true);
            $("#divTC").toggleClass("hide", true);
            $("#divTS").toggleClass("hide", true);
            $("#divCourse").toggleClass("hide", true);
            $("#divInstructor").toggleClass("hide", true);
            $("#divBox").toggleClass("hide", true);
            $("#divSubmit").toggleClass("hide", true);
        },

        getData: function (url, inputs, objDropdown, objDiv, textDefaultOption) {
            jQuery.get(url, inputs,
                function (data) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                if (objDropdown !== "#ddlCourse") {
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                                }
                                else {
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name, "data-parentid": item.ParentCourseId, "data-productnumber": item.ProductNumber, "data-module": item.HasModule, "data-subcourse": item.HasSubCourse }));
                                    //var opt = $('<option></option>');
                                    //opt.val(item.Id).html(item.Name);
                                    //opt.data("parentid", item.ParentCourseId);
                                    //opt.data("module", item.HasModule);
                                    //opt.data("productnumber", item.ProductNumber);
                                    //opt.data("subcourse", item.HasSubCourse);
                                    //subItems.push(opt);
                                }                                
                            });
                    }
                    $(objDropdown).empty().append(subItems).val('');
                    $(objDropdown).toggleClass("hide", false);
                    $(objDiv).toggleClass("hide", false);                   
                })
                .error(function (err) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                    $(objDropdown).empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getAvailableQty: function (courseId, inventorySource, tcId, tsId) {
            $("#divBox").toggleClass("hide", true);
            jQuery.get(quantityUrl,
                {
                    courseId: courseId,
                    inventorySrc: inventorySource,
                    tcId: tcId,
                    tsId: tsId
                },
                function (data) {
                    if (data) {
                        $("#divBox").toggleClass("hide", false);
                        $("#availQty").text(data);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        validateEmail: function (email) {

            var pattern =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return $.trim(email).match(pattern) ? true : false;
        },

        validateStudent: function () {
            var self = this;
            var errorCourseDate;
            var errorFirstName;
            var errorLastName;
            var errorEmail;
            var errorInvalidEmail;
            var errorInvalidCourseDate;
            var errorCourseModule;
            var errorSubCourse;
            var errorMsg = [];
            $("#tblStudent")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        var objSelect = $(this).find("select");
                        $(objInput[1]).toggleClass("errorhighlight", false);
                        $(objInput[2]).toggleClass("errorhighlight", false);
                        $(objInput[3]).toggleClass("errorhighlight", false);
                        $(objInput[4]).toggleClass("errorhighlight", false);
                        $(objInput[5]).toggleClass("errorhighlight", false);
                        $(objSelect[0]).toggleClass("errorhighlight", false);
                        if (objInput[1].value == "") {
                            $(objInput[1]).toggleClass("errorhighlight", true);
                            errorCourseDate = window.resources["TextCourseDateRequired"];
                        } else {
                            var now = new Date();
                            var myDate = new Date(objInput[1].value);
                            if (myDate > now) {
                                errorInvalidCourseDate = window.resources["TextCourseDateRange"];
                            }
                        }
                        if (!objInput[2].value.trim()) {
                            $(objInput[2]).toggleClass("errorhighlight", true);
                            errorFirstName = window.resources["TextFirstNameRequired"];
                        }
                        if (!objInput[3].value.trim()) {
                            $(objInput[3]).toggleClass("errorhighlight", true);
                            errorLastName = window.resources["TextLastNameRequired"];
                        }
                        if (!objInput[4].value.trim()) {
                            $(objInput[4]).toggleClass("errorhighlight", true);
                            errorEmail = window.resources["TextEmailRequired"];
                        } else {
                            if (!self.validateEmail((objInput[4].value))) {
                                errorInvalidEmail = window.resources["TextInvalidEmail"];
                                $(objInput[4]).toggleClass("errorhighlight", true);
                            }
                        }

                        var ddlSubCourse = $(objSelect[1]);
                        if (window.studentAssignmentViewModel.HasSubCourse == 1 && ddlSubCourse.length > 0 && (!ddlSubCourse.val()
                            || ddlSubCourse.val().length === 0)) {
                            ddlSubCourse.toggleClass("errorhighlight", true);
                            errorSubCourse = window.resources["TextCourseTypeRequired"];
                        }
                    }

                });

            if (errorCourseDate) errorMsg[errorMsg.length] = errorCourseDate;
            if (errorFirstName) errorMsg[errorMsg.length] = errorFirstName;
            if (errorLastName) errorMsg[errorMsg.length] = errorLastName;
            if (errorEmail) errorMsg[errorMsg.length] = errorEmail;
            if (errorInvalidCourseDate) errorMsg[errorMsg.length] = errorInvalidCourseDate;
            if (errorInvalidEmail) errorMsg[errorMsg.length] = errorInvalidEmail;
            if (errorCourseModule) errorMsg[errorMsg.length] = errorCourseModule;
            if (errorSubCourse) errorMsg[errorMsg.length] = errorSubCourse;

            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);

            if (errorMsg.length == 0) {
                return true;
            }

            return false;
        },

        highlightDuplicateRows: function () {
            isDuplicate = false;
            var index = {},
                getText = function () {
                    return $.trim($(this).text());
                };
            $('#tblConfirm').find("tr").each(function (tr) {
                var rowKey = $(this).find(".duplicate-student").map(getText).toArray().join("|");
                if (index.hasOwnProperty(rowKey)) {
                    index[rowKey].push(this);
                } else {
                    index[rowKey] = [this];
                }
            });
            $.each(index, function (rowKey, rows) {
                if (rows.length > 1) {

                    $.each(rows,
                        function (id, row) {
                            // $(row).toggleClass("highlight", true);
                            row.style.backgroundColor = "#ebccd1";
                            isDuplicate = true;
                        });

                }
            });

            if (isDuplicate) {
                $("#assignErrorstep3").toggleClass("hide", false);
                appCommon.showWarning("assignErrorstep3", "errlist1", window.resources["TextDuplicateStudents"]);
            }
        },

        assignModel: function (button) {

            window.studentAssignmentViewModel.CourseName = "";
            window.studentAssignmentViewModel.TCName = "";
            window.studentAssignmentViewModel.InstructorName = "";
            window.studentAssignmentViewModel.TrainingSiteName = "";

            window.studentAssignmentViewModel.CourseId = $("#ddlCourse option:selected").val();
            if (window.studentAssignmentViewModel.CourseId) {
                window.studentAssignmentViewModel.CourseName = $("#ddlCourse option:selected").text();
            }

            window.studentAssignmentViewModel.ParentCourseId = $("#ddlCourse option:selected").data("parentid");
            if (window.studentAssignmentViewModel.ParentCourseId == "0" || window.studentAssignmentViewModel.ParentCourseId == "") {
                window.studentAssignmentViewModel.ParentCourseId = window.studentAssignmentViewModel.CourseId;
            }

            window.studentAssignmentViewModel.SubCourseId = $("#ddlSubCourse option:selected").val();
            if (window.studentAssignmentViewModel.SubCourseId) {
                window.studentAssignmentViewModel.SubCourseName = $("#ddlSubCourse option:selected").text();
            }

            window.studentAssignmentViewModel.TCId = $("#ddlTC option:selected").val();

            window.studentAssignmentViewModel.InstructorId = $("#ddlInstructor option:selected").val();
            if (window.studentAssignmentViewModel.InstructorId) {
                $("#hdnInstrName").val($("#ddlInstructor option:selected").text());
            }

            window.studentAssignmentViewModel.TrainingSiteId = $("#ddlTS option:selected").val();

            window.studentAssignmentViewModel.AvailableQty = parseInt($("#availQty").text());
            window.studentAssignmentViewModel.HasModule = $("#ddlCourse option:selected").data("module");
            window.studentAssignmentViewModel.HasSubCourse = $("#ddlCourse")[0].options[$("#ddlCourse")[0].selectedIndex]
                .getAttribute("data-subcourse");

            window.studentAssignmentViewModel.InventorySource = $("#ddlInventoryPool option:selected").val();

            window.studentAssignmentViewModel.IsUpload = isUpload;


            var student = [];
            $("#tblStudent")
                .find("tr")
                .each(function (item) {

                    if (item != 0) {
                        var objInput = $(this).find("input");
                        var objModule = $(this).find("select");

                        student.push({
                            CourseDate: objInput[1].value,
                            FirstName: objInput[2].value.trim(),
                            LastName: objInput[3].value.trim(),
                            Email: objInput[4].value.trim(),                            
                            CourseModuleName: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(", "):"",
                            CourseModuleId: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(","):"",
                            SubCourseId: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",") : null,
                            SubCourse: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(",") : ""
                        });

                    }

                });

            var data = new FormData();

            if (isUpload) {
                var files = $("#dataFile")[0].files;
                for (var i = 0; i < files.length; i++) {
                    data.append("file", files[i]);
                }
            }

            if (button == "btnMoveNext") {
                if (isUpload) {
                    window.studentAssignmentViewModel.AssignedQty = 0;
                } else {
                    window.studentAssignmentViewModel.AssignedQty = $("#assignQty").val();
                }

            } else {
                window.studentAssignmentViewModel.AssignedQty = student.length;
                window.studentAssignmentViewModel.StudentList = student;
            }

            $("#divAssignQty").text(student.length);
            data.append("model", JSON.stringify(window.studentAssignmentViewModel));
            return data;
        },

        moveNext: function (btn) {

            var pView = $(btn).data("view");

            if (pView == "#completeAssignCards") {
                $(btn).prop("disabled", true);
            }

            var data = this.assignModel(btn.id);

            if (pView !== "#searchreplacement" && !validateAssignment()) {
                if (pView == "#completeAssignCards") {
                    $(btn).prop("disabled", false);
                }

                return false;
            }

            var url = $(btn).data("url");

            if (btn.id == "btnFinish" && isDuplicate) {
                if (!confirm(window.resources["TextDuplicateAlert"])) {
                    return false;
                }
            }

            this.submit(url, data, this.render, "", pView);
            return false;
        },

        movePrevious: function (view) {
            this.hideAll();
            $(view).toggleClass("hide", false);
            $("#assignErrorstep2").toggleClass("hide", true);
            $("#assignErrorstep3").toggleClass("hide", true);
        },

        submit: function (url, data, cb, msg, divView) {
            var self = this;
            if (divView != "#studentAssignment") {
                if (!self.validateStudent()) {

                    if (divView == "#completeAssignCards") {
                        $("#btnFinish").prop("disabled", false);
                    }

                    return false;
                }
            }

            var errDiv = "assignError";
            if (divView == "#confirmAssignCards") {
                errDiv = "assignErrorstep2";
            }
            if (divView == "#completeAssignCards") {
                errDiv = "assignErrorstep3";
            }

            if (divView == "#studentAssignment") {
                jQuery.ajax({
                    url: url,
                    type: "POST",
                    contentType: false,
                    processData: false,
                    data: data,
                    dataType: "html",
                    success: function (result) {
                        self.render(result, divView);
                    },
                    error: function (errMsg) {
                        appCommon.showResponseError(errDiv, "errlist", errMsg);
                    }
                });

            } else {
                jQuery.post(url,
                    window.studentAssignmentViewModel,
                    function (result) {
                        self.render(result, divView);
                    })
                    .fail(function (errMsg) {
                        appCommon.showResponseError(errDiv, "errlist", errMsg);
                    })
                    .always(function () {
                        if (divView == "#completeAssignCards") {
                            $("#btnFinish").prop("disabled", false);
                        }
                    });
            }

        },

        render: function (data, view) {

            var self = this;

            if (data) {
                $(view).html(data);
                appCommon.initDatePicker(true);
                if (view == "#studentAssignment") {
                    self.initMultiSelect();
                    $("#moduleHelp").toggleClass("hide", window.studentAssignmentViewModel.HasModule != 1);
                    $("#tdAssignTCName").html($("#ddlTC option:selected").text());
                    $("#tdAssignTSName").html($("#ddlTS option:selected").text());
                }

                $("[id*='tdInstrNameP']").html($("#hdnInstrName").val());
                $('[data-toggle="popover"]').popover();
            }
            if (view == "#confirmAssignCards") {
                if (!self.validateStudent()) return false;
                self.highlightDuplicateRows();
                $("#tblConfirm").DataTable({
                    "pageLength": 25
                });

                $("#tdConfirmTCName").html($("#ddlTC option:selected").text());
                $("#tdConfirmTSName").html($("#ddlTS option:selected").text());
            }
            self.assignModel();
            $("#divAssignQty").text(window.studentAssignmentViewModel.AssignedQty);

            self.hideAll();
            $(view).toggleClass("hide", false);
            toggleShowHide.init();

            if (view == "#completeAssignCards") {

                $("#tdCompTCName").html($("#ddlTC option:selected").text());
                $("#tdCompTSName").html($("#ddlTS option:selected").text());

                var table = $("#tblEcard").DataTable({
                    "pageLength": 25
                });

                if (table.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Assigned eCards")
                                }
                            ]
                        });
                    $("#exportStudent").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");

                    $(".lnkecard").click($.proxy(self.loadECards, self));
                }
            }
        },

        hideAll: function (data) {
            $("#index").toggleClass("hide", true);
            $("#studentAssignment").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", true);
            $("#completeAssignCards").toggleClass("hide", true);
        },

        remove: function (lnk) {

            if ($('#tblStudent').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var table = $('#tblConfirm').DataTable();

                table.row(row).remove().draw(false);
                var count = $('#tblStudent').find("tr").length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#divAssignQty").text(count);
                $("#assignQty").val(count);
            } else {

                appCommon.showResponseError("assignErrorstep2", "errlist2", window.resources["TextAtLeastOneStudentRequired"]);
            }

            return false;
        },

        removeConfirm: function (lnk) {

            if ($('#tblConfirm').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var table = $('#tblStudent').DataTable();

                table.row(row).remove().draw(false);
                var trs = $('#tblConfirm').find("tr");
                var count = trs.length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#tdAssignQty, #divAssignQty").html(count);
                $("#assignQty").val(count);
                if (count == 1) {
                    isDuplicate = false;
                }
            } else {

                appCommon.showResponseError("assignErrorstep3", "errlist3", window.resources["TextAtLeastOneStudentRequired"]);
            }

            return false;
        },

        selectAll: function (obj) {

            $("#tblStudent")
                .find("input:checkbox")
                .each(function () {
                    this.checked = obj.checked;
                });
        },
        updateSubCourse: function (e) {

            var subCourseId = $(e).val();
            $("#tblStudent")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("select");
                        objInput.val(subCourseId);
                    }
                });
        },
        updateDate: function (e) {

            var courseDate = $(e).val();

            $("#tblStudent")
                .find("tr")
                .each(function (item) {

                    if (item != 0) {
                        var objInput = $(this).find("input");
                        $(objInput[1]).datepicker("setDate", courseDate);
                    }

                });
        },

        updateModule: function (e) {

            var modules = $(e).val();

            $("#tblStudent")
                .find("tr")
                .each(function (item) {

                    if (item != 0) {
                        var objInput = $(this).find("select");
                        objInput.val(modules);
                        objInput.multiselect("refresh");
                    }

                });
        },
        validateSearch: function () {
            var errorMsg = [];
            var tcid = $("#tcId option:selected").val();
            var fName = $("#firstname").val();
            var lName = $("#lastname").val();
            var email = $("#email").val();
            var code = $("#ecode").val();

            if (!(fName || lName || email || code)) {
                errorMsg[errorMsg.length] = window.resources["TextAtleastOneValue"];
            } else {
                if (fName && !lName) {
                    errorMsg[errorMsg.length] = window.resources["TextEnterLastName"];
                }

                if (!tcid) {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                }
            }

            return appCommon.showResponseError("assignError1", "errlist1", errorMsg);
        },
        loadInitialResult: function (hideAlert) {
            var self = this;
            var url = $("#hdnSearchUrl").val();
            $("#divAlert").toggleClass("hide", hideAlert);
            $("#assignError1").toggleClass("hide", true);
            window.studentAssignmentViewModel.StudentECardInfo = {};
            if (!this.validateSearch()) {
                return false;
            }
            window.studentAssignmentViewModel.CourseId = $("#hdnCourseId").val();
            window.studentAssignmentViewModel.TCId = $("#tcId option:selected").val();
            window.studentAssignmentViewModel.StudentECardInfo.FirstName = $("#firstname").val();
            window.studentAssignmentViewModel.StudentECardInfo.LastName = $("#lastname").val();
            window.studentAssignmentViewModel.StudentECardInfo.Email = $("#email").val();
            window.studentAssignmentViewModel.StudentECardInfo.CertificateId = $("#ecode").val();
            var divView = "#divSearchResult";
            jQuery.post(url,
                { model: window.studentAssignmentViewModel, __RequestVerificationToken :$("input[name=__RequestVerificationToken]").val()},
                function (result) {
                    self.render(result, divView);
                })
                .fail(function (errMsg) {
                    appCommon.showResponseError("assignError1", "errlist", errMsg);
                })
                .always(function () {
                    if (divView == "#completeAssignCards") {
                        $("#btnFinish").prop("disabled", false);
                    }
                });
        },

        searcheCards: function (e) {
            e.preventDefault();
            var self = this;
            self.loadInitialResult(!e.canShowMsg);
        },
        issueReplacementCard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmReplacementeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmReplaceCard"]);
            $("#confirmReplacementeCardModal").modal("show");
            $("#btnReplaceCardOk").off("click");
            $("#btnReplaceCardOk").on("click", function () { self.saveReplacementCard(e) });
        },
        saveReplacementCard: function (e) {
            e.preventDefault();
            $("#confirmReplacementeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var tcid = $el.data("tcid");
            var TCName = $("#tcId option:selected").text();
            var courseMoudules = "";
            var aftoken = $("input[name=__RequestVerificationToken]").val();
            var inputs = { eCardGuid: eCardGuid, tcid: tcid, courseMoudules: courseMoudules, TCName: TCName, __RequestVerificationToken: aftoken  };
            jQuery.post(url,
                inputs,
                function (result) {
                    var divView = '#completeReplacement';
                    $(divView).toggleClass("hide", false);
                    self.render(result, divView);
                    $("#searchreplacement").toggleClass("hide", true);
                })
                .fail(function (errMsg) {
                    appCommon.showResponseError("assignError1", "errlist", errMsg);
                })

        },
        clearSearch: function (e) {
            e.preventDefault();
            var self = this;
            $("#divSearchError").toggleClass("hide", true);
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#ecode").val("");
            $("#tcId").val("");
            appCommon.focusMessage();
        }
    }
};
var AppOptInReport = function () {
    $.ajaxSetup({ async: true, cache: false });

    var appCommon = new AppCommon();

    function validateRequest() {
        $("#reportError").html("").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var errorMsg = [];

        if (startDate === "" && endDate !== "") errorMsg.push(window.resources["TextStartDateRequired"]);
        if (endDate === "" && startDate !== "") errorMsg.push(window.resources["TextEndDateRequired"]);

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }


    return {
        init: function () {
            $(document).ready(function () {
                $("#ddlReports option:contains(Opt-In Report)").prop("selected", true);
            });
        },

        btnReport_Click: function () {
            var url = $("#btnReport").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var courseId = $("#CourseId").val();
            var type = $("#ddlType").val();

            if (validateRequest()) {
                this.loadReport(url, startDate, endDate, courseId, type);
            }
        },

        loadReport: function (url, startDate, endDate, courseId, type) {
            $.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { CourseId: courseId, startdate: startDate, enddate: endDate, type: type },
                success: function (result) {
                    $("#reportData").html(result);
                    $("#example").DataTable({
                        pageLength: 25,
                        order: [[0, "asc"]]
                    });
                },
                error: function (errMsg) {
                    // corrected container id
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        btnDownload_Click: function (e) {
            e.preventDefault();

            var url = $("#btnDownload").data("url");
            var $el = $(e.target);

            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var courseId = $("#CourseId").val();
            var type = $("#ddlType").val();
            var startIndex = $el.data("startindex");
            var endIndex = $el.data("endindex");

            var inputs = {
                CourseId: courseId,
                startdate: startDate,
                enddate: endDate,
                type: type,
                startIndex: startIndex,
                endIndex: endIndex
            };

            $.get(url, inputs)
                .done(function (data) {
                    if (data && data.length > 0) {
                        var q =
                            "CourseId=" + encodeURIComponent(courseId) +
                            "&startdate=" + encodeURIComponent(startDate) +
                            "&enddate=" + encodeURIComponent(endDate) +
                            "&type=" + encodeURIComponent(type) +
                            "&startIndex=" + encodeURIComponent(startIndex) +
                            "&endIndex=" + encodeURIComponent(endIndex);

                        window.location.href = "OptInReport/DownloadReport?" + q;
                    } else {
                        appCommon.showResponseError("reportError", "errlist", window.resources["TextNoRecords"]);
                    }
                })
                .fail(function (err) {
                    appCommon.showResponseError("reportError", "errlist", err || "error");
                });
        }
    }
}
;
var AppSearchAllECards = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();
    var HS_PRODUCTS = new Set(['25-2826', '25-2826-4', '25-2826-6', '25-3002']);
    var MOD_BASIC = '37';
    var MOD_TOTAL = '27';

    function lockHeartsaverEdit() {
        var pn = String($('#hdnEditProductNumber').val() || $('#hdnProductNumber').val() || '');
        if (!pn || !HS_PRODUCTS.has(pn)) return;
        $('input[id^=courseModule][value="' + MOD_BASIC + '"], input[id^=courseModule][value="' + MOD_TOTAL + '"]')
            .each(function () {
                var $cb = $(this);
                $cb.prop('disabled', true);
                var $lbl = $cb.closest('label');
                if ($lbl.length) $lbl.addClass('disabled');
                var $frm = $cb.closest('.form-check,.checkbox');
                if ($frm.length) $frm.addClass('disabled');
            });
    }

    return {

        init: function () {
            var self = this;
            $(document)
                .ready(function () {
                    $("#resendEmailModal").on("shown.bs.modal", self.focusResend);
                    $("#resendSMSModal").on("shown.bs.modal", self.focusResend);
                    $("#sendSecurityAnsModal").on("shown.bs.modal", self.focusResend);
                    $("#tcDetailModal").on("shown.bs.modal", self.focusResend);
                    $("#confirmClaimeCardModal").on("shown.bs.modal", self.focusResend);
                    $("#confirmUpdateEcardModal").on("shown.bs.modal", self.focusResend);
                    if ($('#hdnIsAdmin').val() == 1)
                        $("#divSearchBox").toggleClass("hide", false);
                    setTimeout(function () { $('#profileId').trigger('change'); }, 500);
                });

            self.initMultiSelect();
            if ($("#divInstType").length > 0) {
                $("input[id=radActive]:radio").prop("checked", true);

                $('input[type=radio][name=instType]').on('change',
                    function (e) {
                        self.toggleInstrStatus(e);
                    });
            }

            $("#profileId")
                .on("change",
                    function (e) {
                        var tcList = JSON.parse($('#algnTCWithRole').val());
                        var roleId = $("#profileId option:selected").val();
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                        $.each(tcList,
                            function (index, item) {
                                if (item.RoleId == roleId) {
                                    subItems.push($("<option/>", { value: item.EntityId, text: item.EntityName, "data-isprintonly": item.IsPrintOnly }));
                                }
                            });

                        $("#ddlTC").empty().append(subItems).val("");
                        $("#divSearchResult").toggleClass("hide", true);
                        $("#divSite").toggleClass("hide", true);
                        $("#divSearchBox").toggleClass("hide", true);

                    });
            $("#ddlTC")
                .on("change",
                    function (e) {
                        var courseUrl = $('#ddlTC').data("url");
                        var instrUrl = $('#ddlTC').data("instrurl");
                        var inp = {};
                        var tcId = $("#ddlTC option:selected").val();
                        var roleId = $("#profileId option:selected").val();
                        if (roleId == '' || tcId == '') {
                            $("#divSearchBox").toggleClass("hide", true);
                            $("#divSearchResult").toggleClass("hide", true);
                            $("#divSite").toggleClass("hide", true);
                            return;
                        }

                        if (roleId == RoleType.Instructor.value) {
                            $('#divInst').addClass('hide');
                        }
                        else {
                            $('#divInst').removeClass('hide');
                        }
                        $("#statusErr").toggleClass("hide", true);
                        $("#divSearchResult").toggleClass("hide", true);
                        $("#ddlTS").val("");
                        if (!(roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value)) {
                            var instrInp = { orgId: tcId, orgType: 'tc', isActiveInstructor: true };
                            $("#instructor").empty().val("");
                            self.renderSource(instrUrl, instrInp, "#instructor", window.resources["TextSelectInstructor"], self);
                        }

                        if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value || roleId == RoleType.EcardAdmin.value || roleId == RoleType.Instructor.value) {
                            if (tcId > 0) {
                                var isEcardAdmin = (roleId == RoleType.EcardAdmin.value)
                                var isInstrDomestic = (roleId == RoleType.Instructor.value && $('#hdnIsIntlAlignment').val() == 0)
                                var inp = { tcId: tcId, roleId: roleId };
                                self.renderSource(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#CourseIds", window.resources["SelectCourse"], self);
                                var url = $("#ddlTC").data("tsurl");
                                var textDefaultOption = window.resources["TextSelectTrainingSite"];
                                self.renderSource(url, inp, "#ddlTS", textDefaultOption, self);
                                $("#divSite").toggleClass("hide", false);
                                $("#spanTsAstrkRequire").toggleClass("hide", roleId == RoleType.Instructor.value);

                                if (roleId == RoleType.Instructor.value) {
                                    $("#divSearchBox").toggleClass("hide", false);
                                }
                                else {
                                    $("#divSearchBox").toggleClass("hide", true);
                                }
                            }
                            return;
                        }
                        else {
                            $("#divSite").toggleClass("hide", true);
                        }

                        $("input[id=radActive]:radio").prop("checked", true);
                        $("#divSearchBox").toggleClass("hide", false);

                    });
            $("#ddlTS")
                .on("change",
                    function (e) {
                        var url = $('#ddlTS').data("url");
                        var instrUrl = $('#ddlTC').data("instrurl");
                        var inp = {};
                        var tsId = $("#ddlTS option:selected").val();
                        var roleId = $("#profileId option:selected").val();
                        if (roleId == '' || tsId == '') {
                            var courseUrl = $('#ddlTC').data("url");
                            var tcId = $("#ddlTC option:selected").val();
                            self.renderSource(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#CourseIds", window.resources["SelectCourse"], self);
                            return;
                        }

                        $('#divSearchBox').toggleClass("hide", false);
                        $("#divSearchResult").toggleClass("hide", true);
                        $("#statusErr").toggleClass("hide", true);
                        $("input[id=radActive]:radio").prop("checked", true);
                        self.renderSource(url, { orgId: tsId, orgType: 'ts', roleId: roleId }, "#CourseIds", window.resources["SelectCourse"], self);

                        if (!(roleId == RoleType.EcardAdmin.value || (roleId == RoleType.Instructor.value && $('#hdnIsIntlAlignment').val() == 0))) {
                            var instrInp = { orgId: tsId, orgType: 'ts', isActiveInstructor: true };
                            $("#instructor").empty().val("");
                            self.renderSource(instrUrl, instrInp, "#instructor", window.resources["TextSelectInstructor"], self);
                        }
                        if (roleId == RoleType.Instructor.value) {
                            $('#divInst').addClass('hide');
                        }
                        else {
                            $('#divInst').removeClass('hide');
                        }

                    });
        },

        toggleInstrStatus: function (e) {

            var self = this;
            var $el = $(e.target);
            var instType = $el.val();

            $("#statusErr").toggleClass("hide", true);
            var tcId = $("#ddlTC option:selected").val();
            var roleId = $("#profileId option:selected").val();

            var isActiveInstr = (instType === "act" ? true : false);
            var url = $("#hdnGetInstrUrl").val();
            var inp = {};
            if (!(roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value)) {
                inp = { orgId: tcId, orgType: 'tc', isActiveInstructor: isActiveInstr };
            }
            else {
                var tsId = $("#ddlTS option:selected").val();
                if (tsId == '')
                    inp = { orgId: tcId, orgType: 'tc', isActiveInstructor: isActiveInstr };
                else
                    inp = { orgId: tsId, orgType: 'ts', isActiveInstructor: isActiveInstr };
            }
            $("#instructor").empty().val("");
            self.renderSource(url, inp, "#instructor", window.resources["TextSelectInstructor"], self);
        },

        initMultiSelect: function () {
            $("#course").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: false,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        renderSource: function (url, inp, src, placeHolder, self) {
            var subItems = [];
            if (src != '#courseId' && src != '#course') {
                subItems.push($("<option/>", { value: "", text: placeHolder }));
            }

            jQuery.get(url, inp ? inp : null,
                function (data) {
                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, "data-isparent": item.HasChild, text: item.Name }));
                            });
                    }

                    if (src == '#CourseIds') {
                        $("#CourseIds").empty().append(subItems).val("");
                    }
                    else if (src == '#course') {
                        $("#course").empty().append(subItems).multiselect('rebuild').val("");
                    }
                    else {
                        $(src).empty().append(subItems).val("");
                    }
                })
                .error(function (err) {
                    $(src).empty().append(subItems).val("");
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        onLoadInstrSuccess: function (data) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
            if (data && data.length > 0) {
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>",
                            {
                                value: item.UserId,
                                text: item.InstructorWithId
                            }));
                    });
            }

            $("#instructor").empty().append(subItems).val('');
        },

        onLoadInstrFail: function (err) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
            $("#ddlInstructor").empty().append(subItems).val('');
            appCommon.showResponseError("statusErr", "errlist", err);
        },

        focusResend: function (e) {
            var modal = $(this);
            modal.find("#studentemail").focus();
            modal.find("#btnResendSMS").focus();
            modal.find("#btnSendSecurityAns").focus();
            modal.find("#btnCloseTC").focus();

            var $el = $(e.target);
            var modalName = $el.attr("id");
            if (modalName == 'resendEmailModal') {
                $("#alertSuccess").text(window.resources["TextResentSuccessfully"]);
            } else if (modalName == 'resendSMSModal') {
                $("#alertSuccess").text(window.resources["TextResentSuccessfully"]);
            } else if (modalName == 'sendSecurityAnsModal') {
                $("#alertSuccess").text(window.resources["TextSentSecAnswerSuccessfully"]);
            }
        },

        validateSearch: function () {
            var err = [];

            var tcId, tsId, locId;
            window.searchCardModel.CourseDate = "";
            var fName = window.searchCardModel.FirstName = $("#firstname").val();
            var lName = window.searchCardModel.LastName = $("#lastname").val();
            var email = window.searchCardModel.Email = $("#email").val();
            var code = window.searchCardModel.ECardCode = $("#ecode").val();

            var fromDate = $("#courseFromDate").val();
            var toDate = $("#courseToDate").val();

            var eStatus = window.searchCardModel.EStatus = $("#estatus option:selected").val();
            var courseIds = $("#CourseIds").val();
            var course = window.searchCardModel.CourseIds = courseIds;
            var instructorId = window.searchCardModel.InstructorId = $("#instructor option:selected").val();
            if ($('#hdnIsAdmin').val() == 0) {
                var roleId = $("#profileId option:selected").val();
                var isIntlAlignment = $('#hdnIsIntlAlignment').val();
                tcId = window.searchCardModel.TCId = $("#ddlTC").val();
                window.searchCardModel.SelectRoleId = roleId;
                window.searchCardModel.TSId = "";
                window.searchCardModel.LocationId = "";
                if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value || roleId == RoleType.Instructor.value) {
                    tsId = window.searchCardModel.TSId = $("#ddlTS").val();
                }
            }

            if (!(fName || lName || email || code || eStatus || course || instructorId || (fromDate && toDate))) {
                err[err.length] =
                    window.resources["TextAtleastOneValue"];
            } else {
                if (fName && !lName) {
                    err[err.length] = window.resources["TextEnterLastName"];
                }

                if ((fromDate || toDate) && !appCommon.isValidDate(fromDate, toDate)) {
                    err[err.length] = appCommon.getDateFormatError(window.resources["CourseDate"]);
                }
                if ((roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) && !tsId) {
                    err[err.length] = window.resources["TextSelectTrainingSite"];
                }
                if (roleId == RoleType.EcardAdmin.value && !locId) {
                    err[err.length] = window.resources["TextSelectTrainingSite"];
                }
            }

            return appCommon.showResponseError("statusErr", "errlist", err);
        },

        loadInitialResult: function (hideAlert) {
            var self = this;
            var url = $("#hdnSearchUrl").val();
            $("#divAlert").toggleClass("hide", hideAlert);
            $("#statusErr").toggleClass("hide", true);

            if (!this.validateSearch()) {
                window.searchCardModel.StartDate = "";
                window.searchCardModel.EndDate = "";
                return false;
            }

            window.searchCardModel.StartDate = $("#courseFromDate").val();
            window.searchCardModel.EndDate = $("#courseToDate").val();
            window.searchCardModel.CourseDate = "";
            window.searchCardModel.IssueDate = "";

            var feed = window.searchCardModel;
            self.callAPI("post", url, feed, self.onLoadResult, self.onFailSearch);
        },

        searcheCards: function (e) {
            e.preventDefault();
            var self = this;
            self.loadInitialResult(!e.canShowMsg);
        },

        onLoadResult: function (data) {
            $("#divSearchResult").toggleClass("hide", false).html(data);
            $("#example").DataTable();
            $("[data-blocked]").closest("tr").addClass("blockedInRed");
            if ($("#divAlert").is(":visible")) {
                appCommon.focusMessage();
            } else {
                $("html, body").animate({
                    scrollTop: $("#titleResults").offset().top - 55
                },
                    1000);
            }
        },

        onFailSearch: function (err) {
            appCommon.showResponseError("statusErr", "errlist", err);
        },

        clearSearch: function (e) {
            e.preventDefault();
            var self = this;
            $("#statusErr").html("");
            $("#statusErr").toggleClass("hide", true);
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#ecode").val("");
            $("#estatus").val('');
            $("#CourseIds").val('');
            $("#instructor").val('');
            $("#courseToDate").datepicker('setDate', "");
            $("#courseFromDate").datepicker('setDate', "");
            $("#divSearchResult").html("");
            $("#divEditCard").html("");
            $("#divAlert").toggleClass("hide", true);
            window.searchCardModel = {};
            appCommon.focusMessage();
        },

        action_Click: function (e) {

            e.preventDefault();
            var self = this;
            $("#divAlert").toggleClass("hide", true);
            $("#resendEmailModal").modal("hide");
            $("#resendSMSModal").modal("hide");
            $("#sendSecurityAnsModal").modal("hide");

            $("#resendEmailError").toggleClass("hide", true);
            $("#resendSMSError").toggleClass("hide", true);
            $("#sendSecurityAnsError").toggleClass("hide", true);

            $("#lnkSaveResendEmail").toggleClass("hide", false);

            var $el = $(e.target);

            var inputs = {
                ECardUId: $el.data("eid"),
                StudentId: $el.data("stuid"),
                EmailAddress: $el.data("email"),
                Url: $el.data("url"),
                MobilePhone: $el.data("mobilephone"),
                FirstName: $el.data("firstname"),
                LastName: $el.data("lastname"),
                ECardUId: $el.data("eid"),
                Action: $el.data("action"),
                CanSaveEmail: false,
                CanSavePhone: false,
                Status: $el.data("status")
            };

            if ($el.data("action") == "email" || $el.data("action") == "claimemail") {
                if ($el.data("coursetype") == 4) {
                    $("#lnkSaveResendEmail").toggleClass("hide", true);
                }
                $("#resendEmailModal").modal("show");
                $("#btnResend").off("click");
                $("#lnkSaveResendEmail").off("click");
                $("#btnResend").on("click", inputs, $.proxy(self.validateReSendEmail, self));
                $("#lnkSaveResendEmail").on("click", inputs, $.proxy(self.validateReSendEmail, self));
                $("#studentemail").val(inputs.EmailAddress);
            } else if ($el.data("action") == "sms") {
                $("#resendSMSModal").modal("show");
                $("#btnResendSMS").off("click");
                $("#btnResendSMS").on("click", inputs, $.proxy(self.validateReSendSMS, self));
                $("#studentphone").val(inputs.MobilePhone);
            } else if ($el.data("action") == "securityAnswer") {
                $("#sendSecurityAnsModal").modal("show");
                $("#btnSendSecurityAns").off("click");
                $("#btnSendSecurityAns").on("click", inputs, $.proxy(self.validateSendSecurityAns, self));
                $("#studentSecurityEmail").val(inputs.EmailAddress);
            }

            if ($el.data("action") == "claimemail") {
                $("#lnkSaveResendEmail").toggleClass("hide", true);
            }
        },

        validateSendSecurityAns: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);

            inputs.EmailAddress = $("#studentSecurityEmail").val();

            $("#sendSecurityAnsError").toggleClass("hide", true);

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("sendSecurityAnsError", "emailErr", err);
            }
            var url = inputs.Url;
            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        validateReSendEmail: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);

            if ($el[0].id == "lnkSaveResendEmail") {
                inputs.CanSaveEmail = true;
            }
            inputs.EmailAddress = $("#studentemail").val();

            $("#resendEmailError").toggleClass("hide", true);

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("resendEmailError", "emailErr", err);
            }

            var url = inputs.Url;

            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        validateReSendSMS: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);

            $("#resendSMSError").toggleClass("hide", true);

            var err = [];
            if (!inputs.MobilePhone) {
                err[err.length] = window.resources["TextMobileNumberRequired"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("resendSMSError", "emailErr", err);
            }

            var url = inputs.Url;

            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        onSuccess: function (data) {
            if (data) {
                $("#resendEmailModal").modal("hide");
                $("#resendSMSModal").modal("hide");
                $("#sendSecurityAnsModal").modal("hide");
                $("#divAlert").toggleClass("hide", false);
                $("#btnSearchCards").trigger({ type: "click", canShowMsg: true });
            }
        },

        onFail: function (err) {
            appCommon.showResponseError("resendError", "emailErr", err);
        },

        editECard: function (e) {
            e.preventDefault();
            $("#divEditError").toggleClass("hide", true);
            $("#divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                eCardGuid: $el.data("eid"),
                isInstructorCard: $el.data("isinstsrc")
            }

            self.callAPI("post", url, inputs, $.proxy(self.onLoadingEditCard, self), self.onFailSearch);
        },

        onLoadingEditCard: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divEditCard").toggleClass("hide", false).html(data);
                appCommon.initDatePicker(true);
                appCommon.focusMessage();
                lockHeartsaverEdit();
                if ($("#blockeCard").length > 0) {
                    $("#blockeCard").off("change");
                    $("#blockeCard").on("change", self.changeStatus);
                    $("#notes").prop("disabled", !$("#blockeCard").is(":checked"));
                }
            }
        },

        changeStatus: function (e) {
            if (!this.checked) {
                $("#notes").val("").prop("disabled", "disabled");
            } else {
                $("#notes").prop("disabled", false);
            }
        },

        validateEdit: function () {
            var self = this;
            var err = [];
            var fName = window.searchCardModel.FirstName = $("#fname").val().trim();
            var lName = window.searchCardModel.LastName = $("#lname").val().trim();
            var email = window.searchCardModel.Email = $("#emailaddress").val().trim();
            window.searchCardModel.Phone = $("#phone").val()?.replace('(', '').replace(')-', '-').replace(')', '-');
            window.searchCardModel.InstructorStudentId = $("#instructorStudentId").val();
            window.searchCardModel.ECardUId = $("#hdnEUId").val();
            window.searchCardModel.SubCourseId = $("#subCourse option:selected").val();
            var courseDate = window.searchCardModel.CourseDate = $("#courseDate").val();
            if ($("#blockeCard").length > 0) {
                var isChecked = $("#blockeCard").is(":checked");
                window.searchCardModel.EStatus = isChecked ? $("#blockeCard").val() : 0;
                window.searchCardModel.Notes = isChecked ? $("#notes").val() : "";
                window.searchCardModel.TCId = $("#hdnTCId").val();
            }

            window.searchCardModel.HasModules = $("input[id^=courseModule]").length > 0;

            window.searchCardModel.ModuleIds = $("input[id^=courseModule]:checked").map(function () {
                return this.value;
            }).get().join(",");

            var instructorId = window.searchCardModel.InstructorId = $("#newInstructor option:selected").val();

            if (!fName) {
                err[err.length] = window.resources["TextFirstNameRequired"];
            }

            if (!lName) {
                err[err.length] = window.resources["TextLastNameRequired"];
            }

            if (!email) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }
            if (email != $('#hdnPreviuosEmail').val()) {
                if (email.toLowerCase() == $('#hdnLoggedInUserEmail').val().toLowerCase())
                    err[err.length] = window.resources["TextInvalidStudentEmailLoggedInMsg"];
                if (email.toLowerCase() == $('#newInstructor option:selected').data('instremail').toLowerCase())
                    err[err.length] = window.resources["TextInvalidStudentEmailMsg"];
            }
            if (!courseDate) {
                err[err.length] = window.resources["TextCourseDateRequired"];
            }

            if (!instructorId) {
                err[err.length] = window.resources["TextInstructorRequired"];
            }
            return appCommon.showResponseError("divEditError", "errlist1", err);
        },

        validateMobilePhone: function (mobilePhone) {
            var pattern =
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return $.trim(mobilePhone).match(pattern) ? true : false;
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");

            if (!self.validateEdit()) return false;

            $("#confirmUpdateEcardModal").modal("show");
            $("#btnOk").off("click");
            $("#btnOk").on("click", function () { self.callAPI("post", url, window.searchCardModel, self.onSuccessSave, self.onEditCardFailed); });
        },

        onSuccessSave: function (data) {
            if (data) {
                $("#confirmUpdateEcardModal").modal("hide");
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TextStudentInformationUpdated"]);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "errlist1", err);
        },

        claimECard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmClaimeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmClaimeCard"]);
            $("#confirmClaimeCardModal").modal("show");
            $("#btnClaimeCardOk").off("click");
            $("#btnClaimeCardOk").on("click", function () { self.saveClaimECard(e) });

        },

        saveClaimECard: function (e) {

            e.preventDefault();
            $("#confirmClaimeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var tcid = $el.data("tcid");
            var inputs = { eCardGuid: eCardGuid, tcid: tcid };
            self.callAPI("post", url, inputs, self.onSuccessClaim, self.onEditCardFailed);
        },

        onSuccessClaim: function (data) {
            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TexteCardClaimedSuccessfully"]);
                $("#lnkClaimECard, #lnlReclaimECard").hide();
                appCommon.focusMessage();
            }
        },

        reclaimECard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmClaimeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmReclaimeCard"]);
            $("#confirmClaimeCardModal").modal("show");
            $("#btnClaimeCardOk").off("click");
            $("#btnClaimeCardOk").on("click", function () { self.saveReclaimECard(e) });

        },

        showRevisionHistory: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var certId = $el.data("ecode");
            var data = { certId: certId };
            self.callAPI("get", url, data, function (result) {
                if (result && result.length > 0) {
                    $("#divRevisionModelBody").html(result);
                    $("#eCardRevisionModal").modal("show");

                    var table = $("#tblEcardRevisionHistory").DataTable({
                        "pageLength": 25,
                        "order": [[8, "desc"]]
                    });
                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                            {
                                buttons: [
                                    {
                                        extend: 'excelHtml5',
                                        title: appCommon.getFileName("Ecard Revision History")
                                    }
                                ]
                            });
                        $("#expotbutton").prepend(buttons.container())
                            .find("a.dt-button").addClass("btn-sm btn-primary")
                            .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#divRevisionModelBody");
                    }
                }
            },
                function (err) {
                    appCommon.showResponseError("divEditError", "errlist", err);
                });
        },
        saveReclaimECard: function (e) {

            e.preventDefault();
            $("#confirmClaimeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var courseId = $el.data("courseid");
            var inputs = { eCardGuid: eCardGuid, courseId: courseId };
            self.callAPI("post", url, inputs, self.onReclaimSuccess, self.onEditCardFailed);
        },

        onReclaimSuccess: function (data) {

            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TexteCardReclaimedSuccessfully"]);
                $("#lnkClaimECard, #lnlReclaimECard").hide();
                appCommon.focusMessage();
            }

        },

        loadSearch: function (e) {
            e.preventDefault();
            $("#divSearch").toggleClass("hide", false);
            $("#divEditCard").html("").toggleClass("hide", true);
            $("#btnSearchCards").trigger({ type: "click", canShowMsg: false });
        },

        toggleState: function (e) {
            var countryCode = $(e.target).val();
            if (!(countryCode == "USA" || countryCode == "CAN")) {
                $("#stateDiv").hide();
            } else {
                $("#stateDiv").show();
            }
        },

        open_lookup: function () {
            var self = this;
            $("#tcError").html("").addClass("hide");

            var url = $("#tcModal").data("url");

            self.callAPI("get",
                url,
                null,
                function (result) {
                    $(".modal-body").html(result);
                    $("#tcModal").modal("show");
                    $("#countryCode").off("click");
                    $("#search").off("click");
                    $("#countryCode").on("change", self.toggleState);
                    $("#search").on("click", $.proxy(self.searchTC, self));
                },
                self.onEditCardFailed);

        },

        searchTC: function (e) {
            e.preventDefault();
            var self = this;

            $("#tcError").html("").addClass("hide");

            var countryCode = $("#countryCode").val();
            var stateCode = $("#stateCode").val();

            if (!countryCode) {
                return appCommon.showResponseError("tcError", "tcErrlist", window.resources["TextCountryRequired"]);
            }

            if ((countryCode === "USA" || countryCode === "CAN") && !stateCode) {
                return appCommon.showResponseError("tcError", "tcErrlist", window.resources["TextStateRequired"]);;
            }

            var city = $("#city").val();
            var tcNum = $("#tcId").val();
            var url = $("#hdnLookUpUrl").val();

            var data = {
                countryCode: countryCode,
                stateCode: stateCode,
                city: city,
                tcNumber: tcNum
            };

            self.callAPI("get",
                url,
                data,
                function (result) {
                    $("#tcNamesTableContainer").html(result);
                    $("a[id^=lnkPick]").off("click");
                    $("a[id^=lnkPick]").on("click", $.proxy(self.pickTC, self));
                },
                function (err) {
                    appCommon.showResponseError("tcError", "tcErrlist", err);
                });

            return false;
        },

        pickTC: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcId = $el.data("tcid");
            var tcName = $el.data("tcname");
            var instId = $("#newInstructor option:selected").val();

            var data = {
                tcId: tcId,
                courseId: $("#divCourse").data("cid"),
                isActive: true
            }

            var url = $("#hdnInstructorUrl").val();

            self.callAPI("get", url, data, function (result) {
                if (result && result.length > 0) {
                    $("#hdnTCId").val(tcId);
                    $("#spTCName").html(tcName);

                    var subItems = [];
                    $.each(result,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.DisplayName }));
                        });
                    $("#newInstructor").empty().append(subItems).val("");

                    if ($("#newInstructor option[value='" + instId + "']").length > 0) {
                        $("#newInstructor").val(instId);
                    }
                }

                $("#tcModal").modal("hide");
            },
                function (err) {
                    appCommon.showResponseError("tcError", "tcErrlist", err);
                });
        },
        findTCById: function (e) {

            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcid = $el.data("tcid");
            var url = $el.data("url");
            var feed = { tcid: tcid }
            self.callAPI("get", url, feed, self.onfindTCByIdResult, self.onFailedFindTC);

        },
        onfindTCByIdResult: function (data) {
            var info = '';

            info = '<div>' + data.TrainingCenter.Name + '</div><div>' + data.TrainingCenter.TCIdNumber + '</div>';

            if (data.TrainingCenter.Address1) {
                info = info + '<div>' + data.TrainingCenter.Address1 + '</div>';
            }
            if (data.TrainingCenter.City) {
                info = info + '<div>' + data.TrainingCenter.City + '</div>';
            }
            if (data.TrainingCenter.State) {
                info = info + '<div>' + data.TrainingCenter.State
                if (data.TrainingCenter.Country) {
                    info = info + ', ' + data.TrainingCenter.Country + '</div>';
                }
                else {
                    info + '</div>';
                }
            }
            if (!data.TrainingCenter.State && data.TrainingCenter.Country) {
                info = info + '<div>' + data.TrainingCenter.Country + '</div>';
            }
            if (data.TrainingCenter.Phone) {
                info = info + '<div>' + data.TrainingCenter.Phone + '</div>';
            }
            $("#tcDetailContent").html(info);
            $("#tcDetailModal").modal("show");
        },
        onFailedFindTC: function (err) {
            appCommon.showResponseError("tcDetailError", "tcErr", err);
        }
    }
}
;
var AppSearchECards = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    return {

        init: function () {
            var self = this;
            $(document)
                .ready(function () {
                    $("#resendEmailModal").on("shown.bs.modal", self.focusResend);
                    $("#resendSMSModal").on("shown.bs.modal", self.focusResend);
                    $("#sendSecurityAnsModal").on("shown.bs.modal", self.focusResend);
                    $("#tcDetailModal").on("shown.bs.modal", self.focusResend);
                    $("#confirmClaimeCardModal").on("shown.bs.modal", self.focusResend);
                });

            self.initMultiSelect();
            if ($("#divInstType").length > 0) {
                $("input[id=radActive]:radio").prop("checked", true);

                $('input[type=radio][name=instType]').on('change',
                    function (e) {
                        self.toggleInstrStatus(e);
                    });
            }
        },

        toggleInstrStatus: function (e) {

            var self = this;
            var $el = $(e.target);
            var instType = $el.val();

            $("#divSearchError").toggleClass("hide", true);

            var inp = { isActive: instType === "act" ? true : false };
            var url = $("#hdnGetInstrUrl").val();

            self.callAPI("get", url, inp, self.onLoadInstrSuccess, self.onLoadInstrFail);
        },

        initMultiSelect: function () {
            $("#course").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        onLoadInstrSuccess: function (data) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
            if (data && data.length > 0) {
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>",
                            {
                                value: item.UserId,
                                text: item.InstructorWithId
                            }));
                    });
            }

            $("#instructor").empty().append(subItems).val('');
        },

        onLoadInstrFail: function (err) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
            $("#ddlInstructor").empty().append(subItems).val('');
            appCommon.showResponseError("divSearchError", "errlist", err);
        },

        focusResend: function (e) {
            var modal = $(this);
            modal.find("#studentemail").focus();
            modal.find("#btnResendSMS").focus();
            modal.find("#btnSendSecurityAns").focus();
            modal.find("#btnCloseTC").focus();

            var $el = $(e.target);
            var modalName = $el.attr("id");
            if (modalName == 'resendEmailModal') {
                $("#alertSuccess").text(window.resources["TextResentSuccessfully"]);
            } else if (modalName == 'resendSMSModal') {
                $("#alertSuccess").text(window.resources["TextResentSuccessfully"]);
            } else if (modalName == 'sendSecurityAnsModal') {
                $("#alertSuccess").text(window.resources["TextSentSecAnswerSuccessfully"]);
            }
        },

        validateSearch: function () {
            var err = [];

            window.searchCardModel.CourseDate = "";
            var fName = window.searchCardModel.FirstName = $("#firstname").val();
            var lName = window.searchCardModel.LastName = $("#lastname").val();
            var email = window.searchCardModel.Email = $("#email").val();
            var code = window.searchCardModel.ECardCode = $("#ecode").val();

            var fromDate = $("#courseFromDate").val();
            var toDate = $("#courseToDate").val();

            var eStatus = window.searchCardModel.EStatus = $("#estatus option:selected").val();
            var courseIds = $("#course").multiselect("getSelected").val();
            var course = window.searchCardModel.CourseIds = courseIds ? courseIds.join(",") : "";
            var instructorId = window.searchCardModel.InstructorId = $("#instructor option:selected").val();

            if (!(fName || lName || email || code || eStatus || course || instructorId || (fromDate && toDate))) {
                err[err.length] =
                    window.resources["TextAtleastOneValue"];
            } else {
                if (fName && !lName) {
                    err[err.length] = window.resources["TextEnterLastName"];
                }

                if ((fromDate || toDate) && !appCommon.isValidDate(fromDate, toDate)) {
                    err[err.length] = appCommon.getDateFormatError(window.resources["CourseDate"]);
                }
            }

            return appCommon.showResponseError("divSearchError", "errlist", err);
        },

        loadInitialResult: function (hideAlert) {
            var self = this;
            var url = $("#hdnSearchUrl").val();
            $("#divAlert").toggleClass("hide", hideAlert);
            $("#divSearchError").toggleClass("hide", true);

            if (!this.validateSearch()) {
                window.searchCardModel.StartDate = "";
                window.searchCardModel.EndDate = "";
                return false;
            }

            window.searchCardModel.StartDate = $("#courseFromDate").val();
            window.searchCardModel.EndDate = $("#courseToDate").val();
            window.searchCardModel.CourseDate = "";

            var feed = window.searchCardModel;
            self.callAPI("post", url, feed, self.onLoadResult, self.onFailSearch);
        },

        searcheCards: function (e) {
            e.preventDefault();
            var self = this;
            self.loadInitialResult(!e.canShowMsg);
        },

        onLoadResult: function (data) {
            $("#divSearchResult").toggleClass("hide", false).html(data);
            $("#example").DataTable();
            $("[data-blocked]").closest("tr").addClass("blockedInRed");
            if ($("#divAlert").is(":visible")) {
                appCommon.focusMessage();
            } else {
                $("html, body").animate({
                    scrollTop: $("#titleResults").offset().top - 55
                },
                    1000);
            }
        },

        onFailSearch: function (err) {
            appCommon.showResponseError("divSearchError", "errlist", err);
        },

        clearSearch: function (e) {
            e.preventDefault();
            var self = this;
            $("#divSearchError").html("");
            $("#divSearchError").toggleClass("hide", true);
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#ecode").val("");
            $("#estatus").val('');
            $("#course").multiselect('deselectAll', false);
            $("#course").multiselect('updateButtonText');
            $("#instructor").val('');
            $("#courseToDate").datepicker('setDate', "");
            $("#courseFromDate").datepicker('setDate', "");
            $("#divSearchResult").html("");
            $("#divEditCard").html("");
            $("#divAlert").toggleClass("hide", true);
            window.searchCardModel = {};
            appCommon.focusMessage();
        },

        action_Click: function (e) {

            e.preventDefault();
            var self = this;
            $("#divAlert").toggleClass("hide", true);
            $("#resendEmailModal").modal("hide");
            $("#resendSMSModal").modal("hide");
            $("#sendSecurityAnsModal").modal("hide");

            $("#resendEmailError").toggleClass("hide", true);
            $("#resendSMSError").toggleClass("hide", true);
            $("#sendSecurityAnsError").toggleClass("hide", true);

            $("#lnkSaveResendEmail").toggleClass("hide", false);

            var $el = $(e.target);

            var inputs = {
                ECardUId: $el.data("eid"),
                StudentId: $el.data("stuid"),
                EmailAddress: $el.data("email"),
                Url: $el.data("url"),
                MobilePhone: $el.data("mobilephone"),
                FirstName: $el.data("firstname"),
                LastName: $el.data("lastname"),
                ECardUId: $el.data("eid"),
                Action: $el.data("action"),
                CanSaveEmail: false,
                CanSavePhone: false,
                Status: $el.data("status")
            };

            if ($el.data("action") == "email" || $el.data("action") == "claimemail") {
                $("#resendEmailModal").modal("show");
                $("#btnResend").off("click");
                $("#lnkSaveResendEmail").off("click");
                $("#btnResend").on("click", inputs, $.proxy(self.validateReSendEmail, self));
                $("#lnkSaveResendEmail").on("click", inputs, $.proxy(self.validateReSendEmail, self));
                $("#studentemail").val(inputs.EmailAddress);
            } else if ($el.data("action") == "sms") {
                $("#resendSMSModal").modal("show");
                $("#btnResendSMS").off("click");
                $("#btnResendSMS").on("click", inputs, $.proxy(self.validateReSendSMS, self));
                $("#studentphone").val(inputs.MobilePhone);
            } else if ($el.data("action") == "securityAnswer") {
                $("#sendSecurityAnsModal").modal("show");
                $("#btnSendSecurityAns").off("click");
                $("#btnSendSecurityAns").on("click", inputs, $.proxy(self.validateSendSecurityAns, self));
                $("#studentSecurityEmail").val(inputs.EmailAddress);
            }

            if ($el.data("action") == "claimemail") {
                $("#lnkSaveResendEmail").toggleClass("hide", true);
            }
        },

        validateSendSecurityAns: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);

            inputs.EmailAddress = $("#studentSecurityEmail").val();

            $("#sendSecurityAnsError").toggleClass("hide", true);

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("sendSecurityAnsError", "emailErr", err);
            }
            var url = inputs.Url;
            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        validateReSendEmail: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);

            if ($el[0].id == "lnkSaveResendEmail") {
                inputs.CanSaveEmail = true;
            }
            inputs.EmailAddress = $("#studentemail").val();

            $("#resendEmailError").toggleClass("hide", true);

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("resendEmailError", "emailErr", err);
            }

            var url = inputs.Url;


            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        validateReSendSMS: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;
            var $el = $(e.target);


            $("#resendSMSError").toggleClass("hide", true);

            var err = [];
            if (!inputs.MobilePhone) {
                err[err.length] = window.resources["TextMobileNumberRequired"];
            }


            if (err.length > 0) {
                return appCommon.showResponseError("resendSMSError", "emailErr", err);
            }

            var url = inputs.Url;


            self.callAPI("post", url, inputs, self.onSuccess, self.onFail);
        },

        onSuccess: function (data) {
            if (data) {
                $("#resendEmailModal").modal("hide");
                $("#resendSMSModal").modal("hide");
                $("#sendSecurityAnsModal").modal("hide");
                $("#divAlert").toggleClass("hide", false);
                $("#btnSearchCards").trigger({ type: "click", canShowMsg: true });
            }
        },

        onFail: function (err) {
            appCommon.showResponseError("resendError", "emailErr", err);
        },

        editECard: function (e) {
            e.preventDefault();
            $("#divEditError").toggleClass("hide", true);
            $("#divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                eCardGuid: $el.data("eid"),
                isInstructorCard: $el.data("isinstsrc")
            }

            self.callAPI("post", url, inputs, $.proxy(self.onLoadingEditCard, self), self.onFailSearch);
        },

        onLoadingEditCard: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divEditCard").toggleClass("hide", false).html(data);
                appCommon.initDatePicker(true);
                appCommon.focusMessage();

                if ($("#blockeCard").length > 0) {
                    $("#blockeCard").off("change");
                    $("#blockeCard").on("change", self.changeStatus);
                    $("#notes").prop("disabled", !$("#blockeCard").is(":checked"));
                }
            }
        },

        changeStatus: function (e) {
            if (!this.checked) {
                $("#notes").val("").prop("disabled", "disabled");
            } else {
                $("#notes").prop("disabled", false);
            }
        },

        validateEdit: function () {
            var self = this;
            var err = [];
            var fName = window.searchCardModel.FirstName = $("#fname").val();
            var lName = window.searchCardModel.LastName = $("#lname").val();
            var email = window.searchCardModel.Email = $("#emailaddress").val();
            window.searchCardModel.Phone = $("#phone").val()?.replace('(', '').replace(')-', '-').replace(')', '-');
             window.searchCardModel.InstructorStudentId = $("#instructorStudentId").val();
            window.searchCardModel.ECardUId = $("#hdnEUId").val();
            window.searchCardModel.SubCourseId = $("#subCourse option:selected").val();
            var courseDate = window.searchCardModel.CourseDate = $("#courseDate").val();
            if ($("#blockeCard").length > 0) {
                var isChecked = $("#blockeCard").is(":checked");
                window.searchCardModel.EStatus = isChecked ? $("#blockeCard").val() : 0;
                window.searchCardModel.Notes = isChecked ? $("#notes").val() : "";
                window.searchCardModel.TCId = $("#hdnTCId").val();
            }

            window.searchCardModel.HasModules = $("input[id^=courseModule]").length > 0;

            window.searchCardModel.ModuleIds = $("input[id^=courseModule]:checked").map(function () {
                return this.value;
            }).get().join(",");

            var instructorId = window.searchCardModel.InstructorId = $("#newInstructor option:selected").val();

            if (!fName) {
                err[err.length] = window.resources["TextFirstNameRequired"];
            }

            if (!lName) {
                err[err.length] = window.resources["TextLastNameRequired"];
            }

            if (!email) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (!courseDate) {
                err[err.length] = window.resources["TextCourseDateRequired"];
            }

            if (!instructorId) {
                err[err.length] = window.resources["TextInstructorRequired"];
            }
            return appCommon.showResponseError("divEditError", "errlist1", err);
        },

        validateMobilePhone: function (mobilePhone) {
            var pattern =
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return $.trim(mobilePhone).match(pattern) ? true : false;
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");


            if (!self.validateEdit()) return false;

            self.callAPI("post", url, window.searchCardModel, self.onSuccessSave, self.onEditCardFailed);
        },

        onSuccessSave: function (data) {
            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TextStudentInformationUpdated"]);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "errlist1", err);
        },

        claimECard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmClaimeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmClaimeCard"]);
            $("#confirmClaimeCardModal").modal("show");
            $("#btnClaimeCardOk").off("click");
            $("#btnClaimeCardOk").on("click", function () { self.saveClaimECard(e) });

        },

        saveClaimECard: function (e) {

            e.preventDefault();
            $("#confirmClaimeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var tcid = $el.data("tcid");
            var inputs = { eCardGuid: eCardGuid, tcid: tcid };
            self.callAPI("post", url, inputs, self.onSuccessClaim, self.onEditCardFailed);
        },

        onSuccessClaim: function (data) {
            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TexteCardClaimedSuccessfully"]);
                $("#lnkClaimECard, #lnlReclaimECard").hide();
                appCommon.focusMessage();
            }
        },

        reclaimECard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmClaimeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmReclaimeCard"]);
            $("#confirmClaimeCardModal").modal("show");
            $("#btnClaimeCardOk").off("click");
            $("#btnClaimeCardOk").on("click", function () { self.saveReclaimECard(e) });

        },

        saveReclaimECard: function (e) {

            e.preventDefault();
            $("#confirmClaimeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var courseId = $el.data("courseid");
            var inputs = { eCardGuid: eCardGuid, courseId: courseId };
            self.callAPI("post", url, inputs, self.onReclaimSuccess, self.onEditCardFailed);
        },

        onReclaimSuccess: function (data) {

            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                $("#divEditAlert").find("#pSuccessMsg").html(window.resources["TexteCardReclaimedSuccessfully"]);
                $("#lnkClaimECard, #lnlReclaimECard").hide();
                appCommon.focusMessage();
            }

        },

        loadSearch: function (e) {
            e.preventDefault();
            $("#divSearch").toggleClass("hide", false);
            $("#divEditCard").html("").toggleClass("hide", true);
            $("#btnSearchCards").trigger({ type: "click", canShowMsg: false });
        },

        toggleState: function (e) {
            var countryCode = $(e.target).val();
            if (!(countryCode == "USA" || countryCode == "CAN")) {
                $("#stateDiv").hide();
            } else {
                $("#stateDiv").show();
            }
        },

        open_lookup: function () {
            var self = this;
            $("#tcError").html("").addClass("hide");

            var url = $("#tcModal").data("url");

            self.callAPI("get",
                url,
                null,
                function (result) {
                    $(".modal-body").html(result);
                    $("#tcModal").modal("show");
                    $("#countryCode").off("click");
                    $("#search").off("click");
                    $("#countryCode").on("change", self.toggleState);
                    $("#search").on("click", $.proxy(self.searchTC, self));
                },
                self.onEditCardFailed);

        },

        searchTC: function (e) {
            e.preventDefault();
            var self = this;

            $("#tcError").html("").addClass("hide");

            var countryCode = $("#countryCode").val();
            var stateCode = $("#stateCode").val();

            if (!countryCode) {
                return appCommon.showResponseError("tcError", "tcErrlist", window.resources["TextCountryRequired"]);
            }

            if ((countryCode === "USA" || countryCode === "CAN") && !stateCode) {
                return appCommon.showResponseError("tcError", "tcErrlist", window.resources["TextStateRequired"]);;
            }

            var city = $("#city").val();
            var tcNum = $("#tcId").val();
            var url = $("#hdnLookUpUrl").val();

            var data = {
                countryCode: countryCode,
                stateCode: stateCode,
                city: city,
                tcNumber: tcNum
            };

            self.callAPI("get",
                url,
                data,
                function (result) {
                    $("#tcNamesTableContainer").html(result);
                    $("a[id^=lnkPick]").off("click");
                    $("a[id^=lnkPick]").on("click", $.proxy(self.pickTC, self));
                },
                function (err) {
                    appCommon.showResponseError("tcError", "tcErrlist", err);
                });

            return false;
        },

        pickTC: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcId = $el.data("tcid");
            var tcName = $el.data("tcname");
            var instId = $("#newInstructor option:selected").val();

            var data = {
                tcId: tcId,
                courseId: $("#divCourse").data("cid"),
                isActive: true
            }

            var url = $("#hdnInstructorUrl").val();

            self.callAPI("get", url, data, function (result) {
                if (result && result.length > 0) {
                    $("#hdnTCId").val(tcId);
                    $("#spTCName").html(tcName);

                    var subItems = [];
                    $.each(result,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.DisplayName }));
                        });
                    $("#newInstructor").empty().append(subItems).val("");

                    if ($("#newInstructor option[value='" + instId + "']").length > 0) {
                        $("#newInstructor").val(instId);
                    }
                }

                $("#tcModal").modal("hide");
            },
                function (err) {
                    appCommon.showResponseError("tcError", "tcErrlist", err);
                });
        },
        findTCById: function (e) {

            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcid = $el.data("tcid");
            var url = $el.data("url");
            var feed = { tcid: tcid }
            self.callAPI("get", url, feed, self.onfindTCByIdResult, self.onFailedFindTC);

        },
        onfindTCByIdResult: function (data) {
            var info = '';

            info = '<div>' + data.TrainingCenter.Name + '</div><div>' + data.TrainingCenter.TCIdNumber + '</div>';

            if (data.TrainingCenter.Address1) {
                info = info + '<div>' + data.TrainingCenter.Address1 + '</div>';
            }
            if (data.TrainingCenter.City) {
                info = info + '<div>' + data.TrainingCenter.City + '</div>';
            }
            if (data.TrainingCenter.State) {
                info = info + '<div>' + data.TrainingCenter.State
                if (data.TrainingCenter.Country) {
                    info = info + ', ' + data.TrainingCenter.Country + '</div>';
                }
                else {
                    info + '</div>';
                }
            }
            if (!data.TrainingCenter.State && data.TrainingCenter.Country) {
                info = info + '<div>' + data.TrainingCenter.Country + '</div>';
            }
            if (data.TrainingCenter.Phone) {
                info = info + '<div>' + data.TrainingCenter.Phone + '</div>';
            }
            $("#tcDetailContent").html(info);
            $("#tcDetailModal").modal("show");
        },
        onFailedFindTC: function (err) {
            appCommon.showResponseError("tcDetailError", "tcErr", err);
        }
    }
}
;
window.hsModuleMutex = window.hsModuleMutex || (function () {
    var HS_PRODUCTS = new Set(['25-2826', '25-2826-4', '25-2826-6', '25-3002']);
    var MOD_BASIC = '37';
    var MOD_TOTAL = '27';
    var api;

    function setModuleIds(basic, total) {
        if (basic != null && basic !== undefined && basic !== '') MOD_BASIC = String(basic);
        if (total != null && total !== undefined && total !== '') MOD_TOTAL = String(total);
        if (api) {
            api.MOD_BASIC = MOD_BASIC;
            api.MOD_TOTAL = MOD_TOTAL;
        }
    }

    function hsGetCurrentPN() {
        return String(
            ($('#CourseId option:selected').data('productnumber')) ||
            (window.productNumber) ||
            (window.studentAssignmentViewModel && window.studentAssignmentViewModel.HSProductNumber) || // ← renamed
            ''
        );
    }

    function isTargetCourse(currentProductNumber) {
        return !!currentProductNumber && HS_PRODUCTS.has(String(currentProductNumber));
    }

    function currentPN() {
        return window.productNumber || $('#CourseId option:selected').data('productnumber');
    }

    function getOptsByValue($select) {
        var $basic = $select.find('option[value="' + MOD_BASIC + '"]');
        var $total = $select.find('option[value="' + MOD_TOTAL + '"]');
        return { $basic: $basic, $total: $total };
    }

    function enforce($select, lastChanged) {
        if (!$select || !$select.length) return;
        if (!isTargetCourse(currentPN())) return;

        var opts = getOptsByValue($select);
        if (!opts.$basic.length || !opts.$total.length) return;

        opts.$basic.prop('disabled', false);
        opts.$total.prop('disabled', false);

        var basicSel = opts.$basic.is(':selected');
        var totalSel = opts.$total.is(':selected');

        if (lastChanged && lastChanged.checked) {
            if (lastChanged.changed === MOD_TOTAL && basicSel) {
                opts.$basic.prop('selected', false);
            } else if (lastChanged.changed === MOD_BASIC && totalSel) {
                opts.$total.prop('selected', false);
            }
        }

        basicSel = opts.$basic.is(':selected');
        totalSel = opts.$total.is(':selected');

        if (totalSel) {
            opts.$basic.prop('disabled', true).prop('selected', false);
        } else if (basicSel) {
            opts.$total.prop('disabled', true).prop('selected', false);
        }

        $select.multiselect('refresh');
    }

    function reset($select) {
        if (!isTargetCourse(currentPN())) return;
        var opts = getOptsByValue($select);
        if (opts.$basic.length && opts.$total.length) {
            opts.$basic.prop('disabled', false);
            opts.$total.prop('disabled', false);
            $select.multiselect('refresh');
        }
    }

    api = { enforce: enforce, reset: reset, MOD_BASIC: MOD_BASIC, MOD_TOTAL: MOD_TOTAL, HS_PRODUCTS: HS_PRODUCTS, setModuleIds: setModuleIds };
    return api;
})();

(function () {
    try {
        var vm = window.studentAssignmentViewModel || {};
        if (window.hsModuleMutex && typeof window.hsModuleMutex.setModuleIds === 'function') {
            if (vm.ModBasic || vm.ModTotal) {
                window.hsModuleMutex.setModuleIds(vm.ModBasic, vm.ModTotal);
            }
        }
        if (vm.HSProductNumber && !window.productNumber) {
            window.productNumber = String(vm.HSProductNumber);
        }
    } catch (e) { }
})();

function AppStudentAssignment() {
    $.ajaxSetup({ async: true, cache: false });

    var appCommon = new AppCommon();

    function hsContextActive() {
        var pn = String($('#CourseId option:selected').data('productnumber') || '');
        return window.hsModuleMutex.HS_PRODUCTS.has(pn);
    }

    function hsCacheAllOptions() {
        $('.bootstrapmultiselect').each(function () {
            var $sel = $(this);
            if (!$sel.data('allOptions')) {
                $sel.data('allOptions', $sel.find('option').clone());
            }
        });
    }

    function hsHideTBInUI($select) {
        if (!hsContextActive()) return;
        var $menu = $select.siblings('.btn-group').find('ul.multiselect-container');
        $menu.find('input[value="' + window.hsModuleMutex.MOD_BASIC + '"]').closest('li').hide();
        $menu.find('input[value="' + window.hsModuleMutex.MOD_TOTAL + '"]').closest('li').hide();
    }

    function hsShowTBInUI($select) {
        var $menu = $select.siblings('.btn-group').find('ul.multiselect-container');
        $menu.find('input[value="' + window.hsModuleMutex.MOD_BASIC + '"]').closest('li').show();
        $menu.find('input[value="' + window.hsModuleMutex.MOD_TOTAL + '"]').closest('li').show();
    }
    function hsEnableTBOptions($select) {
        if (!$select || !$select.length) return;
        $select.find('option[value="' + window.hsModuleMutex.MOD_BASIC + '"]').prop('disabled', false);
        $select.find('option[value="' + window.hsModuleMutex.MOD_TOTAL + '"]').prop('disabled', false);
        try { $select.multiselect('rebuild'); } catch (e) { }
    }

    function hsStripTBFromValues($select) {
        if (!hsContextActive()) return;
        var vals = $select.val() || [];
        var filtered = $.grep(vals, function (v) { return v !== window.hsModuleMutex.MOD_TOTAL && v !== window.hsModuleMutex.MOD_BASIC; });
        if (filtered.length !== vals.length) {
            $select.val(filtered);
            try { $select.multiselect('rebuild'); } catch (e) { }
        }
    }

    function hsRadioIsRequiredAndMissing() {
        var pn = String($('#CourseId option:selected').data('productnumber') || '');
        var hasModule = (window.studentAssignmentViewModel && String(window.studentAssignmentViewModel.HasModule) === '1') || ($('#ddlModule').length > 0);
        var required = window.hsModuleMutex.HS_PRODUCTS.has(pn) && hasModule && $('#hsModuleRadioWrap').length && $('#hsModuleRadioWrap').is(':visible');
        if (!required) return false;
        return $('input[name="hsModuleGlobal"]:checked').length === 0;
    }

    function hsApplyGlobalChoice(mode) {
        if (!hsContextActive()) {
            return;
        }
        window.hsChoice = (mode === 'total' || mode === 'basic') ? mode : null;

        $('.bootstrapmultiselect').each(function () {
            var $sel = $(this);
            var want = (mode === 'total') ? window.hsModuleMutex.MOD_TOTAL :
                (mode === 'basic') ? window.hsModuleMutex.MOD_BASIC : null;

            hsStripTBFromValues($sel);

            if (want) {
                var vals = $sel.val() || [];
                if (vals.indexOf(want) === -1) vals.push(want);
                $sel.val(vals);
            }

            $sel.multiselect('rebuild');
            hsHideTBInUI($sel);
            try { $sel.multiselect('refresh'); } catch (e) { }
        });
    }

    function hsShowOrHideRadio() {
        var pn = String($('#CourseId option:selected').data('productnumber') || '');
        var hasModule = (window.studentAssignmentViewModel && String(window.studentAssignmentViewModel.HasModule) === '1') || ($('#ddlModule').length > 0);
        var show = window.hsModuleMutex.HS_PRODUCTS.has(pn) && hasModule;

        $('#hsModuleRadioWrap').toggleClass('hide', !show);

        if (!show) {
            $('input[name="hsModuleGlobal"]').prop('checked', false);
            window.hsChoice = null;
            $('.bootstrapmultiselect').each(function () {
                var $sel = $(this);
                hsEnableTBOptions($sel);
                hsShowTBInUI($sel);
            });
        } else {
            hsCacheAllOptions();
            var $checked = $('input[name="hsModuleGlobal"]:checked');
            if ($checked.length) {
                hsApplyGlobalChoice($checked.val());
            } else {
                $('.bootstrapmultiselect').each(function () {
                    var $sel = $(this);
                    hsStripTBFromValues($sel);
                    try { $sel.multiselect('rebuild'); } catch (e) { }
                    hsHideTBInUI($sel);
                });
            }
        }
    }


    var toggleShowHide = {
        init: function () {
            var $el = $('a[data-toggle="collapse"]');
            $el.on('click', function () {
                ($el.delay(1000).hasClass('collapsed')) ? toggleShowHide.hide($el) : toggleShowHide.show($el);
            });
            $(document).ready(function () {
                $("#confirmReplacementeCardModal").on("shown.bs.modal", self.focusResend);
            });
        },
        hide: function (obj) {
            obj.children('.text').text('Hide Info');
            (obj.children('.fa').hasClass('fa-caret-up')) ? obj.children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down') : '';
        },
        show: function (obj) {
            obj.children('.text').text('Show Info');
            (obj.children('.fa').hasClass('fa-caret-down')) ? obj.children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up') : '';
        }
    };
    var isDuplicate;
    var isMobileNumberExist;
    var filterBy = "tc";
    var inventorySource;
    var isUpload;

    var tcUrl = $("#divServiceUrl").data("tc_url");
    var tsUrl = $("#divServiceUrl").data("ts_url");
    var courseUrl = $("#divServiceUrl").data("course_url");
    var instructorUrl = $("#divServiceUrl").data("instructor_url");
    var quantityUrl = $("#divServiceUrl").data("quantity_url");
    var courseId = $("#CourseId option:selected").val();
    window.productNumber = $('#CourseId option:selected').data('productnumber');
    var studentemails = [];

    var validateAssignment = function () {
        $("#assignError").html("").addClass("hide");
        var errorMsg = [];

        var courseId = $("#CourseId option:selected").val();
        var roleId = $("#RoleId option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var instructorId = $("#ddlInstructor option:selected").val();
        var assignQuantity = $("#assignQty").val();
        var availableQuantity = parseInt($("#availQty").text(), 10) || 0;

        var $chkUpload = $("#chkUpload");
        var isUpload = $chkUpload.length ? $chkUpload[0].checked : false;
        var $dataFile = $("#dataFile");
        var files = $dataFile.length ? ($dataFile[0].files || []) : [];

        if (!courseId || courseId <= 0) {
            errorMsg.push(window.resources["TextCourseRequired"] || "Course is required");
        }
        if (!roleId || roleId <= 0) {
            errorMsg.push(window.resources["TextSelectRoleRequired"] || "Role is required");
        }
        if (!tcId || tcId <= 0) {
            errorMsg.push(window.resources["TextTrainingCenterRequired"] || "Training Center is required");
        }
        if (!instructorId || instructorId <= 0) {
            errorMsg.push(window.resources["TextInstructorRequired"] || "Instructor is required");
        }
        if (assignQuantity && jQuery.isNumeric(assignQuantity) && parseInt(assignQuantity, 10) > availableQuantity) {
            errorMsg.push(window.resources["TextExceedsInventory"] || "Assigned quantity exceeds available inventory");
        }

        if (isUpload) {
            if (files.length === 0) {
                errorMsg.push(window.resources["TextUploadFileRequired"] || "Upload file is required");
            } else {
                var name = files[0].name || "";
                var ext = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
                if (ext !== "xls" && ext !== "xlsx" && ext !== "csv") {
                    errorMsg.push(window.resources["TextFileShouldBeExcelOrCSV"] || "File must be Excel or CSV");
                }
            }
        } else {
            if (!assignQuantity || assignQuantity === "0") {
                errorMsg.push(window.resources["TextAssignQtyRequired"] || "Assign quantity is required");
            } else if (!jQuery.isNumeric(assignQuantity) || Math.floor(assignQuantity) != assignQuantity || parseInt(assignQuantity, 10) <= 0) {
                errorMsg.push(window.resources["TextAssignQtyPositiveInteger"] || "Assign quantity must be a positive whole number");
            }
        }

        // Heartsaver Total/Basic radio button validation
        var pn = String($('#CourseId option:selected').data('productnumber') || '');
        var hasModule = (window.studentAssignmentViewModel && String(window.studentAssignmentViewModel.HasModule) === '1') || ($('#ddlModule').length > 0);
        var radioVisible = $('#hsModuleRadioWrap').is(':visible');
        var isHsContext = radioVisible && window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pn) && hasModule;

        if (isHsContext) {
            if ($('input[name="hsModuleGlobal"]:checked').length === 0) {
                errorMsg.push("Module type selection required. Please review and try again.");
            }
        }

        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    };




    return {
        init: function () {
            var self = this;

            if (courseId > 0) self.showK12Info();

            $(document).on('change', 'input[name="hsModuleGlobal"]', function () {
                var val = $(this).val();
                if (val === 'total' || val === 'basic') {
                    hsApplyGlobalChoice(val);
                }
            });

            $("#ddlCardType").on("change", function () {
                self.resetAll();
                var cardType = $("#ddlCardType option:selected").val();
                $("#divInventoryPool").toggleClass("hide", true);
                self.showK12Info();
                var cardType2 = $("#ddlCardType option:selected").val();
                if (cardType2 == 'new') {
                    $("#divReplace").toggleClass("hide", true);
                    $("#CourseId").trigger("change");
                }
                if (cardType2 == 'replacement') {
                    $("#divReplace").toggleClass("hide", false);
                }
            });

            $("#btnSearchReplace").on("click", function () {
                var cardType = $("#ddlCardType option:selected").val();
                if (!cardType) {
                    var errorMsg = [];
                    errorMsg[errorMsg.length] = window.resources["SelectCardType"];
                    appCommon.showResponseError("assignError", "errlist", errorMsg);
                }
                if (cardType == 'replacement') {
                    var pView = $("#ddlCardType").data("view");
                    var url = $("#ddlCardType").data("replaceurl");
                    var courseId = $("#CourseId option:selected").val();
                    self.submit(url, { courseID: courseId }, this.render, "", pView);
                    return false;
                }
            });

            $("#RoleId").on("change", function (e) {
                var roleId = $(e.target).val();
                if (roleId > 0) {
                    self.resetAll();
                    $("#divTC").toggleClass("hide", true);
                    $("#divTS").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                    $("#divFrom").toggleClass("hide", true);
                    $("#divCardType").toggleClass("hide", true);
                    $('input[type=radio][name=fromType]').prop("checked", false);
                    if (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value || roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                        $("#divTC").toggleClass("hide", false);
                        var url = $(e.target).data("url");
                        self.getData(url, { selectedRoleId: roleId }, '#ddlTC', '#divTC', window.resources["SelectTrainingCenter"]);
                    }
                    if (roleId == RoleType.Instructor.value) {
                        $("#divFrom").toggleClass("hide", false);
                    }
                } else {
                    $("#assignError").toggleClass("hide", true);
                    $("#divTC").toggleClass("hide", true);
                    $("#divTS").toggleClass("hide", true);
                    $("#divFrom").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#divSubmit").toggleClass("hide", true);
                    $("#divSubmit").toggleClass("hide", true);
                }
            });

            $("#ddlInstructor").on("change", function () {
                $("#divSubmit").toggleClass("hide", false);
            });

            $("#ddlTC").on("change", function (e) {
                $("#assignError").toggleClass("hide", true);
                $("#divCardType").toggleClass("hide", true);
                var roleId = $("#RoleId option:selected").val();
                var tcId = $(e.target).val();
                $('#ddlTS').val('');
                filterBy = roleId != RoleType.Instructor.value ? 'tc' : filterBy;
                if (tcId > 0) {
                    self.resetAll();
                    $("#divTS").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                    if (filterBy == "tc" && (roleId == RoleType.TCC.value || roleId == RoleType.TCAdmin.value || roleId == RoleType.Instructor.value)) {
                        self.getData(courseUrl, { orgId: tcId, orgType: 'tc', roleId: roleId }, "#CourseId", "#divCourse", window.resources["SelectCourse"]);
                    } else if (filterBy == "ts" || roleId == RoleType.Instructor.value || roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value) {
                        $("#divInstructor").toggleClass("hide", true);
                        $("#divBox").toggleClass("hide", true);
                        $("#divSubmit").toggleClass("hide", true);
                        self.getData(tsUrl, { tcId: tcId, roleId: roleId }, "#ddlTS", "#divTS", window.resources["TextSelectTrainingSite"]);
                    }
                } else {
                    $("#divTS").toggleClass("hide", true);
                    $("#divFrom").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#divSubmit").toggleClass("hide", true);
                    $("#divInstructor").toggleClass("hide", true);
                }
            });

            $("#ddlTS").on("change", function (e) {
                var tsId = $(e.target).val();
                $("#assignError").toggleClass("hide", true);
                var tcId = $("#ddlTC option:selected").val();
                var roleId = $("#RoleId option:selected").val();
                if (tsId > 0) {
                    self.resetAll();
                    $("#divCourse").toggleClass("hide", true);
                    self.getData(courseUrl, { orgId: tsId, orgType: 'ts', roleId: roleId }, "#CourseId", "#divCourse", window.resources["SelectCourse"]);
                } else {
                    $("#divInstructor").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#divSubmit").toggleClass("hide", true);
                    $("#divCourse").toggleClass("hide", true);
                }
            });

            $("#CourseId").on("change", function () {
                self.resetAll();
                courseId = $("#CourseId option:selected").val();
                var roleId = $("#RoleId option:selected").val();
                var tcId = $("#ddlTC option:selected").val();
                var tsId;
                if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value || roleId == RoleType.Instructor.value) {
                    tsId = $("#ddlTS option:selected").val();
                }

                self.showK12Info();

                if (courseId > 0) {
                    window.productNumber = $('#CourseId option:selected').data('productnumber');
                    var isTccOrTca = ($('#RoleId').val() == RoleType.TCC.value || $('#RoleId').val() == RoleType.TCAdmin.value);
                    if (window.productNumber == '20-3006-3' && isTccOrTca == 1) {
                        $("#divCardType").toggleClass("hide", false);
                        if ($('#ddlCardType').val() != 'new') return;
                    } else {
                        $("#ddlCardType").val('');
                        $("#divCardType").toggleClass("hide", true);
                        $("#divReplace").toggleClass("hide", true);
                    }

                    $("#divInstType").toggleClass("hide", roleId == RoleType.Instructor.value);
                    $("input[id=radActive]:radio").prop("checked", roleId != RoleType.Instructor.value);

                    var instrType = $("input[name=instType]:checked").val();
                    self.getAvailableQty(courseId, roleId, tcId, tsId);
                    self.getData(instructorUrl,
                        {
                            tcId: tcId,
                            tsId: tsId,
                            courseId: courseId,
                            roleId: roleId,
                            isActive: roleId == RoleType.Instructor.value ? true : instrType === "act" ? true : false
                        },
                        '#ddlInstructor',
                        '#divInstructor',
                        window.resources["SelectInstructor"]);

                    hsShowOrHideRadio();
                } else {
                    $("#divInstructor").toggleClass("hide", true);
                    $("#divBox").toggleClass("hide", true);
                    $("#divSubmit").toggleClass("hide", true);
                }
            });

            $('input[type=radio][name=fromType]').on('change', function (e) {
                var $el = $(e.target);
                filterBy = $el.val();
                if (filterBy == "") filterBy = "tc";
                if (filterBy == "tc") $("#ddlTS").val('');
                var roleId = $("#RoleId option:selected").val();
                self.getData(tcUrl, { selectedRoleId: roleId, filterBy: filterBy }, '#ddlTC', '#divTC', window.resources["SelectTrainingCenter"]);
                $("#divTS").toggleClass("hide", true);
                $("#divCourse").toggleClass("hide", true);
                $("#divInstructor").toggleClass("hide", true);
                $("#divSubmit").toggleClass("hide", true);
                $("#divBox").toggleClass("hide", true);
            });

            $('input[type=radio][name=instType]').on('change', function (e) {
                $("#assignError").toggleClass("hide", true);
                var $el = $(e.target);
                var instType = $el.val();
                var tcId = $("#ddlTC option:selected").val();
                var tsId = 0;
                var courseId = $("#CourseId option:selected").val();
                var roleId = $("#RoleId option:selected").val();
                if (roleId == RoleType.TSC.value || roleId == RoleType.TSAdmin.value || roleId == RoleType.Instructor.value) {
                    tsId = $("#ddlTS option:selected").val();
                }
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["SelectInstructor"] }));
                $("#ddlInstructor").empty().append(subItems).val('');
                self.getData(instructorUrl,
                    { tcId: tcId, tsId: tsId, courseId: courseId, roleId: roleId, isActive: instType === "act" },
                    '#ddlInstructor',
                    '#divInstructor',
                    window.resources["SelectInstructor"]);
            });

            $("#chkUpload").on("change", function (e) {
                isUpload = $(e.target)[0].checked;
                if (isUpload) {
                    $("#divUpload").toggleClass("hide", false);
                    $("#assignQty").val("");
                    window.studentAssignmentViewModel.AssignedQty = "";
                    $("#assignQty").attr("disabled", "disabled");
                } else {
                    $("#divUpload").toggleClass("hide", true);
                    $("#assignQty").removeAttr("disabled");
                }
            });
        },

        showK12Info: function () {
            this.hideAlert();
            var cName = $("#CourseId option:selected").text();
            $("#divk12").toggleClass("hide", cName.toLowerCase() !== "heartsaver for k-12 schools");
        },

        hideAlert: function () {
            $("#divk12 .close").off("click");
            $("#divk12 .close").on("click", function () {
                $(this).parent().toggleClass("hide", true);
            });
        },

        initMultiSelect: function () {
            var hsProducts = new Set(['25-2826', '25-2826-4', '25-2826-6', '25-3002']);
            var currentPN = String($('#CourseId option:selected').data('productnumber') || '');
            var isHs = hsProducts.has(currentPN);
            var includeSelectAll = !isHs;

            $('.bootstrapmultiselect').multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: includeSelectAll,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourseModules"],
                nSelectedText: ' ' + window.resources["TextSelectedModules"],

                buttonText: function (options, select) {
                    var hideTB = hsProducts.has(String($('#CourseId option:selected').data('productnumber') || ''));
                    var labels = [], totalAllowed = 0;
                    $(select).find('option').each(function () {
                        var v = String(this.value);
                        if (hideTB && (v === window.hsModuleMutex.MOD_BASIC || v === window.hsModuleMutex.MOD_TOTAL)) return;
                        totalAllowed++;
                    });
                    options.each(function () {
                        var v = String($(this).val());
                        if (hideTB && (v === window.hsModuleMutex.MOD_BASIC || v === window.hsModuleMutex.MOD_TOTAL)) return;
                        labels.push($(this).text());
                    });
                    if (labels.length === 0) return window.resources["SelectCourseModules"];
                    if (labels.length === totalAllowed && totalAllowed > 0) return window.resources["TextAllSelected"];
                    if (labels.length === 1) return labels[0];
                    return labels.length + ' ' + window.resources["TextSelectedModules"];
                },

                buttonTitle: function (options) {
                    var hideTB = hsProducts.has(String($('#CourseId option:selected').data('productnumber') || ''));
                    var parts = [];
                    options.each(function () {
                        var v = String($(this).val());
                        if (hideTB && (v === window.hsModuleMutex.MOD_BASIC || v === window.hsModuleMutex.MOD_TOTAL)) return;
                        parts.push($(this).text());
                    });
                    return parts.join(', ');
                },

                onDropdownShown: function () {
                    var pnNow = String($('#CourseId option:selected').data('productnumber') || '');
                    var isHsNow = !!(window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pnNow));
                    var $sel = this.$select ? $(this.$select) : $(this).closest('select');
                    if (!isHsNow) {
                        hsEnableTBOptions($sel);
                        hsShowTBInUI($sel);
                    } else {
                        hsHideTBInUI($sel);
                    }
                },

                onChange: function (option, checked) {
                    var pn = String($('#CourseId option:selected').data('productnumber') || '');
                    var isHsNow = !!(window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pn));
                    var val = String($(option).val());
                    var $sel = this.$select ? $(this.$select) : $(option).closest('select');

                    if (!isHsNow) {
                        return;
                    }

                    if ((val === window.hsModuleMutex.MOD_TOTAL || val === window.hsModuleMutex.MOD_BASIC) && !window.hsChoice) {
                        var vals = $sel.val() || [];
                        vals = $.grep(vals, function (v) { return v !== window.hsModuleMutex.MOD_TOTAL && v !== window.hsModuleMutex.MOD_BASIC; });
                        $sel.val(vals);
                        try { $sel.multiselect('rebuild'); } catch (e) { }
                        hsHideTBInUI($sel);
                        return;
                    }
                    if (val === window.hsModuleMutex.MOD_TOTAL || val === window.hsModuleMutex.MOD_BASIC) {
                        window.hsModuleMutex.enforce($sel, { changed: val, checked: checked });
                        hsHideTBInUI($sel);
                        try { $sel.multiselect('refresh'); } catch (e) { }
                    }
                },

                onSelectAll: function () {
                    var $sel = this.$select ? $(this.$select) : $(this).closest('select');
                    var pnNow = String($('#CourseId option:selected').data('productnumber') || '');
                    var isHsNow = !!(window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pnNow));

                    if (!isHsNow) {
                        hsEnableTBOptions($sel);
                        hsShowTBInUI($sel);
                        try { $sel.multiselect('refresh'); } catch (e) { }
                        return;
                    }

                    setTimeout(function () {
                        window.hsModuleMutex.enforce($sel);
                        var vals = $sel.val() || [];
                        vals = $.grep(vals, function (v) { return v !== window.hsModuleMutex.MOD_TOTAL && v !== window.hsModuleMutex.MOD_BASIC; });
                        $sel.val(vals);
                        try { $sel.multiselect('rebuild'); } catch (e) { }
                        var $menu = $sel.siblings('.btn-group').find('ul.multiselect-container');
                        $menu.find('input[value="' + window.hsModuleMutex.MOD_BASIC + '"]').closest('li').hide();
                        $menu.find('input[value="' + window.hsModuleMutex.MOD_TOTAL + '"]').closest('li').hide();
                    }, 0);
                },

                onDeselectAll: function () {
                    var $sel = this.$select ? $(this.$select) : $(this).closest('select');
                    var pnNow = String($('#CourseId option:selected').data('productnumber') || '');
                    var isHsNow = !!(window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pnNow));

                    if (!isHsNow) {
                        hsEnableTBOptions($sel);
                        hsShowTBInUI($sel);
                        try { $sel.multiselect('refresh'); } catch (e) { }
                        return;
                    }

                    setTimeout(function () {
                        window.hsModuleMutex.reset($sel);
                        var vals = $sel.val() || [];
                        vals = $.grep(vals, function (v) { return v !== window.hsModuleMutex.MOD_TOTAL && v !== window.hsModuleMutex.MOD_BASIC; });
                        $sel.val(vals);
                        try { $sel.multiselect('rebuild'); } catch (e) { }
                        hsHideTBInUI($sel);
                    }, 0);
                }
            });

            if (isHs) {
                $('.bootstrapmultiselect').each(function () { window.hsModuleMutex.enforce($(this)); });
                $('.bootstrapmultiselect').each(function () { hsHideTBInUI($(this)); });
            } else {
                $('.bootstrapmultiselect').each(function () { hsEnableTBOptions($(this)); });
                $('.bootstrapmultiselect').each(function () { hsShowTBInUI($(this)); });
            }

            hsCacheAllOptions();
            hsShowOrHideRadio();
        },


        resetAll: function () {
            $("#assignError").toggleClass("hide", true);
            $("#divBox").toggleClass("hide", true);
            $("#divInstructor").toggleClass("hide", true);
            $("#divSubmit").toggleClass("hide", true);
        },

        getData: function (url, inputs, objDropdown, objDiv, textDefaultOption) {
            jQuery.get(url, inputs, function (data) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                if (data && data.length > 0) {
                    $.each(data, function (index, item) {
                        if (url.toLocaleLowerCase().indexOf("getcourse") != -1)
                            subItems.push($("<option/>", { value: item.Id, text: item.Name, "data-productnumber": item.ProductNumber, "data-module": item.HasModule, "data-subcourse": item.HasSubCourse }));
                        else if (url.toLocaleLowerCase().indexOf("getinstructors") != -1)
                            subItems.push($("<option/>", { value: item.Id, text: item.Name, "data-instremail": item.email }));
                        else
                            subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                    });
                }
                $(objDropdown).empty().append(subItems).val('');
                $(objDropdown).toggleClass("hide", false);
                $(objDiv).toggleClass("hide", false);
                courseId = $("#CourseId option:selected").val();
                if (objDiv == "#divInstructor" && (courseId == 63 || courseId == 65 || courseId == 67)) {
                    $("#divInstType").toggleClass("hide", true);
                }
            }).error(function (err) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: textDefaultOption }));
                $(objDropdown).empty().append(subItems).val('');
                appCommon.showResponseError("assignError", "errlist", err);
            });
        },

        getAvailableQty: function (courseId, selectedRoleId, tcId, tsId) {
            $("#divBox").toggleClass("hide", true);
            jQuery.get(quantityUrl, { courseId: courseId, fromRole: selectedRoleId, tcId: tcId, tsId: tsId }, function (data) {
                if (data) {
                    $("#divBox").toggleClass("hide", false);
                    $("#availQty").text(data);
                }
            }).error(function (err) {
                appCommon.showResponseError("assignError", "errlist", err);
            });
        },

        validateEmail: function (email) {
            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return $.trim(email).match(pattern) ? true : false;
        },

        validateMobilePhone: function (mobilePhone) {
            var pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            return $.trim(mobilePhone).match(pattern) ? true : false;
        },

        validateStudent: function () {
            var self = this;
            var errorCourseDate;
            var errorFirstName;
            var errorLastName;
            var errorEmail;
            var errorInstrFacltyEmail;
            var errorInvalidEmail;
            var errorInvalidMobilePhone;
            var errorInvalidCourseDate;
            var errorCourseModule;
            var errorSubCourse;
            var errorMsg = [];
            studentemails = [];
            isMobileNumberExist = false;

            $("#tblStudent").find("tr").each(function (item) {
                if (item != 0) {
                    var objInput = $(this).find("input");
                    var objSelect = $(this).find("select");
                    $(objInput[1]).toggleClass("errorhighlight", false);
                    $(objInput[2]).toggleClass("errorhighlight", false);
                    $(objInput[3]).toggleClass("errorhighlight", false);
                    $(objInput[4]).toggleClass("errorhighlight", false);
                    $(objInput[5]).toggleClass("errorhighlight", false);
                    $(objSelect[0]).toggleClass("errorhighlight", false);

                    if (objInput[1].value == "") {
                        $(objInput[1]).toggleClass("errorhighlight", true);
                        errorCourseDate = window.resources["TextCourseDateRequired"];
                    } else {
                        var now = new Date();
                        var lastSixMonthDate = new Date();
                        lastSixMonthDate = new Date(lastSixMonthDate.setMonth(lastSixMonthDate.getMonth() - 6));
                        var myDate = new Date(objInput[1].value);
                        if (myDate > now || myDate < lastSixMonthDate) {
                            errorInvalidCourseDate = myDate > now ? window.resources["TextCourseDateRange"] : window.resources["TextLast6MonthCourseDateRange"];
                        }
                    }

                    if (!objInput[2].value.trim()) {
                        $(objInput[2]).toggleClass("errorhighlight", true);
                        errorFirstName = window.resources["TextFirstNameRequired"];
                    }
                    if (!objInput[3].value.trim()) {
                        $(objInput[3]).toggleClass("errorhighlight", true);
                        errorLastName = window.resources["TextLastNameRequired"];
                    }
                    if (!objInput[4].value.trim()) {
                        $(objInput[4]).toggleClass("errorhighlight", true);
                        errorEmail = window.resources["TextEmailRequired"];
                    } else {
                        if (!self.validateEmail((objInput[4].value))) {
                            errorInvalidEmail = window.resources["TextInvalidEmail"];
                            $(objInput[4]).toggleClass("errorhighlight", true);
                        }
                        if (objInput[4].value.trim() == $('#ddlInstructor option:selected').data('instremail')) {
                            errorInstrFacltyEmail = window.resources["TextInvalidStudentEmailMsg"];
                        }
                    }

                    if (objInput[5].value.trim()) {
                        isMobileNumberExist = true;
                        if (!self.validateMobilePhone((objInput[5].value))) {
                            errorInvalidMobilePhone = window.resources["TextInvalidMobileNumber"];
                            $(objInput[5]).toggleClass("errorhighlight", true);
                        }
                    }

                    studentemails.push(objInput[4].value.trim());
                    var ddlSubCourse = $(objSelect[1]);
                    if (window.studentAssignmentViewModel.HasSubCourse == 1 && ddlSubCourse.length > 0 && (!ddlSubCourse.val() || ddlSubCourse.val().length === 0)) {
                        ddlSubCourse.toggleClass("errorhighlight", true);
                        errorSubCourse = window.resources["TextCourseTypeRequired"];
                    }
                }
            });

            var pn = String($('#CourseId option:selected').data('productnumber') || '');
            var hasModule = (window.studentAssignmentViewModel && String(window.studentAssignmentViewModel.HasModule) === '1') || ($('#ddlModule').length > 0);
            var radioVisible = $('#hsModuleRadioWrap:visible').length > 0;
            var isHsContext = radioVisible && window.hsModuleMutex && window.hsModuleMutex.HS_PRODUCTS && window.hsModuleMutex.HS_PRODUCTS.has(pn) && hasModule;
            if (isHsContext && $('input[name="hsModuleGlobal"]:checked').length === 0) {
                errorMsg[errorMsg.length] = "Module type selection required. Please review and try again.";
            }

            if (errorCourseDate) errorMsg[errorMsg.length] = errorCourseDate;
            if (errorFirstName) errorMsg[errorMsg.length] = errorFirstName;
            if (errorLastName) errorMsg[errorMsg.length] = errorLastName;
            if (errorEmail) errorMsg[errorMsg.length] = errorEmail;
            if (errorInstrFacltyEmail) errorMsg[errorMsg.length] = errorInstrFacltyEmail;
            if (errorInvalidCourseDate) errorMsg[errorMsg.length] = errorInvalidCourseDate;
            if (errorInvalidEmail) errorMsg[errorMsg.length] = errorInvalidEmail;
            if (errorInvalidMobilePhone) errorMsg[errorMsg.length] = errorInvalidMobilePhone;
            if (errorCourseModule) errorMsg[errorMsg.length] = errorCourseModule;
            if (errorSubCourse) errorMsg[errorMsg.length] = errorSubCourse;

            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);
            return errorMsg.length == 0;
        },

        checkDuplicateEmail: function () {
            var errorMsg = [];
            var studentsortedemails = studentemails.sort();
            var duplicateEmails = [];
            for (var i = 0; i < studentsortedemails.length - 1; i++) {
                if (studentsortedemails[i + 1] == studentsortedemails[i]) {
                    duplicateEmails.push(studentsortedemails[i]);
                }
            }
            for (var i = 0; i < duplicateEmails.length; i++) {
                $("#tblStudent").find("tr").each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        if (objInput[4].value.trim() == duplicateEmails[i]) {
                            $(objInput[4]).toggleClass("errorhighlight", true);
                        }
                    }
                });
            }
            if (duplicateEmails.length > 0) errorMsg[errorMsg.length] = window.resources["TextSameEmailMSg"];
            appCommon.showResponseError("assignErrorstep2", "errlist", errorMsg);
            if (duplicateEmails.length > 0) return true;
            return false;
        },

        highlightDuplicateRows: function () {
            isDuplicate = false;
            var index = {}, getText = function () { return $.trim($(this).text()); };
            $('#tblConfirm').find("tr").each(function () {
                var rowKey = $(this).find(".duplicate-student").map(getText).toArray().join("|");
                if (index.hasOwnProperty(rowKey)) {
                    index[rowKey].push(this);
                } else {
                    index[rowKey] = [this];
                }
            });
            $.each(index, function (rowKey, rows) {
                if (rows.length > 1) {
                    $.each(rows, function (id, row) { row.style.backgroundColor = "#ebccd1"; isDuplicate = true; });
                }
            });
            if (isDuplicate) {
                $("#assignErrorstep3").toggleClass("hide", false);
                appCommon.showWarning("assignErrorstep3", "errlist1", window.resources["TextDuplicateStudents"]);
            }
        },

        assignModel: function (button) {
            window.studentAssignmentViewModel.CourseName = "";
            window.studentAssignmentViewModel.TCName = "";
            window.studentAssignmentViewModel.InstructorName = "";
            window.studentAssignmentViewModel.TrainingSiteName = "";

            window.studentAssignmentViewModel.CourseId = $("#CourseId option:selected").val();
            if (window.studentAssignmentViewModel.CourseId) window.studentAssignmentViewModel.CourseName = $("#CourseId option:selected").text();

            window.studentAssignmentViewModel.SubCourseId = $("#ddlSubCourse option:selected").val();
            if (window.studentAssignmentViewModel.SubCourseId) window.studentAssignmentViewModel.SubCourseName = $("#ddlSubCourse option:selected").text();

            window.studentAssignmentViewModel.TCId = $("#ddlTC option:selected").val();

            window.studentAssignmentViewModel.InstructorId = $("#ddlInstructor option:selected").val();
            if (window.studentAssignmentViewModel.InstructorId) $("#hdnInstrName").val($("#ddlInstructor option:selected").text());

            window.studentAssignmentViewModel.TrainingSiteId = $("#ddlTS option:selected").val();

            window.studentAssignmentViewModel.AvailableQty = parseInt($("#availQty").text());
            window.studentAssignmentViewModel.HasModule = $("#CourseId")[0].options[$("#CourseId")[0].selectedIndex].getAttribute("data-module");
            window.studentAssignmentViewModel.HasSubCourse = $("#CourseId")[0].options[$("#CourseId")[0].selectedIndex].getAttribute("data-subcourse");
            window.studentAssignmentViewModel.FromRoleId = $("#RoleId option:selected").val();

            window.studentAssignmentViewModel.IsUpload = isUpload;

            var student = [];
            $("#tblStudent").find("tr").each(function (item) {
                if (item != 0) {
                    var objInput = $(this).find("input");
                    var objModule = $(this).find("select");
                    student.push({
                        CourseDate: objInput[1].value,
                        FirstName: objInput[2].value.trim(),
                        LastName: objInput[3].value.trim(),
                        Email: objInput[4].value.trim(),
                        Phone: objInput[5].value.trim(),
                        CourseModuleName: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(", ").replace(", Select Course Type", "") : "",
                        CourseModuleId: studentAssignmentViewModel.HasModule == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",") : "",
                        SubCourseId: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.value; }).get().join(",") : null,
                        SubCourse: studentAssignmentViewModel.HasSubCourse == 1 ? objModule.find(':selected').map(function (a, item) { return item.text; }).get().join(",") : ""
                    });
                }
            });
            var data = new FormData();

            if (isUpload) {
                var files = $("#dataFile")[0].files;
                for (var i = 0; i < files.length; i++) data.append("file", files[i]);
            }

            if (button == "btnMoveNext") {
                if (isUpload) {
                    window.studentAssignmentViewModel.AssignedQty = 0;
                } else {
                    window.studentAssignmentViewModel.AssignedQty = $("#assignQty").val();
                }
            } else {
                window.studentAssignmentViewModel.AssignedQty = student.length;
                window.studentAssignmentViewModel.StudentList = student;
            }

            $("#divAssignQty").text(student.length);
            data.append("model", JSON.stringify(window.studentAssignmentViewModel));
            return data;
        },

        moveNext: function (btn) {
            var pView = $(btn).data("view");
            if (pView == "#completeAssignCards") $(btn).prop("disabled", true);

            if (pView === "#studentAssignment" || pView === "#searchreplacement") {
                if (!validateAssignment()) return false;
            }

            var data = this.assignModel(btn.id);
            var url = $(btn).data("url");

            if (btn.id == "btnFinish" && isDuplicate) {
                if (!confirm(window.resources["TextDuplicateAlert"])) {
                    return false;
                }
            }

            this.submit(url, data, this.render, "", pView);
            return false;
        },

        movePrevious: function (view) {
            this.hideAll();
            $(view).toggleClass("hide", false);
            $("#assignErrorstep2").toggleClass("hide", true);
            $("#assignErrorstep3").toggleClass("hide", true);
            $("#searchreplacement").toggleClass("hide", true);
        },

        submit: function (url, data, cb, msg, divView) {
            var self = this;

            if (divView != "#studentAssignment") {
                if (!self.validateStudent()) {
                    if (divView == "#completeAssignCards") $("#btnFinish").prop("disabled", false);
                    return false;
                }
            }

            var errDiv = "assignError";
            if (divView == "#confirmAssignCards") errDiv = "assignErrorstep2";
            if (divView == "#completeAssignCards") errDiv = "assignErrorstep3";

            if (divView == "#studentAssignment") {
                jQuery.ajax({
                    url: url,
                    type: "POST",
                    contentType: false,
                    processData: false,
                    data: data,
                    dataType: "html",
                    success: function (result) { self.render(result, divView); },
                    error: function (errMsg) { appCommon.showResponseError(errDiv, "errlist", errMsg); }
                });
            } else {
                var isErrorOccured = false;
                jQuery.post(url, window.studentAssignmentViewModel, function (result) {
                    self.render(result, divView);
                })
                    .fail(function (errMsg) {
                        isErrorOccured = true;
                        appCommon.showResponseError(errDiv, "errlist", errMsg);
                    })
                    .always(function () {
                        if (divView == "#completeAssignCards" && !isErrorOccured) {
                            $("#btnFinish").prop("disabled", false);
                        }
                    });
            }
        },

        render: function (data, view) {
            var self = this;

            if (data) {
                var $frag = $(data);
                $frag.find('script').remove();
                $(view).empty().append($frag);

                (function hydrateHsCfg() {
                    var el = document.getElementById('hsCfg');
                    if (!el) return;
                    var pn = el.getAttribute('data-hs-pn') || '';
                    var mb = el.getAttribute('data-hs-mod-basic') || '37';
                    var mt = el.getAttribute('data-hs-mod-total') || '27';

                    window.studentAssignmentViewModel = window.studentAssignmentViewModel || {};
                    window.studentAssignmentViewModel.HSProductNumber = pn;
                    window.studentAssignmentViewModel.ModBasic = mb;
                    window.studentAssignmentViewModel.ModTotal = mt;

                    // unify with the rest of your code
                    window.productNumber = pn || window.productNumber || '';

                    // if you added a setter earlier, keep internal constants in sync (optional)
                    if (window.hsModuleMutex && typeof window.hsModuleMutex.setModuleIds === 'function') {
                        window.hsModuleMutex.setModuleIds(mb, mt);
                    }
                })();

                // existing inits (unchanged)
                appCommon.initDatePicker(true);
                if (view == "#studentAssignment") {
                    self.initMultiSelect();
                    $("#moduleHelp").toggleClass("hide", window.studentAssignmentViewModel.HasModule != 1);
                    $("#tdAssignTCName").html($("#ddlTC option:selected").text());
                    $("#tdAssignTSName").html($("#ddlTS option:selected").text());
                }

                $("[id*='tdInstrNameP']").html($("#hdnInstrName").val());
                $('[data-toggle="popover"]').popover();
            }

            if (view == "#confirmAssignCards") {
                if (!self.validateStudent()) return false;
                if (self.checkDuplicateEmail()) return false;
                self.highlightDuplicateRows();
                $("#tblConfirm").DataTable({ "pageLength": 25 });
                $("#tdConfirmTCName").html($("#ddlTC option:selected").text());
                $("#tdConfirmTSName").html($("#ddlTS option:selected").text());
            }

            self.assignModel();
            $("#divAssignQty").text(window.studentAssignmentViewModel.AssignedQty);

            self.hideAll();
            $(view).toggleClass("hide", false);
            toggleShowHide.init();

            if (view == "#completeAssignCards") {
                $("#tdCompTCName").html($("#ddlTC option:selected").text());
                $("#tdCompTSName").html($("#ddlTS option_SELECTED").text());
                var table = $("#tblEcard").DataTable({ "pageLength": 25 });
                if (table.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(table, { buttons: [{ extend: 'excelHtml5', title: appCommon.getFileName("Assigned eCards") }] });
                    $("#exportStudent").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $(".lnkecard").click($.proxy(self.loadECards, self));
                }
            }
        },


        hideAll: function () {
            $("#index").toggleClass("hide", true);
            $("#studentAssignment").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", true);
            $("#completeAssignCards").toggleClass("hide", true);
        },

        remove: function (lnk) {
            if ($('#tblStudent').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var table = $('#tblConfirm').DataTable();
                table.row(row).remove().draw(false);
                var count = $('#tblStudent').find("tr").length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#divAssignQty").text(count);
                $("#assignQty").val(count);
            } else {
                appCommon.showResponseError("assignErrorstep2", "errlist2", window.resources["TextAtLeastOneStudentRequired"]);
            }
            return false;
        },

        removeConfirm: function (lnk) {
            if ($('#tblConfirm').find("tr").length > 2) {
                var row = $(lnk).closest("tr");
                row.remove();
                var table = $('#tblStudent').DataTable();
                table.row(row).remove().draw(false);
                var trs = $('#tblConfirm').find("tr");
                var count = trs.length - 1;
                window.studentAssignmentViewModel.AssignedQty = count;
                $("#tdAssignQty, #divAssignQty").html(count);
                $("#assignQty").val(count);
                if (count == 1) isDuplicate = false;
            } else {
                appCommon.showResponseError("assignErrorstep3", "errlist3", window.resources["TextAtLeastOneStudentRequired"]);
            }
            return false;
        },

        selectAll: function (obj) {
            $("#tblStudent").find("input:checkbox").each(function () { this.checked = obj.checked; });
        },

        updateDate: function (e) {
            var courseDate = $(e).val();
            $("#tblStudent").find("tr").each(function (item) {
                if (item != 0) {
                    var objInput = $(this).find("input");
                    $(objInput[1]).datepicker("setDate", courseDate);
                }
            });
        },

        updateModule: function (e) {
            var modules = $(e).val() || [];

            var pnNow = String($('#CourseId option:selected').data('productnumber') || '');
            var isHs = !!(window.hsModuleMutex &&
                window.hsModuleMutex.HS_PRODUCTS &&
                window.hsModuleMutex.HS_PRODUCTS.has(pnNow));

            var forced = (window.hsChoice === 'total') ? window.hsModuleMutex.MOD_TOTAL
                : (window.hsChoice === 'basic') ? window.hsModuleMutex.MOD_BASIC
                    : null;

            if (isHs) {
                modules = $.grep(modules, function (v) {
                    return v !== window.hsModuleMutex.MOD_TOTAL && v !== window.hsModuleMutex.MOD_BASIC;
                });
                if (forced && modules.indexOf(forced) === -1) modules.push(forced);
            }

            $("#tblStudent").find("tr").each(function (idx) {
                if (idx === 0) return;
                var $sel = $(this).find("select.bootstrapmultiselect");
                $sel.val(modules);
                try { $sel.multiselect("rebuild"); } catch (e) { }

                if (isHs) {
                    hsHideTBInUI($sel);
                    window.hsModuleMutex.enforce($sel);
                    try { $sel.multiselect("refresh"); } catch (e) { }
                } else {
                    hsEnableTBOptions($sel);
                    hsShowTBInUI($sel);
                    try { $sel.multiselect("refresh"); } catch (e) { }
                }
            });
        },

        updateSubCourse: function (e) {
            var subCourseId = $(e).val();
            $("#tblStudent").find("tr").each(function (item) {
                if (item != 0) {
                    var objInput = $(this).find("select");
                    objInput.val(subCourseId);
                }
            });
        },

        validateSearch: function () {
            var errorMsg = [];
            var tcid = $("#tcId option:selected").val();
            var fName = $("#firstname").val();
            var lName = $("#lastname").val();
            var email = $("#email").val();
            var code = $("#ecode").val();

            if (!(fName || lName || email || code)) {
                errorMsg[errorMsg.length] = window.resources["TextAtleastOneValue"];
            } else {
                if (fName && !lName) errorMsg[errorMsg.length] = window.resources["TextEnterLastName"];
                if (!tcid) errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
            return appCommon.showResponseError("assignError1", "errlist1", errorMsg);
        },

        loadInitialResult: function (hideAlert) {
            var self = this;
            var url = $("#hdnSearchUrl").val();
            $("#divAlert").toggleClass("hide", hideAlert);
            $("#assignError1").toggleClass("hide", true);
            window.studentAssignmentViewModel.StudentECardInfo = {};
            if (!this.validateSearch()) return false;
            window.studentAssignmentViewModel.CourseId = $("#hdnCourseId").val();
            window.studentAssignmentViewModel.TCId = $("#tcId option:selected").val();
            window.studentAssignmentViewModel.StudentECardInfo.FirstName = $("#firstname").val();
            window.studentAssignmentViewModel.StudentECardInfo.LastName = $("#lastname").val();
            window.studentAssignmentViewModel.StudentECardInfo.Email = $("#email").val();
            window.studentAssignmentViewModel.StudentECardInfo.CertificateId = $("#ecode").val();
            var divView = "#divSearchResult";
            jQuery.post(url, window.studentAssignmentViewModel, function (result) {
                self.render(result, divView);
                self.initMultiSelect();
            })
                .fail(function (errMsg) {
                    appCommon.showResponseError("assignError1", "errlist", errMsg);
                })
                .always(function () {
                    if (divView == "#completeAssignCards") {
                        $("#btnFinish").prop("disabled", false);
                    }
                });
        },

        searcheCards: function (e) {
            e.preventDefault();
            var self = this;
            self.loadInitialResult(!e.canShowMsg);
        },

        issueReplacementCard: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            $("#confirmReplacementeCardModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmReplaceCard"]);
            $("#confirmReplacementeCardModal").modal("show");
            $("#btnReplaceCardOk").off("click");
            $("#btnReplaceCardOk").on("click", function () { self.saveReplacementCard(e); });
        },

        saveReplacementCard: function (e) {
            e.preventDefault();
            $("#confirmReplacementeCardModal").modal("hide");
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardGuid = $el.data("eid");
            var tcid = $el.data("tcid");
            var TCName = $("#tcId option:selected").text();
            var courseMoudules = "";
            var inputs = { eCardGuid: eCardGuid, tcid: tcid, courseMoudules: courseMoudules, TCName: TCName };
            jQuery.post(url, inputs, function (result) {
                var divView = '#completeReplacement';
                $(divView).toggleClass("hide", false);
                self.render(result, divView);
                $("#searchreplacement").toggleClass("hide", true);
            })
                .fail(function (errMsg) {
                    appCommon.showResponseError("divSearchError", "errlist", errMsg);
                });
        },

        clearSearch: function (e) {
            e.preventDefault();
            $("#divSearchError").toggleClass("hide", true);
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#ecode").val("");
            $("#tcId").val("");
            appCommon.focusMessage();
        }
    }
}
;
var AppStudentECard = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();
    var IsEdited = false;
    var isProfileUpdate = false;

    var validateClaim = function () {
        $("#claimError").html("");
        $("#claimError").addClass("hide");
        var errorMsg = [];

        if ($("#answer").length > 0 && $("#question").length > 0) {
            if (!$("#question option:selected").val()) {
                errorMsg[errorMsg.length] = window.resources["TextSecurityQuestionRequired"];
            }

            var ans = $("#answer").val().trim();
            if (!ans || "0" === ans) {
                errorMsg[errorMsg.length] = window.resources["TextSecurityAnswerRequired"];
            }
        }

        if (!$('input[name=condition]:checked').val()) {
            errorMsg[errorMsg.length] = window.resources["TextUserTermsRequired"];
        }

        if ($('input[name=condition]:checked').val() === "no") {
            errorMsg[errorMsg.length] = window.resources["TextYouMustAgree"];
        }

        return appCommon.showResponseError("claimError", "errlist", errorMsg);
    }

    var validateSurvey = function () {
        $("#surveyError").html("");
        $("#surveyError").addClass("hide");

        var question = $("div.survey-questions");
        var checkedItems = [];
        question.each(function () {
            var item = $(this).find("input:checked");
            if (item.length === 1) {
                checkedItems.push(item.val());
            }
        });

        var errMsg = [];
        if (checkedItems.length > 0 && question.length !== checkedItems.length || checkedItems.length === 0) {

            errMsg[errMsg.length] =
                window.resources["TextCompleteAllSurvey"].replace("{0}", question.length);
        }

        return appCommon.showResponseError("surveyError", "errlist1", errMsg);
    }

    return {
        /*Start of Student Claim*/
        init: function () {
            var self = this;
            $("#btnSubmit").on("click", self.loadSurvey);
            self.hideAlert();
        },

        myCards: function (e) {
            e.preventDefault();
            var self = this;

            var $el = $(e.target);
            var stuId = $("#hdnStudentId").val();
            var url = $el.data("url");

            jQuery.get(url,
                { studentId: stuId },
                function (data) {
                    if (data && data.length > 0) {
                        $("#divMyCards").html(data).toggleClass("hide", false);
                        $("#divClaimedCard").toggleClass("hide", true);
                        self.cardsFilter();
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("claimError", "errlist", err);
                });
        },

        SetFilter: function () {
            var self = this;
            self.cardsFilter();
            var $grid = $('.grid').isotope({
                // options
                layoutMode: 'fitRows'
            });


            filterText = window.resources["TextAll"];
            $grid.isotope({ filter: "" });


            $('#nowShowingText').html(filterText);

        },

        updateOptIn: function (e, studentId) {
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            isECCOptIn = $("input[id='chkEccOpt']").prop("checked");
            isAHAOptIn = $("input[id='chkAhaOpt']").prop("checked");
            self.hideAlert();
            $("#divWarningAlert").toggleClass("hide", true);
            $("#divUpdateAlert").toggleClass("hide", true);
            if ($("#hidIsECCOptIn").val().toLowerCase() == isECCOptIn.toString() && $("#hidIsAHAOptIn").val().toLowerCase() == isAHAOptIn.toString()) {
                $("#divWarningAlert").toggleClass("hide", false);
                return false;
            }
            jQuery.post(url,
                {
                    studentId: studentId, isECCOptIn: isECCOptIn, isAHAOptIn: isAHAOptIn
                },
                function (data) {
                    if (data && data.length > 0) {
                        $("#hidIsECCOptIn").val(isECCOptIn);
                        $("#hidIsAHAOptIn").val(isAHAOptIn);
                        $("#divUpdateAlert").toggleClass("hide", false);
                        appCommon.focusMessage();
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("updateOptError", "errlist", err);
                });
        },

        loadSurvey: function (e) {
            e.preventDefault();
            if (!validateClaim()) return false;

            var $el = $(e.target);
            var courseId = $("#hdnCourseId").val();
            var modules = $("#hdnModuleIds").val();
            var url = $el.data("url");
            jQuery.get(url,
                {
                    courseId: courseId, moduleIds: modules
                },
                function (data) {
                    if (data && data.length > 0) {
                        $("#divSurvey").html(data).toggleClass("hide", false);
                        $("#diveCardInfo").toggleClass("hide", true);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("claimError", "errlist", err);
                });

        },

        claimCard: function (e) {
            var $el = $(e);
            if (!validateClaim()) return false;
            var includeSurvey = $el.prop("id") === "btnClaim";
            if (includeSurvey) {
                if (!validateSurvey()) return false;
            }
            $el.attr('disabled', 'disabled');
            $el.removeAttr("onclick");
            $el.removeAttr("href");
            var url = $el.data("url");
            this.submitClaim(url, includeSurvey);
            return false;
        },

        submitClaim: function (url, includeSurvey) {
            this.buildRequest(includeSurvey);
            jQuery.post(url,
                window.claimModel,
                function (data) {
                    if (data) {
                        window.location.href = data;
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("surveyError", "errlist1", err);
                });
        },

        updateSurvey: function (e) {
            var $el = $(e);
            var includeSurvey = $el.prop("id") === "btnClaim";
            if (includeSurvey) {
                if (!validateSurvey()) return false;
            }
            $el.attr('disabled', 'disabled');
            $el.removeAttr("onclick");
            $el.removeAttr("href");
            var url = $el.data("url");
            this.submitSurvey(url, includeSurvey);
            return false;
        },

        submitSurvey: function (url, includeSurvey) {
            this.buildRequest(includeSurvey);
            jQuery.post(url,
                window.claimModel,
                function (data) {
                    if (!data.IsError) {
                        $('#divSurveySuccess').toggleClass("hide", false);
                        $('#hSuccessMsg').text(data.Message);
                        $('#divSurvey').toggleClass("hide", true);
                    }
                    else {
                        appCommon.showResponseError("surveyError", "errlist1", data.Message);
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("surveyError", "errlist1", err);
                });
        },

        getTimezone: function () {

            var tzAbbr = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return tzAbbr;
        },

        buildRequest: function (includeSurvey) {
            var self = this;
            window.claimModel.CourseId = $("#hdnCourseId").val();
            window.claimModel.ClaimType = $("#hdnClaimType").val();
            window.claimModel.SecurityQuestions = [];
            if ($("#answer").length > 0 && $("#question").length > 0) {
                window.claimModel.SecurityQuestions.push({
                    QuestionId: $("#question option:selected").val(),
                    Answer: $("#answer").val()
                });

                window.claimModel.StudentECard.HasSecurityQA = true;
            }

            window.claimModel.StudentLog.IsTermsAccepted = $('input[name=condition]:checked').val() === "yes";
            window.claimModel.StudentLog.TimeZone = self.getTimezone();
            window.claimModel.StudentECard.Phone = $("#phone").val()?.replace('(', '').replace(')-', '-').replace(')', '-');
             window.claimModel.StudentECard.ECardUID = $("#hdneCardUId").val();
            window.claimModel.StudentECard.CertificateId = $("#hdnCertificateId").val();

            window.claimModel.StudentECard.IssuedDate = "";
            window.claimModel.StudentECard.ExpiryDate = "";
            window.claimModel.StudentECard.LastActivityDate = "";
            window.claimModel.StudentECard.IsActiveCourse = $("#hdnIsActiveCourse").val();
            window.claimModel.StudentECard.IsECCOptIn = $("input[id='chkEccOpt']").prop("checked");
            window.claimModel.StudentECard.IsAHAOptIn = $("input[id='chkAhaOpt']").prop("checked");
            window.claimModel.SurveyQuestions = [];


            if (!includeSurvey) return false;

            var questions = $("div.survey-questions");
            questions.each(function () {
                //var item = $(this).find("[checked]");
                var item = $(this).find("input:checked");
                if (item.length === 1) {
                    var questId = $(this).data("questionid");
                    window.claimModel.SurveyQuestions.push({
                        QuestionId: questId,
                        SurveyOptions: [
                            {
                                OptionId: item.prop("id"),
                                Value: item.val(),
                                IsSelected: true
                            }
                        ]
                    });
                }
            });
        },

        btnEmail_Click: function (e) {
            e.preventDefault();
            var self = this;
            $("#myModal").modal("show");
            $("#userEmail").val("");

            var $el = $(e.target);

            var inputs = {
                ECardUId: $el.data("eid"),
                StudentId: $el.data("stuid"),
                EmailAddress: ""
            };

            $("#btnEmailECard").off("click");

            $("#btnEmailECard").on("click", inputs, $.proxy(self.sendEmail, self));
        },

        sendEmail: function (e) {
            e.preventDefault();
            var self = this;
            var inputs = e.data;

            inputs.EmailAddress = $("#userEmail").val();

            var err = [];
            if (!inputs.EmailAddress) {
                err[err.length] = window.resources["TextEmailRequired"];
            }

            if (inputs.EmailAddress && !self.validateEmail(inputs.EmailAddress)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (err.length > 0) {
                return appCommon.showResponseError("emailError", "emailErr", err);
            }

            var url = window.serverAddress + "/ecard/email";

            jQuery.post(url,
                inputs,
                function (data) {
                    if (data) {
                        $("#myModal").modal("hide");
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("emailError", "emailErr", err);
                });
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        cardsFilter: function () {

            var $grid = $('.grid').isotope({
                // options
                layoutMode: 'fitRows'
            });


            // filter items on button click
            $('.filter-button-group').on('click',
                '.filter--link',
                function (e) {
                    e.preventDefault();
                    var filterValue = $(this).attr('data-filter');
                    $grid.isotope({ filter: filterValue });

                    var filterText;
                    switch (filterValue) {
                        case ".active":
                            filterText = window.resources["TextActive"];
                            break;
                        case ".inactive":
                            filterText = window.resources["TextInactive"];
                            break;
                        case ".unclaim":
                            filterText = window.resources["TextUnclaimed"];
                            break;
                        default:
                            filterText = window.resources["TextAll"];
                            break;
                    }

                    $('#nowShowingText').html(filterText);
                });


            $('.sort_old').on('click',
                function (e) {
                    e.preventDefault();
                    $grid.isotope({
                        getSortData: {
                            crdate: function (itemElem) {
                                //return parseInt($( itemElem ).find('.crdate').text(), 10);
                                return Date.parse($(itemElem).find('.crdate').text());
                            }
                        },
                        sortBy: 'crdate',
                        sortAscending: false
                    });

                    $grid.isotope('updateSortData').isotope();
                });

            $('.sort_new').on('click',
                function (e) {
                    e.preventDefault();
                    $grid.isotope({
                        getSortData: {
                            date: function (itemElem) {
                                //return parseInt($( itemElem ).find('.crdate').text(), 10);
                                return Date.parse($(itemElem).find('.renewdate').text());
                            }
                        },
                        sortBy: 'date',
                        sortAscending: false
                    });

                    $grid.isotope('updateSortData').isotope();
                });
        },

        /*End of Student Claim*/


        /* MyeCards Flow*/

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },


        isValidStudent: function () {
            var self = this;
            var err = [];

            var fName = $("#first").val();
            var lName = $("#last").val();
            var email = $("#emailAddress").val();
            var code = $("#ecardcode").val();

            if (fName || lName || email) {
                if (code) {
                    err[err.length] = window.resources["TextEnterData2"];
                } else if (!fName || !lName || !email) {
                    err[err.length] = window.resources["TextProvideAllValues"];
                }
                else {
                    if (!self.validateEmail(email)) {
                        err[err.length] = window.resources["TextInvalidEmail"];
                    }
                }
            } else if (!code) {
                err[err.length] = window.resources["TextEnterData1"];
            }

            return appCommon.showResponseError("divSearchErr", "errlist", err);
        },

        validateStudentInfo: function (e) {

            e.preventDefault();
            $("#divSearchErr").toggleClass("hide", true);
            $("#divFindTc").toggleClass("hide", true);

            var self = this;

            if (!self.isValidStudent()) return false;

            var $el = $(e.target);
            var url = $el.data("url");
            var feed = {
                fName: $("#first").val(),
                lName: $("#last").val(),
                email: $("#emailAddress").val(),
                code: $("#ecardcode").val()
            };

            self.callAPI("get", url, feed, $.proxy(self.loadResult, self), self.failSearchResp);
        },

        loadEditECard: function (e) {

            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var cid = $el.data("cid");
            var feed = {
                cid: $el.data("cid")
            };
            self.callAPI("get", url, feed, $.proxy(self.loadEditResult, self), self.failSearchResp);
        },

        loadEditQA: function (evt, studentId) {

            evt.preventDefault();
            var self = this;
            var $el = $(evt.target);
            var url = $el.data("url");
            var feed = {
                studentId: studentId
            };
            self.callAPI("get", url, feed, $.proxy(self.loadEditQAResult, self), self.failSearchResp);
        },

        loadEditQAResult: function (data) {

            if (data && data.length > 0) {
                $("#divSecurity").toggleClass("hide", true);
                $("#divMyCards").toggleClass("hide", true);
                $("#divClaimedCard").toggleClass("hide", true);
                $("#divEditEcard").toggleClass("hide", true);
                $("#divEditStduentQA").toggleClass("hide", false).html(data);
            }
        },

        createStudentQA: function (evt) {
            evt.preventDefault();
            $("#divEditQAError, #divEditQAAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(evt.target);
            var url = $el.data("url");
            var quesId = $("#securityQues").val();
            var studentId = $("#hdnStudentId").val();
            var ans = $("#securityAns").val();

            if (!self.validateEditQA()) return false;
            var feed = {
                studentId: studentId,
                questionId: quesId,
                answer: ans
            };
            self.callAPI("post", url, feed, $.proxy(self.loadCreateSecurityResult, self), self.failCreateSecurityResp);
        },

        saveStudentQA: function (evt) {
            evt.preventDefault();
            $("#divEditQAError, #divEditQAAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(evt.target);
            var url = $el.data("url");
            var quesId = $("#securityQues").val();
            var studentId = $("#hdnStudentId").val();
            var ans = $("#securityAns").val();

            if (!self.validateEditQA()) return false;
            var feed = {
                studentId: studentId,
                questionId: quesId,
                answer: ans
            };
            self.callAPI("post", url, feed, self.onSuccessSaveStudentQA, self.onSaveStudentQAFailed);
        },

        onSuccessSaveStudentQA: function (data) {
            if (data) {
                $("#divEditQAAlert").toggleClass("hide", false);
                $("#divSuccessMessage").text(window.resources["TextStudentQAUpdateSuccess"]);
                appCommon.focusMessage();
            }
        },

        onSaveStudentQAFailed: function (err) {
            appCommon.showResponseError("divEditQAError", "errlist1", err);
        },

        showPendingRequest: function (data) {
            var self = this;
            if (data) {
                $("#assignModel").modal("show");
                $("#requestedFname").val(data.NewFirstName == "" ? data.CurrentFirstName : data.NewFirstName);
                $("#requestedLname").val(data.NewLastName == "" ? data.CurrentLastName : data.NewLastName);
                $("#requestedemailaddress").val(data.NewEmail == "" ? data.CurrentEmail : data.NewEmail);
                $("#requestedreason").val(data.Reason);
                $("#assignModel").on("shown.bs.modal", self.focus);
            }
        },
        focus: function (e) {
            var modal = $(this);
            modal.find("#btnClose").focus();
        },
        getPendingRequest: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var studentid = $el.data("studentid");
            var feed = {
                studentId: studentid
            };
            self.callAPI("get", url, feed, $.proxy(self.showPendingRequest, self), self.failSearchResp);
        },

        loadEditResult: function (data) {

            if (data && data.length > 0) {
                $("#divSecurity").toggleClass("hide", true);
                $("#divMyCards").toggleClass("hide", true);
                $("#divClaimedCard").toggleClass("hide", true);
                $("#divEditStduentQA").toggleClass("hide", true)
                $("#divEditEcard").toggleClass("hide", false).html(data);
            }
        },
        reasonChange: function (e) {
            if ($("#reason").val().toLowerCase() == "other") {
                $("#divOther").toggleClass("hide", false);
            } else {
                $("#divOther").toggleClass("hide", true);
            }
        },

        LoadAlleCard: function (e) {
            e.preventDefault();
            var self = this;

            var $el = $(e.target);
            var stuId = $("#hdnStudentId").val();
            var url = $el.data("url");

            jQuery.get(url,
                { studentId: stuId },
                function (data) {
                    if (data && data.length > 0) {
                        $("#divEditEcard").toggleClass("hide", true);
                        $("#divEditStduentQA").toggleClass("hide", true)
                        $("#ecardSearchWrapper").toggleClass("hide", true);
                        $("#divSecurity").html(data).toggleClass("hide", false);
                        $("#divMyCards").html(data).toggleClass("hide", false);
                        self.cardsFilter();
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("claimError", "errlist", err);
                });
        },

        validateEditQA: function () {
            var self = this;
            var errors = [];
            if ($("#securityAns").length > 0 && $("#securityQues").length > 0) {
                if (!$("#securityQues option:selected").val()) {
                    errors[errors.length] = window.resources["TextSecurityQuestionRequired"];
                }
                var ans = $("#securityAns").val().trim();
                if (!ans || "0" === ans) {
                    errors[errors.length] = window.resources["TextSecurityAnswerRequired"];
                }
            }
            return appCommon.showResponseError("divEditQAError", "errlist1", errors);
        },

        validateCodes: function (e) {

            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            $("#divSearchErr").toggleClass("hide", true);
            $("#divFindTc").toggleClass("hide", true);
            var url = $el.data("url");

            var codeList = $("#ecardcodeemp").val();
            if (!codeList) {
                return appCommon.showResponseError("divSearchErr", "errlist", window.resources["TextInvalideCardCode"]);
            }
            var feed = {
                codes: codeList
            };
            self.callAPI("post", url, feed, $.proxy(self.loadResult, self), self.failSearchResp);
        },

        loadResult: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#ecardSearchWrapper").toggleClass("hide", true);
                $("#divSecurity").toggleClass("hide", false).html(data);
                if ($(".grid").length > 0) {
                    self.cardsFilter();
                }
                if ($("#tblECards").length > 0) {

                    var tbl = $("#tblECards").DataTable();

                    if (tbl.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(tbl,
                            {
                                buttons: [
                                    {
                                        extend: 'excelHtml5',
                                        title: appCommon.getFileName("Student eCards"),
                                        exportOptions: {
                                            columns: [1, 2, 3, 4]
                                        }
                                    }
                                ]
                            });

                        $("#divDownload").prepend(buttons.container())
                            .find("a.dt-button").addClass("btn btn-primary")
                            .text(window.resources["TextDownloadList"]);
                        buttons.container().css("display", "inline-block");
                    }

                }
            } else if (data && data.Status == "Warning") {
                $("#divFindTc").toggleClass("hide", false);
                $("#lnkFind").focus();
            }
        },

        failSearchResp: function (err) {
            appCommon.showResponseError("divSearchErr", "errlist", err);
        },

        hideAlert: function () {
            $("#divAlert .close").off("click");
            $("#divAlert .close").on("click", function () {
                $(this).parent().toggleClass("hide", true);
            });
            $("#divUpdateAlert .close").off("click");
            $("#divUpdateAlert .close").on("click", function () {
                $(this).parent().toggleClass("hide", true);
            });


        },

        forgotAnswer: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var feed = {
                studentId: $el.data("stuid")
            };
            self.callAPI("get", url, feed, $.proxy(self.loadSecurityResult, self), self.failSecurityResp);
        },

        sendSecurityAnswer: function (e) {
            $("#divSendAnswerErr").toggleClass("hide", true);
            e.preventDefault();
            var self = this;

            var url = window.serverAddress + "/student/forgotanswer";
            var feed = {
                '': $("#email").data("stuid")
            };
            self.callAPI("post", url, feed, self.onSuccessSending, self.onFailSending);
        },

        onSuccessSending: function (data) {
            if (data) {
                $("#divAlert").toggleClass("hide", false);
            }
        },

        onFailSending: function (err) {
            if ($("#claimedCardError").length > 0) {
                appCommon.showResponseError("claimedCardError", "errlist1", err);
            } else {
                appCommon.showResponseError("divSendAnswerErr", "errlist2", err);
            }
        },

        gobackToSecurity: function () {
            $("#divConfirmSecurity").toggleClass("hide", false);
            $("#divSecurityResult, #divQuestionError").html("").toggleClass("hide", true);
        },

        verifyAccount: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var feed = {
                studentId: $el.data("stuid"), answer: $("#answer").val()
            };
            self.callAPI("post", url, feed, $.proxy(self.loadSecurityResult, self), self.failSecurityResp);
        },

        loadSecurityResult: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#divConfirmSecurity").toggleClass("hide", true);
                $("#divSecurityResult").toggleClass("hide", false).html(data);
                self.hideAlert();
                if ($(".grid").length > 0)
                    self.cardsFilter();
            } else if (data && data.Status == "Warning") {

                var errorDiv = $("#divQuestionError");
                errorDiv.html("");
                var errContainer;
                var isInter = window.isInternational;
                if (isInter == "True") {
                    errContainer =
                        '<button type="button" class="close" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span></button>' +
                        '<div class="alert-notification"><p>' +
                        window.resources["TextError"] +
                        '</p><div>' +
                        '<ul>' +
                        data.WarningMessage +
                        '</ul></div></div>';
                } else {
                    errContainer =
                        '<button type="button" class="close" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span></button>' +
                        '<div class="alert-notification"><p>' +
                        window.resources["TextError"] +
                        '</p><div>' +
                        '<ul id="errlist1">' + window.resources["TextInvalidSecurityAnswer"] +
                        '<br/><br/><div style="padding-left: 4em;"><li>' + window.resources["TextInvalidSecurityAnswerLine1"] + '</li>' +
                        '<li>' + window.resources["TextInvalidSecurityAnswerLine2"] + '</li></div >' +
                        '</ul ></div ></div > ';
                }

                errorDiv.append(errContainer);

                errorDiv.toggleClass("hide", false);
                errorDiv.removeClass("alert-warning");
                errorDiv.toggleClass("alert-danger", true);

                $("html, body").animate({
                    scrollTop: $("#top-header").offset().top
                },
                    1000);

                return false;
            }
        },

        failSecurityResp: function (err) {
            appCommon.showResponseError("divQuestionError", "errlist1", err);
        },

        loadCreateSecurityResult: function (data) {
            var self = this;
            if (data && data.length > 0) {
                $("#divCreateSecurity").toggleClass("hide", true);
                $("#divCreateSecurityResult").toggleClass("hide", false).html(data);
                self.hideAlert();
                if ($(".grid").length > 0)
                    self.cardsFilter();
            } else if (data && data.Status == "Warning") {
                var errorMsg = [];
                errorMsg[errorMsg.length] = data.WarningMessage;
                appCommon.showResponseError("divEditQAError", "errlist1", errorMsg);
            }
        },


        failCreateSecurityResp: function (err) {
            appCommon.showResponseError("divEditQAError", "errlist1", err);
        },

        verifyMoreCards: function (e) {
            e.preventDefault();
            $("#ecardSearchWrapper").toggleClass("hide", false);
            $("#divSecurity").html("").toggleClass("hide", true);
            if ($(e.target).prop("id") !== "lnkBack") {
                $("#ecardcodeemp").val("");
            }
        },

        selectAll: function (e) {
            $("#tblECards")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        if (objInput[0]) {
                            objInput[0].checked = $(e.target).prop("checked");
                        }
                    }
                });
        },

        validateEdit: function () {

            var self = this;
            var err = [];

            if (IsEdited == true || $("#hdnIsProfileUpdatePending").val() == "True") {
                err[err.length] = window.resources["TextProfileUpdateWarning"];
                return appCommon.showResponseError("divEditError", "errlist1", err);

            }

            var isMobileUpdate = false;
            window.EditEcardInfo = {};
            var fName = window.EditEcardInfo.NewFirstName = $("#fname").val();
            var lName = window.EditEcardInfo.NewLastName = $("#lname").val();
            var email = window.EditEcardInfo.NewEmail = $("#emailaddress").val();
            var reason = window.EditEcardInfo.Reason = $("#reason").val();
            var otherReson = $("#txtOther").val();
            window.EditEcardInfo.Phone = $("#phone").val();
            window.EditEcardInfo.CertificateId = $("#hdnCertificateId").val();
            window.EditEcardInfo.ECardId = $("#hdnEcardId").val();
            window.EditEcardInfo.TcId = $("#hdnTcId").val();
            window.EditEcardInfo.StudentId = $("#hdnStudentId").val();
            window.EditEcardInfo.IsUpdateAllCards = $("input[id='chkUpdateAll']").prop("checked");

            if (!fName) {
                err[err.length] = window.resources["TextFirstNameRequired"];
            }

            if (!lName) {
                err[err.length] = window.resources["TextLastNameRequired"];
            }

            if (!email) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(email)) {

                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if (!reason) {
                err[err.length] = window.resources["TextReasonRequired"];
            }

            if (reason.toLowerCase() == "other") {
                if (!otherReson) {
                    err[err.length] = window.resources["TextReasonRequired"];
                } else {
                    window.EditEcardInfo.Reason = otherReson;
                }
            }

            if ($.trim(fName) != $("#hdnFirstName").val() || $.trim(lName) != $("#hdnLastName").val() || $.trim(email) != $("#hdnEmail").val()) {
                isProfileUpdate = true;
            } else if ($.trim($("#phone").val()) != $("#hdnPhone").val()) {
                isMobileUpdate = true;
            }
            window.EditEcardInfo.IsProfileDateUpdated = isProfileUpdate;
            if (err.length == 0) {
                if (isProfileUpdate == false && isMobileUpdate == false) {
                    err[err.length] = window.resources["TextNoChangesToSave"];
                } else {
                    IsEdited = true;
                }
            }
            return appCommon.showResponseError("divEditError", "errlist1", err);
        },

        onSuccessSave: function (data) {
            if (data) {
                $("#divEditAlert").toggleClass("hide", false);
                if (isProfileUpdate) {
                    $("#divMessage").text(window.resources["TextApprovalPendingMessage"]);
                } else {
                    IsEdited = false;
                    $("#divMessage").text(window.resources["TextMobileUpdateMessage"]);
                }
                $("#btnSaveEdit").prop("disabled", true);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "errlist1", err);
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            if (!self.validateEdit()) return false;
            self.callAPI("post", url, window.EditEcardInfo, self.onSuccessSave, self.onEditCardFailed);
        },

        downloadeCards: function (e) {
            e.preventDefault();
            $('#loaderModal').modal('show');
            $("#divError").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target);
            var url = $el.data("url");
            var eCardCodes = [];
            $("#tblECards")
                .find("tr")
                .each(function (item) {
                    if (item != 0) {
                        var objInput = $(this).find("input");
                        if (objInput[0]) {
                            if (objInput[0].checked) {
                                eCardCodes.push(
                                    objInput[0].value
                                );
                            }
                        }
                    }
                });

            if (eCardCodes == "") {
                var errorMsg = [];
                errorMsg[errorMsg.length] = window.resources["TextSelectToDownload"];
                appCommon.showResponseError("divError", "errlist", errorMsg);
                $('#loaderModal').modal('hide');
                return false;
            }
            var data = JSON.stringify({ eCardCodes: eCardCodes });
            var http = new XMLHttpRequest();
            http.open("Post", url, true);
            http.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            http.responseType = "blob";
            http.onreadystatechange = function () {
                if (this.readyState == 4) {
                    var blob = new Blob([this.response], { type: "application/octet-stream" });
                    var fileName = "Student_eCards.zip";
                    saveAs(blob, fileName);
                    $('#loaderModal').modal('hide');
                }
            };
            http.send(data);
        },

        printeCard: function (e) {
            e.preventDefault();
            var cnt = $(e.target).data('cid');
            var url = '';
            if (cnt >= 0) {
                url = $('#ddlTemplates' + cnt).val();
            } else {
                url = $('#ddlTemplates').val();
            }

            window.open(url, '_blank');
        }


        /*End of MyeCards Flow*/
    }
}
;
var AppSearchStudent = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    return {

        init: function () {
            var self = this;
            $(document)
                .ready(function () {
                    $("#confirmUpdateModal").on("shown.bs.modal", self.focus);
                });
        },
        focus: function (e) {
            var modal = $(this);
            modal.find("#btnClose").focus();
        },
        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        validateSearch: function () {
            var err = [];

            var fName = window.searchStudentModel.FirstName = $("#firstname").val();
            var lName = window.searchStudentModel.LastName = $("#lastname").val();
            var email = window.searchStudentModel.Email = $("#email").val();

            if (!(fName || lName || email)) {
                err[err.length] =
                    window.resources["TextAtleastOneValue"];
            }

            if (email && !this.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            return appCommon.showResponseError("divSearchError", "errlist", err);
        },

        searchStudents: function (e) {
            e.preventDefault();
            var self = this;
            if (!self.validateSearch()) {
                return false;
            }
            $("#divAlert, #divSearchError").toggleClass("hide", true);
            var feed = window.searchStudentModel;
            var url = $("#hdnSearchUrl").val();
            self.callAPI("post", url, feed, self.onLoadResult, self.onFailSearch);
        },

        onLoadResult: function (data) {
            $("#divSearchResult").toggleClass("hide", false).html(data);
            $("#tblSearchStudent").DataTable();
            if ($("#divAlert").is(":visible")) {
                appCommon.focusMessage();
            } else {
                $("html, body").animate({
                    scrollTop: $("#titleResults").offset().top - 55
                },
                    1000);
            }
        },

        onFailSearch: function (err) {
            appCommon.showResponseError("divSearchError", "errlist", err);
        },

        clearSearch: function (e) {
            e.preventDefault();

            $("#divSearchError, #divSearchResult, #divEditStudent").html("");
            $("#firstname, #lastname, #email").val("");
            $("#divSearchError, #divAlert").toggleClass("hide", true);
            window.searchStudentModel = {};
            appCommon.focusMessage();
        },

        editStudent: function (e) {
            e.preventDefault();
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                studentId: $el.data("uid")
            }

            self.callAPI("get", url, inputs, $.proxy(self.onLoadingEditStudent, self), self.onFailSearch);
        },

        onLoadingEditStudent: function (data) {
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divEditStudent").toggleClass("hide", false).html(data);
                $("#tblEditStudent").DataTable();
                appCommon.focusMessage();
            }
        },

        validateEdit: function () {
            var err = [];
            var reasonCode = $("#reasonCode").val().trim();
            var reason = $("#reason").val().trim();

            if (!reason) {
                err[err.length] = window.resources["TextReasonRequired"];
            }

            if (!reasonCode) {
                err[err.length] = window.resources["TextReasonCodeRequired"];
            }

            window.searchStudentModel.AnonymizeActiveECads = $("input[name='chkStudentECards']:checked").length > 0

            window.searchStudentModel.ReasonCode = reasonCode;
            window.searchStudentModel.Reason = reason;
            window.searchStudentModel.StudentId = $("#hdnStudentId").val();

            return appCommon.showResponseError("divEditError", "errlist1", err);
        },

        confirmSave: function (e) {
            e.preventDefault();
            var self = this;
            
            $("#divEditError, #divEditAlert, #divUpdateStudent").toggleClass("hide", true);            

            if (!self.validateEdit()) return false;
            $("#confirmUpdateModal").modal("show");
            $("#btnOk").off("click");
            $("#divUpdateStudent").toggleClass("hide", false);
            $("#btnOk").on("click", $.proxy(self.saveInfo, self));
            return false;
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#confirmUpdateModal").modal("hide");
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var url = $("#hdnStudentInfoUrl").val();

            if (!self.validateEdit()) return false;

            self.callAPI("post", url, window.searchStudentModel, self.onSuccessSave, self.onEditCardFailed);
        },


        onSuccessSave: function (data) {
            if (data && data.length > 0) {
                $("#divEditAlert").toggleClass("hide", false);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "errlist1", err);
        },

        loadSearch: function (e) {
            e.preventDefault();
            $("#divSearch").toggleClass("hide", false);
            $("#divEditStudent").html("").toggleClass("hide", true);
            $("#btnSearchStudents").trigger({ type: "click" });
        }
    }
}
;
var AppEcardStatus = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var hideAdvancedOpt = true;
    var clearDaysView = false;
    var appCommon = new AppCommon();

    var validateSearchOptions = function () {
        $("#statusErr").html("");
        $("#statusErr").toggleClass("hide", true);
        var errorMsg = [];

        var courseId = $("#courseId option:selected").val();
        var fromSource = $("#ddlSource option:selected").val();
        var transBy = $('input[name=transBy]:checked').val();
        var profileId = $("#profileId option:selected").val();
        var startDate = $("#eCardStatusForm").find('input[id="StartDate"]').val();
        var endDate = $("#eCardStatusForm").find('input[id="EndDate"]').val();
        if (transBy === "fromLoc") {
            if (profileId && profileId == window.RoleType.Instructor.value) {
                fromSource = $("#ddlLocation option:selected").val();
            }
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextTransactionsDatesRequired"];
        }


        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["TransactionDate"]);
        }

        if (transBy === "fromIns" || transBy === "fromLoc" || transBy === "fromDist" || transBy === "fromTc") {
            if (!courseId || courseId.length <= 0) {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }

            if (!fromSource || fromSource <= 0) {

                if (transBy === "fromIns") {
                    errorMsg[errorMsg.length] = window.resources["TextInstructorRequired"];
                }

                if (transBy === "fromLoc") {
                    var tcId = $("#ddlSource option:selected").val();
                    if (profileId && profileId == window.RoleType.Instructor.value && !tcId) {
                        errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                    } else {
                        errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                    }
                }

                if (transBy === "fromDist") {
                    errorMsg[errorMsg.length] = window.resources["TextDistributorRequired"];
                }

                if (transBy === "fromTc") {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                }
            }
        }

        return appCommon.showResponseError("statusErr", "errlist", errorMsg);
    }

    return {
        init: function () {
            var self = this;
            $("#divOptions").toggleClass("hide", true);
            $("#lnkAdvanced").toggleClass("hide", true);

            $("input[type=radio][name=transBy]").on("change", function (e) {
                self.toggleOptions(e);
            });

            $('input[type=radio][name=instType]').on('change', function (e) {
                self.toggleInstrStatus(e);
            });

            $("#lnkAdvanced").on("click", self.showHideOptions);
            $("#divECardStatus").on("change", "#profileId", $.proxy(self.changeProfile, self));
            $("#divECardStatus").on("change", "#ddlSource", $.proxy(self.changeTC, self));
            var profileId = $("#profileId option:selected").val();
            $("#radioTc, #radioDist, #radioInst, #radioLoc").toggleClass("hide", true);
            if (profileId && profileId == window.RoleType.Instructor.value) {
                $("#radioTc, #radioLoc").toggleClass("hide", false);

            } else {
                $("#radioDist, #radioInst, #radioLoc").toggleClass("hide", false);
            }

            $("#courseId").on("change", $.proxy(self.changeCourse, self));
            $("#ddlVAMCourse").on("change", $.proxy(self.changeVAMCourse, self));
            $(".datepicker").on("change",
                    function (e) {
                        clearDaysView = true;
                    });
            $(document)
                .ready(function () {
                    self.searchTransactions(true);
                });

            self.initMultiSelect();
        },

        initMultiSelect: function () {
            $("#courseId").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

           // $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse");

            $("#ddlVAMCourse").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectCourses"],
                nSelectedText: ' ' + window.resources["TextSelectedCourses"]
            });

          //  $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiCourse1");

        },

        toggleInstrStatus: function (e) {

            var self = this;
            var $el = $(e.target);

            self.clearErrorMsg();
            var instType = $el.val();
            var courseIds = $("#courseId").find(':selected')
				.map(function (a, item) { return item.value; }).get().join(",");

            var textDefaultOption = window.resources["TextSelectInstructor"];
            var url = $("input[id=inst]:radio").data("url");
            var inp = { courseIds: courseIds, isActive: instType === "act" ? true : false };

            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            $("#ddlSource").empty().append(subItems).val('');

            self.renderSource(url, inp, "#ddlSource", textDefaultOption);
        },

        toggleOptions: function (e) {

            var self = this;
            self.clearErrorMsg();
            var $el = $(e.target);

            var courseId = $("#courseId").find(':selected')
            .map(function(a, item) { return item.value; }).get().join(",");
            var profileId = $("#profileId option:selected").val();
            if (!courseId || courseId === "0") {
                $el.prop("checked", false);
                return appCommon.showResponseError("statusErr", "errlist", window.resources["TextCourseRequired"]);
            }

            var url = $el.data("url");
            var inp;
            var lblText;
            var textDefaultOption;

            $("#divInstType").toggleClass("hide", $el.val() !== "fromIns");
            $("input[id=radActive]:radio").prop("checked", $el.val() === "fromIns");

            if ($el.val() === "fromLoc") {
                if (profileId && profileId == window.RoleType.Instructor.value) {
                    $("#ddlLocation, #ddlSource, #ddlTransType").val("");
                    $("#divLoc").toggleClass("hide", true);

                    inp = { courseIds: courseId };
                    url = $("#tc").data("url");
                    lblText = window.resources["TextTrainingCenter"];
                    $("#lblSource").text(lblText).append("<span class='required'> * </span>");
                    textDefaultOption = window.resources["SelectTrainingCenter"];
                    self.renderSource(url, inp, "#ddlSource", textDefaultOption);
                    $("#divSource, #divTransactionType").toggleClass("hide", false);
                    return false;
                } else {
                    lblText = window.resources["TexteCardLocation"];
                    inp = { tcId: null };
                    textDefaultOption = window.resources["TextSelecteCardLocation"];
                }
            }

            if ($el.val() === "fromIns") {

                lblText = window.resources["TextInstructor"];
                textDefaultOption = window.resources["TextSelectInstructor"];

                var instrType = $("input[name=instType]:checked").val();
                inp = { courseIds: courseId, isActive: instrType === "act" ? true : false };
            }
            else if ($el.val() === "fromDist") {
                lblText = window.resources["TextDistributor"];
                textDefaultOption = window.resources["TextSelectDistributor"];
            }
            else if ($el.val() === "fromTc") {
                inp = { courseIds: courseId };
                lblText = window.resources["TextTrainingCenter"];
                textDefaultOption = window.resources["SelectTrainingCenter"];
                $("#ddlLocation, #ddlSource, #ddlTransType").val("");
                $("#divLoc").toggleClass("hide", true);
            }

            $("#lblSource").text(lblText).append("<span class='required'> * </span>");
            $("#divSource, #divTransactionType").toggleClass("hide", false);
            $("#ddlTransType").val("");
            $("#ddlSource").empty().val("");
            $("#ddlLocation").empty().val("");

            self.renderSource(url, inp, "#ddlSource", textDefaultOption);
        },

        renderSource: function (url, inp, src, placeHolder) {
            var subItems = [];
            subItems.push($("<option/>", { value: "", text: placeHolder }));

            jQuery.get(url, inp ? inp : null,
                function (data) {

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }

                    $(src).empty().append(subItems).val("");
                })
				.error(function (err) {
				    $(src).empty().append(subItems).val("");
				    appCommon.showResponseError("statusErr", "errlist", err);
				});
        },

        showHideOptions: function (e) {

            hideAdvancedOpt = !hideAdvancedOpt;

            var $caret = $(e.target).find("span.caret");
            setTimeout(function () {
                var profileId = $("#profileId option:selected").val();
                if (profileId && profileId == window.RoleType.Instructor.value && !hideAdvancedOpt) {
                    $("#radioTc").toggleClass("hide", false);
                }

                $("#divOptions").toggleClass("hide", hideAdvancedOpt);
            }, 100);
            $caret.toggleClass("rotate", !hideAdvancedOpt);

            return false;
        },

        changeCourse: function (e) {

            var self = this;
            //var courseId = $(e.target).val();
            var courseId = $("#courseId").find(':selected').map(function (a, item) { return item.value; }).get().join(",");
            var url = $(e.target).data("url");
            var isInstructor = $("#profileId option:selected").val() == window.RoleType.Instructor.value;
            var hasChild = $("#courseId").find(':selected').map(function (a, item) {
                return $(item).data("isparent");
            }).get().join(",");
            if (hasChild == "True") { //VAM Course
                $("#divVAMCourse").toggleClass("hide", false);

                jQuery.get(url, { courseId: courseId, isInstructor: isInstructor }, $.proxy(self.loadVAMCourse, self))
               .error(function (err) {
                   appCommon.showResponseError("statusErr", "errlist", err);
               });
            } else {
                $("#divVAMCourse").toggleClass("hide", true);
                $("#ddlVAMCourse").multiselect("deselectAll", false).multiselect("refresh");
            }

            clearDaysView = true;
            self.clearErrorMsg();
            self.clearSearchOptions(true);
            if (courseId) {
                $("#lnkAdvanced").toggleClass("hide", false);
            }
        },

        changeProfile: function (e) {
            var profileId = $(e.target).val();
            window.location.href = $("#hdnProfileUrl").val() + '?profileId=' + profileId;
        },

        changeTC: function (e) {
            var self = this;
            var tcId = $(e.target).val();
            var profileId = $("#profileId option:selected").val();
            var transBy = $('input[name=transBy]:checked').val();
            if (!profileId || profileId != window.RoleType.Instructor.value || transBy === "fromTc") {
                return;
            } else {
                if (!tcId) {
                    $("#ddlLocation").val("");
                    $("#divLoc").toggleClass("hide", true);
                } else {
                    var inp = { tcId: tcId };
                    var url = $("#eLoc").data("url");
                    var textDefaultOption = window.resources["TextSelecteCardLocation"];
                    self.renderSource(url, inp, "#ddlLocation", textDefaultOption);
                    $("#divLoc").toggleClass("hide", false);
                }
            }
        },

        clearErrorMsg: function () {
            $("#statusErr").html("");
            $("#statusErr").toggleClass("hide", true);
        },

        clearSearchOptions: function (limitedClear) {
            this.clearErrorMsg();

            $("#ddlSource").empty().val("");
            $("#ddlLocation").empty().val("");

            hideAdvancedOpt = true;
            $("#lnkAdvanced").find("span.caret").toggleClass("rotate", false);
            $("#lnkAdvanced").toggleClass("hide", true);

            $("#ddlTransType").val("");
            $("#divOptions").toggleClass("hide", true);


            $("input[type=radio][name=transBy]").prop("checked", false);
            $("input[type=radio][name=instType]").prop("checked", false);


            $("#divTransactionType").toggleClass("hide", true);
            $("#divSource").toggleClass("hide", true);
            $("#divLoc").toggleClass("hide", true);
            $("#divInstType").toggleClass("hide", true);

            if (!limitedClear) {
                $("#courseId").multiselect("deselectAll", false).multiselect("refresh");
                $("#StartDate").datepicker('setDate', appCommon.getMonthOldDate());
                $("#EndDate").datepicker('setDate', appCommon.getCurrentDate());
                clearDaysView = false;
                this.searchTransactions(true);
            }

            if (!limitedClear) {
                appCommon.focusMessage();
            }

            return false;
        },

        buildSearchRequest: function () {
            window.eCardStatusViewModel.InstructorId =
                window.eCardStatusViewModel.LocationId =
                window.eCardStatusViewModel.DistributorId =
                window.eCardStatusViewModel.TrainingCenterId =
                 window.eCardStatusViewModel.VAMCourseId =
                window.eCardStatusViewModel.TransactionType = null;
            var startDate = $("#StartDate").val();
            var endDate = $("#EndDate").val();

            window.eCardStatusViewModel.CourseId = $("#courseId").find(':selected')
                .map(function (a, item) { return item.value; }).get().join(",");
            window.eCardStatusViewModel.StartDate = startDate;
            window.eCardStatusViewModel.EndDate = endDate;
            var transBy = $('input[name=transBy]:checked').val();


            var filterBy = $("#ddlSource option:selected").val();
            var profileId = $("#profileId option:selected").val();

            window.eCardStatusViewModel.ProfileId = profileId;
            window.eCardStatusViewModel.VAMCourseId = $("#ddlVAMCourse").find(':selected')
				.map(function (a, item) { return item.value; }).get().join(",");
            if (transBy === "fromIns" || transBy === "fromLoc" || transBy === "fromDist" || transBy === "fromTc") {
                if (transBy === "fromTc") {
                    window.eCardStatusViewModel.TrainingCenterId = filterBy;
                }

                if (transBy === "fromIns") {
                    window.eCardStatusViewModel.InstructorId = filterBy;
                }

                if (transBy === "fromLoc") {
                    window.eCardStatusViewModel
                        .LocationId = profileId && profileId == window.RoleType.Instructor.value
                        ? $("#ddlLocation option:selected").val()
                        : filterBy;
                }

                if (transBy === "fromDist") {
                    window.eCardStatusViewModel.DistributorId = filterBy;
                }

                window.eCardStatusViewModel.TransactionType = $("#ddlTransType option:selected").val();

            }
        },

        searchTransactions: function (isPageLoad) {
            if (!validateSearchOptions()) return false;
            this.buildSearchRequest();

            var isTCprofile = window.eCardStatusViewModel.ProfileId != window.RoleType.Instructor.value;

            var url = $("#btnSearch").data("url");
            var transBy = $('input[name=transBy]:checked').val();
            var self = this;
            jQuery.post(url,
                    window.eCardStatusViewModel,
                    function (data) {
                        if (data) {
                            $("#divResults").toggleClass("hide", false);
                            $("#divResults").html(data);
                            var tbl = $("#example").DataTable({
                                "columnDefs": [
                                    {
                                        "targets": [7],
                                        "visible": window.eCardStatusViewModel.CourseId.indexOf(",") < 0 && !!window.eCardStatusViewModel.CourseId && !transBy && window.eCardStatusViewModel.VAMCourseId ==0
                                    }
                                ]
                            });

                            if (tbl.context.length > 0) {
                                var buttons = new $.fn.dataTable.Buttons(tbl,
                                {
                                    buttons: [
                                        {
                                            extend: 'excelHtml5',
                                            title: appCommon.getFileName(isTCprofile ? "Training Center eCard Status" : "Instructor eCard Status"),
                                            exportOptions: {
                                                columns: ':visible'
                                            }
                                        }
                                    ]
                                });
                                $("#exportbutton").prepend(buttons.container())
                                    .find("a.dt-button").addClass("btn btn-primary")
                                    .text(window.resources["TextDownload"]);
                            }

                            $("#spdaysView").toggleClass("hide", clearDaysView);
                            $("#example").on("click", ".lnkecard", $.proxy(self.loadECards, self));
                            if (!isPageLoad) {
                                appCommon.focusArea("#divResults");
                            }
                        }
                        $('[data-toggle="popover"]').popover();
                    })
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });

            return false;
        },

        loadFilterTargets: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.Id, text: item.Name
                        }));
                    });
                $("#ddlSource").empty().append(subItems);
                $("#ddlSource").val('');
            }
        },

        loadVAMCourse: function (data) {

            if (data && data.length > 0) {
                var subItems = [];
                // subItems.push($("<option/>", { value: "", text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", {
                            value: item.CourseId, text: item.Name
                        }));
                    });
                $("#ddlVAMCourse").empty().append(subItems);
                $("#ddlVAMCourse").val('');
                $("#ddlVAMCourse").empty().append(subItems).multiselect('rebuild');
            }
        },

        changeVAMCourse: function (e) {
            var self = this;
            self.loadInstructor();
        },

        loadInstructor: function () {
            var self = this;
            var $el = $("#inst");
            var url = $el.data("url");
            var inp;
            var lblText;
            var textDefaultOption;

            lblText = window.resources["TextInstructor"];
            textDefaultOption = window.resources["TextSelectInstructor"];
            var courseId = $("#ddlVAMCourse").find(':selected')
                        .map(function (a, item) { return item.value; }).get().join(",");

            if (courseId == "") {
                courseId = $("#courseId").find(':selected')
            .map(function (a, item) { return item.value; }).get().join(",");
            }
          
            inp = { courseIds: courseId, isActive: true };

            $("#lblSource").text(lblText).append("<span class='required'> * </span>");
            $("#divSource, #divTransactionType").toggleClass("hide", false);
            $("#ddlTransType").val("");
            $("#ddlSource").empty().val("");
            $("#ddlLocation").empty().val("");

            self.renderSource(url, inp, "#ddlSource", textDefaultOption);
        },

        loadECards: function (e) {
            e.preventDefault();
            var self = this;
            var transId = $(e.target).data("transactionid");
            self.getECards(transId);
        },

        getECards: function (transId, canShowMsg) {
            var self = this;
            var profileId = $("#profileId option:selected").val();
            var url = $("#hdnUrl").val();
            self.isSuccess = !!canShowMsg;
            jQuery.get(url, { transactionId: transId, profileId: profileId }, $.proxy(self.populateECards, self))
                .error(function (err) {
                    appCommon.showResponseError("statusErr", "errlist", err);
                });
        },

        populateECards: function (data) {
            var self = this;
            if (data) {
                $("#divStudentECards").toggleClass("hide", false);
                $("#divECardStatus").toggleClass("hide", true);
                $("#divStudentECards").html(data);
                if (self.isSuccess) {
                    $("#divAlert").toggleClass("hide", false);
                }
                var tbl = $("#tblECards").DataTable();

                if (tbl.context.length > 0) {
                    var buttons = new $.fn.dataTable.Buttons(tbl,
                    {
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                title: appCommon.getFileName("Student eCards")
                            }
                        ]
                    });

                    $("[data-blocked]").closest("tr").addClass("blockedInRed");

                    $("#exportECard").prepend(buttons.container())
                        .find("a.dt-button").addClass("btn btn-primary")
                        .text(window.resources["TextDownload"]);
                    buttons.container().css("display", "inline-block");
                    $("#lnkGoResults").click(self.NavigateToResults);
                    appCommon.focusMessage();
                }
            }

        },

        NavigateToResults: function (e) {
            e.preventDefault();
            $("#divStudentECards, #divEditCard").html("");
            $("#divStudentECards, #divEditCard").toggleClass("hide", true);
            $("#divECardStatus").toggleClass("hide", false);
            if ($("#divResults").is(":visible")) {
                appCommon.focusArea("#divResults");
            }
            else {
                appCommon.focusArea("#partial");
            }
        }
    }
}
;
var AppTC = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();
    var instrNames = {};

    var toggleShowHide = {
        init: function () {
            var $el = $('a[data-toggle="collapse"]');
            $el.on('click', function (e) {
                ($el.delay(1000).hasClass('collapsed')) ? toggleShowHide.hide($el) : toggleShowHide.show($el);
            });
        },
        hide: function (obj) {
            obj.children('.text').text('Hide Info');
            (obj.children('.fa').hasClass('fa-caret-up')) ? obj.children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down') : '';
        },
        show: function (obj) {
            obj.children('.text').text('Show Info');
            (obj.children('.fa').hasClass('fa-caret-down')) ? obj.children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up') : '';
        }
    };

    var validateAssignment = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];

        var courseId = $("#CourseId option:selected").val();
        var tcId = $("#ddlTC option:selected").val();
        var qty = $("#qty").val();
        var availQty = parseInt($("#availQty").text());

        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }


        switch (window.currentController.toLowerCase()) {
            case "ecardlocationassignment":
                if (availQty <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TexteLocationLowInventory"];
                }

                var assignTo = $("#assignTo option:selected").val();

                if (!assignTo || assignTo <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                }

                if (!qty || qty == "0")
                    errorMsg[errorMsg.length] = window.resources["TextAssignQuantityRequired"];
                else if (!jQuery.isNumeric(qty) || Math.floor(qty) != qty || parseInt(qty) <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextAssignQtyPositiveInteger"];
                }

                if (availQty > 0 && parseInt(qty) > availQty) {
                    errorMsg[errorMsg
                        .length] = window.resources["TextExceedsInventory"];
                }
                break;
            case "instructorassignment":
                var uRole = $("#hdnRole").val();

                if (uRole === "ECard Admin") {
                    var locId = $("#ddlLoc option:selected").val();
                    if (!locId || locId <= 0) {
                        errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                    }
                }

                if (availQty <= 0) {
                    if (uRole === "ECard Admin") {
                        errorMsg[errorMsg.length] = window.resources["TexteLocationLowInventory"];
                    } else {
                        errorMsg[errorMsg.length] = window.resources["TextInsufficiantInventory"];
                    }
                }

                var instrs = $("#assignTo").multiselect("getSelected");

                if (!instrs || instrs.length <= 0) {
                    errorMsg[errorMsg.length] = window.resources["TextMultiInstructorsRequired"];
                }

                break;
        }

        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }

    var buildLocationRequest = function () {

        window.tcAssignmentViewModel.LocationId = $("#assignTo option:selected").val();
        window.tcAssignmentViewModel.CourseId = $("#CourseId option:selected").val();
        window.tcAssignmentViewModel.TCId = $("#ddlTC option:selected").val();
        window.tcAssignmentViewModel.AssignedQty = $("#qty").val();
        window.tcAssignmentViewModel.AvailableQty = $("#availQty").text();
    }

    return {
        init: function () {
            var self = this;
            var courseId = $("#CourseId option:selected").val();
            /*if (courseId && courseId > 0) {
                self.getTCList(courseId);
            }*/
            var uRole = $("#hdnRole").val();

            if (window.currentController.toLowerCase() === "instructorassignment") {
                self.initMultiSelect();
            }

            $("#RoleId")
                .on("change",
                    function (e) {
                        var roleId = $(e.target).val();
                        var url = $(e.target).data("url");
                        if (roleId > 0) {
                            $("#assignError, #divBox, #divTC,#divSite, #divLoc, #divAssignTo, #divSubmit").toggleClass("hide", true);
                            self.loadCourses(url, { roleId: roleId }, window.resources["SelectCourse"]);
                        }

                    });

            $("#CourseId")
                .on("change",
                    function (e) {

                        $("#assignError, #divBox, #divTC, #divSite, #divLoc, #divAssignTo, #divSubmit").toggleClass("hide", true);
                        var courseId = $(e.target).val();
                        var roleId = $('#RoleId').val();
                        //load tc list
                        if (courseId > 0) {
                            self.getTCList(courseId, roleId);
                        }
                    });


            $("#ddlTC")
                .on("change",
                    function (e) {
                        $("#assignError, #divBox, #divLoc, #divAssignTo, #divSubmit").toggleClass("hide", true);
                        var courseId = $("#CourseId option:selected").val();
                        var tcId = $(e.target).val();
                        var selectedRole = $('#RoleId').val();
                        if (tcId > 0) {
                            if (window.currentController &&
                                window.currentController.toLowerCase() === "instructorassignment") {
                                if (uRole === "ECard Admin") {
                                    //load eCardLocations
                                    self.geteCardLocations(e, { tcId: tcId });
                                }
                                else if (selectedRole == RoleType.TSC.value || selectedRole == RoleType.TSAdmin.value) {
                                    self.getSites(e, { tcId: tcId, roleId: selectedRole });
                                }
                                else {
                                    //load instructors
                                    self.getAssignTo(e, { tcId: tcId, courseId: courseId }, window.resources["SelectInstructors"]);
                                    //show avail qty
                                    self.getAvailableQty({ tcId: tcId, courseId: courseId });
                                }
                            } else {
                                //load locations
                                self.loadLocation(e, { tcId: tcId }, window.resources["TextSelecteCardLocation"]);
                                //show avail qty
                                self.getAvailableQty({ tcId: tcId, courseId: courseId });
                            }
                        }
                    });

            $("#ddlLoc")
                .on("change",
                    function (e) {
                        $("#assignError, #divBox, #divAssignTo, #divSubmit").toggleClass("hide", true);

                        var courseId = $("#CourseId option:selected").val();
                        var tcId = $("#ddlTC option:selected").val();
                        var locId = $(this).val();
                        //load instructors
                        self.getAssignTo(e, { tcId: tcId, courseId: courseId }, window.resources["SelectInstructors"]);
                        //show avail qty
                        self.getAvailableQty({ tcId: tcId, courseId: courseId, locationOrSiteId: locId });
                    });
            $("#ddlSite")
                .on("change",
                    function (e) {
                        $("#assignError, #divBox, #divAssignTo, #divSubmit").toggleClass("hide", true);

                        var courseId = $("#CourseId option:selected").val();
                        var tcId = $("#ddlTC option:selected").val();
                        var tsId = $("#ddlSite").val();
                        var roleId = $("#RoleId").val();
                        //load instructors
                        self.getAssignTo(e, { tcId: tcId, courseId: courseId, roleId: roleId, tsId: tsId }, window.resources["SelectInstructors"]);
                        //show avail qty
                        self.getAvailableQty({ tcId: tcId, courseId: courseId, locationOrSiteId: tsId });
                    });
        },


        initMultiSelect: function () {
            $("#assignTo").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectInstructors"],
                nSelectedText: ' ' + window.resources["TextSelectedInstructors"]
            });

            //$(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiInst");

        },

        getTCList: function (courseId, roleId) {

            var tcUrl = $("#CourseId").data("tc-url");
            jQuery.get(tcUrl, { courseId: courseId, roleId: roleId },
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.TrainingCenterId, text: item.Name }));
                            });
                        $("#divTC").toggleClass("hide", false);
                        $("#ddlTC").empty().append(subItems).val('');
                    }
                })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                    $("#ddlTC").empty();
                });
        },

        geteCardLocations: function (e, inputs) {
            var url = $(e.target).data("insturl");
            jQuery.get(url, inputs, function (data) {
                if (data && data.length > 0) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                    $.each(data,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                        });
                    $("#divLoc").toggleClass("hide", false);
                    $("#ddlLoc").empty().append(subItems).val('');
                }
            })
                .error(function (err) {
                    $("#ddlLoc").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        loadLocation: function (e, inputs, textDefaultOption) {
            var url = $(e.target).data("url");
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            jQuery.get(url,
                inputs,
                function (data) {

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }

                    $("#divAssignTo").toggleClass("hide", false);
                    $("#divSubmit").toggleClass("hide", false);
                    $("#assignTo").empty().append(subItems).val('');
                })
                .error(function (err) {
                    $("#divAssignTo").toggleClass("hide", false);
                    $("#assignTo").empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },
        loadCourses: function (url, inputs, textDefaultOption) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            jQuery.get(url,
                inputs,
                function (data) {

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }
                    $("#CourseId").empty().append(subItems).val('');
                    $("#divCourse").toggleClass("hide", false);
                })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", window.resources["TextNoCourseFoundPleaseReview"]);
                });
        },
        getSites: function (e, inputs) {
            var url = $(e.target).data("siteurl");
            jQuery.get(url, inputs, function (data) {
                if (data && data.length > 0) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                    $.each(data,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                        });
                    $("#divSite").toggleClass("hide", false);
                    $("#ddlSite").empty().append(subItems).val('');
                }
            })
                .error(function (err) {
                    $("#ddlSite").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getAssignTo: function (e, inputs, textDefaultOption) {

            var url = $(e.target).data("url");
            jQuery.get(url, inputs, function (data) {
                if (data && data.length > 0) {
                    var subItems = [];
                    $.each(data,
                        function (index, item) {
                            subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                        });
                    $("#divAssignTo").toggleClass("hide", false);
                    $("#divSubmit").toggleClass("hide", false);
                    $("#assignTo").empty().append(subItems).multiselect('rebuild');
                }
            })
                .error(function (err) {
                    $("#divAssignTo").toggleClass("hide", false);
                    $("#assignTo").empty().multiselect('rebuild');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getAvailableQty: function (inputs) {
            var url = $("#CourseId").data("url");
            $("#divBox").toggleClass("hide", true);
            jQuery.get(url, inputs, function (data) {
                if (data) {
                    $("#divBox").toggleClass("hide", false);
                    $("#availQty").text(data);
                }
            })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        loadConfirmation: function () {
            $("#confirmError").html("");
            $("#confirmError").toggleClass("hide", true);
            $("#tdCourse").html($("#CourseId option:selected").text());
            $("#tdTC").html($("#ddlTC option:selected").text());
            $("#tdlocation").html($("#assignTo option:selected").text());
            $("#tdAvailQty").html($("#availQty").text());
            $("#tdQty").html($("#qty").val());
        },

        loadCompletion: function (data) {
            $("#completeAssignCards").toggleClass("hide", false);
            $("#confirmAssignCards").toggleClass("hide", true);

            $("#tdCompCourse").html($("#CourseId option:selected").text());
            $("#tdCompTC").html($("#ddlTC option:selected").text());
            $("#tdComplocation").html($("#assignTo option:selected").text());
            $("#tdCompQty").html($("#qty").val());
            if (data && data >= 0) {
                $("#tdCompAvailQty").html(data);
            }
        },

        goBackToAssignment: function () {
            $("#assignCards").toggleClass("hide", false);
            $("#confirmAssignCards").toggleClass("hide", true);

            return false;
        },

        confirmLocationAssignment: function () {
            if (!validateAssignment()) return false;

            $("#assignCards").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", false);
            this.loadConfirmation();

            return false;
        },

        completeLocationAssignment: function () {
            var self = this;
            $("#btnComplete").prop("disabled", true);
            buildLocationRequest();
            var url = $("#btnComplete").data("url");

            jQuery.post(url, window.tcAssignmentViewModel, self.loadCompletion)
                .fail(function (err) {
                    appCommon.showResponseError("confirmError", "errlist1", err);
                })
                .always(function () {
                    $("#btnComplete").prop("disabled", false);
                });

            return false;
        },

        /**
         * Instructor Assignment Flow
         * @param {} btn 
         * @returns {} 
         */
        moveNext: function (btn) {
            if (!validateAssignment()) return false;
            var courseName = $("#CourseId option:selected").text();
            window.tcAssignmentViewModel.CourseId = $("#CourseId option:selected").val();
            window.tcAssignmentViewModel.CourseName = courseName;
            window.tcAssignmentViewModel.TCId = $("#ddlTC option:selected").val();
            window.tcAssignmentViewModel.LocationId = $("#ddlLoc option:selected").val();
            window.tcAssignmentViewModel.TSId = $("#ddlSite option:selected").val();
            window.tcAssignmentViewModel.RoleId = $("#RoleId option:selected").val();

            var chosedInst = $("#assignTo").find(":selected");
            var inst = [];
            instrNames = {};
            $.each(chosedInst,
                function (idx, item) {
                    inst.push({
                        CourseName: courseName,
                        InstructorId: $(item).val(),
                        //InstructorName: $(item).text(),
                        IsConfirmed: false
                    });

                    instrNames[$(item).val()] = $(item).text();
                });

            var url = $(btn).data("url");
            this.renderInstQty(url, inst, this.loadInstQty, "assign");
            return false;
        },

        confirmInstAssignment: function () {
            var err;
            var inst = [];
            var intRegex = /^\-?\d+$/;

            $("#tblInsQty")
                .find("input:text")
                .each(function () {
                    var val = this.value;

                    if (!val || val == "0") {
                        err = window.resources["TextAssignQuantityRequired"];
                    }
                    else if (!intRegex.test(val)) {//if (!jQuery.isNumeric(val) || Math.floor(val) != val || parseInt(val) <= 0) {
                        err = window.resources["TextAssignQtyPositiveInteger"];
                        return;
                    } else {
                        var instId = $(this).closest("tr").data("instid");
                        var objInst = jQuery.grep(window.tcAssignmentViewModel.InstructorQtyList,
                            function (item) {
                                return item.InstructorId == instId;
                            });
                        if (objInst && objInst.length > 0) {
                            inst.push({
                                CourseName: window.tcAssignmentViewModel.CourseName,
                                InstructorId: objInst[0].InstructorId,
                                Quantity: val,
                                IsConfirmed: true
                            });
                        }
                    }
                });

            if (err && err.length > 0) {
                return appCommon.showResponseError("qtyError", "ulQty", err);
            }

            var url = $("#btnConfirm").data("url");
            this.renderInstQty(url, inst, this.loadInstConfirm, "confirmQty");
            return false;
        },

        renderInstQty: function (url, inst, cb, msg) {
            var self = this;
            var instList = window.tcAssignmentViewModel.InstructorQtyList;
            window.tcAssignmentViewModel.InstructorQtyList = inst;
            jQuery.post(url, window.tcAssignmentViewModel, $.proxy(cb, self))
                .fail(function (err) {
                    window.tcAssignmentViewModel.InstructorQtyList = instList;
                    if (msg === "assign")
                        appCommon.showResponseError("assignError", "errlist", err);
                    else
                        appCommon.showResponseError("qtyError", "ulQty", err);
                });
        },

        loadInstQty: function (data) {
            var self = this;
            if (data) {
                $("#confirmQty").html(data);
                $("#tdTC").html($("#ddlTC option:selected").text());
                $("#tdLoc").html($("#ddlLoc option:selected").text());
                $("#tdSite").html($("#ddlSite option:selected").text());
            }
            $("#assignCards").toggleClass("hide", true);
            $("#confirmQty").toggleClass("hide", false);
            $("#trAssignedQty").toggleClass("hide", true);
            $("#btnQtyAssign").show();
            $("#btnQtyConfirm").hide();
            $("#hdAssignQty").show();
            $("#hdConfirmQty").hide();
            $("#instQtyTitle").show();
            $("#confirmTitle").hide();
            toggleShowHide.init();
            self.enrichInstrs();
        },

        loadInstConfirm: function (data) {
            var self = this;
            if (data) {
                $("#confirmQty").html(data);
                $("#tdTC").html($("#ddlTC option:selected").text());
                $("#tdLoc").html($("#ddlLoc option:selected").text());
                $("#tdSite").html($("#ddlSite option:selected").text());
            }
            $("#assignCards").toggleClass("hide", true);
            $("#confirmQty").toggleClass("hide", false);
            $("#trAssignedQty").toggleClass("hide", false);
            $("#btnQtyAssign").hide();
            $("#btnQtyConfirm").show();
            $("#hdAssignQty").hide();
            $("#hdConfirmQty").show();
            $("#instQtyTitle").hide();
            $("#confirmTitle").show();
            toggleShowHide.init();
            self.enrichInstrs();
        },

        goBackToInstAssignment: function (view) {
            if (view === "assign") {
                $("#assignCards").toggleClass("hide", false);
                $("#confirmQty").toggleClass("hide", true);
            } else {
                $.each(window.tcAssignmentViewModel.InstructorQtyList,
                    function (idx, item) {
                        item.IsConfirmed = false;
                    });
                var url = $("#btnConfirm").data("url");
                this.renderInstQty(url, window.tcAssignmentViewModel.InstructorQtyList, this.loadInstQty, "assign");
            }
            return false;
        },

        removeInst: function (lnk) {
            var instId = $(lnk).closest("tr").data("instid");
            var inst = jQuery.grep(window.tcAssignmentViewModel.InstructorQtyList,
                function (item) {
                    return item.InstructorId != instId;
                });

            if (instrNames.hasOwnProperty(instId)) {
                delete instrNames[instId];
            }

            var confirmedItems = jQuery.grep(window.tcAssignmentViewModel.InstructorQtyList,
                function (item) {
                    return item.IsConfirmed;
                });

            $("#tblInsQty").find("input:text")
                .each(function () {
                    var val = this.value;
                    var instId = $(this).closest("tr").data("instid");
                    $.each(inst,
                        function (index, item) {
                            if (item.InstructorId == instId) {
                                item.Quantity = val;
                            }
                        });
                });

            var url = $("#btnConfirm").data("url");
            if (confirmedItems && confirmedItems.length === window.tcAssignmentViewModel.InstructorQtyList.length) {
                this.renderInstQty(url, inst, this.loadInstConfirm, "confirmQty");
            } else {
                this.renderInstQty(url, inst, this.loadInstQty, "confirmQty");
            }

            return false;
        },

        completeInstAssignment: function () {
            $("#btnComplete").prop("disabled", true);
            var inst = [];
            $("#tblInsQty")
                // .find("td#tdInstQty")
                .find("td[id^=tdInstQty]")
                .each(function () {
                    var val = $(this).text();
                    var instId = $(this).closest("tr").data("instid");
                    inst.push({
                        InstructorId: instId,
                        Quantity: val,
                        IsConfirmed: true
                    });
                });

            if (inst.length > 0) {
                window.tcAssignmentViewModel.InstructorQtyList = inst;

                var url = $("#btnComplete").data("url");

                jQuery.post(url,
                    window.tcAssignmentViewModel,
                    function (data) {
                        $("#completeAssignCards").toggleClass("hide", false);
                        $("#confirmQty").toggleClass("hide", true);
                        $("#completeAssignCards").html(data);
                        window.tcAssignmentViewModel = null;
                        toggleShowHide.init();
                        $("#tblCompleted").DataTable();
                        $("#tdCompTC").html($("#ddlTC option:selected").text());
                        $("#tdCompLoc").html($("#ddlLoc option:selected").text());
                        $("#tdCompSite").html($("#ddlSite option:selected").text());
                    })
                    .fail(function (err) {
                        appCommon.showResponseError("qtyError", "ulQty", err);
                    })
                    .always(function () {
                        $("#btnComplete").prop("disabled", false);
                    });
            } else {
                $("#btnComplete").prop("disabled", false);
            }

            return false;
        },

        enrichInstrs: function () {
            $('#tblInsQty tr').each(function () {
                for (var key in instrNames) {
                    if (instrNames.hasOwnProperty(key)) {
                        var td = $(this).find('td[id*=tdInstrName' + key + ']');
                        if (td.length === 1) {
                            $(td).html(instrNames[key]);
                            break;
                        }
                    }
                }
            });
        }
    }
};
var AppTSAssignment = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

	var appCommon = new AppCommon();	

    var toggleShowHide = {
        init: function () {
            var $el = $('a[data-toggle="collapse"]');
            $el.on('click', function (e) {
                ($el.delay(1000).hasClass('collapsed')) ? toggleShowHide.hide($el) : toggleShowHide.show($el);
            });
        },
        hide: function (obj) {
            obj.children('.text').text('Hide Info');
            (obj.children('.fa').hasClass('fa-caret-up')) ? obj.children('.fa').removeClass('fa-caret-up').addClass('fa-caret-down') : '';
        },
        show: function (obj) {
            obj.children('.text').text('Show Info');
            (obj.children('.fa').hasClass('fa-caret-down')) ? obj.children('.fa').removeClass('fa-caret-down').addClass('fa-caret-up') : '';
        }
    };

    var validateAssignment = function () {
        $("#assignError").html("");
        $("#assignError").addClass("hide");
        var errorMsg = [];

        var courseId = $("#courseId option:selected").val();
        var tcId = $("#tcId option:selected").val();
        var qty = $("#qty").val();
        var availQty = parseInt($("#availQty").text());

        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if (availQty <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInsufficiantInventory"];
        }

        var assignTo = $("#tsList option:selected").val();

        if (!assignTo || assignTo <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
        }

        if (!qty || qty == "0")
            errorMsg[errorMsg.length] = window.resources["TextAssignQuantityRequired"];
        else if (!jQuery.isNumeric(qty) || Math.floor(qty) != qty || parseInt(qty) <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextAssignQtyPositiveInteger"];
        }

        if (availQty > 0 && parseInt(qty) > availQty) {
            errorMsg[errorMsg
                .length] = window.resources["TextExceedsInventory"];
        }


        return appCommon.showResponseError("assignError", "errlist", errorMsg);
    }

    var buildAssignRequest = function () {      
        window.tcAssignmentViewModel.TSId = $("#tsList option:selected").val();
        window.tcAssignmentViewModel.CourseId = $("#courseId option:selected").val();
        window.tcAssignmentViewModel.TCId = $("#tcId option:selected").val();
        window.tcAssignmentViewModel.AssignedQty = $("#qty").val();
        window.tcAssignmentViewModel.AvailableQty = $("#availQty").text();
    }   
    return {
        init: function () {
            var self = this;                  

            $("#tcId").on("change", function (e) {
                $("#assignError, #divBox, #divTC, #divTS, #divCourse, #divSubmit").toggleClass("hide", true);
                var tcId = $(e.target).val();
                //load ts list
                if (tcId > 0) {
                   var url= $(e.target).data("url");
                    self.loadTrainingsites(url, { tcId: tcId }, window.resources["TextSelectTrainingSite"]);
                }
            });

            $("#tsList").on("change", function (e) {

                var tsId = $(e.target).val();

                if (tsId > 0) {
                    var url = $(e.target).data("url");
                    self.loadCourses(url, { tsId: tsId }, window.resources["SelectCourse"]);
                }

            });

            $("#courseId").on("change", function (e) {

                var courseId = $(e.target).val();
                var tcId = $("#tcId option:selected").val();
                
                var url = $(e.target).data("url");
                if (courseId > 0) {
                    self.getAvailableQty(url, { tcId: tcId, courseId: courseId });
                    $("#qty").val(0);
                } else {
                    $("#divBox").toggleClass("hide", true);
                }

            });

        },

        loadTrainingsites: function (url, inputs, textDefaultOption) {           
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            jQuery.get(url,
                inputs,
                function (data) {

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    } else {
                        appCommon.showResponseError("assignError", "errlist", window.resources["TextNoTrainingSitesFound"]);
                    }

                    $("#divTS").toggleClass("hide", false);
                    $("#tsList").empty().append(subItems).val('');
                })
                .error(function (err) {
                    $("#divTS").toggleClass("hide", false);
                    $("#tsList").empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", window.resources["TextNoTrainingSitesFound"]);
                });
        },
        loadCourses: function (url, inputs, textDefaultOption) {
            var subItems = [];
            subItems.push($("<option/>", { value: '', text: textDefaultOption }));
            jQuery.get(url,
                inputs,
                function (data) {

                    if (data && data.length > 0) {
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                    }

                    $("#divCourse").toggleClass("hide", false);                
                    $("#courseId").empty().append(subItems).val('');
                })
                .error(function (err) {
                    $("#divCourse").toggleClass("hide", false);
                    $("#courseId").empty().append(subItems).val('');
                    appCommon.showResponseError("assignError", "errlist", window.resources["TextNoCourseFoundPleaseReview"]);
                });
        },
        getAvailableQty: function (url,inputs) {           
            $("#divBox").toggleClass("hide", true);
            jQuery.get(url, inputs, function (data) {
                if (data) {
                    $("#divBox").toggleClass("hide", false);
                    $("#availQty").text(data);
                    $("#divSubmit").toggleClass("hide", false);
                }
            })
                .error(function (err) {
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        loadConfirmation: function () {
            $("#confirmError").html("");
            $("#confirmError").toggleClass("hide", true);
            $("#tdCourse").html($("#courseId option:selected").text());
            $("#tdTC").html($("#tcId option:selected").text());
            $("#tdTS").html($("#tsList option:selected").text());
            $("#tdAvailQty").html($("#availQty").text());
            $("#tdQty").html($("#qty").val());
        },

        loadCompletion: function (data) {
            $("#completeAssignCards").toggleClass("hide", false);
            $("#confirmAssignCards").toggleClass("hide", true);

            $("#tdCompCourse").html($("#courseId option:selected").text());
            $("#tdCompTC").html($("#tcId option:selected").text());
            $("#tdCompTS").html($("#tsList option:selected").text());
            $("#tdCompQty").html($("#qty").val());
            if (data && data >= 0) {
                $("#tdCompAvailQty").html(data);
            }
        },

        goBackToAssignment: function () {
            $("#assignCards").toggleClass("hide", false);
            $("#confirmAssignCards").toggleClass("hide", true);

            return false;
        },

        confirmSiteAssignment: function () {
            if (!validateAssignment()) return false;

            $("#assignCards").toggleClass("hide", true);
            $("#confirmAssignCards").toggleClass("hide", false);
            this.loadConfirmation();

            return false;
        },

        completeSiteAssignment: function () {
            var self = this;
            $("#btnComplete").prop("disabled", true);
            buildAssignRequest();
            var url = $("#btnComplete").data("url");

            jQuery.post(url, window.tcAssignmentViewModel, self.loadCompletion)
                .fail(function (err) {
                    appCommon.showResponseError("confirmError", "errlist1", err);
                })
                .always(function() {
                    $("#btnComplete").prop("disabled", false);
                });

            return false;
        },

    }
};
var AppIntlReclaim = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    var validateRequest = function () {

        $("#reClaimErr").html("");
        $("#reClaimErr").addClass("hide");
        var errorMsg = [];

        var courseId = $("#courseId option:selected").val();
        var fromSource = $("#tsList option:selected").val();
        var tcId = $("#tcId option:selected").val();
        //var locationId = $("#locationList option:selected").val();
        var qty = $("#qty").val();
        var availQty = parseInt($("#divAvailQty").text());

        if (!courseId || courseId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }

        if (!tcId || tcId <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if (!fromSource || fromSource <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequired"];
        }

        if (availQty <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextInstructorLowInventory"];
        }

        if (fromSource > 0) {
            if (!qty || qty == "0")
                errorMsg[errorMsg.length] = window.resources["TextReclaimQuantityRequired"];
            else if (!jQuery.isNumeric(qty) || Math.floor(qty) != qty || parseInt(qty) <= 0)
                errorMsg[errorMsg.length] = window.resources["TextReclaimQtyPositive"];
        }

        if (availQty > 0 && parseInt(qty) > availQty) {
            errorMsg[errorMsg.length] = window.resources["TextReclaimExceedsQty"];
        }

        return appCommon.showResponseError("reClaimErr", "errlist", errorMsg);
    }

    var initializeReclaim = function () {
        $("#confirmReclaim").hide();     
        $("#divBox").toggleClass("hide", true);
        $("#lnkConfirm").toggleClass("hide", true);
        $("#ddlTS").toggleClass("hide", true);
        $("#ddlCourse").toggleClass("hide", true);        
    }

    return {
        init: function () {
            var self = this;
            initializeReclaim();

            $("#tcId").on("change", function (e) {
                initializeReclaim();
                self.clearErrorMsg();
                var tcId = $(e.target).val();

                if (tcId > 0) {
                    if ($("#ddlTS").length) {
                        var url = $(e.target).data("url");

                        self.getReclaimTargets(url, { tcId: tcId }, self.loadTrainingsites, window.resources["TextNoTrainingSitesFound"]);
                    }
                }

            });

            $("#tsList").on("change", function (e) {

                var tsId = $(e.target).val();

                if (tsId > 0) {
                    if ($("#ddlCourse").length) {
                        var url = $(e.target).data("url");

                        self.getReclaimTargets(url, { tsId: tsId }, self.loadCourses, window.resources["TextNoCourseFoundPleaseReview"]);
                    }
                }

            });

            $("#courseId").on("change", function (e) {

                var courseId = $(e.target).val();

                var url = $(e.target).data("url");
                if (courseId > 0) {
                    self.getAvailableQuantity(url, courseId);
                    $("#qty").val(0);
                } else {
                    $("#divBox").toggleClass("hide", true);
                }
            });
        },

        loadTrainingsites: function (data) {
            if (data && data.length > 0) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                    });
             
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
                $("#ddlTS").toggleClass("hide", false);

                $("#tsList").empty().append(subItems);
                $("#tsList").val('');
            } else {
                appCommon.showResponseError("reClaimErr", "errlist", window.resources["TextNoTrainingSitesFound"]);
            }
        },

        loadCourses: function (data) {
            if (data && data.length > 0) {
                var subItems = [];
                subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                $.each(data,
                    function (index, item) {
                        subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                    });
              
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
                $("#ddlCourse").toggleClass("hide", false);

                $("#courseId").empty().append(subItems);
                $("#courseId").val('');
            } else {
                appCommon.showResponseError("reClaimErr", "errlist", window.resources["TextNoCourseFoundPleaseReview"]);
            }
        },

        getReclaimTargets: function (url, inp, cb, err) {
            jQuery.get(url, inp ? inp : null, cb)
            .error(function (errMsg) {
                appCommon.showResponseError("reClaimErr", "errlist", err != '' ? err : errMsg);
                $("#ddlSource").toggleClass("hide", false);
                $("#fromSource").empty();
                $("#divBox").toggleClass("hide", true);
                $("#lnkConfirm").toggleClass("hide", true);
            });

        },

        loadTargets: function (url, inputs, textDefaultOption) {

            var subItems = [];
            subItems.push($("<option/>",
            {
                value: '',
                text: textDefaultOption
            }));


            jQuery.get(url, inputs,
                    function (data) {
                        if (data && data.length > 0) {
                            $.each(data,
                                function (index, item) {
                                    subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                                });
                        }

                        $("#ddlSource").toggleClass("hide", false);
                        $("#divBox").toggleClass("hide", true);
                        $("#lnkConfirm").toggleClass("hide", true);
                        $("#fromSource").empty().append(subItems);
                        $("#fromSource").val('');
                    })

             .error(function (err) {
                 appCommon.showResponseError("reClaimErr", "errlist", err);
                 $("#ddlSource").toggleClass("hide", false);
                 $("#fromSource").empty().append(subItems);
                 $("#divBox").toggleClass("hide", true);
                 $("#lnkConfirm").toggleClass("hide", true);
             });

        },

        getAvailableQuantity: function (url, sourceId) {

            $("#divBox").toggleClass("hide", true);
            var courseId = $("#courseId option:selected").val();
            var inp;
            var siteId = $("#tsList option:selected").val();
            var tcId = $("#tcId option:selected").val();
            inp = { courseId: courseId, sourceId: siteId, fromSource: tcId }
   

            jQuery.get(url, inp,
                    function (data) {
                        if (data) {
                            $("#divBox").toggleClass("hide", false);
                            $("#divAvailQty").text(data);
                            $("#lnkConfirm").toggleClass("hide", false);
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimErr", "errlist", err);
                });
        },

        clearErrorMsg: function () {
            $("#reClaimErr").html("");
            $("#reClaimErr").toggleClass("hide", true);
        },


        buildReclaimRequest: function () {          
            $("#hdnSiteName").val($("#tsList option:selected").text());

            window.tcAssignmentViewModel.ReclaimSourceId = $("#tsList option:selected").val();
            window.tcAssignmentViewModel.TCId = $("#tcId option:selected").val();
            window.tcAssignmentViewModel.TCName = $("#tcId option:selected").text();
            window.tcAssignmentViewModel.CourseName = $("#courseId option:selected").text();
            window.tcAssignmentViewModel.CourseId = $("#courseId option:selected").val();
            window.tcAssignmentViewModel.AssignedQty = $("#qty").val();
            window.tcAssignmentViewModel.AvailableQty = $("#divAvailQty").text();
            
        },

        loadReclaimMain: function () {
            $("#confirmReclaim").hide();
            $("#reclaimMain").show();
            $("#confirmReclaim").html("");
            return false;
        },

        loadConfirmReclaim: function () {
            var isValid = false;
                isValid = validateRequest();
                if (isValid) this.buildReclaimRequest();

            if (!isValid) return false;
            var url = $("#lnkConfirm").data("url");
            jQuery.post(url,
                window.tcAssignmentViewModel,
                    function (data) {
                        if (data) {                           
                            $("#confirmReclaim").show();
                            $("#reclaimMain").hide();
                            $("#confirmReclaim").html(data);
                            $("#divSourceName").html($("#hdnSiteName").val());
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimErr", "errlist", err);
                });

            return false;
        },

        loadCompleteReclaim: function () {

            $("#lnkComplete").prop("disabled", true);
            var isValid = false;
            isValid = validateRequest();
            if (isValid) this.buildReclaimRequest();

            if (!isValid) {
                $("#lnkComplete").prop("disabled", false);
                return false;
            }

            var url = $("#lnkComplete").data("url");
            var self = this;
            $("#hdnAvailQty").val($("#divConfirmAvailQty").text());

            jQuery.post(url,
                    window.tcAssignmentViewModel,
                    function (data) {
                        if (data) {                          
                            $("#confirmReclaim").show();
                            $("#reclaimMain").hide();
                            $("#confirmReclaim").html(data);
                            $("#divSourceName").html($("#hdnSiteName").val());
                            $("#counter").text($("#hdnAvailQty").val());
                            self.fnCounter();
                        }
                    })
                .error(function (err) {
                    appCommon.showResponseError("reClaimConfirmErr", "errlist1", err);
                })
                .always(function () {
                    $("#lnkComplete").prop("disabled", false);
                });

            return false;
        },

        fnCounter: function () {
            $({ countNum: $("#hdnAvailQty").val() }).delay(1000).animate({ countNum: $("#divCompAvailQty").text() }, {
                duration: 1500,
                easing: 'linear',
                step: function () {
                    $('#counter').text(Math.floor(this.countNum));
                },
                complete: function () {
                    $('#counter').text(this.countNum);
                    $('#counter').addClass("animated fadeOut");
                    $('#counter').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $('#counter').delay(100).animate({ height: 0 }, 500);
                    });
                }
            });
        }
    }
};
var AppSearchUser = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    return {

        init: function () {
            var self = this;
            $(document)
                .ready(function () {
                    $("#confirmUpdateModal").on("shown.bs.modal", self.focus);
                    $("#confirmRemoveAlignmentModal").on("shown.bs.modal", self.focus);
                });
        },
        focus: function (e) {
            var modal = $(this);
            modal.find(".close").focus();
        },
        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {

                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            }
        },

        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        validateSearch: function () {
            var err = [];

            var fName = window.searchUserModel.FirstName = $("#firstname").val();
            var lName = window.searchUserModel.LastName = $("#lastname").val();
            var email = window.searchUserModel.Email = $("#email").val();
            var instrId = window.searchUserModel.InstructorId = $("#instructorId").val();
            var atgId = window.searchUserModel.AtgId = $("#atgId").val();
            var ssoId = window.searchUserModel.SsoId = $("#ssoId").val();

            if (!(fName || lName || email || instrId || ssoId || atgId)) {
                err[err.length] =
                    window.resources["TextAtleastOneValue"];
            }

            if (email && !this.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            return appCommon.showResponseError("divSearchError", "errlist", err);
        },

        validateTCSearch: function () {

            $("#assignError").html("");
            $("#assignError").addClass("hide");
            var errorMsg = [];
            var tcName = $("#tcName").val();
            var tcId = $("#tcId").val();
            var tcCode = $("#securityCode").val();
            if (!tcName && !tcId && !tcCode) {
                errorMsg[errorMsg.length] = window.resources["TextAtleastOneValue"];
            }

            return appCommon.showResponseError("assignError", "errlist", errorMsg);
        },

        searchTC: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var id = $el.attr("id");
            if (id != "lnkTCBack" && id != "lnkTSBack" && !self.validateTCSearch()) {
                return false;
            }
            $("#divTCInfo").toggleClass("hide", true);
            $("#divSearch").toggleClass("hide", false);
            $("#divTSInfo").toggleClass("hide", true);
            $("#divRoleMapping").toggleClass("hide", true);
            $("#divAlert, #divSearchError").toggleClass("hide", true);
            var feed = { TcName: $("#tcName").val(), TcIdNumber: $("#tcId").val(), securityCode: $("#securityCode").val() }
            var url = $("#hdnTCSearchUrl").val();
            self.callAPI("get", url, feed, self.onLoadTCResult, self.onFailTCSearch);
        },

        findTca: function (e) {

            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcid = $el.data("tcid");
            var url = $el.data("url");
            var feed = { tcid: tcid }
            self.callAPI("get", url, feed, self.onFindTcaResult, self.onFailedFindTca);
        },

        findTsa: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            var tcid = $el.data("tsid");
            var url = $el.data("url");
            var feed = { tsId: tcid }
            self.callAPI("get", url, feed, self.onFindTsaResult, self.onFailedFindTsa);
        },

        onFindTcaResult: function (data) {
            var trList = '';
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    trList = trList + '<tr><td>' + data[i].FirstName + '</td><td>' + data[i].LastName + '</td><td>' + data[i].Email + '</td></tr>';
                }
                $("#tcabody").html(trList);
            }
            else {
                $("#tcabody").html('No data found');
            }
            $("#showTCAModal").modal("show");
        },

        onFindTsaResult: function (data) {
            var trList = '';
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    trList = trList + '<tr><td>' + data[i].FirstName + '</td><td>' + data[i].LastName + '</td><td>' + data[i].Email + '</td></tr>';
                }
                $("#tsabody").html(trList);
            }
            else {
                $("#tsabody").html('No data found');
            }
            $("#showTSAModal").modal("show");
        },

        onLoadTCResult: function (data) {
            $("#divSearchResult").toggleClass("hide", false).html(data);
            $("#tblSearchTC").DataTable();
            if ($("#divAlert").is(":visible")) {
                appCommon.focusMessage();
            } else {
                $("html, body").animate({
                    scrollTop: $("#titleResults").offset().top - 55
                },
                    1000);
            }
        },

        onFailTCSearch: function (err) {
            appCommon.showResponseError("divSearchError", "errlist", err);
            $("#divAlert, #divSearchError").toggleClass("hide", true);
            var feed = { TcIdNumber: $("#tcId").val() }
            var url = $("#hdnTCSearchUrl").val();
            self.callAPI("get", url, feed, self.onLoadTCResult, self.onFailTCSearch);
        },

        onFailedFindTca: function (err) {
            appCommon.showResponseError("tcaearchtca", "errlist", err);
        },

        onFailedFindTsa: function (err) {
            appCommon.showResponseError("tsaearchtca", "errlist", err);

        },

        loadTCInfo: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target.parentElement);
            var url = $el.data("url");
            var tcId = $el.data("tcid");
            var feed = { TcId: tcId }
            self.callAPI("get", url, feed, self.onLoadTCInfo, self.onFailTCInfo);
        },

        onLoadTCInfo: function (data) {
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divTCInfo").toggleClass("hide", false).html(data);
                appCommon.focusMessage();
            }
        },
        loadTSInfo: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target.parentElement);
            var tcname = $el.data("tcname");
            $("#hdnTCName").val(tcname);
            var url = $el.data("url");
            var tcId = $el.data("tcid");
            var feed = { tcId: tcId, tcName: tcname }
            self.callAPI("get", url, feed, self.onLoadTSInfo, self.onFailTCInfo);
        },

        onLoadTSInfo: function (data) {
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divTCInfo").toggleClass("hide", true);
                $("#divRoleMapping").toggleClass("hide", true);
                $("#divTSInfo").toggleClass("hide", false).html(data);
                $("#tblSearchTS").DataTable();
                $("#spnTCname").html($("#hdnTCName").val());
                appCommon.focusMessage();
            } else {
                $("#tsBody").html('No data found');
            }
        },
        loadRoleMapScn: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target.parentElement);
            var orgName = $el.data("orgname");
            var url = $el.data("url");
            var orgId = $el.data("orgid");
            var orgtype = $el.data("orgtype");
            var orgCode = $el.data("orgcode");
            var feed = {};
            if (orgtype == 'tc')
                 feed = { OrgId: orgId, OrgName: orgName, OrgType: orgtype, OrgCode: orgCode }
            if (orgtype == 'ts')
                 feed = { OrgId: orgId, OrgName: orgName, OrgType: orgtype, OrgCode: orgCode, ParentOrgId: $el.data("parentorgid"), ParentOrgName: $el.data("parentorgname") }
            self.callAPI("get", url, feed, self.onloadRoleMapPage, self.onFailTCInfo);
        },
        onRoleSelection: function (e) {
            var roleId = $("#ddlSelectRole option:selected").val();
            if (roleId == RoleType.TCAdmin.value || roleId == RoleType.TSAdmin.value) {
                $('#existingEmailDiv').toggleClass("hide", false);
            }
            else
                $('#existingEmailDiv').toggleClass("hide", true);

            $('#spnCurrentEmail').text(window.resources["TextExistingEmail"].replace(' ', ' '+$("#ddlSelectRole option:selected").text()+' '))
            //$('#lblNewEmail').val(window.resources["NewEmail"].replace('Email', $("#ddlSelectRole option:selected").val() + ' ' + 'Email'))
        }
        ,
        onloadRoleMapPage: function (data) {
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divTCInfo").toggleClass("hide", true);
                $("#divTSInfo").toggleClass("hide", true);
                
                $("#divRoleMapping").toggleClass("hide", false).html(data);
                 appCommon.focusMessage();
            }
        },
        validateRoleMapping: function () {
            var self = this;
            var err = [];
            var newEmail = $("#newEmailAddress").val().trim();
            var existingEmail = $("#existingEmailAddress").val().trim();
            var roleId = $("#ddlSelectRole").val();

            if (!newEmail) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(newEmail)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            if(roleId == RoleType.TCAdmin.value || roleId == RoleType.TSAdmin.value)
            {
                if (!existingEmail) {
                    err[err.length] = window.resources["TextEmailRequired"];
                } else if (!self.validateEmail(existingEmail)) {
                    err[err.length] = window.resources["TextInvalidEmail"];
                }
            }
            return appCommon.showResponseError("divRoleMapError", "errlist1", err);
        },
        confirmRoleMappingSave: function (e) {
            e.preventDefault();
            var self = this;
            var btnId = e.target.id;
            $("#divRoleMapError, #divRoleMapAlert").toggleClass("hide", true);
            $("#divUpdateStatus, #divUpdateUser1,#divUpdateUser2").toggleClass("hide", true);

            if (!self.validateRoleMapping()) return false;
           
            $("#confirmRoleMappingModal").modal("show");
            $("#divModelBody").html(window.resources["TextConfirmUserRoleChange"]);
            $("#btnRoleMapOk").off("click");
            $("#btnRoleMapOk").on("click", $.proxy(self.saveRoleMappingInfo, self));
        },
        saveRoleMappingInfo: function (e) {
            e.preventDefault();
            $("#confirmRoleMappingModal").modal("hide");
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var orgId = $("#hdnOrgId").val();
            var roleId = $("#ddlSelectRole").val();
            var existingEmail = $("#existingEmailAddress").val();
            var newEmail = $("#newEmailAddress").val();
            
            var url = $("#hdnMapUserRoleUrl").val();

            var feed = { OrgId: orgId, RoleId: roleId, ExistingEmail: existingEmail, NewEmail: newEmail }

            self.callAPI("post", url, feed, self.onSuccessRoleMapping, self.onSaveRoleMappingFailed);
        },
        onSaveRoleMappingFailed: function (err) {
            appCommon.showResponseError("divRoleMapError", "errlist1", err);
        },
        onSuccessRoleMapping: function (data) {
            if (data && data.length > 0) {
                $("#divRoleMapAlert").toggleClass("hide", false);
                appCommon.focusMessage();
            }
        },
        clearTCSearch: function (e) {
            e.preventDefault();
            $("#tcName").val("");
            $("#tcId").val("");
            $("#securityCode").val("");
            $("#divSearchResult").html("");
        },


        onFailTCInfo: function (err) {

        },

        searchUsers: function (e) {
            e.preventDefault();
            var self = this;
            if (!self.validateSearch()) {
                return false;
            }
            $("#divAlert, #divSearchError").toggleClass("hide", true);
            var feed = window.searchUserModel;
            var url = $("#hdnSearchUrl").val();
            self.callAPI("post", url, feed, self.onLoadResult, self.onFailSearch);
        },

        onLoadResult: function (data) {
            $("#divSearchResult").toggleClass("hide", false).html(data);
            $("#tblSearchUser").DataTable();
            if ($("#divAlert").is(":visible")) {
                appCommon.focusMessage();
            } else {
                $("html, body").animate({
                    scrollTop: $("#titleResults").offset().top - 55
                },
                    1000);
            }
        },

        onFailSearch: function (err) {
            appCommon.showResponseError("divSearchError", "errlist", err);
        },

        clearSearch: function (e) {
            e.preventDefault();

            $("#divSearchError").html("");
            $("#divSearchError").toggleClass("hide", true);
            $("#firstname").val("");
            $("#lastname").val("");
            $("#email").val("");
            $("#instructorId").val("");
            $("#atgId").val('');
            $("#ssoId").val('');
            $("#divSearchResult").html("");
            $("#divEditUser").html("");
            $("#divAlert").toggleClass("hide", true);
            window.searchUserModel = {};
            appCommon.focusMessage();
        },

        editUser: function (e) {
            e.preventDefault();
            $("#divEditError").toggleClass("hide", true);
            $("#divEditAlert").toggleClass("hide", true);
            var self = this;
            var $el = $(e.target.parentElement);

            var url = $el.data("url");
            var inputs = {
                id: $el.data("uid"),
                isEdit: $el.data("isedit")
            }

            self.callAPI("get", url, inputs, $.proxy(self.onLoadingEditUser, self), self.onFailSearch);
        },

        onLoadingEditUser: function (data) {
            if (data && data.length > 0) {
                $("#divSearch").toggleClass("hide", true);
                $("#divEditUser").toggleClass("hide", false).html(data);
                $("#tblDisciplines").DataTable();
                $("#tblTC").DataTable();
                $("#tblTS").DataTable();
                $("#tblLocations").DataTable();
                appCommon.focusMessage();
            }
        },

        validateEdit: function () {
            var self = this;

            var err = [];
            var fName = window.searchUserModel.FirstName = $("#fname").val().trim();
            var lName = window.searchUserModel.LastName = $("#lname").val().trim();
            var email = window.searchUserModel.Email = $("#emailaddress").val().trim();
            window.searchUserModel.InstructorId = $("#instructorNum").val().trim();
            var atgId = window.searchUserModel.AtgId = $("#atgUserId").val().trim();
            var ssoId = window.searchUserModel.SsoId = $("#signOnId").val().trim();
            var verified = window.searchUserModel.IsDataVerified = $("input[id='chkVerification']").prop("checked");
            window.searchUserModel.Comments = $("#comments").val().trim();


            window.searchUserModel.RoleIds = $("input[id^=chkRole]:checked").map(function () {
                return this.value;
            }).get().join(",");

            if (!fName) {
                err[err.length] = window.resources["TextFirstNameRequired"];
            }

            if (!lName) {
                err[err.length] = window.resources["TextLastNameRequired"];
            }

            if (!email) {
                err[err.length] = window.resources["TextEmailRequired"];
            } else if (!self.validateEmail(email)) {
                err[err.length] = window.resources["TextInvalidEmail"];
            }

            //if (!atgId) {
            //    err[err.length] = window.resources["TextATGIdRequired"];
            //}

            //if (!ssoId) {
            //    err[err.length] = window.resources["TextSSOIdRequired"];
            //}

            if (!verified) {
                err[err.length] = window.resources["TextErrorNoATGConfirm"];
            }

            window.searchUserModel.ProfileId = $("#hdnUserId").val();

            return appCommon.showResponseError("divEditError", "errlist1", err);
        },

        confirmSave: function (e) {
            e.preventDefault();
            var self = this;
            var btnId = e.target.id;
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            $("#divUpdateStatus, #divUpdateUser1,#divUpdateUser2").toggleClass("hide", true);
            if (btnId === "lnkStatus") {
                var err = [];
                var verified = $("input[id='chkVerification']").prop("checked");
                if (!verified) {
                    err[err.length] = window.resources["TextErrorNoATGConfirm"];
                    return appCommon.showResponseError("divEditError", "errlist1", err);
                }

                $("#confirmUpdateModal").modal("show");
                $("#btnOk").off("click");
                $("#divUpdateStatus").toggleClass("hide", false);
                var status = $("#lnkStatus").data("isactive");
                $("#divUpdateStatus p").toggleClass("hide", true);

                if (status.toLowerCase() === "true") {
                    $("#divUpdateStatus p:eq(0)").toggleClass("hide", false);
                } else {
                    $("#divUpdateStatus p:eq(1)").toggleClass("hide", false);
                }

                $("#btnOk").on("click", $.proxy(self.saveStatus, self));
            } else {
                if (!self.validateEdit()) return false;
                $("#confirmUpdateModal").modal("show");
                $("#btnOk").off("click");
                $("#divUpdateUser1,#divUpdateUser2").toggleClass("hide", false);
                $("#btnOk").on("click", $.proxy(self.saveInfo, self));
            }
        },

        removeAlignment: function (e, tcId, tsId, profileId, disciplineId, disciplineName) {

            e.preventDefault();
            var self = this;
            var removePrams = {
                tcId: tcId,
                tsId: tsId,
                profileId: profileId,
                disciplineId: disciplineId
            }
            self.removePrams = removePrams;
            $("#divModelBody").html("You are about to remove " + disciplineName + " discipline. Do you want to proceed?");
            $("#confirmRemoveAlignmentModal").modal("show");
            $("#btnRemoveAlignmentOk").off("click");
            $("#btnRemoveAlignmentOk").on("click", $.proxy(self.saveAlignment, self));
        },

        saveAlignment: function (e) {

            e.preventDefault();
            $("#confirmRemoveAlignmentModal").modal("hide");
            var self = this;
            var url = $("#hdnRemoveAlignmentUrl").val();

            var inputs = self.removePrams;
            self.callAPI("post", url, inputs, self.onSuccessSave, self.onEditCardFailed);
        },

        saveInfo: function (e) {
            e.preventDefault();
            $("#confirmUpdateModal").modal("hide");
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var url = $("#hdnUserInfoUrl").val();

            if (!self.validateEdit()) return false;

            self.callAPI("post", url, window.searchUserModel, self.onSuccessSave, self.onEditCardFailed);
        },

        saveStatus: function (e) {
            e.preventDefault();
            $("#confirmUpdateModal").modal("hide");
            $("#divEditError, #divEditAlert").toggleClass("hide", true);
            var self = this;
            var url = $("#hdnUserStatusUrl").val();

            var inp = {
                ProfileId: $("#hdnUserId").val(),
                IsActive: $("#lnkStatus").data("isactive").toLowerCase() === "true",
                Comments: $("#comments").val().trim(),
                IsDataVerified: $("input[id='chkVerification']").prop("checked")
            };

            self.callAPI("post", url, inp, self.onSuccessSave, self.onEditCardFailed);
        },

        onSuccessSave: function (data) {
            if (data && data.length > 0) {
                $("#divEditUser").html(data);
                $("#tblDisciplines").DataTable();
                $("#tblTC").DataTable();
                $("#tblTS").DataTable();
                $("#tblLocations").DataTable();
                $("#divEditAlert").toggleClass("hide", false);
                appCommon.focusMessage();
            }
        },

        onEditCardFailed: function (err) {
            appCommon.showResponseError("divEditError", "errlist1", err);
        },

        loadSearch: function (e) {
            e.preventDefault();
            $("#divSearch").toggleClass("hide", false);
            $("#divEditUser").html("").toggleClass("hide", true);
            $("#btnSearchUser").trigger({ type: "click" });
        }
    }
}
;
var AppVendor = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    var appCommon = new AppCommon();

    var validateVendor = function (errDiv, li) {

        $("#errDiv").html("").addClass("hide");

        var errorMsg = [];

        var apis = $("#ddlApi option:selected");

        window.vendorModel.Vendor = {
            Name: $("#txtName").val(),
            email: $("#txtEmail").val(),
            Phone: $("#txtPhone").val(),
            Domain: $("#txtDomain").val(),
            ExternalAPI: apis.map(function (a, item) { return item.value; }).get().join(",")
        }

        if ($("#vStatus").length > 0) {
            window.vendorModel.Vendor.IsActive = $("#vStatus").is(":checked");
        }


        if ($("#chkSecurity").length > 0) {
            window.vendorModel.Vendor.HasAPISecurity = $("#chkSecurity").is(":checked");
        }

        if ($("#chkReclaimEcard").length > 0) {
            window.vendorModel.Vendor.IsAllowToReserve = $("#chkReclaimEcard").is(":checked");
        }
        window.vendorModel.SelectedAPIs = apis.map(function (a, item) { return item.text; }).get().join(", ");

        if (!window.vendorModel.Vendor.Name) {
            errorMsg[errorMsg.length] = window.resources["TextNameRequired"];
        }

        if (!window.vendorModel.Vendor.email) {
            errorMsg[errorMsg.length] = window.resources["TextEmailRequired"];
        } else {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            if (!expr.test(window.vendorModel.Vendor.email)) {
                errorMsg[errorMsg.length] = window.resources["TextInvalidEmail"];
            }
        }

        if (!window.vendorModel.Vendor.Domain) {
            errorMsg[errorMsg.length] = window.resources["TextDomainRequired"];
        }

        if (!window.vendorModel.Vendor.ExternalAPI || window.vendorModel.Vendor.ExternalAPI.length === 0) {
            errorMsg[errorMsg.length] = window.resources["TextAPIRequired"];
        }

        return appCommon.showResponseError(errDiv, li, errorMsg);
    }

    return {
        init: function () {
            var self = this;
            $("#lnkNext").on("click", $.proxy(self.loadConfirm, self));
            self.initMultiSelect();
        },

        initMultiSelect: function () {
            $("#ddlApi").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectExternalApi"],
                nSelectedText: ' ' + window.resources["TextSelectedAPI"]
            });

            $(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiAPI");
        },

        callAPI: function (verb, url, feed, cb, ecb) {
            if (verb === "get") {
                $.get(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else if (verb === "post") {
                $.post(url, feed, cb)
                    .error(function (err) {
                        ecb(err);
                    });
            } else {
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: cb,
                    data: feed,
                    contentType: "application/json"
                });
            }
        },
        validateEmail: function (email) {
            var expr =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm;
            return expr.test(email);
        },

        loadConfirm: function (e) {
            e.preventDefault();
            var $el = $(e.target);
            var self = this;

            if (!validateVendor("registrationErr", "errlist")) return false;

            var cb = function (data) {
                if (data && data.length > 0) {
                    $("#registerMain").toggleClass("hide", true);
                    $("#divPartial").html(data).toggleClass("hide", false);
                }
            };

            var err = function (errMsg) {
                if ($("#ConfirmErr").length > 0) {
                    appCommon.showResponseError("ConfirmErr", "errlist1", errMsg);
                } else {
                    appCommon.showResponseError("registrationErr", "errlist", errMsg);
                }
            };

            var url = $el.data("url");
            self.callAPI("post", url, window.vendorModel, cb, err);

            return false;
        },

        goBack: function (e) {
            e.preventDefault();
            $("#registrationErr").toggleClass("hide", true);
            $("#registerMain").toggleClass("hide", false);
            $("#divPartial").html("").toggleClass("hide", true);
        },

        editVendor: function (e) {
            e.preventDefault();
            var $el = $(e.target).closest("a");;
            var self = this;

            var cb = function (data) {
                if (data && data.length > 0) {
                    $("#divEdit").html(data).toggleClass("hide", false);
                    $("#resultsTable").toggleClass("hide", true);
                    appCommon.focusMessage();
                    self.initMultiSelect();
                }
            };

            var err = function (errMsg) {
                appCommon.showResponseError("divVendorsErr", "errlist", errMsg);
            };

            self.callAPI("get", $el.data("url"), null, cb, err);
        },

        navigateToList: function (e) {
            e.preventDefault();
            $("#resultsTable").toggleClass("hide", false);
            $("#divEdit").html("").toggleClass("hide", true);
        },

        update: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            $("#divEditAlert").toggleClass("hide", true);
            $("#divEditErr").toggleClass("hide", true);

            if (!validateVendor("divEditErr", "errlist1")) return false;

            var cb = function (data) {
                if (data) {
                    $("#divEditAlert").toggleClass("hide", false);
                    appCommon.focusMessage();
                }
            };

            var err = function (errMsg) {
                appCommon.showResponseError("divEditErr", "errlist1", errMsg);
            };

            window.vendorModel.Vendor.VendorId = $el.data("vid");

            self.callAPI("post", $el.data("url"), window.vendorModel, cb, err);

            return false;
        },

        changePwd: function (e) {
            e.preventDefault();
            var self = this;
            var $el = $(e.target);
            $("#divAlert").toggleClass("hide", true);
            $("#divVendorsErr").toggleClass("hide", true);

            $("#changePwdModal").modal("show");
            $("#confirmText").html(window.resources["TextChangePwdConfirmation"].replace("{0}", $el.data("vname")));
            $("#btnYes").off("click");
            $("#btnYes").on("click", { vid: $el.data("vid") }, $.proxy(self.confirmPwdChange, self));
        },

        confirmPwdChange: function (e) {
            e.preventDefault();
            var self = this;
            var vendorId = e.data.vid;

            var cb = function (data) {
                if (data) {
                    $("#changePwdModal").modal("hide");
                    $("#divAlert").toggleClass("hide", false);
                    appCommon.focusMessage();
                }
            };

            var err = function (errMsg) {
                $("#changePwdModal").modal("hide");
                appCommon.showResponseError("divVendorsErr", "errlist", errMsg);
            };

            self.callAPI("post", $("#hdnResetUrl").val(), { id: vendorId }, cb, err);
        }
    }
};
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.de = {
        closeText: "Schließen",
        prevText: "&#x3C;Zurück",
        nextText: "Vor&#x3E;",
        currentText: "Heute",
        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
            "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        weekHeader: "KW",
        dateFormat: "dd.mm.yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    // datepicker.setDefaults(datepicker.regional.de);

    return datepicker.regional.de;
}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

        // Browser globals
        factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.es = {
        closeText: "Cerrar",
        prevText: "&#x3C;Ant",
        nextText: "Sig&#x3E;",
        currentText: "Hoy",
        monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun",
        "jul", "ago", "sep", "oct", "nov", "dic"],
        dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
        dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
        dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
        weekHeader: "Sm",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };
   // datepicker.setDefaults(datepicker.regional.es);

    return datepicker.regional.es;

}));;
/* French initialisation for the jQuery UI date picker plugin. */
/* Written by Keith Wood (kbwood{at}iinet.com.au),
			  Stéphane Nahmani (sholby@sholby.net),
			  Stéphane Raimbault <stephane.raimbault@gmail.com> */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {
*/
        // Browser globals
        factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.fr = {
        closeText: "Fermer",
        prevText: "Précédent",
        nextText: "Suivant",
        currentText: "Aujourd'hui",
        monthNames: ["janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        monthNamesShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin",
            "juil.", "août", "sept.", "oct.", "nov.", "déc."],
        dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        dayNamesShort: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
        dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
        weekHeader: "Sem.",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };
    //datepicker.setDefaults(datepicker.regional.fr);

    return datepicker.regional.fr;

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.it = {
        closeText: "Chiudi",
        prevText: "&#x3C;Prec",
        nextText: "Succ&#x3E;",
        currentText: "Oggi",
        monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
            "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
        monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
            "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
        dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
        dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
        weekHeader: "Sm",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };
    // datepicker.setDefaults(datepicker.regional.it);

    return datepicker.regional.it;

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.ja = {
        closeText: "閉じる",
        prevText: "&#x3C;前",
        nextText: "次&#x3E;",
        currentText: "今日",
        monthNames: ["1月", "2月", "3月", "4月", "5月", "6月",
            "7月", "8月", "9月", "10月", "11月", "12月"],
        monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月",
            "7月", "8月", "9月", "10月", "11月", "12月"],
        dayNames: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
        dayNamesMin: ["日", "月", "火", "水", "木", "金", "土"],
        weekHeader: "週",
        dateFormat: "yy/mm/dd",
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "年"
    };
    // datepicker.setDefaults(datepicker.regional.ja);

    return datepicker.regional.ja;

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.ko = {
        closeText: "닫기",
        prevText: "이전달",
        nextText: "다음달",
        currentText: "오늘",
        monthNames: ["1월", "2월", "3월", "4월", "5월", "6월",
            "7월", "8월", "9월", "10월", "11월", "12월"],
        monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월",
            "7월", "8월", "9월", "10월", "11월", "12월"],
        dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
        dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
        weekHeader: "주",
        dateFormat: "yy. m. d.",
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "년"
    };
    // datepicker.setDefaults(datepicker.regional.ko);

    return datepicker.regional.ko;

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional.pt = {
        closeText: "Fechar",
        prevText: "Anterior",
        nextText: "Seguinte",
        currentText: "Hoje",
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        dayNames: [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado"
        ],
        dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        dayNamesMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        weekHeader: "Sem",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };
    // datepicker.setDefaults(datepicker.regional.pt);

    return datepicker.regional.pt;

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional["zh-Hans"] = {
        closeText: "关闭",
        prevText: "&#x3C;上月",
        nextText: "下月&#x3E;",
        currentText: "今天",
        monthNames: ["一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月"],
        dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
        weekHeader: "周",
        dateFormat: "yy-mm-dd",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "年"
    };
    // datepicker.setDefaults(datepicker.regional["zh-Hans"]);

    return datepicker.regional["zh-Hans"];

}));;
/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
(function (factory) {
    /*if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["../widgets/datepicker"], factory);
    } else {*/

    // Browser globals
    factory(jQuery.datepicker);
    //}
}(function (datepicker) {

    datepicker.regional["zh-Hant"] = {
        closeText: "關閉",
        prevText: "&#x3C;上個月",
        nextText: "下個月&#x3E;",
        currentText: "今天",
        monthNames: ["一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月"],
        dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        dayNamesShort: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
        dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
        weekHeader: "週",
        dateFormat: "yy/mm/dd",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "年"
    };
    // datepicker.setDefaults(datepicker.regional["zh-Hant"]);

    return datepicker.regional["zh-Hant"];

}));;
var AppeCardReport = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlSite option:selected").val();
        var courseId = $("#ddlCourse option:selected").val();
        var errorMsg = [];
        if (tcId === "") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }
        if (courseId === "") {
            errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
        }
        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }

    return {

        init: function () {
            var self = this;

            $(document).ready(function () {
                $("#ddlReports option:contains(eCards Report)").attr('selected', true);
            });           

            $("#ddlTC")
                .on("change",
                    function (e) {
                        var $el = $(e.target);
                        var trainingCenterId = $el.val();
                        if (trainingCenterId.length > 0) {

                            self.getTrainingSites({ TcId: trainingCenterId });
                            $('#divLocation').toggleClass("hide", true);
                            $('#divTrainingSite').toggleClass("hide", false);

                            if ($('#rdDomestic').is(':checked')) {
                               // self.getLocation({ TcId: trainingCenterId });
                                self.getCourses(false);
                               // $('#divLocation').toggleClass("hide", false);
                               // $('#divTrainingSite').toggleClass("hide", true);
                            }
                            else {
                               // self.getTrainingSites({ TcId: trainingCenterId });
                                self.getCourses(true);
                               // $('#divLocation').toggleClass("hide", true);
                               // $('#divTrainingSite').toggleClass("hide", false);
                            }
                        }
                    });

            $('input[type=radio][name=grpDomeInter]').on('change', function (e) {
                var $el = $(e.target);
                filterBy = $el.val();

               // self.getTrainingCenters(e, true);
               // self.getCourses(true);
                $('#divLocation').toggleClass("hide", true);
                $('#divTrainingSite').toggleClass("hide", false);
                $("#ddlSite").empty().append($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));

                if (filterBy == "Domestic") {
                    self.getTrainingCenters(e, false);
                    self.getCourses(false);
                }
                else {                    
                    self.getTrainingCenters(e, true);
                    self.getCourses(true);
                }
            });
        },



        getLocation: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    } else {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $("#ddlLocation").empty().append(subItems);
                    }
                })
                .error(function (err) {
                    $("#ddlLocation").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        getTrainingCenters: function (e, isInternational) {
            var url = $("#hdnTcUrl").val();
            var inputs = { isInternational: isInternational };
            // Get tc domestic international            
            url = $('#hdnTcUrl').val();
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", {
                            value: '', text: window.resources["SelectTrainingCenter"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name, data: { tcid: item.TCIdNumber } }));
                            });
                        $("#ddlTC").empty().append(subItems);
                        $('#ddlTC').val('');
                    } else {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectTrainingCenter"] }));
                        $("#ddlTC").empty().append(subItems);
                    }
                })
                .error(function (err) {
                    $("#ddlSiteInter").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        getTrainingSites: function (inputs) {
            var url = $("#hdnTsUrl").val();
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlSite").empty().append(subItems);
                        $('#ddlSite').val('');
                    }
                    else {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                        $("#ddlSite").empty().append(subItems);
                    }
                })
                .error(function (err) {
                    $("#ddlSite").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        getCourses: function (isInternational) {
            var url = $("#hdnCourseUrl").val();
            var inputs = { isInternational: isInternational };
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.CourseId, text: item.Name }));
                            });
                        $("#ddlCourse").empty().append(subItems);
                        $('#ddlCourse').val('');
                    }
                    else {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                        $("#ddlCourse").empty().append(subItems);
                    }
                })
                .error(function (err) {
                    $("#ddlCourse").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        btnDownload_Click: function (isValidate) {

            var self = this;
            var url = $("#btnDownload").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var tsId = $("#ddlSite option:selected").val();
            var courseId = $("#ddlCourse option:selected").val();
            var courseName = $("#ddlCourse option:selected").text();
            var eCardStatus = $("#ddlStatus option:selected").val();
            var isnternational = $('#rdInternational').is(':checked');            

            var tcIdNumber = $("#ddlTC").find(':selected').data('tcid');
            //var tcIdNumber = $("#ddlTC")[0].options[$("#ddlTC")[0].selectedIndex].getAttribute("data-tcId");

            var inputs = { TcId: tcId, tsId: tsId, CourseId: courseId, startdate: startDate, enddate: endDate, eCardStatus: eCardStatus, tcIdNumber: tcIdNumber, courseName: courseName, isIntrnational: isnternational }
            if (validateRequest()) {
                jQuery.get(url, inputs,
                    function (data) {
                        if (data && data.length > 0) {
                            window.location.href = "EcardReport/GetEcardReport?TcId=" + tcId + "&tsId=" + tsId + "&CourseId=" + courseId + "&startdate=" + startDate + "&enddate=" + endDate + "&eCardStatus=" + eCardStatus + "&tcIdNumber=" + tcIdNumber + "&courseName=" + courseName + "&isIntrnational=" + isnternational;
                        } else {
                            appCommon.showResponseError("reportError", "errlist", window.resources["TextNoRecords"]);
                        }
                    })
                    .error(function (err) {
                        appCommon.showResponseError("reportError", "errlist", "error");
                    });
            }
        }
    }
};
var AppEditEcardReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
       
        var errorMsg = [];
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }
        if (tcId =="") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }


        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;
    return {

        init: function () {
            var self = this;

            $(document).ready(function () {
                $("#ddlReports option:contains(Student Edit eCard Report)").attr('selected', true);
            });
        },

        loadReport: function (url, startDate, endDate, tcId) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { startDate: startDate, endDate: endDate, tcId: tcId },
                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Student Edit Ecard Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            if (validateRequest()) {
                self.loadReport(url, startDate, endDate, tcId);
            }
        }
    }
};
var AppIndividualInstructorScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlLocation option:selected").val();
        var instructors = $("#ddlInstructors").multiselect("getSelected").val();
        var userRole = $("#hdnRole").val();
        var errorMsg = [];
        if (!startDate|| !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (userRole == RoleType.EcardAdmin.value) {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }

            if (locationId === "") {
                errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
            }
        }

        if (!instructors || instructors.length <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextMultiInstructorsRequired"];
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");

                       var tcId = $(e.target).val();

                       if (tcId > 0) {


                           self.getLocation({ tcId: tcId });
                           self.getInstructor({ tcId: tcId });
                       } else {
                           //  $("#divLocation").toggleClass("hide", true);
                       }
                   });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");


                // $("#ddlReports").prop('selectedIndex', 4);

                $("#ddlReports option:contains(Individual Instructor Scores)").attr('selected', true);

                if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", true);

                    if ($('#hdnReport').val() != "instructor") {
                        $("#divLocation").toggleClass("hide", false);
                        self.getLocation({ tcId: $("#hdnTcId").val() });
                    } else {
                        $("#divTcLocation").toggleClass("hide", true);
                        self.getInstructor({ tcId: $("#hdnTcId").val() });

                    }
                }
                if (userRole == RoleType.EcardAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divLocation").toggleClass("hide", false);
                }

                self.initMultiSelect();
            });
        },

        initMultiSelect: function () {
            $("#ddlInstructors").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectInstructors"],
                nSelectedText: ' ' + window.resources["TextSelectedInstructors"]
            });

            //$(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiInst");
        },

        loadReport: function (url, tcId, locationId, startDate, endDate, instructors) {

            window.reportViewModel.TcId = tcId;
            window.reportViewModel.LocationId = locationId;
            window.reportViewModel.StartDate = startDate;
            window.reportViewModel.EndDate = endDate;
            window.reportViewModel.ReportType = reportType;
            window.reportViewModel.Instructors = instructors;


            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: window.reportViewModel,

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Instructor Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        getLocation: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },


        getInstructor: function (inputs) {
            var url = $("#ddlInstructors").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlInstructors").empty().append(subItems).multiselect('rebuild');

                    }
                })

                .error(function (err) {
                    $("#ddlInstructors").empty().multiselect('rebuild');
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var locationId = $("#ddlLocation option:selected").val();

            var inst = $("#ddlInstructors").multiselect("getSelected").val();

            if (validateRequest()) {
                self.loadReport(url, tcId, locationId, startDate, endDate, inst);
            }
        }
    }
};
var AppInstructorScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();

        var errorMsg = [];
        if (!startDate|| !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (tcId === "") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }
        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;
            var userRole = $("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
                $("#ddlReports option:contains(Quality Score)").attr('selected', true);
            });
        },

        loadReport: function (url, tcId, startDate, endDate) {

            window.reportViewModel.TcId = tcId;
            window.reportViewModel.StartDate = startDate;
            window.reportViewModel.EndDate = endDate;
            window.reportViewModel.ReportType = reportType;
            window.reportViewModel.Instructor = reportType;
            

            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: window.reportViewModel,

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Instructor Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }


                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            if (validateRequest()) {
                self.loadReport(url, tcId, startDate, endDate);
            }
        }
    }
};
var AppIntlIndividualInstructorScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlSite option:selected").val();
        var instructors = $("#ddlInstructors").multiselect("getSelected").val();
        var userRole = $("#hdnSelectedRole").val();
        var errorMsg = [];
        if (!startDate|| !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

       
        if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }

        if (userRole == 'tss' || userRole == 'tsadmin') {
            if (tsId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
            }
        }

        if (!instructors || instructors.length <= 0) {
            errorMsg[errorMsg.length] = window.resources["TextMultiInstructorsRequired"];
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnSelectedRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");
                       var tcId = $(e.target).val();
                       if (tcId > 0) {
                           var role = $('#ddlRole').val();
                           var roleid = self.getRoleId(role);

                           self.getSite({ tcId: tcId, roleId: roleid });
                           self.getInstructor({ tcId: tcId, roleId: roleid });
                       } 
                   });
            $("#ddlSite")
                .on("change",
                    function (e) {
                        var url = $(e.target).data("url");

                        var tsId = $(e.target).val();

                        if (tsId > 0) {
                            var role = $('#ddlRole').val();
                            var roleid = self.getRoleId(role);
                            var tcId = $('#ddlTC').val();
                            self.getInstructor({ tcId: tcId, roleId: roleid, tsId: tsId });
                        } 
                    });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
                // $('#ddlRole').val($('#hdnSelectedRole').val()).trigger('change');
                setTimeout(function () { $('#ddlRole').val($('#hdnSelectedRole').val()).trigger('change'); }, 500);
                $('#ddlTC').val('');
                // $("#ddlReports").prop('selectedIndex', 4);

                setTimeout(function () { $("#ddlReports option:contains(Individual Instructor Scores)").attr('selected', true); }, 500);
                setTimeout(function () { $("#ddlSiteReports option:contains(Individual Instructor Scores)").attr('selected', true); }, 500);
                // $("#ddlReports option:contains(Individual Instructor Scores)").attr('selected', true);
                // $("#ddlSiteReports option:contains(Individual Instructor Scores)").attr('selected', true);

                if (userRole == 'tcc' || userRole == 'tcadmin') {
                  //  $("#divTrainingCenter").toggleClass("hide", true);
                    var selectedRole = $('#ddlRole').val();
                    var roleid = self.getRoleId(selectedRole);

                    if ($('#hdnReport').val() != "instructor") {
                        $("#divSite").toggleClass("hide", false);
                        self.getSite({ tcId: $("#hdnTcId").val(), roleId: roleid});
                    } else {
                        $("#divSite").toggleClass("hide", true);

                        self.getInstructor({ tcId: $("#hdnTcId").val(), roleId: roleid});

                    }
                }
                if (userRole == 'tsc' || userRole == 'tsadmin') {
                //    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divSite").toggleClass("hide", false);
                }

                self.initMultiSelect();
            });
        },

        initMultiSelect: function () {
            $("#ddlInstructors").multiselect({
                buttonWidth: '100%',
                disableIfEmpty: false,
                includeSelectAllOption: true,
                selectAllText: window.resources["TextSelectAll"],
                allSelectedText: window.resources["TextAllSelected"],
                nonSelectedText: window.resources["SelectInstructors"],
                nSelectedText: ' ' + window.resources["TextSelectedInstructors"]
            });

            //$(".multiselect-bin").find('button').attr("aria-required", "true").attr("id", "multiInst");
        },

        loadReport: function (url, tcId, tsId, startDate, endDate, instructors) {

            window.reportViewModel.TcId = tcId;
            window.reportViewModel.TsId = tsId;
            window.reportViewModel.StartDate = startDate;
            window.reportViewModel.EndDate = endDate;
            window.reportViewModel.ReportType = reportType;
            window.reportViewModel.Instructors = instructors;


            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: window.reportViewModel,

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Instructor Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        getSite: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));//window.resources["TextSelecteCardLocation"]
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlSite").empty().append(subItems);
                        $('#ddlSite').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlSite").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },
        getRoleId: function (role) {
            if (role == 'tcc')
                return RoleType.TCC.value;
            else if (role == 'tcadmin') {
                return RoleType.TCAdmin.value;
            }
            else if (role == 'tsc') {
                return RoleType.TSC.value;
            }
            else if (role == 'tsadmin') {
                return RoleType.TSAdmin.value;
            }
            else
                return 0;
        },

        getInstructor: function (inputs) {
            var url = $("#ddlInstructors").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlInstructors").empty().append(subItems).multiselect('rebuild');

                    }
                })

                .error(function (err) {
                    $("#ddlInstructors").empty().multiselect('rebuild');
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var tsId = $("#ddlSite option:selected").val();

            var inst = $("#ddlInstructors").multiselect("getSelected").val();

            if (validateRequest()) {
                self.loadReport(url, tcId, tsId, startDate, endDate, inst);
            }
        }
    }
};
var AppIntlInstructorScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();

        var errorMsg = [];
        if (!startDate|| !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (entityType == 'tc' && tcId === "") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
        }
        if (entityType =='ts' && tsId === "") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
        }
        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;
    var entityType;
    return {

        init: function () {
            var self = this;
            var userRole = $("#hdnRole").val();

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });
            $("input[type=radio][name=entityType]").on("change", function (e) {
                var $el = $(e.target);
                entityType = $el.val();
                if (entityType==='tc') {
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divTrainingSite").toggleClass("hide", true);
                }
                  
                if (entityType==='ts') {
                    $("#divTrainingCenter").toggleClass("hide", true);
                    $("#divTrainingSite").toggleClass("hide", false);
                }
                   
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
                $("#ddlReports option:contains(Quality Score)").attr('selected', true);
                $("#ddlTC").val("");
                $("input[id=tc]:radio").prop("checked", true);
                $("input[id=tc]:radio").trigger("change");
            });
        },

        loadReport: function (url, tcId, tsId, startDate, endDate) {

            window.reportViewModel.TcId = tcId;
            window.reportViewModel.TsId = tsId;
            window.reportViewModel.StartDate = startDate;
            window.reportViewModel.EndDate = endDate;
            window.reportViewModel.ReportType = reportType;
            window.reportViewModel.Instructor = reportType;
            window.reportViewModel.EntityType = entityType;

            jQuery.ajax({
                url: url,
                type: "POST",
                dataType: "html",
                data: window.reportViewModel,

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Instructor Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }


                },
                error: function (errMsg) {
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var tsId = $("#ddlTS option:selected").val();
            if (validateRequest()) {
                self.loadReport(url, tcId, tsId, startDate, endDate);
            }
        }
    }
};
var AppIntlSurveyQuestionReport = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();
        var instructors = $("#ddlInstructor option:selected").val();
        var courseId = $("#ddlCourse option:selected").val();
        var discipline = $("#ddlDiscipline option:selected").val();
        var userRole = $('#ddlRole').val();   //$("#hdnRole").val();
       
        var errorMsg = [];

        if (reportType == "course") {
            if (courseId === "") {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }
        }
       
        if (reportType == "discipline") {
            if (discipline === "") {
                errorMsg[errorMsg.length] = window.resources["TextDisciplineRequired"];
            }
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }
        if (userRole == 'tcc' || userRole == 'tcadmin') {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
        }

        if (userRole == 'tsc' || userRole == 'tsadmin') {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }

            if (tsId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
            }
        }


        if (userRole == 'instructor') { 
            if (entityType == 'tc' && tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
            if (entityType == 'ts' && tsId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
            }
        
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;
     var entityType;
    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnSelectedRole").val();//$("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");
                       var tcId = $(e.target).val();
                       if ($('#ddlRole').val() != 'instructor') {
                           if (tcId > 0) {
                               var role = $('#ddlRole').val();
                               var roleId = self.getRoleId(role);
                               self.getSite({ tcId: tcId, roleId: roleId }, self);
                               self.getInstructor({ tcId: tcId, roleId: roleId });

                               $("#divTrainingSite").toggleClass("hide", false);
                               $("#divInstructor").toggleClass("hide", false);
                           }
                       }
                   });
            $("#ddlTS")
                .on("change",
                    function (e) {
                        var url = $(e.target).data("url");
                        var tsId = $(e.target).val();
                        if ($('#ddlRole').val() != 'instructor') {
                            if (tsId > 0) {
                                var role = $('#ddlRole').val();
                                var roleId = self.getRoleId(role);
                                var tcId = $('#ddlTC').val();
                                if (tsId > 0)
                                    self.getInstructor({ tcId: tcId, roleId: roleId, tsId: tsId });
                                else
                                    self.getInstructor({ tcId: tcId, roleId: roleId, tsId:null });
                            }
                        }
                    });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
                if (reportType == "course") {
                    $("input[id=radActive]:radio").prop('checked', true);                    
                    self.getCourse({ isActive: true });    
                    $("#divCourse").toggleClass("hide", false);
                    $("#divDiscipline").toggleClass("hide", true);
                } else {
                    $("#divCourse").toggleClass("hide", true);
                    $("#divDiscipline").toggleClass("hide", false);
                }

            });

            $('input[type=radio][name=courseType]').on('change', function (e) {

                $("#reportError").toggleClass("hide", true);
                var $el = $(e.target);
                var cType = $el.val();              
                self.getCourse({ isActive: cType =='act' });               
            });
            $("input[type=radio][name=entityType]").on("change", function (e) {
                var $el = $(e.target);
                entityType = $el.val();
                //var etyp = $("input[type=radio][name=entityType]").val();
                if (entityType === 'tc') {
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divTrainingSite").toggleClass("hide", true);
                }

                if (entityType === 'ts') {
                    $("#divTrainingCenter").toggleClass("hide", true);
                    $("#divTrainingSite").toggleClass("hide", false);
                }

            });

            $(document).ready(function () {
                reportType = 'course';
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=radActive]:radio").prop('checked', true);                
                $("#divCourse").toggleClass("hide", false);
                $("#divDiscipline").toggleClass("hide", true); 
                
                // $('#ddlRole').val($('#hdnSelectedRole').val()).trigger('change');
                setTimeout(function () { $('#ddlRole').val($('#hdnSelectedRole').val()).trigger('change'); }, 500);

                setTimeout(function () { $("#ddlReports option:contains(Survey Responses)").attr('selected', true); }, 500);
                // $("#ddlReports option:contains(Survey Responses)").attr('selected', true);
                // $("#ddlInstructorReports option:contains(Survey Responses)").attr('selected', true); 
                
                if (userRole == 'tcc' || userRole == 'tcadmin') { //(userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value)
                    // $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divTrainingSite").toggleClass("hide", true);
                }

                if (userRole == 'tsc' || userRole == 'tsadmin') {
                    // $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divTrainingSite").toggleClass("hide", false);
                    setTimeout(function () { $("#ddlSiteReports option:contains(Survey Responses)").attr('selected', true); }, 500);
                    // $("#ddlSiteReports option:contains(Survey Responses)").attr('selected', true);
                }
                if (userRole == 'instructor') {

                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divTrainingSite").toggleClass("hide", true);
                 //   $("#divInstructor").toggleClass("hide", true);
                    setTimeout(function () { $("#ddlInstructorReports option:contains(Survey Responses)").prop('selected', true);}, 500);
                 //   $("#ddlInstructorReports").val('IntlInstructorSurveyQuestionReport');
                    $("input[id=radTC]:radio").prop('checked', true);  
                } 
               
                $("#divInstructor").toggleClass("hide", true);
            });
        },

        loadReport: function (url, tcId, tsId, courseId, discipline, instructorId, startDate, endDate) {
            if ($('#ddlRole').val() == 'instructor') {
              //  entityType = $("input[type=radio][name=entityType]").val();
                if (entityType == 'ts')
                    tcId = 0;
                if (entityType == 'tc')
                    tsId = '';
            }
             

            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { tcId: tcId, tsId: tsId, instructorId: instructorId, courseId: courseId, discipline: discipline, startDate: startDate, endDate: endDate, entityType: entityType },

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "bInfo": false,
                        "pageLength": 25,
                        "order": [[0, "asc"]],
                        columnDefs: [
                           {
                               targets: [0],
                               visible: false
                           },
                        ]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Survey Response Report"),

                                    exportOptions: {
                                        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14,15]
                                    }
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        getSite: function (inputs) {
            $("#ddlTS").empty();
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] })); //window.resources["TextSelectTariningSite"]
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlTS").append(subItems);
                        $('#ddlTS').val('');
                    }
                    //self.getInstructor({ tcId: inputs.tcId, roleId: inputs.roleId });
                })
                 .error(function (err) {

                    $("#ddlTS").empty();
                     appCommon.showResponseError("reportError", "errlist", err);
                });
        },
        getRoleId: function (role) {
            if (role == 'tcc')
                return RoleType.TCC.value;
            else if (role == 'tcadmin') {
                return RoleType.TCAdmin.value;
            }
            else if (role == 'tsc') {
                return RoleType.TSC.value;
            }
            else if (role == 'tsadmin') {
                return RoleType.TSAdmin.value;
            }
            else
                return 0;
        },
        getInstructor: function (inputs) {
            var url = $("#ddlInstructor").data("url");
        
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlInstructor").empty().append(subItems);

                    }
                })

                .error(function (err) {
                    $("#ddlInstructor").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        getCourse: function (inputs) {
            var url = $("#ddlCourse").data("url");
            $("#ddlCourse").empty();
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var affiliationId = 1;
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.CourseId, text: item.AffiliationId == affiliationId ? item.Name + " (RCSA)" : item.Name }));
                            });
                        $("#ddlCourse").append(subItems).val('');

                    }
                })
                .error(function (err) {
                    $("#ddlCourse").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var tsId = $("#ddlTS option:selected").val();
            var courseId = $("#ddlCourse option:selected").val();
            var discipline = $("#ddlDiscipline option:selected").val();
            var instructorId = $("#ddlInstructor option:selected").val();

            if (reportType == "course") {
                discipline = null;
            }

            if (reportType == "discipline") {
                courseId = null;
            }

            if (validateRequest()) {
                self.loadReport(url, tcId, tsId, courseId, discipline, instructorId, startDate, endDate);
            }
        }
    }
};
var AppIntlTCScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

   var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
      //  var tsId = $("#ddlTS option:selected").val();

        var errorMsg = [];
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }
        
        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }
        if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
         }


        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;
    return {

        init: function () {
            var self = this;
            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("#ddlReports option:contains(Training Center Scores)").attr('selected', true);
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
            });
        },

        loadReport: function (url, tcId, startDate, endDate) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { tcId: tcId, startDate: startDate, endDate: endDate, groupBy: reportType },
                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Training Center Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        btnSearch_Click: function (isValidate) {

            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            if (validateRequest()) {
                self.loadReport(url,tcId, startDate, endDate);
            }
            

        }
    }
};
var AppSiteScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var tsId = $("#ddlTS option:selected").val();

        var instructors = $("#ddlInstructors option:selected").val();
        var userRole = $("#hdnRole").val();
        var errorMsg = [];
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
          }
 
        if (tsId === "") {
            errorMsg[errorMsg.length] = window.resources["TextTrainingSiteRequiredPleaseReview"];
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");
                       var tcId = $(e.target).val();
                       if (tcId > 0) {
                           var role = $('#ddlRole').val();
                           var roleid = self.getRoleId(role);
                           self.getSite({ tcId: tcId, roleId:roleid });
                         //  self.getInstructor({ tcId: tcId });
                       } else {
                           var subItems = [];
                           subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                           $('#ddlTS').empty().append(subItems).val('');
                       }
                   });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
                setTimeout(function () { $('#ddlRole').val($('#hdnSelectedRole').val()).trigger('change'); }, 500);
                // $("#ddlReports").prop('selectedIndex', 3);
                $('#ddlTC').val('');
                setTimeout(function () { $("#ddlReports option:contains(Training Site Scores)").attr('selected', true); }, 500);
                setTimeout(function () { $("#divSiteReports option:contains(Training Site Scores)").attr('selected', true); }, 500);
                // $("#ddlReports option:contains(Training Site Scores)").attr('selected', true);
                // $("#divSiteReports option:contains(Training Site Scores)").attr('selected', true);

                if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                //    $("#divTrainingCenter").toggleClass("hide", true);
                    var selectedRole = $('#ddlRole').val();
                    var roleid = self.getRoleId(selectedRole);
                    if ($('#hdnReport').val() != "instructor") {
                        $("#divLocation").toggleClass("hide", false);
                        self.getSite({ tcId: $("#hdnTcId").val(), roleId: roleid });
                    } else {
                        $("#divTcLocation").toggleClass("hide", true);
                        self.getInstructor({ tcId: $("#hdnTcId").val(), roleId: roleid  });

                    }
                }
                if (userRole == RoleType.EcardAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divLocation").toggleClass("hide", false);
                }
            });
        },

        loadReport: function (url, tcId, tsId, startDate, endDate) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { tcId: tcId, tsId: tsId, startDate: startDate, endDate: endDate, groupBy: reportType },

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Training Site Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }


                },
                error: function (errMsg) {
                    appCommon.showResponseError("reportError", "errlist", errMsg);
                }
            });
        },

        getSite: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    var subItems = [];
                    if (data && data.length > 0) {
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlTS").empty().append(subItems);
                        $('#ddlTS').val('');
                    }
                    else {
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                        $('#ddlTS').empty().append(subItems).val('');
                    }
                })
                .error(function (err) {
                    var subItems = [];
                    subItems.push($("<option/>", { value: '', text: window.resources["TextSelectTrainingSite"] }));
                    $('#ddlTS').empty().append(subItems).val('');                    
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },
        getRoleId: function (role) {
            if (role == 'tcc')
                return RoleType.TCC.value;
            else if (role == 'tcadmin') {
                return RoleType.TCAdmin.value;
            }
            else if (role == 'tsc') {
                return RoleType.TSC.value;
            }
            else if (role == 'tsadmin') {
                return RoleType.TSAdmin.value;
            }
            else
                return 0;
        },
        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var tsId = $("#ddlTS option:selected").val();
            if (validateRequest()) {
                self.loadReport(url, tcId, tsId, startDate, endDate);
            }


        }
    }
};
var AppLocationScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlLocation option:selected").val();
        var instructors = $("#ddlInstructors option:selected").val();
        var userRole = $("#hdnRole").val();
        var errorMsg = [];
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (userRole == RoleType.EcardAdmin.value) {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
        }


        if (locationId === "") {
            errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];

        }


       

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");
                       var tcId = $(e.target).val();
                       if (tcId > 0) {
                           self.getLocation({ tcId: tcId });
                           self.getInstructor({ tcId: tcId });
                       } else {
                           //  $("#divLocation").toggleClass("hide", true);
                       }
                   });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");

                // $("#ddlReports").prop('selectedIndex', 3);
             
                $("#ddlReports option:contains(eCard Location Scores)").attr('selected', true);

                if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", true);

                    if ($('#hdnReport').val() != "instructor") {
                        $("#divLocation").toggleClass("hide", false);
                        self.getLocation({ tcId: $("#hdnTcId").val() });
                    } else {
                        $("#divTcLocation").toggleClass("hide", true);
                        self.getInstructor({ tcId: $("#hdnTcId").val() });

                    }
                }
                if (userRole == RoleType.EcardAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divLocation").toggleClass("hide", false);
                }
            });
        },

        loadReport: function (url, tcId, locationId, startDate, endDate) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { tcId: tcId, locationId: locationId, startDate: startDate, endDate: endDate, groupBy: reportType },

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Location Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }


                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        getLocation: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var locationId = $("#ddlLocation option:selected").val();
            if (validateRequest()) {
                self.loadReport(url, tcId, locationId, startDate, endDate);
            }


        }
    }
};
var AppReclaimReport = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    
    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlLocation option:selected").val();
        var userRole = $("#hdnRole").val();
        var errorMsg = [];

        if (isValidate) {

            if (!startDate || !endDate) {
                errorMsg[errorMsg.length] = window.resources["TextDateOfReclaimRequired"];
            }
            
            if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
                errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateOfReclaim"]);
            }

            if (userRole == RoleType.EcardAdmin.value) {

                if (tcId === "") {
                    errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
                }

                if (locationId === "") {
                    errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
                }
            }
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }

        return true;
    }


    return {

        init: function () {
            var self = this;
            $("input[id=course]:radio").prop("checked", true);
            $(document)
              .ready(function () {
                  self.getReport(false);
              });
            
            $("#ddlTC")
                .on("change",
                    function (e) {
                        var $el = $(e.target);
                        var trainingCenterId = $el.val();
                        if (trainingCenterId > 0) {
                            $("#divLocation").toggleClass("hide", false);
                        } else {
                            $("#divLocation").toggleClass("hide", true);
                        }

                        self.getLocation({ TcId: trainingCenterId });
                    });

            self.displayControl();

            $(document).ready(function () {
                //$("#ddlReports").prop('selectedIndex', 5);
                $("#ddlReports option:contains(Reclaims)").attr('selected', true);
            });

        },

        getLocation: function (inputs) {
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        displayControl: function () {
            var self = this;

            var userRole = $("#hdnRole").val();
            if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                $("#divLocation").toggleClass("hide", true);
                $("#divTrainingCenter").toggleClass("hide", true);
            } else if (userRole == RoleType.EcardAdmin.value) {
                $("#divTrainingCenter").toggleClass("hide", false);

            }
        },

        loadReport: function (url) {
            var self = this;

            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var locationId = $("#ddlLocation option:selected").val();
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { startDate: startDate, endDate: endDate, tcId: tcId, locationId: locationId },

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[1, "desc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                'excelHtml5'
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                  

                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        getReport: function (isValidate) {

            var self = this;
            var url = $("#btnSubmit").data("url");
            if (validateRequest(isValidate)) {
                self.loadReport(url);
            }
        }
    }
};
var AppReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });
    return {

        init: function () {
            var self = this;
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });
        }
    }
}


$("#ddlReports")
    .on("change",
        function (e) {
            var url = $(this).val();
            if (url != null && url != '') {
                var report = "";
                var role = "";
                if ($("#ddlInstructorReports").val() != "") {
                    report = $("#ddlInstructorReports option:selected").text();
                }     
                if ($("#ddlReports").val() != "") {
                    report = $("#ddlReports option:selected").text();
                }  
                if ($("#ddlRole").val() != null) {
                    role = $("#ddlRole").val();
                }
                window.location.href = url + "?role=" + role + "&report=" + report
            }
        });

$("#ddlInstructorReports")
    .on("change",
        function (e) {
            var url = $(this).val();
            var report = "";
            var role = "";
            if ($("#ddlInstructorReports").val() != "") {
                report = $("#ddlInstructorReports option:selected").text();
            }

            if ($("#ddlRole").val() != null) {
                role = $("#ddlRole").val();
            }

            if (url != null && url != '') {
                window.location.href = url + "?role=" + role + "&report=" + report;
            }
        });
 $("#ddlSiteReports")
    .on("change",
        function (e) {
            var url = $(this).val();
            var report = "";
            var role = "";
            if ($("#ddlSiteReports").val() != "") {
                report = $("#ddlSiteReports option:selected").text();
            }

            if ($("#ddlRole").val() != null) {
                role = $("#ddlRole").val();
            }

            if (url != null && url != '') {
                window.location.href = url + "?role=" + role + "&report=" + report;
            }
        }); 

$("#divRole")
   .on("change",
       function (e) {
           var $el = $(e.target);
           var role = $el.val();
           $("#ddlReports").val("");
           $("#ddlInstructorReports").val("");
           $("#ddlSiteReports").val("");

           if (role == "instructor") {
               $("#divReports").toggleClass("hide", true);
               $("#divInstructorReports").toggleClass("hide", false);
               $("#divSiteReports").toggleClass("hide", true);
           }
           else if (role == "tsc" || role == "tsadmin") {
               $("#divSiteReports").toggleClass("hide", false);
               $("#divReports").toggleClass("hide", true);
               $("#divInstructorReports").toggleClass("hide", true);
               
           }
           else {
               $("#divReports").toggleClass("hide", false);
               $("#divInstructorReports").toggleClass("hide", true);
               $("#divSiteReports").toggleClass("hide", true);
           }

       });


function GetQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

$(document).ready(function () {
    var role = GetQueryStringParams("role");
    if (role != null) {
        $("#ddlRole").val(role);
    }

    if (role == "instructor") {
        var report = GetQueryStringParams("report").replace("%20", " ");
        $("#ddlInstructorReports option:contains(" + report + ")").attr('selected', true);
         $("#divReports").toggleClass("hide", true);
        $("#divInstructorReports").toggleClass("hide", false);
    } else {
        $("#divReports").toggleClass("hide", false);
        $("#divInstructorReports").toggleClass("hide", true);
    }

});;
var AppSurveyQuestionReport = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

    var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();
        var tcId = $("#ddlTC option:selected").val();
        var locationId = $("#ddlLocation option:selected").val();
        var instructors = $("#ddlInstructor option:selected").val();
        var courseId = $("#ddlCourse option:selected").val();
        var discipline = $("#ddlDiscipline option:selected").val();
        var userRole = $("#hdnRole").val();
        var errorMsg = [];

        if (reportType == "course") {
            if (courseId === "") {
                errorMsg[errorMsg.length] = window.resources["TextCourseRequired"];
            }
        }
       
        if (reportType == "discipline") {
            if (discipline === "") {
                errorMsg[errorMsg.length] = window.resources["TextDisciplineRequired"];
            }
        }

        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }

        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (userRole == RoleType.EcardAdmin.value) {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }

            if (locationId === "") {
                errorMsg[errorMsg.length] = window.resources["TextLocationRequired"];
            }
        }


        if (userRole == RoleType.Instructor.value) {
            if (tcId === "") {
                errorMsg[errorMsg.length] = window.resources["TextTrainingCenterRequired"];
            }
         
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;

    return {

        init: function () {
            var self = this;


            var userRole = $("#hdnRole").val();
            //$("#ddlReports")
            //    .on("change",
            //        function (e) {
            //            var url = $(this).val();
            //            if (url != null && url != '') {
            //                window.location.href = url;
            //            }
            //        });


            $("#ddlTC")
               .on("change",
                   function (e) {
                       var url = $(e.target).data("url");
                       var tcId = $(e.target).val();
                       if (userRole == RoleType.EcardAdmin.value) {
                           if (tcId > 0) {
                               self.getLocation({ tcId: tcId });
                               self.getInstructor({ tcId: tcId });
                           } else {
                               //  $("#divLocation").toggleClass("hide", true);
                           }
                       }
                   });

            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
                if (reportType == "course") {
                    $("input[id=radActive]:radio").prop('checked', true);                    
                    self.getCourse({ isActive: true });    
                    $("#divCourse").toggleClass("hide", false);
                    $("#divDiscipline").toggleClass("hide", true);
                } else {
                    $("#divCourse").toggleClass("hide", true);
                    $("#divDiscipline").toggleClass("hide", false);
                }

            });

            $('input[type=radio][name=courseType]').on('change', function (e) {

                $("#reportError").toggleClass("hide", true);
                var $el = $(e.target);
                var cType = $el.val();              
                self.getCourse({ isActive: cType =='act' });               
            });

            $(document).ready(function () {
                reportType = 'course';
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=radActive]:radio").prop('checked', true);                
                $("#divCourse").toggleClass("hide", false);
                $("#divDiscipline").toggleClass("hide", true);                

                $("#ddlReports option:contains(Location Survey Responses)").attr('selected', true);

                if (userRole == RoleType.TCC.value || userRole == RoleType.TCAdmin.value) {
                    $("#divTrainingCenter").toggleClass("hide", true);
                }
                if (userRole == RoleType.EcardAdmin.value) {
                    $("#spnRequired").toggleClass("hide", false);
                    $("#ddlLocation").attr("aria-required", true);
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divLocation").toggleClass("hide", false);
                }

                if (userRole == RoleType.Instructor.value) {
                    
                    $("#divTrainingCenter").toggleClass("hide", false);
                    $("#divLocation").toggleClass("hide", true);
                    $("#divInstructor").toggleClass("hide", true);
                    
                }                
            });
        },

        loadReport: function (url, tcId, locationId, courseId, discipline, instructorId, startDate, endDate) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { tcId: tcId, locationId: locationId, instructorId: instructorId, courseId: courseId, discipline: discipline, startDate: startDate, endDate: endDate },

                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "bInfo": false,
                        "pageLength": 25,
                        "order": [[0, "asc"]],
                        columnDefs: [
                           {
                               targets: [0],
                               visible: false
                           },
                        ]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Survey Response Report"),

                                    exportOptions: {
                                        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14,15]
                                    }
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        getLocation: function (inputs) {
         
            var url = $("#ddlTC").data("url");
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelecteCardLocation"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlLocation").empty().append(subItems);
                        $('#ddlLocation').val('');
                    }
                })

                .error(function (err) {

                    $("#ddlLocation").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getInstructor: function (inputs) {
            var url = $("#ddlInstructor").data("url");
        
            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["TextSelectInstructor"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.Id, text: item.Name }));
                            });
                        $("#ddlInstructor").empty().append(subItems);

                    }
                })

                .error(function (err) {
                    $("#ddlInstructor").empty();
                    appCommon.showResponseError("assignError", "errlist", err);
                });
        },

        getCourse: function (inputs) {
            var url = $("#ddlCourse").data("url");

            jQuery.get(url, inputs,
                function (data) {
                    if (data && data.length > 0) {
                        var subItems = [];
                        subItems.push($("<option/>", { value: '', text: window.resources["SelectCourse"] }));
                        $.each(data,
                            function (index, item) {
                                subItems.push($("<option/>", { value: item.CourseId, text: item.Name }));
                            });
                        $("#ddlCourse").empty().append(subItems).val('');

                    }
                })
                .error(function (err) {
                    $("#ddlCourse").empty();
                    appCommon.showResponseError("reportError", "errlist", err);
                });
        },

        btnSearch_Click: function (isValidate) {
            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();
            var tcId = $("#ddlTC option:selected").val();
            var locationId = $("#ddlLocation option:selected").val();
            var courseId = $("#ddlCourse option:selected").val();
            var discipline = $("#ddlDiscipline option:selected").val();
            var instructorId = $("#ddlInstructor option:selected").val();

            if (reportType == "course") {
                discipline = null;
            }

            if (reportType == "discipline") {
                courseId = null;
            }

            if (validateRequest()) {
                self.loadReport(url, tcId, locationId, courseId, discipline, instructorId, startDate, endDate);
            }
        }
    }
};
var AppScoreReports = function () {
    $.ajaxSetup({
        async: true,
        cache: false
    });

   var appCommon = new AppCommon();

    var validateRequest = function (isValidate) {
        $("#reportError").html("");
        $("#reportError").addClass("hide");

        var startDate = $("#reportForm").find('input[id="StartDate"]').val();
        var endDate = $("#reportForm").find('input[id="EndDate"]').val();

        var errorMsg = [];
        if (!startDate || !endDate) {
            errorMsg[errorMsg.length] = window.resources["TextDateRangeRequired"];
        }
        
        if ((startDate || endDate) && !appCommon.isValidDate(startDate, endDate)) {
            errorMsg[errorMsg.length] = appCommon.getDateFormatError(window.resources["DateRange"]);
        }

        if (errorMsg.length > 0) {
            appCommon.showResponseError("reportError", "errlist", errorMsg);
            return false;
        }
        return true;
    }
    var reportType;
    return {

        init: function () {
            var self = this;
            $("input[type=radio][name=reportType]").on("change", function (e) {
                var $el = $(e.target);
                reportType = $el.val();
            });

            $(document).ready(function () {
                $("#ddlReports option:contains(Training Center Scores)").attr('selected', true);
                $("input[id=course]:radio").prop("checked", true);
                $("input[id=course]:radio").trigger("change");
            });
        },

        loadReport: function (url, startDate, endDate) {
            jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: { startDate: startDate, endDate: endDate, groupBy: reportType },
                success: function (result) {
                    $("#reportData").html(result);
                    var table = $("#example").DataTable({
                        "pageLength": 25,
                        "order": [[0, "asc"]]
                    });

                    if (table.context.length > 0) {
                        var buttons = new $.fn.dataTable.Buttons(table,
                        {
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    title: appCommon.getFileName("Training Center Score Report")
                                }
                            ]
                        });
                        $("#expotbutton").prepend(buttons.container())
                       .find("a.dt-button").addClass("btn btn-primary")
                       .text(window.resources["TextDownload"]);
                        appCommon.focusArea("#reportData");
                    }
                },
                error: function (errMsg) {
                    appCommon.showResponseError("assignError", "errlist", errMsg);
                }
            });
        },

        btnSearch_Click: function (isValidate) {

            var self = this;
            var url = $("#btnSearch").data("url");
            var startDate = $("#reportForm").find('input[id="StartDate"]').val();
            var endDate = $("#reportForm").find('input[id="EndDate"]').val();

            if (validateRequest()) {
                self.loadReport(url, startDate, endDate);
            }
            

        }
    }
};
