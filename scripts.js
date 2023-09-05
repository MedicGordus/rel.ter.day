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

    const CANVAS_WIDTH = 3840;  // 4k width
    const CANVAS_HEIGHT = 2160; // 4k height
    const BASE_SIZE = 250;      // Base size for the main profile image

    document.getElementById('canvasWidth').value = CANVAS_WIDTH;
    document.getElementById('canvasHeight').value = CANVAS_HEIGHT;
    document.getElementById('profileSize').value = BASE_SIZE;
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

function restoreNewAccount(accountConfig, parentElement) {
    // "Click" the 'Add Account' button to create a new account entry
    const addAccountButton = parentElement.querySelector(':scope > .add-account-btn');
    addAccountButton.click();

    // Get the newly added account container
    const newAccountContainer = addAccountButton.previousSibling;
    restoreAccount(accountConfig, newAccountContainer);
}

function restoreAccount(accountConfig, accountContainer, restoreNestedAccounts = true) {

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
        profileYNumeric.value = accountConfig.yshift;
    }

    if(restoreNestedAccounts)
    {
        // If there are nested accounts, restore them recursively
        if (accountConfig.accounts) {
            Object.values(accountConfig.accounts).forEach(subAccountConfig => {
                restoreNewAccount(subAccountConfig, accountContainer);
            });
        }
    }
}

