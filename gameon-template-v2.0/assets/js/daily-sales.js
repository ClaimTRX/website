$(document).ready(function() {
    fetchDailyEnergySales();
});

function fetchDailyEnergySales() {
    $.ajax({
        url: 'http://157.245.39.65:3000/api/daily-energy-sales', // Point to Ubuntu server
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const tbody = $('#daily-sales-body');
            tbody.empty();
            if (response.success && response.data.length > 0) {
                response.data.forEach(row => {
                    const tr = $('<tr>');
                    tr.append(`<td>${row.date}</td>`);
                    tr.append(`<td>${row.energySold}</td>`);
                    tr.append(`<td>${row.trxIncome} TRX</td>`);
                    tr.append(`<td>${row.cftIncome} CFT</td>`);
                    tbody.append(tr);
                });
            } else {
                tbody.append('<tr><td colspan="4" class="text-center">No data available</td></tr>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching daily energy sales:', error);
            const tbody = $('#daily-sales-body');
            tbody.empty();
            tbody.append('<tr><td colspan="4" class="text-center">Error loading data: ' + error + '</td></tr>');
        }
    });
}
