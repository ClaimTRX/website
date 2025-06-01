$(document).ready(function() {
    // Fetch daily energy sales data when the page loads
    fetchDailyEnergySales();
});

function fetchDailyEnergySales() {
    $.ajax({
        url: '/api/daily-energy-sales',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            const tbody = $('#daily-sales-body');
            tbody.empty(); // Clear loading message

            if (response.success && response.data.length > 0) {
                // Populate table with data
                response.data.forEach(row => {
                    const tr = $('<tr>');
                    tr.append(`<td>${row.date}</td>`);
                    tr.append(`<td>${row.energySold}</td>`);
                    tr.append(`<td>${row.trxIncome} TRX</td>`);
                    tr.append(`<td>${row.cftIncome} CFT</td>`);
                    tbody.append(tr);
                });
            } else {
                // Show message if no data
                tbody.append('<tr><td colspan="4" class="text-center">No data available</td></tr>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching daily energy sales:', error);
            const tbody = $('#daily-sales-body');
            tbody.empty();
            tbody.append('<tr><td colspan="4" class="text-center">Error loading data</td></tr>');
        }
    });
}
