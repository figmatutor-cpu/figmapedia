"use strict";
figma.showUI(__html__, { width: 400, height: 600, themeColors: false });
figma.ui.onmessage = (msg) => {
    if (msg.type === "open-link" && msg.url) {
        figma.openExternal(msg.url);
    }
};
