class PocketQueryFilter {
     constructor () {
          this.filters = [];
     }

     add(field, value) {
          this.filters.push({ field, value });
          return this; // Zincirleme yöntemi sağlamak için bu nesneyi döndürün
     }

     operator(operator) {
          this.filters.forEach(filter => {
               filter.operator = operator;
          });
          return this; // Zincirleme yöntemi sağlamak için bu nesneyi döndürün
     }

     getFilters() {
          return this.filters;
     }
}

export default PocketQueryFilter;
