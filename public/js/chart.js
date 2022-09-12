const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun'
];

const data = {
    labels,
    datasets: [
        {
            label: 'My first dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45]
        },
        {
            label: 'My second dataset',
            backgroundColor: 'rgb(34, 219, 132)',
            borderColor: 'rgb(34, 219, 132)',
            data: [4, 8, 10, 2, 20, 25, 30]
        }
    ]
};

const config = {
    type: 'line',
    data,
    options: {}
}

const myChar = new Chart(
    document.getElementById('trackingCanvas'),
    config
);