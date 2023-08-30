document.addEventListener('DOMContentLoaded', function() {
    const mainAccount = document.getElementById('mainAccount');

    mainAccount.addEventListener('click', function(event) {
        if (event.target && event.target.className === 'add-account-btn') {
            addNewAccount(mainAccount);
        }

        if (event.target && event.target.className === 'paste-image-btn') {
            // Try to read from the clipboard
            navigator.clipboard.read().then(clipboardItems => {
                for (const clipboardItem of clipboardItems) {
                    for (const type of clipboardItem.types) {
                        if (type === "image/png" || type === "image/jpeg") {
                            clipboardItem.getType(type).then(blob => {
                                const img = new Image();
                                img.onload = function() {
                                    const container = event.target.parentNode;
                                    container.style.backgroundImage = `url(${img.src})`;
                                    container.style.backgroundBlendMode = 'multiply';
                                    container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // blend the image with a white background to achieve the opacity effect.
                                    container.insertBefore(img, event.target.nextSibling);
                                };
                                img.src = URL.createObjectURL(blob);
                            });
                            return;
                        }
                    }
                }
                alert("No supported image found in clipboard!");
            }).catch(err => {
                // Handle errors
                alert("Error accessing clipboard: " + (err.message || "Unknown error"));
            });
        }
    });

    function addNewAccount(parentElement) {
        const newAccountDiv = document.createElement('div');
        newAccountDiv.className = 'account-container';

        const pasteButton = document.createElement('button');
        pasteButton.className = 'paste-image-btn';
        pasteButton.textContent = 'Paste Image';

        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.className = 'profile-image-upload';

        const shapeSelect = document.createElement('select');
        shapeSelect.className = 'shape-selector';
        shapeSelect.innerHTML = `
                <option value="circle">Circle</option>
                <option value="hex">Hex</option>
                <option value="square">Square</option>
            `;

        const addButton = document.createElement('button');
        addButton.className = 'add-account-btn';
        addButton.textContent = 'Add Account';

        newAccountDiv.appendChild(pasteButton);
        newAccountDiv.appendChild(imageInput);
        newAccountDiv.appendChild(shapeSelect);
        newAccountDiv.appendChild(addButton);

        parentElement.appendChild(newAccountDiv);
    }

    document.addEventListener('change', function(event) {
        if (event.target && event.target.className === 'profile-image-upload') {
            const file = event.target.files[0];
            const container = event.target.parentNode;
            const reader = new FileReader();
    
            reader.onloadend = function() {
                container.style.backgroundImage = `url(${reader.result})`;
            }
            if (file) {
                reader.readAsDataURL(file);
            }
        }
    });
});