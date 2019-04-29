import Vue from 'vue';
import App from './App.vue';
import router from './router';

import {ServiceConnector} from './assets/ts/ServiceConnector';

(<any>window)["external-settings"] = {
    "Name": "qqq",
    "Version": "2019.4.26.0",
    "Urls": {
        "Service": "/WebMap/ServiceJSON",
        "Relative": "/WebMap/App/Index/APIExamples-3",
        "Content": "/WebMap/AppTemplates/APIExamples",
        "ImageCar": "/WebMap/Image/Car",
        "ImageGF": "/WebMap/Image/Geo",
        "ImageImplements": "/WebMap/Image/Implement",
        "ImageDrivers": "/WebMap/Image/Driver"
    },
    "Token": "6CFF378EA4B23FCF65B6EAB96050930EA12CF9E1F51B8CC72D1629CE548DACA913F5A60A42EC16766DC587D5150C790BCCB4D9685F8516C30693DBE897FCB27268331A7BE22D6020E86335DD0E697461",
    "User": {
        "ID": 1,
        "UID": "ea9f8789-2a54-41aa-bb41-4480bcc08c73",
        "Name": "Administrator",
        "Login": "admin",
        "Mail": "denisio@tk-chel.ru",
        "Props": {}
    },
    "Organization": {
        "ID": 148,
        "UID": "65ca5ed7-1ca2-4aab-8bbe-9280e1dea606",
        "Name": "airit2  [148]",
        "Props": {}
    },
    "Settings": {}
};

export let $bus = new Vue({});

export const ExternalSettings: IExternalSettings = (<any>window)["external-settings"];

export const connector = new ServiceConnector(
    ExternalSettings.Urls.Service,
    ExternalSettings.Token,
    'TRASHMON',
    ExternalSettings.Organization.UID,
    (state: boolean) => /*app.$emit('busy', state)*/null
);

Vue.config.productionTip = false;

export const app = new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
