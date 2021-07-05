const moment = require('moment');

const generateDays = (days) => {
    return moment().subtract(days, "days").toDate();
}

const geneateServiceFilter = (filter) => {
    if (filter === "week")
        return generateDays(7);
    else if (filter === "month")
        return generateDays(30);
    else if (filter === "year")
        return generateDays(365);
    else return '';
}

module.exports = geneateServiceFilter;