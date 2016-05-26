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

        $scope.abbreviate = function (type:String, size:number, title:boolean = true, icon:boolean = true) {
            if (type.length < size)
                return type;
            else
                return ''.concat(
                    title ? '<span title="' + type + '">' : '',
                    type.charAt(0) === '@' ? '@' : '',
                    '<span class="abbreviated">',
                    type.substring(type.charAt(0) === '@' ? 1 : 0, type.lastIndexOf('.')).split('.')
                        .reduce((result, part) => result + part.charAt(0) + '.', ''),
                    '</span>',
                    type.substr(type.lastIndexOf('.') + 1),
                    title ? '</span>' : '',
                    icon ? ' <i class="fa fa-compress abbreviated"></i>' : '');
        };

        $scope.updateTable();
    }]);
}
