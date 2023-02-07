
export class PageRequest {
    limit?: number;
    skip?: number;
    order?: string;
    value?: string;

    role_id?: number;
    user_id?: number;
    status?: string;

    constructor() {
    }

    getWhere(fields: string[], num_fields?: string, custom?: any[]) {
        if (this.value==null || this.value.trim()=="")
            return {};

        let where: any = { and: [ {} ] };
        let value = this.value.trim()
        let condition: any[] = [];

        fields.forEach((field: string) => {
            if (num_fields!=null && num_fields.includes(field)) {
                let item: any = {}
                let num_value = value.replace(/\D/g, '')
                if (num_value!="") {
                    item[field] = { like: '%'+num_value+'%'}
                    condition.push(item)
                }
            } else {
                let item: any = {}
                item[field] = { like: '%'+value+'%'}
                condition.push(item)
            }
        })

        if (condition.length>0)
            where.and.push({or: condition})

        if (custom!=null && custom.length>0)
            custom.forEach(function(item: any) {
                where.and.push(item)
            })

        return where
    }

    getFilter(fields: string[], num_fields?: string, custom?: any[], include?: any[]) {
        let filter: any = { }
        if (this.limit)
            filter.limit = this.limit
        if (this.skip)
            filter.skip = this.skip
        if (this.order && this.order!="")
            filter.order = this.order

        if (this.value==null || this.value.trim()=="")
            return filter;

        let where: any = { and: [ {} ] };
        let value = this.value.trim()
        let condition: any[] = [];

        fields.forEach((field: string) => {
            if (num_fields!=null && num_fields.includes(field)) {
                let item: any = {}
                let num_value = value.replace(/\D/g, '')
                if (num_value!="") {
                    item[field] = { like: '%'+num_value+'%'}
                    condition.push(item)
                }
            } else {
                let item: any = {}
                item[field] = { like: '%'+value+'%'}
                condition.push(item)
            }
        })

        if (condition.length>0)
            where.and.push({or: condition})

        if (custom!=null && custom.length>0)
            custom.forEach(function(item: any) {
                where.and.push(item)
            })

        filter.where = where

        if (include!=null && include.length>0) {
            filter.include = []
            include.forEach(item => {
                filter.include.push(item)
            })
        }

        return filter
    }
}
