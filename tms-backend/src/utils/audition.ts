/**
 * add created, updated relation to filter
 *
 * @param filter
 */
export default class AuditionedUtils {
    static includeAuditionedFilter = (filter: any) => {
        let include: any[] = []

        if (!filter)
            filter = {}

        if (filter.include)
            include = filter.include

        let including = this.getAuditionedInclude()
        including.forEach((item) => {
            include.push(item)
        })

        filter.include = include

        return filter;
    }

    static getAuditionedInclude = () => {
        let include: any[] = []

        include.push({
            relation: 'created',
            scope: {
                fields: { username: true, email: true, first_name: true, last_name: true }
            }
        })

        include.push({
            relation: 'updated',
            scope: {
                fields: { username: true, email: true, first_name: true, last_name: true }
            }
        })

        return include;
    }
}

