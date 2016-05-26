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
                    resizable: true,
                    cellTemplate: '<div class="ui-grid-cell-contents"><code ng-bind-html="grid.appScope.abbreviate(row.entity.beanClass, 35)"></code></div>'
                },
                {
                    field: 'types',
                    displayName: 'Bean types',
                    cellFilter: null,
                    width: "*",
                    resizable: true,
                    cellTemplate: '<div class="ui-grid-cell-contents"><ul class="plain-list"><li ng-repeat="type in row.entity.types"><code ng-bind-html="grid.appScope.abbreviate(type, 35)"></code></li></ul></div>'
                },
                {
                    field: 'scope',
                    displayName: 'Scope',
                    cellFilter: null,
                    width: "*",
                    resizable: true,
                    cellTemplate: '<div class="ui-grid-cell-contents"><code ng-bind-html="grid.appScope.abbreviate(row.entity.scope, 35)"></code></div>'
                },
                {
                    field: 'qualifiers',
                    displayName: 'Qualifiers',
                    cellFilter: null,
                    width: "*",
                    resizable: true,
                    cellTemplate: '<div class="ui-grid-cell-contents"><ul class="plain-list"><li ng-repeat="qualifier in row.entity.qualifiers"><code ng-bind-html="grid.appScope.abbreviate(qualifier, 35)"></code></li></ul></div>'
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
            $scope.abbreviate = function (type, size, title, icon) {
                if (title === void 0) { title = true; }
                if (icon === void 0) { icon = true; }
                if (type.length < size) {
                    return type;
                }
                return ''.concat(title ? '<span title="' + type + '">' : '', type.charAt(0) === '@' ? '@' : '', '<span class="abbreviated">', type.substring(type.charAt(0) === '@' ? 1 : 0, type.lastIndexOf('.')).split('.')
                    .reduce(function (result, part) { return result + part.charAt(0) + '.'; }, ''), '</span>', type.substr(type.lastIndexOf('.') + 1), title ? '</span>' : '', icon ? ' <i class="fa fa-compress abbreviated"></i>' : '');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2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O3FCQUMzRSxNQUFNLENBQUMsVUFBQyxNQUFNLEVBQUUsSUFBSSxJQUFLLE9BQUEsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUE3QixDQUE2QixFQUFFLEVBQUUsQ0FBQyxFQUNoRSxTQUFTLEVBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUN0QyxLQUFLLEdBQUcsU0FBUyxHQUFHLEVBQUUsRUFDdEIsSUFBSSxHQUFHLDZDQUE2QyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQztZQUVGLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxFQXpGTSxJQUFJLEtBQUosSUFBSSxRQXlGVjs7QUMzR0QsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsaUNBQWlDO0FBRWpDLElBQU8sSUFBSSxDQU1WO0FBTkQsV0FBTyxJQUFJLEVBQUMsQ0FBQztJQUVULFdBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQUMsTUFBTSxFQUFFLFNBQVM7WUFDckYsTUFBTSxDQUFDLFVBQVUsR0FBRyxlQUFVLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVSLENBQUMsRUFOTSxJQUFJLEtBQUosSUFBSSxRQU1WIiwiZmlsZSI6ImNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9saWJzL2hhd3Rpby11dGlsaXRpZXMvZGVmcy5kLnRzXCIvPlxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbm1vZHVsZSBXZWxkIHtcblxuICAgIGV4cG9ydCB2YXIgcGx1Z2luTmFtZSA9IFwiaGF3dGlvLXdlbGRcIjtcblxuICAgIGV4cG9ydCB2YXIgbG9nOkxvZ2dpbmcuTG9nZ2VyID0gTG9nZ2VyLmdldChwbHVnaW5OYW1lKTtcblxuICAgIGV4cG9ydCB2YXIgdGVtcGxhdGVQYXRoID0gXCJwbHVnaW5zL3dlbGQvaHRtbFwiO1xuXG4gICAgZXhwb3J0IHZhciBjb250YWluZXJzOkFycmF5PHN0cmluZz47XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdsb2JhbHMudHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIGV4cG9ydCB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoV2VsZC5wbHVnaW5OYW1lLCBbJ3VpLmJvb3RzdHJhcCcsICd1aS5ncmlkJ10pO1xuXG4gICAgdmFyIHRhYiA9IHVuZGVmaW5lZDtcblxuICAgIG1vZHVsZS5jb25maWcoW1wiJGxvY2F0aW9uUHJvdmlkZXJcIiwgXCIkcm91dGVQcm92aWRlclwiLCBcIkhhd3Rpb05hdkJ1aWxkZXJQcm92aWRlclwiLFxuICAgICAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyOm5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyLCBidWlsZGVyOkhhd3Rpb01haW5OYXYuQnVpbGRlckZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgIHRhYiA9IGJ1aWxkZXIuY3JlYXRlKClcbiAgICAgICAgICAgICAgICAuaWQoV2VsZC5wbHVnaW5OYW1lKVxuICAgICAgICAgICAgICAgIC50aXRsZSgoKSA9PiBcIldlbGRcIilcbiAgICAgICAgICAgICAgICAuaHJlZigoKSA9PiBcIi93ZWxkXCIpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJQYWdlXCIsIFwicGFnZVwiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwicGFnZS5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiQXJjaGl2ZXNcIiwgXCJhcmNoaXZlc1wiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwiYXJjaGl2ZXMuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIkJlYW5zXCIsIFwiYmVhbnNcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcImJlYW5zLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XG4gICAgICAgICAgICBidWlsZGVyLmNvbmZpZ3VyZVJvdXRpbmcoJHJvdXRlUHJvdmlkZXIsIHRhYik7XG4gICAgICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgICAgIH1dKTtcblxuICAgIG1vZHVsZS5ydW4oW1wiSGF3dGlvTmF2XCIsIFwiam9sb2tpYVwiLCAoSGF3dGlvTmF2Okhhd3Rpb01haW5OYXYuUmVnaXN0cnksIGpvbG9raWEpID0+IHtcbiAgICAgICAgSGF3dGlvTmF2LmFkZCh0YWIpO1xuICAgICAgICBsb2cuZGVidWcoXCJsb2FkZWRcIik7XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdzZWFyY2gnLFxuICAgICAgICAgICAgbWJlYW46ICdvcmcuamJvc3Mud2VsZC5wcm9iZToqLHR5cGU9SnNvbkRhdGEnXG4gICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGNvbnRhaW5lcnMgPSByZXNwb25zZS52YWx1ZTtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZygnY29udGFpbmVycyBNQmVhbnM6ICcsIGNvbnRhaW5lcnMpO1xuICAgICAgICB9KSk7XG4gICAgfV0pO1xuXG4gICAgaGF3dGlvUGx1Z2luTG9hZGVyLmFkZE1vZHVsZShXZWxkLnBsdWdpbk5hbWUpO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5BcmNoaXZlc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsIFwiam9sb2tpYVwiLCAoJHNjb3BlLCAkbG9jYXRpb24sIGpvbG9raWEpID0+IHtcbiAgICAgICAgJHNjb3BlLmFyY2hpdmVzID0gW107XG4gICAgICAgICRzY29wZS5oaWRlQWRkQmRhID0gdHJ1ZTtcblxuICAgICAgICB2YXIgY29sdW1uczphbnlbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JkYUlkJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0lkZW50aWZpZXInLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JlYW5zJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW5zJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFuRGlzY292ZXJ5TW9kZScsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFuIERpc2NvdmVyeSBNb2RlJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICAkc2NvcGUuZ3JpZE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkYXRhOiAnYXJjaGl2ZXMnLFxuICAgICAgICAgICAgZGlzcGxheUZvb3RlcjogdHJ1ZSxcbiAgICAgICAgICAgIGRpc3BsYXlTZWxlY3Rpb25DaGVja2JveDogZmFsc2UsXG4gICAgICAgICAgICBtdWx0aVNlbGVjdDogZmFsc2UsXG4gICAgICAgICAgICBjYW5TZWxlY3RSb3dzOiBmYWxzZSxcbiAgICAgICAgICAgIGVuYWJsZVNvcnRpbmc6IHRydWUsXG4gICAgICAgICAgICBjb2x1bW5EZWZzOiBjb2x1bW5zLFxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtczogW10sXG4gICAgICAgICAgICBmaWx0ZXJPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVGV4dDogJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBqb2xva2lhLnJlcXVlc3Qoe1xuICAgICAgICAgICAgdHlwZTogJ2V4ZWMnLFxuICAgICAgICAgICAgbWJlYW46IGNvbnRhaW5lcnNbMF0sXG4gICAgICAgICAgICBvcGVyYXRpb246ICdyZWNlaXZlRGVwbG95bWVudCdcbiAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgbG9nLmluZm8oJ2FyY2hpdmVzOiAnLCBKU09OLnBhcnNlKHJlc3BvbnNlLnZhbHVlKS5iZGFzKTtcbiAgICAgICAgICAgICRzY29wZS5hcmNoaXZlcyA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmJkYXM7XG4gICAgICAgICAgICBDb3JlLiRhcHBseSgkc2NvcGUpO1xuICAgICAgICB9KSk7XG5cbiAgICB9XSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkJlYW5zQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgXCJqb2xva2lhXCIsICgkc2NvcGUsICRsb2NhdGlvbiwgam9sb2tpYSkgPT4ge1xuICAgICAgICAkc2NvcGUuYmVhbnMgPSBbXTtcbiAgICAgICAgJHNjb3BlLnBhZ2VJbmRleCA9IDE7XG4gICAgICAgICRzY29wZS5wYWdlU2l6ZSA9IDIwO1xuXG4gICAgICAgIHZhciBjb2x1bW5zOmFueVtdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbkNsYXNzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW4gY2xhc3MnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjZWxsVGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidWktZ3JpZC1jZWxsLWNvbnRlbnRzXCI+PGNvZGUgbmctYmluZC1odG1sPVwiZ3JpZC5hcHBTY29wZS5hYmJyZXZpYXRlKHJvdy5lbnRpdHkuYmVhbkNsYXNzLCAzNSlcIj48L2NvZGU+PC9kaXY+J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3R5cGVzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW4gdHlwZXMnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjZWxsVGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidWktZ3JpZC1jZWxsLWNvbnRlbnRzXCI+PHVsIGNsYXNzPVwicGxhaW4tbGlzdFwiPjxsaSBuZy1yZXBlYXQ9XCJ0eXBlIGluIHJvdy5lbnRpdHkudHlwZXNcIj48Y29kZSBuZy1iaW5kLWh0bWw9XCJncmlkLmFwcFNjb3BlLmFiYnJldmlhdGUodHlwZSwgMzUpXCI+PC9jb2RlPjwvbGk+PC91bD48L2Rpdj4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NvcGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnU2NvcGUnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjZWxsVGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidWktZ3JpZC1jZWxsLWNvbnRlbnRzXCI+PGNvZGUgbmctYmluZC1odG1sPVwiZ3JpZC5hcHBTY29wZS5hYmJyZXZpYXRlKHJvdy5lbnRpdHkuc2NvcGUsIDM1KVwiPjwvY29kZT48L2Rpdj4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAncXVhbGlmaWVycycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdRdWFsaWZpZXJzJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2VsbFRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInVpLWdyaWQtY2VsbC1jb250ZW50c1wiPjx1bCBjbGFzcz1cInBsYWluLWxpc3RcIj48bGkgbmctcmVwZWF0PVwicXVhbGlmaWVyIGluIHJvdy5lbnRpdHkucXVhbGlmaWVyc1wiPjxjb2RlIG5nLWJpbmQtaHRtbD1cImdyaWQuYXBwU2NvcGUuYWJicmV2aWF0ZShxdWFsaWZpZXIsIDM1KVwiPjwvY29kZT48L2xpPjwvdWw+PC9kaXY+J1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgICRzY29wZS5ncmlkT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRhdGE6ICdiZWFucycsXG4gICAgICAgICAgICBkaXNwbGF5Rm9vdGVyOiB0cnVlLFxuICAgICAgICAgICAgZGlzcGxheVNlbGVjdGlvbkNoZWNrYm94OiBmYWxzZSxcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhblNlbGVjdFJvd3M6IGZhbHNlLFxuICAgICAgICAgICAgZW5hYmxlU29ydGluZzogZmFsc2UsXG4gICAgICAgICAgICBjb2x1bW5EZWZzOiBjb2x1bW5zLFxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtczogW10sXG4gICAgICAgICAgICBmaWx0ZXJPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVGV4dDogJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudXBkYXRlVGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBqb2xva2lhLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdleGVjJyxcbiAgICAgICAgICAgICAgICBtYmVhbjogY29udGFpbmVyc1swXSxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdyZWNlaXZlQmVhbnMnLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czogWyRzY29wZS5wYWdlSW5kZXgsICRzY29wZS5wYWdlU2l6ZSwgJycsICdGVUxMJ11cbiAgICAgICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGFnZUluZGV4ID0gdmFsdWUucGFnZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGFnZVRvdGFsID0gdmFsdWUudG90YWw7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmJlYW5zID0gdmFsdWUuZGF0YS5tYXAoYmVhbiA9PiBKU09OLnBhcnNlKGJlYW4pKTtcbiAgICAgICAgICAgICAgICBDb3JlLiRhcHBseSgkc2NvcGUpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5hYmJyZXZpYXRlID0gZnVuY3Rpb24gKHR5cGU6U3RyaW5nLCBzaXplOm51bWJlciwgdGl0bGU6Ym9vbGVhbiA9IHRydWUsIGljb246Ym9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlLmxlbmd0aCA8IHNpemUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnJy5jb25jYXQoXG4gICAgICAgICAgICAgICAgdGl0bGUgPyAnPHNwYW4gdGl0bGU9XCInICsgdHlwZSArICdcIj4nIDogJycsXG4gICAgICAgICAgICAgICAgdHlwZS5jaGFyQXQoMCkgPT09ICdAJyA/ICdAJyA6ICcnLFxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImFiYnJldmlhdGVkXCI+JyxcbiAgICAgICAgICAgICAgICB0eXBlLnN1YnN0cmluZyh0eXBlLmNoYXJBdCgwKSA9PT0gJ0AnID8gMSA6IDAsIHR5cGUubGFzdEluZGV4T2YoJy4nKSkuc3BsaXQoJy4nKVxuICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChyZXN1bHQsIHBhcnQpID0+IHJlc3VsdCArIHBhcnQuY2hhckF0KDApICsgJy4nLCAnJyksXG4gICAgICAgICAgICAgICAgJzwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgIHR5cGUuc3Vic3RyKHR5cGUubGFzdEluZGV4T2YoJy4nKSArIDEpLFxuICAgICAgICAgICAgICAgIHRpdGxlID8gJzwvc3Bhbj4nIDogJycsXG4gICAgICAgICAgICAgICAgaWNvbiA/ICcgPGkgY2xhc3M9XCJmYSBmYS1jb21wcmVzcyBhYmJyZXZpYXRlZFwiPjwvaT4nIDogJycpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS51cGRhdGVUYWJsZSgpO1xuICAgIH1dKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQ29udGFpbmVyc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsICgkc2NvcGUsICRsb2NhdGlvbikgPT4ge1xuICAgICAgICAkc2NvcGUuY29udGFpbmVycyA9IGNvbnRhaW5lcnM7XG4gICAgfV0pO1xuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-2 form-control-like pull-left\">Total Found: {{pageTotal}} </div>\n        <pagination class=\"col-md-8\" style=\"margin: 0\"\n                    items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\"></pagination>\n        <button class=\"col-md-2 btn btn-default\">Clear filters</button>\n    </div>\n\n    <div class=\"row-fluid\">\n        <div id=\"grid\" ui-grid=\"gridOptions\" class=\"col-md-12\"></div>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");