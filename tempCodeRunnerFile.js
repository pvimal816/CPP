
    function addDate(date, offset){
        return new Date(Date.UTC(date.getFullYear(), date.getMonth()+1, date.getDate()) + 
        (offset * 24 * 3600 * 1000));
    }
    console.log(addDate(new Date(), 10));
