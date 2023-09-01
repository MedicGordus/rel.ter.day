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
                            const clickedButtonParentNode = event.target.parentNode;  
                            clipboardItem.getType(type).then(blob => {
                                const reader = new FileReader();
                                reader.onload = function(event) {
                                    const img = new Image();
                                    img.src = event.target.result;  // This is the base64 encoded image data
                                    img.onload = function() {
                                        loadImagePreviewAndUpdateBackground(img, clickedButtonParentNode);
                                    };
                                };
                                reader.readAsDataURL(blob);  // Convert blob to base64 encoded string
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

        if (event.target && event.target.classList.contains('toggle-adjustments-btn')) {
            const accountContainer = event.target.closest('.account-container');
            const adjustmentsDiv = accountContainer.querySelector('.adjustments-div');
            if (adjustmentsDiv.style.display === 'none' || adjustmentsDiv.style.display === '') {
                event.target.textContent = 'Hide Adjustments';
                adjustmentsDiv.style.display = 'block';
            } else {
                event.target.textContent = 'Edit Adjustments';
                adjustmentsDiv.style.display = 'none';
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

    function loadImagePreviewAndUpdateBackground(img, parentNode)
    {
        const container = parentNode;
        container.style.backgroundImage = `url(${img.src})`;
        container.style.backgroundBlendMode = 'multiply';
        container.style.backgroundColor = 'rgba(68, 68, 68, 1)';

        // Get the preview element
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

        const labelHandle = document.createElement('label');
        labelHandle.textContent = 'Handle:';
        const handleInput = document.createElement('input');
        handleInput.type = 'text';
        handleInput.className = 'profile-handle';
        handleInput.placeholder = '(optional) @handle';
        labelHandle.appendChild(handleInput);

        const labelShape = document.createElement('label');
        labelShape.textContent = " Shape:"

        const shapeSelect = document.createElement('select');
        shapeSelect.className = 'shape-selector';
        shapeSelect.innerHTML = `
                <option value="circle">Normal (circle)</option>
                <option value="hex">NFT (hex)</option>
                <option value="square">Org (square)</option>
            `;
        labelShape.appendChild(shapeSelect);

        const toggleAdjustmentsButton = document.createElement('button');
        toggleAdjustmentsButton.className = 'toggle-adjustments-btn btn';
        toggleAdjustmentsButton.textContent = 'Edit Adjustments';
    
        const adjustmentsDiv = document.createElement('div');
        adjustmentsDiv.className = 'adjustments-div';
        adjustmentsDiv.style.display = 'none';
    
        const adjustmentsContent = `
            <label>Scale:</label><input class="profile-scale" type="range" min="0.1" max="2" step="0.01" value="1" />
            <input class="profile-scale-numeric" type="number" min="0.1" max="2" step="0.01" value="1" /><br />
            <label>X position:</label><input class="profile-x-numeric" type="number" value="0" /><br />
            <label>Y position:</label><input class="profile-y-numeric" type="number" value="0" />
        `;
        adjustmentsDiv.innerHTML = adjustmentsContent;

        const addButton = document.createElement('button');
        addButton.className = 'add-account-btn';
        addButton.textContent = 'Add Account';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-account-btn';
        deleteButton.innerText = 'Delete';

        newAccountDiv.appendChild(imagePreview);
        newAccountDiv.appendChild(pasteButton);
        newAccountDiv.appendChild(imageInput);
        newAccountDiv.appendChild(labelHandle);
        newAccountDiv.appendChild(labelShape);
        newAccountDiv.appendChild(document.createElement('br'));
        newAccountDiv.appendChild(toggleAdjustmentsButton);
        newAccountDiv.appendChild(adjustmentsDiv);
        newAccountDiv.appendChild(addButton);
        newAccountDiv.appendChild(deleteButton);

        // select the last add account button (which is the one in our div)
        var nodes = parentElement.querySelectorAll('.add-account-btn');

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
                        loadImagePreviewAndUpdateBackground(img, event.target.parentNode);
                    };
                    img.src = reader.result;
                }
                reader.readAsDataURL(file);
            }
        }
    });

    document.querySelector('#loadConfigInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            config = JSON.parse(event.target.result);

            // load general config
            const backgroundColor = document.getElementById('backgroundColor')
            if(backgroundColor)
            {
                backgroundColor.value = config.backgroundColor;
            }
            const canvasWidth = document.getElementById('canvasWidth')
            if(backgroundColor)
            {
                canvasWidth.value = config.canvasWidth;
            }
            const canvasHeight = document.getElementById('canvasHeight')
            if(canvasHeight)
            {
                canvasHeight.value = config.canvasHeight;
            }
            const lineColor = document.getElementById('lineColor')
            if(lineColor)
            {
                lineColor.value = config.lineColor;
            }
            const lineWidth = document.getElementById('lineWidth')
            if(lineWidth)
            {
                lineWidth.value = config.lineWidth;
            }
            const lineType = document.getElementById('lineType')
            if(lineType)
            {
                lineType.value = config.lineType;
            }
            const touchMode = document.getElementById('touchMode')
            if(lineType)
            {
                touchMode.checked = config.touchMode;
            }
            
            // load accounts
            const mainAccount = document.getElementById('mainAccount');
            restoreAccount(
                config.mainAccount,
                mainAccount
            );
        }

        reader.readAsText(file);
    });

    function restoreAccount(accountConfig, accountContainer) {

        // Set the image for the account
        const imageElem = new Image();
        imageElem.onload = function() {
            loadImagePreviewAndUpdateBackground(imageElem, accountContainer);
        };
        imageElem.src = accountConfig.imageData;

        // Set the shape selector value
        const shapeSelector = accountContainer.querySelector('.shape-selector');
        if (shapeSelector) {
            shapeSelector.value = accountConfig.shape;
        }

        // handle value
        const profileHandle = accountContainer.querySelector('.profile-handle');
        if(profileHandle)
        {
            profileHandle.value = accountConfig.handle;
        }

        // Set the scale values
        const profileScale = accountContainer.querySelector('.profile-scale');
        const profileScaleNumeric = accountContainer.querySelector('.profile-scale-numeric');
        if (profileScale && profileScaleNumeric) {
            profileScale.value = accountConfig.scale;
            profileScaleNumeric.value = accountConfig.scale;
        }

        // x/y position shift values
        const profileXNumeric = accountContainer.querySelector('.profile-x-numeric');
        if(profileXNumeric)
        {
            profileXNumeric.value = accountConfig.xshift;
        }
        const profileYNumeric = accountContainer.querySelector('.profile-y-numeric');
        if(profileYNumeric)
        {
            profileYNumeric.value = accountConfig.xshift;
        }

        // If there are nested accounts, restore them recursively
        if (accountConfig.accounts) {
            Object.values(accountConfig.accounts).forEach(subAccountConfig => {
                restoreNewAccount(subAccountConfig, accountContainer);
            });
        }
    }

    function restoreNewAccount(accountConfig, parentElement) {
        // "Click" the 'Add Account' button to create a new account entry
        const addAccountButton = parentElement.querySelector('.add-account-btn');
        if (addAccountButton) {
            addAccountButton.click();
        }

        // Get the newly added account container
        const newAccountContainer = addAccountButton.previousSibling;
        restoreAccount(accountConfig, newAccountContainer);
    }
    const CANVAS_WIDTH = 3840;  // 4k width
    const CANVAS_HEIGHT = 2160; // 4k height
    const BASE_SIZE = 250;      // Base size for the main profile image

    document.getElementById('canvasWidth').value = CANVAS_WIDTH;
    document.getElementById('canvasHeight').value = CANVAS_HEIGHT;
    document.getElementById('profileSize').value = BASE_SIZE;
});

