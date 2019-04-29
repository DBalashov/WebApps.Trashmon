<template>
    <nav class="menu">
        <ul class="menu__wrapper">
            <li class="menu__item">
                <a href="#no-click" class="menu__name" @click="toggle">Транспорт</a>
                <ul class="menu-sub">
                    <li :class="['menu-sub__item', {'menu-sub__item--active': CarGroupID == g.ID}, {'menu-sub__item--separator': !g.ParentID}]" v-for="g in CarGroups">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeCarGroup(g.ID)">{{g.Name}}</a>
                    </li>
                </ul>
            </li><!--
            --><li class="menu__item">
                <a href="#no-click" class="menu__name" @click="toggle">Геозоны</a>
                <ul class="menu-sub">
                    <li :class="['menu-sub__item', {'menu-sub__item--active': !GeoGroupID}]">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeGeoGroup('')">(ничего)</a>
                    </li>
                    <li :class="['menu-sub__item', {'menu-sub__item--active': GeoGroupID == g.ID}, {'separator': !g.ParentID}]" v-for="g in GeoGroups">
                        <a href="#no-click" class="menu-sub__name" v-on:click="changeGeoGroup(g.ID)">{{g.Name}}</a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { $bus } from '../main';
    import { IEnumCommonGroup } from "../assets/ts/ServiceConnector"

    @Component
    export default class Menu extends Vue {
        private readonly classOpen = 'menu__item--open';
        private CarGroups: IEnumCommonGroup[] = [];
        private CarGroupID: string = '';
        private GeoGroups: IEnumCommonGroup[] = [];
        private GeoGroupID: string = '';

        constructor() {
            super();
            document.body.addEventListener('click', (e: any) => {
                if (!e.target.closest('.' + this.classOpen)) {
                    const opened = document.body.querySelectorAll('.' + this.classOpen);

                    if (opened) {
                        [].forEach.call(opened, (i: HTMLElement) => i.classList.remove(this.classOpen));
                    }
                }
            });
        }

        public toggle(e: any): void {
            e.preventDefault();
            e.target.parentNode.classList.toggle(this.classOpen);
        }

        public mounted(): void {
            $bus.$on('car-groups-changed', (groups: any) => {
                this.CarGroups = this.preprocessGroups(groups);
                let rootGroup: any = this.CarGroups.find((f: any) => !f.ParentID);
                this.changeCarGroup(rootGroup.ID);
            });

            $bus.$on('geo-groups-changed', (groups:any) => {
                this.GeoGroups = this.preprocessGroups(groups);
                this.changeGeoGroup('');
            });
        }

        private preprocessGroups(groups: any): IEnumCommonGroup[] {
            let g: IEnumCommonGroup[] = [];
            let rootGroup: any = {};

            for (let groupID in groups) {
                let group = groups[groupID];
                if (group.ParentID) g.push(group);
                else rootGroup = group;
            }

            rootGroup.Name = "(все)";

            let gr: IEnumCommonGroup[] = Object.values(groups);

            return [rootGroup]
                .concat(
                    gr.filter((a: IEnumCommonGroup) => a.ParentID == rootGroup.ID)
                    .sort((a: IEnumCommonGroup, b: IEnumCommonGroup) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0))
                );
        }

        private changeCarGroup(id: string) {
            this.CarGroupID = id;
            $bus.$emit('car-group-changed', id);
        }

        private changeGeoGroup(id: string) {
            this.GeoGroupID = id;
            $bus.$emit('geo-group-changed', id);
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
                transition: .25s;
            }
        }

        &-sub {
            position: absolute;
            opacity: 0;
            visibility: hidden;
            top: 100%;
            margin-top: .75em;
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
