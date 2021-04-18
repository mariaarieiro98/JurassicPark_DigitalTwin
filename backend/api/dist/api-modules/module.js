"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiModule {
    constructor(apiRoutes) {
        this.moduleNamespaces = [];
        this.addRoute = (apiRoute) => this.apiRoutes.push(apiRoute);
        this.addNamespace = (namespace) => this.moduleNamespaces.push(namespace);
        this.mountRoutes = (api) => {
            this.apiRoutes.forEach(route => this.mountRoute(route, api));
        };
        this.mountRoute = (apiRoute, api) => {
            if (!apiRoute.withAuthentication) {
                const findRegex = api.URLS_FILTERS_NO_COOKIE.find(regex => regex.toString() === apiRoute.path.toString());
                const index = api.URLS_FILTERS_NO_COOKIE.indexOf(findRegex);
                if (index == -1) {
                    api.URLS_FILTERS_NO_COOKIE.push(apiRoute.path);
                    api.METHODS_FILTERS_NO_COOKIE.push([apiRoute.method.toUpperCase()]);
                }
                else
                    api.METHODS_FILTERS_NO_COOKIE[index].push(apiRoute.method.toUpperCase());
            }
            apiRoute.mountRoute(api);
        };
        this.apiRoutes = apiRoutes;
    }
}
exports.ApiModule = ApiModule;
//# sourceMappingURL=module.js.map