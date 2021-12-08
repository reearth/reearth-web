[{
    "schemaGroup": "buttons",
    "title": "Buttons",
    "schemaFields": [
        {
            "id": "buttonInvisible",
            "type": "bool",
            "defaultValue": null,
            "name": "Hide",
            "description": "",
            "isLinkable": true
        },
        {
            "id": "buttonTitle",
            "type": "string",
            "defaultValue": null,
            "name": "Title",
            "description": "",
            "isLinkable": true
        },
        {
            "id": "buttonPosition",
            "type": "string",
            "defaultValue": "topleft",
            "name": "Position",
            "description": "",
            "choices": [
                { "key": "topleft", "label": "Top-Left" },
                { "key": "topright", "label": "Top-Right" },
                { "key": "bottomleft", "label": "Bottom-Left" },
                { "key": "bottomright", "label": "Bottom-Right" }
            ],
            "isLinkable": true
        }, {
            "id": "buttonStyle",
            "type": "string",
            "defaultValue": "text",
            "name": "Style",
            "description": "",
            "choices": [
                { "key": "text", "label": "Text only" },
                { "key": "icon", "label": "Icon only" },
                { "key": "texticon", "label": "Text and icon" }
            ],
            "isLinkable": true
        },
        {
            "id": "buttonIcon",
            "type": "url",
            "defaultValue": null,
            "name": "Icon",
            "description": "",
            "ui": "image", "isLinkable": true
        },
        {
            "id": "buttonColor",
            "type": "string",
            "defaultValue": null,
            "name": "Text color",
            "description": "",
            "ui": "color",
            "isLinkable": true
        },
        {
            "id": "buttonBgcolor",
            "type": "string",
            "defaultValue": null,
            "name": "Background color",
            "description": "",
            "ui": "color",
            "isLinkable": true
        }], "items": []
}]