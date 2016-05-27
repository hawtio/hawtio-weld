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
    Weld.module = angular.module(Weld.pluginName, ['ui.bootstrap']);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2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NC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbGlicy9oYXd0aW8tdXRpbGl0aWVzL2RlZnMuZC50c1wiLz5cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG5tb2R1bGUgV2VsZCB7XG5cbiAgICBleHBvcnQgdmFyIHBsdWdpbk5hbWUgPSBcImhhd3Rpby13ZWxkXCI7XG5cbiAgICBleHBvcnQgdmFyIGxvZzpMb2dnaW5nLkxvZ2dlciA9IExvZ2dlci5nZXQocGx1Z2luTmFtZSk7XG5cbiAgICBleHBvcnQgdmFyIHRlbXBsYXRlUGF0aCA9IFwicGx1Z2lucy93ZWxkL2h0bWxcIjtcblxuICAgIGV4cG9ydCB2YXIgY29udGFpbmVyczpBcnJheTxzdHJpbmc+O1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJnbG9iYWxzLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBleHBvcnQgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFdlbGQucGx1Z2luTmFtZSwgWyd1aS5ib290c3RyYXAnXSk7XG5cbiAgICB2YXIgdGFiID0gdW5kZWZpbmVkO1xuXG4gICAgbW9kdWxlLmNvbmZpZyhbXCIkbG9jYXRpb25Qcm92aWRlclwiLCBcIiRyb3V0ZVByb3ZpZGVyXCIsIFwiSGF3dGlvTmF2QnVpbGRlclByb3ZpZGVyXCIsXG4gICAgICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXI6bmcucm91dGUuSVJvdXRlUHJvdmlkZXIsIGJ1aWxkZXI6SGF3dGlvTWFpbk5hdi5CdWlsZGVyRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgdGFiID0gYnVpbGRlci5jcmVhdGUoKVxuICAgICAgICAgICAgICAgIC5pZChXZWxkLnBsdWdpbk5hbWUpXG4gICAgICAgICAgICAgICAgLnRpdGxlKCgpID0+IFwiV2VsZFwiKVxuICAgICAgICAgICAgICAgIC5ocmVmKCgpID0+IFwiL3dlbGRcIilcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIlBhZ2VcIiwgXCJwYWdlXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJwYWdlLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJBcmNoaXZlc1wiLCBcImFyY2hpdmVzXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJhcmNoaXZlcy5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiQmVhbnNcIiwgXCJiZWFuc1wiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwiYmVhbnMuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcbiAgICAgICAgICAgIGJ1aWxkZXIuY29uZmlndXJlUm91dGluZygkcm91dGVQcm92aWRlciwgdGFiKTtcbiAgICAgICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAgICAgfV0pO1xuXG4gICAgbW9kdWxlLnJ1bihbXCJIYXd0aW9OYXZcIiwgXCJqb2xva2lhXCIsIChIYXd0aW9OYXY6SGF3dGlvTWFpbk5hdi5SZWdpc3RyeSwgam9sb2tpYSkgPT4ge1xuICAgICAgICBIYXd0aW9OYXYuYWRkKHRhYik7XG4gICAgICAgIGxvZy5kZWJ1ZyhcImxvYWRlZFwiKTtcblxuICAgICAgICBqb2xva2lhLnJlcXVlc3Qoe1xuICAgICAgICAgICAgdHlwZTogJ3NlYXJjaCcsXG4gICAgICAgICAgICBtYmVhbjogJ29yZy5qYm9zcy53ZWxkLnByb2JlOiosdHlwZT1Kc29uRGF0YSdcbiAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29udGFpbmVycyA9IHJlc3BvbnNlLnZhbHVlO1xuICAgICAgICAgICAgbG9nLmRlYnVnKCdjb250YWluZXJzIE1CZWFuczogJywgY29udGFpbmVycyk7XG4gICAgICAgIH0pKTtcbiAgICB9XSk7XG5cbiAgICBoYXd0aW9QbHVnaW5Mb2FkZXIuYWRkTW9kdWxlKFdlbGQucGx1Z2luTmFtZSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkFyY2hpdmVzQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgXCJqb2xva2lhXCIsICgkc2NvcGUsICRsb2NhdGlvbiwgam9sb2tpYSkgPT4ge1xuICAgICAgICAkc2NvcGUuYXJjaGl2ZXMgPSBbXTtcbiAgICAgICAgJHNjb3BlLmhpZGVBZGRCZGEgPSB0cnVlO1xuXG4gICAgICAgIHZhciBjb2x1bW5zOmFueVtdID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmRhSWQnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnSWRlbnRpZmllcicsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbnMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbnMnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JlYW5EaXNjb3ZlcnlNb2RlJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW4gRGlzY292ZXJ5IE1vZGUnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgICRzY29wZS5ncmlkT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRhdGE6ICdhcmNoaXZlcycsXG4gICAgICAgICAgICBkaXNwbGF5Rm9vdGVyOiB0cnVlLFxuICAgICAgICAgICAgZGlzcGxheVNlbGVjdGlvbkNoZWNrYm94OiBmYWxzZSxcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhblNlbGVjdFJvd3M6IGZhbHNlLFxuICAgICAgICAgICAgZW5hYmxlU29ydGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGNvbHVtbkRlZnM6IGNvbHVtbnMsXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zOiBbXSxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJUZXh0OiAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiAnZXhlYycsXG4gICAgICAgICAgICBtYmVhbjogY29udGFpbmVyc1swXSxcbiAgICAgICAgICAgIG9wZXJhdGlvbjogJ3JlY2VpdmVEZXBsb3ltZW50J1xuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBsb2cuaW5mbygnYXJjaGl2ZXM6ICcsIEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmJkYXMpO1xuICAgICAgICAgICAgJHNjb3BlLmFyY2hpdmVzID0gSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSkuYmRhcztcbiAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgIH0pKTtcblxuICAgIH1dKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQmVhbnNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCBcImpvbG9raWFcIiwgKCRzY29wZSwgJGxvY2F0aW9uLCBqb2xva2lhKSA9PiB7XG4gICAgICAgICRzY29wZS5iZWFucyA9IFtdO1xuICAgICAgICAkc2NvcGUucGFnZUluZGV4ID0gMTtcbiAgICAgICAgJHNjb3BlLnBhZ2VTaXplID0gMjA7XG5cbiAgICAgICAgJHNjb3BlLnVwZGF0ZVRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXhlYycsXG4gICAgICAgICAgICAgICAgbWJlYW46IGNvbnRhaW5lcnNbMF0sXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiAncmVjZWl2ZUJlYW5zJyxcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IFskc2NvcGUucGFnZUluZGV4LCAkc2NvcGUucGFnZVNpemUsICcnLCAnRlVMTCddXG4gICAgICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBhZ2VJbmRleCA9IHZhbHVlLnBhZ2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBhZ2VUb3RhbCA9IHZhbHVlLnRvdGFsO1xuICAgICAgICAgICAgICAgICRzY29wZS5iZWFucyA9IHZhbHVlLmRhdGEubWFwKGJlYW4gPT4gSlNPTi5wYXJzZShiZWFuKSk7XG4gICAgICAgICAgICAgICAgQ29yZS4kYXBwbHkoJHNjb3BlKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWJicmV2aWF0ZSA9IGZ1bmN0aW9uICh0eXBlOlN0cmluZywgc2l6ZTpudW1iZXIsIHRpdGxlOmJvb2xlYW4gPSB0cnVlLCBpY29uOmJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAodHlwZS5sZW5ndGggPCBzaXplKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJycuY29uY2F0KFxuICAgICAgICAgICAgICAgIHRpdGxlID8gJzxzcGFuIHRpdGxlPVwiJyArIHR5cGUgKyAnXCI+JyA6ICcnLFxuICAgICAgICAgICAgICAgIHR5cGUuY2hhckF0KDApID09PSAnQCcgPyAnQCcgOiAnJyxcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJhYmJyZXZpYXRlZFwiPicsXG4gICAgICAgICAgICAgICAgdHlwZS5zdWJzdHJpbmcodHlwZS5jaGFyQXQoMCkgPT09ICdAJyA/IDEgOiAwLCB0eXBlLmxhc3RJbmRleE9mKCcuJykpLnNwbGl0KCcuJylcbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgocmVzdWx0LCBwYXJ0KSA9PiByZXN1bHQgKyBwYXJ0LmNoYXJBdCgwKSArICcuJywgJycpLFxuICAgICAgICAgICAgICAgICc8L3NwYW4+JyxcbiAgICAgICAgICAgICAgICB0eXBlLnN1YnN0cih0eXBlLmxhc3RJbmRleE9mKCcuJykgKyAxKSxcbiAgICAgICAgICAgICAgICB0aXRsZSA/ICc8L3NwYW4+JyA6ICcnLFxuICAgICAgICAgICAgICAgIGljb24gPyAnIDxpIGNsYXNzPVwiZmEgZmEtY29tcHJlc3MgYWJicmV2aWF0ZWRcIj48L2k+JyA6ICcnKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudXBkYXRlVGFibGUoKTtcbiAgICB9XSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkNvbnRhaW5lcnNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCAoJHNjb3BlLCAkbG9jYXRpb24pID0+IHtcbiAgICAgICAgJHNjb3BlLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIH1dKTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-2 form-control-like pull-left\">Total Found: {{pageTotal}} </div>\n        <pagination class=\"col-md-8\" style=\"margin: 0\"\n                    items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\"></pagination>\n        <button class=\"col-md-2 btn btn-default\">Clear filters</button>\n    </div>\n\n    <table class=\"table table-bordered table-striped\">\n        <tr>\n            <th></th>\n            <th>\n                Bean class\n            </th>\n            <th>\n                Beans kind\n            </th>\n\n            <th>\n                Bean types\n            </th>\n            <th>\n                Scope\n            </th>\n            <th>\n                Qualifiers\n            </th>\n        </tr>\n        <tr ng-repeat=\"bean in beans\">\n            <td>\n                {{(pageIndex - 1) * pageSize + $index + 1}}\n            </td>\n            <td>\n                <code ng-bind-html=\"abbreviate(bean.beanClass, 35)\"></code>\n            </td>\n            <td style=\"max-width: inherit; width: 80px;\">\n                <span class=\"{{bean.kind}} boxed\">{{bean.kind}}</span>\n            </td>\n            <td>\n                <ul class=\"plain-list\">\n                    <li ng-repeat=\"type in bean.types\">\n                        <code ng-bind-html=\"abbreviate(type, 35)\"></code>\n                    </li>\n                </ul>\n            </td>\n            <td>\n                <code ng-bind-html=\"abbreviate(bean.scope, 35)\"></code>\n            </td>\n            <td>\n                <ul class=\"plain-list\">\n                    <li ng-repeat=\"qualifier in bean.qualifiers\">\n                        <code ng-bind-html=\"abbreviate(qualifier, 35)\"></code>\n                    </li>\n                </ul>\n            </td>\n        </tr>\n    </table>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");