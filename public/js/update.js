// udpate form
const updateForm = document.forms['update'];
const urlInput = document.getElementById('url');
const invalidAlert = document.getElementById('invalidAlert');

// details form
const detailsForm = document.forms['details'];
const thumbnail = document.getElementById('thumbnail');
const video_id = document.getElementById('video_id');
const participant_id = document.getElementById('participant_id');
const definition = document.getElementById('definition');
const title = document.getElementById('title');
const duration = document.getElementById('duration');
const published = document.getElementById('published');
const views = document.getElementById('views');
const likes = document.getElementById('likes');

updateForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // get YouTube id from urlInput
    let videoId = urlInput.value.split('v=')[1];
    if(videoId) {
        // if id valid
        invalidAlert.style.display = 'none';
        const ampersandPosition = videoId.indexOf('&');
        if(ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        // update details form
        fetch('/update', {
            method: 'POST',
            body: JSON.stringify({id: videoId}),
            headers: {'Content-type': 'application/json; charset=UTF-8'}
        })
        .then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                invalidAlert.style.display = 'block';
                return false;
            }
        })
        .then((response) => updateDetails(response[0]));
    } else {
        // if id is invalid
        invalidAlert.style.display = 'block';
    }
});

function updateDetails(data) {
    detailsForm.style.display = 'flex';
    video_id.value = data.id;
    definition.value = data.contentDetails.definition;
    thumbnail.src = data.snippet.thumbnails.standard.url;
    participant_id.value = data.snippet.title.substring(0, 4);
    title.value = data.snippet.title.substring(7, data.snippet.title.length);
    duration.value = data.contentDetails.duration;
    published.value = data.snippet.publishedAt;
    views.value = data.statistics.viewCount;
    likes.value = data.statistics.likeCount;

    thumbnail.scrollIntoView(true);
}