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
    Weld.module = angular.module(Weld.pluginName, []);
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
                    resizable: true
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
                operation: 'receiveBeans',
                arguments: [1, 10, '', 'FULL']
            }, Core.onSuccess(function (response) {
                Weld.log.info('beans: ', JSON.parse(response.value).data.map(function (bean) { return JSON.parse(bean); }));
                $scope.beans = JSON.parse(response.value).data.map(function (bean) { return JSON.parse(bean); });
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
    Weld.module.controller("Weld.ContainersController", ["$scope", "$location", function ($scope, $location) {
            $scope.containers = Weld.containers;
        }]);
})(Weld || (Weld = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2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LEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVSLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLEVBOURNLElBQUksS0FBSixJQUFJLFFBOERWOztBQ2hGRCwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLHlDQUF5QztBQUN6QyxpQ0FBaUM7QUFFakMsSUFBTyxJQUFJLENBTVY7QUFORCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRVQsV0FBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBQyxNQUFNLEVBQUUsU0FBUztZQUNyRixNQUFNLENBQUMsVUFBVSxHQUFHLGVBQVUsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRVIsQ0FBQyxFQU5NLElBQUksS0FBSixJQUFJLFFBTVYiLCJmaWxlIjoiY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2xpYnMvaGF3dGlvLXV0aWxpdGllcy9kZWZzLmQudHNcIi8+XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBwbHVnaW5OYW1lID0gXCJoYXd0aW8td2VsZFwiO1xuXG4gICAgZXhwb3J0IHZhciBsb2c6TG9nZ2luZy5Mb2dnZXIgPSBMb2dnZXIuZ2V0KHBsdWdpbk5hbWUpO1xuXG4gICAgZXhwb3J0IHZhciB0ZW1wbGF0ZVBhdGggPSBcInBsdWdpbnMvd2VsZC9odG1sXCI7XG5cbiAgICBleHBvcnQgdmFyIGNvbnRhaW5lcnM6QXJyYXk8c3RyaW5nPjtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2xvYmFscy50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShXZWxkLnBsdWdpbk5hbWUsIFtdKTtcblxuICAgIHZhciB0YWIgPSB1bmRlZmluZWQ7XG5cbiAgICBtb2R1bGUuY29uZmlnKFtcIiRsb2NhdGlvblByb3ZpZGVyXCIsIFwiJHJvdXRlUHJvdmlkZXJcIiwgXCJIYXd0aW9OYXZCdWlsZGVyUHJvdmlkZXJcIixcbiAgICAgICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcjpuZy5yb3V0ZS5JUm91dGVQcm92aWRlciwgYnVpbGRlcjpIYXd0aW9NYWluTmF2LkJ1aWxkZXJGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICB0YWIgPSBidWlsZGVyLmNyZWF0ZSgpXG4gICAgICAgICAgICAgICAgLmlkKFdlbGQucGx1Z2luTmFtZSlcbiAgICAgICAgICAgICAgICAudGl0bGUoKCkgPT4gXCJXZWxkXCIpXG4gICAgICAgICAgICAgICAgLmhyZWYoKCkgPT4gXCIvd2VsZFwiKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiUGFnZVwiLCBcInBhZ2VcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcInBhZ2UuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIkFyY2hpdmVzXCIsIFwiYXJjaGl2ZXNcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcImFyY2hpdmVzLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJCZWFuc1wiLCBcImJlYW5zXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJiZWFucy5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICAgICAgYnVpbGRlci5jb25maWd1cmVSb3V0aW5nKCRyb3V0ZVByb3ZpZGVyLCB0YWIpO1xuICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgICAgICB9XSk7XG5cbiAgICBtb2R1bGUucnVuKFtcIkhhd3Rpb05hdlwiLCBcImpvbG9raWFcIiwgKEhhd3Rpb05hdjpIYXd0aW9NYWluTmF2LlJlZ2lzdHJ5LCBqb2xva2lhKSA9PiB7XG4gICAgICAgIEhhd3Rpb05hdi5hZGQodGFiKTtcbiAgICAgICAgbG9nLmRlYnVnKFwibG9hZGVkXCIpO1xuXG4gICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiAnc2VhcmNoJyxcbiAgICAgICAgICAgIG1iZWFuOiAnb3JnLmpib3NzLndlbGQucHJvYmU6Kix0eXBlPUpzb25EYXRhJ1xuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBjb250YWluZXJzID0gcmVzcG9uc2UudmFsdWU7XG4gICAgICAgICAgICBsb2cuZGVidWcoJ2NvbnRhaW5lcnMgTUJlYW5zOiAnLCBjb250YWluZXJzKTtcbiAgICAgICAgfSkpO1xuICAgIH1dKTtcblxuICAgIGhhd3Rpb1BsdWdpbkxvYWRlci5hZGRNb2R1bGUoV2VsZC5wbHVnaW5OYW1lKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQXJjaGl2ZXNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCBcImpvbG9raWFcIiwgKCRzY29wZSwgJGxvY2F0aW9uLCBqb2xva2lhKSA9PiB7XG4gICAgICAgICRzY29wZS5hcmNoaXZlcyA9IFtdO1xuICAgICAgICAkc2NvcGUuaGlkZUFkZEJkYSA9IHRydWU7XG5cbiAgICAgICAgdmFyIGNvbHVtbnM6YW55W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZGFJZCcsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdJZGVudGlmaWVyJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFucycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFucycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbkRpc2NvdmVyeU1vZGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiBEaXNjb3ZlcnkgTW9kZScsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2FyY2hpdmVzJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29sdW1uRGVmczogY29sdW1ucyxcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IFtdLFxuICAgICAgICAgICAgZmlsdGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGZpbHRlclRleHQ6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdleGVjJyxcbiAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiAncmVjZWl2ZURlcGxveW1lbnQnXG4gICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKCdhcmNoaXZlczogJywgSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSkuYmRhcyk7XG4gICAgICAgICAgICAkc2NvcGUuYXJjaGl2ZXMgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnZhbHVlKS5iZGFzO1xuICAgICAgICAgICAgQ29yZS4kYXBwbHkoJHNjb3BlKTtcbiAgICAgICAgfSkpO1xuXG4gICAgfV0pO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5CZWFuc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsIFwiam9sb2tpYVwiLCAoJHNjb3BlLCAkbG9jYXRpb24sIGpvbG9raWEpID0+IHtcbiAgICAgICAgJHNjb3BlLmJlYW5zID0gW107XG5cbiAgICAgICAgdmFyIGNvbHVtbnM6YW55W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFuQ2xhc3MnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiBjbGFzcycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAndHlwZXMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiB0eXBlcycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnc2NvcGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnU2NvcGUnLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3F1YWxpZmllcnMnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUXVhbGlmaWVycycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2JlYW5zJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29sdW1uRGVmczogY29sdW1ucyxcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IFtdLFxuICAgICAgICAgICAgZmlsdGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGZpbHRlclRleHQ6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdleGVjJyxcbiAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiAncmVjZWl2ZUJlYW5zJyxcbiAgICAgICAgICAgIGFyZ3VtZW50czogWzEsIDEwLCAnJywgJ0ZVTEwnXVxuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBsb2cuaW5mbygnYmVhbnM6ICcsIEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmRhdGEubWFwKGJlYW4gPT4gSlNPTi5wYXJzZShiZWFuKSkpO1xuICAgICAgICAgICAgJHNjb3BlLmJlYW5zID0gSlNPTi5wYXJzZShyZXNwb25zZS52YWx1ZSkuZGF0YS5tYXAoYmVhbiA9PiBKU09OLnBhcnNlKGJlYW4pKTtcbiAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgIH0pKTtcblxuICAgIH1dKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQ29udGFpbmVyc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsICgkc2NvcGUsICRsb2NhdGlvbikgPT4ge1xuICAgICAgICAkc2NvcGUuY29udGFpbmVycyA9IGNvbnRhaW5lcnM7XG4gICAgfV0pO1xuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-bordered table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");