function addNewAccount(parentElement) {
    // Get the count of account containers within the parent element
    const accountCount = parentElement.querySelectorAll('.account-container').length;

    //// guarantee that no box has the same id as another
    //
    let newId = parentElement.id + '-' + accountCount;
    let duplicates = parentElement.querySelectorAll('#' + newId).length;
    while(duplicates > 0)
    {
        accountCount++;
        newId = parentElement.id + '-' + accountCount;
        duplicates = parentElement.querySelectorAll('#' + newId).length;
    }
    //
    ////

    const newAccountDiv = document.createElement('div');
    newAccountDiv.className = 'account-container';
    newAccountDiv.id = newId;

    const imagePreview = document.createElement('div');
    imagePreview.className = 'account-image-preview';
    imagePreview.id = newId + 'Preview';

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

function popupAccount(parentElement) {
    const popupAccountDiv = document.createElement('div');
    popupAccountDiv.className = 'account-container';
    popupAccountDiv.id = parentElement.id + '-popup';

    const imagePreview = document.createElement('div');
    imagePreview.className = 'account-image-preview';
    imagePreview.id = parentElement.id + '-popupPreview';

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

    const adjustmentsDiv = document.createElement('div');
    adjustmentsDiv.className = 'adjustments-div';

    const adjustmentsContent = `
        <label>Scale:</label><input class="profile-scale" type="range" min="0.1" max="2" step="0.01" value="1" />
        <input class="profile-scale-numeric" type="number" min="0.1" max="2" step="0.01" value="1" /><br />
        <label>X position:</label><input class="profile-x-numeric" type="number" value="0" /><br />
        <label>Y position:</label><input class="profile-y-numeric" type="number" value="0" />
    `;
    adjustmentsDiv.innerHTML = adjustmentsContent;

    const saveButton = document.createElement('button');
    saveButton.className = 'save-popup-btn';
    saveButton.innerText = 'Save';

    const revertButton = document.createElement('button');
    revertButton.className = 'revert-popup-btn';
    revertButton.innerText = 'Revert';

    popupAccountDiv.appendChild(imagePreview);
    popupAccountDiv.appendChild(pasteButton);
    popupAccountDiv.appendChild(imageInput);
    popupAccountDiv.appendChild(labelHandle);
    popupAccountDiv.appendChild(labelShape);
    popupAccountDiv.appendChild(document.createElement('br'));
    popupAccountDiv.appendChild(adjustmentsDiv);
    popupAccountDiv.appendChild(saveButton);
    popupAccountDiv.appendChild(revertButton);

    // add new right above the button
    parentElement.insertBefore(popupAccountDiv, null);
}

// Create an off-screen canvas that is used to make the main canvas not appear to be flashy
const bufferCanvas = document.createElement('canvas');
bufferCanvas.width = 0;
bufferCanvas.height = 0;
bufferCanvas.id = 'bufferCanvas';
const bufferCanvasCtx = bufferCanvas.getContext('2d');

function generateImage() {
    let visibleCanvas = document.getElementById('outputCanvas');
    if(visibleCanvas)
    {
        visibleCanvas = document.createElement('canvas');
        document.getElementById('outputCanvas').replaceWith(visibleCanvas);
    }
    else
    {
        visibleCanvas = document.createElement('canvas');
    }
    visibleCanvas.id = 'outputCanvas';
    const visibleCanvasCtx = visibleCanvas.getContext('2d');

    document.getElementById('generateContainer').insertBefore(visibleCanvas,document.getElementById('generateButton'));
    
    let existingA = document.getElementById('downloadImageA');
    if(existingA)
    {
        existingA.remove();
    }
    const imgURL = visibleCanvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.id = "downloadImageA";
    a.innerText = "profileImage.png";
    a.href = imgURL;
    a.download = 'profileImage.png';
    document.getElementById('generateContainer').insertBefore(a, document.getElementById('generateButton'));


    // Start with the main account centered
    canvasData = collectConfig();

    // configure size of canvas based on user config
    visibleCanvas.width = canvasData.canvasWidth;
    visibleCanvas.height = canvasData.canvasHeight;
    bufferCanvas.width = canvasData.canvasWidth;
    bufferCanvas.height = canvasData.canvasHeight;

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
    function drawCroppedImage(img, x, y, size, shape, scale, ctxReference) {
        const adjustedSize = size * scale;

        switch (shape) {
            case 'circle':
                ctxReference.save();
                ctxReference.beginPath();
                ctxReference.arc(x, y, adjustedSize / 2, 0, 2 * Math.PI, false);
                ctxReference.clip();
                ctxReference.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
                ctxReference.restore();
                break;
            case 'square':
                // Calculate corner clipping ratio
                const clipRatio = 12 / 200; // the current org clip is 12px/200px
                const cornerClipSize = adjustedSize * clipRatio;

                ctxReference.save();

                // Begin path for clipping
                ctxReference.beginPath();
                // Starting top-left and going clockwise
                ctxReference.moveTo(x - adjustedSize / 2 + cornerClipSize, y - adjustedSize / 2); 
                ctxReference.arcTo(x + adjustedSize / 2, y - adjustedSize / 2, x + adjustedSize / 2, y + adjustedSize / 2, cornerClipSize);
                ctxReference.arcTo(x + adjustedSize / 2, y + adjustedSize / 2, x - adjustedSize / 2, y + adjustedSize / 2, cornerClipSize);
                ctxReference.arcTo(x - adjustedSize / 2, y + adjustedSize / 2, x - adjustedSize / 2, y - adjustedSize / 2, cornerClipSize);
                ctxReference.arcTo(x - adjustedSize / 2, y - adjustedSize / 2, x + adjustedSize / 2, y - adjustedSize / 2, cornerClipSize);
                ctxReference.closePath();
                
                // Clip the drawing region
                ctxReference.clip();

                // Draw the image
                ctxReference.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);

                ctxReference.restore();
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
                ctxReference.save();
                ctxReference.clip(scaledPath);
                ctxReference.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
                ctxReference.restore();

                break;

            // Additional cases for other shapes can be added
            default:
                ctxReference.drawImage(img, x - adjustedSize / 2, y - adjustedSize / 2, adjustedSize, adjustedSize);
        }
    }

    // Recursive function to draw the profile pictures and connections
    function drawAccount(accountConfig, x, y, depth, ctxReference, data) {
        return new Promise((resolve, reject) => {
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
    
                if (accountConfig.accounts) {
                    const numSubAccounts = Object.keys(accountConfig.accounts).length;
                    const angleBetween = 360 / numSubAccounts;
    
                    let currentAngle = 0;
    
                    // store the promises
                    const subAccountPromises = [];

                    for (const subAccountConfig of Object.values(accountConfig.accounts)) {
                        const childX = x + (currentSize * 1.5) * Math.cos(currentAngle * (Math.PI / 180));
                        const childY = y + (currentSize * 1.5) * Math.sin(currentAngle * (Math.PI / 180));
    
                        // Draw a line connection
                        ctxReference.strokeStyle = data.lineColor;
                        ctxReference.lineWidth = data.lineWidth;
                        switch(data.lineType)
                        {
                            case "dashed":
                                // For a dashed line
                                ctxReference.setLineDash([5, 10]); // 5 pixels of line, followed by 10 pixels of space
                                break;

                            case "dotted":
                                // For a dotted line
                                ctxReference.setLineDash([1, 5]); // 1 pixel of line, followed by 5 pixels of space
                                break;

                            default:
                                // For a solid line
                                ctxReference.setLineDash([]);
                                break;

                                // For a dash-dot pattern (unused)
                                // ctxReference.setLineDash([10, 5, 1, 5]); // 10 pixels of line, 5 pixels of space, 1 pixel of line, 5 pixels of space
                        }
                        ctxReference.beginPath();
                        ctxReference.moveTo(x, y);
                        ctxReference.lineTo(childX + subAccountConfig.xshift, childY + subAccountConfig.yshift);
                        ctxReference.stroke();
    
                        // Draw the sub-account
                        subAccountPromises.push(
                            drawAccount(
                                subAccountConfig,
                                childX,
                                childY,
                                depth + 1,
                                ctxReference,
                                data
                            )
                        );

                        currentAngle += angleBetween;
                    }
    
                    // draw the profile picture
                    drawCroppedImage(imageElem, x, y, currentSize, accountConfig.shape, accountConfig.scale, ctxReference);

                    // Wait for all subAccounts to finish drawing
                    Promise.all(subAccountPromises)
                        .then(() =>{
                            resolve();
                        }).catch(err => reject(err));
                }
                else
                {
                    resolve();
                }
            };
    
            imageElem.onerror = function() {
                console.error('Error loading image');
                reject(new Error('Image loading failed'));
            };
    
            imageElem.src = accountConfig.imageData;
        })
    }

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
    renderStatus.redrawInProgress = false;
    renderStatus.pendingRedraw = false;
    //
    ////

    // perform frame render
    redrawCanvas(canvasData);

    function redrawCanvas(data)
    {
        if (renderStatus.redrawInProgress) {
            if (!renderStatus.pendingRedraw) {
                renderStatus.pendingRedraw = new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        redrawCanvas(data);
                        resolve();
                    });
                }).then(() => {
                    renderStatus.pendingRedraw = null;
                });
            }
            return;
        }
    
        renderStatus.redrawInProgress = true;

        // Clear the off-screen canvas
        bufferCanvasCtx.clearRect(0, 0, data.canvasWidth, data.canvasHeight);

        // Now fill rect with background color on off-screen canvas
        bufferCanvasCtx.fillStyle = data.backgroundColor;
        bufferCanvasCtx.fillRect(0, 0, data.canvasWidth, data.canvasHeight);

        drawAccount(
            data.mainAccount,
            data.canvasWidth / 2,
            data.canvasHeight / 2,
            0,
            bufferCanvasCtx,
            data
        ).then(() => {
            // Copy the off-screen buffer canvas to the visible canvas
            visibleCanvasCtx.clearRect(0, 0, data.canvasWidth, data.canvasHeight);
            visibleCanvasCtx.drawImage(bufferCanvas, 0, 0);

            renderStatus.redrawInProgress = false;
        });
    }


    //// handlers for editing ON the canvas
    //
    function profileClicked(x, y) {
        let profilesClicked = [];

        // Loop through your profiles data to determine if a click was within a profile's area.
        for (let profile of canvasData.profilesData) {
            const distance = Math.sqrt(Math.pow(x - (profile.renderCenterX + profile.xshift), 2) + Math.pow(y - (profile.renderCenterY + profile.yshift), 2));
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
    visibleCanvas.addEventListener('mousedown', function(e) {
        if(document.getElementById('touchMode').checked)
        {
            return;
        }
        const rect = visibleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        canvasData.draggedProfile = profileClicked(x, y);
        if (canvasData.draggedProfile) {

            // turn the flag on that we are dragging a profile
            canvasData.isDragging = true;

            // reset the drag flag so the mouse up knows to handle a drag or a click
            canvasData.didDrag = false;
        }
    });
    //
    visibleCanvas.addEventListener('mousemove', function(e) {
        if (!canvasData.isDragging || !canvasData.draggedProfile) return;
    
        // let the mouseup know that a drag occurred
        canvasData.didDrag = true;

        const rect = visibleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        canvasData.draggedProfile.xshift = x - canvasData.draggedProfile.renderCenterX;
        canvasData.draggedProfile.yshift = y - canvasData.draggedProfile.renderCenterY;

        document.getElementById(canvasData.draggedProfile.containerId).querySelector('.profile-x-numeric').value = canvasData.draggedProfile.xshift;
        document.getElementById(canvasData.draggedProfile.containerId).querySelector('.profile-y-numeric').value = canvasData.draggedProfile.yshift;
    
        // Redraw the canvas with the updated profile positions
        redrawCanvas(canvasData);
    });
    //
    visibleCanvas.addEventListener('mouseup', function(e) {
        canvasData.isDragging = false;
        canvasData.draggedProfile = null;

        // if it was a click and not a drag then handle profile clicked
        if(!canvasData.didDrag)
        {
            const rect = visibleCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
        
            const clickedProfile = profileClicked(x, y);
            if (clickedProfile) {
                let floatingDiv = document.getElementById('canvasAccountContainer');
                if(floatingDiv)
                {
                    const newFloatingDiv = document.createElement('div');
                    document.body.replaceChild(newFloatingDiv, floatingDiv);
                    floatingDiv = newFloatingDiv;
                }
                else
                {
                    floatingDiv = document.createElement('div');;
                }
                floatingDiv.id = 'canvasAccountContainer';
                floatingDiv.className = 'canvas-account-container';
                floatingDiv.style.left = (rect.left + window.scrollX + parseFloat(clickedProfile.renderCenterX) + parseFloat(clickedProfile.xshift) + (0.5* parseFloat(clickedProfile.renderSize)) + 20) + 'px';
                floatingDiv.style.top = (rect.top + window.scrollY + parseFloat(clickedProfile.renderCenterY) + parseFloat(clickedProfile.yshift) + (-0.5 * parseFloat(clickedProfile.renderSize)) + 20) + 'px';
    
                // create the popup
                popupAccount(floatingDiv);
    
                // fill the popup with currently saved data
                restoreAccount(clickedProfile, floatingDiv.childNodes[0], false);
    
                //// add event handlers to the new popup
                //
                // save button
                floatingDiv.querySelector('.save-popup-btn').addEventListener('click', function(e) {
                    updateProfileFromDiv(clickedProfile, floatingDiv);
    
                    restoreAccount(clickedProfile, document.getElementById(clickedProfile.containerId), false);
    
                    floatingDiv.remove();
                    redrawCanvas(canvasData);
                });
                //
                // revert button
                floatingDiv.querySelector('.revert-popup-btn').addEventListener('click', function(e) {
                    floatingDiv.remove();
                    redrawCanvas(canvasData);
                });
                //
                // helper functions
                function findClonedProfile(clonedData, idToFind)
                {
                    for (let profile of clonedData.profilesData) {
                        if(profile.containerId == idToFind)
                        {
                            return profile;
                        }
                    }
    
                    return null;
                }
                function updateProfileFromDiv(profile, div)
                {
                    profile.shape = div.querySelector('.shape-selector').value;
                    profile.handle = div.querySelector('.profile-handle').value;
                    profile.scale = parseFloat(div.querySelector('.profile-scale').value);
                    profile.xshift = parseFloat(div.querySelector('.profile-x-numeric').value);
                    profile.yshift = parseFloat(div.querySelector('.profile-y-numeric').value);
                }
                //
                // shape change handler
                floatingDiv.querySelector('.shape-selector').addEventListener('input', function(e) {
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                //
                // profile handle change handler
                floatingDiv.querySelector('.profile-handle').addEventListener('input', function(e) {
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                //
                // scale change handlers
                floatingDiv.querySelector('.profile-scale').addEventListener('input', function(e) {
                    // update slider
                    floatingDiv.querySelector('.profile-scale-numeric').value = e.target.value;
    
                    // redraw changes
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                floatingDiv.querySelector('.profile-scale-numeric').addEventListener('input', function(e) {
                    // update slider
                    floatingDiv.querySelector('.profile-scale').value = e.target.value;
    
                    // redraw changes
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                //
                // x/y change handler
                floatingDiv.querySelector('.profile-x-numeric').addEventListener('input', function(e) {
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                floatingDiv.querySelector('.profile-y-numeric').addEventListener('input', function(e) {
                    const cloneData = structuredClone(canvasData);
                    let clonedProfile = findClonedProfile(cloneData, clickedProfile.containerId);
                    updateProfileFromDiv(clonedProfile, floatingDiv);
                    redrawCanvas(cloneData);
                });
                //
                ////
    
                document.body.insertBefore(floatingDiv,null);
            }
        }
    });
    //
    ////

}

function collectAccountData(container) {
    const config = {};

    config.containerId = container.id;
    const imagePreviewElem = container.querySelector('.account-image-preview img');
    config.imageData = imagePreviewElem ? imagePreviewElem.src : container.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    
    config.shape = container.querySelector('.shape-selector').value;
    config.handle = container.querySelector('.profile-handle').value;
    config.scale = parseFloat(container.querySelector('.profile-scale').value);
    config.xshift = parseFloat(container.querySelector('.profile-x-numeric').value);
    config.yshift = parseFloat(container.querySelector('.profile-y-numeric').value);

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
        document.getElementById('configContainer').insertBefore(a, document.getElementById('saveConfigurationBtn'));
    }
}

let canvasData = {};

let renderStatus = {};