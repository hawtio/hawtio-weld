/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../libs/hawtio-utilities/defs.d.ts"/>

/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../../includes.ts"/>
var Weld;
(function (Weld) {
    Weld.pluginName = "hawtio-weld";
    Weld.log = Logger.get(Weld.pluginName);
    Weld.templatePath = "plugins/weld/html";
})(Weld || (Weld = {}));

/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../../includes.ts"/>
/// <reference path="globals.ts"/>
var Weld;
(function (Weld) {
    Weld.module = angular.module(Weld.pluginName, ['ui.bootstrap', 'ui.grid']);
    var tab = undefined;
    Weld.module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider",
        function ($locationProvider, $routeProvider, builder) {
            tab = builder.create()
                .id(Weld.pluginName)
                .title(function () { return "Weld"; })
                .href(function () { return "/weld"; })
                .subPath("Page", "page", builder.join(Weld.templatePath, "page.html"))
                .subPath("Archives", "archives", builder.join(Weld.templatePath, "archives.html"))
                .subPath("Beans", "beans", builder.join(Weld.templatePath, "beans.html"))
                .build();
            builder.configureRouting($routeProvider, tab);
            $locationProvider.html5Mode(true);
        }]);
    Weld.module.run(["HawtioNav", "jolokia", function (HawtioNav, jolokia) {
            HawtioNav.add(tab);
            Weld.log.debug("loaded");
            jolokia.request({
                type: 'search',
                mbean: 'org.jboss.weld.probe:*,type=JsonData'
            }, Core.onSuccess(function (response) {
                Weld.containers = response.value;
                Weld.log.debug('containers MBeans: ', Weld.containers);
            }));
        }]);
    hawtioPluginLoader.addModule(Weld.pluginName);
})(Weld || (Weld = {}));

/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../../includes.ts"/>
/// <reference path="plugin.ts"/>
var Weld;
(function (Weld) {
    Weld.module.controller("Weld.ArchivesController", ["$scope", "$location", "jolokia", function ($scope, $location, jolokia) {
            $scope.archives = [];
            $scope.hideAddBda = true;
            var columns = [
                {
                    field: 'bdaId',
                    displayName: 'Identifier',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                },
                {
                    field: 'beans',
                    displayName: 'Beans',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                },
                {
                    field: 'beanDiscoveryMode',
                    displayName: 'Bean Discovery Mode',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                }
            ];
            $scope.gridOptions = {
                data: 'archives',
                displayFooter: true,
                displaySelectionCheckbox: false,
                multiSelect: false,
                canSelectRows: false,
                enableSorting: true,
                columnDefs: columns,
                selectedItems: [],
                filterOptions: {
                    filterText: ''
                }
            };
            jolokia.request({
                type: 'exec',
                mbean: Weld.containers[0],
                operation: 'receiveDeployment'
            }, Core.onSuccess(function (response) {
                Weld.log.info('archives: ', JSON.parse(response.value).bdas);
                $scope.archives = JSON.parse(response.value).bdas;
                Core.$apply($scope);
            }));
        }]);
})(Weld || (Weld = {}));

