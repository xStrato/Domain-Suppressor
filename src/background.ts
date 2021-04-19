const MY_PROCESS_NAME = "my-custom-tag";

const YOU_CUSTOM_TAG = `[name='${MY_PROCESS_NAME}']`
const INJECT_CODE = `document.querySelector("${YOU_CUSTOM_TAG}")?.name`;
const BLOCK_URLS = ["https://www.google.com/", "https://github.com/"];

chrome.cookies.set({
    name: "suppress_execution", 
    url:BLOCK_URLS[0],
    value: "inactive"
})

chrome.tabs.onActivated.addListener(tab => 
{
    try 
    {
        BLOCK_URLS.forEach(url => {
            chrome.cookies.get({
                name: "suppress_execution",
                url
            }, (data) => suppressOnActivated(tab.tabId, data?.value))
        });
    } 
    catch (error)
    {
        console.log(error);
    }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => 
{
    try 
    {
        BLOCK_URLS.forEach(url => {
            chrome.cookies.get({
                name: "suppress_execution",
                url
            }, (data) => suppressOnUpdated(tab, data?.value))
        });
    }
    catch (error) 
    {
        console.log(error);
    }
});

function suppressOnUpdated(tab:chrome.tabs.Tab, executionStatus?:string): void
{
    console.log(tab, executionStatus);
    if (executionStatus==="active")
    {
        chrome.tabs.executeScript(tab.id!, { code: INJECT_CODE }, (executionResult) => 
        {
            BLOCK_URLS.forEach(url => {
                if (!executionResult?.includes(MY_PROCESS_NAME) && tab.url?.includes(url))
                {
                    chrome.tabs.remove(tab.id!);
                }
            });
        });
    }
}

function suppressOnActivated(tabId:number, executionStatus?:string): void
{
    if (executionStatus==="active")
    {
        chrome.tabs.executeScript(tabId, { code: INJECT_CODE }, (executionResult) => 
        {
            chrome.tabs.get(tabId, tabInfo => 
            {
                BLOCK_URLS.forEach(url => {
                    if (!executionResult?.includes(MY_PROCESS_NAME) && tabInfo.url?.includes(url))
                    {
                        setTimeout(() => chrome.tabs.remove(tabId), 500);
                    } 
                });
            });
        });
    }
}