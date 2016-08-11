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

module Weld {

    export var module = angular.module(Weld.pluginName, ['ui.bootstrap']);

    var tab = undefined;

    module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider", "$tooltipProvider",
        ($locationProvider, $routeProvider: ng.route.IRouteProvider, builder: HawtioMainNav.BuilderFactory, $tooltipProvider) => {
            tab = builder.create()
                .id(Weld.pluginName)
                .title(() => "Weld")
                .href(() => "/weld")
                .subPath("Page", "page", builder.join(Weld.templatePath, "page.html"))
                .subPath("Archives", "archives", builder.join(Weld.templatePath, "archives.html"))
                .subPath("Beans", "beans", builder.join(Weld.templatePath, "beans.html"))
                .build();
            builder.configureRouting($routeProvider, tab);
            $locationProvider.html5Mode(true);
            $tooltipProvider.options({placement: 'right'});
        }]);

    module.run(["HawtioNav", "jolokia", (HawtioNav: HawtioMainNav.Registry, jolokia) => {
        HawtioNav.add(tab);

        jolokia.request({
            type: 'search',
            mbean: 'org.jboss.weld.probe:*,type=JsonData'
        }, Core.onSuccess(response => {
            containers = response.value;
            log.debug('containers MBeans: ', containers);
        }));
    }]);

    hawtioPluginLoader.addModule(Weld.pluginName);
}
