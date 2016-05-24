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
            mbean: containers[0],
            operation: 'receiveBeans',
            arguments: [1, 10, '', 'FULL']
        }, Core.onSuccess(response => {
            $scope.beans = JSON.parse(response.value).data.map(bean => JSON.parse(bean));
            Core.$apply($scope);
        }));
    }]);
}
