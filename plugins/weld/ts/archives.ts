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

    module.controller("Weld.ArchivesController", ["$scope", "$location", "jolokia", ($scope, $location, jolokia) => {
        $scope.archives = [];
        $scope.hideAddBda = true;

        var columns:any[] = [
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
            mbean: containers[0],
            operation: 'receiveDeployment'
        }, Core.onSuccess(response => {
            $scope.archives = JSON.parse(response.value).bdas;
            Core.$apply($scope);
        }));

    }]);
}
