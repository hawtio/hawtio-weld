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

        $scope.updateTable();
    }]);

    module.directive('hawtAbbreviate', function () {
        return {
            scope: {
                type: '=',
                size: '='
            },
            link: (scope) => {
                scope['left'] = (type:string) => type
                    .substring(type.charAt(0) === '@' ? 1 : 0, type.lastIndexOf('.'))
                    .split('.')
                    .reduce((result, part) => result + part.charAt(0) + '.', '');
                scope['right'] = (type:string) => type.substr(type.lastIndexOf(".") + 1);
            },
            template: `
                <code ng-if="type.length <= size">{{type}}</code>
                <code ng-if="type.length > size" tooltip="{{type}}">
                    {{type.charAt(0) === '@' ? '@' : ''}}<span class="abbreviated">{{::left(type)}}</span>{{::right(type)}}
                    <i class="fa fa-compress abbreviated"></i>
                </code>`
            };
    });
}
