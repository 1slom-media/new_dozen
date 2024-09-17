import { isEmpty } from 'class-validator';
import { defaultQueryValues } from '../defaults/defaults';

const extractQuery = (query) => {
    const result = {};
    const defaultProps = Object.assign({}, defaultQueryValues);
    if (query && Object.keys(query).length) {
        for (const [key, value] of Object.entries(query)) {
            if (
                !isEmpty(value) &&
                key != 'limit' &&
                key != 'page' &&
                key != 'filter' &&
                key != 'userId' &&
                key != 'type' &&
                key != 'status' &&
                key != 'phone' &&
                key != 'name' &&
                key != 'startTime' &&
                key != 'endTime' &&
                key != 'category' &&
                key != 'region' &&
                key != 'color' &&
                key != 'minPrice' &&
                key != 'maxPrice' &&
                key != 'brand'
            ) {
                result[key] = value;
            } else if (!isEmpty(value) && key == 'page') {
                let num: any = value;
                defaultProps.page = isNaN(Number(num)) ? 1 : num - 0;
            } else if (!isEmpty(value) && key == 'limit') {
                let num: any = value;
                defaultProps.limit = isNaN(Number(num)) ? 10 : num - 0;
            } else {
                if (!isEmpty(value)) {
                    defaultProps[key] = value;
                }
            }
        }
    }

    return {
        filters: result,
        sorts: defaultProps,
    };
};

export default extractQuery;