/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../../includes.ts"/>
/// <reference path="plugin.ts"/>
var Weld;
(function (Weld) {
    Weld.module.controller("Weld.BeansController", ["$scope", "$location", "jolokia", function ($scope, $location, jolokia) {
            $scope.beans = [];
            $scope.pageIndex = 1;
            $scope.pageSize = 20;
            var columns = [
                {
                    field: 'beanClass',
                    displayName: 'Bean class',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                },
                {
                    field: 'types',
                    displayName: 'Bean types',
                    cellFilter: null,
                    width: "*",
                    resizable: true,
                    cellTemplate: '<div class="ui-grid-cell-contents"><ul class="plain-list"><li ng-repeat="type in row.entity.types"><code ng-bind-html="grid.appScope.abbreviateType(type, true, false, false)"</code></li></ul></div>'
                },
                {
                    field: 'scope',
                    displayName: 'Scope',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                },
                {
                    field: 'qualifiers',
                    displayName: 'Qualifiers',
                    cellFilter: null,
                    width: "*",
                    resizable: true
                }
            ];
            $scope.gridOptions = {
                data: 'beans',
                displayFooter: true,
                displaySelectionCheckbox: false,
                multiSelect: false,
                canSelectRows: false,
                enableSorting: false,
                columnDefs: columns,
                selectedItems: [],
                filterOptions: {
                    filterText: ''
                }
            };
            $scope.updateTable = function () {
                jolokia.request({
                    type: 'exec',
                    mbean: Weld.containers[0],
                    operation: 'receiveBeans',
                    arguments: [$scope.pageIndex, $scope.pageSize, '', 'FULL']
                }, Core.onSuccess(function (response) {
                    var value = JSON.parse(response.value);
                    $scope.pageIndex = value.page;
                    $scope.pageTotal = value.total;
                    $scope.beans = value.data.map(function (bean) { return JSON.parse(bean); });
                    Core.$apply($scope);
                }));
            };
            $scope.abbreviateType = function (type, htmlOutput, title, skipIcon) {
                var parts = type.split('.');
                var ret = '';
                var lastIdx = parts.length - 1;
                if (htmlOutput && title) {
                    ret += ' <span title="' + type + '">';
                }
                for (var i = 0; i < parts.length; i++) {
                    if (i === lastIdx) {
                        ret += parts[i];
                    }
                    else {
                        if (i === 0 && htmlOutput) {
                            ret += '<span class="abbreviated">';
                        }
                        ret += parts[i].charAt(0);
                        ret += '.';
                        if (i === (lastIdx - 1) && htmlOutput) {
                            ret += '</span>';
                        }
                    }
                }
                if (htmlOutput) {
                    if (title) {
                        ret += '</span>';
                    }
                    if (!skipIcon) {
                        ret += ' <i class="fa fa-compress abbreviated"></i>';
                    }
                }
                return ret;
            };
            $scope.updateTable();
        }]);
})(Weld || (Weld = {}));

