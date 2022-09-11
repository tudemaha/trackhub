const deleteButton = document.querySelectorAll('.deleteButton');
const modalBody = document.getElementById('deleteModalBody');
const modalParticipantId = document.getElementById('modalParticipantId');

deleteButton.forEach((btn) => {
    btn.addEventListener('click', function() {
        modalBody.innerHTML = "Really delete data <strong>" + this.dataset.participantId + "</strong>?";
        modalParticipantId.value = this.dataset.participantId;
    });
});