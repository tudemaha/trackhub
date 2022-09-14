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

    const data = {
        labels,
        datasets: [
            {
                label: 'Likes',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: likes
            },
            {
                label: 'Views',
                backgroundColor: 'rgb(34, 219, 132)',
                borderColor: 'rgb(34, 219, 132)',
                data: views
            }
        ]
    };
    
    const config = {
        type: 'line',
        data,
        options: {}
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