/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
/// <reference path="../../includes.ts"/>
/// <reference path="plugin.ts"/>
var Weld;
(function (Weld) {
    Weld.module.controller("Weld.ContainersController", ["$scope", "$location", function ($scope, $location) {
            $scope.containers = Weld.containers;
        }]);
})(Weld || (Weld = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2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QywyQkFBMkIsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBQyxNQUFNLEVBQUUsU0FBUztZQUNyRixNQUFNLENBQUMsVUFBVSxHQUFHLGVBQVUsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRVIsQ0FBQyxFQU5NLElBQUksS0FBSixJQUFJLFFBTVYiLCJmaWxlIjoiY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2xpYnMvaGF3dGlvLXV0aWxpdGllcy9kZWZzLmQudHNcIi8+XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBwbHVnaW5OYW1lID0gXCJoYXd0aW8td2VsZFwiO1xuXG4gICAgZXhwb3J0IHZhciBsb2c6TG9nZ2luZy5Mb2dnZXIgPSBMb2dnZXIuZ2V0KHBsdWdpbk5hbWUpO1xuXG4gICAgZXhwb3J0IHZhciB0ZW1wbGF0ZVBhdGggPSBcInBsdWdpbnMvd2VsZC9odG1sXCI7XG5cbiAgICBleHBvcnQgdmFyIGNvbnRhaW5lcnM6QXJyYXk8c3RyaW5nPjtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2xvYmFscy50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShXZWxkLnBsdWdpbk5hbWUsIFsndWkuYm9vdHN0cmFwJywgJ3VpLmdyaWQnXSk7XG5cbiAgICB2YXIgdGFiID0gdW5kZWZpbmVkO1xuXG4gICAgbW9kdWxlLmNvbmZpZyhbXCIkbG9jYXRpb25Qcm92aWRlclwiLCBcIiRyb3V0ZVByb3ZpZGVyXCIsIFwiSGF3dGlvTmF2QnVpbGRlclByb3ZpZGVyXCIsXG4gICAgICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXI6bmcucm91dGUuSVJvdXRlUHJvdmlkZXIsIGJ1aWxkZXI6SGF3dGlvTWFpbk5hdi5CdWlsZGVyRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgdGFiID0gYnVpbGRlci5jcmVhdGUoKVxuICAgICAgICAgICAgICAgIC5pZChXZWxkLnBsdWdpbk5hbWUpXG4gICAgICAgICAgICAgICAgLnRpdGxlKCgpID0+IFwiV2VsZFwiKVxuICAgICAgICAgICAgICAgIC5ocmVmKCgpID0+IFwiL3dlbGRcIilcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIlBhZ2VcIiwgXCJwYWdlXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJwYWdlLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJBcmNoaXZlc1wiLCBcImFyY2hpdmVzXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJhcmNoaXZlcy5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiQmVhbnNcIiwgXCJiZWFuc1wiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwiYmVhbnMuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcbiAgICAgICAgICAgIGJ1aWxkZXIuY29uZmlndXJlUm91dGluZygkcm91dGVQcm92aWRlciwgdGFiKTtcbiAgICAgICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAgICAgfV0pO1xuXG4gICAgbW9kdWxlLnJ1bihbXCJIYXd0aW9OYXZcIiwgXCJqb2xva2lhXCIsIChIYXd0aW9OYXY6SGF3dGlvTWFpbk5hdi5SZWdpc3RyeSwgam9sb2tpYSkgPT4ge1xuICAgICAgICBIYXd0aW9OYXYuYWRkKHRhYik7XG4gICAgICAgIGxvZy5kZWJ1ZyhcImxvYWRlZFwiKTtcblxuICAgICAgICBqb2xva2lhLnJlcXVlc3Qoe1xuICAgICAgICAgICAgdHlwZTogJ3NlYXJjaCcsXG4gICAgICAgICAgICBtYmVhbjogJ29yZy5qYm9zcy53ZWxkLnByb2JlOiosdHlwZT1Kc29uRGF0YSdcbiAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29udGFpbmVycyA9IHJlc3BvbnNlLnZhbHVlO1xuICAgICAgICAgICAgbG9nLmRlYnVnKCdjb250YWluZXJzIE1CZWFuczogJywgY29udGFpbmVycyk7XG4gICAgICAgIH0pKTtcbiAgICB9XSk7XG5cbiAgICBoYXd0aW9QbHVnaW5Mb2FkZXIuYWRkTW9kdWxlKFdlbGQucGx1Z2luTmFtZSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkFyY2hpdmVzQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgXCJqb2xva2lhXCIsICgkc2NvcGUsICRsb2NhdGlvbiwgam9sb2tpYSkgPT4ge1xuICAgICAgICAkc2NvcGUuYXJjaGl2ZXMgPSBbXTtcbiAgICAgICAgJHNjb3BlLmhpZGVBZGRCZGEgPSB0cnVlO1xuXG4gICAgICAgIHZhciBjb2x1bW5zOmFueVtdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmRhSWQnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnSWRlbnRpZmllcicsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbnMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbnMnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JlYW5EaXNjb3ZlcnlNb2RlJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW4gRGlzY292ZXJ5IE1vZGUnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgICRzY29wZS5ncmlkT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRhdGE6ICdhcmNoaXZlcycsXG4gICAgICAgICAgICBkaXNwbGF5Rm9vdGVyOiB0cnVlLFxuICAgICAgICAgICAgZGlzcGxheVNlbGVjdGlvbkNoZWNrYm94OiBmYWxzZSxcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhblNlbGVjdFJvd3M6IGZhbHNlLFxuICAgICAgICAgICAgZW5hYmxlU29ydGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGNvbHVtbkRlZnM6IGNvbHVtbnMsXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zOiBbXSxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJUZXh0OiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiAnZXhlYycsXG4gICAgICAgICAgICBtYmVhbjogY29udGFpbmVyc1swXSxcbiAgICAgICAgICAgIG9wZXJhdGlvbjogJ3JlY2VpdmVEZXBsb3ltZW50J1xuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBsb2cuaW5mbygnYXJjaGl2ZXM6ICcsIEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmJkYXMpO1xuICAgICAgICAgICAgJHNjb3BlLmFyY2hpdmVzID0gSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSkuYmRhcztcbiAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgIH0pKTtcblxuICAgIH1dKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQmVhbnNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCBcImpvbG9raWFcIiwgKCRzY29wZSwgJGxvY2F0aW9uLCBqb2xva2lhKSA9PiB7XG4gICAgICAgICRzY29wZS5iZWFucyA9IFtdO1xuICAgICAgICAkc2NvcGUucGFnZUluZGV4ID0gMTtcbiAgICAgICAgJHNjb3BlLnBhZ2VTaXplID0gMjA7XG5cbiAgICAgICAgdmFyIGNvbHVtbnM6YW55W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFuQ2xhc3MnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiBjbGFzcycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAndHlwZXMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiB0eXBlcycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNlbGxUZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ1aS1ncmlkLWNlbGwtY29udGVudHNcIj48dWwgY2xhc3M9XCJwbGFpbi1saXN0XCI+PGxpIG5nLXJlcGVhdD1cInR5cGUgaW4gcm93LmVudGl0eS50eXBlc1wiPjxjb2RlIG5nLWJpbmQtaHRtbD1cImdyaWQuYXBwU2NvcGUuYWJicmV2aWF0ZVR5cGUodHlwZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlKVwiPC9jb2RlPjwvbGk+PC91bD48L2Rpdj4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NvcGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnU2NvcGUnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3F1YWxpZmllcnMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUXVhbGlmaWVycycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2JlYW5zJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbHVtbkRlZnM6IGNvbHVtbnMsXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zOiBbXSxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJUZXh0OiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS51cGRhdGVUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2V4ZWMnLFxuICAgICAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ3JlY2VpdmVCZWFucycsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiBbJHNjb3BlLnBhZ2VJbmRleCwgJHNjb3BlLnBhZ2VTaXplLCAnJywgJ0ZVTEwnXVxuICAgICAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlSW5kZXggPSB2YWx1ZS5wYWdlO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlVG90YWwgPSB2YWx1ZS50b3RhbDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmVhbnMgPSB2YWx1ZS5kYXRhLm1hcChiZWFuID0+IEpTT04ucGFyc2UoYmVhbikpO1xuICAgICAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmFiYnJldmlhdGVUeXBlID0gZnVuY3Rpb24gKHR5cGUsIGh0bWxPdXRwdXQsIHRpdGxlLCBza2lwSWNvbikge1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gdHlwZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgdmFyIHJldCA9ICcnO1xuICAgICAgICAgICAgdmFyIGxhc3RJZHggPSBwYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgaWYgKGh0bWxPdXRwdXQgJiYgdGl0bGUpIHtcbiAgICAgICAgICAgICAgICByZXQgKz0gJyA8c3BhbiB0aXRsZT1cIicgKyB0eXBlICsgJ1wiPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IGxhc3RJZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0ICs9IHBhcnRzW2ldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSAwICYmIGh0bWxPdXRwdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldCArPSAnPHNwYW4gY2xhc3M9XCJhYmJyZXZpYXRlZFwiPic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0ICs9IHBhcnRzW2ldLmNoYXJBdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0ICs9ICcuJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IChsYXN0SWR4IC0gMSkgJiYgaHRtbE91dHB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0ICs9ICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChodG1sT3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldCArPSAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc2tpcEljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0ICs9ICcgPGkgY2xhc3M9XCJmYSBmYS1jb21wcmVzcyBhYmJyZXZpYXRlZFwiPjwvaT4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnVwZGF0ZVRhYmxlKCk7XG4gICAgfV0pO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5Db250YWluZXJzQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgKCRzY29wZSwgJGxvY2F0aW9uKSA9PiB7XG4gICAgICAgICRzY29wZS5jb250YWluZXJzID0gY29udGFpbmVycztcbiAgICB9XSk7XG5cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-2 form-control-like pull-left\">Total Found: {{pageTotal}} </div>\n        <pagination class=\"col-md-8\" style=\"margin: 0\"\n                    items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\"></pagination>\n        <button class=\"col-md-2 btn btn-default\">Clear filters</button>\n    </div>\n\n    <div class=\"row-fluid\">\n        <div id=\"grid\" ui-grid=\"gridOptions\" class=\"col-md-12\"></div>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");