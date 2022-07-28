const requesting = []

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "pop_up_search_suggestion") {
        chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: request.count
        })
        chrome.action.setPopup({
            popup: "src/pop_up_search_suggestion/pop_up_search_suggestion.html",
            tabId: sender.tab.id
        })
        // chrome.action.openPopup()
    } else if (request.type === "insert_bootstrap_css") {
        chrome.scripting.insertCSS({
            files: ["libs/bootstrap.min.css"],
            target: {
                tabId: sender.tab.id
            }
        })
    } else if (request.type === "remove_bootstrap_css") {
        chrome.scripting.removeCSS({
            files: ["libs/bootstrap.min.css"],
            target: {
                tabId: sender.tab.id
            }
        })
    } else if (request.type === "listen_request") {
        requesting.push({
            name: request.name,
            data: request.data
        })
    } else if (request.type === "pop_up_browse_advise") {
        chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: "!!!"
        })
        chrome.action.setPopup({
            popup: "src/pop_up_browse_advise/pop_up_browse_advise.html",
            tabId: sender.tab.id
        })
    } else if (request.type === "open_tab") {
        chrome.tabs.create({
            url: request.url
        })
    }
})

chrome.webRequest.onBeforeRequest.addListener((details) => {
    for (const requestIndex in requesting) {
        const wrapper = requesting[requestIndex]
        const requests = wrapper.data
        for (const requestIndex in requests) {
            const request = requests[requestIndex]
            for (const urlIndex in request["selector-request"]) {
                const url = request["selector-request"][urlIndex]
                if (new RegExp(url).test(details.url)) {
                    chrome.tabs.sendMessage(details.tabId, {
                        type: "browse_advise_request_checked",
                        name: wrapper.name,
                        data: request
                    })
                    return {cancel: true}
                }
            }
        }
    }
    return {cancel: false};
}, {urls: ["<all_urls>"]})
