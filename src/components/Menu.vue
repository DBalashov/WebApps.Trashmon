<template>
    <nav class="menu">
        <ul class="menu__wrapper">
            <li :class="['menu__item', { 'menu__item--open': openedItem === 0 }]">
                <a href="#no-click" class="menu__name" v-on:click="toggle(0, $event)">Транспорт</a>
                <ul class="menu-sub">
                    <li :class="['menu-sub__item', {'menu-sub__item--active': CarGroupID == g.ID}, {'menu-sub__item--separator': !g.ParentID}]" v-for="g in CarGroups">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeCarGroup(g.ID, $event)">{{g.Name}}</a>
                    </li>
                </ul>
            </li><!--
            --><li :class="['menu__item', { 'menu__item--open': openedItem === 1 }]">
                <a href="#no-click" class="menu__name" v-on:click="toggle(1, $event)">Геозоны</a>
                <ul class="menu-sub">
                    <li :class="['menu-sub__item', {'menu-sub__item--active': !GeoGroupID}]">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeGeoGroup('', $event)">(ничего)</a>
                    </li>
                    <li :class="['menu-sub__item', {'menu-sub__item--active': GeoGroupID == g.ID}, {'separator': !g.ParentID}]" v-for="g in GeoGroups">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeGeoGroup(g.ID, $event)">{{g.Name}}</a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { $bus } from '../main';
    import { IEnumCommonGroup } from '../assets/ts/ServiceConnector';

    @Component
    export default class Menu extends Vue {
        private CarGroups: IEnumCommonGroup[] = [];
        private CarGroupID: string = '';
        private GeoGroups: IEnumCommonGroup[] = [];
        private GeoGroupID: string = '';
        private openedItem: number|null = null;

        public toggle(index: number, e: Event): void {
            if (this.openedItem === index) {
                this.openedItem = null;
            } else {
                this.openedItem = index;
            }

            e.preventDefault();
        }

        public mounted(): void {
            $bus.$on('car-groups-changed', (groups: any) => {
                this.CarGroups = this.preprocessGroups(groups);
                let rootGroup: any = this.CarGroups.find((f: any) => !f.ParentID);
                this.changeCarGroup(rootGroup.ID);
            });

            $bus.$on('geo-groups-changed', (groups: any) => {
                this.GeoGroups = this.preprocessGroups(groups);
                this.changeGeoGroup('');
            });

            document.body.addEventListener('click', (e: any) => {
                if (!e.target.closest('.menu__item--open')) {
                    this.openedItem = null;
                }
            });
        }

        private preprocessGroups(groups: any): IEnumCommonGroup[] {
            let g: IEnumCommonGroup[] = [];
            let rootGroup: any = {};

            for (let groupID in groups) {
                let group = groups[groupID];
                if (group.ParentID) {
                    g.push(group);
                } else {
                    rootGroup = group;
                }
            }

            rootGroup.Name = '(все)';

            let gr: IEnumCommonGroup[] = Object.values(groups);

            gr = gr.filter((a: IEnumCommonGroup) => a.ParentID === rootGroup.ID);
            gr = gr.sort(
                (a: IEnumCommonGroup, b: IEnumCommonGroup) => a.Name > b.Name ? 1 : (b.Name > a.Name ? -1 : 0),
            );

            return [rootGroup].concat(gr);
        }

        private changeCarGroup(id: string, e?: Event) {
            this.CarGroupID = id;
            $bus.$emit('car-group-changed', id);

            if (e) {
                e.preventDefault();
            }
        }

        private changeGeoGroup(id: string, e?: Event) {
            this.GeoGroupID = id;
            $bus.$emit('geo-group-changed', id);

            if (e) {
                e.preventDefault();
            }
        }
    }
</script>

<style scoped lang="scss">
    .menu {
        &__wrapper {

        }

        &__item {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            margin-right: 1em;
            white-space: nowrap;
        }

        &__name {
            display: block;
            padding: .5em 1em .5em .5em;
            color: rgba(255, 255, 255, 0.5);

            &:hover {
                color: rgba(255, 255, 255, 0.75);
            }

            &:after {
                content: "";
                position: absolute;
                top: 50%;
                right: 0;
                margin-top: -2px;
                border-left: 4px solid transparent;
            	border-right: 4px solid transparent;
            	border-top: 6px solid currentColor;
            }
        }

        &-sub {
            position: absolute;
            opacity: 0;
            visibility: hidden;
            top: 100%;
            margin-top: 7px;
            transition: .25s;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
            background: #fff;

            &:before {
                content: "";
                position: absolute;
                left: 0;
                top: -5px;
                right: 0;
                height: 4px;
                border-radius: 50%;
                box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.5);
            }

            &__item {
                &--active {
                    color: #fff;
                    background-color: #007bff;
                }

                &--separator {
                    border-bottom: 1px solid #ccc;
                }
            }

            &__name {
                display: block;
                padding: .25em 1em;
            }
        }

        &__item--open &__name:after {
            transform: rotate(180deg);
        }

        &__item--open &-sub {
            opacity: 1;
            visibility: visible;
            z-index: 99999;
        }
    }
</style>
