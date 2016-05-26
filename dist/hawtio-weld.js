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
                    cellTemplate: '<div class="ui-grid-cell-contents"><ul class="plain-list"><li ng-repeat="type in row.entity.types"><code ng-bind-html="grid.appScope.abbreviate(type, 35)"></code></li></ul></div>'
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
                if (type.length < size)
                    return type;
                else
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2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RyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBN0IsQ0FBNkIsRUFBRSxFQUFFLENBQUMsRUFDaEUsU0FBUyxFQUNULElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDdEMsS0FBSyxHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQ3RCLElBQUksR0FBRyw2Q0FBNkMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2RSxDQUFDLENBQUM7WUFFRixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUMsRUF2Rk0sSUFBSSxLQUFKLElBQUksUUF1RlY7O0FDekdELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2RSxrQ0FBa0M7QUFFbEMseUNBQXlDO0FBQ3pDLGlDQUFpQztBQUVqQyxJQUFPLElBQUksQ0FNVjtBQU5ELFdBQU8sSUFBSSxFQUFDLENBQUM7SUFFVCxXQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFDLE1BQU0sRUFBRSxTQUFTO1lBQ3JGLE1BQU0sQ0FBQyxVQUFVLEdBQUcsZUFBVSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFUixDQUFDLEVBTk0sSUFBSSxLQUFKLElBQUksUUFNViIsImZpbGUiOiJjb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbGlicy9oYXd0aW8tdXRpbGl0aWVzL2RlZnMuZC50c1wiLz5cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG5tb2R1bGUgV2VsZCB7XG5cbiAgICBleHBvcnQgdmFyIHBsdWdpbk5hbWUgPSBcImhhd3Rpby13ZWxkXCI7XG5cbiAgICBleHBvcnQgdmFyIGxvZzpMb2dnaW5nLkxvZ2dlciA9IExvZ2dlci5nZXQocGx1Z2luTmFtZSk7XG5cbiAgICBleHBvcnQgdmFyIHRlbXBsYXRlUGF0aCA9IFwicGx1Z2lucy93ZWxkL2h0bWxcIjtcblxuICAgIGV4cG9ydCB2YXIgY29udGFpbmVyczpBcnJheTxzdHJpbmc+O1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJnbG9iYWxzLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBleHBvcnQgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFdlbGQucGx1Z2luTmFtZSwgWyd1aS5ib290c3RyYXAnLCAndWkuZ3JpZCddKTtcblxuICAgIHZhciB0YWIgPSB1bmRlZmluZWQ7XG5cbiAgICBtb2R1bGUuY29uZmlnKFtcIiRsb2NhdGlvblByb3ZpZGVyXCIsIFwiJHJvdXRlUHJvdmlkZXJcIiwgXCJIYXd0aW9OYXZCdWlsZGVyUHJvdmlkZXJcIixcbiAgICAgICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcjpuZy5yb3V0ZS5JUm91dGVQcm92aWRlciwgYnVpbGRlcjpIYXd0aW9NYWluTmF2LkJ1aWxkZXJGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICB0YWIgPSBidWlsZGVyLmNyZWF0ZSgpXG4gICAgICAgICAgICAgICAgLmlkKFdlbGQucGx1Z2luTmFtZSlcbiAgICAgICAgICAgICAgICAudGl0bGUoKCkgPT4gXCJXZWxkXCIpXG4gICAgICAgICAgICAgICAgLmhyZWYoKCkgPT4gXCIvd2VsZFwiKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiUGFnZVwiLCBcInBhZ2VcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcInBhZ2UuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIkFyY2hpdmVzXCIsIFwiYXJjaGl2ZXNcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcImFyY2hpdmVzLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJCZWFuc1wiLCBcImJlYW5zXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJiZWFucy5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICAgICAgYnVpbGRlci5jb25maWd1cmVSb3V0aW5nKCRyb3V0ZVByb3ZpZGVyLCB0YWIpO1xuICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgICAgICB9XSk7XG5cbiAgICBtb2R1bGUucnVuKFtcIkhhd3Rpb05hdlwiLCBcImpvbG9raWFcIiwgKEhhd3Rpb05hdjpIYXd0aW9NYWluTmF2LlJlZ2lzdHJ5LCBqb2xva2lhKSA9PiB7XG4gICAgICAgIEhhd3Rpb05hdi5hZGQodGFiKTtcbiAgICAgICAgbG9nLmRlYnVnKFwibG9hZGVkXCIpO1xuXG4gICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiAnc2VhcmNoJyxcbiAgICAgICAgICAgIG1iZWFuOiAnb3JnLmpib3NzLndlbGQucHJvYmU6Kix0eXBlPUpzb25EYXRhJ1xuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBjb250YWluZXJzID0gcmVzcG9uc2UudmFsdWU7XG4gICAgICAgICAgICBsb2cuZGVidWcoJ2NvbnRhaW5lcnMgTUJlYW5zOiAnLCBjb250YWluZXJzKTtcbiAgICAgICAgfSkpO1xuICAgIH1dKTtcblxuICAgIGhhd3Rpb1BsdWdpbkxvYWRlci5hZGRNb2R1bGUoV2VsZC5wbHVnaW5OYW1lKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQXJjaGl2ZXNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCBcImpvbG9raWFcIiwgKCRzY29wZSwgJGxvY2F0aW9uLCBqb2xva2lhKSA9PiB7XG4gICAgICAgICRzY29wZS5hcmNoaXZlcyA9IFtdO1xuICAgICAgICAkc2NvcGUuaGlkZUFkZEJkYSA9IHRydWU7XG5cbiAgICAgICAgdmFyIGNvbHVtbnM6YW55W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZGFJZCcsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdJZGVudGlmaWVyJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFucycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFucycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbkRpc2NvdmVyeU1vZGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiBEaXNjb3ZlcnkgTW9kZScsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2FyY2hpdmVzJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29sdW1uRGVmczogY29sdW1ucyxcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IFtdLFxuICAgICAgICAgICAgZmlsdGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGZpbHRlclRleHQ6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdleGVjJyxcbiAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiAncmVjZWl2ZURlcGxveW1lbnQnXG4gICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKCdhcmNoaXZlczogJywgSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSkuYmRhcyk7XG4gICAgICAgICAgICAkc2NvcGUuYXJjaGl2ZXMgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnZhbHVlKS5iZGFzO1xuICAgICAgICAgICAgQ29yZS4kYXBwbHkoJHNjb3BlKTtcbiAgICAgICAgfSkpO1xuXG4gICAgfV0pO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5CZWFuc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsIFwiam9sb2tpYVwiLCAoJHNjb3BlLCAkbG9jYXRpb24sIGpvbG9raWEpID0+IHtcbiAgICAgICAgJHNjb3BlLmJlYW5zID0gW107XG4gICAgICAgICRzY29wZS5wYWdlSW5kZXggPSAxO1xuICAgICAgICAkc2NvcGUucGFnZVNpemUgPSAyMDtcblxuICAgICAgICB2YXIgY29sdW1uczphbnlbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JlYW5DbGFzcycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFuIGNsYXNzJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICd0eXBlcycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFuIHR5cGVzJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2VsbFRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInVpLWdyaWQtY2VsbC1jb250ZW50c1wiPjx1bCBjbGFzcz1cInBsYWluLWxpc3RcIj48bGkgbmctcmVwZWF0PVwidHlwZSBpbiByb3cuZW50aXR5LnR5cGVzXCI+PGNvZGUgbmctYmluZC1odG1sPVwiZ3JpZC5hcHBTY29wZS5hYmJyZXZpYXRlKHR5cGUsIDM1KVwiPjwvY29kZT48L2xpPjwvdWw+PC9kaXY+J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3Njb3BlJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1Njb3BlJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdxdWFsaWZpZXJzJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1F1YWxpZmllcnMnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjZWxsVGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidWktZ3JpZC1jZWxsLWNvbnRlbnRzXCI+PHVsIGNsYXNzPVwicGxhaW4tbGlzdFwiPjxsaSBuZy1yZXBlYXQ9XCJxdWFsaWZpZXIgaW4gcm93LmVudGl0eS5xdWFsaWZpZXJzXCI+PGNvZGUgbmctYmluZC1odG1sPVwiZ3JpZC5hcHBTY29wZS5hYmJyZXZpYXRlKHF1YWxpZmllciwgMzUpXCI+PC9jb2RlPjwvbGk+PC91bD48L2Rpdj4nXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2JlYW5zJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbHVtbkRlZnM6IGNvbHVtbnMsXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zOiBbXSxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJUZXh0OiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS51cGRhdGVUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2V4ZWMnLFxuICAgICAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ3JlY2VpdmVCZWFucycsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiBbJHNjb3BlLnBhZ2VJbmRleCwgJHNjb3BlLnBhZ2VTaXplLCAnJywgJ0ZVTEwnXVxuICAgICAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlSW5kZXggPSB2YWx1ZS5wYWdlO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlVG90YWwgPSB2YWx1ZS50b3RhbDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmVhbnMgPSB2YWx1ZS5kYXRhLm1hcChiZWFuID0+IEpTT04ucGFyc2UoYmVhbikpO1xuICAgICAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmFiYnJldmlhdGUgPSBmdW5jdGlvbiAodHlwZTpTdHJpbmcsIHNpemU6bnVtYmVyLCB0aXRsZTpib29sZWFuID0gdHJ1ZSwgaWNvbjpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGUubGVuZ3RoIDwgc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gJycuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICB0aXRsZSA/ICc8c3BhbiB0aXRsZT1cIicgKyB0eXBlICsgJ1wiPicgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZS5jaGFyQXQoMCkgPT09ICdAJyA/ICdAJyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJhYmJyZXZpYXRlZFwiPicsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUuc3Vic3RyaW5nKHR5cGUuY2hhckF0KDApID09PSAnQCcgPyAxIDogMCwgdHlwZS5sYXN0SW5kZXhPZignLicpKS5zcGxpdCgnLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChyZXN1bHQsIHBhcnQpID0+IHJlc3VsdCArIHBhcnQuY2hhckF0KDApICsgJy4nLCAnJyksXG4gICAgICAgICAgICAgICAgICAgICc8L3NwYW4+JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZS5zdWJzdHIodHlwZS5sYXN0SW5kZXhPZignLicpICsgMSksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID8gJzwvc3Bhbj4nIDogJycsXG4gICAgICAgICAgICAgICAgICAgIGljb24gPyAnIDxpIGNsYXNzPVwiZmEgZmEtY29tcHJlc3MgYWJicmV2aWF0ZWRcIj48L2k+JyA6ICcnKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudXBkYXRlVGFibGUoKTtcbiAgICB9XSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkNvbnRhaW5lcnNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCAoJHNjb3BlLCAkbG9jYXRpb24pID0+IHtcbiAgICAgICAgJHNjb3BlLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIH1dKTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-2 form-control-like pull-left\">Total Found: {{pageTotal}} </div>\n        <pagination class=\"col-md-8\" style=\"margin: 0\"\n                    items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\"></pagination>\n        <button class=\"col-md-2 btn btn-default\">Clear filters</button>\n    </div>\n\n    <div class=\"row-fluid\">\n        <div id=\"grid\" ui-grid=\"gridOptions\" class=\"col-md-12\"></div>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");