function generateImage() {
    let canvas = document.getElementById('outputCanvas');
    if(canvas)
    {
        canvas = document.createElement('canvas');
        document.getElementById('outputCanvas').replaceWith(canvas);
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
    if(existingA)
    {
        existingA.remove();
    }
    const imgURL = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.id = "downloadImageA";
    a.innerText = "profileImage.png";
    a.href = imgURL;
    a.download = 'profileImage.png';
    document.getElementById('generateContainer').insertBefore(a, document.getElementById('generateButton'));

    canvas.width = parseInt(document.getElementById('canvasWidth').value);
    canvas.height = parseInt(document.getElementById('canvasHeight').value);

    // helper for the twitter NFT shape
    function transformPath(pathStr, scale, offsetX, offsetY) {
        const commands = pathStr.split(/(?=[MLC])/);
    
        const transformedCommands = commands.map(command => {
            const type = command.charAt(0);
            const values = command.slice(1).trim().split(/\s+|,/).map(Number);
    
            switch(type) {
                case 'M':
                case 'L':
                    const [x, y] = values;
                    const newX = x * scale + offsetX;
                    const newY = y * scale + offsetY;
                    return `${type} ${newX} ${newY}`;
    
                case 'C':
                    const [x1, y1, x2, y2, x3, y3] = values;
                    const newX1 = x1 * scale + offsetX;
                    const newY1 = y1 * scale + offsetY;
                    const newX2 = x2 * scale + offsetX;
                    const newY2 = y2 * scale + offsetY;
                    const newX3 = x3 * scale + offsetX;
                    const newY3 = y3 * scale + offsetY;
                    return `${type} ${newX1} ${newY1}, ${newX2} ${newY2}, ${newX3} ${newY3}`;
    
                default:
                    // For other commands, just return them unmodified
                    // (this example only handles M, L, and C for now)
                    return command;
            }
        });
    
        return transformedCommands.join(' ');
    }

    // Helper function to crop images based on shape
    function drawCroppedImage(img, x, y, size, shape, scale) {
        const adjustedSize = size * scale;

        switch (shape) {
            case 'circle':
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, adjustedSize / 2, 0, 2 * Math.PI, false);
                ctx.clip();
                ctx.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
                ctx.restore();
                break;
            case 'square':
                // Calculate corner clipping ratio
                const clipRatio = 12 / 200; // the current org clip is 12px/200px
                const cornerClipSize = adjustedSize * clipRatio;

                ctx.save();

                // Begin path for clipping
                ctx.beginPath();
                // Starting top-left and going clockwise
                ctx.moveTo(x - adjustedSize / 2 + cornerClipSize, y - adjustedSize / 2); 
                ctx.arcTo(x + adjustedSize / 2, y - adjustedSize / 2, x + adjustedSize / 2, y + adjustedSize / 2, cornerClipSize);
                ctx.arcTo(x + adjustedSize / 2, y + adjustedSize / 2, x - adjustedSize / 2, y + adjustedSize / 2, cornerClipSize);
                ctx.arcTo(x - adjustedSize / 2, y + adjustedSize / 2, x - adjustedSize / 2, y - adjustedSize / 2, cornerClipSize);
                ctx.arcTo(x - adjustedSize / 2, y - adjustedSize / 2, x + adjustedSize / 2, y - adjustedSize / 2, cornerClipSize);
                ctx.closePath();
                
                // Clip the drawing region
                ctx.clip();

                // Draw the image
                ctx.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);

                ctx.restore();
                break;
            case 'hex':
                // this svg is 200 wide and 188 high.
                //  if 𝕏 changes the clip region for NFT, this block of code needs to be updated to reflect such changes
                //
                const clipPathString = 'M193.248 69.51C185.95 54.1634 177.44 39.4234 167.798 25.43L164.688 20.96C160.859 15.4049 155.841 10.7724 149.998 7.3994C144.155 4.02636 137.633 1.99743 130.908 1.46004L125.448 1.02004C108.508 -0.340012 91.4873 -0.340012 74.5479 1.02004L69.0879 1.46004C62.3625 1.99743 55.8413 4.02636 49.9981 7.3994C44.155 10.7724 39.1367 15.4049 35.3079 20.96L32.1979 25.47C22.5561 39.4634 14.0458 54.2034 6.74789 69.55L4.39789 74.49C1.50233 80.5829 0 87.2441 0 93.99C0 100.736 1.50233 107.397 4.39789 113.49L6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37L195.598 113.43C198.493 107.337 199.996 100.676 199.996 93.93C199.996 87.1841 198.493 80.5229 195.598 74.43L193.248 69.51Z';
                const scaledPath = new Path2D(
                    transformPath(
                        clipPathString,
                        adjustedSize / 200,
                        x - (adjustedSize / 2),
                        (y - (adjustedSize / 2)) + ((adjustedSize - (188 * (adjustedSize/200)))/2) // this shifts the hexagon down (centers it) since the hex is shorter than it is wide
                    )
                );
                ctx.save();
                ctx.clip(scaledPath);
                ctx.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
                ctx.restore();

                break;

            // Additional cases for other shapes can be added
            default:
                ctx.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
        }
    }

    // Recursive function to draw the profile pictures and connections
    function drawAccount(accountConfig, x, y, depth) {
        const imageElem = new Image();
        imageElem.onload = function() {
            const baseProfileSize = parseInt(document.getElementById('profileSize').value);
            const currentSize = baseProfileSize / (depth + 1);

            // store the rendersize so the canvas can be edited
            accountConfig.renderSize = currentSize;
            accountConfig.renderCenterX = x;
            accountConfig.renderCenterY = y;

            x = parseFloat(x) + parseFloat(accountConfig.xshift ?? 0);
            y = parseFloat(y) + parseFloat(accountConfig.yshift ?? 0);

            drawCroppedImage(imageElem, x, y, currentSize, accountConfig.shape, accountConfig.scale);

            if (accountConfig.accounts) {
                const numSubAccounts = Object.keys(accountConfig.accounts).length;
                const angleBetween = 360 / numSubAccounts;

                let currentAngle = 0;

                for (const subAccountConfig of Object.values(accountConfig.accounts)) {
                    const childX = x + (currentSize * 1.5) * Math.cos(currentAngle * (Math.PI / 180));
                    const childY = y + (currentSize * 1.5) * Math.sin(currentAngle * (Math.PI / 180));

                    // Draw a line connection
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(childX, childY);
                    ctx.stroke();

                    // Draw the sub-account
                    drawAccount(subAccountConfig, childX, childY, depth + 1);

                    currentAngle += angleBetween;
                }
            }
        };
        imageElem.src = accountConfig.imageData;
    }

    // Start with the main account centered
    canvasData = collectConfig();

    //// collect canvas edit data
    //
    //collect the flattened account data
    function flattenAccounts(accountObj) {
        const flattened = [];
        
        function flatten(account) {
          flattened.push(account);
          
          for (const subAccount of account.accounts) {
            flatten(subAccount);
          }
        }
        
        for (const account of accountObj.accounts) {
          flatten(account);
        }
        
        return flattened;
    }
    canvasData.profilesData = [ canvasData.mainAccount, ...flattenAccounts(canvasData.mainAccount)];
    //
    canvasData.isDragging = false;
    canvasData.draggedProfile = null;
    //
    canvasData.isRedrawing = false;
    canvasData.needsRedraw = false;
    //
    ////

    redrawCanvas();

    function redrawCanvas()
    {
        // If already redrawing, set the flag to indicate another redraw is required
        if (canvasData.isRedrawing) {
            canvasData.needsRedraw = true;
            return;
        }

        canvasData.isRedrawing = true;

        // fill rect
        ctx.fillStyle = canvasData.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawAccount(
            canvasData.mainAccount,
            canvasData.canvasWidth / 2,
            canvasData.canvasHeight / 2,
            0
        );

        // Finished redrawing
        canvasData.isRedrawing = false;
        
        // Check if a redraw was requested while this one was in progress
        if (canvasData.needsRedraw) {
            canvasData.needsRedraw = false; // Reset the flag
            redrawCanvas();      // Start another redraw
        }
    }


    //// handlers for editing ON the canvas
    //
    function profileClicked(x, y) {
        let profilesClicked = [];

        // Loop through your profiles data to determine if a click was within a profile's area.
        for (let profile of canvasData.profilesData) {
            const distance = Math.sqrt(Math.pow(x - profile.renderCenterX, 2) + Math.pow(y - profile.renderCenterY, 2));
            if (distance <= profile.renderSize / 2) {
                profilesClicked.push(profile);
            }
        }
        if(profilesClicked.length == 1)
        {
            return profilesClicked[0];
        }
        else if(profilesClicked.length > 1)
        {
            // choose the smallest one
            let smallestProfile = profilesClicked[0];
            for (let delta = 0; delta < profilesClicked.length; delta++) {
                if(profilesClicked[delta].renderSize < smallestProfile.renderSize)
                {
                    smallestProfile = profilesClicked[delta];
                }
            }

            return smallestProfile;
        }
        
        return null;
    }
    //
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        const clickedProfile = profileClicked(x, y);
        if (clickedProfile) {
            console.log('click detected: '+clickedProfile.shape)
        }
    });
    //
    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        canvasData.draggedProfile = profileClicked(x, y);
        if (canvasData.draggedProfile) {
            canvasData.isDragging = true;
        }
    });
    //
    canvas.addEventListener('mousemove', function(e) {
        if (!canvasData.isDragging || !canvasData.draggedProfile) return;
    
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        canvasData.draggedProfile.xshift = x - canvasData.draggedProfile.renderCenterX;
        canvasData.draggedProfile.yshift = y - canvasData.draggedProfile.renderCenterY;
    
        // Redraw the canvas with the updated profile positions
        redrawCanvas();
    });
    //
    canvas.addEventListener('mouseup', function(e) {
        canvasData.isDragging = false;
        canvasData.draggedProfile = null;
    });
    //
    ////
}

