export default class DataUtils {
    static sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    static getCountWhere(search: any) {
        let where: any = { and: [ {} ] };

        Object.keys(search).forEach(function(key) {
            if (key=='value' || key=='num_fields') {
                // ignore
            }
            else if (key=='fields') {
                const fields = JSON.parse(search['fields'])
                const value = search['value'].trim()
                const num_fields = search['num_fields']!=null ? search['num_fields'] : ""

                let condition: any[] = [];
                fields.forEach(function(field: string) {
                    if (num_fields.includes(field)) {
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
            }
            else if (key =='custom') {
                const custom = JSON.parse(search['custom'])
                custom.forEach(function(item: any) {
                    where.and.push(item)
                })
            }
            else {

            }
        })

        return where
    }

    static getFilters(limit: number, skip: number, search?: any, order?: string) {
        let filter: any = {	limit: limit, skip: skip }

        if (search!=null) {
            let where: any = { and: [ {} ] };
            Object.keys(search).forEach(function(key) {
                if (key=='value' || key=='num_fields') {
                    // ignore
                }
                else if (key=='fields') {
                    const fields = JSON.parse(search['fields'])
                    const value = search['value'].trim()
                    const num_fields = search['num_fields']!=null ? search['num_fields'] : ""

                    let condition: any[] = [];
                    fields.forEach(function(field: string) {
                        if (num_fields.includes(field)) {
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
                }
                else if (key =='custom') {
                    const custom = JSON.parse(search['custom'])
                    custom.forEach(function(item: any) {
                        where.and.push(item)
                    })
                }
                else {

                }
            })

            filter.where = where;
        }

        if (order!=null && order!="")
            filter.order = order

        return filter;
    }

    static getWhere(value?: string, fields?: string[], num_fields?: string, custom?: any[]) {
        if (value==null || value.trim()=="")
            return {};

        let where: any = { and: [ {} ] };
        value = value.trim()
        let condition: any[] = [];

        fields?.forEach((field: string) => {
            if (num_fields!=null && num_fields.includes(field)) {
                let item: any = {}
                let num_value = value?.replace(/\D/g, '')
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

    static getFilter(limit: number, skip: number, order: string, value?: string, fields?: string[], num_fields?: string, custom?: any[], include?: any[]) {
        let filter: any = { }
        if (limit)
            filter.limit = limit
        if (skip)
            filter.skip = skip
        if (order && order!="")
            filter.order = order

        if (value==null /* || value.trim()=="" */)
            return filter;

        let where: any = { and: [ {} ] };
        value = value.trim()
        let condition: any[] = [];

        fields?.forEach((field: string) => {
            if (num_fields!=null && num_fields.includes(field)) {
                let item: any = {}
                let num_value = value?.replace(/\D/g, '')
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

