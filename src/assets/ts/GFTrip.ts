import {IGeofenceItem} from './ServiceConnector'
import {connector} from '../../main'
import moment from 'moment'
import {getDT} from './Extenders'

export class GFTrip {
    S: any = {D: '', T: ''};
    E: any = {D: '', T: ''};
    Name: string = '';
    Items: any[] = [];

    public Show(p: IGeofenceItem) {
        let sd = moment().startOf('month').add('month', -1).toDate();
        let ed = new Date();

        this.S = getDT(sd);
        this.E = getDT(ed);
        this.Items = [];
        this.Name = p.Name;
        connector.CacheFind([], sd, ed, 'GeoFence1', [p.ID])
            .then((r: any) => {
                let items: any[] = [];
                r.forEach((f: any) => {
                    f.Items.forEach((it: any) => {
                        items.push({
                            S: getDT(it.SD, true),
                            E: getDT(it.ED, true),
                            Name: f.Name,
                            Serial: f.Serial
                        });
                    });
                });
                this.Items = items.sort((a, b) => a.S.V.localeCompare(b.S.V));
            });
    }
}