function collectAccountData(container) {
    const config = {};

    const imagePreviewElem = container.querySelector('.account-image-preview img');
    config.imageData = imagePreviewElem ? imagePreviewElem.src : container.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    
    config.shape = container.querySelector('.shape-selector').value;
    config.handle = container.querySelector('.profile-handle').value;
    config.scale = container.querySelector('.profile-scale').value;
    config.xshift = container.querySelector('.profile-x-numeric').value;
    config.yshift = container.querySelector('.profile-y-numeric').value;

    // Recursive part: check for nested account containers and collect their data too
    const nestedAccounts = Array.from(container.querySelectorAll(':scope > .account-container'));
    config.accounts = nestedAccounts.map(collectAccountData);

    return config;
}

function collectConfig()
{
    let config = {};

    // account infos
    config.mainAccount = collectAccountData(document.getElementById('mainAccount'));

    // general config
    config.backgroundColor = document.getElementById('backgroundColor').value;
    config.canvasWidth = document.getElementById('canvasWidth').value;
    config.canvasHeight = document.getElementById('canvasHeight').value;
    config.lineColor = document.getElementById('lineColor').value;
    config.lineWidth = document.getElementById('lineWidth').value;
    config.lineType = document.getElementById('lineType').value;
    config.touchMode = document.getElementById('touchMode').checked;

    return config;
}

function saveConfiguration() {

    let existingA = document.getElementById('downloadConfigA');
    
    const rootAccountConfig = collectConfig();

    const blob = new Blob([JSON.stringify(rootAccountConfig, null, 2)], { type: 'application/json' });

    const a = document.createElement('a');
    a.id = "downloadConfigA";
    a.innerText = "config.json";
    a.href = URL.createObjectURL(blob);
    a.download = 'config.json';

    if(existingA)
    {
        existingA.replaceWith(a);
    }
    else
    {
        document.getElementById('backupContainer').insertBefore(a, document.getElementById('saveConfigurationBtn'));
    }
}

let canvasData = {};