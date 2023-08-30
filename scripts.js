document.addEventListener('DOMContentLoaded', function() {
    const mainAccount = document.getElementById('mainAccount');

    mainAccount.addEventListener('click', function(event) {
        if (event.target && event.target.className === 'add-account-btn') {
            addNewAccount(event.target.parentNode);
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
                                    loadImagePreviewAndUpdateBackground(img, event.target.parentNode, event.target.nextSibling);
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

        if (event.target && event.target.className === 'delete-account-btn') {
            const accountContainer = event.target.closest('.account-container');
            if (accountContainer) {
                accountContainer.remove();
            }
        }
    });

    mainAccount.addEventListener('input', function(event) {
        if (event.target && event.target.className === 'profile-scale') {
            event.target.parentNode.querySelector('.profile-scale-numeric').value = event.target.value;
        }

        if (event.target && event.target.className === 'profile-scale-numeric') {
            event.target.parentNode.querySelector('.profile-scale').value = event.target.value;
        }
    });

    function loadImagePreviewAndUpdateBackground(img, parentNode, nextSibling)
    {
        const container = parentNode;
        container.style.backgroundImage = `url(${img.src})`;
        container.style.backgroundBlendMode = 'multiply';
        container.style.backgroundColor = 'rgba(68, 68, 68, 1)';

        // Get the preview element
        console.log('checking for name = '+parentNode.id);
        console.log('p = '+parentNode.id + 'Preview');
        const previewElem = document.getElementById(parentNode.id + 'Preview');
    
        // Check if there's an existing image inside the preview element and replace it, otherwise append the new image
        const existingImg = previewElem.querySelector('img');
        if (existingImg) {
            previewElem.replaceChild(img, existingImg);
        } else {
            previewElem.appendChild(img);
        }
    }

    function addNewAccount(parentElement) {
        // Get the count of account containers within the parent element
        const accountCount = parentElement.querySelectorAll('.account-container').length;

        const newAccountDiv = document.createElement('div');
        newAccountDiv.className = 'account-container';
        newAccountDiv.id = parentElement.id + '.' + accountCount;

        const imagePreview = document.createElement('div');
        imagePreview.className = 'account-image-preview';
        imagePreview.id = parentElement.id + '.' + accountCount + 'Preview';

        const pasteButton = document.createElement('button');
        pasteButton.className = 'paste-image-btn';
        pasteButton.textContent = 'Paste Image';

        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.className = 'profile-image-upload';

        const labelShape = document.createElement('label');
        labelShape.textContent = "Shape: "

        const shapeSelect = document.createElement('select');
        shapeSelect.className = 'shape-selector';
        shapeSelect.innerHTML = `
                <option value="circle">Circle</option>
                <option value="hex">Hex</option>
                <option value="square">Square</option>
            `;
        labelShape.appendChild(shapeSelect);

        const rangeInput = document.createElement('input');
        rangeInput.className = 'profile-scale';
        rangeInput.type = 'range';
        rangeInput.min = '0.1';
        rangeInput.max = '2';
        rangeInput.step = '0.01';
        rangeInput.value = '1';
        
        const numberInput = document.createElement('input');
        numberInput.className = 'profile-scale-numeric';
        numberInput.type = 'number';
        numberInput.min = '0.1';
        numberInput.max = '2';
        numberInput.step = '0.01';
        numberInput.value = '1';

        const addButton = document.createElement('button');
        addButton.className = 'add-account-btn';
        addButton.textContent = 'Add Account';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-account-btn';
        deleteButton.innerText = 'Delete';

        newAccountDiv.appendChild(imagePreview);
        newAccountDiv.appendChild(pasteButton);
        newAccountDiv.appendChild(imageInput);
        newAccountDiv.appendChild(labelShape);
        newAccountDiv.appendChild(rangeInput);
        newAccountDiv.appendChild(numberInput);
        newAccountDiv.appendChild(addButton);
        newAccountDiv.appendChild(deleteButton);

        // select the last add account button (which is the one in our div)
        var nodes = parentElement.querySelectorAll('.add-account-btn');
        console.log('found '+nodes.length+' buttons');

        // add new right above the button
        parentElement.insertBefore(newAccountDiv, nodes[nodes.length -1]);
    }

    document.addEventListener('change', function(event) {
        if (event.target && event.target.className === 'profile-image-upload') {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const img = new Image();
                    img.onload = function() {
                        loadImagePreviewAndUpdateBackground(img, event.target.parentNode, event.target.nextSibling);
                    };
                    img.src = reader.result;
                }
                reader.readAsDataURL(file);
            }
        }
    });
});

function saveConfiguration() {

    let existingA = document.getElementById('downloadA');

    function collectAccountData(container) {
        const config = {};

        const imagePreviewElem = container.querySelector('.account-image-preview img');
        config.image = imagePreviewElem ? imagePreviewElem.src : container.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
        config.shape = container.querySelector('.shape-selector').value;
        config.scale = container.querySelector('.profile-scale').value;

        // Recursive part: check for nested account containers and collect their data too
        const nestedAccounts = Array.from(container.querySelectorAll(':scope > .account-container'));
        config.accounts = nestedAccounts.map(collectAccountData);

        return config;
    }
    
    const rootAccountConfig = collectAccountData(document.getElementById('mainAccount'));

    const blob = new Blob([JSON.stringify(rootAccountConfig, null, 2)], { type: 'application/json' });

    const a = document.createElement('a');
    a.id = "downloadA";
    a.innerText = "config.json";
    a.href = URL.createObjectURL(blob);
    a.download = 'config.json';

    if(existingA)
    {
        existingA.replaceWith(a);
    }
    else
    {
        document.getElementById('backup-container').insertBefore(a, document.getElementById('saveConfigurationBtn'));
    }
}

document.querySelector('#loadConfigInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const config = JSON.parse(event.target.result);

        // Restore the configuration using the parsed data.
        // This is just a dummy example.
        // Restore images, shapes, scales, etc. from the config object.
    }

    reader.readAsText(file);
});

function generateImage() {
    let canvas = document.getElementById('outputCanvas');
    if(canvas)
    {
        canvas = document.getElementById('outputCanvas').replaceWith(document.createElement('canvas'))
    }
    else
    {
        canvas = document.createElement('canvas');
    }
    canvas.id = 'outputCanvas';
    const ctx = canvas.getContext('2d');

    // Draw your content onto the canvas.
    // For example, draw all the profile images, apply scales, etc.

    document.getElementById('generateContainer').insertBefore(canvas,document.getElementById('generateButton'));

    
    let existingA = document.getElementById('downloadImageA');
    const imgURL = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.id = "downloadImageA";
    a.innerText = "profileImage.png";
    a.href = imgURL;
    a.download = 'profileImage.png';

    if(existingA)
    {
        existingA.replaceWith(a);
    }
    else
    {
        document.getElementById('generateContainer').insertBefore(a, document.getElementById('generateButton'));
    }
}
