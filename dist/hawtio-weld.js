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
    Weld.module.controller("Weld.ContainersController", ["$scope", "$location", function ($scope, $location) {
            $scope.containers = Weld.containers;
        }]);
})(Weld || (Weld = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9jb250YWluZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2RSxrQ0FBa0M7QUFFbEMsMERBQTBEOztBQ2YxRCwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLHlDQUF5QztBQUN6QyxJQUFPLElBQUksQ0FTVjtBQVRELFdBQU8sSUFBSSxFQUFDLENBQUM7SUFFRSxlQUFVLEdBQUcsYUFBYSxDQUFDO0lBRTNCLFFBQUcsR0FBa0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFVLENBQUMsQ0FBQztJQUU1QyxpQkFBWSxHQUFHLG1CQUFtQixDQUFDO0FBR2xELENBQUMsRUFUTSxDQVFpQyxHQVI3QixLQUFKLElBQUksUUFTVjs7QUN6QkQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FB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MkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsaUNBQWlDO0FBRWpDLElBQU8sSUFBSSxDQU1WO0FBTkQsV0FBTyxJQUFJLEVBQUMsQ0FBQztJQUVULFdBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQUMsTUFBTSxFQUFFLFNBQVM7WUFDckYsTUFBTSxDQUFDLFVBQVUsR0FBRyxlQUFVLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVSLENBQUMsRUFOTSxJQUFJLEtBQUosSUFBSSxRQU1WIiwiZmlsZSI6ImNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9saWJzL2hhd3Rpby11dGlsaXRpZXMvZGVmcy5kLnRzXCIvPlxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbm1vZHVsZSBXZWxkIHtcblxuICAgIGV4cG9ydCB2YXIgcGx1Z2luTmFtZSA9IFwiaGF3dGlvLXdlbGRcIjtcblxuICAgIGV4cG9ydCB2YXIgbG9nOkxvZ2dpbmcuTG9nZ2VyID0gTG9nZ2VyLmdldChwbHVnaW5OYW1lKTtcblxuICAgIGV4cG9ydCB2YXIgdGVtcGxhdGVQYXRoID0gXCJwbHVnaW5zL3dlbGQvaHRtbFwiO1xuXG4gICAgZXhwb3J0IHZhciBjb250YWluZXJzOkFycmF5PHN0cmluZz47XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdsb2JhbHMudHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIGV4cG9ydCB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoV2VsZC5wbHVnaW5OYW1lLCBbXSk7XG5cbiAgICB2YXIgdGFiID0gdW5kZWZpbmVkO1xuXG4gICAgbW9kdWxlLmNvbmZpZyhbXCIkbG9jYXRpb25Qcm92aWRlclwiLCBcIiRyb3V0ZVByb3ZpZGVyXCIsIFwiSGF3dGlvTmF2QnVpbGRlclByb3ZpZGVyXCIsXG4gICAgICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXI6bmcucm91dGUuSVJvdXRlUHJvdmlkZXIsIGJ1aWxkZXI6SGF3dGlvTWFpbk5hdi5CdWlsZGVyRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgdGFiID0gYnVpbGRlci5jcmVhdGUoKVxuICAgICAgICAgICAgICAgIC5pZChXZWxkLnBsdWdpbk5hbWUpXG4gICAgICAgICAgICAgICAgLnRpdGxlKCgpID0+IFwiV2VsZFwiKVxuICAgICAgICAgICAgICAgIC5ocmVmKCgpID0+IFwiL3dlbGRcIilcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIlBhZ2VcIiwgXCJwYWdlXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJwYWdlLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJBcmNoaXZlc1wiLCBcImFyY2hpdmVzXCIsIGJ1aWxkZXIuam9pbihXZWxkLnRlbXBsYXRlUGF0aCwgXCJhcmNoaXZlcy5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICAgICAgYnVpbGRlci5jb25maWd1cmVSb3V0aW5nKCRyb3V0ZVByb3ZpZGVyLCB0YWIpO1xuICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgICAgICB9XSk7XG5cbiAgICBtb2R1bGUucnVuKFtcIkhhd3Rpb05hdlwiLCBcImpvbG9raWFcIiwgKEhhd3Rpb05hdjpIYXd0aW9NYWluTmF2LlJlZ2lzdHJ5LCBqb2xva2lhKSA9PiB7XG4gICAgICAgIEhhd3Rpb05hdi5hZGQodGFiKTtcbiAgICAgICAgbG9nLmRlYnVnKFwibG9hZGVkXCIpO1xuXG4gICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICB0eXBlOiAnc2VhcmNoJyxcbiAgICAgICAgICAgIG1iZWFuOiAnb3JnLmpib3NzLndlbGQucHJvYmU6Kix0eXBlPUpzb25EYXRhJ1xuICAgICAgICB9LCBDb3JlLm9uU3VjY2VzcyhyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBjb250YWluZXJzID0gcmVzcG9uc2UudmFsdWU7XG4gICAgICAgICAgICBsb2cuZGVidWcoJ2NvbnRhaW5lcnMgTUJlYW5zOiAnLCBjb250YWluZXJzKTtcbiAgICAgICAgfSkpO1xuICAgIH1dKTtcblxuICAgIGhhd3Rpb1BsdWdpbkxvYWRlci5hZGRNb2R1bGUoV2VsZC5wbHVnaW5OYW1lKTtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGx1Z2luLnRzXCIvPlxuXG5tb2R1bGUgV2VsZCB7XG5cbiAgICBtb2R1bGUuY29udHJvbGxlcihcIldlbGQuQXJjaGl2ZXNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCBcImpvbG9raWFcIiwgKCRzY29wZSwgJGxvY2F0aW9uLCBqb2xva2lhKSA9PiB7XG4gICAgICAgICRzY29wZS5hcmNoaXZlcyA9IFtdO1xuICAgICAgICAkc2NvcGUuaGlkZUFkZEJkYSA9IHRydWU7XG5cbiAgICAgICAgdmFyIGNvbHVtbnM6YW55W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZGFJZCcsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdJZGVudGlmaWVyJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFucycsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFucycsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYmVhbkRpc2NvdmVyeU1vZGUnLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQmVhbiBEaXNjb3ZlcnkgTW9kZScsXG4gICAgICAgICAgICAgICAgY2VsbEZpbHRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIqXCIsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YTogJ2FyY2hpdmVzJyxcbiAgICAgICAgICAgIGRpc3BsYXlGb290ZXI6IHRydWUsXG4gICAgICAgICAgICBkaXNwbGF5U2VsZWN0aW9uQ2hlY2tib3g6IGZhbHNlLFxuICAgICAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VsZWN0Um93czogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVTb3J0aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29sdW1uRGVmczogY29sdW1ucyxcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IFtdLFxuICAgICAgICAgICAgZmlsdGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGZpbHRlclRleHQ6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdleGVjJyxcbiAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiAncmVjZWl2ZURlcGxveW1lbnQnXG4gICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzY29wZS5hcmNoaXZlcyA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmJkYXM7XG4gICAgICAgICAgICBDb3JlLiRhcHBseSgkc2NvcGUpO1xuICAgICAgICB9KSk7XG5cbiAgICB9XSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkNvbnRhaW5lcnNDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCAoJHNjb3BlLCAkbG9jYXRpb24pID0+IHtcbiAgICAgICAgJHNjb3BlLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIH1dKTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");