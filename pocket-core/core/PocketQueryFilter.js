class PocketQueryFilter {
     constructor () {
          this.filters = [];
     }

     add(field, value) {
          this.filters.push({ field, value });
          return this;
     }

     operator(operator) {
          this.filters.forEach(filter => {
               filter.operator = operator;
          });
          return this;
     }

     getFilters() {
          return this.filters;
     }
}

export default PocketQueryFilter;
