class PocketQueryFilter {
    constructor() {
        this.filters = [];
    }

    add(field, value) {
        this.filters.push({ field, value });
        return this;
    }

    operator(operator) {
        // Eğer dizide eleman varsa...
        if (this.filters.length > 0) {
            // Sadece son elemanı al ve onun operatörünü ata.
            this.filters[this.filters.length - 1].operator = operator;
        }
        return this;
    }

    getFilters() {
        return this.filters;
    }
}

export default PocketQueryFilter;