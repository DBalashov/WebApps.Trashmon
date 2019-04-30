<template>
    <div id="app">
        <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed" rel="stylesheet">
        <header class="header">
            <div class="header__logo">
                Trashmon
            </div>
            <div class="header__menu">
                <Menu />
            </div>
        </header>
        <section class="layout">
            <div class="layout__left">
                <div id="map" class="map"></div>
            </div>
            <div class="layout__right">
                <ul class="tabs">
                    <li v-on:click="updateSelectedTab(0)" v-bind:class="['tabs__item', { 'tabs__item--active': selectedTab == 0 }]">Оперативная информация</li>
                    <li v-on:click="updateSelectedTab(1)" v-bind:class="['tabs__item', { 'tabs__item--active': selectedTab == 1 }]">Поиск</li>
                </ul>
                <div v-bind:class="['tabs__content', { 'tabs__content--active': selectedTab == 0 }]">
                    <div v-if="CurrentTrip.Car" class="form-group">
                        <table class="table text-muted">
                            <colgroup>
                                <col />
                                <col />
                                <col style="width: 1.25em;" />
                            </colgroup>
                            <tbody>
                                <tr>
                                    <th colspan="2">
                                        {{CurrentTrip.Car.Name}} ({{CurrentTrip.Car.Serial}}) - {{CurrentTrip.VRN}}
                                    </th>
                                    <th>
                                        <div class="text-center">
                                            <a class="" href="javascript:void(0)" v-on:click="CurrentTrip.ClearTrip()"><i class="fa fa-times"></i></a>
                                        </div>
                                    </th>
                                </tr>
                                <tr>
                                    <td>Начало периода</td>
                                    <td>{{CurrentTrip.S.D}} - {{CurrentTrip.S.T}}</td>
                                    <td class="text-center"><a href="javascript:void(0)" v-on:click="CurrentTrip.Shift(-1)"><i class="fa fa-chevron-up"></i></a></td>
                                </tr>
                                <tr>
                                    <td>Конец периода</td>
                                    <td>{{CurrentTrip.E.D}} - {{CurrentTrip.E.T}}</td>
                                    <td class="text-center"><a href="javascript:void(0)" v-on:click="CurrentTrip.Shift(1)"><i class="fa fa-chevron-down"></i></a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <table v-if="CurrentTrip.Items.length">
                        <tr v-for="o in CurrentTrip.Items" v-if="o.Type>=0">
                            <td v-if="o.Type==0" colspan="2">
                                <span v-if="o.MoveDuration" class="badge badge-success">
                                    <i class="fa fa-play-circle"></i> движение: {{o.MoveDuration}}
                                </span>
                                <span v-if="o.ParkDuration" class="badge badge-primary">
                                    <i class="fa fa-stop-circle"></i> стоянка: {{o.ParkDuration}}
                                </span>
                            </td>

                            <td v-if="o.Type==1">{{o.S.T}}&thinsp;&ndash;&thinsp;{{o.E.T}}</td>
                            <td v-if="o.Type==1" class="pl-2">
                                <i class="fa fa-map-marker text-muted"></i>
                                <a href="javascript:void(0)" v-on:click="gotoPoint(o.PStart)">
                                    {{o.GF.Name}}
                                </a>
                            </td>
                        </tr>
                    </table>
                    <div v-else class="alert alert-primary" role="alert">
                        Нет рейсов за этот период
                    </div>
                </div>
                <div v-bind:class="['tabs__content', { 'tabs__content--active': selectedTab == 1 }]">
                    <form data-id="info-params">
                        <div class="form-row">
                            <div class="col-12 pt-1">
                                <div class="form-group">
                                    <input type="text" class="form-control" placeholder="Введите название геозоны" v-model="geofenceFindText">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col-12">
                                <div v-if="this.geofenceFindList.length" class="feedback alert alert-success" role="alert">
                                    Найдено геозон: {{this.geofenceFindList.length}}
                                </div>
                                <div v-else class="feedback alert alert-primary" role="alert">
                                    Не найдено ни одной геозоны
                                </div>
                            </div>
                        </div>
                        <div class="form-row form-group" v-if="this.geofenceFindList.length">
                            <div class="col-12" style="max-height: 10rem; overflow-y: auto;">
                                <table class="table table-hover">
                                    <tbody>
                                        <tr v-for="o in geofenceFindList">
                                            <td><a href="javascript:void(0)" v-on:click="gotoGeofence(o)">{{o.Name}}</a></td>
                                            <td class="text-right"><a href="javascript:void(0)" v-on:click="GFTrip.Show(o)">(рейсы)</a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                    <div style="width:100%; overflow-y:auto" data-id="info-result">
                        <table style="width: 100%;" class="form-group text-muted" v-if="GFTrip.S.D">
                            <tr>
                                <td>Начало периода</td>
                                <td class="text-right">{{GFTrip.S.D}} - {{GFTrip.S.T}}</td>
                            </tr>
                            <tr>
                                <td>Конец периода</td>
                                <td class="text-right">{{GFTrip.E.D}} - {{GFTrip.E.T}}</td>
                            </tr>
                            <tr>
                                <td>Геозона</td>
                                <td class="text-right">{{GFTrip.Name}}</td>
                            </tr>
                        </table>
                        <template v-if="GFTrip.Items.length">
                            <table style="width:100%;" class="mt-1">
                                <tbody>
                                <tr v-for="o in GFTrip.Items">
                                    <td>{{o.S.D}} - {{o.S.T}}</td>
                                    <td>{{o.Name}}</td>
                                    <td>{{o.Serial}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </template>
                        <template v-else>
                            <div class="alert alert-primary" role="alert">
                                Не найдено ни одного рейса
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import Menu from '@/components/Menu.vue';
    import L from 'leaflet';
    import './assets/js/leaflet.markercluster-src.js';
    import {$bus, connector} from './main';
    import {IEnumDeviceItem, IGeofenceItem, IGetOnlineInfoItem} from './assets/ts/ServiceConnector';
    import moment from 'moment';
    import {buildCircle, buildPolygon, buildTooltip, markerGetIcon} from './assets/ts/Extenders';
    import {CarTrip} from './assets/ts/CarTrip';
    import {GFTrip} from './assets/ts/GFTrip';

    @Component({
        components: {
            Menu,
        },
    })

    export default class Home extends Vue {
        private CurrentTrip: CarTrip;
        private GFTrip: GFTrip = new GFTrip();

        private carGroups: any = {};
        private cars: any = {};

        private geofenceFindText: string = '';
        private geofenceFindList: IGeofenceItem[] = [];
        private geofences: any = {};
        private geofenceLoaded: boolean = false;
        private geofenceSelected: IGeofenceItem[] = [];
        private geofenceList: IGeofenceItem[] = [];

        private layerGFCompleted: any = {};
        private layerGFs: any = {};

        private map: L.Map | undefined;
        private layerCars: L.LayerGroup = L.layerGroup([], {});
        private groupActiveID: string = '';
        private geofenceCompleted: any = {};
        private selectedTab: number = 0;

        constructor() {
            super();
            this.CurrentTrip = new CarTrip(connector);
        }

        private created() {
            $bus.$on('car-group-changed', (id: string) => {
                this.groupActiveID = id;
                this.refreshPositions();
            });

            this.$watch('geofenceFindText', () => {
                setTimeout(() => {
                    let name = this.geofenceFindText.trim();
                    this.geofenceFindList = name.length >= 2 ? this.geofenceList.filter((f: any) => f.Name.indexOf(name) >= 0) : [];
                }, 300)
            });

            this.$watch('geofenceLoaded', () => {
                $bus.$on('geo-group-changed', (id: string) => { // todo (all)
                    if (this.layerGFs.options) {
                        this.layerGFs.clearLayers();
                        this.layerGFCompleted.clearLayers();
                    }
                    if (id) {
                        this.geofenceList.forEach((p: IGeofenceItem) => {
                            if (p.ParentID != id) return;

                            let isCompleted = this.geofenceCompleted[p.ID];
                            if (p.IsPolygon) buildPolygon(p, this.layerGFs);
                            else buildCircle(p,
                                isCompleted ? this.layerGFCompleted : this.layerGFs,
                                isCompleted ? 'green' : 'red',
                                (e: any) => this.GFTrip.Show(this.geofences[e.target.options.__id]));
                        })
                    }
                });
            })
        }

        private mounted() {
            this.CurrentTrip.map = this.map = L.map('map', {preferCanvas: true, renderer: L.canvas()});
            this.map
                .addLayer(L.tileLayer(
                    // '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    '//{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                    {
                        updateWhenIdle: true,
                        detectRetina: true
                    }))
                .setView([55.5, 61.2], 13)
                .addLayer(this.layerCars)
                .addLayer(this.CurrentTrip.layerTrip);

            this.buildGFClusters();
            connector.EnumDevices()
                .then((r: any) => {
                    r.Groups.forEach((g: any) => this.carGroups[g.ID] = g);
                    r.Items.forEach((c: any) => this.cars[c.ID] = c);
                    $bus.$emit('car-groups-changed', this.carGroups);
                    this.refreshAllTrips();
                });

            connector.EnumGeofences()
                .then(r => {
                    $bus.$emit('geo-groups-changed', r.Groups);
                });

            this.updateSelectedTab(this.selectedTab);
        }

        private refreshAllTrips() {
            let sd = moment().startOf('day').toDate();
            let ed = new Date();

            let ids: any = [];
            for (let cID in this.cars) {
                if (ids.length >= 100) break;
                ids.push(cID);
            }

            this.geofenceCompleted = {};
            connector.GetStage(ids, sd, ed, 'GeoFence1').then((cars: any) => {
                cars && cars.forEach((car: any) => {
                    if (car.Items) {
                        car.Items.forEach((stageItem: any) => {
                            if (stageItem.StatusIDs) {
                                stageItem.StatusIDs.forEach((gfid: any) => {
                                    let items = this.geofenceCompleted[gfid];
                                    if (!items) this.geofenceCompleted[gfid] = items = [];
                                    items.push(stageItem);
                                })
                            }
                        });
                    }
                });
            })
        }

        private buildGFClusters() {
            setTimeout(() => {
                this.layerGFs = (<any>window)['L']['markerClusterGroup']({
                    //spiderfyDistanceMultiplier: 2
                    iconCreateFunction: function (c: any) {
                        return new L.DivIcon({
                            html: c ? c.getChildCount().toString() : '',
                            className: 'cluster cluster-normal'
                        });
                    }
                });

                this.layerGFCompleted = (<any>window)['L'].markerClusterGroup({
                    iconCreateFunction: function (c: any) {
                        return new L.DivIcon({
                            html: c ? c.getChildCount().toString() : '',
                            className: 'cluster cluster-completed'
                        });
                    }
                });

                if (this.map) {
                    this.map.addLayer(this.layerGFs);
                    this.map.addLayer(this.layerGFCompleted);

                    connector.GetGeofences(['all']).then((r: any) => {
                        this.layerGFs.clearLayers();
                        this.layerGFCompleted.clearLayers();
                        this.geofences = this.CurrentTrip.geofences = {};
                        this.geofenceList = r;
                        this.geofenceFindText = '429';
                        if (r) r.forEach((p: any) => this.geofences[p.ID] = p);
                        this.geofenceLoaded = true;
                    })
                }
            }, 1000);
        }

        private markersClear() {
            this.layerCars.clearLayers();
        }

        private refreshPositions() {
            connector.GetOnlineInfo([this.groupActiveID])
                .then((r: any) => {
                    let bounds = L.latLngBounds([]);
                    this.markersClear();

                    Object.keys(r).forEach((i: any) => {
                        let p = r[i];

                        if (p != null && p._LastCoords != null) {
                            this.refreshPositionItem(p, bounds);
                        }
                    });

                    if (this.map)
                        this.map.fitBounds(bounds);
                });
        }

        private refreshPositionItem(p: IGetOnlineInfoItem, bounds: L.LatLngBounds) {
            let ll = L.latLng(p.LastPosition.Lat, p.LastPosition.Lng);
            let car = this.cars[p.ID];
            if (car) {
                L.marker(ll,
                    <any>{
                        icon: markerGetIcon(p, car),
                        __id: p.ID
                    })
                    .bindTooltip(buildTooltip(car, this.carGroups[car.ParentID], p))
                    .on('click', this.markerClick)
                    .addTo(this.layerCars)
                bounds.extend(ll);
            }
        }

        private markerClick(m: any) {
            let car: IEnumDeviceItem = this.cars[m.target.options.__id];
            let sd = moment().startOf('day').add('month', -1).toDate();
            let ed = moment(sd).add('day', 2).toDate();
            this.CurrentTrip.Build(car, sd, ed);
        }

        private gotoPoint(ll: L.LatLng) {
            if (this.map)
                this.map.setView(ll, 17);
        }

        private gotoGeofence(p: IGeofenceItem) {
            if (this.map)
                this.map.setView(L.latLng(p.Lat[0], p.Lng[0]), 17);
        }

        private updateSelectedTab(tab: number): void {
            this.selectedTab = tab;

            const tabsContent: HTMLElement = document.querySelector('.tabs__content--active') as HTMLElement;
            const pos: ClientRect = tabsContent.getBoundingClientRect() as ClientRect;

            tabsContent.style.maxHeight = (window.innerHeight - pos.top) + 'px';
        }
    }
</script>

<style lang="scss">
    $fa-font-path: './assets/fonts';

    @import './assets/scss/reset';
    @import '~leaflet/dist/leaflet.css';
    @import '~leaflet.markercluster/dist/MarkerCluster.css';
    @import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
    @import '~font-awesome/scss/font-awesome.scss';
    @import './assets/scss/app';
</style>
