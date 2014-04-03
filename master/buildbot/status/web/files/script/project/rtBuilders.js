define(['jquery', 'realtimePages', 'helpers', 'dataTables', 'mustache', 'libs/jquery.form', 'text!templates/builders.mustache'], function ($, realtimePages, helpers, dt, mustache, form, builders) {
    "use strict";
    var rtBuilders;
    var tbsorter = undefined;
    rtBuilders = {
        init: function () {
            tbsorter = rtBuilders.dataTableInit($('.builders-table'));
            var realtimeFunctions = realtimePages.defaultRealtimeFunctions();
            realtimeFunctions['builders'] = rtBuilders.realtimeFunctionsProcessBuilders;
            realtimePages.initRealtime(realtimeFunctions);

            // insert codebase and branch on the builders page
            var $dtWTop = $('.dataTables_wrapper .top');
            if (window.location.search != '') {
                // Parse the url and insert current codebases and branches
                helpers.codeBaseBranchOverview($dtWTop);
            }
        },
        realtimeFunctionsProcessBuilders: function (data) {
            tbsorter.fnClearTable();
            try {
                tbsorter.fnAddData(data.builders);
            }
            catch (err) {
            }
        },
        dataTableInit: function ($tableElem) {
            var options = {};

            options.aoColumns = [
                { "mData": null },
                { "mData": null },
                { "mData": null },
                { "mData": null },
                { "mData": null, 'bSortable': false }
            ];

            options.aoColumnDefs = [
                {
                    "aTargets": [ 0 ],
                    "sClass": "txt-align-left",
                    "mRender": function (data, full, type) {
                        var urlParams = helpers.codebasesFromURL({});
                        var ret = [];
                        $.each(urlParams, function(i, d){
                            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(urlParams[d]));
                        });
                        var paramsString = ret.join("&");
                        return mustache.render(builders, {name: type.name, friendly_name: type.friendly_name, builderParam: paramsString});
                    }
                },
                {
                    "aTargets": [ 1 ],
                    "sClass": "txt-align-left",
                    "mRender": function (data, full, type) {
                        var noJobs = false;
                        if ((type.pendingBuilds === undefined || type.pendingBuilds == 0) &&
                            (type.currentBuilds === undefined || type.currentBuilds == 0)) {
                            noJobs = true;
                        }
                        return mustache.render(builders, {showNoJobs: noJobs, pendingBuilds: type.pendingBuilds, currentBuilds: type.currentBuilds, builderName: type.name, projects: type.project});
                    },
                    "fnCreatedCell": function (nTd, sData, oData) {
                        if (oData.currentBuilds != undefined) {
                            helpers.delegateToProgressBar($(nTd).find('.percent-outer-js'));
                        }
                    }
                },
                {
                    "aTargets": [ 2 ],
                    "sClass": "txt-align-left last-build-js",
                    "mRender": function (data, full, type) {
                        return mustache.render(builders, {showLatestBuild: true, latestBuild: type.latestBuild});
                    },
                    "fnCreatedCell": function (nTd, sData, oData) {
                        if (oData.latestBuild != undefined) {
                            helpers.startCounterTimeago($(nTd).find('.last-run'), oData.latestBuild.times[1]);
                            var time = helpers.getTime(oData.latestBuild.times[0], oData.latestBuild.times[1]).trim();
                            $(nTd).find('.small-txt').html('(' + time + ')');
                            $(nTd).find('.hidden-date-js').html(oData.latestBuild.times[1]);
                        }
                    }
                },
                {
                    "aTargets": [ 3 ],
                    "mRender": function (data, full, type) {
                        return mustache.render(builders, {showStatus: true, latestBuild: type.latestBuild});
                    }, "fnCreatedCell": function (nTd, sData, oData) {
                    var lb = oData.latestBuild === undefined ? '' : oData.latestBuild;
                    $(nTd).removeClass().addClass(lb.results_text);
                }
                },
                {
                    "aTargets": [ 4 ],
                    "mRender": function (data, full, type) {
                        var builderUrl = location.protocol + "//" + location.host;
                        return mustache.render(builders, {customBuild: true, builderUrlShow: builderUrl, project: type.project, builderName: type.name});
                    }
                }
            ];

            return dt.initTable($tableElem, options);
        }
    };

    return rtBuilders;
});