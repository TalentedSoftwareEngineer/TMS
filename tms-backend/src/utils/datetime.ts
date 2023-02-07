/**
 * add created, updated relation to filter
 *
 * @param filter
 */
export default class DateTimeUtils {
    static getCurrentTimestamp = () => {
        return Math.floor(new Date().getTime() / 1000);
    }
}

