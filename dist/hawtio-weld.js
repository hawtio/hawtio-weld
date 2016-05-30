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
            $scope.updateTable();
        }]);
    Weld.module.directive('hawtAbbreviate', function () {
        return {
            scope: {
                type: '=',
                size: '='
            },
            link: function (scope) {
                scope['left'] = function (type) { return type
                    .substring(type.charAt(0) === '@' ? 1 : 0, type.lastIndexOf('.'))
                    .split('.')
                    .reduce(function (result, part) { return result + part.charAt(0) + '.'; }, ''); };
                scope['right'] = function (type) { return type.substr(type.lastIndexOf(".") + 1); };
            },
            template: "\n                <code ng-if=\"type.length <= size\">{{type}}</code>\n                <code ng-if=\"type.length > size\">\n                    {{type.charAt(0) === '@' ? '@' : ''}}<span class=\"abbreviated\">{{::left(type)}}</span>{{::right(type)}}\n                    <i class=\"fa fa-compress abbreviated\"></i>\n                </code>"
        };
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLnRzIiwid2VsZC90cy9nbG9iYWxzLnRzIiwid2VsZC90cy9wbHVnaW4udHMiLCJ3ZWxkL3RzL2FyY2hpdmVzLnRzIiwid2VsZC90cy9iZWFucy50cyIsIndlbGQvdHMvY29udGFpbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLDBEQUEwRDs7QUNmMUQsMkRBQTJEO0FBQzNELDREQUE0RDtBQUM1RCxHQUFHO0FBQ0gsbUVBQW1FO0FBQ25FLG9FQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsR0FBRztBQUNILGdEQUFnRDtBQUNoRCxHQUFHO0FBQ0gsdUVBQXVFO0FBQ3ZFLHFFQUFxRTtBQUNyRSw0RUFBNEU7QUFDNUUsdUVBQXVFO0FBQ3ZFLGtDQUFrQztBQUVsQyx5Q0FBeUM7QUFDekMsSUFBTyxJQUFJLENBU1Y7QUFURCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRUUsZUFBVSxHQUFHLGFBQWEsQ0FBQztJQUUzQixRQUFHLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBVSxDQUFDLENBQUM7SUFFNUMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUdsRCxDQUFDLEVBVE0sQ0FRaUMsR0FSN0IsS0FBSixJQUFJLFFBU1Y7O0FDekJELDJEQUEyRDtBQUMzRCw0REFBNEQ7QUFDNUQsR0FBRztBQUNILG1FQUFtRTtBQUNuRSxvRUFBb0U7QUFDcEUsMkNBQTJDO0FBQzNDLEdBQUc7QUFDSCxnREFBZ0Q7QUFDaEQsR0FBRztBQUNILHVFQUF1RTtBQUN2RSxxRUFBcUU7QUFDckUsNEVBQTRFO0FBQzVFLHVFQUF1RTtBQUN2RSxrQ0FBa0M7QUFFbEMseUNBQXlDO0FBQ3pDLGtDQUFrQztBQUVsQyxJQUFPLElBQUksQ0FrQ1Y7QUFsQ0QsV0FBTyxJQUFJLEVBQUMsQ0FBQztJQUVFLFdBQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBRXRFLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQztJQUVwQixXQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsMEJBQTBCO1FBQzVFLFVBQUMsaUJBQWlCLEVBQUUsY0FBc0MsRUFBRSxPQUFvQztZQUM1RixHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtpQkFDakIsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7aUJBQ25CLEtBQUssQ0FBQyxjQUFNLE9BQUEsTUFBTSxFQUFOLENBQU0sQ0FBQztpQkFDbkIsSUFBSSxDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxDQUFDO2lCQUNuQixPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ3JFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztpQkFDakYsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUN4RSxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFUixXQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxVQUFDLFNBQWdDLEVBQUUsT0FBTztZQUMxRSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLFFBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDWixJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsc0NBQXNDO2FBQ2hELEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFBLFFBQVE7Z0JBQ3RCLGVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUM1QixRQUFHLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLGVBQVUsQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRUosa0JBQWtCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsRCxDQUFDLEVBbENNLElBQUksS0FBSixJQUFJLFFBa0NWOztBQ3BERCwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLHlDQUF5QztBQUN6QyxpQ0FBaUM7QUFFakMsSUFBTyxJQUFJLENBdURWO0FBdkRELFdBQU8sSUFBSSxFQUFDLENBQUM7SUFFVCxXQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU87WUFDdkcsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDckIsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFFekIsSUFBSSxPQUFPLEdBQVM7Z0JBQ2hCO29CQUNJLEtBQUssRUFBRSxPQUFPO29CQUNkLFdBQVcsRUFBRSxZQUFZO29CQUN6QixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsS0FBSyxFQUFFLEdBQUc7b0JBQ1YsU0FBUyxFQUFFLElBQUk7aUJBQ2xCO2dCQUNEO29CQUNJLEtBQUssRUFBRSxPQUFPO29CQUNkLFdBQVcsRUFBRSxPQUFPO29CQUNwQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsS0FBSyxFQUFFLEdBQUc7b0JBQ1YsU0FBUyxFQUFFLElBQUk7aUJBQ2xCO2dCQUNEO29CQUNJLEtBQUssRUFBRSxtQkFBbUI7b0JBQzFCLFdBQVcsRUFBRSxxQkFBcUI7b0JBQ2xDLFVBQVUsRUFBRSxJQUFJO29CQUNoQixLQUFLLEVBQUUsR0FBRztvQkFDVixTQUFTLEVBQUUsSUFBSTtpQkFDbEI7YUFDSixDQUFDO1lBRUYsTUFBTSxDQUFDLFdBQVcsR0FBRztnQkFDakIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLGFBQWEsRUFBRSxJQUFJO2dCQUNuQix3QkFBd0IsRUFBRSxLQUFLO2dCQUMvQixXQUFXLEVBQUUsS0FBSztnQkFDbEIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixVQUFVLEVBQUUsT0FBTztnQkFDbkIsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGFBQWEsRUFBRTtvQkFDWCxVQUFVLEVBQUUsRUFBRTtpQkFDakI7YUFDSixDQUFDO1lBRUYsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDWixJQUFJLEVBQUUsTUFBTTtnQkFDWixLQUFLLEVBQUUsZUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsU0FBUyxFQUFFLG1CQUFtQjthQUNqQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRO2dCQUN0QixRQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVSLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDUixDQUFDLEVBdkRNLElBQUksS0FBSixJQUFJLFFBdURWOztBQ3pFRCwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLHlDQUF5QztBQUN6QyxpQ0FBaUM7QUFFakMsSUFBTyxJQUFJLENBOENWO0FBOUNELFdBQU8sSUFBSSxFQUFDLENBQUM7SUFFVCxXQUFNLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU87WUFDcEcsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFckIsTUFBTSxDQUFDLFdBQVcsR0FBRztnQkFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQztvQkFDWixJQUFJLEVBQUUsTUFBTTtvQkFDWixLQUFLLEVBQUUsZUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDcEIsU0FBUyxFQUFFLGNBQWM7b0JBQ3pCLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDO2lCQUM3RCxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRO29CQUN0QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkMsTUFBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUM5QixNQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7b0JBQy9CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDUixDQUFDLENBQUM7WUFFRixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVKLFdBQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUU7UUFDL0IsTUFBTSxDQUFDO1lBQ0gsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULElBQUksRUFBRSxHQUFHO2FBQ1o7WUFDRCxJQUFJLEVBQUUsVUFBQyxLQUFLO2dCQUNSLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFDLElBQVcsSUFBSyxPQUFBLElBQUk7cUJBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2hFLEtBQUssQ0FBQyxHQUFHLENBQUM7cUJBQ1YsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLElBQUksSUFBSyxPQUFBLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBN0IsQ0FBNkIsRUFBRSxFQUFFLENBQUMsRUFIL0IsQ0FHK0IsQ0FBQztnQkFDakUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQUMsSUFBVyxJQUFLLE9BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDO1lBQzdFLENBQUM7WUFDRCxRQUFRLEVBQUUsc1ZBS0U7U0FDWCxDQUFDO0lBQ1YsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLEVBOUNNLElBQUksS0FBSixJQUFJLFFBOENWOztBQ2hFRCwyREFBMkQ7QUFDM0QsNERBQTREO0FBQzVELEdBQUc7QUFDSCxtRUFBbUU7QUFDbkUsb0VBQW9FO0FBQ3BFLDJDQUEyQztBQUMzQyxHQUFHO0FBQ0gsZ0RBQWdEO0FBQ2hELEdBQUc7QUFDSCx1RUFBdUU7QUFDdkUscUVBQXFFO0FBQ3JFLDRFQUE0RTtBQUM1RSx1RUFBdUU7QUFDdkUsa0NBQWtDO0FBRWxDLHlDQUF5QztBQUN6QyxpQ0FBaUM7QUFFakMsSUFBTyxJQUFJLENBTVY7QUFORCxXQUFPLElBQUksRUFBQyxDQUFDO0lBRVQsV0FBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBQyxNQUFNLEVBQUUsU0FBUztZQUNyRixNQUFNLENBQUMsVUFBVSxHQUFHLGVBQVUsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRVIsQ0FBQyxFQU5NLElBQUksS0FBSixJQUFJLFFBTVYiLCJmaWxlIjoiY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2xpYnMvaGF3dGlvLXV0aWxpdGllcy9kZWZzLmQudHNcIi8+XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBwbHVnaW5OYW1lID0gXCJoYXd0aW8td2VsZFwiO1xuXG4gICAgZXhwb3J0IHZhciBsb2c6TG9nZ2luZy5Mb2dnZXIgPSBMb2dnZXIuZ2V0KHBsdWdpbk5hbWUpO1xuXG4gICAgZXhwb3J0IHZhciB0ZW1wbGF0ZVBhdGggPSBcInBsdWdpbnMvd2VsZC9odG1sXCI7XG5cbiAgICBleHBvcnQgdmFyIGNvbnRhaW5lcnM6QXJyYXk8c3RyaW5nPjtcbn1cbiIsIi8vLyBDb3B5cmlnaHQgMjAxNC0yMDE1IFJlZCBIYXQsIEluYy4gYW5kL29yIGl0cyBhZmZpbGlhdGVzXG4vLy8gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyBhcyBpbmRpY2F0ZWQgYnkgdGhlIEBhdXRob3IgdGFncy5cbi8vL1xuLy8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8vXG4vLy8gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vL1xuLy8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2xvYmFscy50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgZXhwb3J0IHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShXZWxkLnBsdWdpbk5hbWUsIFsndWkuYm9vdHN0cmFwJ10pO1xuXG4gICAgdmFyIHRhYiA9IHVuZGVmaW5lZDtcblxuICAgIG1vZHVsZS5jb25maWcoW1wiJGxvY2F0aW9uUHJvdmlkZXJcIiwgXCIkcm91dGVQcm92aWRlclwiLCBcIkhhd3Rpb05hdkJ1aWxkZXJQcm92aWRlclwiLFxuICAgICAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyOm5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyLCBidWlsZGVyOkhhd3Rpb01haW5OYXYuQnVpbGRlckZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgIHRhYiA9IGJ1aWxkZXIuY3JlYXRlKClcbiAgICAgICAgICAgICAgICAuaWQoV2VsZC5wbHVnaW5OYW1lKVxuICAgICAgICAgICAgICAgIC50aXRsZSgoKSA9PiBcIldlbGRcIilcbiAgICAgICAgICAgICAgICAuaHJlZigoKSA9PiBcIi93ZWxkXCIpXG4gICAgICAgICAgICAgICAgLnN1YlBhdGgoXCJQYWdlXCIsIFwicGFnZVwiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwicGFnZS5odG1sXCIpKVxuICAgICAgICAgICAgICAgIC5zdWJQYXRoKFwiQXJjaGl2ZXNcIiwgXCJhcmNoaXZlc1wiLCBidWlsZGVyLmpvaW4oV2VsZC50ZW1wbGF0ZVBhdGgsIFwiYXJjaGl2ZXMuaHRtbFwiKSlcbiAgICAgICAgICAgICAgICAuc3ViUGF0aChcIkJlYW5zXCIsIFwiYmVhbnNcIiwgYnVpbGRlci5qb2luKFdlbGQudGVtcGxhdGVQYXRoLCBcImJlYW5zLmh0bWxcIikpXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XG4gICAgICAgICAgICBidWlsZGVyLmNvbmZpZ3VyZVJvdXRpbmcoJHJvdXRlUHJvdmlkZXIsIHRhYik7XG4gICAgICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgICAgIH1dKTtcblxuICAgIG1vZHVsZS5ydW4oW1wiSGF3dGlvTmF2XCIsIFwiam9sb2tpYVwiLCAoSGF3dGlvTmF2Okhhd3Rpb01haW5OYXYuUmVnaXN0cnksIGpvbG9raWEpID0+IHtcbiAgICAgICAgSGF3dGlvTmF2LmFkZCh0YWIpO1xuICAgICAgICBsb2cuZGVidWcoXCJsb2FkZWRcIik7XG5cbiAgICAgICAgam9sb2tpYS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIHR5cGU6ICdzZWFyY2gnLFxuICAgICAgICAgICAgbWJlYW46ICdvcmcuamJvc3Mud2VsZC5wcm9iZToqLHR5cGU9SnNvbkRhdGEnXG4gICAgICAgIH0sIENvcmUub25TdWNjZXNzKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGNvbnRhaW5lcnMgPSByZXNwb25zZS52YWx1ZTtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZygnY29udGFpbmVycyBNQmVhbnM6ICcsIGNvbnRhaW5lcnMpO1xuICAgICAgICB9KSk7XG4gICAgfV0pO1xuXG4gICAgaGF3dGlvUGx1Z2luTG9hZGVyLmFkZE1vZHVsZShXZWxkLnBsdWdpbk5hbWUpO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5BcmNoaXZlc0NvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGxvY2F0aW9uXCIsIFwiam9sb2tpYVwiLCAoJHNjb3BlLCAkbG9jYXRpb24sIGpvbG9raWEpID0+IHtcbiAgICAgICAgJHNjb3BlLmFyY2hpdmVzID0gW107XG4gICAgICAgICRzY29wZS5oaWRlQWRkQmRhID0gdHJ1ZTtcblxuICAgICAgICB2YXIgY29sdW1uczphbnlbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JkYUlkJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0lkZW50aWZpZXInLFxuICAgICAgICAgICAgICAgIGNlbGxGaWx0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2JlYW5zJyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0JlYW5zJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdiZWFuRGlzY292ZXJ5TW9kZScsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdCZWFuIERpc2NvdmVyeSBNb2RlJyxcbiAgICAgICAgICAgICAgICBjZWxsRmlsdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIipcIixcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICAkc2NvcGUuZ3JpZE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkYXRhOiAnYXJjaGl2ZXMnLFxuICAgICAgICAgICAgZGlzcGxheUZvb3RlcjogdHJ1ZSxcbiAgICAgICAgICAgIGRpc3BsYXlTZWxlY3Rpb25DaGVja2JveDogZmFsc2UsXG4gICAgICAgICAgICBtdWx0aVNlbGVjdDogZmFsc2UsXG4gICAgICAgICAgICBjYW5TZWxlY3RSb3dzOiBmYWxzZSxcbiAgICAgICAgICAgIGVuYWJsZVNvcnRpbmc6IHRydWUsXG4gICAgICAgICAgICBjb2x1bW5EZWZzOiBjb2x1bW5zLFxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtczogW10sXG4gICAgICAgICAgICBmaWx0ZXJPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVGV4dDogJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBqb2xva2lhLnJlcXVlc3Qoe1xuICAgICAgICAgICAgdHlwZTogJ2V4ZWMnLFxuICAgICAgICAgICAgbWJlYW46IGNvbnRhaW5lcnNbMF0sXG4gICAgICAgICAgICBvcGVyYXRpb246ICdyZWNlaXZlRGVwbG95bWVudCdcbiAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgbG9nLmluZm8oJ2FyY2hpdmVzOiAnLCBKU09OLnBhcnNlKHJlc3BvbnNlLnZhbHVlKS5iZGFzKTtcbiAgICAgICAgICAgICRzY29wZS5hcmNoaXZlcyA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpLmJkYXM7XG4gICAgICAgICAgICBDb3JlLiRhcHBseSgkc2NvcGUpO1xuICAgICAgICB9KSk7XG5cbiAgICB9XSk7XG59XG4iLCIvLy8gQ29weXJpZ2h0IDIwMTQtMjAxNSBSZWQgSGF0LCBJbmMuIGFuZC9vciBpdHMgYWZmaWxpYXRlc1xuLy8vIGFuZCBvdGhlciBjb250cmlidXRvcnMgYXMgaW5kaWNhdGVkIGJ5IHRoZSBAYXV0aG9yIHRhZ3MuXG4vLy9cbi8vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vL1xuLy8vICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLy9cbi8vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsdWdpbi50c1wiLz5cblxubW9kdWxlIFdlbGQge1xuXG4gICAgbW9kdWxlLmNvbnRyb2xsZXIoXCJXZWxkLkJlYW5zQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgXCJqb2xva2lhXCIsICgkc2NvcGUsICRsb2NhdGlvbiwgam9sb2tpYSkgPT4ge1xuICAgICAgICAkc2NvcGUuYmVhbnMgPSBbXTtcbiAgICAgICAgJHNjb3BlLnBhZ2VJbmRleCA9IDE7XG4gICAgICAgICRzY29wZS5wYWdlU2l6ZSA9IDIwO1xuXG4gICAgICAgICRzY29wZS51cGRhdGVUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGpvbG9raWEucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2V4ZWMnLFxuICAgICAgICAgICAgICAgIG1iZWFuOiBjb250YWluZXJzWzBdLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ3JlY2VpdmVCZWFucycsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiBbJHNjb3BlLnBhZ2VJbmRleCwgJHNjb3BlLnBhZ2VTaXplLCAnJywgJ0ZVTEwnXVxuICAgICAgICAgICAgfSwgQ29yZS5vblN1Y2Nlc3MocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IEpTT04ucGFyc2UocmVzcG9uc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlSW5kZXggPSB2YWx1ZS5wYWdlO1xuICAgICAgICAgICAgICAgICRzY29wZS5wYWdlVG90YWwgPSB2YWx1ZS50b3RhbDtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmVhbnMgPSB2YWx1ZS5kYXRhLm1hcChiZWFuID0+IEpTT04ucGFyc2UoYmVhbikpO1xuICAgICAgICAgICAgICAgIENvcmUuJGFwcGx5KCRzY29wZSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnVwZGF0ZVRhYmxlKCk7XG4gICAgfV0pO1xuXG4gICAgbW9kdWxlLmRpcmVjdGl2ZSgnaGF3dEFiYnJldmlhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgICAgICAgICBzaXplOiAnPSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsaW5rOiAoc2NvcGUpID0+IHtcbiAgICAgICAgICAgICAgICBzY29wZVsnbGVmdCddID0gKHR5cGU6c3RyaW5nKSA9PiB0eXBlXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcodHlwZS5jaGFyQXQoMCkgPT09ICdAJyA/IDEgOiAwLCB0eXBlLmxhc3RJbmRleE9mKCcuJykpXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLicpXG4gICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgcGFydCkgPT4gcmVzdWx0ICsgcGFydC5jaGFyQXQoMCkgKyAnLicsICcnKTtcbiAgICAgICAgICAgICAgICBzY29wZVsncmlnaHQnXSA9ICh0eXBlOnN0cmluZykgPT4gdHlwZS5zdWJzdHIodHlwZS5sYXN0SW5kZXhPZihcIi5cIikgKyAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxjb2RlIG5nLWlmPVwidHlwZS5sZW5ndGggPD0gc2l6ZVwiPnt7dHlwZX19PC9jb2RlPlxuICAgICAgICAgICAgICAgIDxjb2RlIG5nLWlmPVwidHlwZS5sZW5ndGggPiBzaXplXCI+XG4gICAgICAgICAgICAgICAgICAgIHt7dHlwZS5jaGFyQXQoMCkgPT09ICdAJyA/ICdAJyA6ICcnfX08c3BhbiBjbGFzcz1cImFiYnJldmlhdGVkXCI+e3s6OmxlZnQodHlwZSl9fTwvc3Bhbj57ezo6cmlnaHQodHlwZSl9fVxuICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLWNvbXByZXNzIGFiYnJldmlhdGVkXCI+PC9pPlxuICAgICAgICAgICAgICAgIDwvY29kZT5gXG4gICAgICAgICAgICB9O1xuICAgIH0pO1xufVxuIiwiLy8vIENvcHlyaWdodCAyMDE0LTIwMTUgUmVkIEhhdCwgSW5jLiBhbmQvb3IgaXRzIGFmZmlsaWF0ZXNcbi8vLyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIGFzIGluZGljYXRlZCBieSB0aGUgQGF1dGhvciB0YWdzLlxuLy8vXG4vLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLy9cbi8vLyAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8vXG4vLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9pbmNsdWRlcy50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbHVnaW4udHNcIi8+XG5cbm1vZHVsZSBXZWxkIHtcblxuICAgIG1vZHVsZS5jb250cm9sbGVyKFwiV2VsZC5Db250YWluZXJzQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgKCRzY29wZSwgJGxvY2F0aW9uKSA9PiB7XG4gICAgICAgICRzY29wZS5jb250YWluZXJzID0gY29udGFpbmVycztcbiAgICB9XSk7XG5cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

angular.module("hawtio-weld-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/weld/html/archives.html","<div ng-controller=\"Weld.ArchivesController\">\n\n    <div class=\"row-fluid\">\n        <div class=\"col-md-6\">\n            <label>\n                <input type=\"checkbox\" ng-model=\"hideAddBda\"\n                       title=\"Additional/synthetic bean archives are automatically created for beans\n                       and extensions which do not belong to any regular bean archive\">\n                Hide Additional Bean Archives\n                </label>\n            </label>\n        </div>\n\n        <div class=\"col-md-6\">\n            <hawtio-filter class=\"pull-right\" ng-model=\"gridOptions.filterOptions.filterText\" placeholder=\"Filter...\"></hawtio-filter>\n        </div>\n    </div>\n\n    <div class=\"row-fluid\">\n        <table class=\"table table-condensed table-striped\" hawtio-simple-table=\"gridOptions\"></table>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/beans.html","<div ng-controller=\"Weld.BeansController\">\n\n    <div style=\"display: flex; justify-content: space-around; align-items: center;\">\n        <div>Total Found: <span class=\"badge\">{{pageTotal}}</span></div>\n        <pagination items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\">\n        </pagination>\n        <button class=\"btn btn-default\">Clear filters</button>\n    </div>\n\n    <table class=\"table table-bordered table-striped\">\n        <tr>\n            <th></th>\n            <th>\n                Bean class\n            </th>\n            <th>\n                Bean kind\n            </th>\n            <th>\n                Bean types\n            </th>\n            <th>\n                Scope\n            </th>\n            <th>\n                Qualifiers\n            </th>\n        </tr>\n        <tr ng-repeat=\"bean in beans\">\n            <td style=\"max-width: inherit; width: 20px; text-align: right;\">\n                <small>{{(pageIndex - 1) * pageSize + $index + 1}}</small>\n            </td>\n            <td>\n                <hawt-abbreviate size=\"35\" type=\"bean.beanClass\"/>\n            </td>\n            <td style=\"max-width: inherit; width: 80px;\">\n                <span class=\"{{bean.kind}} boxed\">{{bean.kind}}</span>\n            </td>\n            <td>\n                <ul class=\"plain-list\">\n                    <li ng-repeat=\"type in bean.types\">\n                        <hawt-abbreviate size=\"35\" type=\"type\"/>\n                    </li>\n                </ul>\n            </td>\n            <td>\n                <hawt-abbreviate size=\"35\" type=\"bean.scope\"/>\n            </td>\n            <td>\n                <ul class=\"plain-list\">\n                    <li ng-repeat=\"qualifier in bean.qualifiers\">\n                        <hawt-abbreviate size=\"35\" type=\"qualifier\"/>\n                    </li>\n                </ul>\n            </td>\n        </tr>\n    </table>\n\n    <div style=\"display: flex; justify-content: space-around; align-items: center;\">\n        <div>Total Found: <span class=\"badge\">{{pageTotal}}</span></div>\n        <pagination items-per-page=\"pageSize\" total-items=\"pageTotal\"\n                    max-size=\"10\" force-ellipses=\"true\" boundary-link-numbers=\"true\"\n                    ng-model=\"pageIndex\" ng-change=\"updateTable()\">\n        </pagination>\n        <button style=\"visibility: hidden\" class=\"btn btn-default\">Clear filters</button>\n    </div>\n\n</div>\n");
$templateCache.put("plugins/weld/html/page.html","<div ng-controller=\"Weld.ContainersController\">\n    <div class=\"row\">\n        <div class=\"col-md-6\">\n            <h2>Containers</h2>\n            <ul>\n                <li ng-repeat=\"container in containers\">{{container}}</li>\n            </ul>\n        </div>\n    </div>\n</div>\n");}]); hawtioPluginLoader.addModule("hawtio-weld-templates");