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

module Weld {

    module.controller("Weld.BeansController", ["$scope", "$location", "jolokia", ($scope, $location, jolokia) => {
        $scope.beans = [];
        $scope.pageIndex = 1;
        $scope.pageSize = 20;

        var columns:any[] = [
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
                mbean: containers[0],
                operation: 'receiveBeans',
                arguments: [$scope.pageIndex, $scope.pageSize, '', 'FULL']
            }, Core.onSuccess(response => {
                var value = JSON.parse(response.value);
                $scope.pageIndex = value.page;
                $scope.pageTotal = value.total;
                $scope.beans = value.data.map(bean => JSON.parse(bean));
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
                } else {
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
}
