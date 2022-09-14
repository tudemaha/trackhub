const detailsBody = document.getElementById('detailsBody');
const participantId = document.getElementById('participantId');
const invalidAlert = document.getElementById('invalidAlert');
const canvas = document.getElementById('trackingCanvas');
let tracks = [];
let labels = [];
let likes = [];
let views = [];

detailsBody.onload = async () => {
    try {
        tracks = await fetchData();      
        if(tracks.length === 0) {
            errorDisplay();
        }
        chartUpdate();
    } catch(errors) {
        errorDisplay();
    }
}

const chartUpdate = () => {
    labels = tracks.map((track) => track.timestamp);
    likes = tracks.map((track) => track.likes);
    views = tracks.map((track) => track.views);

    Chart.defaults.font.family = "'Roboto', 'sans-serif'";

    const data = {
        labels,
        datasets: [
            {
                label: 'Likes',
                data: likes,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgb(255, 99, 132)',
                pointRadius: 4,
                pointHoverRadius: 8
            },
            {
                label: 'Views',
                data: views,
                backgroundColor: 'rgba(34, 219, 132, 0.6)',
                borderColor: 'rgb(34, 219, 132)',
                pointRadius: 4,
                pointHoverRadius: 8
            }
        ]
    };
    
    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${participantId.innerHTML}'s Likes and Views Tracking Details`,
                    font: {
                        size: 14
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tracking Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Likes/Views Count'
                    }
                }
            },
            stacked: false
        }
    }
    
    const myChar = new Chart(
        canvas,
        config
    );
}


const fetchData = () => {
    let data = fetch('/tracks', {
        method: 'POST',
        headers: {'Content-type': 'application/json; charset=UTF-8'},
        body: JSON.stringify({participant_id: participantId.innerHTML})
    })
    .then((response) => {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error('response not ok');
        }
    })
    .then((response) => response)
    .catch((error) => {
        throw error
    });

    return data;
}

const errorDisplay = () => {
    invalidAlert.style.display = 'block';
    canvas.style.display = 'none';
}