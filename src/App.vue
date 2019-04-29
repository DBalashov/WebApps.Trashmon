<template>
    <div id="app">
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons" />
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

        constructor() {
            super();
            this.CurrentTrip = new CarTrip(connector);
        }

        created() {
            //$(window).on("resize", this.updateSize);

            $bus.$on('car-group-changed', (id: string) => {
                this.groupActiveID = id;
                this.refreshPositions();
            });

            /*
            this.$watch('geofenceFindText', setTimeout(() => {
                let name = this.geofenceFindText.trim();
                this.geofenceFindList = name.length >= 2 ? this.geofenceList.filter((f: any) => f.Name.indexOf(name) >= 0) : [];
            }, 300));
            */

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

        mounted() {
            // this.updateSize();
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
                })
        }

        refreshAllTrips() {
            let sd = moment().startOf('day').toDate();
            let ed = new Date();

            let ids: any = [];
            for (let cID in this.cars) {
                if (ids.length >= 100) break;
                ids.push(cID);
            }

            this.geofenceCompleted = {};
            connector.GetStage(ids, sd, ed, "GeoFence1").then((cars: any) => {
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

        buildGFClusters() {
            setTimeout(() => {
                this.layerGFs = (<any>window)['L']['markerClusterGroup']({
                    //spiderfyDistanceMultiplier: 2
                    iconCreateFunction: function (c: any) {
                        return new L.DivIcon({
                            html: c ? c.getChildCount().toString() : "",
                            className: "cluster cluster-normal"
                        });
                    }
                });

                this.layerGFCompleted = (<any>window)["L"].markerClusterGroup({
                    iconCreateFunction: function (c: any) {
                        return new L.DivIcon({
                            html: c ? c.getChildCount().toString() : "",
                            className: "cluster cluster-completed"
                        });
                    }
                });

                if (this.map) {
                    this.map.addLayer(this.layerGFs);
                    this.map.addLayer(this.layerGFCompleted);

                    connector.GetGeofences(["all"]).then((r: any) => {
                        this.layerGFs.clearLayers();
                        this.layerGFCompleted.clearLayers();
                        this.geofences = this.CurrentTrip.geofences = {};
                        this.geofenceList = r;
                        this.geofenceFindText = "429";
                        if (r) r.forEach((p: any) => this.geofences[p.ID] = p);
                        this.geofenceLoaded = true;
                    })
                }
            }, 1000);
        }
/*
        updateSize() {
            let winH: number = (<number>$(window).height());

            let $info: JQuery = $("[data-id='info']");

            let $infoResult: JQuery = $("[data-id='info-result']");

            $("#map").height(winH - (<any>$(".fixed-top").outerHeight()));

            if ($info.is(':visible')) {
                $info.height(winH - (<any>$info.offset()).top);
            }

            if ($infoResult.is(':visible')) {
                $infoResult.height(winH - (<any>$infoResult.offset()).top);
            }
        }
*/
        markersClear() {
            this.layerCars.clearLayers();
        }

        refreshPositions() {
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

        refreshPositionItem(p: IGetOnlineInfoItem, bounds: L.LatLngBounds) {
            let ll = L.latLng(p.LastPosition.Lat, p.LastPosition.Lng);
            let car = this.cars[p.ID];
            if (car) {
                L.marker(ll,
                    <any>{
                        icon: markerGetIcon(p, car),
                        __id: p.ID
                    })
                    .bindTooltip(buildTooltip(car, this.carGroups[car.ParentID], p))
                    .on("click", this.markerClick)
                    .addTo(this.layerCars)
                bounds.extend(ll);
            }
        }

        markerClick(m: any) {
            let car: IEnumDeviceItem = this.cars[m.target.options.__id];
            let sd = moment().startOf('day').add('month', -1).toDate();
            let ed = moment(sd).add('day', 2).toDate();
            this.CurrentTrip.Build(car, sd, ed);
        }

        gotoPoint(ll: L.LatLng) {
            if (this.map)
                this.map.setView(ll, 17);
        }

        gotoGeofence(p: IGeofenceItem) {
            if (this.map)
                this.map.setView(L.latLng(p.Lat[0], p.Lng[0]), 17);
        }
    }
</script>

<style lang="scss">
    @import './assets/scss/reset';
    @import '~leaflet/dist/leaflet.css';
    @import '~leaflet.markercluster/dist/MarkerCluster.css';
    @import '~leaflet.markercluster/dist/MarkerCluster.Default.css';

    *,
    *:before,
    *:after {
        box-sizing: border-box;
    }

    html,
    body {
        height: 100%;
    }

    body {
        font: 1em/1.5 "Roboto Condensed", sans-serif;
        color: #212529;
        background: #fff;
    }

    .header {
        display: flex;
        align-items: center;
        height: 64px;
        padding: .75em 2em;
        background: #343a40;

        &__logo {
            margin-right: 1em;
            font-size: 1.25em;
            color: #fff;
        }
    }

    .layout {
        display: flex;
        align-items: stretch;
        height: calc(100vh - 64px);

        &__left {
            flex: 0 0 75%;
        }

        &__right {
            flex: 0 0 calc(25% - 4px);
            border-left: 4px solid #343a40;
        }

        &__menu {
            flex: 0 0 1;
        }
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    // ---

    .map {
        height: calc(100vh - 64px);
    }

    .car-marker {
        width:auto !important;
        height:auto !important;
        background: rgba(255,255,255, 0.6);
        border-radius: 5px;
        border: 1.5px solid rgba(0,0,255, 0.4);
        padding:2px 2px 0 2px;
        text-align: center;
        box-shadow: 0 0 10px 0 rgba(0,0,0,0.25);
    }

    .car-marker:after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -7px;
        margin-left: -6px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(0,0,255, 0.4);
        z-index: 1;
    }

    .car-marker.old-data {
        border-color: rgba(255,0,0,0.4);
    }
    .car-marker.old-data .car-marker__title {
        background: rgba(255,0,0,0.4);
    }

    .car-marker.old-data:after {
        border-top-color: rgba(255,0,0,0.4);
    }

    .car-marker__image {
        width: 36px;
    }

    .car-marker__title {
        position: absolute;
        left: 0;
        min-width: 100%;
        transform: translateY(-100%);
        margin-top: -6px;
        padding: 0 2px;
        font-size: 7pt;
        color: #fff;
        font-weight: normal;
        text-align:center;
        line-height: 1.1em;
        max-height: 2em;
        overflow:hidden;
        border-radius: 2px;
        background: rgba(255,0,0,0.4);
    }

    .cluster {
        width: 32px !important;
        height: 32px !important;
        border-radius: 50%;
        text-align: center;
        line-height: 32px !important;
        color: white;
        font-weight: normal;
        font-size: 10pt;
    }

    .cluster-normal {
        background-color: rgba(255,0,0,0.5);
        border: 1px solid red;
        box-shadow:0px 0px 10px 0px rgba(255,0,0,0.75);
    }

    .cluster-completed {
        background-color: rgba(0,255,0,0.5);
        border: 1px solid rgba(0,255,0,0.5);
        color: #212529;
        box-shadow:0px 0px 10px 0px rgba(0, 255, 0, 0.8);
    }
</style>
